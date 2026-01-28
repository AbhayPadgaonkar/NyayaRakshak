from fastapi import APIRouter
from backend.mock_store import get_all_firs

router = APIRouter(prefix="/debug")

@router.get("/firs")
def debug_firs():
    firs = get_all_firs()
    return {
        "count": len(firs),
        "firs": firs
    }
