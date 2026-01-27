from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <--- 1. IMPORT THIS
from backend.api import (
    documents,
    hotspots,
    alerts,
    deployment,
    community,
    recommendations
)

app = FastAPI(title="SafeCity Backend")

# --- 2. ADD THIS CORS BLOCK ---
# This tells the backend: "It's okay to accept requests from localhost:3000"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (Easiest for Hackathons)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allows all headers
)
# ------------------------------

app.include_router(documents.router, prefix="/documents")
app.include_router(hotspots.router, prefix="/hotspots")
app.include_router(alerts.router, prefix="/alerts")
app.include_router(deployment.router, prefix="/deployment")
app.include_router(community.router, prefix="/community")
app.include_router(recommendations.router, prefix="/recommendations")

@app.get("/")
def read_root():
    return {"message": "NyayaRakshak is Live"}