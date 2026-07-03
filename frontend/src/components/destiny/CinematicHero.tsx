"use client"

import Link from "next/link"
import { ArrowRight, CalendarDays, LineChart, Sparkles, UserRoundSearch } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const COPY = {
  zh: {
    badge: "AI 命运画像 + 每日成长系统",
    title1: "观我",
    title2: "Guanwo AI",
    desc: "把八字、紫微、星盘、塔罗、面相与手相信号整合成持续更新的 AI 自我画像。每天给你趋势、提醒和一条可执行行动。",
    primary: "建立我的画像",
    secondary: "查看今日趋势",
    trust: "AI画像 · 每日趋势 · 人生趋势曲线",
    panelTitle: "今日趋势",
    panelSubtitle: "基于你的画像动态生成",
    action: "今日行动",
    actionText: "先处理一件高确定性的事，避免在情绪上头时做长期承诺。",
    profile: "画像完整度",
    trend: "趋势清晰度",
    growth: "成长记录",
    curve: "人生趋势曲线",
    phase: "当前阶段：调整后上升期",
  },
  en: {
    badge: "AI Destiny Profile + Daily Growth System",
    title1: "Guanwo",
    title2: "AI",
    desc: "Bazi, Ziwei, astrology, tarot, face and palm signals become a living AI self-knowledge profile. Every day you get trend, warning, and one practical action.",
    primary: "Build My Profile",
    secondary: "View Today",
    trust: "AI profile · daily trend · life growth curve",
    panelTitle: "Today Trend",
    panelSubtitle: "Generated from your living profile",
    action: "Today Action",
    actionText: "Move one high-certainty task first. Avoid long-term commitments while emotions are loud.",
    profile: "Profile depth",
    trend: "Trend clarity",
    growth: "Growth log",
    curve: "Life Growth Curve",
    phase: "Current phase: rising after adjustment",
  },
} as const

export default function CinematicHero() {
  const { locale, localeHref } = useLanguage()
  const copy = locale === "zh" ? COPY.zh : COPY.en
  const steps = locale === "zh"
    ? ["1 分钟建立画像", "生成完整报告", "获得每日行动建议"]
    : ["Build in 1 minute", "Generate full report", "Get daily actions"]

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden px-4 py-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/3 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-gold/[0.035] blur-[160px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-gold/70">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {copy.badge}
          </div>

          <h1 className="mb-6 font-serif text-5xl font-bold leading-[0.95] tracking-normal text-gold sm:text-6xl lg:text-7xl">
            {copy.title1}
            <span className="mt-4 block text-2xl font-light text-white/78 sm:text-3xl lg:text-4xl">
              {copy.title2}
            </span>
          </h1>

          <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-white/58 sm:text-base lg:mx-0">
            {copy.desc}
          </p>

          <div className="mx-auto mb-8 grid max-w-xl gap-2 sm:grid-cols-3 lg:mx-0">
            {steps.map((step, index) => (
              <div key={step} className="rounded-xl border border-white/[0.08] bg-[#060E24] px-3 py-2 text-left">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-gold/55">
                  0{index + 1}
                </span>
                <span className="block text-xs leading-snug text-white/62">{step}</span>
              </div>
            ))}
          </div>

          <div className="mb-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link href={localeHref("/reading/new")} className="btn-gold inline-flex items-center justify-center gap-2 px-7 py-3 text-sm">
              {copy.primary}
              <ArrowRight size={16} />
            </Link>
            <Link href={localeHref("/almanac")} className="btn-gold-outline inline-flex items-center justify-center gap-2 px-7 py-3 text-sm">
              {copy.secondary}
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            {copy.trust.split(" · ").map((item) => (
              <span key={item} className="rounded-full border border-white/[0.08] bg-[#060E24] px-3 py-1.5 text-[11px] text-white/48">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="rounded-[28px] border border-white/[0.08] bg-[#07101d]/88 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.45)]  sm:p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_0.86fr]">
              <div className="rounded-2xl border border-gold/15 bg-gold/[0.055] p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gold/60">{copy.panelTitle}</p>
                    <h2 className="mt-1 text-xl font-semibold text-white/90">{copy.panelSubtitle}</h2>
                  </div>
                  <CalendarDays className="text-gold/70" size={22} />
                </div>

                <div className="mb-5 grid grid-cols-3 gap-2">
                  {[
                    [copy.profile, "86%"],
                    [copy.trend, "91%"],
                    [copy.growth, "12"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/[0.08] bg-black/18 p-3">
                      <p className="text-[10px] text-white/38">{label}</p>
                      <p className="mt-1 text-lg font-bold text-gold">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-white/82">{copy.curve}</p>
                    <LineChart size={17} className="text-gold/65" />
                  </div>
                  <div className="flex h-24 items-end gap-2">
                    {[34, 44, 39, 56, 51, 66, 72, 64, 79, 86].map((height, index) => (
                      <div key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-gold/25 to-gold/80" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-white/42">{copy.phase}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-white/[0.08] bg-[#060E24] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.07]">
                      <UserRoundSearch size={18} className="text-gold/75" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/86">{copy.action}</p>
                      <p className="text-[11px] text-white/32">AI profile signal</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-white/52">{copy.actionText}</p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-[#060E24] p-5">
                  <div className="mb-4 flex items-center gap-2 text-gold/75">
                    <Sparkles size={17} />
                    <span className="text-xs uppercase tracking-[0.16em]">Signal Mix</span>
                  </div>
                  <div className="space-y-3">
                    {["Bazi", "Ziwei", "Astrology", "Tarot", "Face/Palm"].map((label, index) => (
                      <div key={label}>
                        <div className="mb-1 flex justify-between text-[11px]">
                          <span className="text-white/42">{label}</span>
                          <span className="text-gold/70">{82 + index * 3}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06]">
                          <div className="h-full rounded-full bg-gold/70" style={{ width: `${82 + index * 3}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
