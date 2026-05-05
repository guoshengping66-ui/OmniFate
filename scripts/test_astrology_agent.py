"""
scripts/test_astrology_agent.py
Test script for the Astrology Calculator (Skyfield-based).

Usage:
    python scripts/test_astrology_agent.py
    python scripts/test_astrology_agent.py --verbose  (show aspects & houses)

Tests 4 diverse birth charts:
  1. Beijing 1990-06-15 12:00 CST — Sun Gemini, Moon Pisces
  2. New York 1985-10-26 14:30 EST — Sun Scorpio, many retrograde planets
  3. London 2000-01-01 00:00 GMT — Sun Capricorn, Y2K baby
  4. Sydney 2020-03-20 06:00 AEDT — Sun Pisces, Spring Equinox
"""
from __future__ import annotations
import sys
import json
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

# Ensure project root is on path
_project_root = Path(__file__).resolve().parent.parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from backend.calculators.astrology_calculator import (
    AstrologyCalculator,
    calculate_astrology,
    SIGN_CN,
)

TEST_CASES = [
    {
        "name": "Beijing 1990-06-15 12:00 CST",
        "year": 1990, "month": 6, "day": 15,
        "hour": 12, "minute": 0,
        "latitude": 39.9, "longitude": 116.4,
        "utc_offset": 8.0,
        "expect": {"sun": "Gemini", "moon": "Pisces", "asc": "Pisces"},
    },
    {
        "name": "New York 1985-10-26 14:30 EST",
        "year": 1985, "month": 10, "day": 26,
        "hour": 14, "minute": 30,
        "latitude": 40.7, "longitude": -74.0,
        "utc_offset": -5.0,
        "expect": {"sun": "Scorpio", "moon": "Aries", "asc": "Leo"},
    },
    {
        "name": "London 2000-01-01 00:00 GMT",
        "year": 2000, "month": 1, "day": 1,
        "hour": 0, "minute": 0,
        "latitude": 51.5, "longitude": -0.1,
        "utc_offset": 0.0,
        "expect": {"sun": "Capricorn", "asc": "Aries"},
    },
    {
        "name": "Sydney 2020-03-20 06:00 AEDT",
        "year": 2020, "month": 3, "day": 20,
        "hour": 6, "minute": 0,
        "latitude": -33.9, "longitude": 151.2,
        "utc_offset": 11.0,
        "expect": {"sun": "Pisces", "asc": "Virgo"},
    },
]

VERBOSE = "--verbose" in sys.argv


def test_case(case: dict) -> list[str]:
    """Run one astrology calculation and return list of check messages."""
    msgs = []
    result = calculate_astrology(
        year=case["year"], month=case["month"], day=case["day"],
        hour=case["hour"], minute=case["minute"],
        latitude=case["latitude"], longitude=case["longitude"],
        utc_offset=case["utc_offset"],
    )

    sun = result["planets"]["Sun"]
    moon = result["planets"]["Moon"]
    asc_sign = result["ascendant"]

    # Check expected values
    expect = case["expect"]
    if "sun" in expect:
        ok = sun["sign"] == expect["sun"]
        msgs.append(
            f"  Sun sign: {sun['sign']} {sun['degree']:.1f}° "
            f"{'(✓ ' + SIGN_CN.get(sun['sign'], '') + ')' if ok else '✗ EXPECTED ' + expect['sun']}"
        )
    if "moon" in expect:
        ok = moon["sign"] == expect["moon"]
        msgs.append(
            f"  Moon sign:{moon['sign']} {moon['degree']:.1f}° "
            f"{'✓' if ok else '✗ EXPECTED ' + expect['moon']}"
        )
    if "asc" in expect:
        ok = asc_sign == expect["asc"]
        msgs.append(
            f"  ASC sign: {asc_sign} {result['ascendant_degree']:.1f}° "
            f"{'✓' if ok else '✗ EXPECTED ' + expect['asc']}"
        )

    # MC
    msgs.append(f"  MC sign:  {result['mc_sign']} {result['mc_degree']:.1f}°")

    # All planets
    all_names = ["Sun", "Moon", "Mercury", "Venus", "Mars",
                 "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]
    present = sum(1 for p in all_names if p in result["planets"])
    msgs.append(f"  Planets calculated: {present}/10")

    # Retrogrades
    retros = [p for p in all_names
              if p in result["planets"] and result["planets"][p].get("retrograde")]
    if retros:
        msgs.append(f"  Retrograde: {', '.join(retros)}")

    # Houses
    planet_houses = [(p, result["planets"][p]["house"])
                     for p in all_names if p in result["planets"]]
    msgs.append(f"  Houses: {', '.join(f'{p}H{h}' for p, h in planet_houses)}")

    # Aspects count
    n_asp = len(result["aspects"])
    msgs.append(f"  Aspects: {n_asp}")

    if VERBOSE:
        # Show major aspects
        major_asps = [a for a in result["aspects"] if a.get("type") == "major"]
        if major_asps:
            msgs.append("  — Major aspects:")
            for a in major_asps:
                msgs.append(
                    f"    {a['planet1']:8s} {a['aspect']:12s} {a['planet2']:8s}"
                    f" (orb {a['orb']:.1f}°)"
                )
        # Show house cusps
        hc = result.get("house_cusps", {})
        msgs.append(f"  — House cusps (system: {result.get('house_system', '?')}):")
        for hnum in range(1, 13):
            lon = hc.get(str(hnum), 0)
            sign_idx = int(lon // 30)
            sign = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir",
                    "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"][sign_idx % 12]
            deg = lon % 30
            msgs.append(f"    H{hnum:2d}: {lon:6.1f}° ({sign} {deg:.1f}°)")

    return msgs


def main():
    print("=" * 60)
    print("ASTROLOGY CALCULATOR TEST")
    print(f"Testing {len(TEST_CASES)} charts...")
    print("=" * 60)

    all_ok = True
    for case in TEST_CASES:
        print(f"\n{'─' * 40}")
        print(f"[{case['name']}]")
        print(f"  {case['year']}-{case['month']:02d}-{case['day']:02d} "
              f"{case['hour']:02d}:{case['minute']:02d} "
              f"({case['latitude']}, {case['longitude']}) "
              f"UTC{case['utc_offset']:+}")
        try:
            msgs = test_case(case)
            for m in msgs:
                print(m)
            # Check if any msg contains ✗
            if any("✗" in m for m in msgs):
                all_ok = False
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            all_ok = False

    print(f"\n{'=' * 60}")
    if all_ok:
        print("ALL TESTS PASSED ✓")
    else:
        print("SOME TESTS FAILED ✗")
    print("=" * 60)

    # Verify prompt integration data
    print("\n[Prompt Integration Check]")
    r = calculate_astrology(
        year=1990, month=6, day=15, hour=12,
        latitude=39.9, longitude=116.4, utc_offset=8.0,
    )

    # Check fields used by astrology_prompt()
    checks = {
        "sun_sign": r.get("sun_sign"),
        "moon_sign": r.get("moon_sign"),
        "ascendant": r.get("ascendant"),
        "planets (non-empty)": len(r.get("planets", {})),
        "saturn_aspects": len(r.get("saturn_aspects", "")),
        "transits_this_year": len(r.get("transits_this_year", "")),
        "aspects (list)": len(r.get("aspects", [])),
        "house_cusps (12)": len(r.get("house_cusps", {})),
    }
    all_good = True
    for label, val in checks.items():
        ok = bool(val)
        print(f"  {label:25s}: {'✓' if ok else '✗'} ({val})")
        if not ok:
            all_good = False

    print(f"\nPrompt data: {'ALL PRESENT ✓' if all_good else 'MISSING DATA ✗'}")

    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
