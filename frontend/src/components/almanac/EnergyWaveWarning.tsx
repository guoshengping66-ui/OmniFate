"use client"
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface EnergyWaveWarningProps {
  currentEnergy: number     // 0-100
  trend: "rising" | "falling" | "stable"
  warningMessage?: string
  nextPeak?: string
  nextTrough?: string
}

export function EnergyWaveWarning({
  currentEnergy,
  trend,
  warningMessage,
  nextPeak,
  nextTrough,
}: EnergyWaveWarningProps) {
  const TrendIcon = trend === "rising" ? TrendingUp : trend === "falling" ? TrendingDown : Minus
  const trendColor = trend === "rising" ? "text-green-400" : trend === "falling" ? "text-red-400" : "text-white/40"
  const barColor = currentEnergy >= 70 ? "bg-green-500" : currentEnergy >= 40 ? "bg-gold" : "bg-red-500"

  return (
    <div className="card-glass p-5 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle size={18} className="text-gold" />
        <h3 className="font-serif text-gold font-bold">能量波动预警</h3>
      </div>

      {/* Energy bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/40">当前能量水平</span>
          <span className="text-xs text-white/60">{currentEnergy}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${currentEnergy}%` }}
          />
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-2">
        <TrendIcon size={16} className={trendColor} />
        <span className="text-sm text-white/60">
          能量趋势: <span className={trendColor}>
            {trend === "rising" ? "上升中 ↑" : trend === "falling" ? "下降中 ↓" : "平稳 →"}
          </span>
        </span>
      </div>

      {/* Warning message */}
      {warningMessage && (
        <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 text-sm text-white/70">
          {warningMessage}
        </div>
      )}

      {/* Peaks / Troughs */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {nextPeak && (
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-2">
            <span className="text-green-400/60">下次能量高峰</span>
            <p className="text-white/60 mt-0.5">{nextPeak}</p>
          </div>
        )}
        {nextTrough && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2">
            <span className="text-red-400/60">注意低能量日</span>
            <p className="text-white/60 mt-0.5">{nextTrough}</p>
          </div>
        )}
      </div>
    </div>
  )
}
