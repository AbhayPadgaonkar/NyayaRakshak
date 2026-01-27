from fastapi import APIRouter, UploadFile, File
from typing import List
import io

from pypdf import PdfReader
from backend.services.fir_extraction import extract_fir_fields
from backend.services.text_utils import normalize_text

router = APIRouter()

@router.post("/")
async def ingest_fir(files: List[UploadFile] = File(...)):
    results = []

    for file in files:
        if file.content_type != "application/pdf":
            continue

        try:
            content = await file.read()
            pdf_stream = io.BytesIO(content)

            reader = PdfReader(pdf_stream)
            raw_text = ""
            for page in reader.pages:
                raw_text += page.extract_text() or ""

            structured_data, complaint_text = extract_fir_fields(raw_text)

            results.append({
                "filename": file.filename,
                "status": "success",

                # 🔥 KEEP FULL RAW FIR
                "raw_text": raw_text,

                # 🔥 CLEAN STRUCTURED FIELDS
                "structured_data": structured_data,

                # 🔥 FULL, NORMALIZED COMPLAINT
                "complaint_text": normalize_text(complaint_text)
            })

        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "message": str(e)
            })

    return {
        "uploaded_count": len(results),
        "results": results
    }
