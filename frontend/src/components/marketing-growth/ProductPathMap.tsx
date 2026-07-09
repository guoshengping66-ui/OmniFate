"use client"

import Link from "next/link"
import { ArrowRight, CalendarClock, Compass, HeartHandshake, Layers3, ShoppingBag, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const zhPaths = [
  {
    icon: Sparkles,
    title: "免费探索入口",
    label: "Free Tools",
    desc: "星际分析、性格测验和今日趋势保留为低门槛入口，用来快速产生兴趣、分享和第一层反馈。",
    href: "/tools",
    accent: "#B995FF",
  },
  {
    icon: Compass,
    title: "单主题快问",
    label: "Focus Reading",
    desc: "围绕事业、感情、财富、健康或一个具体决策，只输出该主题的判断、时机和下一步动作。",
    href: "/reading/new?intent=quick",
    accent: "#C9A84C",
  },
  {
    icon: Layers3,
    title: "完整命运行动图",
    label: "Fate Action Map",
    desc: "把人格、事业、财富、关系、能量状态和长期路径放进同一张图，形成你的核心档案。",
    href: "/reading/new?intent=full",
    accent: "#59B894",
  },
  {
    icon: HeartHandshake,
    title: "关系合参",
    label: "Relationship Sync",
    desc: "为恋爱、婚姻、复合、合作和亲密关系建立双人关系图，拆解契合点、冲突源和沟通动作。",
    href: "/reading/new?intent=relationship",
    accent: "#D98C72",
  },
  {
    icon: CalendarClock,
    title: "今日行动板",
    label: "Daily Command",
    desc: "每天根据底层档案和当日节奏，给出今日主题、风险提醒和最值得推进的一件事。",
    href: "/almanac",
    accent: "#74A7D8",
  },
  {
    icon: ShoppingBag,
    title: "藏宝阁处方",
    label: "Treasure Prescription",
    desc: "把报告里的弱点、五行、星象和阶段任务转成可浏览、可解释、可理性选择的生活方式建议。",
    href: "/shop",
    accent: "#D7A35F",
  },
]

const enPaths = [
  {
    icon: Sparkles,
    title: "Free Entry Tools",
    label: "Free Tools",
    desc: "Star Analysis, personality quizzes, and daily trends stay as low-friction entry points for interest, sharing, and first feedback.",
    href: "/tools",
    accent: "#B995FF",
  },
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
    title: "Full Fate Action Map",
    label: "Fate Action Map",
    desc: "A complete profile across personality, work, wealth, relationships, energy, timing, and long-term path.",
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
    title: "Today Action Board",
    label: "Logged-in dashboard",
    desc: "A daily board that turns your base profile and today's rhythm into a theme, risk reminder, and best next move.",
    href: "/almanac",
    accent: "#74A7D8",
  },
  {
    icon: ShoppingBag,
    title: "Treasure Prescription",
    label: "Treasure Hall",
    desc: "Turns weak signals, elements, astrological tags, and stage tasks into explainable lifestyle recommendations.",
    href: "/shop",
    accent: "#D7A35F",
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
              {isZh ? "产品路线图" : "Product Map"}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-white md:text-5xl">
              {isZh ? "免费入口负责破冰，核心产品负责长期留存" : "Free tools spark entry. Core products create the long-term loop."}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/50">
            {isZh
              ? "星际分析和性格测验需要保留，但要放在工具层；主线是完整画像、关系合参、今日行动板和藏宝阁处方形成闭环。"
              : "Star Analysis and personality quizzes should stay, but in the tools layer. The core loop is profile, relationship sync, daily action, and Treasure prescription."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paths.map((path, index) => {
            const Icon = path.icon
            return (
              <Link
                key={path.title}
                href={localeHref(path.href)}
                className="group relative min-h-[250px] overflow-hidden border border-white/[0.08] bg-[#060E24] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:bg-white/[0.055]"
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
                  {isZh ? "进入路径" : "Open path"}
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
