"use client"

import type { ConflictBalanceProps } from "@/types/report"

/**
 * 对立冲突天平组件
 * 展示两个对立倾向的权重对比
 */
export function ConflictBalance({ data, color = "gold" }: ConflictBalanceProps) {
  const { left, right, conflictPoint } = data
  const total = left.weight + right.weight
  const leftPercent = Math.round((left.weight / total) * 100)
  const rightPercent = 100 - leftPercent

  return (
    <div className="space-y-3">
      {/* 天平标题 */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
        现状阻尼天平
      </div>

      {/* 天平主体 */}
      <div className="relative">
        {/* 进度条背景 */}
        <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-red-500/70 to-red-400/50 transition-all duration-700"
            style={{ width: `${leftPercent}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-emerald-400/50 to-emerald-500/70 transition-all duration-700"
            style={{ width: `${rightPercent}%` }}
          />
        </div>

        {/* 标签行 */}
        <div className="flex justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-xs font-medium">{leftPercent}%</span>
            <span className="text-white/60 text-xs">{left.tag}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs">{right.tag}</span>
            <span className="text-emerald-400 text-xs font-medium">{rightPercent}%</span>
          </div>
        </div>
      </div>

      {/* 核心冲突点 */}
      <div className="mt-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        <p className="text-white/50 text-xs leading-relaxed">
          <span className="text-amber-400/70 font-medium">核心对撞点：</span>
          {conflictPoint}
        </p>
      </div>
    </div>
  )
}
