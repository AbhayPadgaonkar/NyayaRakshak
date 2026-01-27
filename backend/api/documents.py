from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import io
# If you don't have pypdf, install it: pip install pypdf
from pypdf import PdfReader 
from backend.services.fir_extraction import extract_fir_fields

router = APIRouter()

@router.post("/")
async def ingest_fir(files: List[UploadFile] = File(...)):
    results = []
    
    for file in files:
        # 1. Check if it's a PDF
        if file.content_type != "application/pdf":
            continue
            
        try:
            # 2. Read the file content
            content = await file.read()
            pdf_stream = io.BytesIO(content)
            
            # 3. Extract Text from PDF (Simple extraction)
            reader = PdfReader(pdf_stream)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            
            # 4. Send text to your existing AI extraction service
            structured_data = extract_fir_fields(text)
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "data": structured_data
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "message": str(e)
            })

    return {"uploaded_count": len(results), "results": results}