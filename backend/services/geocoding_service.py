import requests
import time

def geocode_location(location: str):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": f"{location}, Mumbai, India",
        "format": "json",
        "limit": 1
    }
    headers = {
        "User-Agent": "NyayaRakshak/1.0"
    }

    response = requests.get(url, params=params, headers=headers, timeout=50)
    response.raise_for_status()
    data = response.json()

    if not data:
        return None

    time.sleep(1)  # polite rate limiting
    return {
        "lat": float(data[0]["lat"]),
        "lon": float(data[0]["lon"]),
        "display_name": data[0]["display_name"]
    }
