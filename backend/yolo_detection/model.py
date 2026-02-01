import os, cv2, shutil, numpy as np, torch, requests, re
from fastapi import UploadFile, File, APIRouter
from fastapi.responses import JSONResponse
from typing import Optional, List
from ultralytics import YOLO
from scipy.spatial.distance import cosine
import torchreid
from collections import deque
import fitz
import docx
import json
import hashlib

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
EVIDENCE_DIR = os.path.join(BASE_DIR, "evidence")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EVIDENCE_DIR, exist_ok=True)

EXTRACTED_FACTS = []  
CASE_GRAPH = {"nodes": [], "edges": []}

def reset_graph():
    """Reset the graph for a new case"""
    global CASE_GRAPH
    CASE_GRAPH = {"nodes": [], "edges": []}

def add_node(id, label, type):
    """Add a node only if it doesn't exist"""
    if not any(n["id"] == id for n in CASE_GRAPH["nodes"]):
        CASE_GRAPH["nodes"].append({"id": id, "label": label, "type": type})

def add_edge(src, dst, label="related_to"):
    """Add an edge with validation"""
    node_ids = [n["id"] for n in CASE_GRAPH["nodes"]]
    if src in node_ids and dst in node_ids:

        edge_exists = any(
            e["from"] == src and e["to"] == dst 
            for e in CASE_GRAPH["edges"]
        )
        if not edge_exists:
            CASE_GRAPH["edges"].append({"from": src, "to": dst, "label": label})

def normalize_id(text, prefix):
    """Create consistent IDs from text"""
    clean = re.sub(r'[^a-zA-Z0-9\s]', '', text.lower())
    clean = '_'.join(clean.split()[:3])
    return f"{prefix}_{clean}"

def extract_text_from_file(path):
    text = ""
    ext = path.lower().split(".")[-1]

    if ext == "pdf":
        try:
            doc = fitz.open(path)
            for page in doc:
                text += page.get_text()
        except:
            pass
    elif ext == "docx":
        try:
            doc = docx.Document(path)
            for p in doc.paragraphs:
                text += p.text + "\n"
        except:
            pass
    else:
        try:
            with open(path, "r", errors="ignore") as f:
                text = f.read()
        except:
            pass

    return text[:3000]

def rule_based_extract(text):
    data = {"persons": [], "locations": [], "events": [], "time_mentions": []}

    name = re.search(r"Complainant Name:\s*(.*)", text, re.IGNORECASE)
    if name:
        data["persons"].append(name.group(1).strip())

    witness = re.search(r"Name:\s*(.*)", text)
    if witness:
        data["persons"].append(witness.group(1).strip())

    place = re.search(r"Place of Occurrence:\s*(.*)", text, re.IGNORECASE)
    if place:
        data["locations"].append(place.group(1).strip())

    crime = re.search(r"Crime Type:\s*(.*)", text, re.IGNORECASE)
    if crime:
        data["events"].append(crime.group(1).strip())

    times = re.findall(r"\d{1,2}:\d{2}\s*hrs?", text)
    data["time_mentions"].extend(times)

    if "chain" in text.lower() and "snatch" in text.lower():
        data["events"].append("Chain Snatching")

    if "theft" in text.lower():
        data["events"].append("Theft")

    return data


def llm_extract(text):
    try:
        
        prompt = f"""
Extract entities from document. Return ONLY valid JSON.
Format: {{ "persons": [], "locations": [], "events": [], "time_mentions": [] }}
Text: {text[:2000]}
"""
        r = requests.post(
            "http://127.0.0.1:1234/v1/chat/completions",
            headers={"Content-Type": "application/json"},
            json={
                "model": "phi-2",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0
            },
            timeout=40
        )
        data = r.json()
        if "choices" not in data: return None
        return json.loads(data["choices"][0]["message"]["content"])
    except:
        return None

def extract_entities_from_text(text):
    data = rule_based_extract(text)
    if data["persons"] or data["locations"] or data["events"]:
        return data
    llm_data = llm_extract(text)
    return llm_data if llm_data else data


FRAME_SKIP = 2
RESIZE_WIDTH = 480
CONF = 0.4
VIOLENCE_IOU = 0.08
VIOLENCE_SPEED = 8
ESCAPE_SPEED = 25
THEFT_IOU = 0.05

yolo = YOLO("yolov8n.pt")
yolo.fuse()

reid = torchreid.models.build_model("osnet_x1_0", num_classes=1000, pretrained=True)
reid.eval()
if torch.cuda.is_available():
    reid = reid.cuda()

def iou(a,b):
    x1=max(a[0],b[0]); y1=max(a[1],b[1])
    x2=min(a[2],b[2]); y2=min(a[3],b[3])
    if x2<=x1 or y2<=y1: return 0
    inter=(x2-x1)*(y2-y1)
    area1=(a[2]-a[0])*(a[3]-a[1])
    area2=(b[2]-b[0])*(b[3]-b[1])
    return inter/(area1+area2-inter)

def format_time(frames,fps):
    return f"{min(frames)/fps:.2f}s - {max(frames)/fps:.2f}s"

class PersonTracker:
    def __init__(self, tid=None): 
        self.id = tid
        self.boxes = deque(maxlen=10)
        self.pos = deque(maxlen=10)
        self.speeds = deque(maxlen=6)

    def update(self,box):
        x1,y1,x2,y2=box
        cx,cy=(x1+x2)/2,(y1+y2)/2
        if self.pos:
            px,py=self.pos[-1]
            self.speeds.append(np.hypot(cx-px,cy-py))
        self.pos.append((cx,cy))
        self.boxes.append(box)

    def avg_speed(self):
        return np.mean(self.speeds) if self.speeds else 0

def extract_feat(img):
    if img is None or img.size==0: return None
    img=cv2.resize(img,(128,256))
    img=cv2.cvtColor(img,cv2.COLOR_BGR2RGB)/255.0
    t=torch.tensor(img).permute(2,0,1).unsqueeze(0).float()
    if torch.cuda.is_available(): t=t.cuda()
    with torch.no_grad(): f=reid(t)
    return f.squeeze().cpu().numpy()

def find_suspect(boxes,ids,frame,sus_feat):
    best=None; best_sim=0.6
    for b,i in zip(boxes,ids):
        x1,y1,x2,y2=map(int,b)
        crop=frame[y1:y2,x1:x2]
        f=extract_feat(crop)
        if f is None: continue
        sim=1-cosine(sus_feat,f)
        if sim>best_sim:
            best_sim=sim; best=i
    return best

def groq_report(event, tw, suspect=None):
  
    return f"{event} observed during {tw}."

def analyze_video_logic(path, sus_feat=None, name="CCTV"):
    reset_graph()  
    cap=cv2.VideoCapture(path)
    fps=cap.get(cv2.CAP_PROP_FPS)

    trackers={}
    suspect_id=None
    frame_idx=0
    violence=[]; theft=[]; chase=[]; evidence=set()

    while True:
        ret,frame=cap.read()
        if not ret: break
        frame_idx+=1
        if frame_idx%FRAME_SKIP: continue

        h,w=frame.shape[:2]
        frame_s=cv2.resize(frame,(RESIZE_WIDTH,int(h*RESIZE_WIDTH/w)))
        res=yolo.track(frame_s,persist=True,conf=CONF,classes=[0])[0]
        if res.boxes.id is None: continue

        boxes=res.boxes.xyxy.cpu().numpy()
        ids=res.boxes.id.cpu().numpy().astype(int)

        if sus_feat is not None and suspect_id is None:
            suspect_id=find_suspect(boxes,ids,frame_s,sus_feat)

        for b,i in zip(boxes,ids):
            if i not in trackers: trackers[i]=PersonTracker(i)
            trackers[i].update(b)

        for i in range(len(ids)):
            for j in range(i+1,len(ids)):
                t1,t2=trackers[ids[i]],trackers[ids[j]]
                ov=iou(t1.boxes[-1],t2.boxes[-1])
                sp=t1.avg_speed()+t2.avg_speed()

                if ov>VIOLENCE_IOU and sp>VIOLENCE_SPEED:
                    violence.append(frame_idx); evidence.add(frame_idx)
                if suspect_id in (ids[i],ids[j]) and ov>THEFT_IOU:
                    theft.append(frame_idx); evidence.add(frame_idx)

        for tid in ids:
            if trackers[tid].avg_speed()>ESCAPE_SPEED:
                chase.append(frame_idx); evidence.add(frame_idx)

    cap.release()
    events=[]
    video_id = normalize_id(name, "video")
    add_node(video_id, name, "video_source")

    def register_event(label, frames, desc):
        tw = format_time(frames, fps)
        eid = normalize_id(label, "event")
        add_node(eid, label, "event")
        add_edge(video_id, eid, "captured")
        events.append({"event": label, "time_window": tw, "llm_report": desc})
        return eid

    if theft: register_event("Theft / Snatching", theft, "Theft detected.")
    if violence: register_event("Physical Altercation", violence, "Violence detected.")
    if chase: register_event("Rapid Movement", chase, "Chase detected.")
    if not events: register_event("Normal Activity", [], "No abnormal events.")

    cap=cv2.VideoCapture(path)
    for f in sorted(evidence):
        cap.set(cv2.CAP_PROP_POS_FRAMES,f)
        r,fr=cap.read()
        if r: cv2.imwrite(f"{EVIDENCE_DIR}/{name}_{f}.jpg",fr)
    cap.release()

    return {
        "status": "completed",
        "events_detected": events,
        "evidence_files": sorted(os.listdir(EVIDENCE_DIR))
    }
@router.post("/text")
async def analyze_text_evidence(files: List[UploadFile] = File(...)):
    
    saved_results = []

    for file in files:
        path = os.path.join(UPLOAD_DIR, file.filename)

        with open(path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        text = extract_text_from_file(path)
        
        if len(text.strip()) > 50:
          
            facts = extract_entities_from_text(text)
            
            EXTRACTED_FACTS.append({
                "filename": file.filename, 
                "facts": facts
            })
            
            saved_results.append({"filename": file.filename, "status": "processed"})

    return {
        "status": "batch_complete", 
        "processed_count": len(saved_results),
        "results": saved_results
    }

@router.get("/graph")
def generate_graph_endpoint():
    reset_graph()
    if not EXTRACTED_FACTS:
        return {"error": "No extracted documents found."}

    for doc in EXTRACTED_FACTS:
        info = doc["facts"]
        label = doc["filename"]
        doc_id = normalize_id(label, "doc")
        add_node(doc_id, label, "document")

        for p in info.get("persons", []):
            pid = normalize_id(p, "person")
            add_node(pid, p, "person")
            add_edge(pid, doc_id, "mentioned_in")
            for e in info.get("events", []):
                add_edge(pid, normalize_id(e, "event"), "involved_in")

        for e in info.get("events", []):
            eid = normalize_id(e, "event")
            add_node(eid, e, "event")
            add_edge(doc_id, eid, "documents")

        for l in info.get("locations", []):
            lid = normalize_id(l, "location")
            add_node(lid, l, "location")
            add_edge(doc_id, lid, "references")

    return {
        "status": "graph_created", 
        "nodes": len(CASE_GRAPH["nodes"]), 
        "edges": len(CASE_GRAPH["edges"])
    }

@router.get("/case-graph")
def get_case_graph():
    return CASE_GRAPH

@router.post("/reset-case/")
def reset_case():
    global EXTRACTED_FACTS
    EXTRACTED_FACTS = []
    reset_graph()
    for f in os.listdir(EVIDENCE_DIR):
        os.remove(os.path.join(EVIDENCE_DIR, f))
    return {"status": "case_reset"}

@router.post("/")
async def analyze_single(
    cctv_video: UploadFile = File(...),
    criminal_img: Optional[UploadFile] = File(None)
):
    for f in os.listdir(EVIDENCE_DIR):
        os.remove(os.path.join(EVIDENCE_DIR, f))

    vp = os.path.join(UPLOAD_DIR, "v.mp4")
    with open(vp, "wb") as f:
        shutil.copyfileobj(cctv_video.file, f)

    sus_feat = None
    if criminal_img:
        ip = os.path.join(UPLOAD_DIR, "s.jpg")
        with open(ip, "wb") as f:
            shutil.copyfileobj(criminal_img.file, f)
        img = cv2.imread(ip)
        if img is not None:
            sus_feat = extract_feat(img)

    result = analyze_video_logic(vp, sus_feat, "CCTV1")
    return JSONResponse(result)

@router.get("/health")
def health():
    return {"status": "ok"}