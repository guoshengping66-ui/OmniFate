"use client"

import type { TagMatrixProps } from "@/types/report"

export function TagMatrix({ negativeTags, positiveTags }: TagMatrixProps) {
  return (
    <div className="space-y-2.5">
      {/* Negative tags */}
      {negativeTags.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <span className="w-1 h-1 rounded-full bg-red-400/60" />
            <span>负面耗能阻尼点</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {negativeTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-red-500/8 text-red-400/70 border border-red-500/15"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Positive tags */}
      {positiveTags.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
            <span>破局能量激活点</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {positiveTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-emerald-500/8 text-emerald-400/70 border border-emerald-500/15"
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
