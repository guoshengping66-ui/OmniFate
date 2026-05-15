"use client"
import { Check, Sparkles, Zap, Crown } from "lucide-react"
import { type PricingTier, type Region } from "@/lib/tiers"

interface PricingCardProps {
  tier: PricingTier
  region: Region
  founderSoldPercent?: number
  founderRemaining?: number
  isNewUser?: boolean
  onSelect?: (id: string) => void
}

export function PricingCard({ tier, region, founderSoldPercent = 0, founderRemaining, isNewUser = false, onSelect }: PricingCardProps) {
  const isDomestic = region === "domestic"
  const priceDisplay = isDomestic ? tier.priceDisplay : tier.priceDisplayUsd
  const originalPrice = isDomestic ? tier.originalPriceCny : tier.originalPriceUsd
  const founderLimit = isDomestic ? 100 : 100

  const isFounder = tier.id === "founder_lifetime"
  const isYearly = tier.id === "premium_yearly"
  const isFree = tier.id === "free"
  const isReport = tier.id === "full_report"

  // Founder uses special dark gold theme
  if (isFounder) {
    return (
      <div className="relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(201,168,76,0.2)]">
        {/* Dark gold gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1510] via-[#0d0b08] to-[#1a1510] border border-gold/30 rounded-2xl" />

        {/* Gold shimmer top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="relative p-6 flex flex-col h-full">
          {/* Badge */}
          <div className="flex items-center justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 bg-gold/20 text-gold text-xs font-bold px-4 py-1.5 rounded-full border border-gold/30">
              <Crown size={12} />
              {tier.badge} · {isDomestic ? "国内" : "海外"}
            </span>
          </div>

          {/* Header */}
          <div className="text-center mb-5">
            <h3 className="text-2xl font-serif font-bold text-gold mb-1">{tier.name}</h3>
            <p className="text-gold/50 text-sm">{tier.subtitle}</p>
          </div>

          {/* Stardust emphasis */}
          <div className="flex items-center justify-center gap-2 mb-4 py-3 px-4 rounded-xl bg-gold/10 border border-gold/20">
            <Zap size={18} className="text-gold" />
            <div className="text-center">
              <span className="text-gold/70 text-sm">每月注入</span>
              <span className="text-2xl font-bold text-gold mx-1">500</span>
              <span className="text-gold/70 text-sm">星尘</span>
            </div>
          </div>

          {/* Price */}
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-gold">{priceDisplay}</span>
            </div>
            {tier.billingLabel && (
              <p className="text-gold/40 text-xs mt-1">{tier.billingLabel}</p>
            )}
          </div>

          {/* Seat progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gold/50 mb-2">
              <span>席位进度</span>
              <span>{founderSoldPercent > 0 ? `${founderSoldPercent}% 已售` : "加载中…"}</span>
            </div>
            <div className="w-full h-2 bg-gold/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all duration-500"
                style={{ width: `${founderSoldPercent}%` }}
              />
            </div>
            <p className="text-gold/60 text-xs mt-2 text-center">
              仅剩 {founderRemaining ?? founderLimit} 席
            </p>
          </div>

          {/* Features */}
          <ul className="flex-1 space-y-3 mb-6">
            {tier.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gold/70">
                <Check size={14} className="text-gold mt-0.5 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={() => onSelect?.(tier.id)}
            className="mt-auto w-full py-3.5 rounded-full font-bold text-lg transition-all duration-300
                       bg-gradient-to-r from-gold to-[#E8CB7A] text-[#1A0F2E]
                       hover:shadow-[0_0_30px_rgba(201,168,76,0.5)] hover:scale-[1.02]
                       active:scale-[0.98]"
          >
            {tier.cta}
          </button>
        </div>
      </div>
    )
  }

  // Standard card layout
  return (
    <div className={`relative flex flex-col h-full rounded-2xl transition-all duration-300 hover:-translate-y-2
      ${isYearly
        ? "border-2 border-transparent bg-gradient-to-b from-[#1a1510] to-ink shadow-[0_0_30px_rgba(201,168,76,0.15)]"
        : "bg-white/5 border border-white/10 hover:border-gold/30 hover:shadow-[0_0_20px_rgba(201,168,76,0.1)]"
      }`}
    >
      {/* Yearly gradient border effect */}
      {isYearly && (
        <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-b from-gold/40 via-gold/20 to-transparent pointer-events-none">
          <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#1a1510] to-ink" />
        </div>
      )}

      <div className="relative p-6 flex flex-col h-full">
        {/* Badge */}
        {tier.badge && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap
              ${isYearly
                ? "bg-gold text-ink"
                : isReport && isNewUser
                  ? "bg-gradient-to-r from-gold to-[#E8CB7A] text-ink"
                  : "bg-white/10 text-white/70 border border-white/20"
              }`}
            >
              {isYearly && <Sparkles size={12} />}
              {tier.badge}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-5 pt-2">
          <h3 className={`text-xl font-serif font-bold ${isYearly ? "text-gold" : "text-white"}`}>
            {tier.name}
          </h3>
          <p className="text-white/40 text-sm mt-1">{tier.subtitle}</p>
        </div>

        {/* Stardust highlight — cost */}
        {tier.stardust && (
          <div className="flex items-center justify-center gap-2 mb-4 py-3 px-4 rounded-xl bg-gold/5 border border-gold/10">
            <Zap size={18} className="text-gold" />
            <div className="text-center">
              <span className="text-2xl font-bold text-gold">{tier.stardust}</span>
              <span className="text-gold/70 text-sm ml-1">星尘</span>
            </div>
          </div>
        )}

        {/* Stardust grant for subscriptions */}
        {tier.stardustGrant && (
          <div className="flex items-center justify-center gap-2 mb-4 py-3 px-4 rounded-xl bg-gold/5 border border-gold/10">
            <Sparkles size={18} className="text-gold" />
            <div className="text-center">
              <span className="text-gold/70 text-sm">每月注入</span>
              <span className="text-2xl font-bold text-gold mx-1">{tier.stardustGrant}</span>
              <span className="text-gold/70 text-sm">星尘</span>
            </div>
          </div>
        )}

        {/* Stardust discount badge for yearly */}
        {tier.stardustDiscount && tier.stardustDiscount < 1 && (
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1 text-xs text-gold bg-gold/10 px-2 py-1 rounded-full">
              <Zap size={10} />
              星尘消耗 {Math.round(tier.stardustDiscount * 100)} 折
            </span>
          </div>
        )}

        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className={`text-3xl font-bold ${isYearly ? "text-gold" : "text-white"}`}>
              {priceDisplay}
            </span>
          </div>
          {originalPrice && (
            <span className="text-white/25 text-sm line-through">
              {isDomestic ? `¥${originalPrice}` : `$${originalPrice}`}
            </span>
          )}
          {tier.billingLabel && (
            <p className="text-white/30 text-xs mt-1">{tier.billingLabel}</p>
          )}
        </div>

        {/* Features */}
        <ul className="flex-1 space-y-2.5 mb-6">
          {tier.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
              <Check size={14} className={`mt-0.5 flex-shrink-0 ${isYearly ? "text-gold" : "text-white/40"}`} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={() => onSelect?.(tier.id)}
          className={`mt-auto w-full py-3 rounded-full font-semibold text-sm transition-all duration-300
            ${isYearly
              ? "bg-gold text-ink hover:shadow-[0_0_20px_rgba(201,168,76,0.5)]"
              : isFree
                ? "border border-gold/40 text-gold hover:bg-gold/10"
                : "border border-white/20 text-white/60 hover:border-gold/40 hover:text-gold"
            }`}
        >
          {tier.cta}
        </button>
      </div>
    </div>
  )
}
