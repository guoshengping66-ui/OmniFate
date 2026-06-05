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
        print(f"[DB] Database not available: {ex}, running in stateless mode")
    _db_last_check = now
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
        # Auto-migrate: add missing columns to users & readings tables
        await _migrate_readings_columns()
    except Exception as e:
        print(f"[DB] Failed to ensure tables: {e}")


async def _migrate_readings_columns():
    """Add missing columns to users & readings tables (SQLite + PostgreSQL)."""
    # ── Users table: founder, stardust, referral columns ──
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
    # ── Readings table: report + dimension columns ──
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
    # ── Divination records: AI insight column ──
    divination_columns = [
        ("ai_insight", "TEXT"),
    ]
    # ── Orders table: item_type column ──
    order_columns = [
        ("item_type", "VARCHAR(50)"),
    ]

    try:
        async with AsyncSessionLocal() as db:
            for col_name, col_type in user_columns:
                try:
                    await db.execute(text(
                        f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
                    ))
                except Exception:
                    pass  # SQLite doesn't support IF NOT EXISTS, fallback
            for col_name, col_type in reading_columns:
                try:
                    await db.execute(text(
                        f"ALTER TABLE readings ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
                    ))
                except Exception:
                    pass
            for col_name, col_type in divination_columns:
                try:
                    await db.execute(text(
                        f"ALTER TABLE divination_records ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
                    ))
                except Exception:
                    pass
            for col_name, col_type in order_columns:
                try:
                    await db.execute(text(
                        f"ALTER TABLE orders ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
                    ))
                except Exception:
                    pass
            await db.commit()
            print("[DB] Migration: ensured user, reading & order columns")
    except Exception as e:
        print(f"[DB] Migration warning: {e}")

    # ── SQLite fallback: add columns one by one (no IF NOT EXISTS) ──
    if _is_sqlite:
        all_user_cols = user_columns
        all_reading_cols = reading_columns
        try:
            async with AsyncSessionLocal() as db:
                for col_name, col_type in all_user_cols:
                    try:
                        await db.execute(text(
                            f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"
                        ))
                        print(f"[DB] Added column users.{col_name}")
                    except Exception:
                        pass
                for col_name, col_type in all_reading_cols:
                    try:
                        await db.execute(text(
                            f"ALTER TABLE readings ADD COLUMN {col_name} {col_type}"
                        ))
                        print(f"[DB] Added column readings.{col_name}")
                    except Exception:
                        pass
                for col_name, col_type in divination_columns:
                    try:
                        await db.execute(text(
                            f"ALTER TABLE divination_records ADD COLUMN {col_name} {col_type}"
                        ))
                        print(f"[DB] Added column divination_records.{col_name}")
                    except Exception:
                        pass
                for col_name, col_type in order_columns:
                    try:
                        await db.execute(text(
                            f"ALTER TABLE orders ADD COLUMN {col_name} {col_type}"
                        ))
                        print(f"[DB] Added column orders.{col_name}")
                    except Exception:
                        pass
                await db.commit()
        except Exception as e:
            print(f"[DB] SQLite migration warning: {e}")

    # Clean up test founder data: reset is_founder for users without seat_no
    # (real activate always sets founder_seat_no + founder_activated_at)
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
                print(f"[DB] Cleaned up {result.rowcount} test founder records")
            await db.commit()
    except Exception:
        pass  # Table might not exist yet or no rows to update
    _founder_reset_done = True


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