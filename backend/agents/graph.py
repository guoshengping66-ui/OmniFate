"""
agents/graph.py
Custom orchestrator with speculative master execution.

Pipeline (after optimization):
  init → workers(5 parallel, ~30s) ──┐
           └── core子任务(启动于~25s, Bazi完成时) ──┐
                                dims/actions(启动于~80s) ──┤→ done(~95s)

Optimizations applied:
  - Merged qimen+ziwei → 1 LLM call (saves ~30s)
  - Speculative master starts as soon as bazi completes
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

# Store AstrologyResult objects for synastry calculation (keyed by session_id)
_astro_results: dict[str, dict] = {}  # session_id -> {"self": AstrologyResult, "partner": AstrologyResult}
_bazi_results: dict[str, dict] = {}   # session_id -> {"self": BaziResult, "partner": BaziResult}


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
            # Store AstrologyResult for synastry calculation
            if _last_astro_result[0] is not None:
                _astro_results.setdefault(state.session_id, {})["self"] = _last_astro_result[0]
                _last_astro_result[0] = None
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
    Returns dict (for state.astrology_raw) and stores AstrologyResult for synastry.
    """
    # Estimate UTC offset from longitude
    if bi.longitude is not None:
        utc_offset = round(bi.longitude / 15.0)
    else:
        utc_offset = 8.0  # default CST for China

    lon_for_calc = bi.longitude if bi.longitude is not None else 120.0
    lat_for_calc = bi.latitude if bi.latitude is not None else 39.9

    result = _astro_calc.calculate(
        year=bi.year, month=bi.month, day=bi.day,
        hour=bi.hour, minute=bi.minute,
        latitude=lat_for_calc, longitude=lon_for_calc,
        utc_offset=utc_offset,
    )
    # Store the AstrologyResult object for later synastry calculation
    # (will be stored in _astro_results by the caller)
    _last_astro_result[0] = result
    return result.to_dict()


# Temporary storage for the last calculated AstrologyResult
_last_astro_result: list = [None]


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


def _build_free_summary(core_result: str, state: SystemState) -> str:
    """
    Build a complete free version summary that:
    1. Directly answers the user's specific question
    2. Shows key findings from each dimension
    3. Creates desire for the full deep analysis
    4. Is complete (not cut off mid-sentence)
    """
    import re as _re

    def _extract_section(text: str, marker: str) -> str:
        """Extract a complete section from text, stopping at the next section marker."""
        start = text.find(marker)
        if start == -1:
            return ""
        # Find the end: next 【 that starts a new section (not inside current text)
        # Search for 【 followed by a letter/Chinese char and then ·
        rest = text[start + len(marker):]
        # Find next section header pattern: 【X· where X is a letter or Chinese
        end_match = _re.search(r'【[A-Za-z一-鿿]+·', rest)
        if end_match:
            section = rest[:end_match.start()].strip()
        else:
            section = rest.strip()
        return section

    def _complete_sentence(text: str, max_len: int = 600) -> str:
        """Truncate text at a complete sentence boundary, never mid-sentence."""
        if len(text) <= max_len:
            return text
        # Find the LAST complete sentence before max_len
        best_pos = -1
        for sep in ["。", "！", "？"]:
            pos = text.rfind(sep, 0, max_len)
            if pos > best_pos:
                best_pos = pos
        if best_pos > max_len // 3:  # At least 1/3 of max_len
            return text[:best_pos + 1]
        # Fallback: find last paragraph break
        pos = text.rfind("\n\n", 0, max_len)
        if pos > max_len // 3:
            return text[:pos].strip()
        # Last resort: truncate at max_len with ellipsis
        return text[:max_len].rstrip() + "……"

    # Extract dimension scores for display
    scores = state.dimension_scores or {}
    score_display = ""
    if scores:
        dim_cn = {"wealth": "财运", "relationship": "感情", "career": "事业",
                  "health": "健康", "spiritual": "精神"}
        score_parts = []
        for dim, val in scores.items():
            cn = dim_cn.get(dim, dim)
            if val < 5:
                indicator = "⚠️"
            elif val > 7:
                indicator = "✨"
            else:
                indicator = "📊"
            score_parts.append(f"{indicator} {cn}: {val}/10")
        score_display = " | ".join(score_parts)

    lines = []

    # 1. Direct answer to user's question
    lines.append("【命盘速览】")
    lines.append(f"你的问题：{state.user_question}")
    lines.append("")

    # 2. Core insight — extract the most relevant section completely
    answer_section = ""
    #优先提取直接回答用户问题的 section (G section)
    for marker in ["【G·", "【H·", "【A·", "【B·"]:
        section = _extract_section(core_result, marker)
        if section and len(section) > 50:
            answer_section = _complete_sentence(section, 600)
            break
    if not answer_section:
        # Fallback: use first 600 chars at sentence boundary
        answer_section = _complete_sentence(core_result, 600)
    lines.append(answer_section)
    lines.append("")

    # 3. Dimension scores overview (skip for RELATIONSHIP — not relevant)
    if score_display and state.intent != "RELATIONSHIP":
        lines.append("【五维能量概览】")
        lines.append(score_display)
        lines.append("")

    # 4. Key findings teaser
    lines.append("【核心发现】")
    findings = []
    for line in core_result.split("\n"):
        line = line.strip()
        if line.startswith(("•", "·", "-", "1.", "2.", "3.")):
            if len(line) > 10 and len(findings) < 3:
                findings.append(line)
    if findings:
        for f in findings:
            lines.append(f)
    else:
        lines.append("• 你的命盘呈现独特的能量格局，多维度分析揭示了关键的人生密码")
    lines.append("")

    # 5. 各维度速览 — show key findings from each worker
    worker_labels = {
        "bazi": "☯ 周易八字", "astrology": "✦ 西方星盘", "tarot": "🃏 塔罗疗愈",
        "qimen": "🎯 奇门遁甲", "ziwei": "⭐ 紫微斗数",
        "face": "👁 AI面相", "palm": "🤚 手相解读",
    }
    has_worker_previews = False
    for agent_id, label in worker_labels.items():
        wo = getattr(state, f"{agent_id}_output", None)
        if not wo or not wo.report:
            continue
        preview_lines = []
        for line in wo.report.split("\n"):
            line = line.strip()
            if line.startswith(("【关键发现】",)):
                continue
            if line.startswith(("- ", "• ", "· ")):
                text = line.lstrip("-•· ").strip()
                if len(text) > 10 and len(preview_lines) < 2:
                    preview_lines.append(f"  {label}：{text}")
            elif line.startswith("【") and "】" in line:
                dim_text = line.split("】", 1)[-1].strip()
                if dim_text and len(dim_text) > 10:
                    # Complete sentence, max 100 chars
                    for sep in ["。", "！", "；"]:
                        pos = dim_text.find(sep)
                        if 0 < pos < 80:
                            dim_text = dim_text[:pos + 1]
                            break
                    if len(dim_text) > 100:
                        dim_text = dim_text[:100] + "…"
                    preview_lines.append(f"  {label}：{dim_text}")
            if len(preview_lines) >= 2:
                break
        if preview_lines:
            if not has_worker_previews:
                lines.append("【各维度速览】")
                has_worker_previews = True
            for pl in preview_lines:
                lines.append(pl)
    if has_worker_previews:
        lines.append("")

    # 6. Upgrade prompt
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("🔓 解锁完整深度解析，你将获得：")
    lines.append("• 五维详细诊断（财富/感情/事业/健康/精神）")
    lines.append("• 跨维度矛盾解释与置信度评估")
    lines.append("• 未来12个月关键转折点预测")
    lines.append("• 针对你问题的专项深度分析")
    lines.append("• 专属能量调和方案与助运物推荐")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    return "\n".join(lines)


# ─── Public API ──────────────────────────────────────────────────────────

async def run_full_analysis(state: SystemState) -> SystemState:
    """
    Custom orchestrator with speculative master execution.

    Timeline (after optimization):
      0s   : init (astrology calc)
      5s   : workers start (5 parallel, merged qimen+ziwei)
      ~25s : Bazi complete → preprocessing + master_core starts
      ~60s : master_core done
      ~80s : all workers done → master_dims + master_actions start
      ~95s : all done → assemble final report

    User-perceived latency via SSE: ~60s (when master_core first appears)
    """
    from agents.workers import (
        run_astrology, run_tarot, run_bazi,
        run_qimen_ziwei, run_face, run_palm, _WORKER_TIMEOUTS,
    )

    # ── Phase 1: Init ──
    state.phase = "init"
    state = await node_init(state)

    # ── Phase 1b: Partner calculations (RELATIONSHIP intent) ──
    if state.intent == "RELATIONSHIP" and state.partner_birth_info:
        state.progress_message = "正在计算对方命盘…"
        try:
            import asyncio as _aio
            pi = state.partner_birth_info
            partner_astro = await _aio.wait_for(
                _aio.get_event_loop().run_in_executor(None, _calculate_astrology, pi),
                timeout=30,
            )
            state.partner_astrology_raw = partner_astro
            # Store partner AstrologyResult for synastry calculation
            if _last_astro_result[0] is not None:
                _astro_results.setdefault(state.session_id, {})["partner"] = _last_astro_result[0]
                _last_astro_result[0] = None
        except Exception as e:
            state.partner_astrology_raw = _stub_astrology(state.partner_birth_info)
            state.errors.append(f"partner_astrology_fallback: {e}")

        # Partner bazi calculation
        try:
            from calculators.bazi_calculator import BaziCalculator
            pi = state.partner_birth_info
            bazi_calc = BaziCalculator()
            partner_bazi_result = bazi_calc.calculate(
                year=pi.year, month=pi.month, day=pi.day,
                hour=pi.hour, minute=pi.minute, gender=pi.gender,
            )
            state.partner_bazi_raw = partner_bazi_result.to_dict()
            # Store BaziResult for compatibility calculation
            _bazi_results.setdefault(state.session_id, {})["partner"] = partner_bazi_result
        except Exception as e:
            state.errors.append(f"partner_bazi_error: {e}")

    state.phase = "parallel"
    state.progress_pct = 5
    state.progress_message = "正在调取命理数据…"
    for aid in _WORKER_IDS:
        if aid == "qimen_ziwei":
            # Merged worker: set individual sub-worker statuses the frontend expects
            state.agent_status["qimen"] = "running"
            state.agent_status["ziwei"] = "running"
        else:
            state.agent_status[aid] = "running"

    # ── Launch all workers as background tasks ──
    worker_events = {aid: asyncio.Event() for aid in _WORKER_IDS}
    worker_outputs: dict[str, Any] = {}
    _completed_workers = 0
    _total_workers = len(_WORKER_IDS)

    # Runners: qimen_ziwei is a merged worker returning list[WorkerOutput]
    _runners = [run_astrology, run_tarot, run_bazi, run_qimen_ziwei, run_face, run_palm]

    # Stagger face/palm worker start to avoid concurrent LLM API rate limits
    _START_DELAYS = {
        "face": 1,
        "palm": 2,
    }

    async def _run_one(runner, agent_id: str, timeout: int):
        nonlocal _completed_workers
        delay = _START_DELAYS.get(agent_id, 0)
        if delay:
            await asyncio.sleep(delay)
        try:
            result = await asyncio.wait_for(runner(state), timeout=timeout)
        except Exception as e:
            from agents.state import WorkerOutput
            if agent_id == "qimen_ziwei":
                # Merged worker error: create individual error outputs for each sub-worker
                result = [
                    WorkerOutput(agent_id="qimen", error=str(e)),
                    WorkerOutput(agent_id="ziwei", error=str(e)),
                ]
            else:
                result = WorkerOutput(agent_id=agent_id, error=str(e))

        # Handle merged workers that return lists of WorkerOutput
        if isinstance(result, list):
            # Merged worker: extract individual outputs
            from agents.state import WorkerOutput as WO
            for r in result:
                if isinstance(r, WO):
                    worker_outputs[r.agent_id] = r
                    setattr(state, f"{r.agent_id}_output", r)
                    # Update agent status for each sub-worker
                    state.agent_status[r.agent_id] = "error" if r.error else "done"
                    _completed_workers += 1
            # Remove stale merged-worker key so frontend completedCount is correct
            state.agent_status.pop("qimen_ziwei", None)
        else:
            worker_outputs[agent_id] = result
            attr = f"{agent_id}_output"
            if hasattr(state, attr):
                setattr(state, attr, result)
            _completed_workers += 1
            state.agent_status[agent_id] = "error" if result.error else "done"

        # Mark the merged worker event too
        worker_events[agent_id].set()
        state.progress_pct = 5 + int(60 * _completed_workers / 7)  # 7 total sub-workers
        state.progress_message = f"已完成 {_completed_workers}/7 项分析…"
        return result

    worker_tasks = [
        asyncio.create_task(_run_one(r, aid, t))
        for r, aid, t in zip(_runners, _WORKER_IDS, _WORKER_TIMEOUTS)
    ]

    # ── Speculative Master: start core when Bazi completes (fastest worker) ──
    async def _speculative_core():
        """Wait for Bazi (typically fastest ~20-30s), then run preprocessing + core sub-task."""
        try:
            await asyncio.wait_for(
                worker_events["bazi"].wait(),
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

    # ── Synastry computation: run IN PARALLEL with workers (RELATIONSHIP only) ──
    async def _compute_synastry():
        """Compute synastry data (astrology aspects + bazi compatibility) in background."""
        if state.intent != "RELATIONSHIP":
            return
        session_results = _astro_results.get(state.session_id, {})
        astro_self = session_results.get("self")
        astro_partner = session_results.get("partner")

        if astro_self and astro_partner:
            try:
                synastry = _astro_calc.calculate_synastry(astro_self, astro_partner)
                state.synastry_aspects = synastry.get("aspects", [])
                composite = _astro_calc.calculate_composite(astro_self, astro_partner)
                state.composite_chart = composite
                print(f"[SYNASTRY] {len(state.synastry_aspects)} cross-aspects computed")
                print(f"[COMPOSITE] ASC={composite.get('ascendant', {}).get('sign_cn', '?')}")
            except Exception as e:
                state.errors.append(f"synastry_error: {e}")
                print(f"[SYNASTRY] Error: {e}")

        if state.bazi_raw and state.partner_bazi_raw:
            try:
                from calculators.bazi_calculator import BaziCalculator
                bazi_compat = BaziCalculator.calculate_compatibility(
                    state.bazi_raw, state.partner_bazi_raw,
                )
                state.bazi_compatibility = bazi_compat
                print(f"[BAZI_COMPAT] Score: {bazi_compat.get('score', 0)}/100")
            except Exception as e:
                state.errors.append(f"bazi_compat_error: {e}")
                print(f"[BAZI_COMPAT] Error: {e}")

        _astro_results.pop(state.session_id, None)

    synastry_task = asyncio.create_task(_compute_synastry())

    # ── Wait for ALL workers to finish ──
    await asyncio.gather(*worker_tasks)

    # ── Wait for synastry computation to finish (if RELATIONSHIP) ──
    if state.intent == "RELATIONSHIP":
        try:
            await asyncio.wait_for(synastry_task, timeout=15)
        except asyncio.TimeoutError:
            pass

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

    is_relationship = state.intent == "RELATIONSHIP"

    # Free users: skip dims + actions sub-tasks (saves 2 LLM calls)
    if state.is_premium:
        state.progress_message = "AI 正在生成五维诊断与行动建议…"
        prep = run_master_preprocessing(state)  # re-run with complete data
        tasks = [
            run_subtask_dims(state, prep),
            run_subtask_actions(state, prep),
        ]
        if is_relationship:
            from agents.master import run_subtask_synastry
            tasks.append(run_subtask_synastry(state))

        results = await asyncio.gather(*tasks)
        dims_result = results[0]
        actions_result = results[1]
        synastry_result = results[2] if is_relationship else ""

        state.master_summary = core_result[:500]
        parts = [core_result]
        if synastry_result:
            parts.append(synastry_result)
        parts.append(dims_result)
        parts.append(actions_result)
        state.master_detail = "\n\n".join(parts)
    else:
        state.progress_message = "核心综合完成，收尾中…"
        # Free version: complete teaser that answers user question and creates upgrade desire
        state.master_summary = _build_free_summary(core_result, state)

        # Free users don't need synastry subtask — it's behind paywall
        # This avoids the extra LLM call that causes 80% hang
        state.master_detail = ""

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