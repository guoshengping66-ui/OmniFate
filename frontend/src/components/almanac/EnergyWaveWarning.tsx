"use client"
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

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
  const { t } = useLanguage()
  const TrendIcon = trend === "rising" ? TrendingUp : trend === "falling" ? TrendingDown : Minus
  const trendColor = trend === "rising" ? "text-green-400" : trend === "falling" ? "text-red-400" : "text-parchment-400"
  const barColor = currentEnergy >= 70 ? "bg-green-500" : currentEnergy >= 40 ? "bg-gold" : "bg-red-500"

  const trendText =
    trend === "rising" ? t("almanac.rising") :
    trend === "falling" ? t("almanac.falling") :
    t("almanac.stable")

  return (
    <div className="card-solid p-5 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle size={18} className="text-gold" />
        <h3 className="font-serif text-gold font-bold">{t("almanac.energyWave")}</h3>
      </div>

      {/* Energy bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-parchment-400">{t("almanac.currentEnergy")}</span>
          <span className="text-xs text-parchment-400">{currentEnergy}%</span>
        </div>
        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${currentEnergy}%` }}
          />
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-2">
        <TrendIcon size={16} className={trendColor} />
        <span className="text-sm text-parchment-400">
          {t("almanac.trend")}{" "}
          <span className={trendColor}>{trendText}</span>
        </span>
      </div>

      {/* Warning message */}
      {warningMessage && (
        <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 text-sm text-parchment-300">
          {warningMessage}
        </div>
      )}

      {/* Peaks / Troughs */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {nextPeak && (
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-2">
            <span className="text-green-400/60">{t("almanac.nextPeak")}</span>
            <p className="text-parchment-400 mt-0.5">{nextPeak}</p>
          </div>
        )}
        {nextTrough && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2">
            <span className="text-red-400/60">{t("almanac.nextTrough")}</span>
            <p className="text-parchment-400 mt-0.5">{nextTrough}</p>
          </div>
        )}
      </div>
    </div>
  )
}
