"use client"
import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Link } from "@/i18n/navigation"
import {
  Loader2, ArrowLeft, Check, Star,
  Sparkles, Package, Shield, ChevronRight,
  BookOpen, Gem, ClipboardList, ShoppingBag,
} from "lucide-react"
import { ProductImage } from "@/components/shop/ProductImage"
import toast from "react-hot-toast"
import { getProduct, listMyReadings, type Product, type ReadingListItem } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { getProductPrice } from "@/lib/regionPrice"
import { ProductReviews } from "@/components/shop/ProductReviews"
import { FavoriteButton } from "@/components/shop/FavoriteButton"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function NarrativeSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div ref={ref} className={`story-section ${visible ? "revealed" : ""} ${className}`}>
      {children}
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { addItem } = useCart()
  const { t, locale } = useLanguage()
  const { region } = useRegion()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const [relatedReadings, setRelatedReadings] = useState<ReadingListItem[]>([])

  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 1500)
    return () => clearTimeout(timer)
  }, [added])

  const CATEGORY_LABELS: Record<string, string> = {
    crystal: t("treasureHall.series.crystal"), jewelry: t("treasureHall.series.jewelry"),
    incense: t("treasureHall.series.incense"), talisman: t("treasureHall.series.talisman"),
    book: t("treasureHall.series.book"), service: t("treasureHall.series.service"),
    other: t("shop.category.other"),
  }

  useEffect(() => {
    if (!id) return
    getProduct(id, locale)
      .then(setProduct)
      .catch(() => toast.error(t("shop.detail.notFound")))
      .finally(() => setLoading(false))
  }, [id, locale])

  useEffect(() => {
    if (!user || !product) return
    listMyReadings()
      .then(readings => {
        const productTags = new Set([
          ...(product.keyword_tags || []),
          ...(product.wuxing_tags || []),
          ...(product.astro_tags || []),
        ])
        const related = readings.filter(r =>
          r.computed_tags.some(t => productTags.has(t))
        )
        setRelatedReadings(related.slice(0, 3))
      })
      .catch(() => {})
  }, [user, product])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product)
    setAdded(true)
    toast.success(t("shop.addedToCart").replace("{name}", product.name))
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 text-center">
        <p className="text-white/40">{t("shop.detail.notFound")}</p>
        <Link href="/shop" className="text-gold text-sm mt-2 hover:underline">{t("treasureHall.backToHall")}</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* ═══ Section 1: Full-screen Product Visual ═══ */}
      <div className="detail-hero-section pt-20 pb-12 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gold/[0.03] blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Back button */}
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-white/30 hover:text-gold text-sm mb-8 transition-colors">
            <ArrowLeft size={14} /> {t("treasureHall.backToHall")}
          </button>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Large product image */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative">
                <ProductImage
                  src={product.image_url}
                  alt={product.name}
                  category={product.category}
                  size="lg"
                />
                {/* Subtle glow behind image */}
                <div className="absolute inset-0 -z-10 rounded-full bg-gold/[0.05] blur-[40px] scale-75" />
              </div>
            </div>

            {/* Product name + price + CTA */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block text-xs px-3 py-1 bg-gold/8 text-gold/60 rounded-full border border-gold/15 mb-4">
                {CATEGORY_LABELS[product.category] || product.category}
              </span>

              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gold mb-3 leading-tight">
                {locale === "en" ? (product.name_en || product.name) : product.name}
              </h1>

              {product.rating && (
                <div className="flex items-center gap-1.5 justify-center md:justify-start mb-4">
                  <Star size={14} className="text-gold fill-gold" />
                  <span className="text-gold text-sm">{product.rating}</span>
                </div>
              )}

              <div className="flex items-baseline gap-2 justify-center md:justify-start mb-6">
                {(() => {
                  const pp = getProductPrice(product, region)
                  return (
                    <>
                      <span className="text-3xl font-bold text-gold">{pp.symbol}{pp.price}</span>
                      {region === "domestic" && product.price_usd && (
                        <span className="text-white/25 text-sm">≈ ${product.price_usd}</span>
                      )}
                      {region === "overseas" && (
                        <span className="text-white/25 text-sm">≈ ¥{product.price_cny}</span>
                      )}
                    </>
                  )
                })()}
              </div>

              {product.short_pitch && (
                <div className="flex items-center gap-2 p-3 bg-gold/5 border border-gold/10 rounded-xl mb-6 justify-center md:justify-start">
                  <Sparkles size={14} className="text-gold/60 flex-shrink-0" />
                  <p className="text-gold/70 text-sm">{locale === "en" ? (product.short_pitch_en || product.short_pitch) : product.short_pitch}</p>
                </div>
              )}

              <div className="flex items-center gap-3 justify-center md:justify-start">
                <button
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-medium transition-all
                    ${added
                      ? "bg-green-500/15 border border-green-500/30 text-green-400"
                      : "btn-gold hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]"}`}
                >
                  {added ? <><Check size={16} /> {t("treasureHall.collected")}</> : <><ShoppingBag size={16} /> {t("treasureHall.collect")}</>}
                </button>
                <FavoriteButton productId={product.id} />
              </div>

              <div className="flex items-center gap-4 mt-4 text-white/15 text-[10px] justify-center md:justify-start">
                <span className="flex items-center gap-1"><Shield size={10} /> {t("shop.detail.authentic")}</span>
                <span className="flex items-center gap-1"><Package size={10} /> {t("shop.detail.freeShipping")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">

        {/* ═══ Section 2: Story Narrative ═══ */}
        {product.description && (
          <NarrativeSection className="narrative-block">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-gold/60" />
              <h2 className="text-lg font-serif text-gold/80">{t("treasureHall.story")}</h2>
            </div>
            <p className="text-white/50 text-base leading-relaxed whitespace-pre-line">
              {locale === "en" ? (product.description_en || product.description) : product.description}
            </p>
          </NarrativeSection>
        )}

        {/* ═══ Section 3: Cultural Meaning ═══ */}
        {product.efficacy && (
          <NarrativeSection className="narrative-block">
            <div className="flex items-center gap-2 mb-4">
              <Gem size={16} className="text-gold/60" />
              <h2 className="text-lg font-serif text-gold/80">{t("treasureHall.meaning")}</h2>
            </div>
            <p className="text-white/50 text-base leading-relaxed whitespace-pre-line">
              {locale === "en" ? (product.efficacy_en || product.efficacy) : product.efficacy}
            </p>

            {/* Wuxing tags */}
            {product.wuxing_tags && product.wuxing_tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-4">
                {product.wuxing_tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-gold/8 text-gold/60 rounded-full border border-gold/15">
                    {locale === "en" ? (product.keyword_tags_en?.[0] || tag) : tag}
                  </span>
                ))}
              </div>
            )}
          </NarrativeSection>
        )}

        {/* ═══ Section 4: Usage Guide ═══ */}
        {(product.usage || product.precautions) && (
          <NarrativeSection className="narrative-block">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-gold/60" />
              <h2 className="text-lg font-serif text-gold/80">{t("treasureHall.usageGuide")}</h2>
            </div>
            {product.usage && (
              <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line mb-4">
                {locale === "en" ? (product.usage_en || product.usage) : product.usage}
              </p>
            )}
            {product.precautions && (
              <div className="mt-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <p className="text-white/30 text-xs leading-relaxed whitespace-pre-line">
                  {locale === "en" ? (product.precautions_en || product.precautions) : product.precautions}
                </p>
              </div>
            )}
          </NarrativeSection>
        )}

        {/* ═══ Section 5: Specifications ═══ */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <NarrativeSection className="narrative-block">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList size={16} className="text-gold/60" />
              <h2 className="text-lg font-serif text-gold/80">{t("shop.detail.tab.specs")}</h2>
            </div>
            <div className="space-y-0">
              {Object.entries(locale === "en" ? (product.specifications_en || product.specifications) : product.specifications).map(([key, value], i, arr) => (
                <div key={key} className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                  <span className="text-white/35 text-sm">{key}</span>
                  <span className="text-white/60 text-sm">{value}</span>
                </div>
              ))}
            </div>
          </NarrativeSection>
        )}

        {/* ═══ Material + Tags ═══ */}
        {(product.material || (product.keyword_tags && product.keyword_tags.length > 0)) && (
          <NarrativeSection className="narrative-block">
            {product.material && (
              <div className="flex items-center gap-2 mb-3">
                <Package size={14} className="text-white/25" />
                <span className="text-white/40 text-sm">{t("shop.detail.material").replace("{material}", product.material)}</span>
              </div>
            )}
            {product.keyword_tags && product.keyword_tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(locale === "en" ? (product.keyword_tags_en || product.keyword_tags) : product.keyword_tags).map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-white/[0.03] border border-white/[0.06] rounded-full text-white/35">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </NarrativeSection>
        )}

        {/* ═══ Related Readings ═══ */}
        {relatedReadings.length > 0 && (
          <NarrativeSection className="narrative-block">
            <h2 className="font-serif text-lg text-gold/80 mb-4">{t("shop.detail.relatedReadings")}</h2>
            <div className="space-y-3">
              {relatedReadings.map(r => (
                <Link key={r.id} href={`/reading/${r.id}`}
                  className="block card-glass p-4 hover:border-gold/30 transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">{t("shop.detail.readingReport")}</p>
                      <p className="text-white/25 text-xs">{new Date(r.created_at).toLocaleDateString("zh-CN")}</p>
                    </div>
                    <ChevronRight size={14} className="text-white/15 group-hover:text-gold transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </NarrativeSection>
        )}

        {/* ═══ Reviews ═══ */}
        <div className="mt-8 pb-8">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {/* ═══ Sticky bottom CTA bar (mobile) ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-ink/95 backdrop-blur-xl border-t border-white/[0.08] px-4 py-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-gold font-bold text-lg truncate">{getProductPrice(product, region).symbol}{getProductPrice(product, region).price}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              added
                ? "bg-green-500/15 border border-green-500/30 text-green-400"
                : "btn-gold"
            }`}
          >
            {added ? <><Check size={14} /></> : <><ShoppingBag size={14} /> {t("treasureHall.collect")}</>}
          </button>
        </div>
      </div>
    </div>
  )
}
