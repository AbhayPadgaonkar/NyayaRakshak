from fastapi import APIRouter
from backend.ml.recommendation_model import recommend_cameras

router = APIRouter()

@router.post("/")
def recommend(crime_time: int, cameras: list):
    return {"recommended": recommend_cameras(crime_time, cameras)}
