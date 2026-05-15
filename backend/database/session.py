"""database/session.py — 兼容 SQLite 开发模式 & PostgreSQL 生产模式"""
import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool, NullPool
from config import get_settings

settings = get_settings()
_database_url = settings.DATABASE_URL

# On Vercel (serverless), use /tmp for SQLite since the working directory is read-only
_is_vercel = os.environ.get("VERCEL") == "1"
if _is_vercel and _database_url.startswith("sqlite"):
    _database_url = "sqlite+aiosqlite:////tmp/destiny.db"

_is_sqlite = _database_url.startswith("sqlite")

_kw: dict = {"echo": settings.DEBUG}
if _is_sqlite:
    _kw["connect_args"] = {"check_same_thread": False, "timeout": 10}
    # Use NullPool on Vercel to avoid StaticPool connection reuse issues
    _kw["poolclass"] = NullPool if _is_vercel else StaticPool
else:
    _kw["pool_pre_ping"] = True
    _kw["pool_timeout"] = 10

engine = create_async_engine(_database_url, **_kw)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

_db_available = None  # cached availability check
_tables_created = False  # ensure tables are created once per cold start


async def _check_db_available() -> bool:
    """Quick check if database is reachable (10s timeout)."""
    global _db_available
    if _db_available is not None:
        return _db_available
    try:
        await asyncio.wait_for(
            _do_db_check(), timeout=10
        )
    except Exception as ex:
        _db_available = False
        print(f"[DB] Database not available: {ex}, running in stateless mode")
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
        # Auto-migrate: add missing columns to readings table
        if _is_sqlite:
            await _migrate_readings_columns()
    except Exception as e:
        print(f"[DB] Failed to ensure tables: {e}")


async def _migrate_readings_columns():
    """Add missing columns to readings table for SQLite (no-op if column exists)."""
    new_columns = [
        ("qimen_report", "TEXT"),
        ("ziwei_report", "TEXT"),
        ("palm_report", "TEXT"),
        ("dimension_scores", "JSON"),
    ]
    try:
        async with AsyncSessionLocal() as db:
            for col_name, col_type in new_columns:
                try:
                    await db.execute(text(
                        f"ALTER TABLE readings ADD COLUMN {col_name} {col_type}"
                    ))
                    print(f"[DB] Added column readings.{col_name}")
                except Exception:
                    pass  # Column already exists
            await db.commit()
    except Exception as e:
        print(f"[DB] Migration warning: {e}")


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