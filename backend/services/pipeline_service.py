def build_crime_points(fir_results: list):
    points = []

    for fir in fir_results:
        geo = fir.get("geo")
        if not geo:
            continue

        points.append({
            "lat": geo["lat"],
            "lon": geo["lon"],
            "crime_type": fir.get("crime_type"),
            "zone": fir.get("location_text"),
            "source_file": fir.get("source_file")
        })

    return points
