"use client"

import type { DimensionCardProps } from "@/types/report"

/**
 * 维度总卡片容器组件
 * 包装每个维度的所有子组件
 */
export function DimensionCard({ title, icon, score, color, children }: DimensionCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400"
    if (score >= 6) return "text-amber-400"
    return "text-rose-400"
  }

  const getScoreBg = (score: number) => {
    if (score >= 8) return "bg-emerald-500/10 border-emerald-500/20"
    if (score >= 6) return "bg-amber-500/10 border-amber-500/20"
    return "bg-rose-500/10 border-rose-500/20"
  }

  return (
    <div className="card-glass p-5 md:p-6 hover:border-white/[0.12] transition-all duration-500">
      {/* 卡片头部 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className={`font-serif text-lg font-bold ${color}`}>{title}</h3>
        </div>

        {/* 能级评分 */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${getScoreBg(score)}`}>
          <span className="text-xs text-white/40">能级</span>
          <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}</span>
          <span className="text-xs text-white/30">/10</span>
        </div>
      </div>

      {/* 卡片内容 */}
      <div className="space-y-5">
        {children}
      </div>
    </div>
  )
}
