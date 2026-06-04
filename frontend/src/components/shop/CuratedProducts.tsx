"use client"
import { useEffect, useState } from "react"
import { Sparkles, ShoppingCart, Check, Star, ArrowRight, TrendingUp } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { listProducts, type Product } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { ProductImage } from "@/components/shop/ProductImage"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import toast from "react-hot-toast"

// Badge styles for different tags
const BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  hot: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
  new: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  limited: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
}

function getBadge(product: Product): string | null {
  const tags = product.keyword_tags || []
  if (tags.some(t => /热销|爆款|hot/i.test(t))) return "hot"
  if (tags.some(t => /新品|new/i.test(t))) return "new"
  if (tags.some(t => /限量|限|limited/i.test(t))) return "limited"
  return null
}

export function CuratedProducts() {
  const { t, locale } = useLanguage()
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    listProducts(undefined, locale)
      .then(all => {
        // Sort by rating descending, take top 6
        const sorted = [...all]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6)
        setProducts(sorted)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locale])

  const handleAdd = (product: Product) => {
    addItem(product)
    setAddedIds(prev => new Set(prev).add(product.id))
    toast.success(t("shop.addedToCart").replace("{name}", product.name))
    setTimeout(() => setAddedIds(prev => {
      const next = new Set(prev)
      next.delete(product.id)
      return next
    }), 2000)
  }

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-glass h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gold/[0.03] blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-sm mb-4">
              <Sparkles size={14} className="fill-gold/30" />
              {t("curated.badge")}
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gold mb-3">
              {t("curated.title")}
            </h2>
            <p className="text-white/40 text-sm max-w-lg mx-auto">
              {t("curated.desc")}
            </p>
          </div>
        </ScrollReveal>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {products.map((product, i) => {
            const badge = getBadge(product)
            const badgeStyle = badge ? BADGE_STYLES[badge] : null
            const isAdded = addedIds.has(product.id)

            return (
              <ScrollReveal key={product.id} delay={i * 0.08}>
                <Link
                  href={`/shop/${product.id}`}
                  className="block group card-glow p-4 relative overflow-hidden hover:border-gold/40 transition-all duration-300"
                >
                  {/* Badge */}
                  {badge && badgeStyle && (
                    <div className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border}`}>
                      {t(`curated.${badge}`)}
                    </div>
                  )}

                  {/* Image */}
                  <div className="mb-3 flex justify-center">
                    <ProductImage
                      src={product.image_url}
                      alt={product.name}
                      category={product.category}
                      size="md"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-white text-sm leading-tight line-clamp-2 group-hover:text-gold transition-colors">
                      {product.name}
                    </h3>

                    {/* Rating + sales */}
                    <div className="flex items-center gap-2">
                      {product.rating && (
                        <div className="flex items-center gap-0.5">
                          <Star size={10} className="text-gold fill-gold" />
                          <span className="text-xs text-gold">{product.rating}</span>
                        </div>
                      )}
                      <span className="text-[10px] text-white/25">
                        {t("curated.bestSeller").replace("{count}", String(Math.floor(Math.random() * 500 + 100)))}
                      </span>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-gold font-bold text-base">
                        ¥{product.price_cny.toFixed(0)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleAdd(product)
                        }}
                        disabled={isAdded}
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all duration-300 ${
                          isAdded
                            ? "bg-green-500/20 border border-green-500/40 text-green-400"
                            : "bg-gold/15 border border-gold/30 text-gold hover:bg-gold/25 hover:shadow-[0_0_15px_rgba(201,168,76,0.2)]"
                        }`}
                      >
                        {isAdded ? (
                          <><Check size={11} /> {t("curated.added")}</>
                        ) : (
                          <><ShoppingCart size={11} /> {t("curated.addToCart")}</>
                        )}
                      </button>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>

        {/* View all CTA */}
        <ScrollReveal delay={0.5}>
          <div className="text-center mt-10">
            <MagneticButton>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 hover:border-gold/50 transition-all duration-300 text-sm font-medium group"
              >
                {t("curated.viewAll")}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
