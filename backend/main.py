"""backend/main.py — FastAPI 应用入口"""
import time
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from backend.config import get_settings
from backend.api.routers import readings, users, products, payments, auth

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时自动建表（开发/生产均可）
    try:
        from backend.database.session import engine
        from backend.database.models import Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[WARN] 数据库初始化失败: {e}")

    # 预下载 Skyfield 星历表（de421.bsp, ~17MB），避免首次请求时卡住
    import os
    skyfield_dir = "/tmp/skyfield" if os.path.exists("/tmp") else os.path.expanduser("~/.skyfield")
    os.environ["SKYFIELD_DATA"] = skyfield_dir
    os.makedirs(skyfield_dir, exist_ok=True)
    try:
        from skyfield.api import load as sky_load
        sky_load("de421.bsp")
        print(f"[OK] Skyfield ephemeris loaded from {skyfield_dir}")
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
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Simple in-memory rate limiter ───────────────────────────────────────────
_rate_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 30     # requests per window (global)
_last_cleanup: float = 0.0


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    global _last_cleanup
    # Only rate-limit API endpoints
    if request.url.path.startswith("/api/"):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - RATE_LIMIT_WINDOW

        # Periodically purge stale IPs to prevent memory leak
        if now - _last_cleanup > RATE_LIMIT_WINDOW * 10:
            stale_ips = [ip for ip, times in _rate_store.items() if not times or times[-1] <= window_start]
            for ip in stale_ips:
                del _rate_store[ip]
            _last_cleanup = now

        # Clean old entries for this client
        _rate_store[client_ip] = [t for t in _rate_store[client_ip] if t > window_start]
        if len(_rate_store[client_ip]) >= RATE_LIMIT_MAX:
            return JSONResponse(
                status_code=429,
                content={"detail": "请求过于频繁，请稍后再试"},
            )
        _rate_store[client_ip].append(now)
    return await call_next(request)


app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(users.router,    prefix="/api/users",    tags=["Users"])
app.include_router(readings.router, prefix="/api/readings", tags=["Readings"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}