from fastapi import APIRouter
from pydantic import BaseModel
import base64, tempfile

from backend.services.pdf_extraction import extract_text_from_pdf
from backend.services.fir_extraction import extract_fir_fields

router = APIRouter()

class FIRPipelineRequest(BaseModel):
    pdf_base64: str

@router.post("/process")
def process_fir(data: FIRPipelineRequest):

    pdf_bytes = base64.b64decode(data.pdf_base64)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
        f.write(pdf_bytes)
        pdf_path = f.name

    extracted_text = extract_text_from_pdf(pdf_path)

    structured_fir = extract_fir_fields(extracted_text)

    return {
        "extracted_text": extracted_text,
        "structured_fir": structured_fir
    }
