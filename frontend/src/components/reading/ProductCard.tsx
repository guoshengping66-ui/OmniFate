import { useState } from "react"
import { Star, ShoppingCart, ExternalLink, Sparkles, Check } from "lucide-react"
import { Link } from "@/i18n/navigation"
import type { Product } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { ProductImage } from "@/components/shop/ProductImage"
import toast from "react-hot-toast"

function getGlowClass(score?: number): string {
  if (score == null) return "border-gold/20"
  if (score >= 10) return "border-gold border-2 shadow-[0_0_30px_rgba(201,168,76,0.4)]"
  if (score >= 7) return "border-gold/70 shadow-[0_0_20px_rgba(201,168,76,0.25)]"
  if (score >= 4) return "border-gold/40 shadow-[0_0_10px_rgba(201,168,76,0.12)]"
  return "border-gold/20"
}

function getGlowIntensity(score?: number): string {
  if (score == null) return "opacity-0"
  if (score >= 10) return "opacity-70"
  if (score >= 7) return "opacity-40"
  if (score >= 4) return "opacity-20"
  return "opacity-0"
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { t, localeHref } = useLanguage()
  const [added, setAdded] = useState(false)
  const hasMatch = product.match_score != null && product.match_score > 0
  const glowClass = getGlowClass(product.match_score)
  const glowIntensity = getGlowIntensity(product.match_score)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setAdded(true)
    toast.success(t("shop.addedToCart").replace("{name}", product.name))
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link href={localeHref(`/shop/${product.id}`)} className={`block relative card-glow p-5 flex gap-4 overflow-hidden ${glowClass} hover:border-gold/40 transition-all duration-300`}>
      {/* ── Animated energy flow (glow ring) ── */}
      {hasMatch && (
        <>
          {/* Flowing golden border */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `conic-gradient(from var(--angle, 0deg),
                transparent 0%,
                rgba(201,168,76,${glowIntensity}) 25%,
                transparent 50%,
                rgba(201,168,76,${glowIntensity}) 75%,
                transparent 100%
              )`,
              animation: "glow-rotate 4s linear infinite",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "2px",
            }}
          />
          {/* Subtle ambient glow */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, rgba(201,168,76,${glowIntensity}) 0%, transparent 70%)`,
              opacity: 0.3,
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          />
        </>
      )}

      {/* Image */}
      <ProductImage
        src={product.image_url}
        alt={product.name}
        category={product.category}
        size="md"
        className="flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-medium text-white text-sm leading-tight">{product.name}</h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {hasMatch && (
              <span className="flex items-center gap-0.5 text-xs text-gold/80">
                <Sparkles size={10} className="fill-gold/30" />
                {product.match_score?.toFixed(1)}
              </span>
            )}
            {product.rating && (
              <div className="flex items-center gap-0.5">
                <Star size={11} className="text-gold fill-gold" />
                <span className="text-xs text-gold">{product.rating}</span>
              </div>
            )}
          </div>
        </div>

        {product.short_pitch && (
          <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-2">
            {product.short_pitch}
          </p>
        )}

        {/* ── LLM-generated recommendation text ── */}
        {product.recommendation_text && (
          <p className="text-gold/70 text-xs leading-relaxed italic mb-2 border-l-2 border-gold/30 pl-2">
            &ldquo;{product.recommendation_text}&rdquo;
          </p>
        )}

        {/* Match reasons */}
        {product.match_reasons && product.match_reasons.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2">
            {product.match_reasons.slice(0, 2).map(r => (
              <span key={r} className="text-xs px-1.5 py-0.5 bg-gold/10 text-gold/70 rounded-full">
                {r}
              </span>
            ))}
          </div>
        )}

        {/* keyword tags */}
        {!hasMatch && product.keyword_tags && (
          <div className="flex gap-1 flex-wrap mb-3">
            {product.keyword_tags.slice(0, 3).map(t => (
              <span key={t} className="text-xs px-1.5 py-0.5 bg-gold/10 text-gold/70 rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-gold font-bold">¥{product.price_cny.toFixed(0)}</span>
          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all
              ${added
                ? "bg-green-500/20 border border-green-500/40 text-green-400"
                : "bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20"}`}
          >
            {added ? <Check size={12} /> : <ShoppingCart size={12} />}
            {added ? t("shop.added") : t("shop.addToCart")}
          </button>
        </div>
      </div>
    </Link>
  )
}
