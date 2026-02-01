def resolve_crime_type(extracted, sections, complaint_text):
    if extracted:
        return extracted.strip()

    if sections:
        if "302" in sections:
            return "Murder"
        if "307" in sections:
            return "Attempt to Murder"
        if "379" in sections:
            return "Theft"
        if "354" in sections:
            return "Sexual Harassment"
        if "420" in sections:
            return "Cheating / Fraud"
        if "279" in sections:
            return "Road Accident"

    if not complaint_text:
        return "Unknown"

    text = complaint_text.lower()

    if "killed" in text or "murder" in text:
        return "Murder"
    if "iron rod" in text or "attack" in text:
        return "Attempt to Murder"
    if "stolen" in text or "wallet" in text:
        return "Theft"
    if "traffic jam" in text or "congestion" in text:
        return "Traffic Obstruction"

    return "Unknown"
