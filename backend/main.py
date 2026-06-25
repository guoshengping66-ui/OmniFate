"""backend/main.py — FastAPI 应用入口"""
import sys
import os
import json
import logging
import re
import traceback

logger = logging.getLogger(__name__)
# Ensure backend/ is on sys.path so absolute imports work when uvicorn
# is launched from a parent directory (e.g. `uvicorn backend.main:app`).
# Can be removed once the project uses a proper package structure (pyproject.toml).
sys.path.insert(0, os.path.dirname(__file__))

import ipaddress
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, Response
from contextlib import asynccontextmanager

from config import get_settings
from api.routers import readings, users, products, payments, auth, blog, personal_payments, credits, divination, cron, referrals, billing, contact, fortune, events

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
        logger.warning("Database init failed: %s", e)

    # ── Production safety: require Redis for rate limiting in multi-worker setup ──
    if not settings.DEBUG and not settings.REDIS_URL:
        import multiprocessing
        # PM2 typically runs in cluster mode (multiple workers/cores)
        # Without Redis, rate limits are per-worker and trivially bypassable
        logger.critical(
            "PRODUCTION WARNING: REDIS_URL is not set. Rate limiting uses "
            "in-memory per-worker storage — an attacker can bypass all rate "
            "limits by hitting different workers. Configure REDIS_URL for production."
        )
        # NOTE: We don't refuse to start — some deployments use single-worker
        # PM2 or have external rate limiting (nginx/Cloudflare). The warning
        # is logged at CRITICAL level so it's visible in monitoring.

    # Pre-download Skyfield ephemeris to /tmp so analysis doesn't block on first request
    import os
    skyfield_dir = "/tmp/skyfield" if os.path.exists("/tmp") else os.path.expanduser("~/.skyfield")
    os.environ["SKYFIELD_DATA"] = skyfield_dir
    os.makedirs(skyfield_dir, exist_ok=True)
    try:
        from skyfield.api import load as sky_load
        sky_load("de421.bsp")
        logger.info("Skyfield ephemeris ready at %s", skyfield_dir)
    except Exception as e:
        logger.warning("Skyfield ephemeris preload failed: %s", e)

    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="全维度个人分析平台 API",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False,
    docs_url=None if not settings.DEBUG else "/docs",
    redoc_url=None if not settings.DEBUG else "/redoc",
)

# Build allowed origins — localhost only in DEBUG mode to prevent
# local processes from making credentialed requests in production
_ALLOWED_ORIGINS = list(settings.ALLOWED_ORIGINS)
if settings.DEBUG:
    _ALLOWED_ORIGINS.extend(["http://localhost:3000", "http://localhost:3001"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
)

# GZip compression — reduces response size ~3-5x (e.g. 5KB → 1-2KB)
app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# ── CSRF Protection Middleware ────────────────────────────────────────────────
# Require X-Requested-With header on state-changing requests (POST/PUT/DELETE/PATCH).
# This prevents CSRF attacks because:
# 1. HTML forms cannot set custom headers (no preflight)
# 2. CORS blocks cross-origin JS from sending this header without explicit allowlist
# Exemptions: payment callbacks (WeChat/Alipay), webhooks, SSE — these use other auth.
CSRF_EXEMPT_PATHS = [
    "/api/payments/wechat/notify",  # WeChat callback (XML signature verified)
    "/api/payments/alipay/notify",  # Alipay callback (signature verified)
    "/api/webhooks/",               # Webhook endpoints (verify signature)
    "/api/cron/",                   # Cron jobs (secret key verified)
    "/api/auth/login",              # Login — password-protected, no CSRF risk
    "/api/auth/register",           # Register — rate-limited, no CSRF risk
    "/api/auth/refresh",            # Refresh — token-based, no CSRF risk
]


@app.middleware("http")
async def csrf_protection(request: Request, call_next):
    # Only check state-changing methods
    if request.method in ("POST", "PUT", "DELETE", "PATCH"):
        path = request.url.path

        # Skip exempt paths (they use signature verification instead)
        if any(path.startswith(exempt) for exempt in CSRF_EXEMPT_PATHS):
            return await call_next(request)

        # Check for X-Requested-With header (must be "XMLHttpRequest" or "nextjs-action")
        # "fetch" is excluded — it's trivially forgeable by attacker scripts
        x_requested_with = request.headers.get("x-requested-with", "")
        if x_requested_with not in ("XMLHttpRequest", "nextjs-action"):
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=403,
                content={"detail": "CSRF validation failed: missing X-Requested-With header"},
            )

    return await call_next(request)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Log all unhandled exceptions to help debug Vercel 500 errors."""
    tb = traceback.format_exception(type(exc), exc, exc.__traceback__)
    logger.error("%s %s: %s", request.method, request.url.path, ''.join(tb))
    # Never expose internal error details to clients — use a generic message
    lang = _get_lang_from_request(request)
    detail = "Internal server error. Please try again later." if lang == "en" else "服务器内部错误，请稍后重试"
    return JSONResponse(
        status_code=500,
        content={"detail": detail},
    )

# ── Enhanced rate limiter with endpoint-specific limits ──────────────────────
# Uses Redis when REDIS_URL is configured, otherwise in-memory per-process.
from services.rate_limiter import check_rate_limit
from utils.network import get_client_ip as _get_client_ip

RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 60     # requests per window (global)

# Endpoint-specific rate limits (requests per minute)
ENDPOINT_LIMITS = {
    "/api/readings": 5,           # 分析报告 - 最贵的 API，严格限制
    "/api/readings/chat": 10,     # 追问问答
    "/api/divination": 10,        # 每日分析
    "/api/auth/login": 5,         # 登录
    "/api/auth/register": 3,      # 注册
    "/api/auth/send-code": 2,     # 验证码
    "/api/payments": 20,          # 支付
    "/api/credits": 30,           # 星尘
    "/api/billing/verify-tx": 5,  # USDT verification - prevent brute force
    "/api/webhooks/paypal": 10,   # PayPal webhooks - prevent spam
    "/api/webhooks/cj": 10,       # CJ Dropshipping webhooks
}

# ── Response cache for public GET endpoints ──────────────────────────────────
# Caches responses in Redis (or in-memory fallback) to reduce DB/JSON reads.
# Only caches GET requests without Authorization header.
from services.cache import cache_get_json, cache_set_json

# Endpoints to cache: path -> TTL in seconds
CACHE_ENDPOINTS = {
    "/api/products": 300,          # 商品列表 - 5 min
    "/api/products/match": 0,      # 商品匹配 - 不缓存 (POST)
    "/api/fortune/daily": 3600,    # 每日分析 - 1 hour
}


# Cyberpunk-style rate limit error message
RATE_LIMIT_MESSAGE_ENDPOINT = json.dumps({
    "detail": "System Core Overheated. Please align your temporal node or upgrade to Premium Access.",
    "error_code": "RATE_LIMIT_EXCEEDED",
    "retry_after_seconds": 60,
})


def _rate_limit_response(lang: str, retry_after: int = 60) -> JSONResponse:
    """Return a rate limit response with proper i18n."""
    if lang == "en":
        detail = "Too many requests. Please try again later."
    else:
        detail = "请求过于频繁，请稍后再试"
    return JSONResponse(
        status_code=429,
        content={"detail": detail},
        headers={"Retry-After": str(retry_after)},
    )


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Only rate-limit API endpoints
    if request.url.path.startswith("/api/"):
        client_ip = _get_client_ip(request)
        path = request.url.path

        # Determine rate limit key — use user_id for authenticated requests
        # to prevent one user's abuse from affecting others.
        # Only verify JWT for endpoint-specific limits to avoid double verification.
        rate_key_prefix = f"ip:{client_ip}"

        # Check endpoint-specific limits first (higher priority)
        limit = ENDPOINT_LIMITS.get(path)
        if limit:
            # Verify JWT only when we have an endpoint-specific limit
            auth_header = request.headers.get("authorization", "")
            if auth_header.startswith("Bearer "):
                try:
                    from auth.jwt import verify_token as _verify_token
                    user_id = await _verify_token(auth_header[7:])
                    if user_id:
                        rate_key_prefix = f"user:{user_id}"
                except Exception:
                    pass

            if await check_rate_limit(f"ep:{rate_key_prefix}:{path}", limit, RATE_LIMIT_WINDOW):
                return _rate_limit_response(_get_lang_from_request(request))

        # Global rate limit
        if await check_rate_limit(f"global:{rate_key_prefix}", RATE_LIMIT_MAX, RATE_LIMIT_WINDOW):
            return _rate_limit_response(_get_lang_from_request(request))

    return await call_next(request)


# ── Error message translation middleware ───────────────────────────────────
# When lang=en is passed as a query parameter, translate known Chinese
# error messages to English in JSON error responses.
# Translations loaded from i18n/error_messages.json for easier maintenance.

import json as _json
from pathlib import Path as _Path

_error_i18n_path = _Path(__file__).parent / "i18n" / "error_messages.json"
try:
    with open(_error_i18n_path, "r", encoding="utf-8") as _f:
        _error_i18n_data = _json.load(_f)
    _ERROR_TRANSLATIONS: dict[str, str] = _error_i18n_data.get("en", {})
except Exception:
    # Fallback to empty dict if file not found
    _ERROR_TRANSLATIONS = {}

# Longer pattern translations (for messages with variable parts)
_ERROR_PATTERN_TRANSLATIONS = [
    (r"登录尝试次数过多，请 (\d+) 秒后再试", r"Too many login attempts. Please try again in \1 seconds."),
    (r"密码强度不足：(.+)", r"Password does not meet requirements: \1"),
]

_RE_CHINESE = re.compile(r"[一-鿿]")


def _get_lang_from_request(request: Request) -> str:
    lang = request.query_params.get("lang", "")
    if lang in ("zh", "en"):
        return lang
    accept = request.headers.get("accept-language", "")
    if accept.startswith("en"):
        return "en"
    return "zh"


def _translate_error_text(text: str) -> str:
    """Translate a single error text from Chinese to English."""
    if not text or not _RE_CHINESE.search(text):
        return text
    # Try exact match first
    if text in _ERROR_TRANSLATIONS:
        return _ERROR_TRANSLATIONS[text]
    # Try pattern matches
    for pattern, replacement in _ERROR_PATTERN_TRANSLATIONS:
        new_text = re.sub(pattern, replacement, text)
        if new_text != text:
            return new_text
    return text


def _translate_error_detail(detail):
    """Translate error detail in a response body dict."""
    if isinstance(detail, str):
        return _translate_error_text(detail)
    if isinstance(detail, list):
        return [_translate_error_text(item) if isinstance(item, str) else item for item in detail]
    return detail


@app.middleware("http")
async def error_translation_middleware(request: Request, call_next):
    lang = _get_lang_from_request(request)

    # Store lang in request state so endpoints can access it if needed
    request.state.lang = lang

    response = await call_next(request)

    # Only translate error responses (4xx/5xx) when lang=en
    if lang == "en" and response.status_code >= 400:
        # Read the response body (limit to 64KB to prevent memory issues)
        body = b""
        body_limit = 65536
        async for chunk in response.body_iterator:
            if isinstance(chunk, str):
                body += chunk.encode("utf-8")
            else:
                body += chunk
            if len(body) > body_limit:
                break

        try:
            data = json.loads(body)
            if "detail" in data:
                data["detail"] = _translate_error_detail(data["detail"])
            # Create fresh JSONResponse — do NOT copy headers from the old response
            # because Content-Length/Content-Type from the old body would mismatch.
            return JSONResponse(
                status_code=response.status_code,
                content=data,
            )
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass

        # Fallback: return body as-is (no header copy to avoid Content-Length mismatch)
        return Response(
            content=body,
            status_code=response.status_code,
            media_type="application/json",
        )

    return response


# ── Response cache middleware for public GET endpoints ───────────────────────
# Only caches GET requests without Authorization header (public data).
# Skips streaming responses and non-JSON responses.

@app.middleware("http")
async def cache_middleware(request: Request, call_next):
    # Only cache specific public GET endpoints
    if request.method != "GET":
        return await call_next(request)

    path = request.url.path
    cache_ttl = 0
    for prefix, ttl in CACHE_ENDPOINTS.items():
        if path == prefix or (path.startswith(prefix) and path[len(prefix)] in ("?", "/", "")):
            cache_ttl = ttl
            break

    if cache_ttl <= 0:
        return await call_next(request)

    # Don't cache if user is authenticated (private data may differ)
    if request.headers.get("authorization"):
        return await call_next(request)

    # Build cache key from path + query string
    query = request.url.query or ""
    cache_key = f"{path}:{query}"

    # Try cache
    cached_body = await cache_get_json(cache_key)
    if cached_body is not None:
        return JSONResponse(
            content=cached_body,
            headers={"X-Cache": "HIT", "Cache-Control": f"public, max-age={cache_ttl}"},
        )

    # Execute request
    response = await call_next(request)

    # Never cache streaming responses
    content_type = response.headers.get("content-type", "")
    if "text/event-stream" in content_type:
        return response

    # Cache successful JSON responses only (skip if body > 256KB to avoid memory bloat)
    MAX_CACHE_BODY = 256 * 1024  # 256KB
    if response.status_code == 200:
        # Fast path: use Content-Length header to skip buffering for obviously large responses
        content_length = response.headers.get("content-length")
        if content_length and int(content_length) > MAX_CACHE_BODY:
            return response  # Stream directly without buffering
        body = b""
        async for chunk in response.body_iterator:
            if isinstance(chunk, str):
                chunk = chunk.encode("utf-8")
            body += chunk
            # Incremental check: stop early if already over limit
            if len(body) > MAX_CACHE_BODY:
                return Response(content=body, status_code=200, headers=dict(response.headers))
        try:
            data = json.loads(body)
            await cache_set_json(cache_key, data, ttl=cache_ttl)
            return JSONResponse(
                content=data,
                headers={"X-Cache": "MISS", "Cache-Control": f"public, max-age={cache_ttl}"},
            )
        except (json.JSONDecodeError, UnicodeDecodeError):
            return Response(content=body, status_code=200, headers=dict(response.headers))

    return response


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
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(fortune.router, prefix="/api/fortune", tags=["Fortune"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])

# ── Route alias: 旧前端调用 /api/fate/event-analyze，后端实际在 /api/readings/analyze-event ──
# 在前端新版本部署前临时兼容
from fastapi import APIRouter as _APIRouter
_fate_compat = _APIRouter()
@_fate_compat.post("/event-analyze")
async def _fate_event_analyze_compat(*args, **kwargs):
    """Backward-compat: redirects /api/fate/event-analyze → readings.analyze_event"""
    from api.routers.readings import analyze_event
    return await analyze_event(*args, **kwargs)
app.include_router(_fate_compat, prefix="/api/fate", tags=["Fate-Compat"])


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "app": settings.APP_NAME, "version": "2.2.0", "build": "20260604"}


@app.get("/health/detailed")
async def health_detailed():
    """Deep health check — verifies DB, Redis, and LLM connectivity.
    Only available in DEBUG mode to prevent infrastructure fingerprinting."""
    if not settings.DEBUG:
        return {"status": "ok", "message": "Detailed health check available in debug mode only"}

    checks = {"status": "ok", "checks": {}}

    # Database check
    try:
        from database.session import engine
        import sqlalchemy as _sa
        async with engine.begin() as conn:
            await conn.execute(_sa.text("SELECT 1"))
        checks["checks"]["database"] = "ok"
    except Exception as e:
        checks["checks"]["database"] = f"error: {str(e)[:100]}"
        checks["status"] = "degraded"

    # Redis check
    try:
        from services.redis_client import _get_redis
        r = await _get_redis()
        if r:
            await r.ping()
            checks["checks"]["redis"] = "ok"
        else:
            checks["checks"]["redis"] = "not_configured"
    except Exception as e:
        checks["checks"]["redis"] = f"error: {str(e)[:100]}"
        checks["status"] = "degraded"

    # LLM API check (lightweight)
    try:
        if settings.OPENAI_API_KEY:
            import httpx
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(
                    f"{settings.OPENAI_BASE_URL}/models",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                )
                checks["checks"]["llm_api"] = "ok" if resp.status_code < 500 else f"error: {resp.status_code}"
        else:
            checks["checks"]["llm_api"] = "not_configured"
    except Exception as e:
        checks["checks"]["llm_api"] = f"error: {str(e)[:100]}"
        checks["status"] = "degraded"

    return checks