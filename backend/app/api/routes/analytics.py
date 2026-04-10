from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Activity, User
from app.db.session import get_db
from app.schemas import DashboardResponse, HistoryPoint, HistoryResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _window_start(days: int) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=days)


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> DashboardResponse:
    start = _window_start(7)
    rows = db.scalars(select(Activity).where(Activity.user_id == user.id, Activity.started_at >= start)).all()
    return DashboardResponse(
        total_steps_week=sum(r.steps for r in rows),
        total_distance_week=round(sum(r.distance_km for r in rows), 2),
        total_calories_week=round(sum(r.calories for r in rows), 2),
        total_duration_week=sum(r.duration_min for r in rows),
        workouts_week=len(rows),
    )


@router.get("/history", response_model=HistoryResponse)
def get_history(
    timeframe: str = Query(default="week", pattern="^(week|month)$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> HistoryResponse:
    days = 7 if timeframe == "week" else 30
    start = _window_start(days)
    rows = db.scalars(select(Activity).where(Activity.user_id == user.id, Activity.started_at >= start)).all()

    grouped: dict[date, list[Activity]] = {}
    for row in rows:
        grouped.setdefault(row.started_at.date(), []).append(row)

    points = []
    for d in sorted(grouped.keys()):
        items = grouped[d]
        points.append(
            HistoryPoint(
                period=d.isoformat(),
                steps=sum(i.steps for i in items),
                distance_km=round(sum(i.distance_km for i in items), 2),
                calories=round(sum(i.calories for i in items), 2),
                duration_min=sum(i.duration_min for i in items),
            )
        )
    return HistoryResponse(timeframe=timeframe, points=points)
