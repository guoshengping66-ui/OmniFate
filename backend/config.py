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
    MASTER_FAST_MODEL: str = "deepseek-v4-flash"  # Master子任务快速模型
    PREMIUM_MODEL: str = "deepseek-v4-pro"      # 付费模型 — 付费用户 master 深度解析
    AGENT_TEMPERATURE: float = 0.3
    AGENT_MAX_TOKENS: int = 4096
    WORKER_MAX_TOKENS: int = 1536   # 比 master 少一半——worker 只需提供分析素材
    ZIWEI_MODEL: str = ""            # 空=使用默认OPENAI_MODEL；可单独指定更快模型

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

    # ── SMTP 邮件配置 ──
    SMTP_HOST: str = ""
    SMTP_PORT: int = 465
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = ""
    SMTP_FROM_NAME: str = "命盘智镜"

    # ── Cron / 定时任务 ──
    CRON_SECRET: str = ""

    # ── 个人收款码 ──
    ALIPAY_PERSONAL_QR_URL: str = ""
    WECHAT_PERSONAL_QR_URL: str = ""
    PAYPAL_PERSONAL_QR_URL: str = ""
    PAYPAL_PERSONAL_EMAIL: str = ""

    # ── Admin 管理员邮箱（自动获得创始会员权限，逗号分隔）──
    ADMIN_EMAILS: str = ""


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    # ── Startup security warnings ──────────────────────────────────────
    import sys, io
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    if s.SECRET_KEY == "change-me-in-production":
        print("[SECURITY] WARNING: SECRET_KEY uses default value! Set a strong key in .env.")
    if s.JWT_SECRET_KEY == "alpha-mirror-jwt-secret-dev-key-2025":
        print("[SECURITY] WARNING: JWT_SECRET_KEY uses default value! Set a strong key in .env.")
    if s.DEBUG:
        print("[SECURITY] WARNING: DEBUG mode is ON -- do not use in production.")
    return s