from fastapi import APIRouter
from backend.services.pipeline_service import build_crime_points
from backend.services.spatial_clustering import detect_hotspots

router = APIRouter()

@router.post("/run")
def run_pipeline(documents_output: dict):
    fir_results = documents_output.get("results", [])

    points = build_crime_points(fir_results)

    clustering_result = detect_hotspots(points)

    # 🔥 EXTRACT ONLY THE ACTUAL CLUSTERS
    clusters = clustering_result.get("hotspot_clusters", {})

    response = []

    for cluster_id, pts in clusters.items():
        avg_lat = sum(p["lat"] for p in pts) / len(pts)
        avg_lon = sum(p["lon"] for p in pts) / len(pts)

        response.append({
            "cluster_id": cluster_id,
            "crime_count": len(pts),
            "centroid": {
                "lat": avg_lat,
                "lon": avg_lon
            }
        })

    return {
        "total_firs": len(fir_results),
        "valid_geo_points": clustering_result.get("valid_geo_points"),
        "hotspot_clusters": response
    }
