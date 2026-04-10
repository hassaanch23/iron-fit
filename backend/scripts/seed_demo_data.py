from datetime import datetime, timedelta, timezone
from random import randint, uniform

from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.base import Base
from app.db.models import Activity, Profile, User
from app.db.session import SessionLocal, engine


def run() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    user = db.scalar(select(User).where(User.email == "demo@ironfit.app"))
    if not user:
        user = User(email="demo@ironfit.app", password_hash=get_password_hash("DemoPass123!"))
        db.add(user)
        db.commit()
        db.refresh(user)

    profile = db.scalar(select(Profile).where(Profile.user_id == user.id))
    if not profile:
        profile = Profile(
            user_id=user.id,
            name="Demo User",
            age=27,
            height_cm=176,
            weight_kg=72,
            goal_type="distance",
            target_value=10,
        )
        db.add(profile)

    now = datetime.now(timezone.utc)
    for i in range(14):
        day = now - timedelta(days=i)
        db.add(
            Activity(
                user_id=user.id,
                kind="running" if i % 2 == 0 else "walking",
                steps=randint(2000, 12000),
                distance_km=round(uniform(1.5, 8.0), 2),
                calories=round(uniform(150, 700), 2),
                duration_min=randint(20, 90),
                started_at=day,
            )
        )

    db.commit()
    db.close()
    print("Seeded demo user: demo@ironfit.app / DemoPass123!")


if __name__ == "__main__":
    run()
