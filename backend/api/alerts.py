from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.fast2sms_service import send_sms
from backend.services.groq_message_service import generate_message_with_groq
import os
print("GROQ KEY LOADED:", os.getenv("GROQ_API_KEY"))
router = APIRouter()

class SendSMSRequest(BaseModel):
    phone: str
    zone: str
    crime_type: str
    risk: float
    event: str | None = None


@router.post("/send-sms")
def send_alert_sms(payload: SendSMSRequest):
    # 1️⃣ Risk gate
    if payload.risk < 0.5:
        return {
            "status": "skipped",
            "reason": "Risk below threshold"
        }

    # 2️⃣ Context for Groq
    context = {
        "zone": payload.zone,
        "crime_type": payload.crime_type,
        "risk": payload.risk,
        "event": payload.event
    }

    # 3️⃣ Generate message via Groq
    try:
        message = generate_message_with_groq(context)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Groq message generation failed: {str(e)}"
        )

    # 4️⃣ Send SMS
    try:
        gateway_response = send_sms(payload.phone, message)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"SMS sending failed: {str(e)}"
        )

    return {
        "status": "sent",
        "message_source": "groq",
        "phone": payload.phone,
        "message": message,
        "gateway_response": gateway_response
    }
