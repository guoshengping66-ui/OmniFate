"use client"

import type { StructuredReport } from "@/types/report"
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

/**
 * 结构化报告主组件
 * 渲染完整的结构化元数据报告
 */
export function StructuredReport({ data }: StructuredReportProps) {
  const { summary, dimensions } = data

  return (
    <div className="space-y-6">
      {/* 核心摘要 */}
      <div className="card-glass p-5 md:p-6 border-l-2 border-l-gold/40">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✨</span>
          <span className="text-xs text-gold/70 font-medium">核心结论</span>
        </div>
        <p className="text-white/75 text-sm leading-relaxed">{summary}</p>
      </div>

      {/* 财富与事业维度 */}
      {dimensions.wealth && (
        <DimensionCard
          title="财富与事业·量化能量场"
          icon="🎯"
          score={dimensions.wealth.score}
          color="text-amber-400"
        >
          <ConflictBalance data={dimensions.wealth.conflictBalance} />
          <TagMatrix
            negativeTags={dimensions.wealth.negativeTags}
            positiveTags={dimensions.wealth.positiveTags}
          />
          <ActionCommand commands={dimensions.wealth.actionCommands} />
        </DimensionCard>
      )}

      {/* 感情与人际维度 */}
      {dimensions.relationship && (
        <DimensionCard
          title="感情与人际·隐性权力场"
          icon="💕"
          score={dimensions.relationship.score}
          color="text-pink-400"
        >
          <EnergyBar bars={dimensions.relationship.energyBars} />
          <InteractionMirror data={dimensions.relationship.interactionMirror} />

          {/* 关系高优先解 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400/60" />
              关系高优先解
            </div>
            <div className="px-3 py-2.5 rounded-lg bg-pink-500/[0.04] border border-pink-500/10">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">💡</span>
                <span className="text-xs text-pink-400/70 font-medium">独家处方</span>
              </div>
              <p className="text-white/65 text-sm leading-relaxed">
                {dimensions.relationship.resolution}
              </p>
            </div>
          </div>
        </DimensionCard>
      )}

      {/* 事业维度（如果与财富分开） */}
      {dimensions.career && dimensions.career !== dimensions.wealth && (
        <DimensionCard
          title="事业进阶·赛道切换"
          icon="🚀"
          score={dimensions.career.score}
          color="text-cyan-400"
        >
          <ConflictBalance data={dimensions.career.conflictBalance} />
          <TagMatrix
            negativeTags={dimensions.career.negativeTags}
            positiveTags={dimensions.career.positiveTags}
          />
          <ActionCommand commands={dimensions.career.actionCommands} />
        </DimensionCard>
      )}

      {/* 健康与精神维度 */}
      {dimensions.health && (
        <DimensionCard
          title="精神与健康·内耗代偿镜"
          icon="🏥"
          score={dimensions.health.score}
          color="text-orange-400"
        >
          <DimensionRadar data={dimensions.health.radarChart} />
        </DimensionCard>
      )}

      {/* 精神与创造力维度 */}
      {dimensions.spiritual && (
        <DimensionCard
          title="精神能级·创造力审查"
          icon="🧘"
          score={dimensions.spiritual.score}
          color="text-violet-400"
        >
          <CreativeFilter data={dimensions.spiritual.creativeFilter} />
          <ResetAction actions={dimensions.spiritual.resetActions} />
        </DimensionCard>
      )}
    </div>
  )
}
