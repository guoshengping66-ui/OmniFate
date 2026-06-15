"use client"

import type { EnergyBarProps } from "@/types/report"

export function EnergyBar({ bars }: EnergyBarProps) {
  const getStatusStyle = (statusType: string) => {
    switch (statusType) {
      case "critical":
        return { bar: "bg-red-500/60", text: "text-red-400", bg: "bg-red-500/10", label: "危" }
      case "warning":
        return { bar: "bg-amber-500/60", text: "text-amber-400", bg: "bg-amber-500/10", label: "警" }
      default:
        return { bar: "bg-emerald-500/60", text: "text-emerald-400", bg: "bg-emerald-500/10", label: "安" }
    }
  }

  return (
    <div className="space-y-2.5">
      {/* Section header */}
      <div className="flex items-center gap-2 text-[11px] text-white/40">
        <span className="w-1 h-1 rounded-full bg-pink-400/60" />
        <span>情感供需阻尼槽</span>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {bars.map((bar, i) => {
          const style = getStatusStyle(bar.statusType)
          const percent = Math.min(bar.value * 10, 100)

          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/55">{bar.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-semibold ${style.text}`}>
                    {bar.value.toFixed(1)}
                  </span>
                  <span className={`text-[9px] px-1 py-0.5 rounded ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
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
