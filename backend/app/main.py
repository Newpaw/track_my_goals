from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.goals import router as goals_router
from app.api.checkins import router as checkins_router
from app.config import settings
from app.database import create_db_and_tables

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router
api_router = APIRouter()

# Include API routes
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(goals_router, prefix="/goals", tags=["goals"])
api_router.include_router(checkins_router, prefix="/checkins", tags=["checkins"])

# Include API router in app
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def on_startup():
    """Create database tables on startup"""
    create_db_and_tables()


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Track My Goals API",
        "docs": f"{settings.API_V1_STR}/docs",
    }