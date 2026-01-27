from fastapi import APIRouter
from backend.rules.hotspot_rules import detect_hotspots

router = APIRouter()

@router.post("/")
def get_hotspots(crimes: list):
    hotspots = detect_hotspots(crimes)
    return {"hotspots": hotspots}
