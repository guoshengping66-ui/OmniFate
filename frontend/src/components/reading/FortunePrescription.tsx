"use client"
import { useState } from "react"
import { ShoppingBag, CheckCircle, Sparkles, ArrowRight, TrendingUp } from "lucide-react"
import { Link } from "@/i18n/navigation"
import type { Product } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { getProductPrice } from "@/lib/regionPrice"
import { getProductPurchaseActions } from "@/lib/productPurchase"
import { ProductImage } from "@/components/shop/ProductImage"
import { useRouter } from "next/navigation"

interface FortunePrescriptionProps {
  products: Product[]
  weakestLabel?: string
  strongestLabel?: string
  reportAction?: string
  reportWatchFor?: string
}

/**
 * 优化处方 — A prominent, immersive product recommendation card
 * shown after analysis completes. Combines the reading insight
 * with personalized product recommendations.
 */
export function FortunePrescription({ products, weakestLabel, strongestLabel, reportAction, reportWatchFor }: FortunePrescriptionProps) {
  const { t, locale, localeHref } = useLanguage()
  const { addItem } = useCart()
  const { region } = useRegion()
  const router = useRouter()
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  if (!products || products.length === 0) return null

  // Skip recommendation_text if it's Chinese but user is in English mode
  const hasChinese = (s: string) => /[一-鿿]/.test(s)
  const isEn = locale === "en"
  const reportReasonFor = (product: Product) => {
    const reason = product.recommendation_text || product.match_reasons?.[0] || ""
    return isEn && hasChinese(reason) ? "" : reason
  }
  const rankedProducts = products.filter(product => Boolean(reportReasonFor(product)))
  const primaryProduct = rankedProducts[0]
  const alternativeProduct = rankedProducts.find(product => product.id !== primaryProduct?.id)
  const visibleProducts = [primaryProduct, alternativeProduct].filter((product): product is Product => Boolean(product))
  const reportContext = reportWatchFor || reportAction
  const outcomeBoundary = isEn
    ? "Not a guaranteed outcome. This is a practical tool for the action in your report, not a promise of a result."
    : t("prescription.boundary")
  const purchaseActions = getProductPurchaseActions(locale)

  const handleAdd = (product: Product) => {
    addItem(product)
    setAddedIds(prev => new Set(prev).add(product.id))
    setTimeout(() => setAddedIds(prev => {
      const next = new Set(prev)
      next.delete(product.id)
      return next
    }), 2000)
  }

  const handleAddAndCheckout = (product: Product) => {
    addItem(product)
    router.push(localeHref("/checkout"))
  }

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Background gradient — traditional medicine scroll feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, #1e1a14 0%, #2a2418 30%, #1f1b13 60%, #251f16 100%)",
        }}
      />

      {/* Animated border */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          padding: "1px",
          background: "conic-gradient(from var(--angle,0deg), transparent 20%, rgba(201,168,76,0.5) 50%, transparent 80%)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          animation: "prescription-spin 6s linear infinite",
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(201,168,76,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center">
            <span className="text-xl">⚕</span>
          </div>
          <div>
            <h3 className="font-serif text-lg md:text-xl font-bold text-gold">
              {t("reading.master.prescription")}
            </h3>
            <p className="text-white/30 text-xs">
              {t("reading.master.prescriptionDesc")}
            </p>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] px-2 py-0.5 bg-gold/15 border border-gold/25 rounded-full text-gold/70 animate-pulse">
              {t("prescription.primary")}
            </span>
          </div>
        </div>

        {/* Diagnosis strip */}
        <div className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-[#030918] rounded-xl border border-white/[0.06]">
          <TrendingUp size={14} className="text-gold/60 flex-shrink-0" />
          <p className="text-white/50 text-xs leading-relaxed">
            {reportContext ? (
              <>
                <span className="text-white/30">{isEn ? "Report focus" : "报告行动重点"}</span>{" "}
                <span className="text-gold font-semibold">{reportContext}</span>
              </>
            ) : weakestLabel ? (
              <>
                <span className="text-white/30">{t("freeBanner.weakEnergy")}</span>{" "}
                <span className="text-gold font-semibold">{weakestLabel}</span>
                {strongestLabel && (
                  <>
                    {" · "}
                    <span className="text-white/30">{t("freeBanner.strongDimension")}</span>{" "}
                    <span className="text-green-400/80 font-semibold">{strongestLabel}</span>
                  </>
                )}
              </>
            ) : null}
          </p>
        </div>

        {/* Product list — compact horizontal layout */}
        {visibleProducts.length > 0 ? (
          <div className="space-y-3">
            {visibleProducts.map((product, i) => {
            const isAdded = addedIds.has(product.id)
            const isPrimary = i === 0
            const isHot = (product.sales_count || 0) >= 500
            const reportReason = reportReasonFor(product)
            const formattedSales = product.sales_count
              ? product.sales_count >= 1000
                ? `${(product.sales_count / 1000).toFixed(1)}k+`
                : `${product.sales_count}+`
              : null

            return (
              <div
                key={product.id}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                  isPrimary
                    ? "bg-gold/[0.06] border border-gold/20"
                    : "bg-white/[0.02] border border-white/[0.06] hover:border-gold/15"
                }`}
              >
                {/* Product image */}
                <div className="relative flex-shrink-0">
                  <ProductImage
                    src={product.image_url}
                    alt={product.name}
                    category={product.category}
                    size="sm"
                  />
                  {isHot && (
                    <span className="absolute -top-1 -right-1 text-[8px] px-1 py-0.5 bg-red-500/80 text-white rounded-full font-medium">
                      {t("prescription.hot") || "热"}
                    </span>
                  )}
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {isPrimary && (
                      <Sparkles size={10} className="text-gold fill-gold/30 flex-shrink-0" />
                    )}
                    <h4 className="font-medium text-white text-sm truncate">{isEn ? (product.name_en || product.name) : product.name}</h4>
                    {formattedSales && (
                      <span className="text-[9px] text-white/25 flex-shrink-0">
                        {formattedSales} {t("prescription.sold") || "已售"}
                      </span>
                    )}
                  </div>
                  {reportReason && (
                    <p className="text-white/35 text-[11px] leading-relaxed line-clamp-1 italic">
                      {isEn ? "Why it fits: " : "对应报告："}&ldquo;{reportReason}&rdquo;
                    </p>
                  )}
                  {product.match_reasons && product.match_reasons.length > 0 && !(isEn && product.match_reasons.some(hasChinese)) && (
                    <div className="flex gap-1 mt-1">
                      {product.match_reasons.slice(0, 2).map(r => (
                        <span key={r} className="text-[9px] px-1.5 py-0.5 bg-gold/8 text-gold/50 rounded-full">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price + CTA */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-gold font-bold text-sm">{getProductPrice(product, region).symbol}{getProductPrice(product, region).price.toFixed(0)}</span>
                  <button
                    onClick={() => isPrimary ? handleAddAndCheckout(product) : handleAdd(product)}
                    disabled={isAdded}
                    className={`flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full transition-all duration-300 ${
                      isAdded
                        ? "bg-green-500/20 border border-green-500/40 text-green-400"
                        : isPrimary
                          ? "bg-gold/15 border border-gold/30 text-gold hover:bg-gold/25"
                          : "bg-white/[0.04] border border-white/[0.1] text-white/60 hover:border-gold/30 hover:text-gold"
                    }`}
                  >
                    {isAdded ? (
                      <><CheckCircle size={11} /> {t("prescription.claimed")}</>
                    ) : isPrimary ? (
                      <><ShoppingBag size={11} /> {purchaseActions.primary.label}</>
                    ) : (
                      <><ShoppingBag size={11} /> {purchaseActions.secondary.label}</>
                    )}
                  </button>
                </div>
              </div>
            )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-5 text-center">
            <p className="text-sm text-white/70">
              {isEn
                ? "There is not enough report evidence to make a personalized product recommendation yet."
                : "当前没有足够的报告依据给出个性化商品推荐。"}
            </p>
            <Link href="/shop" className="mt-3 inline-flex items-center gap-1 text-xs text-gold hover:text-gold/80">
              {isEn ? "Browse the shop" : "前往商城按需选择"} <ArrowRight size={12} />
            </Link>
          </div>
        )}

        {/* View all CTA */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <p className="max-w-md text-white/35 text-[10px] leading-relaxed">
            {outcomeBoundary}
          </p>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-gold/50 text-xs hover:text-gold transition-colors group"
          >
            {t("curated.viewAll")}
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes prescription-spin {
          to { --angle: 360deg; }
        }
      `}</style>
    </div>
  )
}
