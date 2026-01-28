def classify_departments(crime_type: str):
    if crime_type in [
        "Murder",
        "Attempt to Murder",
        "Cheating / Fraud",
        "Cyber Crime"
    ]:
        return ["law_order", "crime_branch"]

    if crime_type in [
        "Traffic Obstruction",
        "Road Accident"
    ]:
        return ["traffic"]

    return ["law_order"]
