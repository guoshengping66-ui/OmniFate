"use client"
import { Sparkles, ArrowRight, Lock, Crown, Zap } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { STARDUST_COST } from "@/lib/pricing.config"

interface FreeReportBannerProps {
  weakestLabel: string
  stardustBalance?: number
  onDetailedUnlock?: () => void
  onFullUnlock?: () => void
  onCtaClick?: () => void
}

export function FreeReportBanner({
  weakestLabel,
  stardustBalance = 0,
  onDetailedUnlock,
  onFullUnlock,
  onCtaClick,
}: FreeReportBannerProps) {
  const { t } = useLanguage()
  const detailedCost = STARDUST_COST.DETAILED_REPORT
  const fullCost = STARDUST_COST.FULL_REPORT
  const canDetailed = stardustBalance >= detailedCost
  const canFull = stardustBalance >= fullCost

  return (
    <div className="card-solid overflow-hidden border border-gold/10">
      {/* Header with urgency */}
      <div className="p-5 md:p-6 border-b border-white/5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-gold/15 to-amber-500/10 border border-gold/20 flex items-center justify-center">
            <Zap size={20} className="text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-parchment-200 text-sm md:text-base leading-relaxed">
              {t("freeBanner.weakEnergy")} <span className="text-gold font-semibold">{weakestLabel}</span>
            </p>
            <p className="text-parchment-400 text-xs mt-1">
              {t("freeBanner.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Dual-tier unlock options */}
      <div className="p-4 md:p-5 space-y-2.5">
        {/* 精读 tier — primary CTA */}
        <button
          onClick={canDetailed ? onDetailedUnlock : onCtaClick}
          className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border transition-all duration-200 ${
            canDetailed
              ? 'bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border-violet-400/25 hover:border-violet-400/40 text-violet-200 hover:bg-violet-500/15'
              : 'bg-white/[0.02] border-white/8 text-parchment-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {canDetailed ? (
              <Sparkles size={16} className="text-violet-400" />
            ) : (
              <Lock size={14} className="text-parchment-400" />
            )}
            <div className="text-left">
              <span className="text-sm font-medium">{t("freeBanner.detailedTitle") || "精读报告"}</span>
              <span className="text-xs text-parchment-400 ml-2">{t("freeBanner.detailedDesc") || "深度分析 + 行动建议"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs ${canDetailed ? 'text-violet-400/70' : 'text-parchment-400'}`}>✦ {detailedCost}</span>
            <ArrowRight size={12} className={canDetailed ? 'text-violet-400/40' : 'text-parchment-400'} />
          </div>
        </button>

        {/* 全维 tier — upgrade option */}
        <button
          onClick={canFull ? onFullUnlock : onCtaClick}
          className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border transition-all duration-200 ${
            canFull
              ? 'bg-gradient-to-r from-gold/8 to-amber-500/8 border-gold/25 hover:border-gold/40 text-gold/90 hover:bg-gold/10'
              : 'bg-white/[0.02] border-white/8 text-parchment-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {canFull ? (
              <Crown size={16} className="text-gold/70" />
            ) : (
              <Lock size={14} className="text-parchment-400" />
            )}
            <div className="text-left">
              <span className="text-sm font-medium">{t("freeBanner.fullTitle") || "全维报告"}</span>
              <span className="text-xs text-parchment-400 ml-2">{t("freeBanner.fullDesc") || "完整工人报告 + AI追问"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs ${canFull ? 'text-gold/50' : 'text-parchment-400'}`}>✦ {fullCost}</span>
            <ArrowRight size={12} className={canFull ? 'text-gold/30' : 'text-parchment-400'} />
          </div>
        </button>

        {/* Balance hint */}
        <p className="text-xs text-parchment-400 text-center pt-1">
          {t("freeBanner.stardustHint") || `当前星尘`} ✦ {stardustBalance}
          {!canDetailed && stardustBalance > 0 && (
            <span className="text-parchment-400"> · {t("freeBanner.needMore") || "邀请好友可获得额外星尘"}</span>
          )}
        </p>
      </div>
    </div>
  )
}
