"use client"
import { Check, Crown, Sparkles } from "lucide-react"
import { TIERS, type PricingTier } from "@/lib/tiers"

function TierCard({ tier, onSelect }: { tier: PricingTier; onSelect?: (id: string) => void }) {
  return (
    <div className={`relative card-glass p-6 flex flex-col h-full transition-all duration-300
      ${tier.highlight
        ? "border-gold/50 shadow-[0_0_30px_rgba(201,168,76,0.15)] scale-[1.02]"
        : "hover:border-white/20"}`}
    >
      {/* Highlight badge */}
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-ink text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
          {tier.badge}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-5">
        <h3 className="text-xl font-serif font-bold text-gold">{tier.name}</h3>
        <p className="text-white/50 text-xs mt-1">{tier.subtitle}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold text-white">{tier.priceDisplay}</span>
        </div>
        {tier.originalPriceCny && (
          <span className="text-white/25 text-sm line-through">¥{tier.originalPriceCny}</span>
        )}
        {tier.billingLabel && (
          <p className="text-white/30 text-[11px] mt-1">{tier.billingLabel}</p>
        )}
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-2.5 mb-6">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/70">
            <Check size={14} className="text-gold mt-0.5 flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onSelect?.(tier.id)}
        className={`mt-auto w-full py-3 rounded-full font-semibold text-sm transition-all duration-300
          ${tier.highlight
            ? "btn-gold"
            : tier.priceCny === 0
              ? "border border-gold/40 text-gold hover:bg-gold/10 rounded-full"
              : "border border-white/20 text-white/60 hover:border-gold/40 hover:text-gold rounded-full"}`}
      >
        {tier.cta}
      </button>
    </div>
  )
}

export function TierComparison({ onSelect }: { onSelect?: (tierId: string) => void }) {
  // Show: free, full_report, premium_monthly, premium_yearly (event retro is separate page)
  const displayTiers = TIERS.filter(t => t.id !== "event_retro" && t.id !== "founder_lifetime")
  const founderTier = TIERS.find(t => t.id === "founder_lifetime")

  return (
    <div>
      <div className="text-center mb-10">
        <Crown className="text-gold mx-auto mb-3" size={32} />
        <h2 className="section-title text-2xl md:text-3xl">选择适合你的命理方案</h2>
        <p className="text-white/40 text-sm mt-2">
          从免费入门到全维度守护，每一步都值得
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {displayTiers.map(tier => (
          <TierCard key={tier.id} tier={tier} onSelect={onSelect} />
        ))}
      </div>

      {/* Founder tier highlight */}
      {founderTier && (
        <div className="mt-6">
          <div className="relative card-glass p-6 border-gold/40 bg-gradient-to-r from-gold/5 to-transparent">
            {founderTier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-ink text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                {founderTier.badge}
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-serif font-bold text-gold">{founderTier.name}</h3>
                <p className="text-white/50 text-sm mt-1">{founderTier.subtitle}</p>
                <p className="text-white/30 text-xs mt-2">{founderTier.billingLabel}</p>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-white">{founderTier.priceDisplay}</span>
              </div>
              <button
                onClick={() => onSelect?.("founder_lifetime")}
                className="btn-gold whitespace-nowrap"
              >
                {founderTier.cta}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event retro callout */}
      <div className="mt-8 card-glass p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <Sparkles size={24} className="text-gold/60 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-white/80 font-medium">事件复盘 · 按次计费</p>
          <p className="text-white/40 text-sm">¥19.9/次 — 针对特定事件的流时溯源诊断，含 AI 因果链分析和能量处方</p>
        </div>
        <button
          onClick={() => onSelect?.("event_retro")}
          className="btn-gold-outline text-sm whitespace-nowrap"
        >
          了解事件复盘
        </button>
      </div>
    </div>
  )
}
