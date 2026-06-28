"use client"

import Link from "next/link"
import { ArrowRight, Bell, Gem, Radar, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { DailyDashboard } from "@/components/DailyDashboard"

const COPY = {
  zh: {
    badge: "Retention Engine",
    title: "不是一次性报告，而是每天回来的个人系统",
    desc: "第一次分析生成档案；每日状态和邮件推送负责把用户带回站内；商城根据当下状态给出匹配建议。",
    steps: [
      { title: "先生成档案", desc: "用出生信息、问题和行为数据建立个人分析基线。" },
      { title: "每天更新状态", desc: "每日运势、周报和邮件推送让用户持续回访。" },
      { title: "再匹配商品", desc: "根据五行、情绪、事业、关系等标签推荐对应商品。" },
    ],
    dailyLabel: "今日状态预览",
    dailyDesc: "登录用户看到个性化版本，访客看到轻量示例。",
    primary: "开始免费分析",
    secondary: "查看匹配商品",
  },
  en: {
    badge: "Retention Engine",
    title: "Not a one-time report. A daily system that brings users back.",
    desc: "The first analysis creates the profile. Daily status and email prompts bring users back. The shop converts the current state into matched recommendations.",
    steps: [
      { title: "Create the profile", desc: "Birth data, intent, and behavioral signals establish the user's baseline." },
      { title: "Refresh the status", desc: "Daily fortune, weekly email, and dashboard updates create a return habit." },
      { title: "Match products", desc: "Element, mood, career, and relationship tags become product recommendations." },
    ],
    dailyLabel: "Daily status preview",
    dailyDesc: "Personalized for signed-in users, lightweight for visitors.",
    primary: "Start Free Analysis",
    secondary: "View Matched Products",
  },
} as const

export default function GrowthLoopSection() {
  const { locale, localeHref } = useLanguage()
  const copy = locale === "zh" ? COPY.zh : COPY.en
  const icons = [Radar, Bell, Gem]

  return (
    <section className="relative py-20 md:py-28 px-4 border-y border-white/[0.05] bg-[#050510]/70">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/[0.05] text-gold/70 text-xs tracking-[0.18em] uppercase mb-5">
              <Sparkles size={13} />
              {copy.badge}
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white/90 leading-tight mb-5">
              {copy.title}
            </h2>
            <p className="text-white/45 text-sm md:text-base leading-relaxed mb-8">
              {copy.desc}
            </p>

            <div className="space-y-4">
              {copy.steps.map((step, index) => {
                const Icon = icons[index]
                return (
                  <div key={step.title} className="flex gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <div className="w-10 h-10 rounded-lg border border-gold/20 bg-gold/[0.07] flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-gold/75" />
                    </div>
                    <div>
                      <h3 className="text-white/85 text-sm font-semibold mb-1">{step.title}</h3>
                      <p className="text-white/38 text-xs leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
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
              <p className="text-gold/70 text-xs tracking-[0.18em] uppercase mb-1">{copy.dailyLabel}</p>
              <p className="text-white/35 text-xs">{copy.dailyDesc}</p>
            </div>
            <DailyDashboard />
          </div>
        </div>
      </div>
    </section>
  )
}
