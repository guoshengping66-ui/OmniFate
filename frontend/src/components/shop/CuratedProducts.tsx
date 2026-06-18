"use client"
import { useEffect, useState } from "react"
import { Sparkles, Check, Star, ArrowRight, Gem } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { listProducts, type Product } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { getProductPrice } from "@/lib/regionPrice"
import { ProductImage } from "@/components/shop/ProductImage"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import toast from "react-hot-toast"

export function CuratedProducts() {
  const { t, locale } = useLanguage()
  const { addItem } = useCart()
  const { region } = useRegion()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (addedIds.size === 0) return
    const ids = Array.from(addedIds)
    const timer = setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev)
        ids.forEach(id => next.delete(id))
        return next
      })
    }, 2000)
    return () => clearTimeout(timer)
  }, [addedIds])

  useEffect(() => {
    listProducts(undefined, locale)
      .then(all => {
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
  }

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="treasure-card h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-gold/[0.015] blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/[0.05] border border-gold/15 text-gold/70 text-xs mb-4">
              <Gem size={12} className="text-gold/50" />
              {t("curated.badge")}
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white/90 mb-2">
              {t("curated.title")}
            </h2>
            <p className="text-white/30 text-sm max-w-md mx-auto">
              {t("curated.desc")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {products.map((product, i) => {
            const isAdded = addedIds.has(product.id)

            return (
              <ScrollReveal key={product.id} delay={i * 0.08}>
                <Link
                  href={`/shop/${product.id}`}
                  className="block group treasure-card p-3 relative overflow-hidden"
                >
                  <div className="mb-3 flex justify-center py-3">
                    <ProductImage
                      src={product.image_url}
                      alt={product.name}
                      category={product.category}
                      size="md"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-serif font-medium text-white/80 text-xs leading-tight line-clamp-2 group-hover:text-gold/70 transition-colors">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      {product.rating && (
                        <div className="flex items-center gap-0.5">
                          <Star size={9} className="text-gold/50 fill-gold/50" />
                          <span className="text-[10px] text-gold/50">{product.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-gold/80 font-semibold text-sm">
                        {getProductPrice(product, region).symbol}{getProductPrice(product, region).price.toFixed(0)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleAdd(product)
                        }}
                        disabled={isAdded}
                        className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg transition-all duration-300 ${
                          isAdded
                            ? "bg-green-500/12 border border-green-500/25 text-green-400"
                            : "bg-gold/8 border border-gold/15 text-gold/70 hover:bg-gold/12"
                        }`}
                      >
                        {isAdded ? (
                          <><Check size={10} /> {t("treasureHall.collected")}</>
                        ) : (
                          <><Sparkles size={10} /> {t("treasureHall.collect")}</>
                        )}
                      </button>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>

        <ScrollReveal delay={0.5}>
          <div className="text-center mt-10">
            <MagneticButton>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gold/[0.06] border border-gold/20 text-gold/70 hover:bg-gold/10 hover:border-gold/30 transition-all duration-300 text-sm font-medium group"
              >
                {t("curated.viewAll")}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
