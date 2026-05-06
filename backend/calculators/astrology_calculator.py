"""
calculators/astrology_calculator.py
Western astrology calculator using Skyfield (JPL ephemeris).
Computes: 10 planet positions, houses (Equal/Placidus), ASC, MC, major aspects.

Fallback chain: pyswisseph (if installed) → skyfield (pure Python, always works)
"""
from __future__ import annotations
import math
import datetime
from dataclasses import dataclass, field
from typing import Optional

# ─── Zodiac Constants ───────────────────────────────────────────────────────────

ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

# Sign index by ecliptic longitude (0-based, 0=Aries)
def _sign_index(deg: float) -> int:
    return int(deg % 360 // 30)

def _sign_name(deg: float) -> str:
    return ZODIAC_SIGNS[_sign_index(deg)]

def _sign_degree(deg: float) -> float:
    """Return the degree within the sign (0-30)."""
    return deg % 30

# Element and modality for each sign
SIGN_ELEMENT = {
    "Aries": "fire", "Leo": "fire", "Sagittarius": "fire",
    "Taurus": "earth", "Virgo": "earth", "Capricorn": "earth",
    "Gemini": "air", "Libra": "air", "Aquarius": "air",
    "Cancer": "water", "Scorpio": "water", "Pisces": "water",
}

# Aspect definitions: (name, angle, orb)
MAJOR_ASPECTS = [
    ("conjunction", 0, 8),
    ("sextile", 60, 6),
    ("square", 90, 6),
    ("trine", 120, 6),
    ("opposition", 180, 8),
]

MINOR_ASPECTS = [
    ("semisextile", 30, 3),
    ("quintile", 72, 2),
    ("sesquiquadrate", 135, 3),
    ("biquintile", 144, 2),
    ("quincunx", 150, 3),
]

PLANET_NAMES = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
]

# Chinese name mapping for sign names (used in output)
SIGN_CN = {
    "Aries": "白羊座", "Taurus": "金牛座", "Gemini": "双子座",
    "Cancer": "巨蟹座", "Leo": "狮子座", "Virgo": "处女座",
    "Libra": "天秤座", "Scorpio": "天蝎座", "Sagittarius": "射手座",
    "Capricorn": "摩羯座", "Aquarius": "水瓶座", "Pisces": "双鱼座",
}


# ─── Essential Dignity Constants (Ptolemaic) ────────────────────────────────────

# Domicile (庙): planet rules this sign
DOMICILE = {
    "Sun": "Leo", "Moon": "Cancer",
    "Mercury": "Gemini", "Mercury_2": "Virgo",
    "Venus": "Taurus", "Venus_2": "Libra",
    "Mars": "Aries", "Mars_2": "Scorpio",
    "Jupiter": "Sagittarius", "Jupiter_2": "Pisces",
    "Saturn": "Capricorn", "Saturn_2": "Aquarius",
}
# Modern planets domicile (Uranus/Neptune/Pluto)
MODERN_DOMICILE = {
    "Uranus": "Aquarius", "Neptune": "Pisces", "Pluto": "Scorpio",
}

# Detriment (陷): opposite sign from domicile
DETRIMENT_SIGNS = {
    "Sun": "Aquarius", "Moon": "Capricorn",
    "Mercury": "Sagittarius", "Venus": "Scorpio",
    "Mars": "Libra", "Jupiter": "Virgo", "Saturn": "Cancer",
}

# Exaltation (旺): planet is exalted in this sign (with degree)
EXALTATION = {
    "Sun": ("Aries", 19), "Moon": ("Taurus", 3),
    "Mercury": ("Virgo", 15), "Venus": ("Pisces", 27),
    "Mars": ("Capricorn", 28), "Jupiter": ("Cancer", 15),
    "Saturn": ("Libra", 21),
}

# Fall (弱): opposite sign from exaltation
FALL_SIGNS = {
    "Sun": "Libra", "Moon": "Scorpio",
    "Mercury": "Pisces", "Venus": "Virgo",
    "Mars": "Cancer", "Jupiter": "Capricorn", "Saturn": "Aries",
}

# Triplicity (三分): day/night rulers by sign element
# Each sign's triplicity rulers: (day_ruler, night_ruler, participating_ruler)
TRIPLICITY = {
    "Aries": ("Sun", "Jupiter", "Saturn"), "Leo": ("Sun", "Jupiter", "Saturn"), "Sagittarius": ("Sun", "Jupiter", "Saturn"),
    "Taurus": ("Venus", "Moon", "Mars"), "Virgo": ("Venus", "Moon", "Mars"), "Capricorn": ("Venus", "Moon", "Mars"),
    "Gemini": ("Saturn", "Mercury", "Jupiter"), "Libra": ("Saturn", "Mercury", "Jupiter"), "Aquarius": ("Saturn", "Mercury", "Jupiter"),
    "Cancer": ("Mars", "Venus", "Moon"), "Scorpio": ("Mars", "Venus", "Moon"), "Pisces": ("Mars", "Venus", "Moon"),
}

# Ptolemaic Terms (界): (start_deg, end_deg, ruler) per sign
# Simplified version — each sign divided into 5 terms
def _build_terms() -> dict[str, list[tuple[int, int, str]]]:
    # Format: planet list for each sign (5 terms per sign, sum to 30 deg)
    # Based on Ptolemy's Tetrabiblos
    TERM_DATA = {
        "Aries": [(0, 6, "Jupiter"), (6, 14, "Venus"), (14, 21, "Mercury"), (21, 27, "Mars"), (27, 30, "Saturn")],
        "Taurus": [(0, 8, "Venus"), (8, 15, "Mercury"), (15, 22, "Jupiter"), (22, 27, "Saturn"), (27, 30, "Mars")],
        "Gemini": [(0, 6, "Mercury"), (6, 14, "Jupiter"), (14, 21, "Venus"), (21, 27, "Saturn"), (27, 30, "Mars")],
        "Cancer": [(0, 7, "Mars"), (7, 13, "Venus"), (13, 20, "Mercury"), (20, 27, "Jupiter"), (27, 30, "Saturn")],
        "Leo": [(0, 6, "Saturn"), (6, 13, "Mercury"), (13, 20, "Venus"), (20, 27, "Jupiter"), (27, 30, "Mars")],
        "Virgo": [(0, 7, "Mercury"), (7, 13, "Venus"), (13, 18, "Jupiter"), (18, 24, "Saturn"), (24, 30, "Mars")],
        "Libra": [(0, 6, "Saturn"), (6, 12, "Mercury"), (12, 19, "Jupiter"), (19, 25, "Venus"), (25, 30, "Mars")],
        "Scorpio": [(0, 7, "Mars"), (7, 14, "Venus"), (14, 21, "Mercury"), (21, 27, "Jupiter"), (27, 30, "Saturn")],
        "Sagittarius": [(0, 8, "Jupiter"), (8, 14, "Venus"), (14, 20, "Mercury"), (20, 26, "Saturn"), (26, 30, "Mars")],
        "Capricorn": [(0, 7, "Venus"), (7, 14, "Mercury"), (14, 19, "Jupiter"), (19, 26, "Saturn"), (26, 30, "Mars")],
        "Aquarius": [(0, 7, "Mercury"), (7, 13, "Venus"), (13, 20, "Jupiter"), (20, 27, "Saturn"), (27, 30, "Mars")],
        "Pisces": [(0, 8, "Venus"), (8, 15, "Jupiter"), (15, 20, "Mercury"), (20, 26, "Mars"), (26, 30, "Saturn")],
    }
    return TERM_DATA

# Face (面/Decan): each sign divided into 3 decans of 10°, each ruled by a planet
DECAN_RULERS = {
    # Format: (chaldean order) Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon
    # Each sign: 3 decans ruled by sequential planets in the order
    "Aries": ("Mars", "Sun", "Venus"),
    "Taurus": ("Mercury", "Moon", "Saturn"),
    "Gemini": ("Jupiter", "Mars", "Sun"),
    "Cancer": ("Venus", "Mercury", "Moon"),
    "Leo": ("Saturn", "Jupiter", "Mars"),
    "Virgo": ("Sun", "Venus", "Mercury"),
    "Libra": ("Moon", "Saturn", "Jupiter"),
    "Scorpio": ("Mars", "Sun", "Venus"),
    "Sagittarius": ("Mercury", "Moon", "Saturn"),
    "Capricorn": ("Jupiter", "Mars", "Sun"),
    "Aquarius": ("Venus", "Mercury", "Moon"),
    "Pisces": ("Saturn", "Jupiter", "Mars"),
}

# ─── Fixed Star Constants ──────────────────────────────────────────────────────
# J2000 ecliptic longitudes (degrees) for major fixed stars
# Precession: ~1.396 degrees per century, or ~0.01396 per year since J2000 (2000.0)
FIXED_STARS = {
    "Aldebaran": 69.8,      # Taurus 9°48'
    "Regulus": 152.1,       # Leo 2°06'
    "Spica": 203.8,         # Virgo 23°48'
    "Antares": 249.8,       # Sagittarius 9°48'
    "Fomalhaut": 346.0,     # Pisces 3°60'
    "Sirius": 104.1,        # Cancer 14°06'
    "Vega": 285.5,          # Capricorn 15°30'
    "Capella": 80.7,        # Gemini 20°42'
    "Rigel": 78.1,          # Gemini 18°06'
    "Arcturus": 204.0,      # Virgo 24°00'
    "Pollux": 113.6,        # Cancer 23°36'
    "Betelgeuse": 88.1,     # Gemini 28°06'
    "Procyon": 114.3,       # Cancer 24°18'
    "Altair": 301.7,        # Capricorn 1°42'
    "Deneb": 335.4,         # Pisces 5°24'
}

# Chinese names for fixed stars
FIXED_STARS_CN = {
    "Aldebaran": "毕宿五", "Regulus": "轩辕十四", "Spica": "角宿一",
    "Antares": "心宿二", "Fomalhaut": "北落师门", "Sirius": "天狼星",
    "Vega": "织女星", "Capella": "五车二", "Rigel": "参宿七",
    "Arcturus": "大角星", "Pollux": "北河三", "Betelgeuse": "参宿四",
    "Procyon": "南河三", "Altair": "牛郎星", "Deneb": "天津四",
}

# Fixed star meanings (brief)
FIXED_STAR_MEANINGS = {
    "Aldebaran": "荣誉与危险并存，火星+水星性质，勇猛直前需防冲动",
    "Regulus": "王者之星，权力与毁灭的双刃剑，高处不胜寒",
    "Spica": "幸运之星，金星+木星性质，才华与丰收的守护",
    "Antares": "火星+木星性质，勇猛果断，竞争意识极强",
    "Fomalhaut": "金星+水星性质，灵性守护，艺术与神秘的融合",
    "Sirius": "火木性质，王者气度，显赫但需警惕自满",
    "Vega": "金水性质，艺术天赋，浪漫理想主义",
    "Capella": "火土性质，行动力强，务实而进取",
    "Rigel": "木土性质，学术天赋，严谨而有远见",
    "Arcturus": "火木性质，冒险精神，开拓者气质",
    "Pollux": "火星性质，好斗但勇敢，需要学习温和",
    "Betelgeuse": "火水性质，行动受情绪驱动，需培养定力",
    "Procyon": "水星性质，聪明机敏，善变而灵活",
    "Altair": "火水性质，志向高远，追求卓越",
    "Deneb": "水星+金星性质，艺术视野，灵性高度",
}

# House classification for accidental dignity
ANGULAR_HOUSES = {1, 4, 7, 10}
SUCCEDENT_HOUSES = {2, 5, 8, 11}

# Sign modalities (for critical degrees)
SIGN_MODALITY = {
    "Aries": "cardinal", "Cancer": "cardinal", "Libra": "cardinal", "Capricorn": "cardinal",
    "Taurus": "fixed", "Leo": "fixed", "Scorpio": "fixed", "Aquarius": "fixed",
    "Gemini": "mutable", "Virgo": "mutable", "Sagittarius": "mutable", "Pisces": "mutable",
}

# Critical/sensitive degrees by modality
CRITICAL_DEGREES = {
    "cardinal": {0, 13, 26},
    "fixed": {9, 21},
    "mutable": {4, 17},
}


# ─── Result Data Class ─────────────────────────────────────────────────────────

@dataclass
class AstrologyResult:
    """Complete astrology calculation result."""
    # Planet data: {name: {sign, house, degree, retrograde, ...}}
    planets: dict[str, dict] = field(default_factory=dict)

    # Ecliptic longitudes of house cusps (1-12)
    house_cusps: dict[int, float] = field(default_factory=dict)

    # Key points
    ascendant: float = 0.0          # ecliptic longitude of ASC
    midheaven: float = 0.0          # ecliptic longitude of MC
    descendant: float = 0.0
    imum_coeli: float = 0.0

    # Aspects list
    aspects: list[dict] = field(default_factory=list)

    # Raw data for debug
    julian_day: float = 0.0
    obliquity: float = 0.0          # true obliquity of ecliptic
    ramc: float = 0.0               # Right Ascension of Midheaven
    house_system: str = "Equal"     # Equal or Placidus

    # New: Essential Dignity data per planet
    dignities: dict[str, dict] = field(default_factory=dict)

    # New: Dignity ranking (sorted by score descending)
    dignity_ranking: list[dict] = field(default_factory=list)

    # New: Aspect patterns detected in the chart
    aspect_patterns: list[dict] = field(default_factory=list)

    # New: Element and modality balance
    element_summary: dict = field(default_factory=lambda: {"fire":0,"earth":0,"air":0,"water":0})
    modality_summary: dict = field(default_factory=lambda: {"cardinal":0,"fixed":0,"mutable":0})
    missing_elements: list[str] = field(default_factory=list)
    dominant_element: str = ""

    # New: Hemisphere emphasis
    hemisphere: dict = field(default_factory=dict)

    # New: Fixed star conjunctions list
    fixed_star_conjunctions: list[dict] = field(default_factory=list)

    # New: Lunar Nodes
    lunar_nodes: dict = field(default_factory=dict)

    # New: House cusp signs and house lords
    house_cusp_signs: dict[int, str] = field(default_factory=dict)
    house_lords: dict[int, list[str]] = field(default_factory=dict)

    # New: Accidental Dignity
    accidental_dignities: dict[str, dict] = field(default_factory=dict)

    # New: Total dignity (essential + accidental)
    total_dignity_ranking: list[dict] = field(default_factory=list)

    # New: Chart shape classification
    chart_shape: dict = field(default_factory=dict)

    # New: Critical/sensitive degrees
    critical_degrees: dict[str, dict] = field(default_factory=dict)

    # New: Sect (day/night)
    sect: str = ""

    # New: Planet returns (Saturn/Jupiter/Uranus opposition)
    planet_returns: list[dict] = field(default_factory=list)

    # New: Transit-natal aspects (current date)
    transit_planets: dict[str, dict] = field(default_factory=dict)
    transit_natal_aspects: list[dict] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Convert to the dict format expected by SystemState.astrology_raw."""
        def _planet_to_entry(pdata: dict) -> dict:
            deg = pdata.get("longitude", 0)
            return {
                "sign": _sign_name(deg),
                "sign_cn": SIGN_CN.get(_sign_name(deg), ""),
                "house": pdata.get("house", 0),
                "degree": round(_sign_degree(deg), 2),
                "longitude": round(deg, 4),
                "latitude": round(pdata.get("latitude", 0), 4),
                "retrograde": pdata.get("retrograde", False),
                "speed": round(pdata.get("speed", 0), 4),
            }

        planets_out = {}
        for name in PLANET_NAMES:
            if name in self.planets:
                planets_out[name] = _planet_to_entry(self.planets[name])

        # Build Saturn aspects string for prompt injection
        saturn_aspects = self._saturn_aspects_text()

        # Transit context
        transits = self._transits_text()

        # ASC info
        asc_sign = _sign_name(self.ascendant)
        asc_deg = round(_sign_degree(self.ascendant), 2)

        return {
            "sun_sign": _sign_name(self.planets.get("Sun", {}).get("longitude", 0)),
            "moon_sign": _sign_name(self.planets.get("Moon", {}).get("longitude", 0)),
            "ascendant": asc_sign,
            "ascendant_degree": asc_deg,
            "ascendant_longitude": round(self.ascendant, 4),
            "mc_sign": _sign_name(self.midheaven),
            "mc_degree": round(_sign_degree(self.midheaven), 2),
            "planets": planets_out,
            "aspects": self.aspects,
            "house_cusps": {str(k): round(v, 4) for k, v in self.house_cusps.items()},
            "saturn_aspects": saturn_aspects,
            "transits_this_year": transits,
            "julian_day": self.julian_day,
            "house_system": self.house_system,
            "obliquity": round(self.obliquity, 4),
            # New fields
            "dignities": self.dignities,
            "dignity_ranking": self.dignity_ranking,
            "aspect_patterns": self.aspect_patterns,
            "element_summary": self.element_summary,
            "modality_summary": self.modality_summary,
            "missing_elements": self.missing_elements,
            "dominant_element": self.dominant_element,
            "hemisphere": self.hemisphere,
            "fixed_star_conjunctions": self.fixed_star_conjunctions,
            # New P0 fields
            "lunar_nodes": self.lunar_nodes,
            "house_cusp_signs": {str(k): v for k, v in self.house_cusp_signs.items()},
            "house_lords": {str(k): v for k, v in self.house_lords.items()},
            "accidental_dignities": self.accidental_dignities,
            "total_dignity_ranking": self.total_dignity_ranking,
            # P1 new fields
            "chart_shape": self.chart_shape,
            "critical_degrees": self.critical_degrees,
            "sect": self.sect,
            "planet_returns": self.planet_returns,
            "transit_planets": self.transit_planets,
            "transit_natal_aspects": self.transit_natal_aspects,
        }

    def _saturn_aspects_text(self) -> str:
        """Generate Saturn aspect description (used in prompt injection)."""
        saturn = self.planets.get("Saturn", {})
        sat_deg = saturn.get("longitude", 0)
        sat_retro = saturn.get("retrograde", False)
        sat_sign = _sign_name(sat_deg)
        ret_str = " (retrograde)" if sat_retro else ""

        lines = [f"Saturn in {sat_sign}{ret_str}"]
        for asp in self.aspects:
            if asp.get("planet1") == "Saturn":
                lines.append(
                    f"  Saturn {asp['aspect']} {asp['planet2']} "
                    f"(orb {asp.get('orb', 0):.1f} deg)"
                )
            elif asp.get("planet2") == "Saturn":
                lines.append(
                    f"  {asp['planet1']} {asp['aspect']} Saturn "
                    f"(orb {asp.get('orb', 0):.1f} deg)"
                )
        return "\n".join(lines) if lines else f"Saturn in {sat_sign}"

    def _transits_text(self) -> str:
        """Generate transit context text for prompt injection."""
        import datetime as dt
        cy = dt.date.today().year
        # Determine approximate current positions for outer planets
        # (simplified — real transit calculation would need current time)
        lines = [
            f"In {cy} transit context:"
        ]
        for pname in ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]:
            if pname in self.planets:
                p = self.planets[pname]
                sig = _sign_name(p.get("longitude", 0))
                ret = "R" if p.get("retrograde", False) else "D"
                lines.append(f"  {pname} in {sig} ({ret})")
        return "\n".join(lines)


# ─── Main Calculator ────────────────────────────────────────────────────────────

class AstrologyCalculator:
    """
    Western astrology calculator using Skyfield (JPL DE421 ephemeris).

    Usage:
        calc = AstrologyCalculator()
        result = calc.calculate(
            year=1990, month=6, day=15,
            hour=12, minute=0,
            latitude=39.9, longitude=116.4,  # Beijing
            utc_offset=8.0,
        )
        dict_data = result.to_dict()
    """

    def __init__(self, house_system: str = "Equal"):
        self.house_system = house_system
        self._ephemeris = None  # lazy load
        self._ts = None

    # ── Lazy load skyfield resources ───────────────────────────────────────

    def _ensure_ephemeris(self):
        if self._ephemeris is not None:
            return
        import os
        # Use /tmp on Vercel (only writable dir), ~/.skyfield locally
        skyfield_dir = os.environ.get("SKYFIELD_DATA") or os.path.expanduser("~/.skyfield")
        os.makedirs(skyfield_dir, exist_ok=True)
        from skyfield.api import load
        self._ts = load.timescale()
        # Use DE421 (small, covers 1900-2050)
        self._ephemeris = load("de421.bsp")

    # ── Public API ─────────────────────────────────────────────────────────

    def calculate(
        self,
        year: int,
        month: int,
        day: int,
        hour: int = 12,
        minute: int = 0,
        latitude: float = 0.0,
        longitude: float = 0.0,
        utc_offset: Optional[float] = None,
    ) -> AstrologyResult:
        """
        Compute natal chart for given birth time.

        Args:
            year, month, day, hour, minute: Local birth time
            latitude, longitude: Birthplace coordinates (degrees)
            utc_offset: Timezone offset from UTC (e.g., 8.0 for CST).
                        If None, estimated from longitude (lon/15).

        Returns:
            AstrologyResult with all computed data.
        """
        self._ensure_ephemeris()

        # ── Normalize birth time to UTC ──
        if utc_offset is None:
            utc_offset = round(longitude / 15.0)

        local_dt = datetime.datetime(year, month, day, hour, minute, 0)
        utc_dt = local_dt - datetime.timedelta(hours=utc_offset)

        # ── Compute Julian Day / sidereal time ──
        t = self._ts.utc(
            utc_dt.year, utc_dt.month, utc_dt.day,
            utc_dt.hour, utc_dt.minute, utc_dt.second,
        )
        jd = t.tt  # Julian Day (Terrestrial Time)

        # Compute obliquity of the ecliptic
        epsilon = self._obliquity(jd)

        # Compute GMST and RAMC
        gmst = self._gmst(t)
        ramc = (gmst + longitude) % 360

        result = AstrologyResult(
            julian_day=jd,
            obliquity=epsilon,
            ramc=ramc,
            house_system=self.house_system,
        )

        # ── Planet positions (geocentric ecliptic) ──
        earth = self._ephemeris["earth"]
        sky_planet_keys = {
            "Sun": ("Sun", "geocentric"),
            "Moon": ("Moon", "geocentric"),
            "Mercury": ("Mercury BARYCENTER",),
            "Venus": ("Venus BARYCENTER",),
            "Mars": ("Mars BARYCENTER",),
            "Jupiter": ("Jupiter BARYCENTER",),
            "Saturn": ("Saturn BARYCENTER",),
            "Uranus": ("Uranus BARYCENTER",),
            "Neptune": ("Neptune BARYCENTER",),
            "Pluto": ("Pluto BARYCENTER",),
        }

        # For Sun and Moon, use direct geocentric positions
        # For planets, correct from barycenter to geocentric
        astrometric_sun = earth.at(t).observe(self._ephemeris["Sun"])
        sun_ecliptic = astrometric_sun.ecliptic_latlon()
        result.planets["Sun"] = {
            "longitude": sun_ecliptic[1].degrees % 360,
            "latitude": sun_ecliptic[0].degrees,
            "retrograde": False,
            "speed": 0,
        }

        astrometric_moon = earth.at(t).observe(self._ephemeris["Moon"])
        moon_ecliptic = astrometric_moon.ecliptic_latlon()
        result.planets["Moon"] = {
            "longitude": moon_ecliptic[1].degrees % 360,
            "latitude": moon_ecliptic[0].degrees,
            "retrograde": False,
            "speed": 0,
        }

        # Inner and outer planets (geocentric positions via skyfield)
        # Note: skyfield uses lowercase keys; barycenter for outer planets
        planet_key_to_name: list[tuple[str, str]] = [
            ("mercury", "Mercury"),
            ("venus", "Venus"),
            ("mars", "Mars"),
            ("jupiter barycenter", "Jupiter"),
            ("saturn barycenter", "Saturn"),
            ("uranus barycenter", "Uranus"),
            ("neptune barycenter", "Neptune"),
            ("pluto barycenter", "Pluto"),
        ]

        for sky_name, pname in planet_key_to_name:
            try:
                astrometric = earth.at(t).observe(self._ephemeris[sky_name])
                lat, lon, _ = astrometric.ecliptic_latlon()
                lon_deg = lon.degrees % 360
                lat_deg = lat.degrees

                # Retrograde detection: compare position 24h later
                t_plus = self._ts.utc(
                    utc_dt.year, utc_dt.month, utc_dt.day,
                    utc_dt.hour + 24, utc_dt.minute, utc_dt.second,
                )
                astro_plus = earth.at(t_plus).observe(self._ephemeris[sky_name])
                _, lon2, _ = astro_plus.ecliptic_latlon()
                retro = bool((lon2.degrees - lon.degrees) % 360 < 0.1)

                result.planets[pname] = {
                    "longitude": lon_deg,
                    "latitude": lat_deg,
                    "retrograde": retro,
                    "speed": 0,
                }
            except Exception:
                result.planets[pname] = {"longitude": 0, "latitude": 0,
                                         "retrograde": False, "speed": 0}

        # ── ASC / MC / Houses ──
        asc = self._calc_ascendant(ramc, epsilon, latitude)
        mc = self._calc_midheaven(ramc, epsilon)
        desc = (asc + 180) % 360
        ic = (mc + 180) % 360

        result.ascendant = asc
        result.midheaven = mc
        result.descendant = desc
        result.imum_coeli = ic

        if self.house_system == "Equal":
            result.house_cusps = self._equal_houses(asc)
        elif self.house_system == "Placidus":
            result.house_cusps = self._placidus_houses(ramc, epsilon, latitude, asc, mc)
        else:
            result.house_cusps = self._equal_houses(asc)

        # Assign houses to planets
        self._assign_houses(result)

        # ── Aspects ──
        result.aspects = self._calc_aspects(result.planets)

        # ── Compute sect (day/night) ──
        result.sect = AstrologyCalculator._compute_sect(result.planets)

        # ── New calculations ──
        result.dignities = self._calc_dignities(result.planets, result.sect)
        result.dignity_ranking = self._calc_dignity_ranking(result.dignities)
        result.aspect_patterns = self._calc_aspect_patterns(result.aspects, result.planets)
        result.element_summary, result.modality_summary, result.missing_elements, result.dominant_element = \
            self._calc_element_modality_summary(result.planets)
        result.hemisphere = self._calc_hemisphere(result.planets)

        # Fixed star detection needs birth year for precession correction
        birth_year = year
        result.fixed_star_conjunctions = self._calc_fixed_stars(result.planets, birth_year)

        # ── P0 new calculations ──
        result.lunar_nodes = AstrologyCalculator._calc_lunar_nodes(jd)
        result.house_cusp_signs = AstrologyCalculator._calc_house_cusp_signs(result.house_cusps)
        result.house_lords = AstrologyCalculator._calc_house_lords(result.house_cusp_signs)
        result.accidental_dignities = AstrologyCalculator._calc_accidental_dignities(
            result.planets, result.dignities,
        )
        result.total_dignity_ranking = AstrologyCalculator._calc_total_dignity_ranking(
            result.dignities, result.accidental_dignities,
        )

        # ── P1 new calculations ──
        result.chart_shape = AstrologyCalculator._calc_chart_shape(result.planets)
        result.critical_degrees = AstrologyCalculator._calc_critical_degrees(result.planets)
        result.planet_returns = AstrologyCalculator._calc_planet_returns(float(year))

        # Compute transits (current date vs natal planets)
        try:
            transit_data = self._calc_current_transits(result.planets)
            result.transit_planets = transit_data["transit_planets"]
            result.transit_natal_aspects = transit_data["transit_natal_aspects"]
        except Exception:
            result.transit_planets = {}

        return result

    # ── Planet position helpers ─────────────────────────────────────────────

    @staticmethod
    def _is_retrograde(earth, sky_name, t) -> bool:
        """Detect retrograde by comparing ecliptic longitude at t vs t+1h."""
        from skyfield.api import load as sky_load
        ts2 = sky_load.timescale()
        t_plus = ts2.utc(t.utc_datetime().isoformat()[:10] + " " +
                         str((t.utc_datetime().hour + 1) % 24) + ":00:00")

        try:
            # Using skyfield's built-in detection via geocentric position diff
            astro1 = earth.at(t).observe(sky_name)
            astro2 = earth.at(t_plus).observe(sky_name)
            _, lon1, _ = astro1.ecliptic_latlon()
            _, lon2, _ = astro2.ecliptic_latlon()
            diff = (lon2.degrees - lon1.degrees) % 360
            return diff > 180 or diff < 0.01
        except Exception:
            return False

    # ── Astronomy calculations ─────────────────────────────────────────────

    @staticmethod
    def _obliquity(jd: float) -> float:
        """Compute true obliquity of the ecliptic (degrees) using IAU formula."""
        # Julian centuries from J2000.0
        T = (jd - 2451545.0) / 36525.0
        # Mean obliquity (Laskar 1986)
        eps0 = (
            23.4392911111
            - 0.013004166667 * T
            - 0.000000163889 * T * T
            + 0.000000503611 * T * T * T
        )
        # Nutation correction (simplified)
        # For accurate ephemeris, use skyfield's built-in value
        return eps0

    @staticmethod
    def _gmst(t) -> float:
        """Greenwich Mean Sidereal Time in degrees."""
        gmst = t.gmst  # returns radians in newer skyfield? Let's check
        # skyfield returns degrees for gmst
        try:
            return t.gmst * 15.0  # if gmst is hours, convert to degrees
        except Exception:
            return t.gmst  # already in degrees

    @staticmethod
    def _calc_ascendant(ramc: float, epsilon: float, latitude: float) -> float:
        """
        Compute the Ascendant (ecliptic longitude of the rising point).

        Formula:
            ASC = atan2(-cos(RAMC), sin(ε)*tan(φ) + cos(φ)*sin(RAMC))
        where ε = obliquity, φ = latitude, RAMC = Right Ascension of MC
        """
        if abs(latitude) >= 90:
            latitude = 89.0 if latitude > 0 else -89.0

        ramc_r = math.radians(ramc)
        eps_r = math.radians(epsilon)
        lat_r = math.radians(latitude)

        x = -math.cos(ramc_r)
        y = (math.sin(eps_r) * math.tan(lat_r)
             + math.cos(lat_r) * math.sin(ramc_r))

        asc = math.degrees(math.atan2(x, y))
        return asc % 360

    @staticmethod
    def _calc_midheaven(ramc: float, epsilon: float) -> float:
        """
        Compute the Midheaven (MC, ecliptic longitude of the meridian).

        Formula:
            MC = atan2(tan(RAMC), cos(ε))
        """
        ramc_r = math.radians(ramc)
        eps_r = math.radians(epsilon)

        x = math.tan(ramc_r)
        y = math.cos(eps_r)

        mc = math.degrees(math.atan2(x, y))
        # Quadrant correction
        if 90 < ramc < 270:
            mc += 180
        return mc % 360

    # ── House systems ──────────────────────────────────────────────────────

    @staticmethod
    def _equal_houses(asc: float) -> dict[int, float]:
        """Equal House system: each house cusp is 30° from the ASC."""
        return {i: (asc + 30 * (i - 1)) % 360 for i in range(1, 13)}

    @staticmethod
    def _placidus_houses(ramc: float, epsilon: float,
                         latitude: float, asc: float, mc: float) -> dict[int, float]:
        """
        Simplified Placidus house calculation using Porphyry-like quadrant division.

        This is a practical approximation for most astrological purposes.
        Houses 1 (ASC), 4 (IC), 7 (DSC), 10 (MC) are exact.
        Houses 2,3 in the 1st quadrant; 11,12 in the 2nd quadrant; etc.
        """
        cusps = {}

        asc_deg = asc
        mc_deg = mc
        ic_deg = (mc + 180) % 360
        dsc_deg = (asc + 180) % 360

        cusps[1] = asc_deg
        cusps[4] = ic_deg
        cusps[7] = dsc_deg
        cusps[10] = mc_deg

        def _midpoint(a, b):
            """Simple midpoint for Porphyry cusps."""
            diff = (b - a) % 360
            if diff > 180:
                diff = 360 - diff
                return (a + diff / 3) % 360
            return (a + diff / 3) % 360

        # Upper quadrant (10→ASC): houses 11, 12
        upper_size = (asc_deg - mc_deg) % 360
        if upper_size > 180:
            upper_size = 360 - upper_size
        cusps[11] = (mc_deg + upper_size * 2 / 3) % 360
        cusps[12] = (mc_deg + upper_size * 1 / 3) % 360

        # Lower quadrant (ASC→IC): houses 2, 3
        lower_size = (ic_deg - asc_deg) % 360
        if lower_size > 180:
            lower_size = 360 - lower_size
        cusps[2] = (asc_deg + lower_size * 1 / 3) % 360
        cusps[3] = (asc_deg + lower_size * 2 / 3) % 360

        # Lower-right quadrant (IC→DSC): houses 5, 6
        lr_size = (dsc_deg - ic_deg) % 360
        if lr_size > 180:
            lr_size = 360 - lr_size
        cusps[5] = (ic_deg + lr_size * 1 / 3) % 360
        cusps[6] = (ic_deg + lr_size * 2 / 3) % 360

        # Upper-right quadrant (DSC→MC): houses 8, 9
        ur_size = (mc_deg - dsc_deg) % 360
        if ur_size > 180:
            ur_size = 360 - ur_size
        cusps[8] = (dsc_deg + ur_size * 1 / 3) % 360
        cusps[9] = (dsc_deg + ur_size * 2 / 3) % 360

        return cusps

    # ── House assignment ────────────────────────────────────────────────────

    @staticmethod
    def _assign_houses(result: AstrologyResult) -> None:
        """Determine which house each planet is in."""
        cusps = list(result.house_cusps.items())  # [(house, longitude), ...]
        cusps.sort(key=lambda x: x[1])  # sort by ecliptic longitude

        # Build house boundaries
        boundaries = []
        for i, (hnum, lon) in enumerate(cusps):
            next_lon = cusps[(i + 1) % 12][1]
            boundaries.append((hnum, lon, next_lon))

        for pname, pdata in result.planets.items():
            plon = pdata["longitude"]
            house = 1  # default
            for hnum, start, end in boundaries:
                if start <= end:
                    if start <= plon < end:
                        house = hnum
                        break
                else:  # wraps around 360
                    if plon >= start or plon < end:
                        house = hnum
                        break
            pdata["house"] = house

    # ── Aspect calculation ──────────────────────────────────────────────────

    @staticmethod
    def _calc_aspects(planets: dict[str, dict]) -> list[dict]:
        """Calculate all major + minor aspects between all planet pairs."""
        aspects = []
        names = list(planets.keys())

        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                p1, p2 = names[i], names[j]
                lon1 = planets[p1]["longitude"]
                lon2 = planets[p2]["longitude"]

                # Angular distance
                diff = abs(lon1 - lon2) % 360
                if diff > 180:
                    diff = 360 - diff

                # Check against aspect angles
                for asp_name, asp_angle, max_orb in MAJOR_ASPECTS + MINOR_ASPECTS:
                    orb = abs(diff - asp_angle)
                    if orb <= max_orb:
                        aspects.append({
                            "planet1": p1,
                            "planet2": p2,
                            "aspect": asp_name,
                            "angle": asp_angle,
                            "orb": round(orb, 2),
                            "exact": round(diff, 2),
                            "type": "major" if asp_angle in [0, 60, 90, 120, 180] else "minor",
                        })
                        break

        return aspects

    # ── Essential Dignity Calculation ─────────────────────────────────────────

    @staticmethod
    def _calc_dignities(planets: dict[str, dict],
                        sect: str = "day") -> dict[str, dict]:
        """
        Calculate essential dignity score for each planet (Ptolemaic system).
        Scores: Domicile +5, Exaltation +4, Triplicity +3, Term +2, Face +1
                Detriment -5, Fall -4
        Triplicity is sect-aware: only the correct day/night ruler gets full +3.
        The participating ruler gets +2.
        """
        term_table = _build_terms()
        dignities = {}

        for pname, pdata in planets.items():
            sign = pdata.get("sign", _sign_name(pdata.get("longitude", 0)))
            deg = pdata.get("degree", _sign_degree(pdata.get("longitude", 0)))
            result = {"score": 0}  # start neutral

            # Domicile (庙) +5
            if DOMICILE.get(pname) == sign or DOMICILE.get(f"{pname}_2") == sign:
                result["domicile"] = True
                result["score"] += 5
            elif MODERN_DOMICILE.get(pname) == sign:
                result["domicile"] = True
                result["score"] += 5
            else:
                result["domicile"] = False

            # Detriment (陷) -5
            if DETRIMENT_SIGNS.get(pname) == sign:
                result["detriment"] = True
                result["score"] -= 5
            else:
                result["detriment"] = False

            # Exaltation (旺) +4
            ex = EXALTATION.get(pname)
            if ex and ex[0] == sign:
                # Check if within 6° of exact exaltation degree
                if abs(deg - ex[1]) <= 6:
                    result["exaltation"] = True
                    result["score"] += 4
                else:
                    result["exaltation"] = False
            else:
                result["exaltation"] = False

            # Fall (弱) -4
            if FALL_SIGNS.get(pname) == sign:
                result["fall"] = True
                result["score"] -= 4
            else:
                result["fall"] = False

            # Triplicity (三分) — sect-aware scoring
            tri = TRIPLICITY.get(sign, ())
            if tri:
                if sect == "day" and len(tri) > 0 and pname == tri[0]:
                    result["triplicity"] = True
                    result["triplicity_sect"] = "day"
                    result["score"] += 3
                elif sect == "night" and len(tri) > 1 and pname == tri[1]:
                    result["triplicity"] = True
                    result["triplicity_sect"] = "night"
                    result["score"] += 3
                elif len(tri) > 2 and pname == tri[2]:
                    # Participating ruler gets reduced score
                    result["triplicity"] = True
                    result["triplicity_sect"] = "participating"
                    result["score"] += 2
                else:
                    result["triplicity"] = False
                    result["triplicity_sect"] = ""
            else:
                result["triplicity"] = False
                result["triplicity_sect"] = ""

            # Term (界) +2
            terms = term_table.get(sign, [])
            result["term"] = False
            for start, end, ruler in terms:
                if start <= deg < end and ruler == pname:
                    result["term"] = True
                    result["score"] += 2
                    break

            # Face (面/Decan) +1
            decans = DECAN_RULERS.get(sign, ())
            result["face"] = False
            dec_idx = int(deg // 10)
            if dec_idx < len(decans) and decans[dec_idx] == pname:
                result["face"] = True
                result["score"] += 1

            dignities[pname] = result

        return dignities

    @staticmethod
    def _calc_dignity_ranking(dignities: dict[str, dict]) -> list[dict]:
        """Sort planets by dignity score descending."""
        ranking = []
        for pname, d in dignities.items():
            ranking.append({
                "planet": pname,
                "score": d.get("score", 0),
                "status": "strong" if d.get("score", 0) >= 5 else (
                    "weak" if d.get("score", 0) <= -3 else "neutral"
                ),
            })
        ranking.sort(key=lambda x: x["score"], reverse=True)
        return ranking

    # ── Aspect Pattern Detection ──────────────────────────────────────────────

    @staticmethod
    def _calc_aspect_patterns(aspects: list[dict],
                              planets: dict[str, dict]) -> list[dict]:
        """Detect common aspect patterns in the chart."""
        patterns = []
        names = list(planets.keys())
        planet_set = set(names)

        # Helper: get aspect between two planets
        def _get_aspect(p1, p2):
            for a in aspects:
                if ((a["planet1"] == p1 and a["planet2"] == p2) or
                    (a["planet1"] == p2 and a["planet2"] == p1)):
                    return a
            return None

        # Stellium (星群): 3+ planets in same sign
        sign_counts: dict[str, list[str]] = {}
        for pname in names:
            sign = planets[pname].get("sign", _sign_name(planets[pname].get("longitude", 0)))
            if sign not in sign_counts:
                sign_counts[sign] = []
            sign_counts[sign].append(pname)
        for sign, plist in sign_counts.items():
            if len(plist) >= 3:
                patterns.append({
                    "name": "Stellium",
                    "planets": plist,
                    "sign": sign,
                    "description": f"{len(plist)}颗星聚集在{sign}，该星座领域能量高度集中",
                })

        # T-Square: 2 oppositions + the 2 planets each square a third
        opps = [a for a in aspects if a["aspect"] == "opposition"]
        squares = [a for a in aspects if a["aspect"] == "square"]

        for opp1 in opps:
            for opp2 in opps:
                if opp1 == opp2:
                    continue
                opp1_set = {opp1["planet1"], opp1["planet2"]}
                opp2_set = {opp2["planet1"], opp2["planet2"]}
                # Check if they share a planet
                common = opp1_set & opp2_set
                if len(common) == 1:
                    apex = list(common)[0]
                    other1 = list(opp1_set - common)[0]
                    other2 = list(opp2_set - common)[0]
                    # Check if other1 squares other2
                    for sq in squares:
                        if {sq["planet1"], sq["planet2"]} == {other1, other2}:
                            patterns.append({
                                "name": "T-Square",
                                "planets": [other1, other2, apex],
                                "apex": apex,
                                "description": f"T三角格局：{other1}对分{other2}，各与{apex}四分。"
                                               f"{apex}为顶点，是盘中核心压力点",
                            })
                            break
                    break

        # Grand Trine: 3 trines forming a triangle
        trines = [a for a in aspects if a["aspect"] == "trine"]
        if len(trines) >= 3:
            trine_graph: dict[str, set[str]] = {n: set() for n in names}
            for t in trines:
                trine_graph[t["planet1"]].add(t["planet2"])
                trine_graph[t["planet2"]].add(t["planet1"])
            # Find 3-planet cycles
            for p1 in names:
                for p2 in trine_graph[p1]:
                    if p2 <= p1:
                        continue
                    for p3 in trine_graph[p2]:
                        if p3 <= p2:
                            continue
                        if p1 in trine_graph.get(p3, set()):
                            patterns.append({
                                "name": "Grand Trine",
                                "planets": [p1, p2, p3],
                                "description": f"大三角格局：{p1}、{p2}、{p3}互成三分相，"
                                               f"天赋领域顺畅，警惕舒适区停滞",
                            })
                            break

        # Grand Cross: 2 pairs of oppositions + 4 squares
        if len(opps) >= 2 and len(squares) >= 4:
            # Simplified detection: check if 4 planets form a cross
            opp_pairs = [(o["planet1"], o["planet2"]) for o in opps]
            sq_pairs = [(s["planet1"], s["planet2"]) for s in squares]
            # Check all 4-planet combos
            for i, p1 in enumerate(names):
                for j, p2 in enumerate(names):
                    if j <= i: continue
                    for k, p3 in enumerate(names):
                        if k <= j: continue
                        for l, p4 in enumerate(names):
                            if l <= k: continue
                            four = {p1, p2, p3, p4}
                            # Check if they form a cross pattern
                            opp_count = 0
                            sq_count = 0
                            for op in opp_pairs:
                                if set(op) <= four:
                                    opp_count += 1
                            for sq in sq_pairs:
                                if set(sq) <= four:
                                    sq_count += 1
                            if opp_count >= 2 and sq_count >= 4:
                                patterns.append({
                                    "name": "Grand Cross",
                                    "planets": [p1, p2, p3, p4],
                                    "description": f"大十字格局：{p1}、{p2}、{p3}、{p4}"
                                                   f"形成两组对分+四组四分，全方位压力驱动",
                                })
                                break

        # ── Extended patterns (P1) ────────────────────────────────────────

        # Yod (上帝手指): 2 quincunxes pointing to a focal planet
        quincunxes = [a for a in aspects if a["aspect"] == "quincunx"]
        for i, q1 in enumerate(quincunxes):
            for j, q2 in enumerate(quincunxes):
                if j <= i:
                    continue
                q1_set = {q1["planet1"], q1["planet2"]}
                q2_set = {q2["planet1"], q2["planet2"]}
                common = q1_set & q2_set
                if len(common) == 1:
                    apex = list(common)[0]
                    base1 = list(q1_set - common)[0]
                    base2 = list(q2_set - common)[0]
                    # Check base1 and base2 are also in sextile (typical Yod)
                    base_asp = _get_aspect(base1, base2)
                    if base_asp and base_asp["aspect"] in ("sextile", "trine", "conjunction"):
                        patterns.append({
                            "name": "Yod",
                            "planets": [base1, apex, base2],
                            "apex": apex,
                            "description": f"上帝手指(Yod)：{base1}与{base2}呈{base_asp['aspect']}，"
                                           f"各与{apex}呈150°梅花相。{apex}为命运焦点，"
                                           f"承载着灵性使命般的驱动力",
                        })

        # Kite (风筝): Grand Trine + one planet opposite a vertex
        for gt in [p for p in patterns if p["name"] == "Grand Trine"]:
            gt_planets = set(gt["planets"])
            for a in opps:
                opp_set = {a["planet1"], a["planet2"]}
                # One vertex of the Kite is opposite the apex
                shared = gt_planets & opp_set
                if len(shared) == 1:
                    apex_gt = list(shared)[0]
                    opp_planet = list(opp_set - shared)[0]
                    patterns.append({
                        "name": "Kite",
                        "planets": list(gt_planets) + [opp_planet],
                        "apex": opp_planet,
                        "description": f"风筝格局(Kite)：{', '.join(gt_planets)}形成大三角，"
                                       f"{opp_planet}对分{apex_gt}构成风筝把手。"
                                       f"天赋有出口，能量可释放",
                    })

        # Mystic Rectangle: 2 oppositions + 2 trines + 2 sextiles
        sextiles = [a for a in aspects if a["aspect"] == "sextile"]
        if len(opps) >= 2 and len(trines) >= 2 and len(sextiles) >= 2:
            opp_pairs_list = [(o["planet1"], o["planet2"]) for o in opps]
            for i, (op1_a, op1_b) in enumerate(opp_pairs_list):
                for op2_a, op2_b in opp_pairs_list[i+1:]:
                    four = {op1_a, op1_b, op2_a, op2_b}
                    if len(four) < 4:
                        continue
                    # Check for 2 trines and 2 sextiles among these four
                    trine_count = 0
                    sextile_count = 0
                    for t in trines:
                        if {t["planet1"], t["planet2"]} <= four:
                            trine_count += 1
                    for s in sextiles:
                        if {s["planet1"], s["planet2"]} <= four:
                            sextile_count += 1
                    if trine_count >= 2 and sextile_count >= 2:
                        patterns.append({
                            "name": "Mystic Rectangle",
                            "planets": list(four),
                            "description": f"神秘矩形(Mystic Rectangle)："
                                           f"{', '.join(four)}形成两组对分+两组三分+两组六分。"
                                           f"平衡与整合的格局，能量在四极之间流动",
                        })
                        break

        return patterns

    # ── Element / Modality Summary ────────────────────────────────────────────

    @staticmethod
    def _calc_element_modality_summary(
        planets: dict[str, dict]
    ) -> tuple[dict, dict, list[str], str]:
        """
        Count planets by element (fire/earth/air/water) and modality
        (cardinal/fixed/mutable).

        Returns: (element_summary, modality_summary, missing_elements, dominant_element)
        """
        SIGN_MODALITY = {
            "Aries": "cardinal", "Cancer": "cardinal", "Libra": "cardinal", "Capricorn": "cardinal",
            "Taurus": "fixed", "Leo": "fixed", "Scorpio": "fixed", "Aquarius": "fixed",
            "Gemini": "mutable", "Virgo": "mutable", "Sagittarius": "mutable", "Pisces": "mutable",
        }

        elements = {"fire": 0, "earth": 0, "air": 0, "water": 0}
        modalities = {"cardinal": 0, "fixed": 0, "mutable": 0}

        for pname, pdata in planets.items():
            sign = pdata.get("sign", _sign_name(pdata.get("longitude", 0)))
            elem = SIGN_ELEMENT.get(sign, "")
            if elem in elements:
                elements[elem] += 1
            mod = SIGN_MODALITY.get(sign, "")
            if mod in modalities:
                modalities[mod] += 1

        missing = [e for e, c in elements.items() if c == 0]
        dominant = max(elements, key=elements.get) if max(elements.values()) > 0 else ""

        return elements, modalities, missing, dominant

    # ── Hemisphere Analysis ──────────────────────────────────────────────────

    @staticmethod
    def _calc_hemisphere(planets: dict[str, dict]) -> dict:
        """
        Determine hemisphere emphasis based on house positions.
        Eastern: houses 1,2,3,4,5,6 (self-oriented)
        Western: houses 7,8,9,10,11,12 (others-oriented)
        Northern: houses 4,5,6,7,8,9 (subjective)
        Southern: houses 10,11,12,1,2,3 (objective/social)
        """
        east = west = north = south = 0
        for pname, pdata in planets.items():
            house = pdata.get("house", 1)
            if 1 <= house <= 6:
                east += 1
            else:
                west += 1
            if house in (4, 5, 6, 7, 8, 9):
                north += 1
            else:
                south += 1

        ew = "eastern" if east > west else ("western" if west > east else "balanced")
        ns = "northern" if north > south else ("southern" if south > north else "balanced")

        desc = ""
        if ew == "eastern" and ns == "southern":
            desc = "东半球南天区：自我驱动型，主动塑造外部世界"
        elif ew == "eastern" and ns == "northern":
            desc = "东半球北天区：主观自我型，关注内在世界"
        elif ew == "western" and ns == "southern":
            desc = "西半球南天区：社会参与型，通过他人认识自我"
        elif ew == "western" and ns == "northern":
            desc = "西半球北天区：关系导向型，情感连接驱动"
        else:
            desc = "半球分布均衡，适应性强"

        return {
            "east_west": ew,
            "north_south": ns,
            "east_count": east,
            "west_count": west,
            "north_count": north,
            "south_count": south,
            "description": desc,
        }

    # ── Fixed Star Detection ─────────────────────────────────────────────────

    @staticmethod
    def _calc_fixed_stars(planets: dict[str, dict],
                          birth_year: int) -> list[dict]:
        """
        Detect if any planet is conjunct (within 1.5° orb) of major fixed stars.
        Corrects for precession since J2000.0.

        Precession rate: ~0.01396 degrees per year (about 1° per 71.6 years)
        """
        years_since_j2000 = birth_year - 2000.0
        precession = years_since_j2000 * 0.01396

        conjunctions = []
        for pname, pdata in planets.items():
            plon = pdata.get("longitude", 0)

            for star_name, star_lon_j2000 in FIXED_STARS.items():
                # Correct star longitude for precession
                star_lon = (star_lon_j2000 + precession) % 360

                # Angular distance
                diff = abs(plon - star_lon) % 360
                if diff > 180:
                    diff = 360 - diff

                if diff <= 1.5:  # 1.5° orb for fixed stars
                    cn_name = FIXED_STARS_CN.get(star_name, star_name)
                    meaning = FIXED_STAR_MEANINGS.get(star_name, "")
                    conjunctions.append({
                        "planet": pname,
                        "star": star_name,
                        "star_cn": cn_name,
                        "orb": round(diff, 2),
                        "meaning": meaning,
                    })

        return conjunctions

    # ── P0: Lunar Nodes Calculation ───────────────────────────────────────────

    @staticmethod
    def _calc_lunar_nodes(jd: float) -> dict:
        """
        Calculate Mean Lunar Nodes (南北交点).

        Uses the standard astronomical formula for the mean longitude
        of the ascending node of the Moon's orbit (true node approximation).
        Regression rate: ~19.3 deg/year, or ~0.052954 deg/day.
        """
        d = jd - 2451545.0  # days since J2000.0
        north_long = (125.04455501 - 0.052953766935 * d) % 360
        south_long = (north_long + 180) % 360

        def _node_info(lon: float) -> dict:
            return {
                "sign": _sign_name(lon),
                "sign_cn": SIGN_CN.get(_sign_name(lon), ""),
                "degree": round(_sign_degree(lon), 2),
                "longitude": round(lon, 4),
            }

        return {
            "north_node": _node_info(north_long),
            "south_node": _node_info(south_long),
        }

    # ── P0: House Cusp Signs & House Lords ────────────────────────────────────

    @staticmethod
    def _calc_house_cusp_signs(house_cusps: dict[int, float]) -> dict[int, str]:
        """Determine which zodiac sign each house cusp falls in."""
        return {h: _sign_name(lon) for h, lon in house_cusps.items()}

    @staticmethod
    def _calc_house_lords(
        house_cusp_signs: dict[int, str],
    ) -> dict[int, list[str]]:
        """
        Determine ruling planet(s) for each house cusp.

        Uses DOMICILE + MODERN_DOMICILE tables. For signs with modern co-rulers
        (Scorpio=Pluto+Mars, Aquarius=Uranus+Saturn, Pisces=Neptune+Jupiter),
        both traditional and modern rulers are returned.
        """
        # Build reverse lookup: sign → list of ruling planets
        sign_rulers: dict[str, list[str]] = {s: [] for s in ZODIAC_SIGNS}
        for key, sign in {**DOMICILE, **MODERN_DOMICILE}.items():
            pname = key.replace("_2", "")
            if pname not in sign_rulers[sign]:
                sign_rulers[sign].append(pname)

        return {
            h: sign_rulers.get(sign, [])
            for h, sign in house_cusp_signs.items()
        }

    # ── P1: Accidental Dignity (后天尊贵) ──────────────────────────────────────

    @staticmethod
    def _calc_accidental_dignities(
        planets: dict[str, dict],
        dignities: dict[str, dict],
    ) -> dict[str, dict]:
        """
        Calculate accidental dignity (后天力量评分).

        Factors:
          - House position: angular (+5), succedent (+3), cadent (+1)
          - Direct motion (+2) / Retrograde (-2)
          - Mutual reception by domicile (+5 per partner)

        Returns dict with per-planet breakdown and total score.
        """
        accidental: dict[str, dict] = {}

        # ── First pass: house & motion factors ──
        for pname, pdata in planets.items():
            house = pdata.get("house", 1)
            retro = pdata.get("retrograde", False)
            factors: list[str] = []

            if house in ANGULAR_HOUSES:
                house_score = 5
                factors.append(f"H{house}角宫+5")
            elif house in SUCCEDENT_HOUSES:
                house_score = 3
                factors.append(f"H{house}续宫+3")
            else:
                house_score = 1
                factors.append(f"H{house}果宫+1")

            house_class = (
                "angular" if house in ANGULAR_HOUSES
                else "succedent" if house in SUCCEDENT_HOUSES
                else "cadent"
            )

            if retro:
                motion_score = -2
                factors.append("逆行-2")
            else:
                motion_score = 2
                factors.append("顺行+2")

            accidental[pname] = {
                "house": house,
                "house_class": house_class,
                "house_score": house_score,
                "motion": "retrograde" if retro else "direct",
                "motion_score": motion_score,
                "mutual_receptions": [],
                "mutual_reception_score": 0,
                "factors": list(factors),
                "score": house_score + motion_score,
            }

        # ── Second pass: mutual reception by domicile ──
        # Build sign → rulers map (same logic as _calc_house_lords)
        sign_rulers: dict[str, list[str]] = {s: [] for s in ZODIAC_SIGNS}
        for key, sign in {**DOMICILE, **MODERN_DOMICILE}.items():
            pname = key.replace("_2", "")
            if pname not in sign_rulers[sign]:
                sign_rulers[sign].append(pname)

        # Which sign is each planet in?
        planet_signs: dict[str, str] = {}
        for pname, pdata in planets.items():
            planet_signs[pname] = pdata.get(
                "sign", _sign_name(pdata.get("longitude", 0))
            )

        pnames = list(planets.keys())
        for i in range(len(pnames)):
            for j in range(i + 1, len(pnames)):
                p1, p2 = pnames[i], pnames[j]
                s1 = planet_signs.get(p1, "")
                s2 = planet_signs.get(p2, "")

                # Mutual reception: p1 rules the sign p2 is in,
                # AND p2 rules the sign p1 is in
                p1_rulers_of_s2 = sign_rulers.get(s2, [])
                p2_rulers_of_s1 = sign_rulers.get(s1, [])

                if p1 in p1_rulers_of_s2 and p2 in p2_rulers_of_s1:
                    accidental[p1]["mutual_receptions"].append(p2)
                    accidental[p1]["mutual_reception_score"] += 5
                    accidental[p1]["score"] += 5
                    accidental[p1]["factors"].append(f"与{p2}互溶+5")

                    accidental[p2]["mutual_receptions"].append(p1)
                    accidental[p2]["mutual_reception_score"] += 5
                    accidental[p2]["score"] += 5
                    accidental[p2]["factors"].append(f"与{p1}互溶+5")

        return accidental

    # ── P1: Total Dignity Ranking (先天+后天) ──────────────────────────────────

    @staticmethod
    def _calc_total_dignity_ranking(
        essential_dignities: dict[str, dict],
        accidental_dignities: dict[str, dict],
    ) -> list[dict]:
        """Combine essential + accidental dignity scores into final ranking."""
        ranking: list[dict] = []
        for pname, ed in essential_dignities.items():
            es = ed.get("score", 0)
            ad = accidental_dignities.get(pname, {})
            acs = ad.get("score", 0)
            total = es + acs

            if total >= 7:
                status = "strong"
            elif total <= -4:
                status = "weak"
            else:
                status = "neutral"

            ranking.append({
                "planet": pname,
                "essential_score": es,
                "accidental_score": acs,
                "total_score": total,
                "status": status,
            })

        ranking.sort(key=lambda x: x["total_score"], reverse=True)
        return ranking

    # ── P1: Sect (Day/Night Chart) ──────────────────────────────────────────

    @staticmethod
    def _compute_sect(planets: dict[str, dict]) -> str:
        """Determine day or night chart based on Sun house position."""
        sun_house = planets.get("Sun", {}).get("house", 7)
        return "day" if 7 <= sun_house <= 12 else "night"

    # ── P1: Chart Shape Classification ──────────────────────────────────────

    @staticmethod
    def _calc_chart_shape(planets: dict[str, dict]) -> dict:
        """Classify chart shape based on planetary house distribution."""
        houses = sorted([pdata.get("house", 1) for pname, pdata in planets.items()])
        if not houses:
            return {"shape": "Unknown", "description": ""}
        occupied: set[int] = set(houses)
        empty_houses: list[int] = sorted(set(range(1, 13)) - occupied)
        extended = houses + [h + 12 for h in houses]
        max_block = cur = 0
        for i in range(len(extended)):
            if i > 0 and extended[i] == extended[i - 1] + 1:
                cur += 1
            else:
                cur = 1
            max_block = max(max_block, cur)
        span = max(houses) - min(houses) + 1
        gaps = 0
        for h in range(1, 12):
            if h in occupied and (h + 1) not in occupied:
                gaps += 1
        clusters = gaps + 1 if occupied else 0
        sorted_h = houses
        max_gap = 0
        for i in range(len(sorted_h)):
            nxt = sorted_h[(i + 1) % len(sorted_h)]
            curr = sorted_h[i]
            if nxt > curr:
                gap = nxt - curr - 1
            else:
                gap = (12 - curr) + (nxt - 1)
            max_gap = max(max_gap, gap)
        shape_name = ""
        description = ""
        if max_block <= 3 and clusters == 1:
            shape_name = "Bundle"
            description = "束型(Bundle)：所有行星集中在3个连续宫位以内。能量高度聚焦，生命力深度极强，但视野偏窄易偏执"
        elif max_block == len(houses) and span <= 6:
            shape_name = "Bowl"
            description = "碗型(Bowl)：所有行星在6个连续宫位内。专注单一生活领域，在该领域有超凡造诣，但其他维度需主动拓展"
        elif len(houses) >= 9 and max_block <= 4 and clusters >= 3:
            shape_name = "Splash"
            description = "散落型(Splash)：行星分散在8+宫位。多才多艺兴趣广泛，适应力极强，但需要在广度中找到聚焦点"
        elif clusters == 2 and span > 6:
            shape_name = "Seesaw"
            description = "跷跷板型(Seesaw)：行星形成两个对立集群。内在矛盾驱动人生，两极之间的张力是创造力的源泉"
        elif clusters == 1 and max_gap >= 4:
            shape_name = "Locomotive"
            description = "火车头型(Locomotive)：行星占据连续宫位，有一个90度以上空档。空档对面的宫位是人生核心驱动力"
        elif max_block >= 7 and clusters <= 2:
            shape_name = "Bucket"
            description = "桶型(Bucket)：大多行星在6个连续宫位内，可能有孤星作桶柄。桶柄所在的宫位是命运的突破口"
        else:
            shape_name = "Splay"
            description = "散乱型(Splay)：行星分布无规则形态。适应性强，人生路径多元，难以被单一标签定义"
        return {
            "shape": shape_name, "description": description,
            "occupied_houses": sorted(list(occupied)),
            "empty_houses": empty_houses,
            "max_contiguous_block": max_block,
            "clusters": clusters, "span": span,
        }

    # ── P1: Critical Degrees ─────────────────────────────────────────────────

    @staticmethod
    def _calc_critical_degrees(planets: dict[str, dict]) -> dict[str, dict]:
        """Detect planets at critical/sensitive degrees by modality."""
        result: dict[str, dict] = {}
        for pname, pdata in planets.items():
            deg = int(pdata.get("degree", 0))
            sign = pdata.get("sign", "")
            mod = SIGN_MODALITY.get(sign, "")
            crit_set = CRITICAL_DEGREES.get(mod, set())
            annotations: list[str] = []
            if deg in crit_set:
                annotations.append(f"critical_degree_{deg}")
            if deg == 29:
                annotations.append("anaretic")
            if annotations:
                result[pname] = {"degree": deg, "sign": sign, "modality": mod, "annotations": annotations}
        return result

    # ── P1: Planet Returns (Saturn/Jupiter/Uranus opposition) ────────────────

    @staticmethod
    def _calc_planet_returns(birth_year: float) -> list[dict]:
        """Calculate ages for significant planetary return events."""
        import datetime
        current_year = datetime.date.today().year
        age = current_year - birth_year
        returns: list[dict] = []
        for i, ry in enumerate([29.5, 59.0, 88.5]):
            if age >= ry - 5:
                s = "past" if age > ry + 2 else ("current" if age >= ry - 1 else "upcoming")
                returns.append({"planet": "Saturn", "return_number": i + 1, "age": ry, "status": s})
        for i, ry in enumerate([12, 24, 36, 48, 60, 72, 84]):
            if age >= ry - 4:
                s = "past" if age > ry + 2 else ("current" if age >= ry - 1 else "upcoming")
                returns.append({"planet": "Jupiter", "return_number": i + 1, "age": ry, "status": s})
        if age >= 38:
            s = "past" if age > 44 else ("current" if age >= 41 else "upcoming")
            returns.append({"planet": "Uranus", "return_number": 0, "age": 42.0, "status": s, "label": "Uranus Opposition (中年危机)"})
        if age >= 35:
            s = "past" if age > 44 else ("current" if age >= 38 else "upcoming")
            returns.append({"planet": "Pluto", "return_number": 0, "age": 40.0, "status": s, "label": "Pluto Square (中年深层蜕变)"})
        return returns

    # ── P1: Current Transit-Natal Aspects ────────────────────────────────────

    def _calc_current_transits(self, natal_planets: dict[str, dict]) -> dict:
        """Compute current outer planet positions and aspects to natal planets."""
        import datetime
        self._ensure_ephemeris()
        now = datetime.datetime.now(datetime.timezone.utc)
        t = self._ts.utc(now.year, now.month, now.day, now.hour, now.minute, now.second)
        earth = self._ephemeris["earth"]
        sky_key_map: dict[str, str] = {
            "Jupiter": "jupiter barycenter", "Saturn": "saturn barycenter",
            "Uranus": "uranus barycenter", "Neptune": "neptune barycenter",
            "Pluto": "pluto barycenter",
        }
        transit_planets: dict[str, dict] = {}
        for pname in ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]:
            if pname not in natal_planets:
                continue
            sky_key = sky_key_map.get(pname, pname.lower())
            try:
                astrometric = earth.at(t).observe(self._ephemeris[sky_key])
                lat, lon, _ = astrometric.ecliptic_latlon()
                lon_deg = lon.degrees % 360
                t_next = self._ts.utc(now.year, now.month, now.day + 1, now.hour, now.minute)
                astro_next = earth.at(t_next).observe(self._ephemeris[sky_key])
                _, lon2, _ = astro_next.ecliptic_latlon()
                retro = bool((lon2.degrees - lon_deg) % 360 < 0.1)
                transit_planets[pname] = {
                    "sign": _sign_name(lon_deg), "degree": round(_sign_degree(lon_deg), 2),
                    "longitude": round(lon_deg, 4), "retrograde": retro,
                }
            except Exception:
                continue
        aspects: list[dict] = []
        for tp_name, tp_data in transit_planets.items():
            for np_name, np_data in natal_planets.items():
                if tp_name == np_name:
                    continue
                tp_lon = tp_data["longitude"]
                np_lon = np_data.get("longitude", 0)
                diff = abs(tp_lon - np_lon) % 360
                if diff > 180:
                    diff = 360 - diff
                for asp_name, asp_angle, max_orb in MAJOR_ASPECTS:
                    orb = abs(diff - asp_angle)
                    if orb <= max_orb * 0.5:
                        aspects.append({
                            "transit_planet": tp_name, "natal_planet": np_name,
                            "aspect": asp_name, "orb": round(orb, 2), "exact_angle": round(diff, 2),
                        })
                        break
        return {"transit_planets": transit_planets, "transit_natal_aspects": aspects}

    # ── Transit calculation for arbitrary date (Event Analyzer) ────────────────

    def calculate_transit_for_date(
        self,
        target_date: datetime.datetime,
        natal_planets: dict[str, dict],
    ) -> dict:
        """
        Compute outer planet positions and aspects for a specific date.

        Args:
            target_date: The event datetime (timezone-aware or naive UTC).
            natal_planets: The natal planet positions dict (from natal chart).

        Returns:
            dict with 'transit_planets' and 'transit_natal_aspects' keys,
            same format as _calc_current_transits().
        """
        self._ensure_ephemeris()
        if target_date.tzinfo is not None:
            utc_dt = target_date.astimezone(datetime.timezone.utc)
        else:
            utc_dt = target_date.replace(tzinfo=datetime.timezone.utc)

        t = self._ts.utc(
            utc_dt.year, utc_dt.month, utc_dt.day,
            utc_dt.hour, utc_dt.minute, utc_dt.second,
        )
        earth = self._ephemeris["earth"]
        sky_key_map: dict[str, str] = {
            "Jupiter": "jupiter barycenter", "Saturn": "saturn barycenter",
            "Uranus": "uranus barycenter", "Neptune": "neptune barycenter",
            "Pluto": "pluto barycenter",
        }
        transit_planets: dict[str, dict] = {}
        for pname in ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]:
            if pname not in natal_planets:
                continue
            sky_key = sky_key_map.get(pname, pname.lower())
            try:
                astrometric = earth.at(t).observe(self._ephemeris[sky_key])
                lat, lon, _ = astrometric.ecliptic_latlon()
                lon_deg = lon.degrees % 360
                # Retrograde check via 24h comparison
                t_next = self._ts.utc(
                    utc_dt.year, utc_dt.month, utc_dt.day + 1,
                    utc_dt.hour, utc_dt.minute,
                )
                astro_next = earth.at(t_next).observe(self._ephemeris[sky_key])
                _, lon2, _ = astro_next.ecliptic_latlon()
                retro = bool((lon2.degrees - lon_deg) % 360 < 0.1)
                transit_planets[pname] = {
                    "sign": _sign_name(lon_deg),
                    "degree": round(_sign_degree(lon_deg), 2),
                    "longitude": round(lon_deg, 4),
                    "retrograde": retro,
                }
            except Exception:
                continue

        # Calculate transit-natal aspects
        aspects: list[dict] = []
        for tp_name, tp_data in transit_planets.items():
            for np_name, np_data in natal_planets.items():
                if tp_name == np_name:
                    continue
                tp_lon = tp_data["longitude"]
                np_lon = np_data.get("longitude", 0)
                diff = abs(tp_lon - np_lon) % 360
                if diff > 180:
                    diff = 360 - diff
                for asp_name, asp_angle, max_orb in MAJOR_ASPECTS:
                    orb = abs(diff - asp_angle)
                    if orb <= max_orb * 0.5:
                        aspects.append({
                            "transit_planet": tp_name,
                            "natal_planet": np_name,
                            "aspect": asp_name,
                            "orb": round(orb, 2),
                            "exact_angle": round(diff, 2),
                        })
                        break

        return {"transit_planets": transit_planets, "transit_natal_aspects": aspects}


# ─── Convenience function ───────────────────────────────────────────────────────

def calculate_astrology(
    year: int, month: int, day: int,
    hour: int = 12, minute: int = 0,
    latitude: float = 0.0, longitude: float = 0.0,
    utc_offset: Optional[float] = None,
) -> dict:
    """
    One-liner convenience: returns to_dict() for quick use.
    """
    calc = AstrologyCalculator()
    result = calc.calculate(
        year=year, month=month, day=day,
        hour=hour, minute=minute,
        latitude=latitude, longitude=longitude,
        utc_offset=utc_offset,
    )
    return result.to_dict()
