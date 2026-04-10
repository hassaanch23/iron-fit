from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Profile, User
from app.db.session import get_db
from app.schemas import ProfilePayload, ProfileResponse

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> ProfileResponse:
    profile = db.scalar(select(Profile).where(Profile.user_id == user.id))
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return ProfileResponse(
        user_id=user.id,
        name=profile.name,
        age=profile.age,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        goal_type=profile.goal_type,
        target_value=profile.target_value,
    )


@router.put("", response_model=ProfileResponse)
def upsert_profile(
    payload: ProfilePayload,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ProfileResponse:
    profile = db.scalar(select(Profile).where(Profile.user_id == user.id))
    if not profile:
        profile = Profile(user_id=user.id)
    for key, value in payload.model_dump().items():
        setattr(profile, key, value)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return ProfileResponse(user_id=user.id, **payload.model_dump())
