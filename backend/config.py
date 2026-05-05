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

    # ── 微信支付 ──
    WECHAT_PAY_ENABLED: bool = False
    WECHAT_APPID: str = ""
    WECHAT_MCH_ID: str = ""
    WECHAT_API_KEY: str = ""
    WECHAT_NOTIFY_URL: str = "https://yourdomain.com/api/payments/wechat/notify"

    # ── 支付宝 ──
    ALIPAY_ENABLED: bool = False
    ALIPAY_APP_ID: str = ""
    ALIPAY_PRIVATE_KEY: str = ""
    ALIPAY_PUBLIC_KEY: str = ""
    ALIPAY_NOTIFY_URL: str = "https://yourdomain.com/api/payments/alipay/notify"
    ALIPAY_RETURN_URL: str = "https://yourdomain.com/payment/success"

    # ── PayPal ──
    PAYPAL_ENABLED: bool = False
    PAYPAL_CLIENT_ID: str = ""
    PAYPAL_SECRET: str = ""
    PAYPAL_MODE: str = "sandbox"  # sandbox 或 live
    PAYPAL_RETURN_URL: str = "https://yourdomain.com/payment/success"
    PAYPAL_CANCEL_URL: str = "https://yourdomain.com/payment/cancel"

    S3_BUCKET: str = ""
    S3_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    GEOCODING_API_KEY: str = ""
    FRONTEND_URL: str = "http://localhost:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()