# backend/api/deployment.py
from fastapi import APIRouter
from backend.mock_store import get_all_firs

router = APIRouter(prefix="/deployment", tags=["Deployment"])

@router.get("/recommendations")
def get_deployment_recommendations():
    firs = get_all_firs()

    hotspots = {}
    for fir in firs:
        geo = fir.get("geo")
        if not geo:
            continue

        key = f"{round(geo['lat'], 3)}-{round(geo['lon'], 3)}"
        hotspots[key] = hotspots.get(key, 0) + 1

    recommendations = []
    for zone, count in hotspots.items():
        if count >= 2:
            recommendations.append({
                "zone": zone,
                "recommended_units": ["PCR Van"],
                "priority": "High"
            })

    return recommendations
