"use client"

import Link from "next/link"
import { ArrowRight, BookOpenCheck, CalendarDays, LineChart, ScrollText, UserRoundSearch } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const COPY = {
  zh: {
    badge: "GUANWO AI",
    title: "把一次报告，变成每天更新的 AI 成长系统",
    desc: "观我不是只给一份命理解读。它会先建立你的 AI 命运画像，再用每日趋势、今日签和复盘记录持续校准，让建议越来越贴近你的真实状态。",
    primary: "建立我的画像",
    secondary: "查看每日趋势",
    loopTitle: "核心闭环",
    proofTitle: "已有图表不会删除，会升级成判断依据",
    proofDesc: "人生 K 线、五行结构、事业/财富/关系趋势都会保留，并被包装成“趋势仪表盘”：先给结论，再给图表依据，最后给当天可执行动作。",
    items: [
      { title: "AI 命运画像", desc: "整合八字、紫微、星盘、塔罗、面相与手相，生成长期人格基线。", icon: UserRoundSearch },
      { title: "每日趋势", desc: "每天输出事业、财富、关系、健康与心智状态，减少空泛运势。", icon: CalendarDays },
      { title: "今日签", desc: "把抽签吉凶和当日能量合并，转化成一句明确行动建议。", icon: ScrollText },
      { title: "成长复盘", desc: "记录今天发生了什么，AI 用反馈修正你的画像和下一步建议。", icon: BookOpenCheck },
      { title: "人生趋势曲线", desc: "保留人生 K 线，但改为解释高能期、调整期、转折期和稳定期。", icon: LineChart },
    ],
  },
  en: {
    badge: "GUANWO AI",
    title: "Turn one report into a daily AI growth system",
    desc: "Guanwo AI is not a one-off reading. It builds your AI destiny profile, then keeps refining it through daily trends, a daily oracle, and reflection records.",
    primary: "Build My Profile",
    secondary: "View Daily Trend",
    loopTitle: "The core loop",
    proofTitle: "Existing charts stay. They become evidence.",
    proofDesc: "Life K-line, Five Elements, career, wealth, and relationship charts remain, but become a trend dashboard: conclusion first, chart evidence second, action next.",
    items: [
      { title: "AI Destiny Profile", desc: "Bazi, Ziwei, astrology, tarot, face, and palm signals form a long-term personality baseline.", icon: UserRoundSearch },
      { title: "Daily Trend", desc: "Career, wealth, relationship, health, and mindset are refreshed into practical daily guidance.", icon: CalendarDays },
      { title: "Daily Oracle", desc: "The daily draw and daily energy become one clear action prompt.", icon: ScrollText },
      { title: "Growth Reflection", desc: "Record what happened today so the AI profile can adapt to real behavior.", icon: BookOpenCheck },
      { title: "Life Trend Curve", desc: "Life K-line becomes a map of high-energy, adjustment, pivot, and stable phases.", icon: LineChart },
    ],
  },
} as const

export default function GuanwoSystemSection() {
  const { locale, localeHref } = useLanguage()
  const copy = locale === "zh" ? COPY.zh : COPY.en

  return (
    <section className="relative py-20 md:py-28 px-4 border-y border-white/[0.06] bg-[#080b12]/80">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[0.86fr_1.14fr] gap-10 lg:gap-14 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/[0.055] text-gold/70 text-xs tracking-[0.18em] uppercase mb-5">
              {copy.badge}
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white/92 leading-tight mb-5">
              {copy.title}
            </h2>
            <p className="text-white/48 text-sm md:text-base leading-relaxed mb-8">
              {copy.desc}
            </p>
            <div className="rounded-2xl border border-gold/15 bg-gold/[0.04] p-5 mb-7">
              <p className="text-gold/70 text-xs tracking-[0.14em] uppercase mb-2">{copy.proofTitle}</p>
              <p className="text-white/50 text-sm leading-relaxed">{copy.proofDesc}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={localeHref("/reading/new")} className="btn-gold inline-flex items-center justify-center gap-2 text-sm">
                {copy.primary}
                <ArrowRight size={16} />
              </Link>
              <Link href={localeHref("/almanac")} className="btn-gold-outline inline-flex items-center justify-center gap-2 text-sm">
                {copy.secondary}
              </Link>
            </div>
          </div>

          <div>
            <p className="text-gold/70 text-xs tracking-[0.18em] uppercase mb-4">{copy.loopTitle}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {copy.items.map((item, index) => {
                const Icon = item.icon
                const wide = index === copy.items.length - 1
                return (
                  <article
                    key={item.title}
                    className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 ${wide ? "sm:col-span-2" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl border border-gold/20 bg-gold/[0.07] flex items-center justify-center flex-shrink-0">
                        <Icon size={19} className="text-gold/75" />
                      </div>
                      <div>
                        <h3 className="text-white/88 text-sm font-semibold mb-1.5">{item.title}</h3>
                        <p className="text-white/42 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
