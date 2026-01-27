from fastapi import APIRouter
from backend.rules.deployment_rules import base_deployment, event_multiplier

router = APIRouter()

@router.post("/")
def deploy(risk: float, event: str = None):
    base = base_deployment(risk)
    final = int(base * event_multiplier(event)) if event else base
    return {"officers_required": final}
