from fastapi import APIRouter
from backend.rules.alert_rules import should_send_alert

router = APIRouter()

@router.post("/")
def alert(area: str, area_risk: float, time_risk: float):
    if should_send_alert(area_risk, time_risk):
        return {"alert": f"Safety alert sent for {area}"}
    return {"alert": "No alert required"}
