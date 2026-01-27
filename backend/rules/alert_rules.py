def should_send_alert(area_risk: float, time_risk: float) -> bool:
    return area_risk > 0.7 and time_risk > 0.6
