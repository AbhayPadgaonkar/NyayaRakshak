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




# from fastapi import APIRouter, UploadFile, File, HTTPException
# from typing import List, Dict
# import shutil
# import os
# import tempfile
# import uuid
# from datetime import datetime

# # Import your helper functions
# # Ensure these exist in backend/services/
# from backend.services.pdf_extraction import extract_text_from_pdf
# from backend.services.fir_extraction import extract_fir_fields
# # If you don't have text_utils yet, you can remove this import and the normalize call below
# from backend.services.text_utils import normalize_text 

# router = APIRouter()

# # --- 1. IN-MEMORY DATABASE (To store data for the Dashboard) ---
# FIR_DATABASE: List[Dict] = []

# @router.post("/")
# async def ingest_fir(files: List[UploadFile] = File(...)):
#     results = []

#     for file in files:
#         if file.content_type != "application/pdf":
#             results.append({"filename": file.filename, "status": "skipped_not_pdf"})
#             continue

#         try:
#             # 1. Save upload to a temporary file (Better for OCR/heavy processing)
#             with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
#                 shutil.copyfileobj(file.file, temp_file)
#                 temp_file_path = temp_file.name

#             # 2. Extract Text using your Service
#             # This calls the robust function (supports OCR if you added it)
#             raw_text = extract_text_from_pdf(temp_file_path)

#             # --- DEBUG PRINT: Check your terminal to see if text appears! ---
#             print(f"\n--- EXTRACTED TEXT FROM {file.filename} ({len(raw_text)} chars) ---\n{raw_text[:200]}...\n------------------------------------------------\n")

#             # 3. Clean up the temp file
#             os.remove(temp_file_path)

#             # 4. Extract Structured Data
#             # Assumes extract_fir_fields returns a dict or tuple. 
#             # Adjust if your function returns (data, complaint_text) tuple.
#             extraction_result = extract_fir_fields(raw_text)
            
#             # Handle if your extraction returns a tuple (data, text) or just data
#             if isinstance(extraction_result, tuple):
#                 structured_data, complaint_text = extraction_result
#             else:
#                 structured_data = extraction_result
#                 complaint_text = raw_text # Fallback

#             # 5. Create Record for Database
#             new_record = {
#                 "id": str(uuid.uuid4())[:8].upper(),
#                 "filename": file.filename,
#                 "upload_time": datetime.now().strftime("%I:%M %p"), # e.g. "10:30 AM"
#                 "status": "Processed",
#                 "data": structured_data, # contains crime_type, location, etc.
#                 "full_text": normalize_text(complaint_text) if 'normalize_text' in globals() else complaint_text
#             }

#             # 6. Save to Global List (The "Database")
#             FIR_DATABASE.append(new_record)
            
#             # 7. Add to immediate response
#             results.append({
#                 "filename": file.filename,
#                 "status": "success",
#                 "record_id": new_record["id"],
#                 "data": structured_data
#             })

#         except Exception as e:
#             print(f"Error processing {file.filename}: {e}")
#             results.append({
#                 "filename": file.filename,
#                 "status": "error",
#                 "message": str(e)
#             })

#     return {"uploaded_count": len(results), "results": results}

# # --- 2. GET ENDPOINT (For the Police Dashboard) ---
# @router.get("/")
# async def get_documents():
#     """Returns the list of all processed FIRs stored in memory."""
#     return FIR_DATABASE
