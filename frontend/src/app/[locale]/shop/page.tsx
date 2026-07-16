"use client"
import { Suspense, useEffect, useState, useMemo, useCallback, lazy } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Sparkles, Gem, ClipboardCheck, ShieldCheck, Truck } from "lucide-react"
import { listMyReadings, listProducts, matchProducts, Product } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import { useCart } from "@/contexts/CartContext"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { NEED_PATHS, normalizeProductCategory, productMatchesNeed } from "@/lib/treasureHall"
import { ProductCard } from "@/components/reading/ProductCard"

const AIRecommendHero = lazy(() => import("@/components/shop/AIRecommendHero").then(m => ({ default: m.AIRecommendHero })))

const SERIES_KEYS = ["crystal", "jewelry", "incense", "talisman"] as const

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


/* Superseded by the profile-aware copy defined in ShopContent.
const getCopy = (isZh: boolean, isPersonalized: boolean) => ({
  badge: isZh ? "AI 推荐" : "AI Recommendation",
  personalizedTitle: isZh ? "AI 智能推荐" : "AI Smart Recommendation",
  personalizedDesc: isZh ? "基于你的行为分析，为你推荐这些能量物品" : "Based on your behavioral analysis, we recommend these",
  defaultTitle: isZh ? "发现你的能量物品" : "Discover Your Energy Items",
  defaultDesc: isZh ? "完成 AI 人生透视，获取个性化推荐" : "Complete your AI life reading",
  createProfile: isZh ? "完成性格洞察" : "Create Your Reading",
  needTitle: isZh ? "按需筛选" : "Filter by Need",
  needDesc: isZh ? "选择你关注的方面，找到最合适的物品" : "Select what matters",
  categoryTitle: isZh ? "分类浏览" : "Browse by Category",
  prescriptionTitle: isZh ? "AI 能量处方" : "AI Energy Prescription",
  prescriptionDesc: isZh ? "基于你的多维行为分析，推荐最适合的能量物品" : "Based on multi-dimensional analysis",
  title: isZh ? "找到属于你的能量之物" : "Find Your Energy",
  subtitle: isZh ? "AI 智能匹配你的能量需求" : "AI-powered matching for your energy",
  signals: isZh ? ["水晶", "珠宝", "香薰", "护身符", "书籍"] : ["Crystals", "Jewelry", "Incense", "Talismans", "Books"],
  disclaimer: isZh ? "所有物品均基于你的 AI 行为分析推荐" : "All items recommended based on your AI analysis",
  trustItems: [
    { title: isZh ? "AI 精准匹配" : "AI Precision Match", desc: isZh ? "基于多维度行为分析算法" : "Multi-dimensional analysis" },
    { title: isZh ? "品质保证" : "Quality Guaranteed", desc: isZh ? "精选优质能量物品" : "Carefully selected items" },
    { title: isZh ? "安心购物" : "Secure Shopping", desc: isZh ? "30天无忧退换" : "30-day return" },
  ],
  allNeeds: isZh ? "全部" : "All",
})
*/

function ShopContent() {
  const searchParams = useSearchParams()
  const sessionTags = searchParams.get("tags") ?? ""
  const { t, locale, localeHref } = useLanguage()
  const isZh = locale === "zh"
  const { registerProducts } = useCart()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [activeSeries, setActiveSeries] = useState("")
  const [activeNeed, setActiveNeed] = useState("")
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
    let cancelled = false

    async function loadProducts() {
      setLoading(true)
      setIsPersonalized(false)

      const explicitTags = sessionTags.split(",").map(s => s.trim()).filter(Boolean)

      // Phase 1: Show all products immediately
      try {
        const all = await listProducts(undefined, locale)
        if (!cancelled) { setAllProducts(all); setLoading(false) }
      } catch {
        if (!cancelled) { setAllProducts([]); setLoading(false) }
      }

      // Phase 2: Get user tags for matching (non-blocking)
      let weaknessTags = explicitTags
      if (weaknessTags.length === 0) {
        try {
          const readings = await listMyReadings()
          const latest = readings.find(r =>
            (r.status === "done" || r.status === "completed") &&
            r.computed_tags &&
            r.computed_tags.length > 0
          )
          weaknessTags = latest?.computed_tags ?? []
        } catch {
          weaknessTags = []
        }
      }

      // Phase 3: Match and re-rank in background
      if (weaknessTags.length === 0 || cancelled) return

      try {
        const matched = await matchProducts({
          weakness_tags: weaknessTags,
          top_k: 50,
          include_explain: true,
        }, locale)
        matched.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
        if (!cancelled) {
          setAllProducts(prev => {
            const matchedIds = new Set(matched.map(p => p.id))
            const unmatched = prev.filter(p => !matchedIds.has(p.id))
            return [...matched, ...unmatched]
          })
          setIsPersonalized(true)
        }
      } catch {}
    }

    loadProducts()

    return () => { cancelled = true }
  }, [sessionTags, locale])

  const products = useMemo(() => {
    return allProducts.filter(p => {
      const seriesMatch = !activeSeries || normalizeProductCategory(p.category) === activeSeries
      const needMatch = !activeNeed || productMatchesNeed(p, activeNeed)
      return seriesMatch && needMatch
    })
  }, [allProducts, activeSeries, activeNeed])

  const handleSeriesChange = useCallback((key: string) => setActiveSeries(key), [])
  const handleNeedChange = useCallback((key: string) => setActiveNeed(key), [])
  const copy = {
    badge: "AI PROFILE MATCH",
    title: isZh ? "\u85cf\u5b9d\u9601" : "The Vault",
    subtitle: isZh
      ? "这里不是普通商城。观我会把你的报告标签、五维状态和近期趋势，转化为可执行的生活方式处方。"
      : "This is not a generic shop. Guanwo turns your report tags, five-dimension state, and current trend into practical lifestyle prescriptions.",
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
    prescriptionTitle: isZh ? "你的当下处方" : "Your current prescription",
    prescriptionDesc: isZh
      ? "根据报告标签、五维弱项和近期趋势，把洞察转化为具体生活方式动作。"
      : "Report tags, weaker dimensions, and current trends become concrete lifestyle actions.",
    needTitle: isZh ? "按当前需求选择" : "Choose by current need",
    needDesc: isZh
      ? "没有报告也可以先按需求浏览；完成画像后，排序会更贴近你的状态。"
      : "Browse by need before a report. After profiling, ranking becomes more personal.",
    allNeeds: isZh ? "全部需求" : "All needs",
    categoryTitle: isZh ? "按品类浏览" : "Browse by category",
    trustItems: isZh
      ? [
          { title: "\u62a5\u544a\u5339\u914d", desc: "\u6839\u636e\u753b\u50cf\u548c\u8d8b\u52bf\u6392\u5e8f" },
          { title: "\u7406\u6027\u8d2d\u4e70", desc: "\u6587\u5316\u751f\u6d3b\u65b9\u5f0f\u5efa\u8bae" },
          { title: "\u8ba2\u5355\u8ddf\u8e2a", desc: "\u652f\u4ed8\u540e\u53ef\u5728\u8ba2\u5355\u4e2d\u67e5\u770b\u8fdb\u5ea6" },
        ]
      : [
          { title: "Profile matched", desc: "Ranked by your profile and trend" },
          { title: "Practical purchase", desc: "Cultural lifestyle guidance" },
          { title: "Order tracking", desc: "Follow status after checkout" },
        ],
  }

  Object.assign(copy, {
    badge: isZh ? "生活方式匹配" : "Lifestyle Match",
    title: isZh ? "与你的状态相匹配的生活方式物件" : "Lifestyle objects matched to your current state",
    subtitle: isZh
      ? "根据你的性格结构、情绪状态和生活节律，推荐更适合你的空间、饰品与仪式感物件。"
      : "Based on your personality structure, emotional state, and life rhythm, Guanwo recommends spatial, personal, and ritual objects.",
    disclaimer: isZh
      ? "观我不会承诺改变命运。商品为文化创意与生活方式建议，请结合自身需要理性选择。"
      : "Items are cultural and lifestyle recommendations, not guaranteed outcomes. Choose based on your own needs.",
    personalizedTitle: isZh ? "已根据你的观我档案重新排序" : "Re-ranked for your Guanwo dossier",
    personalizedDesc: isZh
      ? "排序会参考你的报告标签、五维状态、近期主题与生活节律。"
      : "Ranking references your report tags, five-source state, current theme, and daily rhythm.",
    defaultTitle: isZh ? "先生成档案，匹配会更贴近你" : "Create a dossier for sharper matching",
    defaultDesc: isZh
      ? "当前展示为精选生活方式物件。完成一次观我报告后，系统会生成更适合你的匹配顺序。"
      : "These are curated lifestyle picks. After your first Guanwo report, the system can generate a more personal match order.",
    createProfile: isZh ? "生成我的观我档案" : "Create my Guanwo dossier",
    signals: isZh ? ["性格结构", "情绪状态", "生活节律"] : ["Structure", "Emotional state", "Life rhythm"],
    prescriptionTitle: isZh ? "你的当下生活方式建议" : "Your current lifestyle guidance",
    prescriptionDesc: isZh
      ? "根据报告标签、五维状态和近期主题，把分析结果转化为更具体的生活方式选择。"
      : "Report tags, five-source state, and current themes become concrete lifestyle choices.",
    needTitle: isZh ? "按当前状态选择" : "Choose by current state",
    needDesc: isZh
      ? "没有报告也可以先按状态浏览；完成档案后，排序会更贴近你的个人节奏。"
      : "Browse by state before a report. After profiling, ranking becomes more personal.",
    allNeeds: isZh ? "全部状态" : "All states",
    categoryTitle: isZh ? "按生活方式分类浏览" : "Browse by lifestyle category",
    trustItems: isZh
      ? [
          { title: "档案匹配", desc: "根据结构、状态和节律排序" },
          { title: "理性选择", desc: "文化创意与生活方式建议" },
          { title: "订单跟踪", desc: "支付后可在订单中查看进度" },
        ]
      : [
          { title: "Dossier matched", desc: "Ranked by structure, state, and rhythm" },
          { title: "Practical choice", desc: "Cultural lifestyle guidance" },
          { title: "Order tracking", desc: "Follow status after checkout" },
        ],
  })

  Object.assign(copy, {
    title: isZh ? "状态物件推荐" : "State-matched objects",
    subtitle: isZh ? "按你的情绪、专注和生活节律，推荐更适合今天使用的物件。" : "Objects matched to mood, focus, and daily rhythm.",
    disclaimer: isZh ? "不承诺效果，只提供生活方式参考。" : "Lifestyle reference only, no guaranteed outcome.",
    signals: isZh ? ["情绪", "专注", "节律"] : ["Mood", "Focus", "Rhythm"],
    defaultTitle: isZh ? "先生成档案，匹配更准确" : "Create a dossier for sharper matching",
    defaultDesc: isZh ? "完成观我报告后，排序会更贴近你的个人节奏。" : "After your Guanwo report, ranking becomes more personal.",
    personalizedDesc: isZh ? "排序参考你的报告标签、五维状态与近期主题。" : "Ranking references report tags, five-source state, and current theme.",
    trustItems: isZh
      ? [
          { title: "档案匹配", desc: "按状态和节律排序" },
          { title: "理性选择", desc: "生活方式参考" },
          { title: "订单跟踪", desc: "支付后查看进度" },
        ]
      : [
          { title: "Dossier matched", desc: "Ranked by state and rhythm" },
          { title: "Practical choice", desc: "Lifestyle reference" },
          { title: "Order tracking", desc: "Follow status after checkout" },
        ],
  })

  // Register loaded products with the cart so localStorage placeholders get real data
  useEffect(() => {
    if (allProducts.length > 0) {
      registerProducts(allProducts)
    }
  }, [allProducts, registerProducts])

  return (
    <div className="min-h-screen">
      {/* ═══ Hero Section — full-screen immersive ═══ */}
      <div className={`treasure-hero !min-h-[auto] !items-start !justify-start !px-4 !pb-10 !pt-32 !text-left transition-all duration-1000 sm:!min-h-[560px] sm:!items-center sm:!justify-center sm:!pt-36 sm:!text-center ${heroVisible ? "opacity-100" : "opacity-0"}`}>
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

        <div className="relative z-10 mx-auto max-w-2xl">
          <div className={`transition-all duration-1000 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-gold/40 font-medium mb-6">
              <span className="w-10 h-px bg-gradient-to-r from-transparent to-gold/30" />
              <Gem size={12} className="text-gold/50" />
              <span>{copy.badge}</span>
              <span className="w-10 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
          </div>

          <h1 className={`mb-5 max-w-2xl px-1 text-[clamp(2.2rem,6vw,4.6rem)] font-serif font-bold leading-[1.02] transition-all duration-1000 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{
              background: "linear-gradient(135deg, #C9A84C 0%, #E8CB7A 40%, #C9A84C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
            {copy.title}
          </h1>

          <p className={`mx-auto mb-5 max-w-lg text-sm leading-7 text-white/45 md:text-base transition-all duration-1000 delay-500 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {copy.subtitle}
          </p>

          <div className={`mb-5 grid max-w-md grid-cols-3 gap-2 transition-all duration-1000 delay-600 sm:mx-auto ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            {copy.signals.map(item => (
              <div key={item} className="rounded-xl border border-white/[0.06] bg-[#030918] px-3 py-2 text-[11px] text-white/42">
                {item}
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className={`hidden transition-all duration-1000 delay-700 sm:block ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="text-white/20 text-xs leading-relaxed max-w-md mx-auto">
              {copy.disclaimer}
            </p>
          </div>

          {/* Scroll indicator */}
          <div className={`mt-8 hidden transition-all duration-1000 delay-1000 md:block ${heroVisible ? "opacity-100" : "opacity-0"}`}>
            <div className="w-5 h-8 rounded-full border border-white/10 mx-auto flex justify-center pt-1.5">
              <div className="w-1 h-2 rounded-full bg-gold/40 animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="max-w-6xl mx-auto px-4 pb-20">

        <ScrollReveal>
          <div className="mb-7 rounded-xl border border-white/[0.07] bg-[#030918] p-4 md:p-5">
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

        <ScrollReveal>
          <div className="hidden">
            {[ClipboardCheck, ShieldCheck, Truck].map((Icon, index) => {
              const item = copy.trustItems[index]
              return (
                <div key={item.title} className="rounded-xl border border-white/[0.07] bg-[#030918] p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-gold/20 bg-gold/[0.07] text-gold">
                    <Icon size={17} />
                  </div>
                  <h2 className="text-sm font-semibold text-white/82">{item.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-white/42">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </ScrollReveal>

        {/* AI Recommendation */}
        {!loading && isPersonalized && products.length > 0 && (
          <div className="mb-16">
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/8 border border-gold/20">
                  <Sparkles size={14} className="text-gold/70" />
                  <span className="text-gold/80 text-xs font-medium tracking-wide">{copy.prescriptionTitle}</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-gold/15 to-transparent" />
              </div>
              <p className="text-white/35 text-sm mb-6">{copy.prescriptionDesc}</p>
            </ScrollReveal>
            <Suspense fallback={null}>
              <AIRecommendHero products={products} />
            </Suspense>
          </div>
        )}

        {/* Series Filter — horizontal scroll */}
        <ScrollReveal>
          <div className="mb-8">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-serif text-xl text-gold">{copy.needTitle}</h2>
                <p className="mt-1 text-sm leading-relaxed text-white/40">{copy.needDesc}</p>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleNeedChange("")}
                className={`shrink-0 border px-4 py-2 text-xs transition-colors ${
                  activeNeed === "" ? "border-gold/40 bg-gold/10 text-gold" : "border-white/10 bg-[#030918] text-white/45 hover:border-gold/25 hover:text-gold/80"
                }`}
              >
                {copy.allNeeds}
              </button>
              {NEED_PATHS.map(need => (
                <button
                  key={need.key}
                  onClick={() => handleNeedChange(need.key)}
                  className={`shrink-0 border px-4 py-2 text-left transition-colors ${
                    activeNeed === need.key ? "border-gold/40 bg-gold/10 text-gold" : "border-white/10 bg-[#030918] text-white/45 hover:border-gold/25 hover:text-gold/80"
                  }`}
                >
                  <span className="block text-xs font-medium">{need.label[isZh ? "zh" : "en"]}</span>
                  <span className="mt-0.5 block max-w-[220px] text-[10px] leading-relaxed text-white/30">{need.description[isZh ? "zh" : "en"]}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="font-serif text-lg text-gold/85">{copy.categoryTitle}</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-gold/10 to-transparent" />
            </div>
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
