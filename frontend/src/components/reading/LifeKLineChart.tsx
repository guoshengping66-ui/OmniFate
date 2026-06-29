"use client"

import Link from "next/link"
import { Activity, ArrowRight, CalendarDays, TrendingUp } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface LifeKLineChartProps {
  scores: Record<string, number>
  strongestLabel?: string
  weakestLabel?: string
  isUnlocked?: boolean
}

type Candle = {
  label: string
  open: number
  close: number
  high: number
  low: number
  note: string
}

const DIM_ORDER = ["wealth", "relationship", "career", "health", "mindfulness"]

const COPY = {
  zh: {
    badge: "Life K-Line",
    title: "人生趋势曲线",
    subtitle: "不是预测命运，而是把你当前所处的周期画出来。",
    past: "过去 12 个月",
    now: "当前阶段",
    future: "未来窗口",
    rebound: "筑底反弹",
    breakout: "蓄势突破",
    consolidation: "高位整理",
    volatile: "震荡修复",
    strongest: "最强杠杆",
    weakest: "风险短板",
    action: "本周动作",
    cta: "查看匹配商品",
    unlockHint: "完整报告会给出更细的时间节点和行动优先级。",
    actionStrong: "把主要精力押在优势维度，先做能产生正反馈的事。",
    actionWeak: "短板维度不要硬冲，先做低成本修复和节奏控制。",
    actionBalance: "本周适合稳步推进，避免同时开启太多新战线。",
    lockedCta: "查看匹配商品",
  },
  en: {
    badge: "Life K-Line",
    title: "Life Trajectory Curve",
    subtitle: "Not a prediction. A visual map of the cycle you are currently in.",
    past: "Past 12 months",
    now: "Current phase",
    future: "Future window",
    rebound: "Base rebound",
    breakout: "Breakout setup",
    consolidation: "High consolidation",
    volatile: "Volatile repair",
    strongest: "Best lever",
    weakest: "Risk gap",
    action: "This week's move",
    cta: "View matched items",
    unlockHint: "The full report adds timing details and sharper action priorities.",
    actionStrong: "Put energy into your strongest dimension first and create positive feedback.",
    actionWeak: "Do not force the weak spot. Repair rhythm and lower friction first.",
    actionBalance: "Move steadily this week and avoid opening too many new fronts.",
    lockedCta: "View matched items",
  },
} as const

function clampScore(value: number) {
  return Math.max(1.5, Math.min(9.6, value))
}

function getScoreStats(scores: Record<string, number>) {
  const values = DIM_ORDER.map((key) => scores[key] ?? 5)
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length
  const high = Math.max(...values)
  const low = Math.min(...values)
  const spread = high - low
  const momentum = (scores.career ?? 5) * 0.35 + (scores.wealth ?? 5) * 0.25 + (scores.mindfulness ?? 5) * 0.25 + (scores.health ?? 5) * 0.15

  return { avg, high, low, spread, momentum }
}

function buildCandles(scores: Record<string, number>, locale: "zh" | "en"): Candle[] {
  const copy = locale === "zh" ? COPY.zh : COPY.en
  const { avg, spread, momentum } = getScoreStats(scores)
  const pressure = Math.min(2.2, spread * 0.45)
  const pastClose = clampScore(avg - 0.8 + (momentum - 5) * 0.08)
  const nowClose = clampScore(avg + (momentum - 5) * 0.18)
  const futureClose = clampScore(nowClose + (momentum >= 6.5 ? 0.9 : momentum >= 5.2 ? 0.45 : 0.15))

  return [
    {
      label: copy.past,
      open: clampScore(pastClose + 0.4),
      close: pastClose,
      high: clampScore(pastClose + 1.2),
      low: clampScore(pastClose - 1.1 - pressure * 0.25),
      note: locale === "zh" ? "回撤区" : "Pullback",
    },
    {
      label: copy.now,
      open: clampScore(nowClose - 0.45),
      close: nowClose,
      high: clampScore(nowClose + 1.05),
      low: clampScore(nowClose - 0.9 - pressure * 0.15),
      note: locale === "zh" ? "转折点" : "Pivot",
    },
    {
      label: copy.future,
      open: clampScore(futureClose - 0.5),
      close: futureClose,
      high: clampScore(futureClose + 0.85),
      low: clampScore(futureClose - 0.75),
      note: locale === "zh" ? "窗口期" : "Window",
    },
  ]
}

function getPhase(scores: Record<string, number>, locale: "zh" | "en") {
  const copy = locale === "zh" ? COPY.zh : COPY.en
  const { avg, spread, momentum } = getScoreStats(scores)
  if (spread >= 3.2) return copy.volatile
  if (avg >= 7.5) return copy.consolidation
  if (momentum >= 6.6) return copy.breakout
  return copy.rebound
}

function yForScore(score: number, height: number) {
  const top = 18
  const bottom = height - 34
  return bottom - ((score - 1) / 9) * (bottom - top)
}

export default function LifeKLineChart({ scores, strongestLabel, weakestLabel, isUnlocked }: LifeKLineChartProps) {
  const { locale, localeHref } = useLanguage()
  const lang = locale === "zh" ? "zh" : "en"
  const copy = COPY[lang]
  const candles = buildCandles(scores, lang)
  const phase = getPhase(scores, lang)
  const width = 640
  const height = 240
  const xPositions = [110, 320, 530]
  const path = candles
    .map((candle, index) => `${index === 0 ? "M" : "L"} ${xPositions[index]} ${yForScore(candle.close, height)}`)
    .join(" ")

  const actions = [
    copy.actionStrong,
    copy.actionWeak,
    copy.actionBalance,
  ]

  return (
    <section className="card-glass overflow-hidden border-gold/10 bg-gradient-to-br from-gold/[0.035] via-white/[0.02] to-cyan-400/[0.025]">
      <div className="grid lg:grid-cols-[1.35fr_0.9fr] gap-0">
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/[0.06] text-gold/70 text-[10px] tracking-[0.18em] uppercase mb-3">
                <Activity size={12} />
                {copy.badge}
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-white/88">{copy.title}</h3>
              <p className="text-white/35 text-xs md:text-sm mt-1 leading-relaxed">{copy.subtitle}</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-3 text-right">
              <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/35">{copy.now}</p>
              <p className="text-cyan-100/85 font-serif text-lg">{phase}</p>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/[0.06] bg-[#070918]/80 p-3 md:p-4 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(201,168,76,0.13),transparent_35%),radial-gradient(circle_at_15%_85%,rgba(34,211,238,0.10),transparent_32%)]" />
            <svg viewBox={`0 0 ${width} ${height}`} className="relative w-full h-[230px] md:h-[260px]" role="img" aria-label={copy.title}>
              {[2.5, 5, 7.5].map((level) => (
                <g key={level}>
                  <line x1="44" x2="596" y1={yForScore(level, height)} y2={yForScore(level, height)} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 8" />
                  <text x="18" y={yForScore(level, height) + 4} fill="rgba(255,255,255,0.22)" fontSize="11">{level.toFixed(1)}</text>
                </g>
              ))}

              <path d={path} fill="none" stroke="rgba(201,168,76,0.72)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`${path} L 530 ${height - 34} L 110 ${height - 34} Z`} fill="rgba(201,168,76,0.08)" />

              {candles.map((candle, index) => {
                const x = xPositions[index]
                const openY = yForScore(candle.open, height)
                const closeY = yForScore(candle.close, height)
                const highY = yForScore(candle.high, height)
                const lowY = yForScore(candle.low, height)
                const up = candle.close >= candle.open
                const color = up ? "#22d3ee" : "#C9A84C"
                const bodyTop = Math.min(openY, closeY)
                const bodyHeight = Math.max(10, Math.abs(closeY - openY))

                return (
                  <g key={candle.label}>
                    <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeOpacity="0.7" strokeWidth="2" />
                    <rect x={x - 18} y={bodyTop} width="36" height={bodyHeight} rx="5" fill={up ? "rgba(34,211,238,0.18)" : "rgba(201,168,76,0.16)"} stroke={color} strokeOpacity="0.8" />
                    <circle cx={x} cy={closeY} r="4" fill={color} />
                    <text x={x} y={height - 13} textAnchor="middle" fill="rgba(255,255,255,0.42)" fontSize="12">{candle.label}</text>
                    <text x={x} y={Math.max(14, highY - 8)} textAnchor="middle" fill="rgba(201,168,76,0.70)" fontSize="11">{candle.note}</text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        <aside className="border-t lg:border-t-0 lg:border-l border-white/[0.06] p-5 md:p-6 bg-black/10">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/25 mb-2">{copy.strongest}</p>
              <p className="text-gold text-lg font-serif">{strongestLabel || "Career"}</p>
            </div>
            <div className="rounded-2xl border border-rose-300/10 bg-rose-300/[0.035] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/25 mb-2">{copy.weakest}</p>
              <p className="text-rose-200/85 text-lg font-serif">{weakestLabel || "Wealth"}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays size={14} className="text-cyan-200/70" />
                <p className="text-sm font-semibold text-white/70">{copy.action}</p>
              </div>
              <div className="space-y-2">
                {actions.map((action, index) => (
                  <p key={action} className="flex gap-2 text-xs leading-relaxed text-white/45">
                    <span className="mt-0.5 h-4 w-4 rounded-full bg-white/[0.05] text-gold/70 text-[9px] flex items-center justify-center flex-shrink-0">{index + 1}</span>
                    {action}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gold/15 bg-gold/[0.045] p-4">
              <p className="text-white/35 text-xs leading-relaxed mb-3">{copy.unlockHint}</p>
              <Link href={localeHref("/shop")} className="inline-flex items-center gap-2 text-xs text-gold hover:text-gold-light transition-colors">
                <TrendingUp size={13} />
                {isUnlocked ? copy.cta : copy.lockedCta}
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
