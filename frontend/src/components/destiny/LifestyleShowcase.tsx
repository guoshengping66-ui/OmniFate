"use client"
import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import { listProducts, type Product } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRegion } from "@/contexts/RegionContext"
import { getProductPrice } from "@/lib/regionPrice"
import { ProductImage } from "@/components/shop/ProductImage"

export default function LifestyleShowcase() {
  const { t, locale, localeHref } = useLanguage()
  const isZh = locale === "zh"
  const { region } = useRegion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    listProducts(undefined, locale)
      .then(all => {
        const sorted = [...all]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 3)
        setProducts(sorted)
      })
      .catch((err) => {
        console.warn("[LifestyleShowcase] Failed to load products:", err)
      })
      .finally(() => setLoading(false))
  }, [locale])

  return (
    <section
      ref={containerRef}
      className="relative py-16 md:py-32 px-4"
    >
      {/* Subtle backdrop for readability */}
      <div className="absolute inset-0 bg-[#080808]/50 pointer-events-none" />

      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[#C5A880]/[0.02] blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <div
          className="text-center mb-12 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          <span className="text-[#C5A880]/50 text-xs tracking-[0.4em] uppercase font-medium">
            {isZh ? "PROFILE-MATCHED PICKS" : "PROFILE-MATCHED PICKS"}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-4 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {isZh ? "\u85cf\u5b9d\u9601\u5339\u914d\u9884\u89c8" : "Vault Match Preview"}
            </span>
          </h2>
          <p className="text-white/30 text-sm max-w-lg mx-auto">
            {isZh
              ? "\u5546\u54c1\u4fdd\u7559\uff0c\u4f46\u4e0d\u505a\u666e\u901a\u5546\u57ce\u3002\u89c2\u6211\u4f1a\u628a\u4f60\u7684\u753b\u50cf\u3001\u8d8b\u52bf\u548c\u6210\u957f\u8bfe\u9898\u8f6c\u6210\u66f4\u5177\u4f53\u7684\u751f\u6d3b\u65b9\u5f0f\u5339\u914d\u5efa\u8bae\u3002"
              : "The shop stays, but not as a generic storefront. Guanwo turns your profile, trend, and growth task into concrete lifestyle matches."}
          </p>
        </div>

        {/* Product cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-3xl p-6 animate-pulse"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-full h-40 rounded-2xl bg-white/[0.04] mb-4" />
                <div className="h-4 bg-white/[0.06] rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/[0.04] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 transition-all duration-1000 delay-300"
            style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(20px)" }}
          >
            {products.map((product, i) => {
              const price = getProductPrice(product, region)
              return (
                <Link
                  key={product.id}
                  href={localeHref(`/shop/${product.id}`)}
                  className="group block rounded-3xl overflow-hidden transition-all duration-500"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(30px)",
                    transitionDelay: `${0.3 + i * 0.12}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(197,168,128,0.25)"
                    e.currentTarget.style.boxShadow = "0 0 40px rgba(197,168,128,0.08)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  {/* Product image */}
                  <div className="p-5 flex justify-center">
                    <ProductImage
                      src={product.image_url}
                      alt={product.name}
                      category={product.category}
                      size="md"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Product info */}
                  <div className="px-5 pb-5 space-y-2">
                    <h3 className="font-serif font-bold text-sm text-white/70 group-hover:text-[#C5A880] transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-1.5">
                        <Star size={11} className="text-[#C5A880]/60 fill-[#C5A880]/60" />
                        <span className="text-[11px] text-[#C5A880]/60">{product.rating}</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="text-[#C5A880] font-bold text-base">
                      {price.symbol}{price.price.toFixed(0)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : null}

        {/* View all CTA */}
        <div
          className="text-center mt-12 transition-all duration-1000 delay-500"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          <Link
            href={localeHref("/shop")}
            className="group inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-medium text-sm tracking-wider transition-all duration-500"
            style={{
              background: "linear-gradient(135deg, rgba(197,168,128,0.1), rgba(197,168,128,0.03))",
              border: "1px solid rgba(197,168,128,0.2)",
              color: "#C5A880",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(197,168,128,0.18), rgba(197,168,128,0.06))"
              e.currentTarget.style.borderColor = "rgba(197,168,128,0.4)"
              e.currentTarget.style.boxShadow = "0 0 30px rgba(197,168,128,0.1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(197,168,128,0.1), rgba(197,168,128,0.03))"
              e.currentTarget.style.borderColor = "rgba(197,168,128,0.2)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            {isZh ? "\u67e5\u770b\u6211\u7684\u5339\u914d\u597d\u7269" : "View matched items"}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
