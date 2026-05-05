"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, TrendingUp, TrendingDown, Minus, Heart, Briefcase, Wallet, Activity, AlertTriangle, Palette, Hash, ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface FortuneData {
  overall: number
  wealth: number
  career: number
  love: number
  health: number
  lucky_color_idx: number
  lucky_number: number
  advice_idx: number
  warning_idx: number
}

function generateFortune(): FortuneData {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const hash = (n: number) => {
    const x = Math.sin(seed * 9301 + n * 49297) * 49297
    return x - Math.floor(x)
  }
  const score = (base: number, variance: number) =>
    Math.round(Math.max(1, Math.min(10, base + (hash(variance) - 0.5) * variance)))

  return {
    overall: score(6, 4),
    wealth: score(5, 5),
    career: score(6, 4),
    love: score(5, 5),
    health: score(6, 3),
    lucky_color_idx: Math.floor(hash(100) * 9),
    lucky_number: Math.floor(hash(200) * 9) + 1,
    advice_idx: Math.floor(hash(300) * 10),
    warning_idx: Math.floor(hash(400) * 10),
  }
}

const COLOR_KEYS = [
  "fortune.color.gold", "fortune.color.red", "fortune.color.blue",
  "fortune.color.green", "fortune.color.purple", "fortune.color.white",
  "fortune.color.black", "fortune.color.pink", "fortune.color.orange",
] as const

const COLOR_HEX = ["#C9A84C", "#E63946", "#2980B9", "#52B788", "#9B59B6", "#E8E8E8", "#333333", "#F472B6", "#F97316"]

const ADVICE_KEYS = [
  "fortune.advice.1", "fortune.advice.2", "fortune.advice.3",
  "fortune.advice.4", "fortune.advice.5", "fortune.advice.6",
  "fortune.advice.7", "fortune.advice.8", "fortune.advice.9",
  "fortune.advice.10",
] as const

const WARNING_KEYS = [
  "fortune.warning.1", "fortune.warning.2", "fortune.warning.3",
  "fortune.warning.4", "fortune.warning.5", "fortune.warning.6",
  "fortune.warning.7", "fortune.warning.8", "fortune.warning.9",
  "fortune.warning.10",
] as const

function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-400"
  if (score >= 6) return "text-gold"
  if (score >= 4) return "text-orange-400"
  return "text-red-400"
}

function getScoreHex(score: number): string {
  if (score >= 8) return "#4ade80"
  if (score >= 6) return "#C9A84C"
  if (score >= 4) return "#fb923c"
  return "#f87171"
}

function getScoreLabelKey(score: number) {
  if (score >= 9) return "fortune.score.excellent"
  if (score >= 7) return "fortune.score.good"
  if (score >= 5) return "fortune.score.neutral"
  if (score >= 3) return "fortune.score.low"
  return "fortune.score.poor"
}

/* ─── Circular Gauge SVG ─── */
function GaugeRing({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 10) * circumference
  const color = getScoreHex(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: "stroke-dasharray 1.2s ease-out" }}
        />
        {/* Glow overlay */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          opacity={0.3}
          style={{ transition: "stroke-dasharray 1.2s ease-out", filter: "blur(8px)" }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold font-serif ${getScoreColor(score)}`}>{score}</span>
        <span className="text-white/30 text-xs mt-0.5">/10</span>
      </div>
    </div>
  )
}

/* ─── Dimension progress bar ─── */
function DimBar({
  icon, label, score, color, delay,
}: {
  icon: React.ReactNode; label: string; score: number; color: string; delay: number
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-20 md:w-24 flex-shrink-0">
        <span style={{ color }} className="opacity-70">{icon}</span>
        <span className="text-white/60 text-sm">{label}</span>
      </div>
      <div className="flex-1 h-3 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score * 10}%`,
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            transition: `width 1s ease-out ${delay}s`,
          }}
        />
      </div>
      <span className="text-white/40 text-xs w-8 text-right font-mono">{score}/10</span>
    </div>
  )
}

export function DailyFortune() {
  const { locale, t } = useLanguage()
  const [fortune, setFortune] = useState<FortuneData | null>(null)

  useEffect(() => { setFortune(generateFortune()) }, [])

  if (!fortune) return null

  const isZh = locale === "zh"
  const today = new Date()
  const weekdays = t("fortune.weekdays").split(",")
  const weekDay = weekdays[today.getDay()]
  const dateStr = isZh
    ? `${today.getMonth() + 1}月${today.getDate()}日 星期${weekDay}`
    : `${today.toLocaleString("en-US", { month: "short" })} ${today.getDate()}, ${weekDay}`

  const dims = [
    { icon: <Wallet size={14} />, key: "fortune.wealth" as const, score: fortune.wealth, color: "#C9A84C" },
    { icon: <Briefcase size={14} />, key: "fortune.career" as const, score: fortune.career, color: "#52B788" },
    { icon: <Heart size={14} />, key: "fortune.love" as const, score: fortune.love, color: "#E63946" },
    { icon: <Activity size={14} />, key: "fortune.health" as const, score: fortune.health, color: "#2980B9" },
  ]

  return (
    <div className="card-glass-elevated overflow-hidden">
      {/* ─── Top Section: Gauge + Dimension Bars ─── */}
      <div className="p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Circular gauge */}
          <div className="flex flex-col items-center gap-4">
            <GaugeRing score={fortune.overall} />
            <div className="text-center">
              <span className={`text-sm font-bold ${getScoreColor(fortune.overall)}`}>
                {t("fortune.todayLevel")}: {t(getScoreLabelKey(fortune.overall))}
              </span>
              <p className="text-white/25 text-xs mt-1">{dateStr}</p>
            </div>
          </div>

          {/* Right: Dimension bars */}
          <div className="space-y-4">
            <p className="text-white/40 text-xs tracking-wider uppercase mb-1">{t("fortune.overallScore")}</p>
            {dims.map((d, i) => (
              <DimBar
                key={d.key}
                icon={d.icon}
                label={t(d.key)}
                score={d.score}
                color={d.color}
                delay={0.2 + i * 0.1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Middle: Lucky Color + Lucky Number ─── */}
      <div className="px-6 pb-6 md:px-8 md:pb-6">
        <div className="grid grid-cols-2 gap-3">
          {/* Lucky Color */}
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <Palette size={14} className="text-gold/60" />
              <span className="text-white/40 text-xs">{t("fortune.luckyColor")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                style={{ background: COLOR_HEX[fortune.lucky_color_idx] }}
              />
              <span className="text-gold font-medium text-sm">
                {t(COLOR_KEYS[fortune.lucky_color_idx])}
              </span>
            </div>
          </div>

          {/* Lucky Number */}
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <Hash size={14} className="text-gold/60" />
              <span className="text-white/40 text-xs">{t("fortune.luckyNumber")}</span>
            </div>
            <span className="text-gold font-serif font-bold text-2xl">{fortune.lucky_number}</span>
          </div>
        </div>
      </div>

      {/* ─── Advice + Warning ─── */}
      <div className="px-6 pb-6 md:px-8 md:pb-6 space-y-3">
        {/* Advice */}
        <div className="p-4 bg-gold/[0.04] rounded-xl border border-gold/10 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={14} className="text-gold" />
          </div>
          <div>
            <p className="text-gold/80 text-xs font-medium mb-0.5">{t("fortune.advice")}</p>
            <p className="text-white/50 text-sm leading-relaxed">{t(ADVICE_KEYS[fortune.advice_idx])}</p>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 bg-red-500/[0.04] rounded-xl border border-red-400/10 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={14} className="text-red-400" />
          </div>
          <div>
            <p className="text-red-400/70 text-xs font-medium mb-0.5">{t("fortune.warning")}</p>
            <p className="text-white/50 text-sm leading-relaxed">{t(WARNING_KEYS[fortune.warning_idx])}</p>
          </div>
        </div>
      </div>

      {/* ─── CTA ─── */}
      <div className="px-6 pb-6 md:px-8 md:pb-8">
        <Link
          href="/reading/new"
          className="btn-gold w-full flex items-center justify-center gap-2 text-sm py-3 group"
        >
          {t("fortune.startReading")}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
