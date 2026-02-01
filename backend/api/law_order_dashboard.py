from fastapi import APIRouter
from collections import Counter

from backend.mock_store import get_all_firs

router = APIRouter(prefix="/law-order", tags=["Law Order Dashboard"])


@router.get("/dashboard")
def law_order_dashboard():
    firs = get_all_firs()   # ✅ correct source

    complaint_counts = Counter()
    pending = 0
    recent = []

    for fir in firs:
        crime = fir.get("crime_type") or "Other"
        complaint_counts[crime] += 1

        if fir.get("status") == "pending":
            pending += 1

        recent.append({
    "fir_id": fir["fir_id"],
    "crime_type": crime,
    "location": fir.get("location_text"),
    "time": fir.get("time"),
    "date": fir.get("date"),
    "geo": fir.get("geo"),
    "sections": fir.get("sections"),
    "status": fir.get("status"),
    "priority": resolve_priority(crime),
    "complaint_text": fir.get("complaint_text"),
    "raw_text": fir.get("raw_text"),
})


    return {
        "stats": {
            "active_units": 24,          # static (deployment module later)
            "high_risk_zones": 3,        # pipeline will overwrite later
            "pending_complaints": pending,
            "community_uploads": 8
        },
        "complaint_counts": dict(complaint_counts),
        "recent_complaints": recent[:10]
    }


def resolve_priority(crime_type: str):
    crime_type = crime_type.lower()

    if crime_type in ["murder", "attempt to murder", "rape", "sexual harassment","road accident"]:
        return "High"
    if crime_type in ["theft", "assault","cyber crime - online fraud","cheating and fraud"]:
        return "Medium"
    return "Low"
