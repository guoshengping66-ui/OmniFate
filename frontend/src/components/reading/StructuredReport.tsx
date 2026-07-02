"use client"

import type { StructuredReport } from "@/types/report"
import { useLanguage } from "@/contexts/LanguageContext"
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
  const { t } = useLanguage()
  const { summary, dimensions } = data

  return (
    <div className="space-y-4">
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
    </div>
  )
}
