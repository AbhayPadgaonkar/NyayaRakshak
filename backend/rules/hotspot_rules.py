def detect_hotspots(crimes):
    if not crimes:
        return []

    zone_counts = {}

    for c in crimes:
        zone = c.get("zone")
        if not zone:
            continue
        zone_counts[zone] = zone_counts.get(zone, 0) + 1

    if not zone_counts:
        return []

    avg = sum(zone_counts.values()) / len(zone_counts)

    return [
        zone for zone, count in zone_counts.items()
        if count > avg
    ]
