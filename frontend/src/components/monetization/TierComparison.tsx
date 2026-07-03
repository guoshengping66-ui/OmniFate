"use client"
import { Check, Crown, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { TIERS, type PricingTier } from "@/lib/tiers"

function TierCard({ tier, onSelect }: { tier: PricingTier; onSelect?: (id: string) => void }) {
  return (
    <div className={`relative card-solid p-6 flex flex-col h-full transition-all duration-300
      ${tier.highlight
        ? "border-gold/50 shadow-[0_0_30px_rgba(201,168,76,0.15)] scale-[1.02]"
        : "hover:border-white/20"}`}
    >
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-cosmos-950 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
          {tier.badge}
        </div>
      )}

      <div className="text-center mb-5">
        <h3 className="text-xl font-serif font-bold text-gold">{tier.name}</h3>
        <p className="text-parchment-400 text-xs mt-1">{tier.subtitle}</p>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold text-white">{tier.priceDisplay}</span>
        </div>
        {tier.originalPriceCny && (
          <span className="text-parchment-400 text-sm line-through">¥{tier.originalPriceCny}</span>
        )}
        {tier.billingLabel && (
          <p className="text-parchment-400 text-xs mt-1">{tier.billingLabel}</p>
        )}
      </div>

      <ul className="flex-1 space-y-2.5 mb-6">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-parchment-300">
            <Check size={14} className="text-gold mt-0.5 flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect?.(tier.id)}
        className={`mt-auto w-full py-3 rounded-full font-semibold text-sm transition-all duration-300
          ${tier.highlight
            ? "btn-primary"
            : tier.priceCny === 0
              ? "border border-gold/40 text-gold hover:bg-gold/10 rounded-full"
              : "border border-white/20 text-parchment-400 hover:border-gold/40 hover:text-gold rounded-full"}`}
      >
        {tier.cta}
      </button>
    </div>
  )
}

export function TierComparison({ onSelect }: { onSelect?: (tierId: string) => void }) {
  const { t } = useLanguage()
  const displayTiers = TIERS.filter(t => t.id !== "event_retro" && t.id !== "onetime_unlock")

  return (
    <div>
      <div className="text-center mb-10">
        <Crown className="text-gold mx-auto mb-3" size={32} />
        <h2 className="section-title text-2xl md:text-3xl">{t("tierComparison.title")}</h2>
        <p className="text-parchment-400 text-sm mt-2">
          {t("tierComparison.desc")}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {displayTiers.map(tier => (
          <TierCard key={tier.id} tier={tier} onSelect={onSelect} />
        ))}
      </div>

      <div className="mt-8 card-solid p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <Sparkles size={24} className="text-gold/60 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-parchment-200 font-medium">{t("tierComparison.eventRetrospection")}</p>
          <p className="text-parchment-400 text-sm">{t("tierComparison.eventDesc").replace("{price}", "¥19.9")}</p>
        </div>
        <button
          onClick={() => onSelect?.("event_retro")}
          className="btn-secondary text-sm whitespace-nowrap"
        >
          {t("tierComparison.learnMore")}
        </button>
      </div>

      <div className="mt-4 card-solid p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left border border-gold/20">
        <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🔑</span>
        </div>
        <div className="flex-1">
          <p className="text-parchment-200 font-medium">{t("tierComparison.onetimeUnlock")}</p>
          <p className="text-parchment-400 text-sm">{t("tierComparison.onetimeUnlockDesc")}</p>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <span className="text-gold/60 text-xs">🎁 {t("tierComparison.onetimeUnlockGift1")}</span>
            <span className="text-gold/60 text-xs">🎫 {t("tierComparison.onetimeUnlockGift2")}</span>
          </div>
        </div>
        <button
          onClick={() => onSelect?.("onetime_unlock")}
          className="btn-secondary text-sm whitespace-nowrap"
        >
          {t("tierComparison.onetimeUnlockCta")}
        </button>
      </div>
    </div>
  )
}
