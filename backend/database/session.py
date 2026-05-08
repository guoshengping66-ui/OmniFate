"""database/session.py — 兼容 SQLite 开发模式 & PostgreSQL 生产模式"""
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool
from config import get_settings

settings = get_settings()
_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

_kw: dict = {"echo": settings.DEBUG}
if _is_sqlite:
    _kw["connect_args"] = {"check_same_thread": False, "timeout": 5}
    _kw["poolclass"]    = StaticPool
else:
    _kw["pool_pre_ping"] = True
    _kw["pool_timeout"] = 5

engine = create_async_engine(settings.DATABASE_URL, **_kw)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

_db_available = None  # cached availability check
_tables_created = False  # ensure tables are created once per cold start


async def _check_db_available() -> bool:
    """Quick check if database is reachable (5s timeout)."""
    global _db_available
    if _db_available is not None:
        return _db_available
    try:
        await asyncio.wait_for(
            _do_db_check(), timeout=5
        )
    except (asyncio.TimeoutError, Exception):
        _db_available = False
        print("[DB] Database not available, running in stateless mode")
    return _db_available


async def _do_db_check():
    global _db_available
    async with AsyncSessionLocal() as session:
        await session.execute(text("SELECT 1"))
    _db_available = True


async def _ensure_tables():
    """Create all tables if they don't exist (safe for SQLite on Vercel)."""
    global _tables_created
    if _tables_created:
        return
    try:
        from database.models import Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        _tables_created = True
        print("[DB] Tables ensured")
    except Exception as e:
        print(f"[DB] Failed to ensure tables: {e}")


async def get_db():
    if not await _check_db_available():
        yield None
        return
    await _ensure_tables()
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()