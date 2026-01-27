from backend.services.geocoding_service import geocode_location

def build_crime_points(fir_results: list):
    points = []

    for fir in fir_results:
        structured = fir.get("structured_data", {})
        location = structured.get("location")

        if not location:
            continue

        geo = geocode_location(location)
        if not geo:
            continue

        # 🔥 THIS MUST BE A DICT
        point = {
            "lat": geo["lat"],
            "lon": geo["lon"],
            "crime_type": structured.get("crime_type"),
            "zone": location,
            "source_file": fir.get("filename")
        }

        points.append(point)

    return points
