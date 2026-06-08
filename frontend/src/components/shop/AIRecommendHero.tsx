"use client"
import { useEffect, useState } from "react"
import { Sparkles, ShoppingCart, Check, Zap } from "lucide-react"
import type { Product } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { getProductPrice } from "@/lib/regionPrice"
import { ProductImage } from "@/components/shop/ProductImage"
import toast from "react-hot-toast"

const RANK_COLORS = ["#C9A84C", "#A78BFA", "#60A5FA"]

export function AIRecommendHero({ products }: { products: Product[] }) {
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
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6 anim-slide-up">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/25">
          <Zap size={14} className="text-gold" />
          <span className="text-gold text-xs font-semibold tracking-wide">{t("shop.ai.selected")}</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {top3.map((product, i) => (
          <div
            key={product.id}
            className={revealed ? "anim-slide-up" : "opacity-0"}
            style={revealed ? { animationDelay: `${i * 0.15}s` } : undefined}
          >
            <div className="relative group rounded-2xl overflow-hidden border border-white/10 hover:border-gold/40 transition-all duration-500">
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  padding: "1.5px",
                  background: `conic-gradient(from var(--angle,0deg), transparent 0%, ${RANK_COLORS[i]}66 50%, transparent 100%)`,
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  animation: "glow-rotate 5s linear infinite",
                }}
              />

              <div
                className="absolute inset-0 rounded-2xl pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${RANK_COLORS[i]}20, transparent 70%)`,
                }}
              />

              <div className="relative bg-gradient-to-b from-[#1a1430]/95 to-[#140f24]/95 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{
                      background: `${RANK_COLORS[i]}15`,
                      border: `1px solid ${RANK_COLORS[i]}40`,
                      color: RANK_COLORS[i],
                    }}
                  >
                    <span className="text-sm">#{i + 1}</span>
                    {RANK_LABELS[i]}
                  </div>
                  {product.match_score != null && (
                    <div className="flex items-center gap-1 text-xs text-gold/70">
                      <Sparkles size={10} className="fill-gold/30" />
                      {product.match_score.toFixed(1)}
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <ProductImage
                    src={product.image_url}
                    alt={product.name}
                    category={product.category}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-white text-base mb-1 truncate">{product.name}</h3>
                    <p className="text-gold font-bold text-lg">{getProductPrice(product, region).symbol}{getProductPrice(product, region).price.toFixed(0)}</p>
                  </div>
                </div>

                {product.recommendation_text && (
                  <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2 italic border-l-2 border-gold/20 pl-2">
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
                          background: `${RANK_COLORS[i]}10`,
                          color: `${RANK_COLORS[i]}cc`,
                          border: `1px solid ${RANK_COLORS[i]}20`,
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
                      ? "bg-green-500/15 border border-green-500/30 text-green-400"
                      : "bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 hover:shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                  }`}
                >
                  {addedIds.has(product.id) ? (
                    <><Check size={14} /> {t("shop.added")}</>
                  ) : (
                    <><ShoppingCart size={14} /> {t("shop.ai.addToCart2")}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
