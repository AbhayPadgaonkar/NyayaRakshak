from fastapi import APIRouter, UploadFile, File
from typing import List
import io
import uuid

from pypdf import PdfReader
from backend.services.text_utils import normalize_text, clean_location, extract_geo_query
from backend.models.fir import FIR
from backend.services.fir_extraction import extract_fir_fields
from backend.services.geocoding_service import geocode_location
from backend.services.crime_classifier import resolve_crime_type
from backend.services.department_classifier import classify_departments

# 🔥 ADD THIS
from backend.mock_store import add_firs

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
            continue

        raw_text = ""
        for page in reader.pages:
            raw_text += page.extract_text() or ""

        extracted, complaint_text = extract_fir_fields(raw_text)

        crime_type = resolve_crime_type(
            extracted.get("crime_type"),
            extracted.get("sections"),
            complaint_text
        )

        departments = classify_departments(crime_type)

        geo = None
        raw_loc = extracted.get("location")

        if raw_loc:
            clean_loc = clean_location(raw_loc)
            geo_query = extract_geo_query(clean_loc)

            print("RAW LOCATION:", raw_loc)
            print("CLEAN LOCATION:", clean_loc)
            print("GEO QUERY:", geo_query)

            geo = geocode_location(geo_query)

            # 🔁 HARD FALLBACK (AREA LEVEL)
            if not geo:
                if "borivali" in geo_query.lower():
                    geo = geocode_location("Borivali West, Mumbai")
                elif "dahisar" in geo_query.lower():
                    geo = geocode_location("Dahisar, Mumbai")

        print("STORING FIR GEO:", geo)


        fir = FIR(
            fir_id=f"FIR-{uuid.uuid4().hex[:8]}",
            source_file=file.filename,

            raw_text=raw_text,
            complaint_text=normalize_text(complaint_text),

            crime_type=crime_type,
            sections=extracted.get("sections"),

            date=extracted.get("date"),
            time=extracted.get("time"),

            location_text=extracted.get("location"),
            geo=geo,

            department_tags=departments,
            status="pending"
        )

        firs.append(fir.dict()) 

   
    add_firs(firs)

    return {
        "uploaded": len(firs),
        "fir_ids": [f["fir_id"] for f in firs]
    }
