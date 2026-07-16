"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ShoppingBag, Sparkles } from "lucide-react"
import { Link } from "@/i18n/navigation"
import type { Product } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { getProductPrice } from "@/lib/regionPrice"
import { ProductImage } from "@/components/shop/ProductImage"
import { getShopActionCopy, getShopShelfProducts } from "@/lib/shopConversion"
import { safeLocalizedText } from "@/lib/treasureHall"
import toast from "react-hot-toast"

const RANK_COLORS = ["#C9A84C", "#A78BFA", "#60A5FA"]

type RecommendationMode = "personalized" | "curated"

export function AIRecommendHero({
  products,
  mode = "personalized",
}: {
  products: Product[]
  mode?: RecommendationMode
}) {
  const { addItem } = useCart()
  const { t, locale } = useLanguage()
  const { region } = useRegion()
  const [revealed, setRevealed] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const actionCopy = useMemo(() => getShopActionCopy(locale), [locale])
  const isPersonalized = mode === "personalized"
  const rankLabels = [t("shop.ai.bestMatch"), t("shop.ai.strongRec"), t("shop.ai.worthIt")]
  const top3 = getShopShelfProducts(products)

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 400)
    return () => clearTimeout(timer)
  }, [])

  if (top3.length === 0) return null

  const handleAdd = (product: Product, productName: string) => {
    addItem(product)
    setAddedIds(prev => new Set(prev).add(product.id))
    toast.success(t("shop.addedToCart").replace("{name}", productName))
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {top3.map((product, index) => {
        const color = RANK_COLORS[index]
        const productName = safeLocalizedText(locale === "en" ? product.name_en : product.name, product.name) || product.name
        const productPitch = safeLocalizedText(locale === "en" ? product.short_pitch_en : product.short_pitch, product.short_pitch)
        const price = getProductPrice(product, region)
        const isAdded = addedIds.has(product.id)

        return (
          <article
            key={product.id}
            className={revealed ? "anim-slide-up" : "opacity-0"}
            style={revealed ? { animationDelay: `${index * 0.15}s` } : undefined}
          >
            <div className="treasure-card group relative h-full p-5">
              <div className="mb-4 flex items-center justify-between">
                <div
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{
                    background: `${color}10`,
                    border: `1px solid ${color}30`,
                    color,
                  }}
                >
                  {isPersonalized ? <span className="text-sm">#{index + 1}</span> : <Sparkles size={11} />}
                  {isPersonalized ? rankLabels[index] : (locale === "zh" ? "\u72b6\u6001\u7cbe\u9009" : "Curated pick")}
                </div>
                {isPersonalized && product.match_score != null && (
                  <div className="flex items-center gap-1 text-xs text-gold/50">
                    <Sparkles size={10} className="fill-gold/20" />
                    {product.match_score.toFixed(1)}
                  </div>
                )}
              </div>

              <Link href={`/shop/${product.id}`} className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70">
                <div className="mb-4 flex items-start gap-3">
                  <ProductImage
                    src={product.image_url}
                    alt={productName}
                    category={product.category}
                    size="sm"
                    className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 truncate font-serif text-base font-bold text-white/90">{productName}</h3>
                    <p className="text-lg font-bold text-gold/80">{price.symbol}{price.price.toFixed(0)}</p>
                  </div>
                </div>

                {(isPersonalized ? product.recommendation_text : productPitch) && (
                  <p className="mb-3 line-clamp-2 border-l-2 border-gold/15 pl-2 text-xs italic leading-relaxed text-white/30">
                    &ldquo;{isPersonalized ? product.recommendation_text : productPitch}&rdquo;
                  </p>
                )}

                {isPersonalized && product.match_reasons && product.match_reasons.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {product.match_reasons.slice(0, 3).map(reason => (
                      <span
                        key={reason}
                        className="rounded-full px-1.5 py-0.5 text-[10px]"
                        style={{
                          background: `${color}08`,
                          color: `${color}aa`,
                          border: `1px solid ${color}15`,
                        }}
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </Link>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                <Link href={`/shop/${product.id}`} className="text-xs text-white/40 transition-colors hover:text-gold/80">
                  {actionCopy.viewDetails}
                </Link>
                <button
                  type="button"
                  onClick={() => handleAdd(product, productName)}
                  disabled={isAdded}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-300 ${
                    isAdded
                      ? "border border-green-500/25 bg-green-500/12 text-green-400"
                      : "border border-gold/20 bg-gold/8 text-gold/80 hover:bg-gold/12 hover:shadow-[0_0_20px_rgba(201,168,76,0.1)]"
                  }`}
                >
                  {isAdded ? <Check size={14} /> : <ShoppingBag size={14} />}
                  {isAdded ? actionCopy.addedToBag : actionCopy.addToBag}
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
