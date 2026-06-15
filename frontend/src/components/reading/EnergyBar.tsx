"use client"

import type { EnergyBarProps } from "@/types/report"

/**
 * 能量供需条组件
 * 展示情感供需的量化指标
 */
export function EnergyBar({ bars }: EnergyBarProps) {
  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case "critical":
        return { bar: "from-red-500 to-red-400", text: "text-red-400", bg: "bg-red-500/10" }
      case "warning":
        return { bar: "from-amber-500 to-amber-400", text: "text-amber-400", bg: "bg-amber-500/10" }
      default:
        return { bar: "from-emerald-500 to-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10" }
    }
  }

  const getStatusIcon = (statusType: string) => {
    if (statusType === "critical") return "🪫"
    if (statusType === "warning") return "🔋"
    return "⚡"
  }

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="w-1.5 h-1.5 rounded-full bg-pink-400/60" />
        情感供需阻尼槽
      </div>

      {/* 能量条列表 */}
      <div className="space-y-3">
        {bars.map((bar, i) => {
          const colors = getStatusColor(bar.statusType)
          const percent = Math.min(bar.value * 10, 100)

          return (
            <div key={i} className="space-y-1.5">
              {/* 标签行 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{getStatusIcon(bar.statusType)}</span>
                  <span className="text-xs text-white/60">{bar.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${colors.text}`}>
                    {bar.value.toFixed(1)} / 10
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                    {bar.status}
                  </span>
                </div>
              </div>

              {/* 进度条 */}
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-700`}
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
