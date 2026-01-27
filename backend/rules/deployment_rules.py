def base_deployment(risk):
    if risk > 0.8:
        return 5
    elif risk > 0.5:
        return 3
    return 1

def event_multiplier(event):
    events = {
        "ganpati": 1.4,
        "election": 1.6,
        "new_year": 1.3
    }
    return events.get(event.lower(), 1.0)
