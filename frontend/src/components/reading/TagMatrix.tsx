"use client"

import type { TagMatrixProps } from "@/types/report"

/**
 * 标签矩阵组件
 * 展示负面阻尼点和正面破局点
 */
export function TagMatrix({ negativeTags, positiveTags }: TagMatrixProps) {
  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60" />
        核心致因标签组
      </div>

      {/* 负面标签 */}
      {negativeTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-red-400/70">●</span>
            <span className="text-xs text-white/40">负面耗能阻尼点</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {negativeTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400/80 border border-red-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 正面标签 */}
      {positiveTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-emerald-400/70">●</span>
            <span className="text-xs text-white/40">破局能量激活点</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {positiveTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
