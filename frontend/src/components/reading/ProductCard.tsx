import { useState, useEffect, memo, useCallback, useMemo } from "react"
import { Star, ShoppingBag, Check, Zap } from "lucide-react"
import { Link } from "@/i18n/navigation"
import type { Product } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { getProductPrice } from "@/lib/regionPrice"
import { ProductImage } from "@/components/shop/ProductImage"
import toast from "react-hot-toast"
import { getMatchTier, getNeedTags, isMojibakeText, safeLocalizedText } from "@/lib/treasureHall"
import { getShopActionCopy } from "@/lib/shopConversion"

function getGlowClass(score?: number): string {
  if (score == null) return ""
  if (score >= 10) return "border-gold/40 shadow-[0_0_40px_rgba(201,168,76,0.15)]"
  if (score >= 7) return "border-gold/25 shadow-[0_0_25px_rgba(201,168,76,0.1)]"
  if (score >= 4) return "border-gold/15"
  return ""
}

function getMatchPercentage(score?: number): number {
  if (score == null || score <= 0) return 0
  return Math.min(100, Math.round((score / 12) * 100))
}

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { region } = useRegion()
  const { t, locale } = useLanguage()
  const [added, setAdded] = useState(false)
  const hasMatch = product.match_score != null && product.match_score > 0
  const isEn = locale === "en"
  const productName = safeLocalizedText(isEn ? product.name_en : product.name, product.name) || product.name
  const shortPitch = safeLocalizedText(isEn ? product.short_pitch_en : product.short_pitch, product.short_pitch)
  const recommendationText = safeLocalizedText(product.recommendation_text, "")
  const needTags = useMemo(() => getNeedTags(product, locale), [product, locale])
  const matchTier = useMemo(() => getMatchTier(product.match_score, locale), [product.match_score, locale])
  const matchReasons = useMemo(() => (product.match_reasons || []).filter(r => !isMojibakeText(r)).slice(0, 2), [product.match_reasons])
  const glowClass = useMemo(() => getGlowClass(product.match_score), [product.match_score])
  const matchPct = useMemo(() => getMatchPercentage(product.match_score), [product.match_score])
  const actionCopy = useMemo(() => getShopActionCopy(locale), [locale])

  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 1500)
    return () => clearTimeout(timer)
  }, [added])

  const handleAddToCart = useCallback(() => {
    addItem(product)
    setAdded(true)
    toast.success(t("shop.addedToCart").replace("{name}", productName))
  }, [addItem, product, productName, t])

  return (
    <article className={`treasure-card group relative rounded-xl p-5 transition-all duration-300 hover:scale-[1.01] ${glowClass}`}>
      {hasMatch && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold/80">
          <Zap size={9} className="fill-gold/40" />
          {matchTier}
        </div>
      )}

      <Link href={`/shop/${product.id}`} className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70">
        <div className="mb-4 flex justify-center py-3">
          <ProductImage
            src={product.image_url}
            alt={productName}
            category={product.category}
            size="md"
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="relative z-10">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="font-serif text-sm font-medium leading-tight text-white/90">{productName}</h3>
          {product.rating && (
            <div className="flex flex-shrink-0 items-center gap-0.5">
              <Star size={11} className="fill-gold/60 text-gold/60" />
              <span className="text-xs text-gold/60">{product.rating}</span>
            </div>
          )}
        </div>

        {hasMatch && matchPct > 0 && (
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold/40 to-gold/70 transition-all duration-700"
                style={{ width: `${matchPct}%` }}
              />
            </div>
            <span className="text-[10px] font-medium tabular-nums text-gold/50">{matchPct}%</span>
          </div>
        )}

        {shortPitch && (
          <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-white/35">
            {shortPitch}
          </p>
        )}

        {recommendationText && (
          <p className="mb-2 border-l-2 border-gold/15 pl-2 text-xs italic leading-relaxed text-gold/50">
            &ldquo;{recommendationText}&rdquo;
          </p>
        )}

        {matchReasons.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {matchReasons.map(reason => (
              <span key={reason} className="rounded-full bg-gold/8 px-1.5 py-0.5 text-[10px] text-gold/50">
                {reason}
              </span>
            ))}
          </div>
        )}

        {!hasMatch && needTags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {needTags.map(tag => (
              <span key={tag} className="rounded-full bg-[#030918] px-1.5 py-0.5 text-[10px] text-white/30">
                {tag}
              </span>
            ))}
          </div>
        )}
        </div>
      </Link>

      <div className="relative z-10 mt-3 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
        {(() => {
          const pp = getProductPrice(product, region)
          return <span className="font-bold text-gold/90">{pp.symbol}{pp.price.toFixed(0)}</span>
        })()}
        <div className="flex items-center gap-3">
          <Link href={`/shop/${product.id}`} className="text-xs text-white/40 transition-colors hover:text-gold/80">
            {actionCopy.viewDetails}
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all ${
              added
                ? "border border-green-500/30 bg-green-500/15 text-green-400"
                : "border border-gold/20 bg-gold/10 text-gold/80 hover:bg-gold/15 hover:shadow-[0_0_15px_rgba(201,168,76,0.1)]"
            }`}
          >
            {added ? <Check size={12} /> : <ShoppingBag size={12} />}
            {added ? actionCopy.addedToBag : actionCopy.addToBag}
          </button>
        </div>
      </div>
    </article>
  )
})
