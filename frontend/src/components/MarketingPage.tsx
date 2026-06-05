"use client"
import Link from "next/link"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { useLanguage } from "@/contexts/LanguageContext"
import { StatsSection } from "@/components/ui/StatsSection"
import dynamic from "next/dynamic"

const FloatingCTA = dynamic(() => import("@/components/ui/FloatingCTA").then(m => m.FloatingCTA), { ssr: false })
const HeroScene = dynamic(() => import("@/components/ui/HeroScene").then(m => m.HeroScene), { ssr: false })
const FloatingRunes = dynamic(() => import("@/components/ui/FloatingRunes").then(m => m.FloatingRunes), { ssr: false })
const FloatingFortuneSubscribe = dynamic(() => import("@/components/ui/FloatingFortuneSubscribe").then(m => m.FloatingFortuneSubscribe), { ssr: false })
const CuratedProducts = dynamic(() => import("@/components/shop/CuratedProducts").then(m => m.CuratedProducts), {
  ssr: false,
  loading: () => <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})
const MarketingBelowFold = dynamic(() => import("@/components/MarketingBelowFold").then(m => m.MarketingBelowFold), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

export default function MarketingPage() {
  const { t, localeHref } = useLanguage()

  return (
    <div className="min-h-screen">
      <FloatingCTA />
      <FloatingFortuneSubscribe />

      {/* ══════════ HERO ══════════ */}
      <section className="relative flex items-center overflow-hidden pt-24 pb-16" style={{ minHeight: "85vh" }}>
        {/* Cyber astrolabe background */}
        <HeroScene />
        <FloatingRunes />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/30 to-ink pointer-events-none" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-gold/20 rounded-full px-4 py-1.5 text-gold text-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                </span>
                {t("hero.badge")}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <h1 className="text-[2.5rem] md:text-6xl lg:text-7xl font-serif font-bold leading-[1.05] mb-6">
                <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                  {t("hero.title1")}
                </span>
                <br />
                <span className="text-white">{t("hero.title2")}</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="text-lg md:text-xl text-white/50 max-w-xl leading-relaxed mb-10 whitespace-pre-line">
                <span className="text-gold">{t("hero.desc").split("\n")[0]}</span>
                <br />
                {t("hero.desc").split("\n")[1]}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.45}>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Primary CTA → Free Reading */}
                <MagneticButton>
                  <Link
                    href={localeHref("/reading/new")}
                    className="btn-gold pulse-ring text-base inline-flex items-center gap-2 px-10 py-4 text-lg group"
                  >
                    {t("hero.cta1")}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>

                {/* Secondary CTA → Shop */}
                <MagneticButton>
                  <Link
                    href={localeHref("/shop")}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white/60 hover:border-gold/30 hover:text-gold transition-all text-lg backdrop-blur-sm"
                  >
                    <ShoppingBag size={18} />
                    {t("hero.cta2")}
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>

            {/* Trust micro-label */}
            <ScrollReveal delay={0.55}>
              <p className="text-white/25 text-xs mt-4 tracking-wide">{t("hero.trust")}</p>
            </ScrollReveal>

            {/* Social proof strip */}
            <StatsSection />
          </div>
        </div>
      </section>

      {/* ══════════ CURATED PRODUCTS (inline, no lazy) ══════════ */}
      <CuratedProducts />

      {/* ══════════ BELOW FOLD (lazy-loaded) ══════════ */}
      <MarketingBelowFold />
    </div>
  )
}
