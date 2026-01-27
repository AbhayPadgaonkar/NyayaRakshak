import re

def extract_fir_fields(text: str):
    def find(pattern):
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        return match.group(1).strip() if match else None

    structured_data = {
        "crime_type": find(
            r"Crime\s*Type:\s*(.*?)(?:IPC|Applicable|Place|Date|Time)"
        ),
        "location": find(
            r"(?:Place\s*of\s*Occurrence|Location):\s*(.*?)(?:Date|Time|Complaint)"
        ),
        "date": find(
            r"Date\s*(?:&\s*Time\s*of\s*Occurrence)?:\s*(\d{2}/\d{2}/\d{4})"
        ),
        "time": find(
            r"Time:\s*([0-9:]+\s*hrs)"
        ),
        "sections": find(
            r"(?:IPC\s*Sections?|Applicable\s*Sections?):\s*(.*?)(?:Place|Date|Time|Complaint)"
        )
    }

    complaint_match = re.search(
        r"Complaint:\s*(.*)",
        text,
        re.IGNORECASE | re.DOTALL
    )
    complaint_text = complaint_match.group(1).strip() if complaint_match else None

    return structured_data, complaint_text
