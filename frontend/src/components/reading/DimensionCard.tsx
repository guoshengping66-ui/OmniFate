"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import type { DimensionCardProps } from "@/types/report"

export function DimensionCard({ title, icon, score, color, children }: DimensionCardProps) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(true)

  const getScoreBadge = (score: number) => {
    if (score >= 8) return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: t("report.dimension.excellent") }
    if (score >= 6) return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: t("report.dimension.good") }
    if (score >= 4) return { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", label: t("report.dimension.fair") }
    return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: t("report.dimension.weak") }
  }

  const badge = getScoreBadge(score)

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden transition-all duration-300 hover:border-white/[0.12]">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 md:px-5 md:py-3.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-1 h-5 rounded-full ${color}`} />
          <span className="text-lg">{icon}</span>
          <h3 className="text-white/85 text-sm font-semibold">{title}</h3>
        </div>
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${badge.bg} ${badge.border}`}>
            <span className={`text-base font-bold ${badge.text}`}>{score}</span>
            <span className="text-[10px] text-white/30">/10</span>
            <span className={`text-[10px] font-medium ${badge.text}`}>{badge.label}</span>
          </div>
          {expanded ? (
            <ChevronUp size={14} className="text-white/30" />
          ) : (
            <ChevronDown size={14} className="text-white/30" />
          )}
        </div>
      </button>

      {/* Content */}
      <div className={`transition-all duration-300 ${expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
        <div className="px-4 pb-4 md:px-5 md:pb-5 space-y-4 border-t border-white/[0.04]">
          <div className="pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
