"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import type { EnergyBarProps } from "@/types/report"

export function EnergyBar({ bars }: EnergyBarProps) {
  const { t } = useLanguage()
  const getStatusStyle = (statusType: string) => {
    switch (statusType) {
      case "critical":
        return { bar: "bg-red-500/60", text: "text-red-400", bg: "bg-red-500/10", label: t("report.energyBar.critical") }
      case "warning":
        return { bar: "bg-amber-500/60", text: "text-amber-400", bg: "bg-amber-500/10", label: t("report.energyBar.warning") }
      default:
        return { bar: "bg-emerald-500/60", text: "text-emerald-400", bg: "bg-emerald-500/10", label: t("report.energyBar.safe") }
    }
  }

  return (
    <div className="space-y-2.5">
      {/* Section header */}
      <div className="flex items-center gap-2 text-xs text-parchment-400">
        <span className="w-1 h-1 rounded-full bg-pink-400/60" />
        <span>{t("report.energyBar.header")}</span>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {bars.map((bar, i) => {
          const style = getStatusStyle(bar.statusType)
          const percent = Math.min(bar.value * 10, 100)

          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-parchment-300">{bar.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${style.text}`}>
                    {bar.value.toFixed(1)}
                  </span>
                  <span className={`text-[9px] px-1 py-0.5 rounded ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className={`h-full rounded-full ${style.bar} transition-all duration-700`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
