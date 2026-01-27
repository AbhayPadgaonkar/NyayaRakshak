import numpy as np
from sklearn.cluster import DBSCAN

def detect_hotspots(points, eps_km=0.5, min_samples=3):
    """
    eps_km: radius in kilometers
    """

    # ✅ STEP 1: FILTER VALID COORDINATES
    valid_points = []
    for p in points:
        lat = p.get("lat")
        lon = p.get("lon")

        if lat is None or lon is None:
            continue

        if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
            continue

        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            continue

        valid_points.append(p)

    # 🚨 THIS IS THE LINE THAT SOLVES YOUR BUG
    if len(valid_points) < min_samples:
        return {
            "reason": "Not enough FIRs with valid coordinates",
            "total_received": len(points),
            "valid_geo_points": len(valid_points),
            "clusters": {}
        }

    # ✅ STEP 2: PREPARE COORDS
    coords = np.array([[p["lat"], p["lon"]] for p in valid_points])

    # Convert km → radians
    eps = eps_km / 6371.0

    clustering = DBSCAN(
        eps=eps,
        min_samples=min_samples,
        algorithm="ball_tree",
        metric="haversine"
    ).fit(np.radians(coords))

    labels = clustering.labels_

    # ✅ STEP 3: BUILD CLUSTERS
    hotspots = {}
    for label, point in zip(labels, valid_points):
        if label == -1:
            continue
        hotspots.setdefault(label, []).append(point)

    return {
        "total_received": len(points),
        "valid_geo_points": len(valid_points),
        "hotspot_clusters": hotspots
    }
