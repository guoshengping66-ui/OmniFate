"use client"

import Link from "next/link"
import { ArrowRight, Bell, BookOpenCheck, Gem, Radar, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { DailyDashboard } from "@/components/DailyDashboard"

const COPY = {
  zh: {
    badge: "Growth Loop",
    title: "不是一次性报告，而是一条会复盘的成长路线",
    desc: "第一次分析建立五维档案；每天给一条行动提醒；每周记录真实反馈；系统再校准你的卡点、时机和下一步路线。命理负责洞察，复盘负责变好。",
    steps: [
      { title: "先定位问题", desc: "让用户带着事业、关系、财富或自我状态进入，而不是泛泛算一次。", icon: Radar },
      { title: "每天给行动", desc: "每日趋势不只给分数，还给一个低阻力、可完成的行动。", icon: Bell },
      { title: "每周做复盘", desc: "记录发生了什么、什么建议有效、哪里需要重新校准。", icon: BookOpenCheck },
      { title: "再给支持建议", desc: "商品和内容只作为处方延伸，不替代报告本身的成长价值。", icon: Gem },
    ],
    dailyLabel: "今日行动预览",
    dailyDesc: "登录用户看到个性化版本；访客看到轻量示例。",
    primary: "开始成长命盘",
    secondary: "查看处方支持",
  },
  en: {
    badge: "Growth Loop",
    title: "Not a one-time report. A route that learns from reflection.",
    desc: "The first analysis creates a five-dimension profile. Daily prompts give one action. Weekly reflection records what happened. The system recalibrates the blockage, timing, and next route.",
    steps: [
      { title: "Name the problem", desc: "Users enter through career, relationship, wealth, or self-state instead of a generic reading.", icon: Radar },
      { title: "Give daily action", desc: "Daily trend is not just a score. It includes one low-friction action.", icon: Bell },
      { title: "Reflect weekly", desc: "Users record what happened, what worked, and what needs calibration.", icon: BookOpenCheck },
      { title: "Offer support", desc: "Products and content extend the prescription without replacing the report value.", icon: Gem },
    ],
    dailyLabel: "Daily action preview",
    dailyDesc: "Personalized for signed-in users, lightweight for visitors.",
    primary: "Start Growth Chart",
    secondary: "View Prescription Support",
  },
} as const

export default function GrowthLoopSection() {
  const { locale, localeHref } = useLanguage()
  const copy = locale === "zh" ? COPY.zh : COPY.en

  return (
    <section className="relative border-y border-white/[0.05] bg-[#050510]/70 px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.05] px-3 py-1 text-xs uppercase tracking-[0.18em] text-gold/70">
              <Sparkles size={13} />
              {copy.badge}
            </div>
            <h2 className="mb-5 font-serif text-3xl font-bold leading-tight text-white/90 md:text-5xl">
              {copy.title}
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-white/45 md:text-base">
              {copy.desc}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {copy.steps.map((step) => {
                const Icon = step.icon
                return (
                  <div key={step.title} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-gold/20 bg-gold/[0.07]">
                      <Icon size={18} className="text-gold/75" />
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-white/85">{step.title}</h3>
                    <p className="text-xs leading-relaxed text-white/38">{step.desc}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={localeHref("/reading/new")} className="btn-gold inline-flex items-center justify-center gap-2 text-sm">
                {copy.primary}
                <ArrowRight size={16} />
              </Link>
              <Link href={localeHref("/shop")} className="btn-gold-outline inline-flex items-center justify-center gap-2 text-sm">
                {copy.secondary}
              </Link>
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-4">
              <p className="mb-1 text-xs uppercase tracking-[0.18em] text-gold/70">{copy.dailyLabel}</p>
              <p className="text-xs text-white/35">{copy.dailyDesc}</p>
            </div>
            <DailyDashboard />
          </div>
        </div>
      </div>
    </section>
  )
}
