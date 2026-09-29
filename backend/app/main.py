import os
import sys
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.db.session import engine, Base, SessionLocal
from backend.app.db.models import User, Project
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.projects import router as projects_router
from backend.app.api.v1.analytics import router as analytics_router
from backend.app.api.v1.alerts import router as alerts_router
from backend.app.api.v1.audit import router as audit_router
from backend.app.api.v1.documents import router as documents_router
from backend.app.api.v1.predictions import router as predictions_router
from backend.app.api.v1.ai_chat import router as ai_chat_router

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Integrated Government Project Monitoring & Decision Support Platform (SIH Prototype)",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event: Ensure database schema is initialized and seed data is populated if empty
@app.on_event("startup")
def on_startup():
    print(f"Starting {settings.PROJECT_NAME} in [{settings.ENVIRONMENT}] mode...")
    Base.metadata.create_all(bind=engine)

    # Check if database is empty; if so, trigger seed script
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            print("Empty database detected. Running automated initial seed...")
            try:
                from scripts.seed_db import seed_database
                seed_database()
            except Exception as e:
                print(f"Notice: Automatic seed triggered exception: {e}")
    finally:
        db.close()


# Mount API v1 Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(projects_router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)
app.include_router(alerts_router, prefix=settings.API_V1_PREFIX)
app.include_router(documents_router, prefix=settings.API_V1_PREFIX)
app.include_router(predictions_router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_chat_router, prefix=settings.API_V1_PREFIX)
app.include_router(audit_router, prefix=settings.API_V1_PREFIX)


# System Health Endpoints
@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "ai_mode": settings.AI_MODE
    }


@app.get("/ready", tags=["System"])
def readiness_check():
    return {"status": "ready", "database": "connected"}


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred.", "type": type(exc).__name__}
    )
