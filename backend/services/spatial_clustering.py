import numpy as np
from sklearn.cluster import DBSCAN

def detect_hotspots(points, eps_km=3, min_samples=2):
    if not points:
        return {
            "valid_geo_points": 0,
            "hotspot_clusters": {}
        }

    coords = np.array([[p["lat"], p["lon"]] for p in points])

    eps = eps_km / 6371.0  # km → radians

    clustering = DBSCAN(
        eps=eps,
        min_samples=min_samples,
        algorithm="ball_tree",
        metric="haversine"
    ).fit(np.radians(coords))

    labels = clustering.labels_

    hotspots = {}
    for label, point in zip(labels, points):
        if label == -1:
            continue
        hotspots.setdefault(label, []).append(point)

    return {
        "valid_geo_points": len(points),
        "hotspot_clusters": hotspots
    }
