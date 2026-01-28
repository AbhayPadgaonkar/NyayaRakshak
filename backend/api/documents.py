from fastapi import APIRouter, UploadFile, File
from typing import List
import io
import uuid

from pypdf import PdfReader
from backend.services.text_utils import normalize_text
from backend.models.fir import FIR
from backend.services.fir_extraction import extract_fir_fields
from backend.services.geocoding_service import geocode_location
from backend.services.crime_classifier import resolve_crime_type
from backend.services.department_classifier import classify_departments

router = APIRouter()

@router.post("/")
async def ingest_firs(files: List[UploadFile] = File(...)):
    firs = []

    for file in files:
        if file.content_type != "application/pdf":
            continue

        content = await file.read()

        try:
            reader = PdfReader(io.BytesIO(content))
        except Exception:
            continue  # skip invalid pdfs

        raw_text = ""
        for page in reader.pages:
            raw_text += page.extract_text() or ""

        # ✅ FIXED HERE
        extracted, complaint_text = extract_fir_fields(raw_text)
        complaint_text = normalize_text(complaint_text)
        crime_type = resolve_crime_type(
            extracted.get("crime_type"),
            extracted.get("sections"),
            complaint_text
        )

        departments = classify_departments(crime_type)

        geo = None
        if extracted.get("location"):
            geo = geocode_location(extracted["location"])

        fir = FIR(
            fir_id=f"FIR-{uuid.uuid4().hex[:8]}",
            source_file=file.filename,

            raw_text=raw_text,
            complaint_text=complaint_text,

            crime_type=crime_type,
            sections=extracted.get("sections"),

            date=extracted.get("date"),
            time=extracted.get("time"),

            location_text=extracted.get("location"),
            geo=geo,

            department_tags=departments,
            status="pending"
        )

        firs.append(fir)

    return {
        "uploaded": len(firs),
        "firs": firs
    }
