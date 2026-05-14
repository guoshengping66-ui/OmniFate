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
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000", "http://localhost:3001",
        "https://khanfate.com", "https://www.khanfate.com",
        "https://destiny-platform.vercel.app",
    ]

    DATABASE_URL: str = "sqlite+aiosqlite:///./destiny_dev.db"
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001

    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.deepseek.com"
    OPENAI_MODEL: str = "deepseek-v4-flash"     # 免费模型 — workers + 免费用户 master
    MASTER_FAST_MODEL: str = "deepseek-v4-flash" # 黄历等快速生成使用的基础模型
    PREMIUM_MODEL: str = "deepseek-v4-pro"      # 付费模型 — 付费用户 master 深度解析
    AGENT_TEMPERATURE: float = 0.3
    AGENT_MAX_TOKENS: int = 4096
    WORKER_MAX_TOKENS: int = 1536   # 比 master 少一半——worker 只需提供分析素材

    JWT_SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
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

    # ── 个人收款码 ──
    ALIPAY_PERSONAL_QR_URL: str = ""
    WECHAT_PERSONAL_QR_URL: str = ""
    PAYPAL_PERSONAL_QR_URL: str = ""
    PAYPAL_PERSONAL_EMAIL: str = ""


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    # ── Startup security warnings ──────────────────────────────────────
    if s.SECRET_KEY == "change-me-in-production":
        print("[SECURITY] ⚠️  SECRET_KEY 使用了默认值！请在 .env 中设置强随机密钥。")
    if s.JWT_SECRET_KEY == "change-me-in-production-use-openssl-rand-hex-32":
        print("[SECURITY] ⚠️  JWT_SECRET_KEY 使用了默认值！请在 .env 中设置强随机密钥。")
    if s.DEBUG:
        print("[SECURITY] ⚠️  DEBUG 模式已开启，请勿在生产环境使用。")
    return s