import os
import requests
import urllib.parse

FAST2SMS_API_KEY = os.getenv("FAST2SMS_API_KEY")

def send_sms(phone: str, message: str):
    if not FAST2SMS_API_KEY:
        raise Exception("FAST2SMS_API_KEY not set")

    # Fast2SMS is VERY strict
    message = message[:150]  # enforce limit
    phone = str(phone)

    params = {
        "authorization": FAST2SMS_API_KEY,
        "route": "q",              # QUICK SMS
        "message": message,
        "numbers": phone
    }

    url = "https://www.fast2sms.com/dev/bulkV2"

    response = requests.get(url, params=params, timeout=10)
    
    # Debug help if it fails again
    if response.status_code != 200:
        raise Exception(f"{response.status_code} {response.text}")

    return response.json()
