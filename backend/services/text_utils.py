import re

def normalize_text(text: str) -> str:
    if not text:
        return None
    text = re.sub(r"\s+", " ", text)
    return text.strip()
