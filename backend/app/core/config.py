from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Iron Fit API"
    # Matches PORT in .env (uvicorn CLI still decides bind port unless you read settings.port)
    port: int = 8000
    api_prefix: str = "/api/v1"
    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    database_url: str = "sqlite:///./ironfit.db"
    cors_origins: list[str] = ["*"]
    google_client_id: str | None = None
    # Supabase → Project Settings → API → JWT Secret (verifies mobile access_token)
    supabase_jwt_secret: str | None = None
    # JWKS URL for ES256 token verification (auto-derived if supabase_url is set)
    supabase_jwks_url: str | None = None
    supabase_url: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
