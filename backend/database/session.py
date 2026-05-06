"""database/session.py — 兼容 SQLite 开发模式 & PostgreSQL 生产模式"""
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool
from backend.config import get_settings
import traceback

settings = get_settings()
_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

_kw: dict = {"echo": settings.DEBUG}
if _is_sqlite:
    _kw["connect_args"] = {"check_same_thread": False}
    _kw["poolclass"]    = StaticPool
else:
    _kw["pool_pre_ping"] = True

engine = create_async_engine(settings.DATABASE_URL, **_kw)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

_db_available = None  # cached availability check


async def _check_db_available() -> bool:
    """Quick check if database is reachable."""
    global _db_available
    if _db_available is not None:
        return _db_available
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(__import__("sqlalchemy").text("SELECT 1"))
        _db_available = True
    except Exception:
        _db_available = False
        print("[DB] Database not available, running in stateless mode")
    return _db_available


async def get_db():
    if not await _check_db_available():
        yield None
        return
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()