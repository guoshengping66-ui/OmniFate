"use client"
import { useEffect, useState } from "react"
import { Sparkles, Check, Zap } from "lucide-react"
import type { Product } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { getProductPrice } from "@/lib/regionPrice"
import { ProductImage } from "@/components/shop/ProductImage"
import toast from "react-hot-toast"

const RANK_COLORS = ["#C9A84C", "#A78BFA", "#60A5FA"]

export function AIRecommendHero({ products, mode }: { products: Product[]; mode?: "personalized" | "curated" }) {
  const { addItem } = useCart()
  const { t } = useLanguage()
  const { region } = useRegion()
  const [revealed, setRevealed] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  const RANK_LABELS = [t("shop.ai.bestMatch"), t("shop.ai.strongRec"), t("shop.ai.worthIt")]

  const top3 = products.slice(0, 3)

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 400)
    return () => clearTimeout(timer)
  }, [])

  if (top3.length === 0) return null

  const handleAdd = (product: Product) => {
    addItem(product)
    setAddedIds(prev => new Set(prev).add(product.id))
    toast.success(t("shop.addedToCart").replace("{name}", product.name))
  }

  return (
    <div className="grid md:grid-cols-3 gap-5">
      {top3.map((product, i) => (
        <div
          key={product.id}
          className={revealed ? "anim-slide-up" : "opacity-0"}
          style={revealed ? { animationDelay: `${i * 0.15}s` } : undefined}
        >
          <div className="treasure-card p-5 relative group">
            {/* Rank badge */}
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{
                  background: `${RANK_COLORS[i]}10`,
                  border: `1px solid ${RANK_COLORS[i]}30`,
                  color: RANK_COLORS[i],
                }}
              >
                <span className="text-sm">#{i + 1}</span>
                {RANK_LABELS[i]}
              </div>
              {product.match_score != null && (
                <div className="flex items-center gap-1 text-xs text-gold/50">
                  <Sparkles size={10} className="fill-gold/20" />
                  {product.match_score.toFixed(1)}
                </div>
              )}
            </div>

            {/* Image + Info */}
            <div className="flex items-start gap-3 mb-4">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                category={product.category}
                size="sm"
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-white/90 text-base mb-1 truncate">{product.name}</h3>
                <p className="text-gold/80 font-bold text-lg">{getProductPrice(product, region).symbol}{getProductPrice(product, region).price.toFixed(0)}</p>
              </div>
            </div>

            {product.recommendation_text && (
              <p className="text-white/30 text-xs leading-relaxed mb-3 line-clamp-2 italic border-l-2 border-gold/15 pl-2">
                &ldquo;{product.recommendation_text}&rdquo;
              </p>
            )}

            {product.match_reasons && product.match_reasons.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-4">
                {product.match_reasons.slice(0, 3).map(r => (
                  <span
                    key={r}
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${RANK_COLORS[i]}08`,
                      color: `${RANK_COLORS[i]}aa`,
                      border: `1px solid ${RANK_COLORS[i]}15`,
                    }}
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => handleAdd(product)}
              disabled={addedIds.has(product.id)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                addedIds.has(product.id)
                  ? "bg-green-500/12 border border-green-500/25 text-green-400"
                  : "bg-gold/8 border border-gold/20 text-gold/80 hover:bg-gold/12 hover:shadow-[0_0_20px_rgba(201,168,76,0.1)]"
              }`}
            >
              {addedIds.has(product.id) ? (
                <><Check size={14} /> {t("treasureHall.collected")}</>
              ) : (
                <><Zap size={14} /> {t("treasureHall.collect")}</>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
