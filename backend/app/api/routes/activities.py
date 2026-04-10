from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Activity, User
from app.db.session import get_db
from app.schemas import ActivityCreate, ActivityResponse

router = APIRouter(prefix="/activities", tags=["activities"])


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    payload: ActivityCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> ActivityResponse:
    activity = Activity(
        user_id=user.id,
        kind=payload.kind,
        steps=payload.steps,
        distance_km=payload.distance_km,
        calories=payload.calories,
        duration_min=payload.duration_min,
        started_at=payload.started_at or datetime.now(timezone.utc),
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return ActivityResponse(
        id=activity.id,
        user_id=user.id,
        kind=activity.kind,
        steps=activity.steps,
        distance_km=activity.distance_km,
        calories=activity.calories,
        duration_min=activity.duration_min,
        started_at=activity.started_at,
    )


@router.get("", response_model=list[ActivityResponse])
def list_activities(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    limit: int = Query(default=30, ge=1, le=200),
) -> list[ActivityResponse]:
    items = db.scalars(
        select(Activity).where(Activity.user_id == user.id).order_by(desc(Activity.started_at)).limit(limit)
    ).all()
    return [
        ActivityResponse(
            id=item.id,
            user_id=user.id,
            kind=item.kind,
            steps=item.steps,
            distance_km=item.distance_km,
            calories=item.calories,
            duration_min=item.duration_min,
            started_at=item.started_at,
        )
        for item in items
    ]


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(activity_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> None:
    activity = db.get(Activity, activity_id)
    if not activity or activity.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    db.delete(activity)
    db.commit()
