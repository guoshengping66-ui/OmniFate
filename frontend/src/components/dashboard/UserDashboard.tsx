"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Clock3, Loader2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { listMyReadings, type ReadingListItem } from "@/lib/api"
import { ProfileCard } from "./ProfileCard"
import { IntentButtons } from "./IntentButtons"
import { GeworkDrawer } from "./GeworkDrawer"
import { TagBadge } from "@/components/ui/TagBadge"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"

const zhSignals = [
  { name: "八字底盘", value: 86, note: "结构稳定", color: "#C9A84C" },
  { name: "紫微信号", value: 78, note: "关系宫位活跃", color: "#59B894" },
  { name: "星盘节律", value: 72, note: "适合复盘", color: "#74A7D8" },
  { name: "卜卦直觉", value: 64, note: "先观察再推进", color: "#D98C72" },
  { name: "今日时令", value: 81, note: "下午更顺", color: "#E0B56B" },
]

const enSignals = [
  { name: "Bazi Base", value: 86, note: "Stable structure", color: "#C9A84C" },
  { name: "Zi Wei Signal", value: 78, note: "Relationship palace active", color: "#59B894" },
  { name: "Astro Rhythm", value: 72, note: "Good for review", color: "#74A7D8" },
  { name: "Oracle Intuition", value: 64, note: "Observe before pushing", color: "#D98C72" },
  { name: "Daily Timing", value: 81, note: "Afternoon is smoother", color: "#E0B56B" },
]

export function UserDashboard() {
  const { t, locale, localeHref } = useLanguage()
  const { user } = useAuth()
  const { userProfile, activeTestTarget } = useUserStore()
  const [recentReadings, setRecentReadings] = useState<ReadingListItem[]>([])
  const [loadingReadings, setLoadingReadings] = useState(true)
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false)
  const isZh = locale === "zh"
  const signals = isZh ? zhSignals : enSignals
  const activeName = activeTestTarget?.nickname || userProfile?.nickname || (isZh ? "你" : "You")

  useEffect(() => {
    if (!user) {
      setLoadingReadings(false)
      return
    }
    const timer = setTimeout(() => {
      listMyReadings()
        .then(r => setRecentReadings(r.slice(0, 4)))
        .catch(() => {})
        .finally(() => setLoadingReadings(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [user])

  const today = useMemo(() => {
    return new Date().toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }, [locale])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 overflow-hidden border border-white/[0.08] bg-[#07110f]/90 p-5 shadow-[0_34px_120px_rgba(0,0,0,0.34)] md:p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 border border-gold/20 bg-gold/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold/70">
              <Sparkles size={14} />
              {isZh ? "Today Growth Command" : "Today Growth Command"}
            </div>
            <h1 className="font-serif text-3xl font-bold leading-tight text-white md:text-5xl">
              {isZh ? `${activeName}的今日成长指挥台` : `${activeName}'s daily command center`}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/52">
              {isZh
                ? "这里不是工具列表，而是把命盘底层、今日时机、关系信号和行动建议合在一起的个人工作台。"
                : "This is not a tool list. It combines your base chart, daily timing, relationship signals, and next actions into one workspace."}
            </p>
          </div>

          <div className="grid min-w-[260px] gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="border border-white/[0.08] bg-white/[0.035] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{isZh ? "日期" : "Date"}</p>
              <p className="mt-1 text-sm text-white/75">{today}</p>
            </div>
            <Link href={localeHref("/almanac")} className="group border border-gold/18 bg-gold/[0.07] p-4 transition-colors hover:bg-gold/[0.1]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gold/55">{isZh ? "今日建议" : "Today's action"}</p>
                  <p className="mt-1 text-sm text-white/78">{isZh ? "先完成关键沟通，再做大额决策" : "Handle key communication before large decisions"}</p>
                </div>
                <ArrowRight size={16} className="text-gold transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <ProfileCard />

        <div className="border border-white/[0.08] bg-[#08120f]/80 p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/55">
                {isZh ? "Five-Dimension Signal" : "Five-Dimension Signal"}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">{isZh ? "五维信号盘" : "5D signal board"}</h2>
            </div>
            <TrendingUp size={20} className="text-gold" />
          </div>

          <div className="space-y-3">
            {signals.map(signal => (
              <div key={signal.name} className="grid grid-cols-[104px_1fr_94px] items-center gap-3 text-sm">
                <span className="text-white/60">{signal.name}</span>
                <div className="h-2 overflow-hidden bg-white/[0.06]">
                  <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${signal.value}%`, backgroundColor: signal.color }}
                  />
                </div>
                <span className="text-right text-xs text-white/42">{signal.note}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="border border-gold/15 bg-gold/[0.06] p-4">
              <ShieldCheck size={17} className="mb-2 text-gold" />
              <p className="text-xs text-white/45">{isZh ? "当前主线" : "Main theme"}</p>
              <p className="mt-1 text-sm font-medium text-white">{isZh ? "稳定推进，不急于证明" : "Steady progress, no need to prove"}</p>
            </div>
            <div className="border border-white/[0.08] bg-white/[0.035] p-4">
              <Clock3 size={17} className="mb-2 text-[#74A7D8]" />
              <p className="text-xs text-white/45">{isZh ? "时机窗口" : "Timing window"}</p>
              <p className="mt-1 text-sm font-medium text-white">{isZh ? "14:00-17:00" : "2:00-5:00 PM"}</p>
            </div>
            <div className="border border-white/[0.08] bg-white/[0.035] p-4">
              <Sparkles size={17} className="mb-2 text-[#D98C72]" />
              <p className="text-xs text-white/45">{isZh ? "提醒" : "Caution"}</p>
              <p className="mt-1 text-sm font-medium text-white">{isZh ? "避免临时承诺" : "Avoid rushed promises"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <IntentButtons onGework={() => setEventDrawerOpen(true)} />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-white/80">{t("dash.recent.title")}</h2>
          {recentReadings.length > 0 && (
            <Link href={localeHref("/readings")} className="text-xs text-gold/65 hover:text-gold">{t("dash.recent.viewAll")}</Link>
          )}
        </div>

        {loadingReadings ? (
          <div className="border border-white/[0.08] bg-white/[0.035] p-8 text-center">
            <Loader2 size={20} className="mx-auto animate-spin text-white/30" />
          </div>
        ) : recentReadings.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {recentReadings.map(r => (
              <Link
                key={r.id}
                href={localeHref(`/reading/${r.id}`)}
                className="group block border border-white/[0.08] bg-white/[0.035] p-4 transition-all hover:border-gold/25 hover:bg-white/[0.055]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm leading-6 text-white/72">{r.master_summary || t("dash.recent.analyzing")}</p>
                    <p className="mt-2 text-xs text-white/30">
                      {new Date(r.created_at).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
                    </p>
                  </div>
                  <ArrowRight size={14} className="mt-1 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-gold" />
                </div>
                {r.computed_tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.computed_tags.slice(0, 2).map(tag => <TagBadge key={tag} tag={tag} />)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-white/[0.08] bg-white/[0.035] p-8 text-center">
            <p className="text-sm text-white/36">{t("dash.recent.empty")}</p>
            <p className="mt-1 text-xs text-white/24">{t("dash.recent.emptyDesc")}</p>
          </div>
        )}
      </div>

      <GeworkDrawer open={eventDrawerOpen} onClose={() => setEventDrawerOpen(false)} />
    </div>
  )
}
