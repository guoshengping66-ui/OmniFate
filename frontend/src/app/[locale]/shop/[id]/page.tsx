"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Link } from "@/i18n/navigation"
import {
  Loader2, ArrowLeft, ShoppingCart, Check, Star, Heart,
  Sparkles, Tag, Package, Shield, ChevronRight,
  BookOpen, AlertTriangle, Zap, ClipboardList,
} from "lucide-react"
import { ProductImage } from "@/components/shop/ProductImage"
import toast from "react-hot-toast"
import { getProduct, listMyReadings, type Product, type ReadingListItem } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { ProductReviews } from "@/components/shop/ProductReviews"
import { FavoriteButton } from "@/components/shop/FavoriteButton"
import { useState as useStateLocal } from "react"

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { addItem } = useCart()
  const { t, locale, localeHref } = useLanguage()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const [relatedReadings, setRelatedReadings] = useState<ReadingListItem[]>([])

  const CATEGORY_LABELS: Record<string, string> = {
    crystal: t("shop.category.crystal"), jewelry: t("shop.category.jewelry"),
    incense: t("shop.category.incense"), talisman: t("shop.category.talisman"),
    book: t("shop.category.book"), service: t("shop.category.service"),
    other: t("shop.category.other"),
  }

  useEffect(() => {
    if (!id) return
    getProduct(id, locale)
      .then(setProduct)
      .catch(() => toast.error(t("shop.detail.notFound")))
      .finally(() => setLoading(false))
  }, [id, locale])

  // Load user's readings to show "related readings" for this product
  useEffect(() => {
    if (!user || !product) return
    listMyReadings()
      .then(readings => {
        // Filter readings whose tags match the product's tags
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
    setTimeout(() => setAdded(false), 1500)
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
        <Link href={localeHref("/shop")} className="text-gold text-sm mt-2 hover:underline">{t("shop.detail.backToShop")}</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/40 hover:text-gold text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> {t("shop.detail.back")}
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Product image */}
          <div className="card-glass p-8 flex flex-col items-center justify-center">
            <ProductImage
              src={product.image_url}
              alt={product.name}
              category={product.category}
              size="lg"
            />
            {/* Category badge */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 bg-gold/10 text-gold/70 rounded-full border border-gold/20">
                {CATEGORY_LABELS[product.category] || product.category}
              </span>
              <FavoriteButton productId={product.id} />
            </div>
          </div>

          {/* Right: Product info */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-serif font-bold text-gold mb-2">{product.name}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1 mb-4">
                <Star size={14} className="text-gold fill-gold" />
                <span className="text-gold text-sm">{product.rating}</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-gold">¥{product.price_cny}</span>
              {product.price_usd && (
                <span className="text-white/30 text-sm">≈ ${product.price_usd}</span>
              )}
            </div>

            {/* Short pitch */}
            {product.short_pitch && (
              <div className="flex items-center gap-2 p-3 bg-gold/5 border border-gold/15 rounded-xl mb-4">
                <Sparkles size={14} className="text-gold flex-shrink-0" />
                <p className="text-gold/80 text-sm">{product.short_pitch}</p>
              </div>
            )}

            {/* Description */}
            <p className="text-white/60 text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Material */}
            {product.material && (
              <div className="flex items-center gap-2 mb-3">
                <Package size={14} className="text-white/30" />
                <span className="text-white/50 text-sm">{t("shop.detail.material").replace("{material}", product.material)}</span>
              </div>
            )}

            {/* Tags */}
            {product.keyword_tags && product.keyword_tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {product.keyword_tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-white/40">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Add to cart */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all
                  ${added
                    ? "bg-green-500/15 border border-green-500/30 text-green-400"
                    : "btn-gold"}`}
              >
                {added ? <><Check size={16} /> {t("shop.detail.addedToCart2")}</> : <><ShoppingCart size={16} /> {t("shop.addToCart")}</>}
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 mt-4 text-white/20 text-[10px]">
              <span className="flex items-center gap-1"><Shield size={10} /> {t("shop.detail.authentic")}</span>
              <span className="flex items-center gap-1"><Package size={10} /> {t("shop.detail.freeShipping")}</span>
            </div>
          </div>
        </div>

        {/* ── Detailed Content Tabs ── */}
        {(product.efficacy || product.usage || product.precautions || product.specifications) && (
          <div className="mt-12">
            <ProductDetailTabs product={product} t={t as unknown as (key: string) => string} />
          </div>
        )}

        {/* Related Readings */}
        {relatedReadings.length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif text-lg text-gold mb-4">{t("shop.detail.relatedReadings")}</h2>
            <div className="space-y-3">
              {relatedReadings.map(r => (
                <Link key={r.id} href={localeHref(`/reading/${r.id}`)}
                  className="block card-glass p-4 hover:border-gold/30 transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">{t("shop.detail.readingReport")}</p>
                      <p className="text-white/30 text-xs">{new Date(r.created_at).toLocaleDateString("zh-CN")}</p>
                    </div>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-gold transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-12">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  )
}

// ── Product Detail Tabs ──────────────────────────────────────────────────

type DetailTab = "efficacy" | "usage" | "precautions" | "specs"

function ProductDetailTabs({ product, t }: { product: Product; t: (key: string) => string }) {
  const [activeTab, setActiveTab] = useStateLocal<DetailTab>("efficacy")

  const tabs: { key: DetailTab; icon: React.ReactNode; label: string; show: boolean }[] = [
    { key: "efficacy", icon: <Zap size={14} />, label: t("shop.detail.tab.efficacy"), show: !!product.efficacy },
    { key: "usage", icon: <BookOpen size={14} />, label: t("shop.detail.tab.usage"), show: !!product.usage },
    { key: "precautions", icon: <AlertTriangle size={14} />, label: t("shop.detail.tab.precautions"), show: !!product.precautions },
    { key: "specs", icon: <ClipboardList size={14} />, label: t("shop.detail.tab.specs"), show: !!product.specifications },
  ]

  const visibleTabs = tabs.filter(tab => tab.show)
  if (visibleTabs.length === 0) return null

  return (
    <div className="card-glass p-6">
      {/* Tab headers */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none mb-5 border-b border-white/10 pb-3">
        {visibleTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-gold/15 text-gold border border-gold/30"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[120px]">
        {activeTab === "efficacy" && product.efficacy && (
          <div>
            <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
              <Zap size={14} className="text-gold" />
              {t("shop.detail.tab.efficacy")}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{product.efficacy}</p>
          </div>
        )}

        {activeTab === "usage" && product.usage && (
          <div>
            <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
              <BookOpen size={14} className="text-gold" />
              {t("shop.detail.tab.usage")}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{product.usage}</p>
          </div>
        )}

        {activeTab === "precautions" && product.precautions && (
          <div>
            <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-gold" />
              {t("shop.detail.tab.precautions")}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{product.precautions}</p>
          </div>
        )}

        {activeTab === "specs" && product.specifications && (
          <div>
            <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
              <ClipboardList size={14} className="text-gold" />
              {t("shop.detail.tab.specs")}
            </h3>
            <div className="space-y-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-white/40 text-xs">{key}</span>
                  <span className="text-white/70 text-xs">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
