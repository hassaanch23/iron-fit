import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db import models  # noqa: F401
from app.db.session import engine

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix=settings.api_prefix)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    if not settings.supabase_jwt_secret:
        logging.getLogger("uvicorn.error").warning(
            "SUPABASE_JWT_SECRET is unset — the API cannot verify Supabase access tokens from the mobile app "
            "(GET /profile etc. will return 401). Add it to backend/.env from Supabase → Project Settings → API → JWT Secret."
        )


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Iron Fit backend is running"}
