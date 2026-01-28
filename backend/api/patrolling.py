# backend/api/patrolling.py
from fastapi import APIRouter
from backend.mock_store import get_all_firs

router = APIRouter(prefix="/patrolling", tags=["Patrolling"])

@router.get("/schedule")
def patrol_schedule():
    firs = get_all_firs()

    schedule = []
    for fir in firs:
        if fir.get("status") == "pending":
            schedule.append({
                "sector": fir.get("location_text"),
                "time_slot": "18:00 - 22:00",
                "reason": fir.get("crime_type"),
                "recommended_unit": "Beat Marshall"
            })

    return schedule[:5]
