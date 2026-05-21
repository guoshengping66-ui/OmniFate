"""backend/main.py — FastAPI 应用入口"""
import sys
import os
import json
import traceback
sys.path.insert(0, os.path.dirname(__file__))

import ipaddress
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from config import get_settings
from api.routers import readings, users, products, payments, auth, blog, personal_payments, credits, divination, cron, referrals, billing

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时自动建表（开发/生产均可）
    try:
        from database.session import engine
        from database.models import Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[WARN] 数据库初始化失败: {e}")

    # Pre-download Skyfield ephemeris to /tmp so analysis doesn't block on first request
    import os
    skyfield_dir = "/tmp/skyfield" if os.path.exists("/tmp") else os.path.expanduser("~/.skyfield")
    os.environ["SKYFIELD_DATA"] = skyfield_dir
    os.makedirs(skyfield_dir, exist_ok=True)
    try:
        from skyfield.api import load as sky_load
        sky_load("de421.bsp")
        print(f"[OK] Skyfield ephemeris ready at {skyfield_dir}")
    except Exception as e:
        print(f"[WARN] Skyfield ephemeris preload failed: {e}")

    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="全维度命理分析平台 API",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# GZip compression — reduces response size ~3-5x (e.g. 5KB → 1-2KB)
app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Log all unhandled exceptions to help debug Vercel 500 errors."""
    tb = traceback.format_exception(type(exc), exc, exc.__traceback__)
    print(f"[ERROR] {request.method} {request.url.path}: {''.join(tb)}")
    # Never expose internal error details to clients — use a generic message
    return JSONResponse(
        status_code=500,
        content={"detail": "服务器内部错误，请稍后重试"},
    )

# ── Enhanced rate limiter with endpoint-specific limits ──────────────────────
# Uses Redis when REDIS_URL is configured, otherwise in-memory per-process.
from services.rate_limiter import check_rate_limit

RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 60     # requests per window (global)

# Endpoint-specific rate limits (requests per minute)
ENDPOINT_LIMITS = {
    "/api/readings": 5,           # 排盘分析 - 最贵的 API，严格限制
    "/api/readings/chat": 10,     # 推命问答
    "/api/divination": 10,        # 推命
    "/api/auth/login": 5,         # 登录
    "/api/auth/register": 3,      # 注册
    "/api/auth/send-code": 2,     # 验证码
    "/api/payments": 20,          # 支付
    "/api/credits": 30,           # 星尘
    "/api/billing/verify-tx": 5,  # USDT verification - prevent brute force
    "/api/webhooks/paypal": 10,   # PayPal webhooks - prevent spam
}


def _get_client_ip(request: Request) -> str:
    """Get client IP from trusted sources only."""
    # When behind Nginx reverse proxy, Nginx sets X-Real-IP
    # Only trust this if we're behind our known proxy
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        # Validate it looks like an IP (basic sanity check)
        try:
            ipaddress.ip_address(real_ip.split(",")[0].strip())
            return real_ip.split(",")[0].strip()
        except ValueError:
            pass

    # Fallback to direct client connection
    return request.client.host if request.client else "unknown"

# Cyberpunk-style rate limit error message
RATE_LIMIT_MESSAGE = json.dumps({
    "detail": "System Core Overheated. Please align your temporal node or upgrade to Premium Access.",
    "error_code": "RATE_LIMIT_EXCEEDED",
    "retry_after_seconds": 60,
})


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Only rate-limit API endpoints
    if request.url.path.startswith("/api/"):
        client_ip = _get_client_ip(request)
        path = request.url.path

        # Check endpoint-specific limits first (higher priority)
        limit = ENDPOINT_LIMITS.get(path)
        if limit:
            if await check_rate_limit(f"ep:{client_ip}:{path}", limit, RATE_LIMIT_WINDOW):
                return JSONResponse(
                    status_code=429,
                    content=json.loads(RATE_LIMIT_MESSAGE),
                    headers={"Retry-After": "60"},
                )

        # Global rate limit
        if await check_rate_limit(f"global:{client_ip}", RATE_LIMIT_MAX, RATE_LIMIT_WINDOW):
            return JSONResponse(
                status_code=429,
                content={"detail": "请求过于频繁，请稍后再试"},
            )

    return await call_next(request)


app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(users.router,    prefix="/api/users",    tags=["Users"])
app.include_router(readings.router, prefix="/api/readings", tags=["Readings"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(blog.router,     prefix="/api/blog",     tags=["Blog"])
app.include_router(personal_payments.router, prefix="/api/personal-payments", tags=["Personal Payments"])
app.include_router(credits.router, prefix="/api/credits", tags=["Credits"])
app.include_router(divination.router, prefix="/api/divination", tags=["Divination"])
app.include_router(cron.router, prefix="/api/cron", tags=["Cron"])
app.include_router(referrals.router, prefix="/api/referrals", tags=["Referrals"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing"])
app.include_router(billing.webhook_router, prefix="/api/webhooks", tags=["Webhooks"])


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "app": settings.APP_NAME, "deploy_test": "v2"}