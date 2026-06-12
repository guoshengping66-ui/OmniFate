"use client"

import Link from "next/link"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useLanguage } from "@/contexts/LanguageContext"
import dynamic from "next/dynamic"

const CuratedProducts = dynamic(() => import("@/components/shop/CuratedProducts").then(m => m.CuratedProducts), {
  ssr: false,
  loading: () => <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

export default function ShopSection() {
  const { t, localeHref } = useLanguage()

  return (
    <section className="py-24 px-4 bg-white/[0.015]">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 text-gold text-xs mb-4">
              <ShoppingBag size={12} />
              {t("homepage.shop.badge")}
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              {t("homepage.shop.title")}
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              {t("homepage.shop.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <CuratedProducts />

        <ScrollReveal delay={0.2}>
          <div className="text-center mt-8">
            <Link
              href={localeHref("/shop")}
              className="inline-flex items-center gap-2 text-gold/60 hover:text-gold text-sm transition-colors"
            >
              {t("homepage.shop.viewAll")}
              <ArrowRight size={14} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
