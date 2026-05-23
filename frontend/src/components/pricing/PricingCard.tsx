"use client"
import { Check, Sparkles, Zap, Crown, Lock } from "lucide-react"
import { type PricingTier, type Region } from "@/lib/tiers"
import { useLanguage } from "@/contexts/LanguageContext"

interface PricingCardProps {
  tier: PricingTier
  region: Region
  founderSoldPercent?: number
  isNewUser?: boolean
  isFounderCard?: boolean
  onSelect?: (id: string) => void
  locale?: string
}

export function PricingCard({
  tier,
  region,
  founderSoldPercent = 67,
  isNewUser = false,
  isFounderCard = false,
  onSelect,
}: PricingCardProps) {
  const { t } = useLanguage()
  const isDomestic = region === "domestic"

  const resolveFeatures = (): string[] => {
    const result: string[] = []
    for (let i = 0; i < 10; i++) {
      const key = `tier.${tier.id}.feat${i}`
      const val = t(key)
      if (val !== key) result.push(val)
      else break
    }
    return result
  }
  const tierT = {
    name: t(`tier.${tier.id}.name`),
    subtitle: t(`tier.${tier.id}.subtitle`),
    features: resolveFeatures(),
    cta: t(`tier.${tier.id}.cta`),
    badge: tier.badge ? t(`tier.${tier.id}.badge`) : undefined,
    billingLabel: tier.billingLabel ? t(`tier.${tier.id}.billing`) : undefined,
  }
  const priceDisplay = isDomestic ? tier.priceDisplay : tier.priceDisplayUsd
  const originalPrice = isDomestic ? tier.originalPriceCny : tier.originalPriceUsd
  const isYearly = tier.id === "premium_yearly"
  const isFree = tier.id === "free"
  const isReport = tier.id === "full_report"
  const founderLimit = 100

  if (isFounderCard) {
    const remaining = founderLimit - Math.ceil((founderSoldPercent / 100) * founderLimit)
    return (
      <div className="relative overflow-hidden rounded-2xl anim-slide-up">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1510] via-[#0d0b08] to-[#1a1510]" />
        <div className="absolute inset-0 border border-gold/25 rounded-2xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-gold/40 via-transparent to-gold/40" />
        <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-gold/40 via-transparent to-gold/40" />

        <div className="relative flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
                <Crown size={18} className="text-gold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-serif font-bold text-gold">{t("pricingCard.founderTitle")}</h3>
                  <span className="relative inline-flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                  </span>
                </div>
                <p className="text-gold/50 text-sm">{t("pricingCard.founderSubtitle")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4 py-3 px-4 rounded-xl bg-gold/8 border border-gold/15 w-fit">
              <Zap size={16} className="text-gold" />
              <span className="text-gold/70 text-sm">{t("pricingCard.monthlyInject")}</span>
              <span className="text-lg font-bold text-gold">500</span>
              <span className="text-gold/70 text-sm">{t("pricingCard.stardustUnit")}</span>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-gold">{isDomestic ? "¥1,288" : "$399"}</span>
              <span className="text-gold/40 text-sm">{t("pricingCard.onceLifetime")}</span>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(tierT.features.length > 0 ? tierT.features : tier.features).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gold/65">
                  <Check size={14} className="text-gold/50 mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center gap-5 lg:w-64 flex-shrink-0">
            <div className="w-full">
              <div className="flex justify-between text-xs text-gold/50 mb-2">
                <span>{t("pricingCard.seatProgress")}</span>
                <span className="text-gold font-semibold">{founderSoldPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-gold/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold/50 to-gold rounded-full anim-progress-fill"
                  style={{ width: `${founderSoldPercent}%` }}
                />
              </div>
              <p className="text-gold/40 text-[11px] mt-1.5 text-center">
                {t("pricingCard.seatsRemaining").replace("{count}", String(remaining))}
              </p>
            </div>

            <button
              onClick={() => onSelect?.(tier.id)}
              className="w-full py-3.5 rounded-full font-bold text-base transition-all duration-300
                         bg-gradient-to-r from-gold to-[#E8CB7A] text-[#1A0F2E]
                         hover:shadow-[0_0_30px_rgba(201,168,76,0.5)] hover:scale-[1.02]
                         active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Lock size={16} />
              {tierT.cta || tier.cta}
            </button>

            <p className="text-gold/30 text-[10px] text-center leading-relaxed">
              {t("pricingCard.payToLock")}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl transition-all duration-300 overflow-visible anim-slide-up
        ${isYearly
          ? "border-2 border-transparent bg-gradient-to-b from-[#1a1510] to-ink shadow-[0_0_40px_rgba(201,168,76,0.15)]"
          : isReport
            ? "bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-gold/20 hover:shadow-[0_0_20px_rgba(201,168,76,0.12)]"
            : "bg-white/[0.04] border border-white/10 hover:border-gold/25 hover:shadow-[0_0_16px_rgba(201,168,76,0.08)]"
        }`}
    >
      {isYearly && (
        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-gold/50 via-gold/20 to-gold/50 pointer-events-none animate-shimmer opacity-80" />
      )}
      {isYearly && (
        <div className="absolute -inset-4 bg-gold/5 blur-2xl rounded-full pointer-events-none" />
      )}

      <div className="relative p-6 flex flex-col h-full">
        {tier.badge && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg
              ${isYearly
                ? "bg-gradient-to-r from-gold to-[#E8CB7A] text-ink"
                : isReport && isNewUser
                  ? "bg-gradient-to-r from-gold to-[#E8CB7A] text-ink"
                  : isReport
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "bg-white/10 text-white/70 border border-white/20"
              }`}
            >
              {isYearly && <Sparkles size={11} />}
              {tierT.badge || tier.badge}
            </span>
          </div>
        )}

        <div className="text-center mb-4 pt-2">
          <h3 className={`text-xl font-serif font-bold ${isYearly ? "text-gold" : "text-white"}`}>
            {tierT.name}
          </h3>
          <p className="text-white/35 text-xs mt-1">{tierT.subtitle || tier.subtitle}</p>
        </div>

        {tier.stardustGrant && (
          <div className={`flex items-center justify-center gap-2 mb-4 py-3 px-4 rounded-xl border
            ${isYearly ? "bg-gold/8 border-gold/20" : "bg-gold/5 border-gold/10"}`}>
            <Sparkles size={16} className="text-gold" />
            <div className="text-center">
              <span className="text-gold/60 text-xs">{t("pricingCard.monthlyInject")}</span>
              <span className="text-xl font-bold text-gold mx-1">{tier.stardustGrant}</span>
              <span className="text-gold/60 text-xs">{t("pricingCard.stardustUnit")}</span>
            </div>
          </div>
        )}

        {tier.stardust && !tier.stardustGrant && (
          <div className="flex items-center justify-center gap-2 mb-4 py-3 px-4 rounded-xl bg-gold/5 border border-gold/10">
            <Zap size={16} className="text-gold" />
            <div className="text-center">
              <span className="text-xl font-bold text-gold">{tier.stardust}</span>
              <span className="text-gold/60 text-xs ml-1">{t("pricingCard.stardustUnit")}</span>
            </div>
          </div>
        )}

        {tier.stardustDiscount !== undefined && tier.stardustDiscount < 1 && tier.stardustDiscount > 0 && (
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1 text-[11px] text-gold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/15">
              <Zap size={10} />
              {t("pricingCard.discount").replace("{discount}", String(Math.round(tier.stardustDiscount * 100)))}
            </span>
          </div>
        )}

        <div className="text-center mb-5">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className={`text-3xl font-bold ${isYearly ? "text-gold" : "text-white"}`}>
              {priceDisplay}
            </span>
          </div>
          {originalPrice && (
            <div className="mt-0.5">
              <span className="text-white/20 text-xs line-through">
                {isDomestic ? `¥${originalPrice}` : `$${originalPrice}`}
              </span>
            </div>
          )}
          {tier.billingLabel && (
            <p className="text-white/25 text-[11px] mt-1">{tierT.billingLabel || tier.billingLabel}</p>
          )}
        </div>

        <ul className="flex-1 space-y-2.5 mb-6">
          {(tierT.features.length > 0 ? tierT.features : tier.features).map((f, i) => {
            const isExclusive = isYearly && (
              f.includes("专属") || f.includes("定制") || f.includes("优先") ||
              f.toLowerCase().includes("exclusive") || f.toLowerCase().includes("custom") || f.toLowerCase().includes("priority")
            )
            return (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <Check
                  size={14}
                  className={`mt-0.5 flex-shrink-0 ${isYearly ? "text-gold/70" : isReport ? "text-gold/50" : "text-white/30"}`}
                />
                <span className={`${isYearly ? "text-white/70" : isReport ? "text-white/55" : "text-white/50"}`}>
                  {f}
                  {isExclusive && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold text-gold bg-gold/15 px-1.5 py-0.5 rounded-full align-middle">
                      {t("pricingCard.exclusive")}
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>

        <button
          onClick={() => onSelect?.(tier.id)}
          className={`mt-auto w-full py-3 rounded-full font-semibold text-sm transition-all duration-300
            ${isYearly
              ? "bg-gold text-ink hover:shadow-[0_0_24px_rgba(201,168,76,0.5)] hover:scale-[1.02]"
              : isReport
                ? "bg-gradient-to-r from-gold to-[#E8CB7A] text-ink hover:shadow-[0_0_20px_rgba(201,168,76,0.4)]"
                : isFree
                  ? "border border-gold/30 text-gold hover:bg-gold/8"
                  : "border border-white/15 text-white/55 hover:border-gold/30 hover:text-gold"
            }
            active:scale-[0.97]`}
        >
          {tierT.cta}
        </button>
      </div>
    </div>
  )
}
