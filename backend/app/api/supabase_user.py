from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import User


def get_or_create_user_from_supabase(db: Session, payload: dict[str, object]) -> User:
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Supabase token")

    sub_str = str(sub)
    user = db.scalar(select(User).where(User.supabase_sub == sub_str))
    if user:
        return user

    email_raw = payload.get("email")
    email = str(email_raw).lower().strip() if email_raw else ""
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase token has no email; cannot create user",
        )

    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        existing.supabase_sub = sub_str
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    user = User(email=email, supabase_sub=sub_str, password_hash=None)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
