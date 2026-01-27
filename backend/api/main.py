from fastapi import FastAPI
from app.api import (
    fir,
    documents,
    hotspots,
    alerts,
    deployment,
    community,
    recommendations
)

app = FastAPI(title="SafeCity Backend")

app.include_router(documents.router, prefix="/documents")
app.include_router(fir.router, prefix="/fir")
app.include_router(hotspots.router, prefix="/hotspots")
app.include_router(alerts.router, prefix="/alerts")
app.include_router(deployment.router, prefix="/deployment")
app.include_router(community.router, prefix="/community")
app.include_router(recommendations.router, prefix="/recommendations")
