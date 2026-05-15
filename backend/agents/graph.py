"""
agents/graph.py
Custom orchestrator with speculative master execution.

Pipeline:
  init → workers(130s) ──┐
           └── core子任务(启动于~55s, Bazi+Tarot完成时) ──┐
                                dims/actions(启动于~130s) ──┤→ done(~165s)
"""
from __future__ import annotations
import asyncio
import uuid
from typing import Any

from agents.state import SystemState, BirthInfo
from agents.workers import _WORKER_IDS
from agents.master import (
    run_master_preprocessing,
    run_subtask_core, run_subtask_dims, run_subtask_actions,
    handle_followup,
)
from calculators.bazi_calculator import get_current_year_ganzhi
from calculators.astrology_calculator import AstrologyCalculator

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


# ─── Public API ──────────────────────────────────────────────────────────

async def run_full_analysis(state: SystemState) -> SystemState:
    """
    Custom orchestrator with speculative master execution.

    Timeline:
      0s   : init (astrology calc)
      5s   : workers start (7 parallel)
      ~55s : Bazi+Tarot complete → preprocessing + master_core starts
      ~95s : master_core done
      ~130s: all workers done → master_dims + master_actions start
      ~165s: all done → assemble final report

    User-perceived latency via SSE: ~95s (when master_core first appears)
    """
    from agents.workers import (
        run_astrology, run_tarot, run_bazi, run_qimen,
        run_ziwei, run_face, run_palm, _WORKER_TIMEOUTS,
    )

    # ── Phase 1: Init ──
    state.phase = "init"
    state = await node_init(state)

    state.phase = "parallel"
    state.progress_pct = 5
    state.progress_message = "正在调取命理数据…"
    for aid in _WORKER_IDS:
        state.agent_status[aid] = "running"

    # ── Launch all workers as background tasks ──
    worker_events = {aid: asyncio.Event() for aid in _WORKER_IDS}
    worker_outputs: dict[str, Any] = {}
    _completed_workers = 0

    _runners = [run_astrology, run_tarot, run_bazi, run_qimen, run_ziwei, run_face, run_palm]

    async def _run_one(runner, agent_id: str, timeout: int):
        nonlocal _completed_workers
        try:
            result = await asyncio.wait_for(runner(state), timeout=timeout)
        except Exception as e:
            from agents.state import WorkerOutput
            result = WorkerOutput(agent_id=agent_id, error=str(e))
        worker_outputs[agent_id] = result
        # Immediately assign to state so speculative master sees the data
        attr = f"{agent_id}_output"
        if hasattr(state, attr):
            setattr(state, attr, result)
        worker_events[agent_id].set()
        # Update progress
        _completed_workers += 1
        state.agent_status[agent_id] = "error" if result.error else "done"
        state.progress_pct = 5 + int(60 * _completed_workers / len(_WORKER_IDS))
        state.progress_message = f"已完成 {_completed_workers}/{len(_WORKER_IDS)} 项分析…"
        return result

    worker_tasks = [
        asyncio.create_task(_run_one(r, aid, t))
        for r, aid, t in zip(_runners, _WORKER_IDS, _WORKER_TIMEOUTS)
    ]

    # ── Speculative Master: start core when Bazi+Tarot complete ──
    async def _speculative_core():
        """Wait for Bazi+Tarot, then run preprocessing + core sub-task."""
        try:
            await asyncio.wait_for(
                asyncio.gather(
                    worker_events["bazi"].wait(),
                    worker_events["tarot"].wait(),
                ),
                timeout=120,
            )
        except asyncio.TimeoutError:
            pass  # proceed with whatever is available

        state.phase = "master"
        state.progress_pct = 70
        state.progress_message = "正在进行跨维度交叉验证…"
        prep = run_master_preprocessing(state)
        result = await run_subtask_core(state, prep)
        state.progress_pct = 75
        state.progress_message = "核心综合完成，生成维度分析…"
        return result

    core_task = asyncio.create_task(_speculative_core())

    # ── Wait for ALL workers to finish ──
    await asyncio.gather(*worker_tasks)

    # Assign worker results to state
    state.astrology_output = worker_outputs.get("astrology", state.astrology_output)
    state.tarot_output     = worker_outputs.get("tarot", state.tarot_output)
    state.bazi_output      = worker_outputs.get("bazi", state.bazi_output)
    state.qimen_output     = worker_outputs.get("qimen", state.qimen_output)
    state.ziwei_output     = worker_outputs.get("ziwei", state.ziwei_output)
    state.face_output      = worker_outputs.get("face", state.face_output)
    state.palm_output      = worker_outputs.get("palm", state.palm_output)

    # Merge tags
    all_tags: list[str] = []
    for r in worker_outputs.values():
        all_tags.extend(r.tags)
        if r.error:
            state.errors.append(f"{r.agent_id}: {r.error}")
    state.computed_tags = list(set(all_tags))

    # ── Wait for speculative core to finish (may already be done) ──
    core_result = await core_task

    # ── Run remaining sub-tasks (dims + actions) with full worker data ──
    state.phase = "master"
    state.progress_pct = 80

    # Free users: skip dims + actions sub-tasks (saves 2 LLM calls)
    if state.is_premium:
        state.progress_message = "AI 正在生成五维诊断与行动建议…"
        prep = run_master_preprocessing(state)  # re-run with complete data
        dims_result, actions_result = await asyncio.gather(
            run_subtask_dims(state, prep),
            run_subtask_actions(state, prep),
        )
        state.master_summary = core_result[:500]
        state.master_detail = f"{core_result}\n\n{dims_result}\n\n{actions_result}"
    else:
        state.progress_message = "核心综合完成，收尾中…"
        state.master_summary = core_result[:500]
        state.master_detail = ""  # Behind paywall anyway

    state.progress_pct = 100
    state.progress_message = "分析完成"
    state.phase = "done"
    return state


async def run_chat(question: str, state: SystemState) -> tuple[str, str, SystemState]:
    """
    Entry point for follow-up chat.
    Returns (answer, routed_agent_id, updated_state).
    """
    answer, agent_id = await handle_followup(question, state)
    # handle_followup mutates state in-place, no dict conversion needed here
    return answer, agent_id, state