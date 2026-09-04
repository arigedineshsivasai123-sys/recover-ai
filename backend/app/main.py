import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_initial_data
from app.routes import (
    dashboard,
    opportunities,
    ai,
    recovery,
    payments,
    audit,
    analytics,
    settings as settings_route,
    demo
)

# Initialize database tables
Base.metadata.create_all(bind=engine, checkfirst=True)

# Seed database with demo records
db = SessionLocal()
try:
    seed_initial_data(db)
finally:
    db.close()

app = FastAPI(
    title=settings.APP_NAME,
    description="RecoverAI - AI Revenue Recovery Agent Backend API",
    version="1.0.0"
)

# CORS Setup for Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(dashboard.router)
app.include_router(opportunities.router)
app.include_router(ai.router)
app.include_router(recovery.router)
app.include_router(payments.router)
app.include_router(audit.router)
app.include_router(analytics.router)
app.include_router(settings_route.router)
app.include_router(demo.router)

@app.get("/api/health")
def api_health():
    return {
        "status": "online",
        "app": "RecoverAI",
        "pitch": "RecoverAI is a controlled AI revenue-recovery agent that identifies money at risk, determines the most effective recovery action, and safely converts failed or abandoned payment attempts into recovered revenue.",
        "razorpay_mode": "REAL API" if settings.RAZORPAY_KEY_ID and not settings.RAZORPAY_KEY_ID.startswith("rzp_test_recoverai_demo") else "TEST SIMULATION",
        "ai_mode": "LIVE GEMINI AI" if settings.AI_API_KEY else "STRUCTURED CONTEXTUAL REASONING"
    }

# SPA Static File Serving & Catch-All Route for Single URL Deployment
FRONTEND_DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST_DIR):
    assets_dir = os.path.join(FRONTEND_DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        
        target_file = os.path.join(FRONTEND_DIST_DIR, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        
        index_file = os.path.join(FRONTEND_DIST_DIR, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        
        return JSONResponse(status_code=404, content={"detail": "Frontend assets not found"})
else:
    @app.get("/")
    def root():
        return {
            "status": "online",
            "app": "RecoverAI",
            "message": "Backend API is running. Build frontend to enable single-URL SPA serving.",
            "razorpay_mode": "REAL API" if settings.RAZORPAY_KEY_ID and not settings.RAZORPAY_KEY_ID.startswith("rzp_test_recoverai_demo") else "TEST SIMULATION",
            "ai_mode": "LIVE GEMINI AI" if settings.AI_API_KEY else "STRUCTURED CONTEXTUAL REASONING"
        }
