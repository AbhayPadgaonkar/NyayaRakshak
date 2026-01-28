from fastapi import APIRouter
from backend.services.pipeline_service import build_crime_points
from backend.services.spatial_clustering import detect_hotspots

router = APIRouter()

@router.post("/run")
def run_pipeline(documents_output: dict):
    # 1. Get FIRs
    firs = documents_output.get("firs", [])

    # 2. Build geo points
    points = build_crime_points(firs)

    # 3. Run clustering
    clustering_result = detect_hotspots(points)

    valid_geo_points = clustering_result.get("valid_geo_points", 0)
    clusters = clustering_result.get("hotspot_clusters", {})

    # 4. Format response
    hotspot_response = []

    for cluster_id, pts in clusters.items():
        if not pts:
            continue

        avg_lat = sum(p["lat"] for p in pts) / len(pts)
        avg_lon = sum(p["lon"] for p in pts) / len(pts)

        hotspot_response.append({
            "cluster_id": int(cluster_id),
            "crime_count": len(pts),
            "centroid": {
                "lat": avg_lat,
                "lon": avg_lon
            }
        })

    return {
        "total_firs": len(firs),
        "valid_geo_points": valid_geo_points,
        "hotspot_clusters": hotspot_response
    }
