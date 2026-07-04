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

const signalsZh = [
  { n: "结构稳定度", v: "稳定", t: "适合把复杂事项拆小处理" },
  { n: "事业推进力", v: "适合执行", t: "先完成一个有反馈的任务" },
  { n: "关系活跃度", v: "不宜急谈", t: "避免在情绪高点做承诺" },
  { n: "财富判断力", v: "适合复盘", t: "整理现金流与长期选择" },
  { n: "直觉敏感度", v: "先观察", t: "记录信号，不急着定性" },
]
const signalsEn = [
  { n: "Structure", v: "Stable", t: "Break complex work into smaller moves" },
  { n: "Career push", v: "Execute", t: "Finish one task with clear feedback" },
  { n: "Relationship", v: "Go slow", t: "Avoid promises at emotional peaks" },
  { n: "Money judgment", v: "Review", t: "Sort cash flow and long choices" },
  { n: "Intuition", v: "Observe", t: "Record signals before deciding" },
]
const signalColors = ["#5A9E8E","#7B9EC7","#C77B8B","#C9A84C","#8B7EC7"]

const cardBg = { background: "linear-gradient(135deg, #060E24, #030918)" }
const cardBorder = "border border-white/[0.05] rounded-2xl"

export function UserDashboard() {
  const { t, locale, localeHref } = useLanguage()
  const { user } = useAuth()
  const { userProfile, activeTestTarget } = useUserStore()
  const [recentReadings, setRecentReadings] = useState<ReadingListItem[]>([])
  const [loadingReadings, setLoadingReadings] = useState(true)
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false)
  const isZh = locale === "zh"
  const signals = isZh ? signalsZh : signalsEn
  const activeName = activeTestTarget?.nickname || userProfile?.nickname || (isZh ? "你" : "You")

  useEffect(() => {
    if (!user) { setLoadingReadings(false); return }
    const t = setTimeout(() => { listMyReadings().then(r => setRecentReadings(r.slice(0, 3))).catch(() => {}).finally(() => setLoadingReadings(false)) }, 300)
    return () => clearTimeout(t)
  }, [user])

  const today = useMemo(() => new Date().toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", { month: "long", day: "numeric", weekday: "long" }), [locale])

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 pb-16 pt-6">
      {/* ═══ Zone 1: Welcome + Daily Snapshot ═══ */}
      <section className="grid gap-5 lg:grid-cols-2">
        {/* Welcome card */}
        <div className={`${cardBorder} p-6 md:p-8`} style={cardBg}>
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/[0.15] bg-gold/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
            <Sparkles size={13} /> {isZh ? "观我档案 · 今日行动中心" : "Guanwo Dossier · Daily Center"}
          </p>
          <h1 className="mt-5 max-w-xl font-serif text-2xl leading-tight text-white/85 md:text-3xl">
            {isZh ? `${activeName}，今天先完成一件关键的事` : `${activeName}, start with one key move today`}
          </h1>
          <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-white/35">
            {isZh ? "根据你的五维状态与近期问题，提炼今天最值得推进的一步。" : "One move worth advancing today, distilled from your five-source state and recent questions."}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[12px] text-white/30">
            <span>{today}</span>
            <span className="text-white/10">·</span>
            <span>{isZh ? "最佳推进 14:00-17:00" : "Best window 14:00-17:00"}</span>
          </div>
        </div>

        {/* Daily action card */}
        <div className={`${cardBorder} p-6 md:p-8`} style={cardBg}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/60">{isZh ? "今日行动建议" : "Daily action"}</p>
          <h2 className="mt-3 font-serif text-xl text-white/75">{isZh ? "稳步推进，不急于证明" : "Steady progress, no need to prove"}</h2>
          <div className="mt-5 space-y-3 text-[13px] leading-relaxed">
            <p className="text-white/40">{isZh ? "✅ 最适合：完成一件能带来明确反馈的任务。" : "✅ Best: finish one task that gives clear feedback."}</p>
            <p className="text-white/30">{isZh ? "⚠️ 避免：临时改变方向、冲动承诺。" : "⚠️ Avoid: sudden direction changes, rushed promises."}</p>
            <p className="font-medium text-white/55">{isZh ? "💡 提醒：先把确定性的事完成，再处理不确定的人和钱。" : "💡 Reminder: complete what is certain before the uncertain."}</p>
          </div>
          <Link href={localeHref("/almanac")} className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-medium transition-all hover:scale-[1.02]" style={{ background: "#C9A84C", color: "#020617" }}>
            {isZh ? "查看今日完整行动板" : "Open full daily board"} <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ═══ Zone 2: Profile + 5-state signals ═══ */}
      <section className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <ProfileCard />
        <div className={`${cardBorder} p-5 md:p-7`} style={cardBg}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/60 mb-1">{isZh ? "今日五维状态" : "Five-source state"}</p>
          <h2 className="font-serif text-xl text-white/75 mb-5">{isZh ? "今日主线：稳步推进" : "Main line: steady progress"}</h2>
          <div className="space-y-2.5">
            {signals.map((s, i) => (
              <div key={s.n} className="flex items-center gap-3 rounded-xl border border-white/[0.04] px-4 py-3" style={{ background: "rgba(255,255,255,0.015)" }}>
                <span className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: signalColors[i] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-white/65">{s.n}</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.10)", color: "#C9A84C" }}>{s.v}</span>
                  </div>
                  <p className="text-[11px] text-white/25 mt-0.5">{s.t}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Zone 3: Intent Buttons ═══ */}
      <IntentButtons onGework={() => setEventDrawerOpen(true)} />

      {/* ═══ Zone 4: Recent Reports ═══ */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg text-white/70">{isZh ? "最近报告" : "Recent reports"}</h2>
          {recentReadings.length > 0 && <Link href={localeHref("/readings")} className="text-[12px] text-gold/60 hover:text-gold">{t("dash.recent.viewAll")}</Link>}
        </div>
        {loadingReadings ? (
          <div className={`${cardBorder} p-8 text-center`} style={cardBg}><Loader2 size={20} className="mx-auto animate-spin text-white/25" /></div>
        ) : recentReadings.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {recentReadings.map(r => (
              <Link key={r.id} href={localeHref(`/reading/${r.id}`)} className={`group ${cardBorder} p-4 transition-all hover:border-white/[0.12]`} style={cardBg}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-white/45">{r.master_summary || t("dash.recent.analyzing")}</p>
                    <p className="mt-2 text-[11px] text-white/20">{new Date(r.created_at).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}</p>
                  </div>
                  <ArrowRight size={13} className="mt-0.5 text-white/15 transition-all group-hover:translate-x-1 group-hover:text-gold/60" />
                </div>
                {r.computed_tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{r.computed_tags.slice(0, 2).map(tag => <TagBadge key={tag} tag={tag} />)}</div>}
              </Link>
            ))}
          </div>
        ) : (
          <div className={`${cardBorder} p-8 text-center`} style={cardBg}>
            <p className="text-[13px] text-white/30">{t("dash.recent.empty")}</p>
            <p className="mt-1 text-[11px] text-white/15">{t("dash.recent.emptyDesc")}</p>
          </div>
        )}
      </section>

      <GeworkDrawer open={eventDrawerOpen} onClose={() => setEventDrawerOpen(false)} />
    </div>
  )
}
