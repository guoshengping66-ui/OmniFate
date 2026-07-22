from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import date, datetime, timezone
from typing import Callable, Literal

from calculators.astrology_calculator import AstrologyCalculator
from calculators.bazi_calculator import BaziCalculator
from calculators.ziwei_calculator import calculate_annual_monthly_transit


RULE_VERSION = "annual-forecast-v1"
ForecastSystem = Literal["bazi", "ziwei", "astrology"]
Direction = Literal["supportive", "challenging", "neutral"]
MomentumState = Literal["advance", "build", "adjust", "stabilize"]

SUPPORTIVE_ASPECTS = {"trine", "sextile", "conjunction"}
CHALLENGING_ASPECTS = {"square", "opposition"}
SUPPORTIVE_PALACES = {"命宫", "官禄", "财帛", "迁移"}
CHALLENGING_PALACES = {"疾厄"}


@dataclass(frozen=True)
class Signal:
    system: ForecastSystem
    signal_id: str
    direction: Direction
    strength: int
    summary: str


def _month_sequence(as_of: date) -> list[tuple[int, int]]:
    year, month = as_of.year, as_of.month + 1
    if month == 13:
        year, month = year + 1, 1

    months = []
    for _ in range(12):
        months.append((year, month))
        year, month = (year + 1, 1) if month == 12 else (year, month + 1)
    return months


def _state_for(score: int) -> MomentumState:
    if score >= 70:
        return "advance"
    if score >= 55:
        return "build"
    if score >= 40:
        return "adjust"
    return "stabilize"


def _signal_direction(element: str, bazi_raw: dict) -> tuple[Direction, int, str] | None:
    if element and element == bazi_raw.get("yong_shen"):
        return "supportive", 14, "用神"
    if element and element == bazi_raw.get("xi_shen"):
        return "supportive", 9, "喜神"
    if element and element == bazi_raw.get("ji_shen"):
        return "challenging", 14, "忌神"
    if element and element == bazi_raw.get("chou_shen"):
        return "challenging", 9, "仇神"
    return None


def _bazi_signals(bazi_raw: dict, target_date: date) -> list[Signal]:
    if not isinstance(bazi_raw, dict) or not any(
        bazi_raw.get(key) for key in ("yong_shen", "xi_shen", "ji_shen", "chou_shen")
    ):
        return []

    try:
        pillar = BaziCalculator.calculate_transit_pillars(
            target_date.year, target_date.month, target_date.day
        )["month_pillar"]
    except Exception:
        return []

    month_key = target_date.strftime("%Y-%m")
    fact = (
        f"{month_key} 节气流月柱 {pillar['ganzhi']}"
        f"（天干{pillar['tiangan_wuxing']}、地支{pillar['dizhi_wuxing']}）"
    )
    signals = []
    for part, element in (
        ("tiangan", pillar.get("tiangan_wuxing", "")),
        ("dizhi", pillar.get("dizhi_wuxing", "")),
    ):
        relation = _signal_direction(element, bazi_raw)
        if relation is None:
            continue
        direction, strength, label = relation
        signals.append(Signal(
            system="bazi",
            signal_id=f"bazi:{month_key}:{part}:{pillar['ganzhi']}:{label}",
            direction=direction,
            strength=strength,
            summary=f"{fact}，{part}五行为{element}，对应{label}。",
        ))
    return signals


def _palace_direction(palace: str) -> tuple[Direction, int]:
    if palace in SUPPORTIVE_PALACES:
        return "supportive", 9
    if palace in CHALLENGING_PALACES:
        return "challenging", 9
    return "neutral", 3


def _ziwei_signals(ziwei_raw: dict, target_date: date) -> list[Signal]:
    if not isinstance(ziwei_raw, dict):
        return []

    transit = calculate_annual_monthly_transit(ziwei_raw, target_date)
    if transit is None:
        return []

    month_key = target_date.strftime("%Y-%m")
    signals = []
    palaces = ziwei_raw.get("twelve_palaces", {})
    monthly_palace = palaces.get(transit.monthly_ming_gong, "") if isinstance(palaces, dict) else ""
    if monthly_palace:
        direction, strength = _palace_direction(monthly_palace)
        signals.append(Signal(
            system="ziwei",
            signal_id=f"ziwei:{month_key}:monthly-ming:{transit.monthly_ming_gong}",
            direction=direction,
            strength=strength,
            summary=(
                f"{month_key} 紫微流年{transit.year_ganzhi}、流月{transit.month_ganzhi}；"
                f"流年命宫{transit.annual_ming_gong}，流月命宫{transit.monthly_ming_gong}落{monthly_palace}。"
            ),
        ))

    transformation_by_star = {
        star: transformation
        for transformation, star in transit.annual_transformations.items()
    }
    for star, palace in sorted(transit.transformation_palaces.items()):
        transformation = transformation_by_star[star]
        if transformation == "化忌":
            direction, strength = "challenging", 14
        else:
            direction, strength = "supportive", 11
        signals.append(Signal(
            system="ziwei",
            signal_id=f"ziwei:{month_key}:{transformation}:{star}:{palace}",
            direction=direction,
            strength=strength,
            summary=(
                f"{month_key} 紫微流年{transit.year_ganzhi}流月{transit.month_ganzhi}："
                f"{star}{transformation}在{palace}。"
            ),
        ))
    return signals


def _aspect_direction(aspect: str) -> Direction:
    normalized = aspect.lower()
    if normalized in SUPPORTIVE_ASPECTS:
        return "supportive"
    if normalized in CHALLENGING_ASPECTS:
        return "challenging"
    return "neutral"


def _astrology_signals(
    astrology_raw: dict,
    target_date: datetime,
    transit_lookup: Callable[[datetime, dict], dict],
) -> list[Signal]:
    if not isinstance(astrology_raw, dict):
        return []
    natal_planets = astrology_raw.get("planets")
    if not isinstance(natal_planets, dict) or not natal_planets:
        return []

    try:
        transit_raw = transit_lookup(target_date, natal_planets)
    except Exception:
        return []
    if not isinstance(transit_raw, dict):
        return []

    month_key = target_date.strftime("%Y-%m")
    signals = []
    for aspect in transit_raw.get("transit_natal_aspects", []):
        if not isinstance(aspect, dict):
            continue
        transit_planet = aspect.get("transit_planet")
        natal_planet = aspect.get("natal_planet")
        aspect_name = aspect.get("aspect")
        orb = aspect.get("orb")
        if not all(isinstance(value, str) and value for value in (transit_planet, natal_planet, aspect_name)):
            continue
        if not isinstance(orb, (int, float)):
            continue
        direction = _aspect_direction(aspect_name)
        strength = max(4, 16 - min(10, round(abs(orb))))
        signals.append(Signal(
            system="astrology",
            signal_id=(
                f"astrology:{month_key}:{transit_planet.lower()}-"
                f"{natal_planet.lower()}-{aspect_name.lower()}"
            ),
            direction=direction,
            strength=strength,
            summary=(
                f"{month_key} {transit_planet} 与本命 {natal_planet} 形成"
                f"{aspect_name}相位，容许度 {orb:.2f}。"
            ),
        ))

    for planet, planet_data in sorted(transit_raw.get("transit_planets", {}).items()):
        if not isinstance(planet_data, dict) or planet_data.get("retrograde") is not True:
            continue
        signals.append(Signal(
            system="astrology",
            signal_id=f"astrology:{month_key}:{planet.lower()}:retrograde",
            direction="challenging",
            strength=6,
            summary=f"{month_key} 过境 {planet} 处于逆行阶段。",
        ))
    return signals


def _score_signals(signals: list[Signal]) -> int:
    system_totals: dict[str, list[int]] = {}
    for signal in signals:
        signed_strength = (
            signal.strength if signal.direction == "supportive"
            else -signal.strength if signal.direction == "challenging" else 0
        )
        system_totals.setdefault(signal.system, []).append(signed_strength)

    system_averages = [sum(values) / len(values) for values in system_totals.values()]
    directional_systems = [value for value in system_averages if value != 0]
    resonance = 0
    if directional_systems and all(value > 0 for value in directional_systems):
        resonance = 4 * len(directional_systems)
    elif directional_systems and all(value < 0 for value in directional_systems):
        resonance = -4 * len(directional_systems)
    score = round(50 + sum(system_averages) / len(system_averages) + resonance)
    return max(0, min(100, score))


def _confidence(evidence: list[dict], score: int) -> str:
    system_directions: dict[str, int] = {}
    for signal in evidence:
        direction = signal["direction"]
        if direction == "supportive":
            system_directions[signal["system"]] = system_directions.get(signal["system"], 0) + 1
        elif direction == "challenging":
            system_directions[signal["system"]] = system_directions.get(signal["system"], 0) - 1
    expected_sign = 1 if score >= 50 else -1
    aligned = sum(1 for value in system_directions.values() if value * expected_sign > 0)
    return {1: "single", 2: "dual"}.get(aligned, "triple" if aligned >= 3 else "single")


def _node_copy(state: MomentumState) -> tuple[str, str, str]:
    if state == "advance":
        return "推进窗口", "聚焦优先级最高的一项行动并安排推进。", "避免将顺势判断扩大为确定结果。"
    if state == "build":
        return "蓄势窗口", "整合资源并为下一阶段保留余量。", "避免在证据尚未形成共振时过度承诺。"
    if state == "adjust":
        return "调整窗口", "复盘节奏、修正计划并处理阻碍。", "避免以短期波动替代长期判断。"
    return "守稳窗口", "优先维护既有安排并降低不必要的风险暴露。", "避免把谨慎解读为消极结论。"


def _select_key_nodes(months: list[dict]) -> list[dict]:
    candidates = []
    for index in range(1, len(months) - 1):
        previous_score = months[index - 1]["score"]
        current_score = months[index]["score"]
        next_score = months[index + 1]["score"]
        is_extremum = (
            current_score > previous_score and current_score > next_score
        ) or (
            current_score < previous_score and current_score < next_score
        )
        change = max(abs(current_score - previous_score), abs(current_score - next_score))
        is_reversal = (
            (current_score - previous_score) * (next_score - current_score) < 0
        )
        if not (is_extremum or is_reversal) or change == 0:
            continue
        evidence = months[index]["evidence"]
        systems = {signal["system"] for signal in evidence}
        candidates.append((change + len(systems) * 2, index))

    selected = []
    for _, index in sorted(candidates, key=lambda item: (-item[0], item[1])):
        if any(abs(index - chosen) <= 1 for chosen in selected):
            continue
        selected.append(index)
        if len(selected) == 5:
            break
    if len(selected) < 3:
        return []

    nodes = []
    for index in sorted(selected):
        month = months[index]
        theme, action, avoid = _node_copy(month["state"])
        nodes.append({
            "id": f"annual-node:{month['month']}",
            "month": month["month"],
            "score": month["score"],
            "state": month["state"],
            "theme": theme,
            "confidence": _confidence(month["evidence"], month["score"]),
            "evidence": month["evidence"],
            "action": action,
            "avoid": avoid,
        })
    return nodes


def build_annual_forecast(
    bazi_raw: dict,
    ziwei_raw: dict,
    astrology_raw: dict,
    as_of: date,
    transit_lookup: Callable[[datetime, dict], dict] | None = None,
) -> dict | None:
    if not any((bazi_raw, ziwei_raw, astrology_raw)):
        return None

    lookup = transit_lookup or AstrologyCalculator().calculate_transit_for_date
    months = []
    for year, month in _month_sequence(as_of):
        target_day = date(year, month, 1)
        target_datetime = datetime(year, month, 1, tzinfo=timezone.utc)
        signals = [
            *_bazi_signals(bazi_raw, target_day),
            *_ziwei_signals(ziwei_raw, target_day),
            *_astrology_signals(astrology_raw, target_datetime, lookup),
        ]
        if not signals:
            return None
        score = _score_signals(signals)
        months.append({
            "month": target_day.strftime("%Y-%m"),
            "score": score,
            "state": _state_for(score),
            "evidence": [asdict(signal) for signal in signals],
        })

    forecast = {
        "schema_version": RULE_VERSION,
        "generated_at": f"{as_of.isoformat()}T00:00:00+00:00",
        "range_start": months[0]["month"],
        "months": months,
        "key_nodes": _select_key_nodes(months),
    }
    return forecast if validate_annual_forecast(forecast) else None


def _valid_signal(signal: object, month: str) -> bool:
    if not isinstance(signal, dict):
        return False
    system = signal.get("system")
    if system not in {"bazi", "ziwei", "astrology"}:
        return False
    signal_id = signal.get("signal_id")
    if not isinstance(signal_id, str) or not signal_id.startswith(f"{system}:{month}:"):
        return False
    if signal.get("direction") not in {"supportive", "challenging", "neutral"}:
        return False
    strength = signal.get("strength")
    return (
        isinstance(strength, int)
        and not isinstance(strength, bool)
        and strength > 0
        and isinstance(signal.get("summary"), str)
        and bool(signal["summary"].strip())
    )


def validate_annual_forecast(forecast: object) -> bool:
    if not isinstance(forecast, dict) or forecast.get("schema_version") != RULE_VERSION:
        return False
    months = forecast.get("months")
    if not isinstance(months, list) or len(months) != 12:
        return False
    if forecast.get("range_start") != months[0].get("month"):
        return False

    try:
        first_year, first_month = map(int, months[0]["month"].split("-"))
    except (AttributeError, TypeError, ValueError):
        return False
    if not 1 <= first_month <= 12:
        return False
    expected_months = []
    year, month_number = first_year, first_month
    for _ in range(12):
        expected_months.append((year, month_number))
        year, month_number = (
            (year + 1, 1) if month_number == 12 else (year, month_number + 1)
        )

    for month, (year, month_number) in zip(months, expected_months):
        month_key = f"{year:04d}-{month_number:02d}"
        if not isinstance(month, dict) or month.get("month") != month_key:
            return False
        score = month.get("score")
        if not isinstance(score, int) or isinstance(score, bool) or not 0 <= score <= 100:
            return False
        if month.get("state") != _state_for(score):
            return False
        evidence = month.get("evidence")
        if not isinstance(evidence, list) or not evidence or not all(
            _valid_signal(signal, month_key) for signal in evidence
        ):
            return False

    nodes = forecast.get("key_nodes")
    if not isinstance(nodes, list) or not 3 <= len(nodes) <= 5:
        return False
    indexes = {month["month"]: index for index, month in enumerate(months)}
    previous_index = -2
    for node in nodes:
        if not isinstance(node, dict) or node.get("month") not in indexes:
            return False
        index = indexes[node["month"]]
        source_month = months[index]
        if index - previous_index <= 1:
            return False
        if node.get("id") != f"annual-node:{node['month']}":
            return False
        if node.get("score") != source_month["score"] or node.get("state") != source_month["state"]:
            return False
        if node.get("evidence") != source_month["evidence"] or not node["evidence"]:
            return False
        if node.get("confidence") not in {"single", "dual", "triple"}:
            return False
        if not all(isinstance(node.get(key), str) and node[key].strip() for key in ("theme", "action", "avoid")):
            return False
        previous_index = index
    return True
