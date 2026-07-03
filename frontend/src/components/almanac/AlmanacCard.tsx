"use client"

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  Leaf,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { buildDailyTrendViewModel, type DailyTrendSource } from "@/lib/dailyTrend"
import { cleanLunarDate, translateGanZhi } from "@/lib/translations"

type LegacyAlmanacItem = {
  label: string
  value?: string
  score?: number
}

interface AlmanacCardProps {
  data?: DailyTrendSource
  date?: string
  lunarDate?: string
  yi?: LegacyAlmanacItem[]
  ji?: LegacyAlmanacItem[]
  hu?: LegacyAlmanacItem[]
  dayScore?: number
  baziDayPillar?: string
  compact?: boolean
}

function formatDate(date: string, locale: string) {
  if (!date) return ""
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "long",
    day: "numeric",
    weekday: "long",
  })
}

function scoreTone(score: number) {
  if (score >= 72) return "text-emerald-300 border-emerald-400/25 bg-emerald-400/10"
  if (score >= 45) return "text-gold border-gold/25 bg-gold/10"
  return "text-rose-300 border-rose-400/25 bg-rose-400/10"
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
      <div className="h-full rounded-full bg-gold/70" style={{ width: `${value}%` }} />
    </div>
  )
}

export function AlmanacCard(props: AlmanacCardProps) {
  const { locale } = useLanguage()
  const source: DailyTrendSource = props.data ?? {
    date: props.date ?? "",
    lunarDate: props.lunarDate ?? "",
    baziDayPillar: props.baziDayPillar ?? "",
    dayScore: props.dayScore ?? 50,
    yi: props.yi ?? [],
    ji: props.ji ?? [],
    hu: props.hu ?? [],
  }
  const trend = buildDailyTrendViewModel(source, locale)
  const isZh = locale === "zh"
  const dateText = formatDate(trend.date, locale)
  const pillarText = isZh ? trend.baziDayPillar : translateGanZhi(trend.baziDayPillar)
  const tone = scoreTone(trend.score)

  return (
    <section className={`space-y-4 ${props.compact ? "" : "md:space-y-5"}`}>
      <div className="card-solid overflow-hidden p-0">
        <header className="border-b border-white/[0.06] bg-white/[0.025] px-5 py-5 md:px-7 md:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-parchment-400">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-gold/70" />
                  {dateText || trend.date}
                </span>
                {trend.lunarDate && <span>{cleanLunarDate(trend.lunarDate, isZh)}</span>}
                {pillarText && <span>{isZh ? "日柱" : "Day pillar"}: {pillarText}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${tone}`}>
                  <Sparkles size={13} />
                  {trend.trendLabel}
                </span>
                <span className="text-xs text-parchment-400">{isZh ? "今日主线" : "Throughline"}: {trend.focusArea}</span>
              </div>
              <h2 className="mt-4 max-w-2xl font-serif text-2xl font-bold leading-tight text-white md:text-3xl">
                {trend.headline}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-parchment-300">{trend.summary}</p>
            </div>

            <div className="w-full rounded-xl border border-white/[0.06] bg-black/20 p-4 lg:w-40">
              <div className="flex items-end justify-between lg:block">
                <div>
                  <p className="text-xs text-parchment-400">{isZh ? "趋势分" : "Trend score"}</p>
                  <p className="mt-1 font-serif text-4xl font-bold text-gold">{trend.score}</p>
                </div>
                <p className="text-xs text-parchment-400 lg:mt-1">/100</p>
              </div>
              <div className="mt-3">
                <ProgressBar value={trend.score} />
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="space-y-5 border-white/[0.06] p-5 md:p-7 lg:border-r">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Target size={16} className="text-gold/75" />
                  <h3 className="text-sm font-semibold text-parchment-200">{isZh ? "今日主线" : "Main focus"}</h3>
                </div>
                <p className="text-sm leading-6 text-parchment-300">{trend.focusArea}</p>
              </div>

              <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.055] p-4">
                <div className="mb-2 flex items-center gap-2 text-amber-200/82">
                  <AlertTriangle size={16} />
                  <h3 className="text-sm font-semibold">{isZh ? "风险提醒" : "Risk signal"}</h3>
                </div>
                <p className="text-sm leading-6 text-parchment-300">{trend.riskSignal}</p>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 size={17} className="text-gold/75" />
                <h3 className="text-sm font-semibold text-parchment-200">{isZh ? "今天就做这三件事" : "Three useful actions"}</h3>
              </div>
              <div className="space-y-2.5">
                {trend.actions.map((action, index) => (
                  <div key={action} className="flex gap-3 rounded-lg border border-white/[0.06] bg-white/[0.025] p-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gold/10 text-xs font-semibold text-gold">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-5 text-parchment-200">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.045] p-4">
                <div className="mb-2 flex items-center gap-2 text-emerald-200/82">
                  <CheckCircle2 size={16} />
                  <h3 className="text-sm font-semibold">{isZh ? "适合" : "Favorable"}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trend.yi.length > 0 ? trend.yi.map((item) => (
                    <span key={`${item.label}-${item.value}`} className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-xs text-emerald-100/75">
                      {item.label}
                    </span>
                  )) : <span className="text-xs text-parchment-400">{isZh ? "保持当前节奏" : "Keep the current rhythm"}</span>}
                </div>
              </div>

              <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.04] p-4">
                <div className="mb-2 flex items-center gap-2 text-rose-200/82">
                  <ShieldCheck size={16} />
                  <h3 className="text-sm font-semibold">{isZh ? "避开" : "Avoid"}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trend.ji.length > 0 ? trend.ji.map((item) => (
                    <span key={`${item.label}-${item.value}`} className="rounded-full bg-rose-300/10 px-2.5 py-1 text-xs text-rose-100/70">
                      {item.label}
                    </span>
                  )) : <span className="text-xs text-parchment-400">{isZh ? "暂无明显禁忌" : "No strong avoid signal"}</span>}
                </div>
              </div>
            </div>
          </main>

          <aside className="space-y-5 p-5 md:p-7">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Clock3 size={17} className="text-gold/70" />
                <h3 className="text-sm font-semibold text-parchment-200">{isZh ? "分时节奏" : "Daily rhythm"}</h3>
              </div>
              <div className="space-y-3">
                {trend.timeWindows.map((window) => (
                  <div key={window.label} className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3">
                    <p className="mb-1 text-xs font-medium text-gold/72">{window.label}</p>
                    <p className="text-xs leading-5 text-parchment-300">{window.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <Compass size={17} className="text-gold/70" />
                <h3 className="text-sm font-semibold text-parchment-200">{isZh ? "四项状态" : "Signal map"}</h3>
              </div>
              <div className="space-y-3">
                {trend.dimensions.map((dimension) => (
                  <div key={dimension.label}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                      <span className="text-parchment-300">{dimension.label}</span>
                      <span className="text-parchment-400">{dimension.note} · {dimension.value}</span>
                    </div>
                    <ProgressBar value={dimension.value} />
                  </div>
                ))}
              </div>
            </div>

            {(trend.wuxingAnalysis || trend.dailyQuote || trend.hu.length > 0) && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Leaf size={16} className="text-gold/70" />
                  <h3 className="text-sm font-semibold text-parchment-200">{isZh ? "依据与补充" : "Evidence"}</h3>
                </div>
                {trend.wuxingAnalysis && <p className="text-xs leading-5 text-parchment-300">{trend.wuxingAnalysis}</p>}
                {trend.dailyQuote && <p className="mt-3 border-l border-gold/25 pl-3 font-serif text-sm italic leading-6 text-gold/72">{trend.dailyQuote}</p>}
                {trend.hu.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {trend.hu.map((item, index) => (
                      <p key={`${item.label}-${index}`} className="text-xs leading-5 text-parchment-400">
                        <span className="text-gold/62">{item.productName || item.value || (isZh ? "护持建议" : "Guard")}:</span>{" "}
                        {item.reason || item.label}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
