"""database/session.py — 兼容 SQLite 开发模式 & PostgreSQL 生产模式"""
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool
from config import get_settings

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

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()