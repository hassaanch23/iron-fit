from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserAuthResponse(BaseModel):
    id: int
    email: EmailStr


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(SignupRequest):
    pass


class GoogleLoginRequest(BaseModel):
    id_token: str


class ProfilePayload(BaseModel):
    name: str | None = None
    age: int | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    goal_type: str | None = None
    target_value: float | None = None


class ProfileResponse(ProfilePayload):
    user_id: int


class ActivityCreate(BaseModel):
    kind: str
    steps: int = 0
    distance_km: float = 0
    calories: float = 0
    duration_min: int = 0
    started_at: datetime | None = None


class ActivityResponse(ActivityCreate):
    id: int
    user_id: int
    started_at: datetime


class DashboardResponse(BaseModel):
    total_steps_week: int
    total_distance_week: float
    total_calories_week: float
    total_duration_week: int
    workouts_week: int


class HistoryPoint(BaseModel):
    period: str
    steps: int
    distance_km: float
    calories: float
    duration_min: int


class HistoryResponse(BaseModel):
    timeframe: str
    points: list[HistoryPoint]
