"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { ConflictBalanceProps } from "@/types/report"

export function ConflictBalance({ data }: ConflictBalanceProps) {
  const { left, right, conflictPoint } = data
  const total = left.weight + right.weight
  const leftPercent = Math.round((left.weight / total) * 100)
  const rightPercent = 100 - leftPercent
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-2.5">
      {/* Section header */}
      <div className="flex items-center gap-2 text-[11px] text-white/40">
        <span className="w-1 h-1 rounded-full bg-amber-400/60" />
        <span>现状阻尼天平</span>
      </div>

      {/* Balance bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-red-400/80 font-medium min-w-[60px] text-right">{left.tag}</span>
          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden flex">
            <div
              className="h-full bg-red-500/60 transition-all duration-700"
              style={{ width: `${leftPercent}%` }}
            />
            <div
              className="h-full bg-emerald-500/60 transition-all duration-700"
              style={{ width: `${rightPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-emerald-400/80 font-medium min-w-[60px]">{right.tag}</span>
        </div>

        {/* Percentages */}
        <div className="flex justify-between px-[68px]">
          <span className="text-[10px] text-red-400/60">{leftPercent}%</span>
          <span className="text-[10px] text-emerald-400/60">{rightPercent}%</span>
        </div>
      </div>

      {/* Conflict point - expandable */}
      {conflictPoint && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/50 transition-colors"
          >
            <span className="w-1 h-1 rounded-full bg-amber-400/40" />
            核心对撞点
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <div className={`transition-all duration-200 overflow-hidden ${expanded ? "max-h-40 opacity-100 mt-1.5" : "max-h-0 opacity-0"}`}>
            <p className="text-white/50 text-xs leading-relaxed pl-2.5 border-l border-amber-500/20">
              {conflictPoint}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
