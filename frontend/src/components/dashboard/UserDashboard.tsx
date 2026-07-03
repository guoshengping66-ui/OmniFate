"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, CalendarClock, Loader2, ShieldCheck, Sparkles } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { listMyReadings, type ReadingListItem } from "@/lib/api"
import { ProfileCard } from "./ProfileCard"
import { IntentButtons } from "./IntentButtons"
import { GeworkDrawer } from "./GeworkDrawer"
import { TagBadge } from "@/components/ui/TagBadge"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { EasternCard, FiveDimensionOrbit } from "@/components/brand/EasternDesign"

const zhSignals = [
  { name: "结构稳定度", value: "稳定", note: "适合把复杂事项拆小处理" },
  { name: "事业推进力", value: "适合执行", note: "先完成一个有反馈的任务" },
  { name: "关系活跃度", value: "不宜急谈", note: "避免在情绪高点做承诺" },
  { name: "财富判断力", value: "适合复盘", note: "整理现金流与长期选择" },
  { name: "直觉敏感度", value: "先观察", note: "记录信号，不急着定性" },
]

const enSignals = [
  { name: "Structure", value: "Stable", note: "Break complex work into smaller moves" },
  { name: "Career push", value: "Execute", note: "Finish one task with clear feedback" },
  { name: "Relationship", value: "Go slow", note: "Avoid promises at emotional peaks" },
  { name: "Money judgment", value: "Review", note: "Sort cash flow and long choices" },
  { name: "Intuition", value: "Observe", note: "Record signals before deciding" },
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
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <EasternCard className="p-6 md:p-8">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-gold-soft)] bg-[rgba(200,168,74,0.08)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
            <Sparkles size={14} />
            {isZh ? "我的观我档案 · 今日行动中心" : "My Guanwo dossier · Daily action center"}
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-[var(--color-text-primary)] md:text-5xl">
            {isZh ? `${activeName}，今天，先完成一件关键的事` : `${activeName}, start with one key move today`}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">
            {isZh
              ? "这是你的今日行动中心。观我会根据你的档案、五维状态与近期问题，提炼今天最值得推进的一步。"
              : "This is your daily action center. Guanwo distills the one move worth advancing today from your dossier, five-source state, and recent questions."}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-4">
              <p className="text-xs text-white/42">{today}</p>
              <p className="mt-1 font-semibold text-[var(--color-text-primary)]">{isZh ? "今日主题：稳步推进，不急于证明" : "Theme: steady progress, no need to prove"}</p>
            </div>
            <Link href={localeHref("/almanac")} className="group rounded-3xl border border-[var(--color-gold-soft)] bg-[rgba(200,168,74,0.08)] p-4">
              <p className="text-xs text-white/42">{isZh ? "最佳推进时间" : "Best window"}</p>
              <p className="mt-1 flex items-center justify-between gap-3 font-semibold text-[var(--color-text-primary)]">
                14:00 - 17:00
                <ArrowRight size={16} className="text-[var(--color-gold)] transition group-hover:translate-x-1" />
              </p>
            </Link>
          </div>
        </EasternCard>

        <EasternCard className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">{isZh ? "今日行动建议" : "Daily action"}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">{isZh ? "稳步推进，不急于证明" : "Steady progress, no need to prove"}</h2>
            </div>
            <CalendarClock size={24} className="text-[var(--color-gold)]" />
          </div>
          <div className="mt-6 space-y-4 text-sm leading-7">
            <p className="text-[var(--color-text-secondary)]">
              {isZh ? "今天最适合：完成一件能带来明确反馈的任务。" : "Best today: finish one task that gives clear feedback."}
            </p>
            <p className="text-[var(--color-text-secondary)]">
              {isZh ? "避免：临时改变方向、冲动承诺、把复杂关系问题放到今天解决。" : "Avoid: sudden direction changes, rushed promises, or forcing complex relationship issues today."}
            </p>
            <p className="font-medium text-[var(--color-text-primary)]">
              {isZh ? "今日提醒：先把确定性的事完成，再处理不确定的人和钱。" : "Reminder: complete what is certain before handling uncertain people or money."}
            </p>
          </div>
          <Link href={localeHref("/almanac")} className="ow-gold-button mt-7">
            {isZh ? "查看今日完整行动板" : "Open full daily board"}
            <ArrowRight size={17} />
          </Link>
        </EasternCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <ProfileCard />

        <EasternCard className="overflow-hidden p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
                {isZh ? "今日五维状态" : "Five-source state"}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--color-text-primary)]">{isZh ? "今日主线：稳步推进" : "Main line: steady progress"}</h2>
            </div>
            <ShieldCheck size={20} className="text-[var(--color-gold)]" />
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <FiveDimensionOrbit labels={signals.map(signal => signal.name)} center={isZh ? "今日主线" : "Today"} />
            <div className="grid content-center gap-3">
              {signals.map(signal => (
                <div key={signal.name} className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{signal.name}</p>
                    <span className="rounded-full bg-[rgba(200,168,74,0.12)] px-3 py-1 text-xs text-[var(--color-gold)]">{signal.value}</span>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-[var(--color-text-secondary)]">{signal.note}</p>
                </div>
              ))}
            </div>
          </div>
        </EasternCard>
      </section>

      <IntentButtons onGework={() => setEventDrawerOpen(true)} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-[var(--color-text-primary)]">{isZh ? "最近报告记录" : t("dash.recent.title")}</h2>
          {recentReadings.length > 0 && (
            <Link href={localeHref("/readings")} className="text-xs text-[var(--color-gold)] hover:text-gold">{t("dash.recent.viewAll")}</Link>
          )}
        </div>

        {loadingReadings ? (
          <EasternCard className="p-8 text-center">
            <Loader2 size={20} className="mx-auto animate-spin text-white/30" />
          </EasternCard>
        ) : recentReadings.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {recentReadings.map(r => (
              <Link
                key={r.id}
                href={localeHref(`/reading/${r.id}`)}
                className="group ow-card block p-4 transition-all hover:border-[var(--color-gold-soft)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">{r.master_summary || t("dash.recent.analyzing")}</p>
                    <p className="mt-2 text-xs text-white/30">
                      {new Date(r.created_at).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
                    </p>
                  </div>
                  <ArrowRight size={14} className="mt-1 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-gold)]" />
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
          <EasternCard className="p-8 text-center">
            <p className="text-sm text-white/40">{t("dash.recent.empty")}</p>
            <p className="mt-1 text-xs text-white/28">{t("dash.recent.emptyDesc")}</p>
          </EasternCard>
        )}
      </section>

      <GeworkDrawer open={eventDrawerOpen} onClose={() => setEventDrawerOpen(false)} />
    </div>
  )
}
