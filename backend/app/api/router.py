from fastapi import APIRouter

from app.api.routes import activities, analytics, auth, profile

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(activities.router)
api_router.include_router(analytics.router)
