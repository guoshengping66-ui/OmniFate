"use client"

import { Compass, Route, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import type { AnnualForecast, AnnualForecastMonth } from "@/lib/api"

interface LifeKLineChartProps {
  annualForecast: AnnualForecast
}

type Tone = "green" | "rose" | "cyan" | "gold"

const COPY = {
  zh: {
    badge: "年度运势",
    title: "未来 12 个月趋势",
    subtitle: "曲线与关键节点只展示后端生成的月度信号，不在前端补全或推算。",
    axis: "得分",
    signals: "12 个月的信号摘要",
    keyNodes: "关键节点",
    action: "建议行动",
    avoid: "需要避免",
    confidence: "信号置信度",
    states: {
      advance: "推进",
      build: "积累",
      adjust: "调整",
      stabilize: "稳住",
    },
  },
  en: {
    badge: "Annual Outlook",
    title: "Your Next 12 Months",
    subtitle: "The curve and key nodes display only backend-produced monthly signals. The client never fills gaps or recalculates them.",
    axis: "Score",
    signals: "Signals across 12 months",
    keyNodes: "Key nodes",
    action: "Suggested action",
    avoid: "Avoid",
    confidence: "Signal confidence",
    states: {
      advance: "Advance",
      build: "Build",
      adjust: "Adjust",
      stabilize: "Stabilize",
    },
  },
}

function toneFor(state: AnnualForecastMonth["state"]): Tone {
  if (state === "advance") return "green"
  if (state === "adjust") return "rose"
  if (state === "build") return "cyan"
  return "gold"
}

function toneClass(tone: Tone) {
  if (tone === "green") return "border-emerald-300/15 bg-emerald-300/[0.055] text-emerald-100"
  if (tone === "rose") return "border-rose-300/15 bg-rose-300/[0.055] text-rose-100"
  if (tone === "cyan") return "border-cyan-300/15 bg-cyan-300/[0.055] text-cyan-100"
  return "border-gold/15 bg-gold/[0.055] text-gold"
}

function monthLabel(month: string) {
  return month.replace("-", ".")
}

function yFor(score: number, height: number) {
  const top = 34
  const bottom = height - 42
  return bottom - (score / 100) * (bottom - top)
}

function xFor(index: number, total: number, width: number) {
  const left = 52
  const right = width - 22
  return left + (index * (right - left)) / Math.max(total - 1, 1)
}

export default function LifeKLineChart({ annualForecast }: LifeKLineChartProps) {
  const { locale } = useLanguage()
  const copy = COPY[locale === "zh" ? "zh" : "en"]
  const months = annualForecast.months
  const keyNodesByMonth = new Map(annualForecast.key_nodes.map(node => [node.month, node]))
  const width = 880
  const height = 300
  const path = months
    .map((month, index) => `${index === 0 ? "M" : "L"} ${xFor(index, months.length, width)} ${yFor(month.score, height)}`)
    .join(" ")
  const area = `${path} L ${xFor(months.length - 1, months.length, width)} ${height - 42} L 52 ${height - 42} Z`

  return (
    <section className="card-glass overflow-hidden border-gold/10 bg-[#070910] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="relative p-5 md:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,168,76,0.14),transparent_30%),radial-gradient(circle_at_78%_24%,rgba(45,212,191,0.10),transparent_28%)]" />
        <div className="relative">
          <div className="mb-5 max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-gold/75">
              <Route size={12} />
              {copy.badge}
            </div>
            <h3 className="font-serif text-2xl font-bold tracking-wide text-white/92 md:text-4xl">{copy.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/42 md:text-sm">{copy.subtitle}</p>
          </div>

          <div className="relative overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#080c14]/90">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:100%_25%,8.333%_100%]" />
            <div className="relative min-w-[720px]">
              <svg viewBox={`0 0 ${width} ${height}`} className="h-[270px] w-full md:h-[340px]" role="img" aria-label={copy.title}>
                <defs>
                  <linearGradient id="annualForecastLine" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#67e8f9" />
                    <stop offset="52%" stopColor="#C9A84C" />
                    <stop offset="100%" stopColor="#86efac" />
                  </linearGradient>
                  <linearGradient id="annualForecastArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(201,168,76,0.24)" />
                    <stop offset="100%" stopColor="rgba(201,168,76,0.02)" />
                  </linearGradient>
                </defs>
                {[25, 50, 75].map(level => (
                  <g key={level}>
                    <line x1="52" x2={width - 22} y1={yFor(level, height)} y2={yFor(level, height)} stroke="rgba(255,255,255,0.08)" strokeDasharray="5 8" />
                    <text x="13" y={yFor(level, height) + 4} fill="rgba(255,255,255,0.52)" fontSize="13">{level}</text>
                  </g>
                ))}
                <text x="13" y="24" fill="rgba(255,255,255,0.68)" fontSize="13">{copy.axis}</text>
                <path d={area} fill="url(#annualForecastArea)" />
                <path d={path} fill="none" stroke="url(#annualForecastLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {months.map((month, index) => {
                  const x = xFor(index, months.length, width)
                  const y = yFor(month.score, height)
                  const keyNode = keyNodesByMonth.get(month.month)
                  return (
                    <g key={month.month}>
                      <title>{month.evidence.map(signal => signal.summary).join(" ")}</title>
                      {keyNode && <circle cx={x} cy={y} r="10" fill="rgba(201,168,76,0.16)" stroke="rgba(201,168,76,0.65)" strokeWidth="1.5" />}
                      <circle cx={x} cy={y} r={keyNode ? "5" : "3.5"} fill={keyNode ? "#f4d783" : "#67e8f9"} stroke="rgba(5,7,15,0.95)" strokeWidth="2" />
                      <text x={x} y={height - 18} textAnchor="middle" fill={keyNode ? "rgba(244,215,131,0.98)" : "rgba(255,255,255,0.62)"} fontSize="12">{monthLabel(month.month)}</text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.07] bg-black/20 p-5 md:p-7">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={15} className="text-gold/70" />
          <h4 className="text-sm font-semibold text-white/72">{copy.signals}</h4>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {months.map(month => (
            <article key={month.month} className={`rounded-2xl border p-4 ${toneClass(toneFor(month.state))}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-xs opacity-75">{monthLabel(month.month)}</span>
                <span className="rounded-full border border-current/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]">{copy.states[month.state]}</span>
              </div>
              <p className="mb-2 font-serif text-xl">{month.score}</p>
              <div className="space-y-2 text-xs leading-relaxed opacity-72">
                {month.evidence.map(signal => <p key={signal.signal_id}>{signal.summary}</p>)}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.07] bg-white/[0.018] p-5 md:p-7">
        <div className="mb-4 flex items-center gap-2">
          <Compass size={15} className="text-gold/70" />
          <h4 className="text-sm font-semibold text-white/72">{copy.keyNodes}</h4>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {annualForecast.key_nodes.map(node => (
            <article key={node.id} className={`rounded-2xl border p-4 ${toneClass(toneFor(node.state))}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-xs opacity-75">{monthLabel(node.month)}</span>
                <span className="text-[10px] uppercase tracking-[0.12em] opacity-60">{copy.confidence}: {node.confidence}</span>
              </div>
              <p className="mb-3 text-sm font-semibold leading-relaxed">{node.theme}</p>
              <p className="mb-2 text-xs leading-relaxed opacity-72"><span className="font-medium opacity-100">{copy.action}: </span>{node.action}</p>
              <p className="mb-3 text-xs leading-relaxed opacity-72"><span className="font-medium opacity-100">{copy.avoid}: </span>{node.avoid}</p>
              <div className="space-y-2 border-t border-current/15 pt-3 text-xs leading-relaxed opacity-72">
                {node.evidence.map(signal => <p key={signal.signal_id}>{signal.summary}</p>)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
