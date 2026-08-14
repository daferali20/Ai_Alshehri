"""
Ai_Alshehri - Central Backend Configuration

All backend services should import settings from this module:
    from config import settings

For packages/services, the preferred pattern is:
    from backend.config import settings

Environment variables are loaded from .env when available. Secrets are
never hard-coded in source code.
"""

from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the entire backend."""

    # ------------------------------------------------------------------
    # Application
    # ------------------------------------------------------------------
    APP_NAME: str = "Ai_Alshehri"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    # ------------------------------------------------------------------
    # PostgreSQL / SQLAlchemy
    # ------------------------------------------------------------------
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/ai_alshehri"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    # ------------------------------------------------------------------
    # JWT authentication
    # ------------------------------------------------------------------
    JWT_SECRET_KEY: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ------------------------------------------------------------------
    # Encryption
    # ------------------------------------------------------------------
    MASTER_ENCRYPTION_KEY: str = ""
    ENCRYPTION_SALT: str = ""

    # ------------------------------------------------------------------
    # Redis
    # ------------------------------------------------------------------
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str | None = None
    REDIS_URL: str = "redis://localhost:6379/0"

    # ------------------------------------------------------------------
    # Kafka
    # ------------------------------------------------------------------
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_MARKET_DATA_TOPIC: str = "market_data"
    KAFKA_ORDER_TOPIC: str = "orders"
    KAFKA_CONSUMER_GROUP: str = "ai_alshehri"

    # ------------------------------------------------------------------
    # Internal service URLs
    # ------------------------------------------------------------------
    AI_ENGINE_URL: str = "http://localhost:8001"
    LIQUIDITY_SERVICE_URL: str = "http://localhost:8002"
    RECOMMENDATION_SERVICE_URL: str = "http://localhost:8003"
    USER_SERVICE_URL: str = "http://localhost:8004"
    ORDER_SERVICE_URL: str = "http://localhost:8005"
    API_GATEWAY_URL: str = "http://localhost:8000"

    # ------------------------------------------------------------------
    # Market data providers
    # ------------------------------------------------------------------
    FINNHUB_API_KEY: str = ""
    POLYGON_API_KEY: str = ""
    ALPHA_VANTAGE_API_KEY: str = ""
    FMP_API_KEY: str = ""
    TIINGO_API_KEY: str = ""
    YAHOO_FINANCE_ENABLED: bool = True

    # ------------------------------------------------------------------
    # AI / model configuration
    # ------------------------------------------------------------------
    LSTM_MODEL_PATH: str = "models/lstm_model.h5"
    TRANSFORMER_MODEL_PATH: str = "models/transformer_model"
    RF_MODEL_PATH: str = "models/random_forest.joblib"
    XGBOOST_MODEL_PATH: str = "models/xgboost_model.json"
    AI_REQUEST_TIMEOUT: float = 30.0

    # ------------------------------------------------------------------
    # Payments
    # ------------------------------------------------------------------
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""

    # ------------------------------------------------------------------
    # Broker / execution configuration
    # Kept for compatibility with legacy services. Execution should remain
    # disabled unless explicitly enabled by the product architecture.
    # ------------------------------------------------------------------
    BROKER_API_KEY: str = ""
    BROKER_API_SECRET: str = ""
    BROKER_BASE_URL: str = ""
    EXECUTION_ENABLED: bool = False

    # ------------------------------------------------------------------
    # Security / HTTP
    # ------------------------------------------------------------------
    ALLOWED_HOSTS: List[str] = Field(default_factory=lambda: ["*"])
    REQUEST_TIMEOUT: float = 30.0

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", "ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_list_values(cls, value):
        """Allow comma-separated environment variables."""
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return []
            if value.startswith("[") and value.endswith("]"):
                import json

                try:
                    parsed = json.loads(value)
                    if isinstance(parsed, list):
                        return parsed
                except json.JSONDecodeError:
                    pass
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    def validate_production_secrets(self) -> None:
        """Fail fast when mandatory production secrets are missing/default."""
        if not self.is_production:
            return

        if self.JWT_SECRET_KEY == "change-this-secret-in-production":
            raise ValueError("JWT_SECRET_KEY must be changed in production")

        if not self.MASTER_ENCRYPTION_KEY:
            raise ValueError("MASTER_ENCRYPTION_KEY is required in production")

        if not self.ENCRYPTION_SALT:
            raise ValueError("ENCRYPTION_SALT is required in production")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return one cached Settings instance for the whole process."""
    settings = Settings()
    settings.validate_production_secrets()
    return settings


settings = get_settings()

__all__ = ["Settings", "get_settings", "settings"]
