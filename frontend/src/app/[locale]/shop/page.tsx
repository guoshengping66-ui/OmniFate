"use client"
import { Suspense, useEffect, useState, useMemo, useCallback, lazy } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Sparkles, Gem } from "lucide-react"
import { listProducts, matchProducts, Product } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { useCart } from "@/contexts/CartContext"
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
  const isZh = locale === "zh"
  const { region } = useRegion()
  const { registerProducts } = useCart()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [activeSeries, setActiveSeries] = useState("")
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
  const copy = {
    badge: "AI PROFILE MATCH",
    title: isZh ? "\u85cf\u5b9d\u9601" : "The Vault",
    subtitle: isZh
      ? "\u8fd9\u91cc\u4e0d\u662f\u666e\u901a\u5546\u57ce\u3002\u89c2\u6211\u4f1a\u6839\u636e\u4f60\u7684 AI \u547d\u8fd0\u753b\u50cf\u3001\u4e94\u7ef4\u72b6\u6001\u548c\u8fd1\u671f\u8d8b\u52bf\uff0c\u5339\u914d\u9002\u5408\u5f53\u4e0b\u9636\u6bb5\u7684\u751f\u6d3b\u65b9\u5f0f\u597d\u7269\u3002"
      : "This is not a generic shop. Guanwo matches items to your AI profile, five-dimension state, and current trend.",
    disclaimer: isZh
      ? "\u5546\u54c1\u4e3a\u6587\u5316\u521b\u610f\u4e0e\u751f\u6d3b\u65b9\u5f0f\u8f85\u52a9\u5efa\u8bae\uff0c\u4e0d\u627f\u8bfa\u529f\u6548\uff1b\u8bf7\u7ed3\u5408\u81ea\u8eab\u9700\u6c42\u7406\u6027\u9009\u62e9\u3002"
      : "Items are cultural and lifestyle recommendations, not guaranteed outcomes. Choose based on your own needs.",
    personalizedTitle: isZh ? "\u5df2\u6839\u636e\u4f60\u7684\u753b\u50cf\u91cd\u65b0\u6392\u5e8f" : "Re-ranked for your profile",
    personalizedDesc: isZh
      ? "\u6392\u5e8f\u4f18\u5148\u53c2\u8003\u4f60\u7684\u62a5\u544a\u6807\u7b7e\u3001\u4e94\u7ef4\u5f31\u9879\u3001\u8fd1\u671f\u8d8b\u52bf\u548c\u6210\u957f\u8bfe\u9898\u3002"
      : "Ranking prioritizes your report tags, weaker dimensions, current trend, and growth task.",
    defaultTitle: isZh ? "\u5148\u5efa\u7acb\u753b\u50cf\uff0c\u5339\u914d\u4f1a\u66f4\u51c6\u786e" : "Create a profile for sharper matching",
    defaultDesc: isZh
      ? "\u5f53\u524d\u5c55\u793a\u4e3a\u7cbe\u9009\u597d\u7269\u3002\u5b8c\u6210\u4e00\u6b21 AI \u753b\u50cf\u540e\uff0c\u7cfb\u7edf\u4f1a\u81ea\u52a8\u751f\u6210\u4f60\u7684\u4e13\u5c5e\u5339\u914d\u987a\u5e8f\u3002"
      : "These are curated picks. After your first AI profile, the system can generate a personal match order.",
    createProfile: isZh ? "\u5efa\u7acb\u6211\u7684\u753b\u50cf" : "Create my profile",
    signals: isZh ? ["\u753b\u50cf\u6807\u7b7e", "\u8fd1\u671f\u8d8b\u52bf", "\u6210\u957f\u8bfe\u9898"] : ["Profile tags", "Current trend", "Growth task"],
  }

  // Register loaded products with the cart so localStorage placeholders get real data
  useEffect(() => {
    if (allProducts.length > 0) {
      registerProducts(allProducts)
    }
  }, [allProducts, registerProducts])

  return (
    <div className="min-h-screen">
      {/* ═══ Hero Section — full-screen immersive ═══ */}
      <div className={`treasure-hero transition-all duration-1000 ${heroVisible ? "opacity-100" : "opacity-0"}`}>
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
              <span>{copy.badge}</span>
              <span className="w-10 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
          </div>

          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 transition-all duration-1000 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{
              background: "linear-gradient(135deg, #C9A84C 0%, #E8CB7A 40%, #C9A84C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
            {copy.title}
          </h1>

          <p className={`text-white/40 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-8 transition-all duration-1000 delay-500 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {copy.subtitle}
          </p>

          <div className={`mb-8 grid grid-cols-3 gap-2 max-w-xl mx-auto transition-all duration-1000 delay-600 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            {copy.signals.map(item => (
              <div key={item} className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[11px] text-white/42">
                {item}
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className={`transition-all duration-1000 delay-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="text-white/20 text-xs leading-relaxed max-w-md mx-auto">
              {copy.disclaimer}
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

        <ScrollReveal>
          <div className="mb-10 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gold/55">
                  <Sparkles size={13} />
                  {isPersonalized ? copy.personalizedTitle : copy.defaultTitle}
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-white/42">
                  {isPersonalized ? copy.personalizedDesc : copy.defaultDesc}
                </p>
              </div>
              {!isPersonalized && (
                <a href={localeHref("/reading/new")} className="btn-gold-outline inline-flex items-center justify-center px-5 py-2.5 text-sm">
                  {copy.createProfile}
                </a>
              )}
            </div>
          </div>
        </ScrollReveal>

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
