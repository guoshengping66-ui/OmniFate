"""config.py — 项目全局配置"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",          # 忽略 .env 中的未知字段
        case_sensitive=False,
    )

    APP_NAME: str = "命盘智镜"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    DATABASE_URL: str = "sqlite+aiosqlite:///./destiny_dev.db"
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001

    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    AGENT_TEMPERATURE: float = 0.3
    AGENT_MAX_TOKENS: int = 4096
    WORKER_MAX_TOKENS: int = 2048   # 比 master 少一半——worker 只需提供分析素材

    JWT_SECRET_KEY: str = "alpha-mirror-jwt-secret-dev-key-2025"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_ID_PREMIUM: str = ""

    # Alipay (via Stripe)
    ALIPAY_ENABLED: bool = False

    # WeChat Pay (via Stripe)
    WECHAT_PAY_ENABLED: bool = False

    # PayPal (via Stripe)
    PAYPAL_ENABLED: bool = False

    S3_BUCKET: str = ""
    S3_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    GEOCODING_API_KEY: str = ""
    FRONTEND_URL: str = "http://localhost:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()