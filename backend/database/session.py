"""database/session.py — 兼容 SQLite 开发模式 & PostgreSQL 生产模式"""
import asyncio
import logging
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool, NullPool
from config import get_settings

logger = logging.getLogger(__name__)
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
    # ── PostgreSQL pool tuning ──
    # pool_size=20: handles ~20 concurrent requests. Vercel serverless instances
    # each get their own pool, so 20 is generous for a single worker.
    # max_overflow=10: allows burst up to 30 connections for LLM-heavy endpoints.
    # pool_recycle=3600: prevents stale connections from PgBouncer/CloudSQL timeouts.
    # If you see "connection pool exhausted", increase pool_size or reduce LLM timeouts.
    _kw["pool_size"] = 20          # Persistent connections
    _kw["max_overflow"] = 10       # Temporary overflow connections
    _kw["pool_recycle"] = 3600     # Recycle connections after 1 hour

engine = create_async_engine(_database_url, **_kw)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

_db_available = None  # cached availability check
_db_last_check = 0.0   # timestamp of last check
_DB_CHECK_INTERVAL = 30  # recheck every 30s if previously failed
_tables_created = False  # ensure tables are created once per cold start
_founder_reset_done = False  # one-time founder data cleanup


async def _check_db_available() -> bool:
    """Quick check if database is reachable (10s timeout). Rechecks periodically if previously failed."""
    global _db_available, _db_last_check
    import time
    now = time.time()
    # If previously available, trust cached result for 30s
    # If previously unavailable, recheck every 30s to detect recovery
    if _db_available is not None and (now - _db_last_check) < _DB_CHECK_INTERVAL:
        return _db_available
    try:
        await asyncio.wait_for(
            _do_db_check(), timeout=10
        )
    except Exception as ex:
        _db_available = False
        logger.warning("Database not available: %s, running in stateless mode", ex)
    _db_last_check = now
    return _db_available


async def _do_db_check():
    global _db_available
    async with AsyncSessionLocal() as session:
        await session.execute(text("SELECT 1"))
    _db_available = True


_migrate_lock = asyncio.Lock()


async def _ensure_tables():
    """Create all tables if they don't exist (safe for SQLite on Vercel)."""
    global _tables_created
    if _tables_created:
        return
    async with _migrate_lock:
        if _tables_created:  # Double-check after acquiring lock
            return
        try:
            from database.models import Base
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            _tables_created = True
            logger.info("Tables ensured")
            # Auto-migrate: add missing columns to users & readings tables
            await _migrate_readings_columns()
        except Exception as e:
            logger.error("Failed to ensure tables: %s", e)


async def _add_columns(db, table: str, columns: list[tuple[str, str]]) -> None:
    """Add columns to a table. PostgreSQL uses IF NOT EXISTS; SQLite catches duplicates."""
    for col_name, col_type in columns:
        try:
            if _is_sqlite:
                await db.execute(text(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}"))
            else:
                await db.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
        except Exception:
            pass  # Column already exists


async def _migrate_readings_columns():
    """Add missing columns to users, readings, divination_records & orders tables."""
    user_columns = [
        ("is_founder", "BOOLEAN DEFAULT FALSE"),
        ("founder_seat_no", "INTEGER"),
        ("founder_region", "VARCHAR(10)"),
        ("founder_activated_at", "TIMESTAMPTZ"),
        ("stardust_balance", "INTEGER DEFAULT 0"),
        ("stardust_lifetime_earned", "INTEGER DEFAULT 0"),
        ("referral_code", "VARCHAR(8)"),
        ("referred_by", "VARCHAR(36)"),
    ]
    reading_columns = [
        ("qimen_report", "TEXT"),
        ("ziwei_report", "TEXT"),
        ("palm_report", "TEXT"),
        ("dimension_scores", "JSON"),
        ("computed_tags", "JSON"),
        ("recommended_product_ids", "JSON"),
        ("face_analysis_text", "TEXT"),
        ("partner_face_report", "TEXT"),
        ("partner_palm_report", "TEXT"),
        ("is_detailed_unlocked", "BOOLEAN DEFAULT FALSE"),
    ]
    divination_columns = [
        ("ai_insight", "TEXT"),
    ]
    order_columns = [
        ("item_type", "VARCHAR(50)"),
        ("refund_reason", "TEXT"),
        ("refund_amount", "NUMERIC(10,2)"),
        ("refund_note", "TEXT"),
        ("refund_requested_at", "TIMESTAMPTZ"),
        ("refund_processed_at", "TIMESTAMPTZ"),
        ("cj_order_number", "VARCHAR(100)"),
        ("cj_order_status", "VARCHAR(50)"),
        ("cj_shipping_cost", "NUMERIC(10,2)"),
        ("cj_response", "JSON"),
        ("fulfilled_via", "VARCHAR(20)"),
        ("confirm_token", "VARCHAR(64)"),
        ("confirm_expires", "TIMESTAMPTZ"),
        ("admin_confirm_token", "VARCHAR(64)"),
        ("admin_confirm_expires", "TIMESTAMPTZ"),
    ]

    try:
        async with AsyncSessionLocal() as db:
            await _add_columns(db, "users", user_columns)
            await _add_columns(db, "readings", reading_columns)
            await _add_columns(db, "divination_records", divination_columns)
            await _add_columns(db, "orders", order_columns)
            await db.commit()
            logger.info("Migration: ensured user, reading & order columns")
    except Exception as e:
        logger.warning("Migration warning: %s", e)

    # Clean up test founder data: reset is_founder for users without seat_no
    global _founder_reset_done
    if _founder_reset_done:
        return
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(text(
                "UPDATE users SET is_founder = false WHERE is_founder = true "
                "AND (founder_seat_no IS NULL OR founder_activated_at IS NULL)"
            ))
            if result.rowcount > 0:
                logger.info("Cleaned up %d test founder records", result.rowcount)
            await db.commit()
    except Exception:
        pass
    _founder_reset_done = True


async def get_db():
    if not await _check_db_available():
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="数据库暂不可用，请稍后再试")
    await _ensure_tables()
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()