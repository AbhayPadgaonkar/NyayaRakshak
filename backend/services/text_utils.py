import re

BLACKLIST_PHRASES = [
    "Statement read over and admitted to be true",
    "Signature of Complainant",
    "Signature"
]

def normalize_text(text: str) -> str:
    if not text:
        return None

    # Remove FIR boilerplate
    for phrase in BLACKLIST_PHRASES:
        text = text.replace(phrase, "")

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    return text.strip()
