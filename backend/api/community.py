from fastapi import APIRouter

router = APIRouter()

@router.post("/report")
def report(data: dict):
    return {
        "status": "received",
        "message": "Community input added to intelligence pool"
    }
