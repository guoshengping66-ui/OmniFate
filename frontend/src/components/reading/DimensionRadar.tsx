"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import type { DimensionRadarProps } from "@/types/report"

export function DimensionRadar({ data }: DimensionRadarProps) {
  const { t } = useLanguage()
  const { physicalHardware, mentalSoftware, conclusion } = data

  const getRiskBadge = (riskLevel?: string) => {
    if (riskLevel?.includes("高") || riskLevel?.includes("High")) {
      return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/15" }
    }
    if (riskLevel?.includes("中") || riskLevel?.includes("Medium")) {
      return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/15" }
    }
    return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/15" }
  }

  return (
    <div className="space-y-2.5">
      {/* Section header */}
      <div className="flex items-center gap-2 text-xs text-parchment-400">
        <span className="w-1 h-1 rounded-full bg-orange-400/60" />
        <span>{t("report.healthRadar.header")}</span>
      </div>

      {/* Dual indicators */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Physical */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
          <div className="text-xs text-parchment-400 mb-1.5">{t("report.healthRadar.physical")}</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-xl font-bold text-parchment-200">{physicalHardware.value}</span>
            <span className="text-xs text-parchment-400">/ 10</span>
          </div>
          <div className="text-xs text-parchment-400">{physicalHardware.label}</div>
        </div>

        {/* Mental */}
        {(() => {
          const risk = getRiskBadge(mentalSoftware.riskLevel)
          return (
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <div className="text-xs text-parchment-400 mb-1.5">{t("report.healthRadar.mental")}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`text-xl font-bold ${risk.text}`}>{mentalSoftware.value}</span>
                <span className="text-xs text-parchment-400">/ 10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-parchment-400">{mentalSoftware.label}</span>
                {mentalSoftware.riskLevel && (
                  <span className={`text-[9px] px-1 py-0.5 rounded ${risk.bg} ${risk.text} border ${risk.border}`}>
                    {mentalSoftware.riskLevel}
                  </span>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Conclusion */}
      <div className="px-3 py-2 rounded-md bg-orange-500/[0.04] border border-orange-500/10">
        <p className="text-parchment-400 text-xs leading-relaxed">
          <span className="text-orange-400/60 font-medium">{t("report.healthRadar.conclusion")}：</span>
          {conclusion}
        </p>
      </div>
    </div>
  )
}
