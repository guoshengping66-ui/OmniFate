"use client"

import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Crosshair,
  Gem,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface LifeKLineChartProps {
  scores: Record<string, number>
  strongestLabel?: string
  weakestLabel?: string
  isUnlocked?: boolean
}

type Candle = {
  age: number
  open: number
  close: number
  high: number
  low: number
  tag?: "low" | "pivot" | "surge" | "risk" | "second"
}

type Signal = {
  label: string
  value: string
  tone: "gold" | "cyan" | "rose" | "green"
}

const DIM_ORDER = ["wealth", "career", "relationship", "health", "mindfulness"]

const COPY = {
  zh: {
    badge: "Life Market",
    title: "人生 K 线",
    subtitle: "把你的人生周期看成一张长期走势图：高点、低谷、转折、主升浪。",
    energyIndex: "人生能量指数",
    accumulation: "积累区",
    volatile: "震荡区",
    breakout: "突破区",
    highZone: "高位区",
    currentMarket: "当前盘口",
    trendRating: "趋势评级",
    nextThreeYears: "未来 3 年",
    highlightWindow: "高光窗口",
    riskWindow: "风险窗口",
    mainDriver: "主升来源",
    drawdown: "最大回撤",
    bullish: "BULLISH / 看涨",
    neutral: "RANGE / 横盘",
    defensive: "DEFENSE / 防守",
    uptrend: "缓慢上行",
    sideways: "震荡吸筹",
    repair: "回撤修复",
    currentCycle: "当前周期",
    lowPoint: "低谷年",
    pivotPoint: "转折年",
    surgePoint: "主升年",
    defensePoint: "防守年",
    lowDesc: "情绪、关系或健康容易拖慢整体节奏，先守住基本盘。",
    pivotDesc: "适合换策略、换圈层、换节奏，旧方法的边际收益开始下降。",
    surgeDesc: "事业、财富或心智维度更容易形成复利，是主动进攻窗口。",
    defenseDesc: "不要重仓人生，先保现金流、身体和关键关系。",
    aiRead: "AI 盘口解读",
    aiReadBull: "你不是没有上升趋势，而是正在从震荡吸筹进入主升前夜。先完成结构修复，再集中资源进攻。",
    aiReadRange: "你当前不是低谷，而是横盘整理。真正的突破来自稳定执行，而不是频繁换方向。",
    aiReadDefense: "当前 K 线显示短期回撤压力较大。不要硬冲，先防守、修复节奏，再等下一次转折窗口。",
    cta: "查看趋势补强方案",
    locked: "完整报告会解锁更细的年份解释、事件校准和每月趋势追踪。",
    notAdvice: "非金融/投资建议，仅用于人生周期可视化与行动参考。",
    tags: {
      low: "人生低点",
      pivot: "趋势反转",
      surge: "主升浪",
      risk: "风险回撤",
      second: "第二曲线",
    },
  },
  en: {
    badge: "Life Market",
    title: "Life K-Line",
    subtitle: "Read your life cycle like a long-term market: highs, lows, pivots, and breakout waves.",
    energyIndex: "Life Energy Index",
    accumulation: "Accumulation",
    volatile: "Volatile",
    breakout: "Breakout",
    highZone: "High Zone",
    currentMarket: "Current Tape",
    trendRating: "Trend Rating",
    nextThreeYears: "Next 3 Years",
    highlightWindow: "Highlight Window",
    riskWindow: "Risk Window",
    mainDriver: "Main Driver",
    drawdown: "Max Drawdown",
    bullish: "BULLISH",
    neutral: "RANGE",
    defensive: "DEFENSE",
    uptrend: "Slow Uptrend",
    sideways: "Accumulating",
    repair: "Repair Phase",
    currentCycle: "Current Cycle",
    lowPoint: "Low Year",
    pivotPoint: "Pivot Year",
    surgePoint: "Surge Year",
    defensePoint: "Defense Year",
    lowDesc: "Emotion, relationships, or health may slow the base. Protect the floor first.",
    pivotDesc: "A strategy, circle, or rhythm change becomes more valuable than working harder.",
    surgeDesc: "Career, wealth, or mindset can compound. This is the offensive window.",
    defenseDesc: "Do not over-leverage life. Protect cash flow, body, and key relationships.",
    aiRead: "AI Tape Read",
    aiReadBull: "Your trajectory is not flat. It is moving from accumulation toward a breakout setup. Repair structure first, then attack with focus.",
    aiReadRange: "This is not a bottom. It is range consolidation. The breakthrough comes from stable execution, not constant direction changes.",
    aiReadDefense: "The chart shows short-term drawdown pressure. Defend, repair rhythm, and wait for the next pivot window.",
    cta: "View Trend Support Plan",
    locked: "The full report unlocks year-by-year interpretation, event calibration, and monthly trend tracking.",
    notAdvice: "Not financial or investment advice. For life-cycle visualization and action reference only.",
    tags: {
      low: "Life Low",
      pivot: "Trend Reversal",
      surge: "Main Wave",
      risk: "Risk Pullback",
      second: "Second Curve",
    },
  },
} as const

function clamp(value: number, min = 12, max = 96) {
  return Math.max(min, Math.min(max, value))
}

function hashScores(scores: Record<string, number>) {
  return DIM_ORDER.reduce((sum, key, index) => sum + Math.round((scores[key] ?? 5) * 17) * (index + 3), 31)
}

function getStats(scores: Record<string, number>) {
  const values = DIM_ORDER.map((key) => scores[key] ?? 5)
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length
  const spread = Math.max(...values) - Math.min(...values)
  const momentum =
    (scores.career ?? 5) * 0.34 +
    (scores.wealth ?? 5) * 0.25 +
    (scores.mindfulness ?? 5) * 0.23 +
    (scores.health ?? 5) * 0.18

  return { avg, spread, momentum }
}

function buildLifeCandles(scores: Record<string, number>): Candle[] {
  const { avg, spread, momentum } = getStats(scores)
  const seed = hashScores(scores)
  const ages = [18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62]
  const trend = (momentum - 5) * 3.8
  const base = avg * 8.2 + 18
  const riskPressure = Math.min(11, spread * 3.2)

  return ages.map((age, index) => {
    const wave = Math.sin((index + seed * 0.07) * 0.95) * 8 + Math.cos((index + seed * 0.03) * 1.7) * 4
    const phaseLift = (index - 5) * trend * 0.15
    const volatility = 7 + ((seed + index * 11) % 7) + riskPressure * (index % 3 === 1 ? 0.45 : 0.2)
    const open = clamp(base + wave + phaseLift - 3 + ((seed + index) % 5))
    const close = clamp(open + (momentum >= 6.4 ? 6 : momentum <= 4.4 ? -5 : 2) + Math.sin(index * 1.37 + seed) * 5)
    const high = clamp(Math.max(open, close) + volatility * 0.58, 14, 98)
    const low = clamp(Math.min(open, close) - volatility * 0.72, 8, 94)

    return {
      age,
      open,
      close,
      high,
      low,
    }
  })
}

function enrichCandles(candles: Candle[]): Candle[] {
  const lowestIndex = candles.reduce((lowest, candle, index) => candle.low < candles[lowest].low ? index : lowest, 0)
  const strongestIndex = candles.reduce((best, candle, index) => candle.close - candle.open > candles[best].close - candles[best].open ? index : best, 0)
  const riskIndex = candles.reduce((worst, candle, index) => candle.open - candle.close > candles[worst].open - candles[worst].close ? index : worst, 0)
  const pivotIndex = Math.min(candles.length - 2, Math.max(1, lowestIndex + 1))
  const secondCurveIndex = Math.min(candles.length - 1, Math.max(7, strongestIndex + 2))

  return candles.map((candle, index) => ({
    ...candle,
    tag:
      index === lowestIndex ? "low" :
      index === pivotIndex ? "pivot" :
      index === strongestIndex ? "surge" :
      index === riskIndex ? "risk" :
      index === secondCurveIndex ? "second" :
      undefined,
  }))
}

function getMarketState(scores: Record<string, number>, lang: "zh" | "en") {
  const copy = COPY[lang]
  const { avg, spread, momentum } = getStats(scores)
  if (spread >= 3.2 || momentum <= 4.4) {
    return {
      cycle: lang === "zh" ? "回撤修复" : "Drawdown Repair",
      rating: copy.defensive,
      outlook: copy.repair,
      aiRead: copy.aiReadDefense,
      tone: "rose" as const,
    }
  }
  if (avg >= 7 || momentum >= 6.4) {
    return {
      cycle: lang === "zh" ? "蓄势突破" : "Breakout Setup",
      rating: copy.bullish,
      outlook: copy.uptrend,
      aiRead: copy.aiReadBull,
      tone: "green" as const,
    }
  }
  return {
    cycle: lang === "zh" ? "震荡吸筹" : "Range Accumulation",
    rating: copy.neutral,
    outlook: copy.sideways,
    aiRead: copy.aiReadRange,
    tone: "gold" as const,
  }
}

function yFor(value: number, height: number) {
  const top = 26
  const bottom = height - 42
  return bottom - (value / 100) * (bottom - top)
}

function toneClass(tone: Signal["tone"]) {
  if (tone === "cyan") return "text-cyan-200 border-cyan-300/15 bg-cyan-300/[0.05]"
  if (tone === "rose") return "text-rose-200 border-rose-300/15 bg-rose-300/[0.05]"
  if (tone === "green") return "text-emerald-200 border-emerald-300/15 bg-emerald-300/[0.05]"
  return "text-gold border-gold/15 bg-gold/[0.055]"
}

export default function LifeKLineChart({ scores, strongestLabel, weakestLabel, isUnlocked }: LifeKLineChartProps) {
  const { locale, localeHref } = useLanguage()
  const lang = locale === "zh" ? "zh" : "en"
  const copy = COPY[lang]
  const candles = enrichCandles(buildLifeCandles(scores))
  const market = getMarketState(scores, lang)
  const width = 880
  const height = 360
  const plotLeft = 58
  const plotRight = width - 24
  const step = (plotRight - plotLeft) / (candles.length - 1)
  const currentIndex = Math.min(candles.length - 1, Math.max(0, Math.round(candles.length * 0.58)))
  const lowCandle = candles.find((candle) => candle.tag === "low") || candles[0]
  const pivotCandle = candles.find((candle) => candle.tag === "pivot") || candles[3]
  const surgeCandle = candles.find((candle) => candle.tag === "surge") || candles[7]
  const riskCandle = candles.find((candle) => candle.tag === "risk") || candles[5]

  const closePath = candles
    .map((candle, index) => `${index === 0 ? "M" : "L"} ${plotLeft + index * step} ${yFor(candle.close, height)}`)
    .join(" ")

  const signals: Signal[] = [
    { label: copy.trendRating, value: market.rating, tone: market.tone === "green" ? "green" : market.tone === "rose" ? "rose" : "gold" },
    { label: copy.nextThreeYears, value: market.outlook, tone: "cyan" },
    { label: copy.highlightWindow, value: `${pivotCandle.age}-${surgeCandle.age}`, tone: "gold" },
    { label: copy.riskWindow, value: `${riskCandle.age}`, tone: "rose" },
    { label: copy.mainDriver, value: strongestLabel || (lang === "zh" ? "事业" : "Career"), tone: "green" },
    { label: copy.drawdown, value: weakestLabel || (lang === "zh" ? "财富" : "Wealth"), tone: "rose" },
  ]

  const yearCards = [
    { icon: TrendingDown, title: copy.lowPoint, age: lowCandle.age, desc: copy.lowDesc, tone: "rose" as const },
    { icon: Crosshair, title: copy.pivotPoint, age: pivotCandle.age, desc: copy.pivotDesc, tone: "cyan" as const },
    { icon: TrendingUp, title: copy.surgePoint, age: surgeCandle.age, desc: copy.surgeDesc, tone: "green" as const },
    { icon: ShieldAlert, title: copy.defensePoint, age: riskCandle.age, desc: copy.defenseDesc, tone: "gold" as const },
  ]

  return (
    <section className="card-glass overflow-hidden border-gold/10 bg-[#05070f] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,168,76,0.14),transparent_30%),radial-gradient(circle_at_78%_26%,rgba(34,211,238,0.10),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_45%)]" />
        <div className="relative grid xl:grid-cols-[1.55fr_0.75fr]">
          <div className="p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/[0.06] text-gold/75 text-[10px] tracking-[0.18em] uppercase mb-3">
                  <BarChart3 size={12} />
                  {copy.badge}
                </div>
                <h3 className="font-serif text-2xl md:text-4xl font-bold text-white/92 tracking-wide">{copy.title}</h3>
                <p className="text-white/38 text-xs md:text-sm mt-2 leading-relaxed">{copy.subtitle}</p>
              </div>
              <div className={`rounded-2xl border px-4 py-3 text-right ${toneClass(signals[0].tone)}`}>
                <p className="text-[10px] uppercase tracking-[0.16em] opacity-55">{copy.currentCycle}</p>
                <p className="font-serif text-lg md:text-xl">{market.cycle}</p>
              </div>
            </div>

            <div className="relative rounded-2xl border border-white/[0.07] bg-[#070a12]/90 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:100%_20%,8.333%_100%]" />
              <div className="absolute left-[7%] right-[2%] top-[12%] bottom-[12%] grid grid-rows-4 text-[9px] uppercase tracking-[0.14em] text-white/13 pointer-events-none">
                <span>{copy.highZone}</span>
                <span>{copy.breakout}</span>
                <span>{copy.volatile}</span>
                <span>{copy.accumulation}</span>
              </div>

              <svg viewBox={`0 0 ${width} ${height}`} className="relative w-full h-[300px] md:h-[390px]" role="img" aria-label={copy.title}>
                {[20, 40, 60, 80].map((level) => (
                  <g key={level}>
                    <line x1={plotLeft} x2={plotRight} y1={yFor(level, height)} y2={yFor(level, height)} stroke="rgba(255,255,255,0.08)" strokeDasharray="5 8" />
                    <text x="17" y={yFor(level, height) + 4} fill="rgba(255,255,255,0.24)" fontSize="11">{level}</text>
                  </g>
                ))}

                <text x="18" y="22" fill="rgba(255,255,255,0.30)" fontSize="11">{copy.energyIndex}</text>
                <path d={closePath} fill="none" stroke="rgba(201,168,76,0.42)" strokeWidth="1.5" strokeDasharray="7 7" strokeLinecap="round" />

                {candles.map((candle, index) => {
                  const x = plotLeft + index * step
                  const openY = yFor(candle.open, height)
                  const closeY = yFor(candle.close, height)
                  const highY = yFor(candle.high, height)
                  const lowY = yFor(candle.low, height)
                  const up = candle.close >= candle.open
                  const isCurrent = index === currentIndex
                  const isTagged = !!candle.tag
                  const color = candle.tag === "surge" ? "#C9A84C" : up ? "#22d3ee" : "#fb7185"
                  const bodyTop = Math.min(openY, closeY)
                  const bodyHeight = Math.max(12, Math.abs(closeY - openY))
                  const tagLabel = candle.tag ? copy.tags[candle.tag] : ""

                  return (
                    <g key={candle.age}>
                      {isCurrent && (
                        <rect x={x - 32} y="24" width="64" height={height - 68} rx="18" fill="rgba(201,168,76,0.08)" stroke="rgba(201,168,76,0.24)" />
                      )}
                      <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeOpacity={isCurrent ? 1 : 0.72} strokeWidth={isCurrent ? 2.6 : 2} />
                      <rect
                        x={x - 14}
                        y={bodyTop}
                        width="28"
                        height={bodyHeight}
                        rx="4"
                        fill={up ? "rgba(34,211,238,0.18)" : "rgba(251,113,133,0.16)"}
                        stroke={color}
                        strokeOpacity={isCurrent || isTagged ? 1 : 0.74}
                        strokeWidth={isCurrent ? 2 : 1.2}
                      />
                      <circle cx={x} cy={closeY} r={isTagged ? 4.2 : 2.8} fill={color} opacity={isTagged ? 1 : 0.76} />
                      <text x={x} y={height - 18} textAnchor="middle" fill={isCurrent ? "rgba(201,168,76,0.88)" : "rgba(255,255,255,0.35)"} fontSize="11">
                        {candle.age}
                      </text>
                      {tagLabel && (
                        <g>
                          <line x1={x} x2={x} y1={Math.max(30, highY - 8)} y2={Math.max(18, highY - 26)} stroke={color} strokeOpacity="0.35" />
                          <rect x={x - 34} y={Math.max(6, highY - 48)} width="68" height="20" rx="10" fill="rgba(5,7,15,0.92)" stroke={color} strokeOpacity="0.35" />
                          <text x={x} y={Math.max(20, highY - 34)} textAnchor="middle" fill={color} fontSize="10">{tagLabel}</text>
                        </g>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>

            <p className="mt-3 text-[10px] text-white/22 leading-relaxed">{copy.notAdvice}</p>
          </div>

          <aside className="border-t xl:border-t-0 xl:border-l border-white/[0.07] p-5 md:p-7 bg-black/20">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={15} className="text-gold/70" />
              <h4 className="text-sm font-semibold text-white/70">{copy.currentMarket}</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {signals.map((signal) => (
                <div key={signal.label} className={`rounded-2xl border p-3 ${toneClass(signal.tone)}`}>
                  <p className="text-[9px] uppercase tracking-[0.13em] opacity-50 mb-1">{signal.label}</p>
                  <p className="text-sm font-semibold leading-tight">{signal.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 mb-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold/55 mb-2">{copy.aiRead}</p>
              <p className="text-white/58 text-xs leading-relaxed">{market.aiRead}</p>
            </div>

            <div className="rounded-2xl border border-gold/15 bg-gold/[0.045] p-4">
              <div className="flex items-start gap-3">
                <Gem size={17} className="text-gold/75 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/42 text-xs leading-relaxed mb-3">{copy.locked}</p>
                  <Link href={localeHref(isUnlocked ? "/shop" : "/pricing")} className="inline-flex items-center gap-2 text-xs text-gold hover:text-gold-light transition-colors">
                    {copy.cta}
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="relative border-t border-white/[0.07] bg-white/[0.018] p-4 md:p-5">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {yearCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className={`rounded-2xl border p-4 ${toneClass(card.tone)}`}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={15} />
                      <p className="text-sm font-semibold">{card.title}</p>
                    </div>
                    <span className="font-mono text-xs opacity-65">{card.age}</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-62">{card.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
