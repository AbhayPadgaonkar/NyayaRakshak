import re

def extract_fir_fields(text: str) -> dict:
    def find(pattern):
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else None

    return {
        "crime_type": find(r"Crime Type:\s*(.*)"),
        "location": find(r"Location:\s*(.*)"),
        "date": find(r"Date:\s*(.*)"),
        "time": find(r"Time:\s*(.*)"),
        "sections": find(r"Sections:\s*(.*)")
    }
