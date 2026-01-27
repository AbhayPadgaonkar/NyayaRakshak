import os, cv2, shutil, numpy as np, torch, requests
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from typing import Optional, List
from ultralytics import YOLO
from scipy.spatial.distance import cosine
import torchreid
from collections import deque

# ================= CONFIG ================= #

FRAME_SKIP = 2
RESIZE_WIDTH = 480
CONF = 0.4

VIOLENCE_IOU = 0.08
VIOLENCE_SPEED = 8
ESCAPE_SPEED = 25
THEFT_IOU = 0.05

UPLOAD_DIR = "uploads"
EVIDENCE_DIR = "evidence"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EVIDENCE_DIR, exist_ok=True)

# ================= MODELS ================= #

yolo = YOLO("yolov8n.pt")
yolo.fuse()

reid = torchreid.models.build_model("osnet_x1_0", num_classes=1000, pretrained=True)
reid.eval()
if torch.cuda.is_available():
    reid = reid.cuda()

# ================= FASTAPI ================= #

app = FastAPI(title="NyayRakshak CCTV Action Detection")

# ================= UTILS ================= #

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

# ================= TRACKER ================= #

class PersonTracker:
    def __init__(self,tid):
        self.id=tid
        self.boxes=deque(maxlen=10)
        self.pos=deque(maxlen=10)
        self.speeds=deque(maxlen=6)

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

# ================= REID ================= #

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

# ================= GROQ ================= #

def groq_report(event, tw, suspect=None, victims=None):
    try:
        s = f"Suspect ID {suspect}" if suspect else "An individual"
        v = f"victim IDs {victims}" if victims else "another person"

        prompt = f"""
Describe what is visible in CCTV footage.

Rules:
- Do not give commands or instructions.
- Do not mention police or investigation.
- Only describe observed actions.

Event: {event}
Time: {tw}
People: {s} interacting with {v}

Write 2-3 factual sentences.
"""

        r = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama3-70b-8192",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.4
            },
            timeout=20
        )
        return r.json()["choices"][0]["message"]["content"]

    except:
        return f"{event} observed during {tw}."

# ================= VIDEO ENGINE ================= #

def analyze_video(path, sus_feat=None, name="CCTV"):
    cap=cv2.VideoCapture(path)
    fps=cap.get(cv2.CAP_PROP_FPS)

    trackers={}
    suspect_id=None
    frame_idx=0

    violence=[]; theft=[]; chase=[]
    evidence=set()

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

    if theft:
        tw=format_time(theft,fps)
        events.append({
            "event":"Theft / Snatching",
            "time_window":tw,
            "llm_report":groq_report("Theft / Snatching",tw,suspect_id,None)
        })

    if violence:
        tw=format_time(violence,fps)
        events.append({
            "event":"Physical Violence",
            "time_window":tw,
            "llm_report":groq_report("Physical Violence",tw,None,None)
        })

    if chase:
        tw=format_time(chase,fps)
        events.append({
            "event":"Chase / Escape",
            "time_window":tw,
            "llm_report":groq_report("Chase / Escape",tw,None,None)
        })

    if not events:
        events.append({
            "event":"Normal Activity",
            "time_window":"Full Video",
            "llm_report":"People were moving normally with no visible abnormal interactions."
        })

    cap=cv2.VideoCapture(path)
    for f in sorted(evidence):
        cap.set(cv2.CAP_PROP_POS_FRAMES,f)
        r,fr=cap.read()
        if r:
            cv2.imwrite(f"{EVIDENCE_DIR}/{name}_{f}.jpg",fr)
    cap.release()

    return {
        "status":"completed",
        "events_detected":events,
        "evidence_files":sorted(os.listdir(EVIDENCE_DIR))
    }

# ================= APIs ================= #

@app.post("/analyze-single-video/")
async def analyze_single(
    cctv_video: UploadFile = File(...),
    criminal_img: Optional[UploadFile] = File(None)
):
    for f in os.listdir(EVIDENCE_DIR):
        os.remove(os.path.join(EVIDENCE_DIR,f))

    vp=os.path.join(UPLOAD_DIR,"v.mp4")
    with open(vp,"wb") as f: shutil.copyfileobj(cctv_video.file,f)

    sus_feat=None
    if criminal_img:
        ip=os.path.join(UPLOAD_DIR,"s.jpg")
        with open(ip,"wb") as f: shutil.copyfileobj(criminal_img.file,f)
        sus_feat=extract_feat(cv2.imread(ip))

    return JSONResponse(analyze_video(vp,sus_feat,"CCTV1"))

@app.post("/analyze-multiple-videos/")
async def analyze_multi(
    cctv_videos: List[UploadFile] = File(...),
    criminal_img: Optional[UploadFile] = File(None)
):
    for f in os.listdir(EVIDENCE_DIR):
        os.remove(os.path.join(EVIDENCE_DIR,f))

    sus_feat=None
    if criminal_img:
        ip=os.path.join(UPLOAD_DIR,"s.jpg")
        with open(ip,"wb") as f: shutil.copyfileobj(criminal_img.file,f)
        sus_feat=extract_feat(cv2.imread(ip))

    results=[]
    for i,v in enumerate(cctv_videos):
        vp=os.path.join(UPLOAD_DIR,f"v{i}.mp4")
        with open(vp,"wb") as f: shutil.copyfileobj(v.file,f)
        results.append(analyze_video(vp,sus_feat,f"CCTV{i+1}"))

    return {"status":"completed","results":results}

@app.get("/health")
def health():
    return {"status":"ok"}

if __name__=="__main__":
    import uvicorn
    uvicorn.run(app,host="0.0.0.0",port=8000)
