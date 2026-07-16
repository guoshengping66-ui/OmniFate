"""Public birthplace search backed by the local GeoNames index."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Place
from database.session import get_db
from services.places import PlaceRecord, format_place_result, normalize_place_query

router = APIRouter()


def _as_record(place: Place) -> PlaceRecord:
    return PlaceRecord(place.geoname_id, place.name, place.name_zh, place.country_code,
        place.country_name, place.country_name_zh, place.admin1, place.admin1_zh,
        place.latitude, place.longitude, place.timezone, place.population)


@router.get("/search")
async def search_places(
    q: str = Query(min_length=2, max_length=100),
    country: Optional[str] = Query(default=None, min_length=2, max_length=2),
    lang: str = Query(default="zh", pattern="^(zh|en)$"),
    db: AsyncSession = Depends(get_db),
):
    query = normalize_place_query(q)
    if not query:
        raise HTTPException(status_code=422, detail="请输入至少 2 个字符")
    pattern = f"%{query}%"
    stmt = select(Place).where(or_(Place.name.ilike(pattern), Place.name_zh.ilike(pattern),
        Place.alternate_names.ilike(pattern), Place.admin1.ilike(pattern), Place.admin1_zh.ilike(pattern),
        Place.country_name.ilike(pattern), Place.country_name_zh.ilike(pattern)))
    if country:
        stmt = stmt.where(Place.country_code == country.upper())
    rows = (await db.execute(stmt.order_by(Place.population.desc().nullslast(), Place.name.asc()).limit(8))).scalars().all()
    return {"items": [format_place_result(_as_record(row), lang) for row in rows]}


@router.get("/{geoname_id}")
async def get_place(geoname_id: str, lang: str = Query(default="zh", pattern="^(zh|en)$"), db: AsyncSession = Depends(get_db)):
    place = await db.get(Place, geoname_id)
    if not place:
        raise HTTPException(status_code=404, detail="地点不存在")
    return format_place_result(_as_record(place), lang)
