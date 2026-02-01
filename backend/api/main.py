from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles  # <--- 1. IMPORT THIS
from fastapi.middleware.cors import CORSMiddleware
from backend.api import (
    documents,
    hotspots,
    alerts,
    deployment,
    patrolling,
    community,
    recommendations,
    debug
)
from backend.api import fir_pipeline
from backend.api import pipeline

from backend.api.law_order_dashboard import router as law_order_router
from backend.yolo_detection import model # <--- This imports your model.py

app = FastAPI(title="SafeCity Backend")
app.include_router(fir_pipeline.router, prefix="/fir")
# --- FIX START: Mount the Evidence folder here ---
# This tells the main app: "When you get a request for /evidence/image.jpg, 
# look inside the folder defined in model.EVIDENCE_DIR"
app.mount("/evidence", StaticFiles(directory=model.EVIDENCE_DIR), name="evidence")
# --- FIX END ---



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Keep your existing router include (this handles the POST requests)
app.include_router(model.router, prefix="/analyze")

app.include_router(deployment.router)
app.include_router(patrolling.router)
app.include_router(debug.router)
app.include_router(law_order_router)
app.include_router(pipeline.router, prefix="/pipeline")
app.include_router(documents.router, prefix="/documents")
app.include_router(hotspots.router, prefix="/hotspots")
app.include_router(alerts.router, prefix="/alerts")
app.include_router(deployment.router, prefix="/deployment")
app.include_router(community.router, prefix="/community")
app.include_router(recommendations.router, prefix="/recommendations")

@app.get("/")
def read_root():
    return {"message": "NyayaRakshak is Live"}