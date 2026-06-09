"use client"
import { ReactNode, useState } from "react"
import { Lock, Crown, Sparkles, Loader2, ChevronRight, CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { STARDUST_COST } from "@/lib/pricing.config"

interface PaywallGateProps {
  isUnlocked: boolean
  title: string
  description: string
  priceDisplay: string
  onUnlock: () => void
  loading?: boolean
  children: ReactNode
  previewLines?: number
  stardustBalance?: number
  /** 精读解锁回调 (30 stardust) */
  onDetailedUnlock?: () => Promise<void>
  /** 全维解锁回调 (100 stardust) */
  onStardustUnlock?: () => Promise<void>
  /** 显示双档解锁按钮 (精读+全维) */
  showDualTier?: boolean
  /** 一次性解锁回调 */
  onOneTimeUnlock?: () => void
  /** 用户是否已使用过一次性解锁 */
  oneTimeUsed?: boolean
  /** 用户是否已是会员 */
  isPremium?: boolean
}

export function PaywallGate({
  isUnlocked,
  title,
  description,
  priceDisplay,
  onUnlock,
  loading,
  children,
  previewLines = 4,
  stardustBalance = 0,
  onDetailedUnlock,
  onStardustUnlock,
  showDualTier = false,
  onOneTimeUnlock,
  oneTimeUsed = false,
  isPremium = false,
}: PaywallGateProps) {
  const { t } = useLanguage()
  const [stardustLoading, setStardustLoading] = useState<"detailed" | "full" | null>(null)

  const detailedCost = STARDUST_COST.DETAILED_REPORT
  const fullCost = STARDUST_COST.FULL_REPORT
  const canDetailed = stardustBalance >= detailedCost && !!onDetailedUnlock
  const canFull = stardustBalance >= fullCost && !!onStardustUnlock

  const handleDetailedUnlock = async () => {
    if (!onDetailedUnlock) return
    setStardustLoading("detailed")
    try {
      await onDetailedUnlock()
    } finally {
      setStardustLoading(null)
    }
  }

  const handleFullUnlock = async () => {
    if (!onStardustUnlock) return
    setStardustLoading("full")
    try {
      await onStardustUnlock()
    } finally {
      setStardustLoading(null)
    }
  }

  if (isUnlocked) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl" style={{ maxHeight: `${previewLines * 28}px` }}>
        <div className="blur-sm select-none opacity-40 pointer-events-none">
          {children}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-ink/90 to-transparent" />
      </div>

      <div className="card-glass p-8 text-center -mt-4 rounded-t-none border-t-0 rounded-2xl relative z-10">
        <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-gold" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gold mb-2">{title}</h3>
        <p className="text-white/50 text-sm mb-4 max-w-md mx-auto">{description}</p>

        {/* Value list — what you'll get */}
        <div className="max-w-sm mx-auto mb-5 text-left">
          <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2 text-center">{t("paywall.youWillGet") || "解锁后你将获得"}</p>
          <div className="space-y-1.5">
            {(Array.isArray(t("paywall.valueList", { returnObjects: true }))
              ? t("paywall.valueList", { returnObjects: true }) as string[]
              : [
                "完整五维深度诊断报告",
                "7个专业维度详细分析",
                "个性化改运处方和行动建议",
                "专属好物推荐和搭配指南",
              ]
            ).map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-white/50 text-xs">
                <CheckCircle size={12} className="text-green-400/70 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {showDualTier ? (
          /* 双档解锁：精读 + 全维 */
          <div className="space-y-3 mb-5">
            {/* 精读按钮 */}
            <button
              onClick={handleDetailedUnlock}
              disabled={!canDetailed || stardustLoading !== null}
              className={`w-full flex items-center justify-between py-3.5 px-5 rounded-xl border transition-all duration-200 ${
                canDetailed
                  ? 'bg-gradient-to-r from-violet-500/15 to-indigo-500/15 border-violet-400/30 hover:border-violet-400/50 text-violet-200'
                  : 'bg-white/[0.02] border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                {stardustLoading === "detailed" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} className="text-violet-400" />
                )}
                <span className="font-medium text-sm">
                  {t("paywall.unlockDetailed") || "精读报告"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-violet-400/70">✦ {detailedCost}</span>
                <ChevronRight size={14} className="text-violet-400/40" />
              </div>
            </button>

            {/* 全维按钮 */}
            <button
              onClick={handleFullUnlock}
              disabled={!canFull || stardustLoading !== null}
              className={`w-full flex items-center justify-between py-3.5 px-5 rounded-xl border transition-all duration-200 ${
                canFull
                  ? 'bg-gradient-to-r from-gold/10 to-amber-500/10 border-gold/30 hover:border-gold/50 text-gold'
                  : 'bg-white/[0.02] border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                {stardustLoading === "full" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Crown size={16} className="text-gold" />
                )}
                <span className="font-medium text-sm">
                  {t("paywall.unlockFull") || "全维报告"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gold/60">✦ {fullCost}</span>
                <ChevronRight size={14} className="text-gold/40" />
              </div>
            </button>

            {/* ── 精读内容列表 ── */}
            <div className="rounded-xl bg-violet-500/[0.05] border border-violet-400/10 p-3 text-left">
              <p className="text-violet-300/60 text-[10px] uppercase tracking-wider mb-2 font-medium">
                {t("paywall.detailedIncludes") || "精读包含："}
              </p>
              {(Array.isArray(t("paywall.detailedFeatures", { returnObjects: true }))
                ? t("paywall.detailedFeatures", { returnObjects: true }) as string[]
                : ["精读深度总论", "痛点诊断与改运方案"]
              ).map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-white/40 text-[11px] py-0.5">
                  <CheckCircle size={10} className="text-violet-400/60 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* ── 全维内容列表 ── */}
            <div className="rounded-xl bg-gold/[0.05] border border-gold/10 p-3 text-left">
              <p className="text-gold/60 text-[10px] uppercase tracking-wider mb-2 font-medium">
                {t("paywall.fullIncludes") || "全维包含："}
              </p>
              {(Array.isArray(t("paywall.fullFeatures", { returnObjects: true }))
                ? t("paywall.fullFeatures", { returnObjects: true }) as string[]
                : ["包含精读全部内容", "7个维度完整报告", "AI 追问互动", "专属好物推荐"]
              ).map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-white/40 text-[11px] py-0.5">
                  <CheckCircle size={10} className="text-gold/60 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* 余额提示 */}
            <p className="text-white/25 text-xs text-center">
              {t("paywall.stardustBalance") || `当前星尘`} ✦ {stardustBalance}
            </p>
          </div>
        ) : (
          /* 单按钮模式 (兼容旧版) */
          <>
            {/* Primary: Pay with stardust */}
            {canFull && (
              <button
                onClick={handleFullUnlock}
                disabled={stardustLoading !== null}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-500/20 to-blue-500/20 border border-violet-400/30 hover:border-violet-400/50 text-violet-300 hover:text-violet-200 transition-all duration-200 mb-3"
              >
                {stardustLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
                <span className="font-medium">
                  {t("paywall.useStardust") || `使用 ${fullCost} 星尘解锁`}
                </span>
                <span className="text-violet-400/60 text-sm ml-1">✦ {stardustBalance}</span>
              </button>
            )}

            {/* Insufficient stardust hint */}
            {onStardustUnlock && !canFull && stardustBalance > 0 && (
              <p className="text-white/25 text-xs mb-3">
                {t("paywall.stardustInsufficient") || `星尘不足（需要 ${fullCost}，当前 ${stardustBalance} ✦）`}
              </p>
            )}
          </>
        )}

        {/* Pay with money — direct to pricing page (only for non-premium users) */}
        {!isPremium && (
          <button
            onClick={onUnlock}
            disabled={loading}
            className={`btn-gold flex items-center gap-2 mx-auto text-base px-10 py-3.5 ${(canDetailed || canFull || onOneTimeUnlock) ? 'text-sm px-8 py-3 opacity-80 hover:opacity-100' : ''}`}
          >
            {loading ? (
              <><span className="animate-spin inline-block">⏳</span> {t("paywall.processing")}</>
            ) : (
              <><Sparkles size={18} /> {t("paywall.joinMember") || "加入会员解锁"}</>
            )}
          </button>
        )}

        {/* 一次性解锁选项 */}
        {onOneTimeUnlock && !oneTimeUsed && (
          <button
            onClick={onOneTimeUnlock}
            className="w-full flex items-center justify-center gap-2 mt-3 py-3 rounded-xl border border-gold/30 bg-gold/[0.05] hover:bg-gold/10 text-gold/80 hover:text-gold transition-all duration-200"
          >
            <span className="text-lg">🔑</span>
            <span className="text-sm font-medium">{t("paywall.oneTimeUnlock") || "一次性解锁 ¥19.9"}</span>
            <span className="text-gold/50 text-xs">· {t("paywall.oneTimeUnlockDesc") || "永久解锁 + 50星尘 + ¥20代金券"}</span>
          </button>
        )}

        {/* 赠品提示 — 仅首次解锁显示 */}
        {!isPremium && (
          <p className="text-white/25 text-xs mt-4">
            {t("paywall.giftNote")}
          </p>
        )}
      </div>
    </div>
  )
}
