def detect_hotspots(crimes):
    zone_counts = {}

    for c in crimes:
        zone = c["zone"]
        zone_counts[zone] = zone_counts.get(zone, 0) + 1

    avg = sum(zone_counts.values()) / len(zone_counts)
    return [z for z, count in zone_counts.items() if count > avg]
