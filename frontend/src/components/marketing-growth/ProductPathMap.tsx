"use client"

import Link from "next/link"
import { ArrowRight, CalendarClock, Compass, HeartHandshake, Layers3 } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const zhPaths = [
  {
    icon: Compass,
    title: "单主题分析",
    label: "Focus Reading",
    desc: "围绕事业、感情、财富、健康或某个具体问题，只输出这个主题的结论、时机和行动建议。",
    href: "/reading/new?intent=quick",
    accent: "#C9A84C",
  },
  {
    icon: Layers3,
    title: "完整成长命盘",
    label: "Full Growth Chart",
    desc: "五维合参生成完整个人结构，覆盖人格、事业财富、关系、能量状态和长期成长路径。",
    href: "/reading/new?intent=full",
    accent: "#59B894",
  },
  {
    icon: HeartHandshake,
    title: "关系合盘",
    label: "Relationship Sync",
    desc: "为恋爱、婚姻、复合、合作和亲密关系建立双人关系图，拆解契合点与冲突来源。",
    href: "/reading/new?intent=relationship",
    accent: "#D98C72",
  },
  {
    icon: CalendarClock,
    title: "每日成长指挥台",
    label: "Daily Command",
    desc: "登录后每天根据命盘底层结构和当日时机，给出今日主题、行动处方和风险提醒。",
    href: "/register",
    accent: "#74A7D8",
  },
]

const enPaths = [
  {
    icon: Compass,
    title: "Focus Reading",
    label: "Single-topic",
    desc: "A focused answer for career, love, wealth, health, or a concrete decision, with timing and next actions.",
    href: "/reading/new?intent=quick",
    accent: "#C9A84C",
  },
  {
    icon: Layers3,
    title: "Full Growth Chart",
    label: "5D synthesis",
    desc: "A complete profile across personality, work, wealth, relationships, energy, timing, and growth path.",
    href: "/reading/new?intent=full",
    accent: "#59B894",
  },
  {
    icon: HeartHandshake,
    title: "Relationship Sync",
    label: "Compatibility",
    desc: "A two-person relationship map for romance, marriage, reunion, collaboration, and communication patterns.",
    href: "/reading/new?intent=relationship",
    accent: "#D98C72",
  },
  {
    icon: CalendarClock,
    title: "Daily Command",
    label: "Logged-in dashboard",
    desc: "A daily command center that turns your profile and today's timing into concrete action prescriptions.",
    href: "/register",
    accent: "#74A7D8",
  },
]

export function ProductPathMap() {
  const { locale, localeHref } = useLanguage()
  const isZh = locale === "zh"
  const paths = isZh ? zhPaths : enPaths

  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-[#07110f] px-4 py-16">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_8%,rgba(201,168,76,0.12),transparent_30%),radial-gradient(circle_at_82%_38%,rgba(89,184,148,0.12),transparent_28%)]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/65">
              {isZh ? "Product Map" : "Product Map"}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-white md:text-5xl">
              {isZh ? "先解决一个问题，再进入完整成长系统" : "Start with one question, then enter the full growth system"}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/50">
            {isZh
              ? "单主题分析不是缩水版完整报告，而是一个主题切片；合盘是关系成长的独立产品；完整命盘和每日指挥台负责长期留存。"
              : "Focus readings are not shortened full reports. They are topic slices. Relationship sync is a standalone relationship product, while the full chart and daily command center drive long-term use."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {paths.map((path, index) => {
            const Icon = path.icon
            return (
              <Link
                key={path.title}
                href={localeHref(path.href)}
                className="group relative min-h-[250px] overflow-hidden border border-white/[0.08] bg-white/[0.035] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:bg-white/[0.055]"
              >
                <div className="absolute right-4 top-4 text-5xl font-semibold text-white/[0.025]">
                  0{index + 1}
                </div>
                <div
                  className="mb-8 flex h-12 w-12 items-center justify-center border"
                  style={{
                    borderColor: `${path.accent}55`,
                    background: `${path.accent}16`,
                    color: path.accent,
                  }}
                >
                  <Icon size={22} />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{path.label}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{path.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/48">{path.desc}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-gold/75">
                  {isZh ? "进入分析" : "Open flow"}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
