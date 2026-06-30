"""config.py — 项目全局配置"""
import logging
import secrets
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",          # 忽略 .env 中的未知字段
        case_sensitive=False,
    )

    APP_NAME: str = "Profile Mirror"
    DEBUG: bool = False
    SECRET_KEY: str = ""
    BASE_URL: str = "https://api.khanfate.com"
    ALLOWED_ORIGINS: list[str] = [
        "https://khanfate.com", "https://www.khanfate.com",
        # localhost origins are only used in DEBUG mode — overridden at startup
    ]

    DATABASE_URL: str = "sqlite+aiosqlite:///./destiny_dev.db"
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001

    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.deepseek.com"
    OPENAI_MODEL: str = "deepseek-v4-flash"     # 付费模型 — workers + master 深度解析
    MASTER_FAST_MODEL: str = "deepseek-v4-flash"  # Master子任务快速模型
    PREMIUM_MODEL: str = "deepseek-v4-pro"      # 付费模型 — 付费用户 master 深度解析
    AGENT_TEMPERATURE: float = 0.3
    AGENT_MAX_TOKENS: int = 8192
    MASTER_FAST_MODEL_MAX_TOKENS: int = 16384  # 子任务模型输出上限（英文模式需要更多token）
    WORKER_MAX_TOKENS: int = 1024   # 优化：从1536降至1024，worker分析素材不需要那么多
    ZIWEI_MODEL: str = ""            # 空=使用默认OPENAI_MODEL；可单独指定更快模型

    # ── Worker timeouts (seconds) — can be overridden per environment ──
    ASTROLOGY_WORKER_TIMEOUT: int = 120
    TAROT_WORKER_TIMEOUT: int = 100
    BAZI_WORKER_TIMEOUT: int = 100
    QIMEN_ZIWEI_WORKER_TIMEOUT: int = 200
    FACE_WORKER_TIMEOUT: int = 100
    PALM_WORKER_TIMEOUT: int = 100

    # ── 免费模型（追问等低频场景使用）──
    FREE_MODEL_API_KEY: str = ""                 # 空则复用 OPENAI_API_KEY
    FREE_MODEL_BASE_URL: str = ""                # 空则复用 OPENAI_BASE_URL (DeepSeek)
    FREE_MODEL: str = "deepseek-v4-flash"        # 追问模型 — 与主模型同款，保证质量
    FREE_MODEL_MAX_TOKENS: int = 4096            # 免费模型输出上限

    JWT_SECRET_KEY: str = ""  # 空字符串，必须配置
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ── Stripe ──
    STRIPE_ENABLED: bool = False
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_SUCCESS_URL: str = ""  # e.g. https://khanfate.com/payment?stripe=success
    STRIPE_CANCEL_URL: str = ""   # e.g. https://khanfate.com/payment?stripe=cancelled

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
    KUAI_DI100_API_KEY: str = ""
    CNY_TO_USD_RATE: float = 7.0
    SMTP_FROM_NAME: str = "Profile Mirror"

    # ── Cron / 定时任务 ──
    CRON_SECRET: str = ""

    # ── Admin 管理员邮箱（自动获得创始会员权限，逗号分隔）──
    ADMIN_EMAILS: str = ""

    # ── CJ Dropshipping ──
    CJ_API_ENABLED: bool = False
    CJ_API_KEY: str = ""                  # 直接使用 API Key（优先于 email/password）
    CJ_API_EMAIL: str = ""
    CJ_API_PASSWORD: str = ""
    CJ_WEBHOOK_SECRET: str = ""

    # ── Redis (distributed state: rate limits, session store, token blacklist) ──
    REDIS_URL: str = ""                # e.g. "redis://localhost:6379/0" — empty = in-memory fallback

    # ── Google OAuth ──
    GOOGLE_CLIENT_ID: str = ""         # Google Cloud Console OAuth 2.0 Client ID


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    # ── Startup security warnings ──────────────────────────────────────
    import sys, io
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    _default_secrets = {
        "change-me-in-production",
        "change-me-to-a-random-32-char-string",
        "alpha-mirror-jwt-secret-dev-key-2025",
    }
    if not s.SECRET_KEY or s.SECRET_KEY in _default_secrets or s.SECRET_KEY.startswith("change-me"):
        s.SECRET_KEY = secrets.token_hex(32)
        logger.warning("SECRET_KEY not set — auto-generated. Set in .env to avoid session loss on restart.")
    if not s.JWT_SECRET_KEY or s.JWT_SECRET_KEY in _default_secrets or s.JWT_SECRET_KEY.startswith("change-me"):
        # SECURITY NOTE: The JWT secret is persisted to .jwt_secret so that backend
        # restarts (PM2, Vercel deployments) don't invalidate all user sessions.
        # Trade-off: if an attacker gains read access to the filesystem, they can
        # forge JWTs. Mitigations:
        #   1. File is chmod 0o600 (owner-only read/write)
        #   2. .jwt_secret is in .gitignore and never committed
        #   3. For production, set JWT_SECRET_KEY in .env to avoid file-based storage entirely
        # Auto-generate a random secret and PERSIST it to a file so that
        # backend restarts (PM2, deploy) don't invalidate all existing tokens.
        _jwt_key_file = Path(__file__).parent / ".jwt_secret"
        try:
            if _jwt_key_file.exists():
                # SECURITY: Verify file permissions are secure (owner-only)
                import os
                file_stat = _jwt_key_file.stat()
                file_mode = oct(file_stat.st_mode)[-3:]
                if file_mode != "600":
                    logger.warning(f".jwt_secret has insecure permissions ({file_mode}), fixing...")
                    _jwt_key_file.chmod(0o600)
                s.JWT_SECRET_KEY = _jwt_key_file.read_text().strip()
                logger.info("JWT_SECRET_KEY loaded from .jwt_secret (persistent across restarts, secret_len=%d)", len(s.JWT_SECRET_KEY))
            else:
                s.JWT_SECRET_KEY = secrets.token_hex(32)
                _jwt_key_file.write_text(s.JWT_SECRET_KEY)
                _jwt_key_file.chmod(0o600)  # owner-only read/write
                logger.info("JWT_SECRET_KEY auto-generated and saved to .jwt_secret (secret_len=%d)", len(s.JWT_SECRET_KEY))
        except Exception as e:
            s.JWT_SECRET_KEY = secrets.token_hex(32)
            logger.warning("JWT_SECRET_KEY generated but failed to save to file (%s) — will reset on restart (secret_len=%d)", e, len(s.JWT_SECRET_KEY))
    else:
        logger.info("JWT_SECRET_KEY loaded from .env (secret_len=%d)", len(s.JWT_SECRET_KEY))
    if s.DEBUG:
        logger.warning("DEBUG mode is ON — do not use in production.")
    return s

