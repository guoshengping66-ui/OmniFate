"use client"
import { Suspense, useEffect, useState, useMemo, useCallback, useRef, lazy } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Sparkles, Gem } from "lucide-react"
import { listProducts, matchProducts, Product } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

const ProductCard = lazy(() => import("@/components/reading/ProductCard").then(m => ({ default: m.ProductCard })))
const AIRecommendHero = lazy(() => import("@/components/shop/AIRecommendHero").then(m => ({ default: m.AIRecommendHero })))

const SERIES_KEYS = ["crystal", "jewelry", "incense", "talisman", "book", "service"] as const

function ProductCardSkeleton() {
  return (
    <div className="treasure-card p-6 animate-pulse">
      <div className="w-full aspect-square rounded-xl bg-white/[0.04] mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-white/[0.06] rounded w-3/4" />
        <div className="h-3 bg-white/[0.04] rounded w-1/2" />
        <div className="h-3 bg-white/[0.04] rounded w-full" />
        <div className="flex justify-between items-center pt-3">
          <div className="h-5 bg-gold/10 rounded w-16" />
          <div className="h-8 bg-gold/10 rounded-full w-24" />
        </div>
      </div>
    </div>
  )
}

function ShopContent() {
  const searchParams = useSearchParams()
  const sessionTags = searchParams.get("tags") ?? ""
  const { t, locale, localeHref } = useLanguage()
  const { region } = useRegion()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [activeSeries, setActiveSeries] = useState("")
  const heroRef = useRef<HTMLDivElement>(null)
  const [heroVisible, setHeroVisible] = useState(false)
  const [particles, setParticles] = useState<{ x: number; y: number; dur: number; delay: number }[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      dur: 3 + Math.random() * 4,
      delay: Math.random() * 3,
    })))
  }, [])

  const SERIES = useMemo(() => [
    { key: "", label: t("treasureHall.series.all") },
    ...SERIES_KEYS.map(k => ({ key: k, label: t(`treasureHall.series.${k}`) })),
  ], [t])

  useEffect(() => {
    setLoading(true)
    setIsPersonalized(false)

    if (sessionTags.trim()) {
      const weaknessTags = sessionTags.split(",").map(s => s.trim()).filter(Boolean)
      matchProducts({
        weakness_tags: weaknessTags,
        top_k: 20,
        include_explain: false,
      }, locale)
        .then(matched => {
          matched.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
          setAllProducts(matched)
          setIsPersonalized(true)
        })
        .catch(() => {
          return listProducts(undefined, locale).then(all => {
            setAllProducts(all)
            return all
          })
        })
        .finally(() => setLoading(false))
    } else {
      listProducts(undefined, locale)
        .then(all => setAllProducts(all))
        .catch(() => setAllProducts([]))
        .finally(() => setLoading(false))
    }
  }, [sessionTags, locale])

  const products = useMemo(() => {
    if (!activeSeries) return allProducts
    return allProducts.filter(p => p.category === activeSeries)
  }, [allProducts, activeSeries])

  const handleSeriesChange = useCallback((key: string) => setActiveSeries(key), [])

  return (
    <div className="min-h-screen">
      {/* ═══ Hero Section — full-screen immersive ═══ */}
      <div ref={heroRef} className={`treasure-hero transition-all duration-1000 ${heroVisible ? "opacity-100" : "opacity-0"}`}>
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold/20"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                animation: `particleFloat ${p.dur}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Subtle radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.03] blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className={`transition-all duration-1000 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-gold/40 font-medium mb-6">
              <span className="w-10 h-px bg-gradient-to-r from-transparent to-gold/30" />
              <Gem size={12} className="text-gold/50" />
              <span className="w-10 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
          </div>

          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 transition-all duration-1000 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{
              background: "linear-gradient(135deg, #C9A84C 0%, #E8CB7A 40%, #C9A84C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
            {t("treasureHall.hero.title")}
          </h1>

          <p className={`text-white/40 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-8 transition-all duration-1000 delay-500 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {t("treasureHall.hero.subtitle")}
          </p>

          {/* Disclaimer */}
          <div className={`transition-all duration-1000 delay-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="text-white/20 text-xs leading-relaxed max-w-md mx-auto">
              {t("treasureHall.disclaimer")}
            </p>
          </div>

          {/* Scroll indicator */}
          <div className={`mt-12 transition-all duration-1000 delay-1000 ${heroVisible ? "opacity-100" : "opacity-0"}`}>
            <div className="w-5 h-8 rounded-full border border-white/10 mx-auto flex justify-center pt-1.5">
              <div className="w-1 h-2 rounded-full bg-gold/40 animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="max-w-6xl mx-auto px-4 pb-20">

        {/* AI Recommendation */}
        {!loading && isPersonalized && products.length > 0 && (
          <div className="mb-16">
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/8 border border-gold/20">
                  <Sparkles size={14} className="text-gold/70" />
                  <span className="text-gold/80 text-xs font-medium tracking-wide">{t("treasureHall.curator.title")}</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-gold/15 to-transparent" />
              </div>
              <p className="text-white/30 text-sm mb-6">{t("treasureHall.curator.subtitle")}</p>
            </ScrollReveal>
            <Suspense fallback={null}>
              <AIRecommendHero products={products} />
            </Suspense>
          </div>
        )}

        {/* Series Filter — horizontal scroll */}
        <ScrollReveal>
          <div className="mb-8">
            <div className="series-scroll">
              {SERIES.map(s => (
                <button
                  key={s.key}
                  onClick={() => handleSeriesChange(s.key)}
                  className={`series-scroll-item ${activeSeries === s.key ? "active" : ""}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Results count */}
        {!loading && products.length > 0 && (
          <p className="text-white/15 text-xs mb-6">
            {t("treasureHall.resultCount").replace("{count}", String(products.length))}
          </p>
        )}

        {/* Products grid — larger cards */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Gem size={40} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/30 text-sm">{allProducts.length > 0 ? t("treasureHall.noMatch") : t("shop.noProducts")}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
