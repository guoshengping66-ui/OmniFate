"""backend/main.py — FastAPI 应用入口"""
import sys
import os
import json
import re
import traceback
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


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Log all unhandled exceptions to help debug Vercel 500 errors."""
    tb = traceback.format_exception(type(exc), exc, exc.__traceback__)
    print(f"[ERROR] {request.method} {request.url.path}: {''.join(tb)}")
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
    "/api/fortune/daily": 3600,    # 每日运势 - 1 hour
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
            lang = _get_lang_from_request(request)
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later." if lang == "en" else "请求过于频繁，请稍后再试"},
            )

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
            new_body = json.dumps(data, ensure_ascii=False).encode("utf-8")
            return JSONResponse(
                status_code=response.status_code,
                content=data,
                headers=dict(response.headers),
            )
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass

        return Response(
            content=body,
            status_code=response.status_code,
            headers=dict(response.headers),
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

    # Cache successful JSON responses only (skip if body > 256KB to avoid memory bloat)
    MAX_CACHE_BODY = 256 * 1024  # 256KB
    if response.status_code == 200:
        body = b""
        total = 0
        too_large = False
        async for chunk in response.body_iterator:
            if isinstance(chunk, str):
                chunk = chunk.encode("utf-8")
            total += len(chunk)
            if total > MAX_CACHE_BODY:
                too_large = True
                break
            body += chunk
        if too_large:
            # Response too large to cache, return original
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