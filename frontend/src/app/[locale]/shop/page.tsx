"use client"
import { Suspense, useEffect, useState, useMemo, useCallback, lazy } from "react"
import { useSearchParams } from "next/navigation"
import { ShoppingBag, Loader2, Sparkles, Search, ArrowRight } from "lucide-react"
import { listProducts, matchProducts, Product } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

const ProductCard = lazy(() => import("@/components/reading/ProductCard").then(m => ({ default: m.ProductCard })))
const AIRecommendHero = lazy(() => import("@/components/shop/AIRecommendHero").then(m => ({ default: m.AIRecommendHero })))

const SCENARIOS = [
  { key: "wealth", emoji: "💰", color: "from-amber-500/10 to-yellow-500/5", border: "border-amber-500/20" },
  { key: "career", emoji: "💼", color: "from-blue-500/10 to-cyan-500/5", border: "border-blue-500/20" },
  { key: "love", emoji: "💕", color: "from-pink-500/10 to-rose-500/5", border: "border-pink-500/20" },
  { key: "health", emoji: "🏥", color: "from-green-500/10 to-emerald-500/5", border: "border-green-500/20" },
]

// Skeleton card for loading state
function ProductCardSkeleton() {
  return (
    <div className="card-glass p-5 flex gap-4 animate-pulse">
      <div className="w-20 h-20 rounded-xl bg-white/[0.04] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/[0.06] rounded w-3/4" />
        <div className="h-3 bg-white/[0.04] rounded w-1/2" />
        <div className="h-3 bg-white/[0.04] rounded w-full" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-gold/10 rounded w-16" />
          <div className="h-7 bg-gold/10 rounded-full w-20" />
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
  const [activeCategory, setActiveCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"match" | "rating" | "price_asc" | "price_desc">("match")

  const CATEGORIES = useMemo(() => [
    { key: "", label: t("shop.category.all") },
    { key: "crystal", label: t("shop.category.crystal") },
    { key: "jewelry", label: t("shop.category.jewelry") },
    { key: "incense", label: t("shop.category.incense") },
    { key: "talisman", label: t("shop.category.talisman") },
    { key: "book", label: t("shop.category.book") },
    { key: "service", label: t("shop.category.service") },
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

  // Memoized filtered + sorted products
  const products = useMemo(() => {
    let filtered = allProducts
    if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.keyword_tags || []).some(tag => tag.toLowerCase().includes(q))
      )
    }
    const sorted = [...filtered]
    switch (sortBy) {
      case "match": sorted.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0)); break
      case "rating": sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break
      case "price_asc": sorted.sort((a, b) => (region === "overseas" && a.price_usd ? a.price_usd : a.price_cny) - (region === "overseas" && b.price_usd ? b.price_usd : b.price_cny)); break
      case "price_desc": sorted.sort((a, b) => (region === "overseas" && b.price_usd ? b.price_usd : b.price_cny) - (region === "overseas" && a.price_usd ? a.price_usd : a.price_cny)); break
    }
    return sorted
  }, [allProducts, activeCategory, searchQuery, sortBy])

  const handleCategoryChange = useCallback((key: string) => setActiveCategory(key), [])
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as any), [])
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value), [])
  const handleClearFilter = useCallback(() => { setActiveCategory(""); setSearchQuery("") }, [])

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: t("nav.shop") }]} />

        {/* Disclaimer banner */}
        <ScrollReveal>
          <div className="mb-6 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
            <p className="text-amber-200/70 text-xs leading-relaxed">
              {t("shop.disclaimer") || "Products are cultural creative items. Descriptions are based on traditional destiny culture, not scientifically verified."}
              <a href={localeHref("/disclaimer")} className="text-gold/60 hover:text-gold ml-1 underline">{t("shop.disclaimerLink") || "View Details"}</a>
            </p>
          </div>
        </ScrollReveal>

        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("nav.shop")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <ShoppingBag size={28} className="text-gold mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">{t("shop.title")}</h1>
            {isPersonalized ? (
              <p className="text-gold/70 flex items-center justify-center gap-1.5 text-sm">
                <Sparkles size={14} className="fill-gold/30" />
                {t("shop.aiRecommend")}
                <Sparkles size={14} className="fill-gold/30" />
              </p>
            ) : (
              <p className="text-white/40 text-sm">{t("shop.desc")}</p>
            )}
          </div>
        </ScrollReveal>

        {/* Scenario cards */}
        {!isPersonalized && !loading && (
          <ScrollReveal delay={0.08}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {SCENARIOS.map(scenario => (
                <a
                  key={scenario.key}
                  href={localeHref(`/reading/new`)}
                  className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${scenario.color} border ${scenario.border} hover:scale-[1.02] transition-all duration-300 group`}
                >
                  <span className="text-xl mb-2 block">{scenario.emoji}</span>
                  <p className="text-white/70 text-xs font-medium">{t(`shop.scenario.${scenario.key}`)}</p>
                  <p className="text-white/30 text-[10px] mt-1">{t("shop.scenario.cta") || "推命获取专属推荐"}</p>
                  <ArrowRight size={12} className="absolute top-3 right-3 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
                </a>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* AI Recommend Hero */}
        {!loading && isPersonalized && products.length > 0 && (
          <Suspense fallback={null}>
            <AIRecommendHero products={products} />
          </Suspense>
        )}

        {/* Category + Sort + Search */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                    ${activeCategory === cat.key
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/60 hover:border-white/15"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select value={sortBy} onChange={handleSortChange}
                className="bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5 text-xs text-white/50 focus:border-gold/30 focus:outline-none appearance-none cursor-pointer">
                <option value="match">{t("shop.sort.match") || "命盘匹配"}</option>
                <option value="rating">{t("shop.sort.rating") || "评分最高"}</option>
                <option value="price_asc">{t("shop.sort.priceAsc") || "价格低→高"}</option>
                <option value="price_desc">{t("shop.sort.priceDesc") || "价格高→低"}</option>
              </select>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={searchQuery} onChange={handleSearchChange}
                  placeholder={t("shop.search")}
                  className="w-full sm:w-44 bg-white/[0.04] border border-white/[0.08] rounded-full pl-9 pr-4 py-1.5 text-xs text-white/70 placeholder-white/25 focus:border-gold/30 focus:outline-none transition-colors" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Results count */}
        {!loading && products.length > 0 && (
          <p className="text-white/20 text-xs mb-4">
            {t("shop.resultCount")?.replace("{count}", String(products.length)) || `共 ${products.length} 件商品`}
          </p>
        )}

        {/* Products grid */}
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
          <div className="card-glass p-16 text-center">
            <ShoppingBag size={40} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/40 text-sm">{allProducts.length > 0 ? t("shop.noMatch") : t("shop.noProducts")}</p>
            {allProducts.length > 0 && (
              <button onClick={handleClearFilter} className="text-gold text-xs mt-2 hover:underline">
                {t("shop.clearFilter")}
              </button>
            )}
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
