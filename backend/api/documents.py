from fastapi import APIRouter, UploadFile, File
import shutil
import os
from app.services.pdf_extraction import extract_text_from_pdf
from app.services.fir_extraction import extract_fir_fields

router = APIRouter()

@router.post("/upload")
def upload_pdf(file: UploadFile = File(...)):
    os.makedirs("temp", exist_ok=True)
    file_path = f"temp/{file.filename}"

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    text = extract_text_from_pdf(file_path)
    structured = extract_fir_fields(text)

    return {
        "extracted_text_preview": text[:1000],
        "structured_data": structured
    }
