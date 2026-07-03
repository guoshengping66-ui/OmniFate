"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import type { ConflictBalanceProps } from "@/types/report"

export function ConflictBalance({ data }: ConflictBalanceProps) {
  const { t } = useLanguage()
  const { left, right, conflictPoint } = data
  const total = left.weight + right.weight
  const leftPercent = Math.round((left.weight / total) * 100)
  const rightPercent = 100 - leftPercent
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-2.5">
      {/* Section header */}
      <div className="flex items-center gap-2 text-xs text-parchment-400">
        <span className="w-1 h-1 rounded-full bg-amber-400/60" />
        <span>{t("report.conflictBalance.header")}</span>
      </div>

      {/* Balance bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xs text-red-400/80 font-medium min-w-[40px] md:min-w-[60px] text-right truncate">{left.tag}</span>
          <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden flex">
            <div
              className="h-full bg-red-500/60 transition-all duration-700"
              style={{ width: `${leftPercent}%` }}
            />
            <div
              className="h-full bg-emerald-500/60 transition-all duration-700"
              style={{ width: `${rightPercent}%` }}
            />
          </div>
          <span className="text-xs text-emerald-400/80 font-medium min-w-[40px] md:min-w-[60px] truncate">{right.tag}</span>
        </div>

        {/* Percentages */}
        <div className="flex justify-between px-[44px] md:px-[68px]">
          <span className="text-xs text-red-400/60">{leftPercent}%</span>
          <span className="text-xs text-emerald-400/60">{rightPercent}%</span>
        </div>
      </div>

      {/* Conflict point - expandable */}
      {conflictPoint && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-parchment-400 hover:text-parchment-400 transition-colors"
          >
            <span className="w-1 h-1 rounded-full bg-amber-400/40" />
            {t("report.conflictBalance.coreConflict")}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <div className={`transition-all duration-200 overflow-hidden ${expanded ? "max-h-40 opacity-100 mt-1.5" : "max-h-0 opacity-0"}`}>
            <p className="text-parchment-400 text-xs leading-relaxed pl-2.5 border-l border-amber-500/20">
              {conflictPoint}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
