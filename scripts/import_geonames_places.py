"""Import worldwide populated places from GeoNames allCountries into the local index.

Usage: python scripts/import_geonames_places.py --download --database sqlite+aiosqlite:///./backend/destiny_dev.db
The source is GeoNames allCountries.zip (CC BY 4.0). Only populated places
(`P`) and country/admin records (`A`) are indexed; these are the entries a
birthplace search needs, rather than mountains, roads, or businesses.
"""
from __future__ import annotations

import argparse
import asyncio
import csv
import io
import os
from pathlib import Path
from urllib.request import urlretrieve
import zipfile

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault("PYTHONPATH", str(ROOT / "backend"))


GEONAMES_URL = "https://download.geonames.org/export/dump/allCountries.zip"
COUNTRY_INFO_URL = "https://download.geonames.org/export/dump/countryInfo.txt"
POSTGRES_ARGUMENT_LIMIT = 32767
PLACE_INSERT_COLUMN_COUNT = 15
DEFAULT_MIN_CITY_POPULATION = 500
# G20 members plus frequently selected East/Southeast Asian, Gulf, European,
# and Americas countries. This keeps the public birthplace index responsive.
MAINSTREAM_COUNTRY_CODES = frozenset({
    "AR", "AU", "BE", "BR", "CA", "CH", "CL", "CN", "DE", "DK", "EG", "ES",
    "FI", "FR", "GB", "GR", "ID", "IE", "IL", "IN", "IT", "JP", "KR", "MX",
    "MY", "NL", "NO", "NZ", "PH", "PL", "PT", "RU", "SA", "SE", "SG", "TH",
    "TR", "US", "VN", "ZA", "AE",
})


def batch_size_for_dialect(dialect_name: str) -> int:
    """Keep PostgreSQL/asyncpg bulk inserts below its bind-parameter ceiling."""
    if dialect_name == "postgresql":
        return min(1000, POSTGRES_ARGUMENT_LIMIT // PLACE_INSERT_COLUMN_COUNT)
    return 5000


def selected_country_codes(raw_codes: str | None) -> set[str]:
    if raw_codes is None:
        return set(MAINSTREAM_COUNTRY_CODES)
    return {code.strip().upper() for code in raw_codes.split(",") if code.strip()}


def should_index_row(row: list[str], allowed_country_codes: set[str], min_city_population: int) -> bool:
    """Keep country/admin records and meaningful populated places only."""
    if len(row) <= 14 or row[8] not in allowed_country_codes:
        return False
    if row[6] == "A":
        return True
    if row[6] != "P":
        return False
    return int(row[14] or 0) >= min_city_population


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--download", action="store_true")
    parser.add_argument("--source", type=Path, default=ROOT / "backend" / "data" / "geonames" / "allCountries.zip")
    parser.add_argument("--country-info", type=Path, default=ROOT / "backend" / "data" / "geonames" / "countryInfo.txt")
    parser.add_argument("--limit", type=int, default=0, help="For a smoke import; 0 imports all matching records.")
    parser.add_argument("--countries", help="Comma-separated ISO country codes. Defaults to the mainstream-country set.")
    parser.add_argument("--min-city-population", type=int, default=DEFAULT_MIN_CITY_POPULATION,
                        help="Exclude tiny settlements below this population (default: 500).")
    parser.add_argument("--reset", action="store_true", help="Clear the existing places index before importing.")
    return parser.parse_args()


def download(args):
    args.source.parent.mkdir(parents=True, exist_ok=True)
    if not args.source.exists():
        print(f"Downloading {GEONAMES_URL}")
        urlretrieve(GEONAMES_URL, args.source)
    if not args.country_info.exists():
        print(f"Downloading {COUNTRY_INFO_URL}")
        urlretrieve(COUNTRY_INFO_URL, args.country_info)


def country_names(path: Path) -> dict[str, str]:
    names: dict[str, str] = {}
    with path.open("r", encoding="utf-8") as handle:
        for row in csv.reader((line for line in handle if not line.startswith("#")), delimiter="\t"):
            if len(row) > 4:
                names[row[0]] = row[4]
    return names


async def import_rows(args):
    import sys
    sys.path.insert(0, str(ROOT / "backend"))
    from database.models import Base, Place
    from database.session import engine, AsyncSessionLocal

    if engine.dialect.name == "postgresql":
        from sqlalchemy.dialects.postgresql import insert as dialect_insert
    elif engine.dialect.name == "sqlite":
        from sqlalchemy.dialects.sqlite import insert as dialect_insert
    else:
        raise SystemExit(f"Unsupported database dialect: {engine.dialect.name}")

    def upsert(rows):
        statement = dialect_insert(Place).values(rows)
        return statement.on_conflict_do_update(
            index_elements=[Place.geoname_id],
            set_={column.name: getattr(statement.excluded, column.name) for column in Place.__table__.columns if column.name != "geoname_id"},
        )

    countries = country_names(args.country_info)
    allowed_country_codes = selected_country_codes(args.countries)
    batch_size = batch_size_for_dialect(engine.dialect.name)
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
        if args.reset:
            await connection.execute(Place.__table__.delete())
    imported = 0
    batch: list[dict[str, object]] = []
    with zipfile.ZipFile(args.source) as archive:
        member = next(name for name in archive.namelist() if name.endswith(".txt"))
        with archive.open(member) as binary:
            rows = csv.reader(io.TextIOWrapper(binary, encoding="utf-8"), delimiter="\t")
            for row in rows:
                if len(row) < 19 or not should_index_row(row, allowed_country_codes, args.min_city_population):
                    continue
                country_code = row[8]
                batch.append({
                    "geoname_id": row[0], "name": row[1], "name_zh": None,
                    "alternate_names": row[3] or None, "country_code": country_code,
                    "country_name": countries.get(country_code, country_code), "country_name_zh": None,
                    "admin1": row[10] or None, "admin1_zh": None, "feature_class": row[6],
                    "feature_code": row[7], "population": int(row[14] or 0) or None,
                    "latitude": float(row[4]) if row[4] else None, "longitude": float(row[5]) if row[5] else None,
                    "timezone": row[17] or None,
                })
                if len(batch) >= batch_size:
                    async with AsyncSessionLocal() as session:
                        await session.execute(upsert(batch))
                        await session.commit()
                    imported += len(batch); print(f"Imported {imported}", flush=True)
                    batch.clear()
                if args.limit and imported + len(batch) >= args.limit:
                    break
    if batch:
        async with AsyncSessionLocal() as session:
            await session.execute(upsert(batch))
            await session.commit()
        imported += len(batch)
    print(f"Completed import: {imported} places", flush=True)


if __name__ == "__main__":
    arguments = parse_args()
    if arguments.download:
        download(arguments)
    if not arguments.source.exists() or not arguments.country_info.exists():
        raise SystemExit("Dataset missing. Re-run with --download or provide --source and --country-info.")
    asyncio.run(import_rows(arguments))
