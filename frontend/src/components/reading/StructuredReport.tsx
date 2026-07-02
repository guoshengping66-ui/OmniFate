"use client"

import type { StructuredReport } from "@/types/report"
import { useLanguage } from "@/contexts/LanguageContext"
import { BookOpenCheck, CalendarCheck, Compass, Route } from "lucide-react"
import { DimensionCard } from "./DimensionCard"
import { ConflictBalance } from "./ConflictBalance"
import { TagMatrix } from "./TagMatrix"
import { ActionCommand } from "./ActionCommand"
import { EnergyBar } from "./EnergyBar"
import { InteractionMirror } from "./InteractionMirror"
import { DimensionRadar } from "./DimensionRadar"
import { CreativeFilter } from "./CreativeFilter"
import { ResetAction } from "./ResetAction"

interface StructuredReportProps {
  data: StructuredReport
}

export function StructuredReport({ data }: StructuredReportProps) {
  const { t, locale } = useLanguage()
  const { summary, dimensions } = data
  const copy = locale === "zh"
    ? {
        badge: "五维成长命盘",
        title: "你的报告不止是结论，而是一条下一步路线",
        desc: "系统会把命理信号、当前问题和行动建议合并成可复盘的成长档案。",
        loopTitle: "接下来怎么用这份报告",
        loop: [
          { title: "7 天观察", desc: "观察报告指出的重复模式是否出现。", icon: BookOpenCheck },
          { title: "30 天行动", desc: "只选择一条最关键的建议持续执行。", icon: CalendarCheck },
          { title: "90 天路线", desc: "把阶段主题从焦虑变成可衡量的成长方向。", icon: Route },
        ],
      }
    : {
        badge: "Five-Dimension Growth Chart",
        title: "This report is not only a conclusion. It is your next route.",
        desc: "The system combines chart signals, current context, and action advice into a reflection-ready growth profile.",
        loopTitle: "How to use this report next",
        loop: [
          { title: "7-Day Observation", desc: "Watch whether the repeated pattern appears in real life.", icon: BookOpenCheck },
          { title: "30-Day Action", desc: "Pick one important recommendation and execute it consistently.", icon: CalendarCheck },
          { title: "90-Day Route", desc: "Turn the theme from anxiety into a measurable growth direction.", icon: Route },
        ],
      }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gold/15 bg-gold/[0.045] p-4 md:p-5">
        <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gold/65">
          <Compass size={14} />
          <span>{copy.badge}</span>
        </div>
        <h2 className="mb-2 font-serif text-xl font-semibold text-gold md:text-2xl">{copy.title}</h2>
        <p className="text-sm leading-relaxed text-white/50">{copy.desc}</p>
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 md:p-5">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="w-1 h-5 rounded-full bg-gold/60" />
          <span className="text-xs text-white/50 font-medium">{t("report.summary")}</span>
        </div>
        <p className="text-white/65 text-sm leading-relaxed">{summary}</p>
      </div>

      {/* Wealth dimension */}
      {dimensions.wealth && (
        <DimensionCard
          title={t("report.wealth.title")}
          icon="💰"
          score={dimensions.wealth.score}
          color="bg-amber-400"
        >
          <ConflictBalance data={dimensions.wealth.conflictBalance} />
          <TagMatrix
            negativeTags={dimensions.wealth.negativeTags}
            positiveTags={dimensions.wealth.positiveTags}
          />
          <ActionCommand commands={dimensions.wealth.actionCommands} />
        </DimensionCard>
      )}

      {/* Relationship dimension */}
      {dimensions.relationship && (
        <DimensionCard
          title={t("report.relationship.title")}
          icon="💕"
          score={dimensions.relationship.score}
          color="bg-pink-400"
        >
          <EnergyBar bars={dimensions.relationship.energyBars} />
          <InteractionMirror data={dimensions.relationship.interactionMirror} />

          {/* Resolution */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[11px] text-white/40">
              <span className="w-1 h-1 rounded-full bg-pink-400/60" />
              <span>{t("report.relationship.priority")}</span>
            </div>
            <div className="px-3 py-2.5 rounded-lg bg-pink-500/[0.04] border border-pink-500/10">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1 h-1 rounded-full bg-pink-400/50" />
                <span className="text-[11px] text-pink-400/60 font-medium">{t("report.relationship.prescription")}</span>
              </div>
              <p className="text-white/55 text-xs leading-relaxed">
                {dimensions.relationship.resolution}
              </p>
            </div>
          </div>
        </DimensionCard>
      )}

      {/* Career dimension */}
      {dimensions.career && dimensions.career !== dimensions.wealth && (
        <DimensionCard
          title={t("report.career.title")}
          icon="🚀"
          score={dimensions.career.score}
          color="bg-cyan-400"
        >
          <ConflictBalance data={dimensions.career.conflictBalance} />
          <TagMatrix
            negativeTags={dimensions.career.negativeTags}
            positiveTags={dimensions.career.positiveTags}
          />
          <ActionCommand commands={dimensions.career.actionCommands} />
        </DimensionCard>
      )}

      {/* Health dimension */}
      {dimensions.health && (
        <DimensionCard
          title={t("report.health.title")}
          icon="🏥"
          score={dimensions.health.score}
          color="bg-orange-400"
        >
          <DimensionRadar data={dimensions.health.radarChart} />
        </DimensionCard>
      )}

      {/* Spiritual dimension */}
      {dimensions.spiritual && (
        <DimensionCard
          title={t("report.spiritual.title")}
          icon="🧘"
          score={dimensions.spiritual.score}
          color="bg-violet-400"
        >
          <CreativeFilter data={dimensions.spiritual.creativeFilter} />
          <ResetAction actions={dimensions.spiritual.resetActions} />
        </DimensionCard>
      )}

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-gold/60" />
          <h3 className="text-sm font-semibold text-white/85">{copy.loopTitle}</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {copy.loop.map(item => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-lg border border-white/[0.06] bg-black/15 p-3">
                <div className="mb-2 flex items-center gap-2 text-gold/75">
                  <Icon size={15} />
                  <span className="text-xs font-semibold">{item.title}</span>
                </div>
                <p className="text-xs leading-relaxed text-white/42">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
