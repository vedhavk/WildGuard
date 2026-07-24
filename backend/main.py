import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
import models

from user import router as user_router
from admin import router as admin_router
from uploads import router as upload_router
from alert import router as alert_router
from events import router as events_router
from authority import router as authority_router
from user_profile import router as profile_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Wild Guard API",
    description="Wildlife detection and community alert system",
    version="1.0.0",
)

# CORS — allow Next.js frontend across Vercel production/preview deployments & local dev origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Serve uploaded images as static files
uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Register routers
app.include_router(user_router, prefix="/api/users", tags=["Users"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(upload_router, prefix="/api", tags=["Upload"])
app.include_router(alert_router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(events_router, prefix="/api/events", tags=["Wildlife Events"])
app.include_router(authority_router, prefix="/api/authority", tags=["Authority Portal"])
app.include_router(profile_router, prefix="/api/profile", tags=["User Profiles"])


@app.get("/")
def root():
    return {
        "app": "Wild Guard",
        "status": "running",
        "docs": "/docs",
    }
