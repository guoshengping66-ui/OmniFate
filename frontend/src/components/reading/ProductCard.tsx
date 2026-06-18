import { useState, useEffect, memo, useCallback, useMemo } from "react"
import { Star, ShoppingBag, Sparkles, Check, Zap } from "lucide-react"
import { Link } from "@/i18n/navigation"
import type { Product } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { getProductPrice } from "@/lib/regionPrice"
import { ProductImage } from "@/components/shop/ProductImage"
import toast from "react-hot-toast"

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
  const hasChinese = (s: string) => /[一-鿿]/.test(s)
  const glowClass = useMemo(() => getGlowClass(product.match_score), [product.match_score])
  const matchPct = useMemo(() => getMatchPercentage(product.match_score), [product.match_score])

  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 1500)
    return () => clearTimeout(timer)
  }, [added])

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setAdded(true)
    toast.success(t("shop.addedToCart").replace("{name}", product.name))
  }, [addItem, product, t])

  return (
    <Link href={`/shop/${product.id}`} className={`block treasure-card p-5 ${glowClass}`}>
      {/* AI Badge */}
      {hasMatch && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-[10px] text-gold/80 font-medium">
          <Zap size={9} className="fill-gold/40" />
          {t("productCard.aiRecommended")}
        </div>
      )}

      {/* Image */}
      <div className="mb-4 flex justify-center py-3">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          category={product.category}
          size="md"
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-serif font-medium text-white/90 text-sm leading-tight">{product.name}</h3>
          {product.rating && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star size={11} className="text-gold/60 fill-gold/60" />
              <span className="text-xs text-gold/60">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Match score */}
        {hasMatch && matchPct > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold/40 to-gold/70 transition-all duration-700"
                style={{ width: `${matchPct}%` }}
              />
            </div>
            <span className="text-[10px] text-gold/50 font-medium tabular-nums">{matchPct}%</span>
          </div>
        )}

        {product.short_pitch && (
          <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-2">
            {product.short_pitch}
          </p>
        )}

        {/* Recommendation text */}
        {product.recommendation_text && !(isEn && hasChinese(product.recommendation_text)) && (
          <p className="text-gold/50 text-xs leading-relaxed italic mb-2 border-l-2 border-gold/15 pl-2">
            &ldquo;{product.recommendation_text}&rdquo;
          </p>
        )}

        {/* Match reasons */}
        {product.match_reasons && product.match_reasons.length > 0 && !(isEn && product.match_reasons.some(hasChinese)) && (
          <div className="flex gap-1 flex-wrap mb-2">
            {product.match_reasons.slice(0, 2).map(r => (
              <span key={r} className="text-[10px] px-1.5 py-0.5 bg-gold/8 text-gold/50 rounded-full">
                {r}
              </span>
            ))}
          </div>
        )}

        {/* keyword tags */}
        {!hasMatch && product.keyword_tags && (
          <div className="flex gap-1 flex-wrap mb-3">
            {product.keyword_tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/[0.03] text-white/30 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-gold/90 font-bold">{getProductPrice(product, region).symbol}{getProductPrice(product, region).price.toFixed(0)}</span>
          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all
              ${added
                ? "bg-green-500/15 border border-green-500/30 text-green-400"
                : "bg-gold/10 border border-gold/20 text-gold/80 hover:bg-gold/15 hover:shadow-[0_0_15px_rgba(201,168,76,0.1)]"}`}
          >
            {added ? <Check size={12} /> : <ShoppingBag size={12} />}
            {added ? t("treasureHall.collected") : t("treasureHall.collect")}
          </button>
        </div>
      </div>
    </Link>
  )
})
