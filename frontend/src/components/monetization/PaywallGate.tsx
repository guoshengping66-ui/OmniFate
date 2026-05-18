"use client"
import { ReactNode } from "react"
import { Lock, Crown, Sparkles, Zap, CreditCard, Globe } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/hooks/useRegion"

interface PaywallGateProps {
  isUnlocked: boolean
  title: string
  description: string
  priceDisplay: string
  onUnlock: () => void
  loading?: boolean
  children: ReactNode
  /** Number of preview lines to show before blur */
  previewLines?: number
  /** User's stardust balance — enables stardust unlock button */
  stardustBalance?: number
  /** Callback when user chooses stardust unlock */
  onStardustUnlock?: () => void
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
  onStardustUnlock,
}: PaywallGateProps) {
  const { t } = useLanguage()
  const { region } = useRegion()
  const isOverseas = region === "overseas"
  const hasEnoughStardust = stardustBalance >= 100

  if (isUnlocked) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="relative overflow-hidden rounded-2xl" style={{ maxHeight: `${previewLines * 28}px` }}>
        <div className="blur-sm select-none opacity-40 pointer-events-none">
          {children}
        </div>
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-ink/90 to-transparent" />
      </div>

      {/* Lock overlay — 天命解码控制台 */}
      <div className="card-glass p-8 text-center -mt-4 rounded-t-none border-t-0 rounded-2xl relative z-10">
        {/* Lock icon */}
        <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-gold" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gold mb-2">{title}</h3>
        <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">{description}</p>

        {/* Price display */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Crown size={16} className="text-gold" />
          <span className="text-2xl font-bold text-white">{priceDisplay}</span>
        </div>

        {/* ── 三通道解锁面板 ── */}
        <div className="space-y-3 max-w-sm mx-auto">
          {/* Channel 1: Stardust */}
          {onStardustUnlock && (
            <button
              onClick={onStardustUnlock}
              disabled={loading || !hasEnoughStardust}
              className={`w-full p-4 rounded-xl border text-left transition-all duration-300 flex items-center gap-3
                ${hasEnoughStardust
                  ? "bg-purple-500/10 border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-500/15"
                  : "bg-white/[0.02] border-white/10 opacity-50 cursor-not-allowed"
                }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-sm font-medium">
                  {t("paywall.stardustUnlock") || "消耗 100 星尘积分解锁"}
                </div>
                <div className="text-white/30 text-[11px] mt-0.5">
                  {hasEnoughStardust
                    ? `${t("paywall.stardustBalance") || "当前余额"}: ${stardustBalance} ✨`
                    : `${t("paywall.stardustInsufficient") || "星尘不足"} (${stardustBalance}/100)`
                  }
                </div>
              </div>
              <span className="text-purple-400/60 text-xs font-mono">100 ✨</span>
            </button>
          )}

          {/* Channel 2: WeChat / Alipay (domestic) */}
          {!isOverseas && (
            <button
              onClick={onUnlock}
              disabled={loading}
              className="w-full p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 hover:border-blue-400/50 hover:bg-blue-500/15 text-left transition-all duration-300 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                <CreditCard size={18} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-sm font-medium">
                  {t("paywall.wechatAlipay") || "微信 / 支付宝快捷支付"}
                </div>
                <div className="text-white/30 text-[11px] mt-0.5">
                  {t("paywall.wechatAlipayDesc") || "扫码即付，秒级解锁"}
                </div>
              </div>
              <span className="text-blue-400/60 text-xs font-mono">¥69</span>
            </button>
          )}

          {/* Channel 2 (overseas variant): PayPal */}
          {isOverseas && (
            <button
              onClick={onUnlock}
              disabled={loading}
              className="w-full p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 hover:border-blue-400/50 hover:bg-blue-500/15 text-left transition-all duration-300 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                <Globe size={18} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-sm font-medium">
                  PayPal / USDT
                </div>
                <div className="text-white/30 text-[11px] mt-0.5">
                  {t("paywall.paypalDesc") || "International payment"}
                </div>
              </div>
              <span className="text-blue-400/60 text-xs font-mono">$19.99</span>
            </button>
          )}

          {/* Channel 3: Unified CTA (fallback / premium member shortcut) */}
          <button
            onClick={onUnlock}
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3.5"
          >
            {loading ? (
              <><span className="animate-spin inline-block">⏳</span> 处理中…</>
            ) : (
              <><Sparkles size={18} /> {t("paywall.unlockCta") || "立即解锁完整报告"}</>
            )}
          </button>
        </div>

        <p className="text-white/25 text-xs mt-4">
          {t("paywall.unlockPerks") || "解锁后赠送 ¥60 商城代金券 + 3 天会员试用"}
        </p>
      </div>
    </div>
  )
}
