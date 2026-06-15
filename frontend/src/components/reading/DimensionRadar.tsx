"use client"

import type { DimensionRadarProps } from "@/types/report"

/**
 * 身心代偿雷达组件
 * 展示身体健康和精神状态的对比
 */
export function DimensionRadar({ data }: DimensionRadarProps) {
  const { physicalHardware, mentalSoftware, conclusion } = data

  const getRiskColor = (riskLevel?: string) => {
    if (riskLevel?.includes("高") || riskLevel?.includes("High")) {
      return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" }
    }
    if (riskLevel?.includes("中") || riskLevel?.includes("Medium")) {
      return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
    }
    return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  }

  const getStars = (value: number) => {
    const filled = Math.round(value / 2)
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < filled ? "text-amber-400" : "text-white/20"}>
        ★
      </span>
    ))
  }

  const physicalRisk = getRiskColor()
  const mentalRisk = getRiskColor(mentalSoftware.riskLevel)

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400/60" />
        身心代偿雷达
      </div>

      {/* 雷达指标 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 物理硬件 */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚙️</span>
            <span className="text-xs text-white/50">物理硬件</span>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold text-white/80">{physicalHardware.value}</span>
            <span className="text-xs text-white/30">/ 10</span>
          </div>
          <div className="text-xs text-white/40 mb-2">{physicalHardware.label}</div>
          <div className="flex gap-0.5">{getStars(physicalHardware.value)}</div>
        </div>

        {/* 精神软件 */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🧠</span>
            <span className="text-xs text-white/50">精神软件</span>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className={`text-2xl font-bold ${mentalRisk.text}`}>{mentalSoftware.value}</span>
            <span className="text-xs text-white/30">/ 10</span>
          </div>
          <div className="text-xs text-white/40 mb-2">{mentalSoftware.label}</div>
          {mentalSoftware.riskLevel && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${mentalRisk.bg} ${mentalRisk.text} border ${mentalRisk.border}`}>
              🚨 {mentalSoftware.riskLevel}
            </span>
          )}
        </div>
      </div>

      {/* 核心结论 */}
      <div className="px-3 py-2.5 rounded-lg bg-gradient-to-r from-orange-500/[0.04] to-transparent border border-orange-500/10">
        <p className="text-white/55 text-xs leading-relaxed">
          <span className="text-orange-400/70 font-medium">核心结论：</span>
          {conclusion}
        </p>
      </div>
    </div>
  )
}
