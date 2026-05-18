"use client"
import { ReactNode } from "react"
import { Lock, Crown, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface PaywallGateProps {
  isUnlocked: boolean
  title: string
  description: string
  priceDisplay: string
  onUnlock: () => void
  loading?: boolean
  children: ReactNode
  previewLines?: number
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
}: PaywallGateProps) {
  const { t } = useLanguage()

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
        <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">{description}</p>

        <div className="flex items-center justify-center gap-2 mb-5">
          <Crown size={16} className="text-gold" />
          <span className="text-2xl font-bold text-white">{priceDisplay}</span>
        </div>

        <button
          onClick={onUnlock}
          disabled={loading}
          className="btn-gold flex items-center gap-2 mx-auto text-base px-10 py-3.5"
        >
          {loading ? (
            <><span className="animate-spin inline-block">⏳</span> {t("paywall.processing")}</>
          ) : (
            <><Sparkles size={18} /> {t("paywall.unlockReport")}</>
          )}
        </button>

        <p className="text-white/25 text-xs mt-4">
          {t("paywall.giftNote")}
        </p>
      </div>
    </div>
  )
}
