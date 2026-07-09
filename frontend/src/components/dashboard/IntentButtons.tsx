"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, CalendarClock, Compass, FileText, HeartHandshake, Layers3, Radar } from "lucide-react"
import { useWizardStore } from "@/stores/useWizardStore"
import { useLanguage } from "@/contexts/LanguageContext"

interface Props {
  onGework?: () => void
}

type Entry = {
  key: string
  icon: typeof Compass
  title: string
  label: string
  desc: string
  output: string
  tone: string
  action: () => void
}

export function IntentButtons({ onGework }: Props) {
  const router = useRouter()
  const { reset: resetWizard } = useWizardStore()
  const { locale, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const go = (href: string) => {
    resetWizard()
    router.push(localeHref(href))
  }

  const entries: Entry[] = [
    {
      key: "focus",
      icon: Compass,
      title: isZh ? "单主题分析" : "Focus Reading",
      label: isZh ? "先解决一个具体问题" : "One concrete question",
      desc: isZh
        ? "事业、感情、财富、健康、今日决策，只输出所选主题的信号、结论和行动建议。"
        : "Career, love, wealth, health, or today's decision, scoped to the chosen topic only.",
      output: isZh ? "主题结论 + 时机窗口 + 行动处方" : "Topic answer + timing + actions",
      tone: "#C9A84C",
      action: () => go("/reading/new?intent=quick"),
    },
    {
      key: "full",
      icon: Layers3,
      title: isZh ? "完整成长命盘" : "Full Growth Chart",
      label: isZh ? "五维合参核心产品" : "Core 5D synthesis",
      desc: isZh
        ? "完整分析人格结构、关系模式、事业财富、能量状态和长期成长路径。"
        : "A complete read on personality, relationships, career, wealth, energy, and long-term growth.",
      output: isZh ? "完整报告 + 五维地图 + 成长路线" : "Full report + 5D map + growth path",
      tone: "#59B894",
      action: () => go("/reading/new?intent=full"),
    },
    {
      key: "relationship",
      icon: HeartHandshake,
      title: isZh ? "关系合盘" : "Relationship Sync",
      label: isZh ? "关系成长独立入口" : "Dedicated relationship flow",
      desc: isZh
        ? "恋爱、婚姻、复合、合作、亲子都走双人资料流程，单独生成关系图。"
        : "A two-person flow for romance, marriage, reunion, collaboration, family, and communication.",
      output: isZh ? "契合点 + 冲突来源 + 关系推进建议" : "Compatibility + conflict + next moves",
      tone: "#D98C72",
      action: () => go("/reading/new?intent=relationship"),
    },
    {
      key: "event",
      icon: Radar,
      title: isZh ? "事件决策" : "Event Decision",
      label: isZh ? "判断一件事值不值得做" : "Evaluate a specific event",
      desc: isZh
        ? "输入事件和时间，判断推进窗口、阻力来源、风险等级和替代方案。"
        : "Enter an event and timing to evaluate opportunity, resistance, risk, and alternatives.",
      output: isZh ? "推进建议 + 风险提醒 + 替代时机" : "Go/no-go + risk + alternate timing",
      tone: "#9B8BE8",
      action: () => onGework?.(),
    },
    {
      key: "daily",
      icon: CalendarClock,
      title: isZh ? "今日时机" : "Daily Timing",
      label: isZh ? "每天回来看的行动盘" : "Daily action board",
      desc: isZh
        ? "结合命盘底层和当日时令，查看今日主题、宜忌、能量和行动优先级。"
        : "Check today's theme, almanac, energy, and action priorities from your chart and daily timing.",
      output: isZh ? "今日主题 + 宜忌 + 行动优先级" : "Theme + almanac + priorities",
      tone: "#74A7D8",
      action: () => router.push(localeHref("/almanac")),
    },
    {
      key: "reports",
      icon: FileText,
      title: isZh ? "历史报告" : "My Reports",
      label: isZh ? "延续你的成长记录" : "Continue your growth record",
      desc: isZh
        ? "回看过去报告，比较主题变化，把一次分析沉淀成长期成长线索。"
        : "Revisit past reports, compare themes, and turn one-off readings into a growth record.",
      output: isZh ? "报告档案 + 主题变化 + 后续行动" : "Archive + theme shifts + follow-ups",
      tone: "#E0B56B",
      action: () => router.push(localeHref("/readings")),
    },
  ]

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/60">
            {isZh ? "Analysis Matrix" : "Analysis Matrix"}
          </p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-white">
            {isZh ? "你现在想解决哪一类问题？" : "What do you want to solve now?"}
          </h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-white/45">
          {isZh
            ? "单主题只回答一个问题；完整命盘负责全局；合盘是关系成长的独立流程。"
            : "Focus readings answer one topic. The full chart covers the whole system. Relationship sync has its own flow."}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {entries.map(entry => {
          const Icon = entry.icon
          return (
            <button
              key={entry.key}
              type="button"
              onClick={entry.action}
              className="group relative min-h-[220px] overflow-hidden border border-white/[0.08] bg-[#08120f]/80 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:bg-[#060E24]"
            >
              <div
                className="absolute inset-x-0 top-0 h-px opacity-70"
                style={{ background: `linear-gradient(90deg, transparent, ${entry.tone}, transparent)` }}
              />
              <div className="mb-5 flex items-start justify-between gap-4">
                <div
                  className="flex h-11 w-11 items-center justify-center border"
                  style={{ borderColor: `${entry.tone}55`, background: `${entry.tone}14`, color: entry.tone }}
                >
                  <Icon size={21} />
                </div>
                <ArrowRight size={17} className="text-white/22 transition-transform group-hover:translate-x-1 group-hover:text-gold" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{entry.label}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{entry.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/48">{entry.desc}</p>
              <div className="mt-5 border-t border-white/[0.06] pt-3 text-xs text-gold/65">
                {entry.output}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
