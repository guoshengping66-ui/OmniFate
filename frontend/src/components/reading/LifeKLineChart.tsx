"use client"

import Link from "next/link"
import {
  ArrowRight,
  Compass,
  HeartPulse,
  Mountain,
  Route,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface LifeKLineChartProps {
  scores: Record<string, number>
  strongestLabel?: string
  weakestLabel?: string
  isUnlocked?: boolean
}

type RhythmPoint = {
  age: number
  open: number
  high: number
  low: number
  close: number
  tag?: "low" | "pivot" | "rise" | "steady"
}

const DIM_ORDER = ["wealth", "career", "relationship", "health", "mindfulness"]

const COPY = {
  zh: {
    badge: "Life Rhythm",
    title: "人生节奏图",
    subtitle: "把复杂命盘翻译成一张普通人也能看懂的阶段图：哪里要稳住，哪里要转向，哪里适合发力。",
    axis: "整体状态",
    currentStage: "当前阶段",
    nextStage: "下一阶段",
    bestDriver: "最该放大",
    needsCare: "最该照顾",
    lowPoint: "低谷提醒",
    pivotPoint: "转折窗口",
    risePoint: "发力窗口",
    steadyPoint: "稳住重点",
    lowDesc: "这段更适合减负、修复作息和关系，不建议硬扛所有压力。",
    pivotDesc: "适合换方法、换节奏、重新排序目标，用小决策带来方向改变。",
    riseDesc: "适合集中资源做一件关键事，把优势维度转化为可见成果。",
    steadyDesc: "不要频繁推翻计划，先守住身体、现金流和关键关系。",
    rising: "逐步上升期",
    repairing: "修复整理期",
    balancing: "平衡蓄势期",
    readTitle: "这张图怎么读",
    readRise: "你的重点不是同时做好所有事，而是先把优势维度变成主线，再补短板。",
    readRepair: "当前需要先把底盘稳住。压力不一定代表失败，更多是在提醒你调整节奏。",
    readBalance: "整体没有明显失速，真正的突破来自稳定执行，而不是频繁换方向。",
    cta: "查看对应改善方案",
    locked: "完整报告会继续拆解具体年份、月份节奏和可执行建议。",
  },
  en: {
    badge: "Life Rhythm",
    title: "Life Rhythm Map",
    subtitle: "A plain-language view of your life phases: when to stabilize, pivot, and push forward.",
    axis: "Overall Energy",
    currentStage: "Current Stage",
    nextStage: "Next Stage",
    bestDriver: "Best Driver",
    needsCare: "Needs Care",
    lowPoint: "Low Point",
    pivotPoint: "Pivot Window",
    risePoint: "Growth Window",
    steadyPoint: "Stabilize",
    lowDesc: "Reduce load, repair rhythm, and protect relationships before taking on more pressure.",
    pivotDesc: "Change method or pace. Small decisions can shift the direction.",
    riseDesc: "Focus resources on one key move and turn your strength into visible progress.",
    steadyDesc: "Do not rebuild everything. Protect body, cash flow, and key relationships first.",
    rising: "Rising Phase",
    repairing: "Repair Phase",
    balancing: "Balancing Phase",
    readTitle: "How to read it",
    readRise: "Do not try to optimize everything at once. Make your strongest dimension the main line, then repair the weak spot.",
    readRepair: "Stabilize the base first. Pressure is not failure; it is a signal to adjust rhythm.",
    readBalance: "There is no obvious stall. The breakthrough comes from stable execution, not constant direction changes.",
    cta: "View support plan",
    locked: "The full report expands this into specific years, monthly rhythm, and concrete actions.",
  },
} as const

function clamp(value: number, min = 18, max = 94) {
  return Math.max(min, Math.min(max, value))
}

function getStats(scores: Record<string, number>) {
  const values = DIM_ORDER.map((key) => scores[key] ?? 5)
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length
  const spread = Math.max(...values) - Math.min(...values)
  const momentum =
    (scores.career ?? 5) * 0.32 +
    (scores.wealth ?? 5) * 0.22 +
    (scores.mindfulness ?? 5) * 0.22 +
    (scores.relationship ?? 5) * 0.12 +
    (scores.health ?? 5) * 0.12
  return { avg, spread, momentum }
}

function scoreSeed(scores: Record<string, number>) {
  return DIM_ORDER.reduce((sum, key, index) => sum + Math.round((scores[key] ?? 5) * 23) * (index + 5), 41)
}

function buildRhythmPoints(scores: Record<string, number>): RhythmPoint[] {
  const { avg, spread, momentum } = getStats(scores)
  const seed = scoreSeed(scores)
  const ages = [18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62]
  const base = avg * 8 + 22
  const trend = (momentum - 5.8) * 2.8
  const pressure = Math.min(17, 7 + spread * 3.2)
  let previousClose = clamp(base - pressure * 0.3)

  const points = ages.map((age, index) => {
    const open = previousClose
    const wave = Math.sin((index + seed * 0.03) * 0.86) * (9 + spread * 1.5)
      + Math.cos((index + seed * 0.05) * 1.3) * (5 + spread)
    const adjustment = index % 4 === 1 ? -pressure : index % 5 === 3 ? pressure * 0.55 : 0
    const close = clamp(open + wave * 0.72 + (index - 5) * trend * 0.28 + adjustment)
    const wick = 5 + Math.abs(wave) * 0.28 + spread * 1.3
    const high = clamp(Math.max(open, close) + wick)
    const low = clamp(Math.min(open, close) - wick)
    previousClose = close
    return { age, open, high, low, close }
  })

  const lowIndex = points.reduce((lowest, point, index) => point.low < points[lowest].low ? index : lowest, 0)
  const pivotIndex = Math.min(points.length - 2, Math.max(1, lowIndex + 1))
  const riseIndex = points.reduce((best, point, index) => {
    const move = point.close - point.open
    const bestMove = points[best].close - points[best].open
    return move > bestMove ? index : best
  }, 1)
  const steadyIndex = Math.min(points.length - 1, Math.max(6, riseIndex + 2))

  return points.map((point, index) => ({
    ...point,
    tag:
      index === lowIndex ? "low" :
      index === pivotIndex ? "pivot" :
      index === riseIndex ? "rise" :
      index === steadyIndex ? "steady" :
      undefined,
  }))
}

function getStage(scores: Record<string, number>, lang: "zh" | "en") {
  const { avg, spread, momentum } = getStats(scores)
  const copy = COPY[lang]
  if (spread >= 3 || avg < 5.6) {
    return { label: copy.repairing, tone: "rose" as const, read: copy.readRepair }
  }
  if (momentum >= 6.5 || avg >= 7) {
    return { label: copy.rising, tone: "green" as const, read: copy.readRise }
  }
  return { label: copy.balancing, tone: "gold" as const, read: copy.readBalance }
}

function yFor(value: number, height: number) {
  const top = 34
  const bottom = height - 46
  return bottom - (value / 100) * (bottom - top)
}

function xFor(index: number, total: number, width: number) {
  const left = 56
  const right = width - 26
  return left + (index * (right - left)) / (total - 1)
}

function toneClass(tone: "gold" | "green" | "rose" | "cyan") {
  if (tone === "green") return "text-emerald-100 border-emerald-300/15 bg-emerald-300/[0.055]"
  if (tone === "rose") return "text-rose-100 border-rose-300/15 bg-rose-300/[0.055]"
  if (tone === "cyan") return "text-cyan-100 border-cyan-300/15 bg-cyan-300/[0.055]"
  return "text-gold border-gold/15 bg-gold/[0.055]"
}

export default function LifeKLineChart({ scores, strongestLabel, weakestLabel, isUnlocked }: LifeKLineChartProps) {
  const { locale, localeHref } = useLanguage()
  const lang = locale === "zh" ? "zh" : "en"
  const baseCopy = COPY[lang]
  const legacyCopy = lang === "zh"
    ? {
        ...baseCopy,
        badge: "Growth Curve",
        title: "人生趋势曲线",
        subtitle: "把人生 K 线升级成成长仪表盘：看清高能期、调整期、转折期和稳定期，再决定今天怎么行动。",
        axis: "趋势能量",
        currentStage: "当前阶段",
        nextStage: "下一窗口",
        bestDriver: "优先放大",
        needsCare: "优先照顾",
        lowPoint: "调整期",
        pivotPoint: "转折期",
        risePoint: "高能期",
        steadyPoint: "稳定期",
        lowDesc: "适合减负、修复作息和关系，不建议把所有压力都硬扛下来。",
        pivotDesc: "适合换方法、换节奏、重新排序目标，用小决策带来方向变化。",
        riseDesc: "适合集中资源做一件关键事，把优势维度转化为可见成果。",
        steadyDesc: "不要频繁推翻计划，先守住身体、现金流和关键关系。",
        rising: "上升推进期",
        repairing: "修复调整期",
        balancing: "平衡积累期",
        readTitle: "如何使用这张图",
        readRise: "不要同时优化所有事。先把优势维度变成主线，再修补短板。",
        readRepair: "当前更需要稳住底盘。压力不是失败，而是在提醒你调整节奏。",
        readBalance: "整体没有明显失速，真正的突破来自稳定执行，而不是频繁换方向。",
        cta: "查看成长建议",
        locked: "完整报告会继续拆解具体年份、月份节奏和可执行建议。",
      }
    : {
        ...baseCopy,
        badge: "Growth Curve",
        title: "Life Growth Curve",
        subtitle: "Your life K-line becomes a growth dashboard: high-energy phases, adjustment windows, pivot moments, and stable periods.",
        axis: "Trend Energy",
        currentStage: "Current Phase",
        nextStage: "Next Window",
        bestDriver: "Amplify First",
        needsCare: "Care First",
        lowPoint: "Adjustment",
        pivotPoint: "Pivot",
        risePoint: "High Energy",
        steadyPoint: "Stable Phase",
        readTitle: "How to use this chart",
        cta: "View growth guidance",
        locked: "The full report expands this into years, monthly rhythm, and concrete actions.",
      }
  const copy = lang === "zh" ? {
    ...legacyCopy,
    badge: "\u4eba\u751f K \u7ebf",
    title: "\u4eba\u751f\u8d8b\u52bf K \u7ebf",
    subtitle: "\u6839\u636e\u672c\u6b21\u62a5\u544a\u7684\u4e94\u7ef4\u8bc4\u5206\uff0c\u663e\u793a\u4e0d\u540c\u9636\u6bb5\u7684\u8d77\u4f0f\u3001\u8c03\u6574\u4e0e\u7a81\u7834\u7a97\u53e3\u3002",
    axis: "\u8d8b\u52bf\u80fd\u91cf",
    currentStage: "\u5f53\u524d\u9636\u6bb5",
    nextStage: "\u4e0b\u4e00\u7a97\u53e3",
    bestDriver: "\u4f18\u5148\u653e\u5927",
    needsCare: "\u4f18\u5148\u7167\u987e",
    lowPoint: "\u8c03\u6574\u671f",
    pivotPoint: "\u8f6c\u6298\u7a97\u53e3",
    risePoint: "\u9ad8\u80fd\u671f",
    steadyPoint: "\u7a33\u5b9a\u671f",
    lowDesc: "\u5148\u51cf\u8d1f\u3001\u4fee\u590d\u4f5c\u606f\u4e0e\u5173\u7cfb\u8282\u594f\uff0c\u4e0d\u5b9c\u5728\u538b\u529b\u4e0b\u7d2f\u52a0\u5927\u51b3\u7b56\u3002",
    pivotDesc: "\u9002\u5408\u66f4\u6362\u65b9\u6cd5\u6216\u8282\u594f\uff0c\u7528\u5c0f\u51b3\u7b56\u5e26\u6765\u65b9\u5411\u6539\u53d8\u3002",
    riseDesc: "\u9002\u5408\u96c6\u4e2d\u8d44\u6e90\u5b8c\u6210\u4e00\u4ef6\u5173\u952e\u4ea4\u4ed8\uff0c\u628a\u4f18\u52bf\u53d8\u6210\u53ef\u89c1\u6210\u679c\u3002",
    steadyDesc: "\u4e0d\u9700\u9891\u7e41\u63a8\u7ffb\u8ba1\u5212\uff0c\u5148\u5b88\u4f4f\u8eab\u4f53\u3001\u73b0\u91d1\u6d41\u4e0e\u5173\u952e\u5173\u7cfb\u3002",
    rising: "\u4e0a\u5347\u63a8\u8fdb\u671f",
    repairing: "\u4fee\u590d\u8c03\u6574\u671f",
    balancing: "\u5e73\u8861\u79ef\u7d2f\u671f",
    readTitle: "\u5982\u4f55\u8bfb\u8fd9\u5f20\u56fe",
    readRise: "\u4e0d\u8981\u540c\u65f6\u4f18\u5316\u6240\u6709\u4e8b\u3002\u5148\u628a\u4f18\u52bf\u7ef4\u5ea6\u53d8\u6210\u4e3b\u7ebf\uff0c\u518d\u4fee\u8865\u77ed\u677f\u3002",
    readRepair: "\u5f53\u524d\u5148\u7a33\u4f4f\u5e95\u76d8\u3002\u538b\u529b\u4e0d\u7b49\u4e8e\u5931\u8d25\uff0c\u800c\u662f\u9700\u8981\u8c03\u6574\u8282\u594f\u7684\u4fe1\u53f7\u3002",
    readBalance: "\u6ca1\u6709\u660e\u663e\u5931\u8861\u65f6\uff0c\u771f\u6b63\u7684\u7a81\u7834\u6765\u81ea\u7a33\u5b9a\u6267\u884c\uff0c\u800c\u4e0d\u662f\u9891\u7e41\u6362\u65b9\u5411\u3002",
    cta: "\u67e5\u770b\u5bf9\u5e94\u6210\u957f\u5efa\u8bae",
    locked: "\u5b8c\u6574\u62a5\u544a\u4f1a\u7ee7\u7eed\u62c6\u89e3\u5177\u4f53\u9636\u6bb5\u4e0e\u53ef\u6267\u884c\u884c\u52a8\u3002",
  } : legacyCopy
  const points = buildRhythmPoints(scores)
  const stage = getStage(scores, lang)
  const width = 880
  const height = 330
  const currentIndex = Math.min(points.length - 1, Math.max(0, Math.round(points.length * 0.58)))
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${xFor(index, points.length, width)} ${yFor(point.close, height)}`).join(" ")
  const area = `${path} L ${xFor(points.length - 1, points.length, width)} ${height - 46} L 56 ${height - 46} Z`
  const low = points.find((point) => point.tag === "low") || points[0]
  const pivot = points.find((point) => point.tag === "pivot") || points[3]
  const rise = points.find((point) => point.tag === "rise") || points[7]
  const steady = points.find((point) => point.tag === "steady") || points[9]
  const tagText = {
    low: copy.lowPoint,
    pivot: copy.pivotPoint,
    rise: copy.risePoint,
    steady: copy.steadyPoint,
  }

  const summaryCards = [
    { label: copy.currentStage, value: stage.label, tone: stage.tone },
    { label: copy.nextStage, value: `${pivot.age}-${rise.age}`, tone: "cyan" as const },
    { label: copy.bestDriver, value: strongestLabel || (lang === "zh" ? "事业" : "Career"), tone: "green" as const },
    { label: copy.needsCare, value: weakestLabel || (lang === "zh" ? "健康" : "Health"), tone: "rose" as const },
  ]

  const phaseCards = [
    { icon: HeartPulse, title: copy.lowPoint, age: low.age, desc: copy.lowDesc, tone: "rose" as const },
    { icon: Compass, title: copy.pivotPoint, age: pivot.age, desc: copy.pivotDesc, tone: "cyan" as const },
    { icon: SunMedium, title: copy.risePoint, age: rise.age, desc: copy.riseDesc, tone: "green" as const },
    { icon: ShieldCheck, title: copy.steadyPoint, age: steady.age, desc: copy.steadyDesc, tone: "gold" as const },
  ]

  return (
    <section className="card-glass overflow-hidden border-gold/10 bg-[#070910] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,168,76,0.14),transparent_30%),radial-gradient(circle_at_78%_24%,rgba(45,212,191,0.10),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_48%)]" />
        <div className="relative grid xl:grid-cols-[1.45fr_0.8fr]">
          <div className="p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/[0.06] text-gold/75 text-[10px] tracking-[0.18em] uppercase mb-3">
                  <Route size={12} />
                  {copy.badge}
                </div>
                <h3 className="font-serif text-2xl md:text-4xl font-bold text-white/92 tracking-wide">{copy.title}</h3>
                <p className="text-white/42 text-xs md:text-sm mt-2 leading-relaxed">{copy.subtitle}</p>
              </div>
              <div className={`rounded-2xl border px-4 py-3 text-right ${toneClass(stage.tone)}`}>
                <p className="text-[10px] uppercase tracking-[0.16em] opacity-55">{copy.currentStage}</p>
                <p className="font-serif text-lg md:text-xl">{stage.label}</p>
              </div>
            </div>

            <div className="relative rounded-2xl border border-white/[0.07] bg-[#080c14]/90 overflow-x-auto">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:100%_25%,8.333%_100%]" />
              <div className="relative min-w-[720px]">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[285px] md:h-[360px]" role="img" aria-label={copy.title}>
                <defs>
                  <linearGradient id="lifeRhythmLine" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#67e8f9" />
                    <stop offset="52%" stopColor="#C9A84C" />
                    <stop offset="100%" stopColor="#86efac" />
                  </linearGradient>
                  <linearGradient id="lifeRhythmArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(201,168,76,0.24)" />
                    <stop offset="100%" stopColor="rgba(201,168,76,0.02)" />
                  </linearGradient>
                </defs>
                {[25, 50, 75].map((level) => (
                  <g key={level}>
                    <line x1="56" x2={width - 26} y1={yFor(level, height)} y2={yFor(level, height)} stroke="rgba(255,255,255,0.08)" strokeDasharray="5 8" />
                    <text x="16" y={yFor(level, height) + 4} fill="rgba(255,255,255,0.52)" fontSize="13">{level}</text>
                  </g>
                ))}
                <text x="16" y="24" fill="rgba(255,255,255,0.68)" fontSize="13">{copy.axis}</text>
                <rect x={xFor(currentIndex, points.length, width) - 30} y="30" width="60" height={height - 76} rx="18" fill="rgba(201,168,76,0.08)" stroke="rgba(201,168,76,0.22)" />
                <path d={area} fill="url(#lifeRhythmArea)" />
                <path d={path} fill="none" stroke="url(#lifeRhythmLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((point, index) => {
                  const x = xFor(index, points.length, width)
                  const y = yFor(point.close, height)
                  const openY = yFor(point.open, height)
                  const highY = yFor(point.high, height)
                  const lowY = yFor(point.low, height)
                  const rising = point.close >= point.open
                  const bodyY = Math.min(openY, y)
                  const bodyHeight = Math.max(4, Math.abs(openY - y))
                  const tagged = !!point.tag
                  const isCurrent = index === currentIndex
                  return (
                    <g key={point.age}>
                      <line x1={x} x2={x} y1={highY} y2={lowY} stroke={rising ? "#86efac" : "#fda4af"} strokeOpacity="0.9" strokeWidth="2" />
                      <rect x={x - 8} y={bodyY} width="16" height={bodyHeight} rx="2" fill={rising ? "#34d399" : "#fb7185"} fillOpacity={tagged || isCurrent ? "0.95" : "0.72"} stroke="rgba(5,7,15,0.8)" strokeWidth="1" />
                      {(tagged || isCurrent) && <circle cx={x} cy={y} r="3.5" fill={tagged ? "#C9A84C" : "#67e8f9"} stroke="rgba(5,7,15,0.95)" strokeWidth="2" />}
                      <text x={x} y={height - 18} textAnchor="middle" fill={isCurrent ? "rgba(201,168,76,0.96)" : "rgba(255,255,255,0.62)"} fontSize="13">
                        {point.age}
                      </text>
                      {point.tag && (
                        <g>
                          <line x1={x} x2={x} y1={Math.max(36, y - 12)} y2={Math.max(22, y - 32)} stroke="#C9A84C" strokeOpacity="0.35" />
                          <rect x={x - 34} y={Math.max(6, y - 54)} width="68" height="22" rx="11" fill="rgba(5,7,15,0.92)" stroke="rgba(201,168,76,0.36)" />
                          <text x={x} y={Math.max(21, y - 39)} textAnchor="middle" fill="#f4d783" fontSize="12">{tagText[point.tag]}</text>
                        </g>
                      )}
                    </g>
                  )
                })}
              </svg>
              </div>
            </div>
          </div>

          <aside className="border-t xl:border-t-0 xl:border-l border-white/[0.07] p-5 md:p-7 bg-black/20">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={15} className="text-gold/70" />
              <h4 className="text-sm font-semibold text-white/70">{copy.readTitle}</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {summaryCards.map((card) => (
                <div key={card.label} className={`rounded-2xl border p-3 ${toneClass(card.tone)}`}>
                  <p className="text-[9px] uppercase tracking-[0.13em] opacity-50 mb-1">{card.label}</p>
                  <p className="text-sm font-semibold leading-tight">{card.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-[#030918] p-4 mb-4">
              <p className="text-white/58 text-xs leading-relaxed">{stage.read}</p>
            </div>
            <div className="rounded-2xl border border-gold/15 bg-gold/[0.045] p-4">
              <div className="flex items-start gap-3">
                <Mountain size={17} className="text-gold/75 flex-shrink-0 mt-0.5" />
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
            {phaseCards.map((card) => {
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
