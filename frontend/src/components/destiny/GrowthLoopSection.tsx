"use client"

import Link from "next/link"
import { ArrowRight, Bell, BookOpenCheck, Gem, Radar, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { DailyDashboard } from "@/components/DailyDashboard"

const COPY = {
  zh: {
    badge: "Retention Engine",
    title: "不是一次性报告，而是让用户每天回来的个人系统",
    desc: "第一次分析生成画像；每日趋势和邮件推送把用户带回站内；复盘记录让 AI 越来越理解用户；商城只在合适的状态下给出匹配建议。",
    steps: [
      { title: "先生成画像", desc: "用出生信息、问题、报告结果和行为反馈建立个人分析基线。", icon: Radar },
      { title: "每天更新趋势", desc: "每日趋势、今日签、周报和邮件推送形成稳定回访习惯。", icon: Bell },
      { title: "记录成长复盘", desc: "用户反馈发生了什么，AI 修正画像并沉淀长期成长档案。", icon: BookOpenCheck },
      { title: "再匹配商品", desc: "根据五行、情绪、事业、关系等标签推荐对应生活方式产品。", icon: Gem },
    ],
    dailyLabel: "今日趋势预览",
    dailyDesc: "登录用户看到个性化版本，访客看到轻量示例。",
    primary: "开始免费分析",
    secondary: "查看匹配好物",
  },
  en: {
    badge: "Retention Engine",
    title: "Not a one-time report. A daily system that brings users back.",
    desc: "The first analysis creates the profile. Daily trends and email prompts bring users back. Reflection makes the AI understand the user better. The shop converts the current state only when relevant.",
    steps: [
      { title: "Create the profile", desc: "Birth data, questions, report results, and behavior signals establish the baseline.", icon: Radar },
      { title: "Refresh daily trends", desc: "Daily trend, oracle, weekly recap, and email prompts create a return habit.", icon: Bell },
      { title: "Record reflection", desc: "Users log what happened so the AI profile becomes more personal over time.", icon: BookOpenCheck },
      { title: "Match products", desc: "Element, mood, career, and relationship tags become lifestyle recommendations.", icon: Gem },
    ],
    dailyLabel: "Daily trend preview",
    dailyDesc: "Personalized for signed-in users, lightweight for visitors.",
    primary: "Start Free Analysis",
    secondary: "View Matched Products",
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
                  <div key={step.title} className="rounded-xl border border-white/[0.07] bg-[#030918] p-4">
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
