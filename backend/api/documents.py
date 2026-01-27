from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.fir_extraction import extract_fir_fields

router = APIRouter()

class FIRIngestRequest(BaseModel):
    fir_text: str

@router.post("/ingest")
def ingest_fir(data: FIRIngestRequest):
    structured = extract_fir_fields(data.fir_text)
    return {"structured_data": structured}
