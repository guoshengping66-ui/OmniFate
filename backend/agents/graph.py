"""
agents/graph.py
LangGraph pipeline: init -> parallel_workers -> master -> [chat_loop]

Graph topology:
  START
    |
  [node_init]          -- validate & pre-populate state
    |
  [node_parallel]      -- run 5 workers concurrently (asyncio.gather)
    |
  [node_master]        -- Task A synthesis + Task B product recommendation
    |
  END  (chat handled separately via handle_followup())
"""
from __future__ import annotations
import uuid
from typing import Any

from langgraph.graph import StateGraph, END

from backend.agents.state import SystemState, BirthInfo
from backend.agents.workers import run_all_workers
from backend.agents.master import run_master, handle_followup
from backend.calculators.bazi_calculator import get_current_year_ganzhi
from backend.calculators.astrology_calculator import AstrologyCalculator

# Singleton calculator instance
_astro_calc = AstrologyCalculator(house_system="Equal")


# ─── Node functions ──────────────────────────────────────────────────────

async def node_init(state: SystemState) -> SystemState:
    """Validate inputs, assign session_id, set initial tarot/astrology stubs."""
    if not state.session_id:
        state.session_id = str(uuid.uuid4())

    # Astrology calculation via Skyfield (JPL ephemeris)
    if not state.astrology_raw and state.birth_info:
        bi = state.birth_info
        try:
            import asyncio as _aio
            astro_dict = await _aio.wait_for(
                _aio.get_event_loop().run_in_executor(None, _calculate_astrology, bi),
                timeout=30,
            )
            state.astrology_raw = astro_dict
        except Exception as e:
            # Fallback to stub if real calculation fails or times out
            state.astrology_raw = _stub_astrology(bi)
            state.errors.append(f"astrology_real_fallback: {e}")

    # Tarot stub (draw random if not provided)
    if not state.tarot_raw:
        state.tarot_raw = {"spread": "Three-Card Spread", "cards": []}

    state.phase = "init"
    return state


def _calculate_astrology(bi: BirthInfo) -> dict:
    """
    Real astrology calculation via Skyfield (JPL DE421 ephemeris).
    Computes planetary positions, houses, ASC, MC, and aspects.
    """
    # Estimate UTC offset from longitude
    if bi.longitude is not None:
        utc_offset = round(bi.longitude / 15.0)
    else:
        utc_offset = 8.0  # default CST for China

    lon_for_calc = bi.longitude if bi.longitude is not None else 120.0
    lat_for_calc = bi.latitude if bi.latitude is not None else 39.9

    return _astro_calc.calculate(
        year=bi.year, month=bi.month, day=bi.day,
        hour=bi.hour, minute=bi.minute,
        latitude=lat_for_calc, longitude=lon_for_calc,
        utc_offset=utc_offset,
    ).to_dict()


def _stub_astrology(bi: BirthInfo) -> dict:
    """Fallback stub when Skyfield calculation fails."""
    from lunar_python import Solar
    solar = Solar.fromYmd(bi.year, bi.month, bi.day)
    month = bi.month
    cy = get_current_year_ganzhi()

    sign_map = {
        1: "Capricorn", 2: "Aquarius", 3: "Pisces", 4: "Aries",
        5: "Taurus", 6: "Gemini", 7: "Cancer", 8: "Leo",
        9: "Virgo", 10: "Libra", 11: "Scorpio", 12: "Sagittarius",
    }
    sun_sign = sign_map.get(month, "Unknown")
    moon_sign = sign_map.get((month + 2) % 12 + 1, "Unknown")
    ascendant = sign_map.get((bi.hour // 2) % 12 + 1, "Unknown")

    # 2026 transit context (updated yearly)
    transit_note = (
        f"In {cy} year (2026): "
        f"Jupiter in Cancer (expansion in home/family), "
        f"Saturn in Pisces (spiritual lessons), "
        f"Uranus in Taurus (financial innovation), "
        f"Pluto in Aquarius (collective transformation). "
        f"Eclipses in Virgo-Pisces axis affecting health and spirituality."
    )

    return {
        "sun_sign": sun_sign,
        "moon_sign": moon_sign,
        "ascendant": ascendant,
        "planets": {
            "Sun":    {"sign": sun_sign, "house": 10, "degree": bi.day},
            "Moon":   {"sign": moon_sign, "house": 4, "degree": bi.day * 2 % 30},
            "Saturn": {"sign": "Pisces", "house": 12, "degree": 15},
            "Jupiter":{"sign": "Cancer", "house": 2, "degree": 22},
            "Uranus": {"sign": "Taurus", "house": 1, "degree": 18},
            "Neptune":{"sign": "Pisces", "house": 12, "degree": 25},
            "Pluto":  {"sign": "Aquarius", "house": 11, "degree": 3},
        },
        "aspects": [],
        "saturn_aspects": "Saturn in Pisces (retrograde until Nov 2026). Saturn conjunct Neptune (orb 3 deg) — dissolving boundaries, spiritual awakening vs confusion.",
        "transits_this_year": transit_note,
        # New structured data (empty defaults for stub)
        "dignities": {},
        "dignity_ranking": [],
        "aspect_patterns": [],
        "element_summary": {"fire": 0, "earth": 0, "air": 0, "water": 0},
        "modality_summary": {"cardinal": 0, "fixed": 0, "mutable": 0},
        "missing_elements": [],
        "dominant_element": "",
        "hemisphere": {"east_west": "unknown", "north_south": "unknown", "description": ""},
        "fixed_star_conjunctions": [],
        # P0 stub defaults
        "lunar_nodes": {
            "north_node": {"sign": "", "sign_cn": "", "degree": 0, "longitude": 0},
            "south_node": {"sign": "", "sign_cn": "", "degree": 0, "longitude": 0},
        },
        "house_cusp_signs": {},
        "house_lords": {},
        "accidental_dignities": {},
        "total_dignity_ranking": [],
        # P1 stub defaults
        "chart_shape": {},
        "critical_degrees": {},
        "sect": "",
        "planet_returns": [],
        "transit_planets": {},
        "transit_natal_aspects": [],
    }


async def node_parallel(state: SystemState) -> SystemState:
    """Run all 5 workers in parallel."""
    return await run_all_workers(state)


async def node_master(state: SystemState) -> SystemState:
    """Master agent: synthesis report + product recommendations."""
    return await run_master(state)


# ─── Build graph ─────────────────────────────────────────────────────────

def build_graph() -> Any:
    builder = StateGraph(SystemState)

    builder.add_node("init",     node_init)
    builder.add_node("parallel", node_parallel)
    builder.add_node("master",   node_master)

    builder.set_entry_point("init")
    builder.add_edge("init",     "parallel")
    builder.add_edge("parallel", "master")
    builder.add_edge("master",   END)

    return builder.compile()


destiny_graph = build_graph()


# ─── Public API ──────────────────────────────────────────────────────────

async def run_full_analysis(state: SystemState) -> SystemState:
    """
    Entry point: run the complete pipeline.
    Returns the final SystemState with all reports populated.
    """
    result = await destiny_graph.ainvoke(state)
    # LangGraph >=1.0 returns dict; convert back to SystemState
    if isinstance(result, dict):
        return SystemState.model_validate(result)
    return result


async def run_chat(question: str, state: SystemState) -> tuple[str, str, SystemState]:
    """
    Entry point for follow-up chat.
    Returns (answer, routed_agent_id, updated_state).
    """
    answer, agent_id = await handle_followup(question, state)
    # handle_followup mutates state in-place, no dict conversion needed here
    return answer, agent_id, state