import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode: dict[str, Any] = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        return str(payload.get("sub")) if payload.get("sub") else None
    except JWTError:
        return None


_jwks_cache: dict[str, Any] | None = None


def _get_supabase_jwks() -> dict[str, Any] | None:
    """Fetch and cache the Supabase JWKS (public keys for ES256 verification)."""
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache
    if not settings.supabase_jwt_secret:
        return None
    jwks_url = getattr(settings, "supabase_jwks_url", None)
    if not jwks_url:
        return None
    try:
        resp = httpx.get(jwks_url, timeout=10)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        logger.info("Cached Supabase JWKS from %s", jwks_url)
        return _jwks_cache
    except Exception as e:
        logger.warning("Failed to fetch Supabase JWKS: %s", e)
        return None


def decode_supabase_jwt(token: str) -> dict[str, Any] | None:
    """Validate Supabase-issued access JWT (ES256 via JWKS or HS256 via secret)."""
    if not settings.supabase_jwt_secret:
        return None

    # Peek at the token header to determine algorithm
    try:
        header = jwt.get_unverified_header(token)
    except JWTError:
        return None

    alg = header.get("alg", "")

    # ES256 — verify with JWKS public key
    if alg == "ES256":
        jwks = _get_supabase_jwks()
        if not jwks:
            logger.warning("ES256 token but no JWKS available; trying HS256 fallback")
        else:
            kid = header.get("kid")
            key_data = None
            for k in jwks.get("keys", []):
                if k.get("kid") == kid:
                    key_data = k
                    break
            if not key_data:
                key_data = jwks.get("keys", [None])[0]
            if key_data:
                try:
                    return jwt.decode(
                        token,
                        key_data,
                        algorithms=["ES256"],
                        audience="authenticated",
                    )
                except JWTError:
                    try:
                        return jwt.decode(
                            token,
                            key_data,
                            algorithms=["ES256"],
                            options={"verify_aud": False},
                        )
                    except JWTError as e:
                        logger.warning("ES256 JWT decode failed: %s", e)
                        return None

    # HS256 fallback — verify with JWT secret
    try:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError:
        try:
            return jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        except JWTError as e:
            logger.warning("HS256 JWT decode failed: %s", e)
            return None
