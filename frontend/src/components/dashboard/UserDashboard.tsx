"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { ProfileCard } from "./ProfileCard"
import { IntentButtons } from "./IntentButtons"
import { GeworkDrawer } from "./GeworkDrawer"
import { useLanguage } from "@/contexts/LanguageContext"

// Daily signal pools — date-seeded rotation so content changes every day
const signalPoolZh = [
  { n: "结构稳定度", pool: [{ v: "稳定", t: "适合把复杂事项拆小处理" },{ v: "可塑", t: "适合重新梳理优先级" },{ v: "动荡", t: "不做重大决策，先稳住节奏" },{ v: "强化", t: "适合建立新的习惯锚点" }] },
  { n: "事业推进力", pool: [{ v: "适合执行", t: "先完成一个有反馈的任务" },{ v: "适合规划", t: "先列清单再逐一攻破" },{ v: "适合合作", t: "找人一起推进，别单打独斗" },{ v: "适合收尾", t: "把进行中的项目收干净" }] },
  { n: "关系活跃度", pool: [{ v: "不宜急谈", t: "避免在情绪高点做承诺" },{ v: "适合沟通", t: "把心里话说出来，别憋着" },{ v: "适合独处", t: "给自己留一段安静的时间" },{ v: "适合连接", t: "主动联系一个你惦念的人" }] },
  { n: "财富判断力", pool: [{ v: "适合复盘", t: "整理现金流与长期选择" },{ v: "适合节流", t: "把冲动消费压一压" },{ v: "适合投资", t: "为长期成长做一笔投入" },{ v: "保守观察", t: "不操作就是最好的操作" }] },
  { n: "直觉敏感度", pool: [{ v: "先观察", t: "记录信号，不急着定性" },{ v: "敏锐期", t: "相信直觉判断，快速试错" },{ v: "钝感期", t: "多看数据少凭感受" },{ v: "灵感日", t: "把突然冒出的想法记下来" }] },
]
const signalPoolEn = [
  { n: "Structure", pool: [{ v: "Stable", t: "Break complex work into smaller moves" },{ v: "Flexible", t: "Re-order priorities today" },{ v: "Shaky", t: "Hold decisions, steady the rhythm" },{ v: "Strong", t: "Anchor a new habit today" }] },
  { n: "Career push", pool: [{ v: "Execute", t: "Finish one task with clear feedback" },{ v: "Plan", t: "List then conquer one by one" },{ v: "Collaborate", t: "Team up, don't go solo" },{ v: "Close out", t: "Wrap up what's in progress" }] },
  { n: "Relationship", pool: [{ v: "Go slow", t: "Avoid promises at emotional peaks" },{ v: "Speak up", t: "Say what's on your mind" },{ v: "Recharge", t: "Give yourself quiet time" },{ v: "Connect", t: "Reach out to someone you miss" }] },
  { n: "Money judgment", pool: [{ v: "Review", t: "Sort cash flow and long choices" },{ v: "Save", t: "Cut impulse spending today" },{ v: "Invest", t: "Make one growth-focused move" },{ v: "Hold", t: "Doing nothing is the best move" }] },
  { n: "Intuition", pool: [{ v: "Observe", t: "Record signals before deciding" },{ v: "Sharp", t: "Trust your gut, test fast" },{ v: "Dull", t: "Lean on data, not feelings" },{ v: "Inspired", t: "Write down every sudden idea" }] },
]
const signalColors = ["#5A9E8E","#7B9EC7","#C77B8B","#C9A84C","#8B7EC7"]

function dailyIndex(poolSize: number, offset: number): number {
  const day = Math.floor(Date.now() / 86400000)
  return (day + offset * 7) % poolSize
}

const cardBg = { background: "linear-gradient(135deg, #060E24, #030918)" }
const cardBorder = "border border-white/[0.05] rounded-2xl"

export function UserDashboard() {
  const { t, locale, localeHref } = useLanguage()
  const { userProfile, activeTestTarget } = useUserStore()
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false)
  const isZh = locale === "zh"
  const signals = useMemo(() => {
    const pool = isZh ? signalPoolZh : signalPoolEn
    return pool.map((s, i) => {
      const idx = dailyIndex(s.pool.length, i)
      return { n: s.n, v: s.pool[idx].v, t: s.pool[idx].t }
    })
  }, [isZh])

  // Translate stored default nicknames at display time
  const nickname = activeTestTarget?.nickname || userProfile?.nickname || ""
  const showName = nickname === "本命" || nickname === "Myself"
    ? t("target.self")
    : nickname || (isZh ? "你" : "You")

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
            {isZh ? `${showName}，今天先完成一件关键的事` : `${showName}, start with one key move today`}
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

      <GeworkDrawer open={eventDrawerOpen} onClose={() => setEventDrawerOpen(false)} />
    </div>
  )
}
