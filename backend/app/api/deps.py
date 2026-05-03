import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.api.supabase_user import get_or_create_user_from_supabase
from app.core.config import settings
from app.core.security import decode_access_token, decode_supabase_jwt
from app.db.models import User
from app.db.session import get_db

logger = logging.getLogger("uvicorn.error")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_prefix}/auth/login")


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    if settings.supabase_jwt_secret:
        supabase_payload = decode_supabase_jwt(token)
        if supabase_payload:
            return get_or_create_user_from_supabase(db, supabase_payload)
        logger.warning("Supabase JWT decode failed for token: %s…", token[:20])

    user_id = decode_access_token(token)
    if not user_id:
        detail = "Invalid or expired authentication token"
        if not settings.supabase_jwt_secret:
            detail = (
                "Invalid authentication token. For the mobile app (Supabase login), set SUPABASE_JWT_SECRET in "
                "backend/.env to the same value as Supabase Dashboard → Project Settings → API → JWT Secret."
            )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)
    user = db.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
