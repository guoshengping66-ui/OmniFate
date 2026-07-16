"""Shared formatting and query rules for globally indexed birthplace records."""
from __future__ import annotations

from dataclasses import dataclass
import re


@dataclass(frozen=True)
class PlaceRecord:
    geoname_id: str
    name: str
    name_zh: str | None
    country_code: str
    country_name: str
    country_name_zh: str | None
    admin1: str | None
    admin1_zh: str | None
    latitude: float | None
    longitude: float | None
    timezone: str | None
    population: int | None = None


def normalize_place_query(query: str | None) -> str:
    """Normalize text and avoid expensive global searches for one character."""
    normalized = re.sub(r"\s+", " ", str(query or "").strip())
    if len(normalized) < 2:
        return ""
    return normalized.lower() if normalized.isascii() else normalized


def format_place_result(place: PlaceRecord, language: str = "zh") -> dict[str, object]:
    is_zh = language == "zh"
    city = place.name_zh if is_zh and place.name_zh else place.name
    admin = place.admin1_zh if is_zh and place.admin1_zh else place.admin1
    if admin and admin.strip().isdigit():
        admin = None
    country = place.country_name_zh if is_zh and place.country_name_zh else place.country_name
    return {
        "id": place.geoname_id,
        "display_name": " · ".join(value for value in (city, admin, country) if value),
        "city": city,
        "country_code": place.country_code,
        "country": country,
        "admin1": admin,
        "latitude": place.latitude,
        "longitude": place.longitude,
        "timezone": place.timezone,
        "population": place.population,
        "is_verified": True,
    }
