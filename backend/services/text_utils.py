import re

BLACKLIST_PHRASES = [
    "Statement read over and admitted to be true",
    "Signature of Complainant",
    "Signature"
]

def normalize_text(text: str) -> str:
    if not text:
        return ""

    # 1. Replace multiple spaces with single space
    text = re.sub(r"[ \t]+", " ", text)

    # 2. Fix line breaks caused by OCR (word-per-line issue)
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # Join lines smartly into paragraphs
    paragraph = " ".join(lines)

    # 3. Normalize punctuation spacing
    paragraph = re.sub(r"\s+([.,;:])", r"\1", paragraph)

    return paragraph.strip()

def clean_location(loc: str) -> str:
    if not loc:
        return ""

    # remove labels
    loc = re.sub(r'place of occurrence[:\-]?', '', loc, flags=re.I)

    # remove date/time contamination
    loc = re.split(r'date|time', loc, flags=re.I)[0]

    # normalize whitespace
    loc = re.sub(r'\s+', ' ', loc)

    return loc.strip()

def extract_geo_query(location: str) -> str:
    if not location:
        return ""

    loc = location.lower()

    # remove common landmark words
    loc = re.sub(
        r'\b(near|opposite|behind|beside|outside|in front of)\b.*',
        '',
        loc
    )

    # remove words like signal, junction
    loc = re.sub(r'\b(signal|junction|chowk|naka)\b', '', loc)

    # normalize
    loc = re.sub(r'\s+', ' ', loc)

    return loc.strip().title()