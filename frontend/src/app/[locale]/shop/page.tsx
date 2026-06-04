"use client"
import { Suspense, useEffect, useState, lazy } from "react"
import { useSearchParams } from "next/navigation"
import { ShoppingBag, Loader2, Sparkles, Search, TrendingUp, Zap, ArrowRight } from "lucide-react"
import { listProducts, matchProducts, Product } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

const ProductCard = lazy(() => import("@/components/reading/ProductCard").then(m => ({ default: m.ProductCard })))
const AIRecommendHero = lazy(() => import("@/components/shop/AIRecommendHero").then(m => ({ default: m.AIRecommendHero })))

// Scenario-based browsing cards
const SCENARIOS = [
  { key: "wealth", emoji: "💰", tag: "求财旺运", color: "from-amber-500/10 to-yellow-500/5", border: "border-amber-500/20" },
  { key: "career", emoji: "💼", tag: "事业腾飞", color: "from-blue-500/10 to-cyan-500/5", border: "border-blue-500/20" },
  { key: "love", emoji: "💕", tag: "姻缘感情", color: "from-pink-500/10 to-rose-500/5", border: "border-pink-500/20" },
  { key: "health", emoji: "🏥", tag: "健康平安", color: "from-green-500/10 to-emerald-500/5", border: "border-green-500/20" },
]

function ShopContent() {
  const searchParams = useSearchParams()
  const sessionTags = searchParams.get("tags") ?? ""
  const { t, locale, localeHref } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [activeCategory, setActiveCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"match" | "rating" | "price_asc" | "price_desc">("match")

  const CATEGORIES = [
    { key: "", label: t("shop.category.all") },
    { key: "crystal", label: t("shop.category.crystal") },
    { key: "jewelry", label: t("shop.category.jewelry") },
    { key: "incense", label: t("shop.category.incense") },
    { key: "talisman", label: t("shop.category.talisman") },
    { key: "book", label: t("shop.category.book") },
    { key: "service", label: t("shop.category.service") },
  ]

  useEffect(() => {
    setLoading(true)
    setIsPersonalized(false)

    if (sessionTags.trim()) {
      const weaknessTags = sessionTags.split(",").map(t => t.trim()).filter(Boolean)
      matchProducts({
        weakness_tags: weaknessTags,
        top_k: 20,
        include_explain: false,
      }, locale)
        .then(matched => {
          matched.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
          setAllProducts(matched)
          setProducts(matched)
          setIsPersonalized(true)
        })
        .catch(() => {
          return listProducts(undefined, locale).then(all => {
            setAllProducts(all)
            setProducts(all)
            return all
          })
        })
        .finally(() => setLoading(false))
    } else {
      listProducts(undefined, locale)
        .then(all => {
          setAllProducts(all)
          setProducts(all)
        })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false))
    }
  }, [sessionTags, locale])

  // Filter, search, and sort
  useEffect(() => {
    let filtered = allProducts
    if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.keyword_tags || []).some(t => t.toLowerCase().includes(q))
      )
    }
    // Sort
    const sorted = [...filtered]
    switch (sortBy) {
      case "match":
        sorted.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
        break
      case "rating":
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
      case "price_asc":
        sorted.sort((a, b) => a.price_cny - b.price_cny)
        break
      case "price_desc":
        sorted.sort((a, b) => b.price_cny - a.price_cny)
        break
    }
    setProducts(sorted)
  }, [activeCategory, searchQuery, allProducts, sortBy])

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: t("nav.shop") }]} />

        {/* Disclaimer banner */}
        <div className="mb-6 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
          <p className="text-amber-200/70 text-xs leading-relaxed">
            {t("shop.disclaimer") || "Products are cultural creative items. Descriptions are based on traditional destiny culture, not scientifically verified."}
            <a href={localeHref("/disclaimer")} className="text-gold/60 hover:text-gold ml-1 underline">{t("shop.disclaimerLink") || "View Details"}</a>
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <ShoppingBag size={36} className="text-gold mx-auto mb-3" />
          <h1 className="text-4xl font-serif font-bold text-gold mb-2">{t("shop.title")}</h1>
          {isPersonalized ? (
            <p className="text-gold/70 flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="fill-gold/30" />
              {t("shop.aiRecommend")}
              <Sparkles size={14} className="fill-gold/30" />
            </p>
          ) : (
            <p className="text-white/50">{t("shop.desc")}</p>
          )}
        </div>

        {/* Scenario-based quick entry cards */}
        {!isPersonalized && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {SCENARIOS.map(scenario => (
              <a
                key={scenario.key}
                href={localeHref(`/reading/new`)}
                className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${scenario.color} border ${scenario.border} hover:scale-[1.02] transition-all duration-300 group`}
              >
                <span className="text-2xl mb-2 block">{scenario.emoji}</span>
                <p className="text-white/70 text-xs font-medium">{scenario.tag}</p>
                <p className="text-white/30 text-[10px] mt-1">{t("shop.scenario.cta") || "推命获取专属推荐"}</p>
                <ArrowRight size={12} className="absolute top-3 right-3 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
              </a>
            ))}
          </div>
        )}

        {/* AI Recommend Hero */}
        {!loading && isPersonalized && products.length > 0 && (
          <AIRecommendHero products={products} />
        )}

        {/* Category filter + Sort + Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
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

          {/* Sort + Search row */}
          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5 text-xs text-white/50 focus:border-gold/30 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="match">{t("shop.sort.match") || "命盘匹配"}</option>
              <option value="rating">{t("shop.sort.rating") || "评分最高"}</option>
              <option value="price_asc">{t("shop.sort.priceAsc") || "价格低→高"}</option>
              <option value="price_desc">{t("shop.sort.priceDesc") || "价格高→低"}</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t("shop.search")}
                className="w-full sm:w-44 bg-white/[0.04] border border-white/[0.08] rounded-full pl-9 pr-4 py-1.5 text-xs text-white/70 placeholder-white/25 focus:border-gold/30 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Results count */}
        {!loading && products.length > 0 && (
          <p className="text-white/20 text-xs mb-4">
            {t("shop.resultCount")?.replace("{count}", String(products.length)) || `共 ${products.length} 件商品`}
          </p>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="text-gold animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="card-glass p-16 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/40">
              {allProducts.length > 0 ? t("shop.noMatch") : t("shop.noProducts")}
            </p>
            {allProducts.length > 0 && (
              <button
                onClick={() => { setActiveCategory(""); setSearchQuery(""); }}
                className="text-gold text-xs mt-2 hover:underline"
              >
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
