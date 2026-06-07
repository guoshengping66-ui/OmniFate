"use client"
import Link from "next/link"
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { useLanguage } from "@/contexts/LanguageContext"
import dynamic from "next/dynamic"

const FloatingCTA = dynamic(() => import("@/components/ui/FloatingCTA").then(m => m.FloatingCTA), { ssr: false })
const HeroScene = dynamic(() => import("@/components/ui/HeroScene").then(m => m.HeroScene), { ssr: false })
const FloatingFortuneSubscribe = dynamic(() => import("@/components/ui/FloatingFortuneSubscribe").then(m => m.FloatingFortuneSubscribe), { ssr: false })
const CuratedProducts = dynamic(() => import("@/components/shop/CuratedProducts").then(m => m.CuratedProducts), {
  ssr: false,
  loading: () => <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})
const MarketingBelowFold = dynamic(() => import("@/components/MarketingBelowFold").then(m => m.MarketingBelowFold), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" /></div>,
})

/** 五大命理系统 — Hero 下方快速入口 */
const SYSTEMS = [
  { key: "bazi", icon: "☯", color: "#2D6A4F" },
  { key: "astrology", icon: "✦", color: "#C1121F" },
  { key: "tarot", icon: "🃏", color: "#C9A84C" },
  { key: "face", icon: "👁", color: "#E8D5B7" },
  { key: "palm", icon: "🤚", color: "#2980B9" },
]

export default function MarketingPage() {
  const { t, localeHref } = useLanguage()

  return (
    <div className="min-h-screen">
      <FloatingCTA />
      <FloatingFortuneSubscribe />

      {/* ══════════ HERO ══════════ */}
      <section className="relative flex items-center overflow-hidden pt-20 pb-12" style={{ minHeight: "82vh" }}>
        {/* Background */}
        <HeroScene />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-ink pointer-events-none" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            {/* Badge */}
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-gold/20 rounded-full px-4 py-1.5 text-gold text-xs mb-5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
                </span>
                {t("hero.badge")}
              </div>
            </ScrollReveal>

            {/* Title */}
            <ScrollReveal delay={0.1}>
              <h1 className="text-[2rem] md:text-5xl lg:text-6xl font-serif font-bold leading-[1.1] mb-5">
                <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                  {t("hero.title1")}
                </span>
                <br />
                <span className="text-white">{t("hero.title2")}</span>
              </h1>
            </ScrollReveal>

            {/* Description */}
            <ScrollReveal delay={0.2}>
              <p className="text-base md:text-lg text-white/50 max-w-xl leading-relaxed mb-8">
                <span className="text-gold/80">{t("hero.desc").split("\n")[0]}</span>
                <br />
                {t("hero.desc").split("\n")[1]}
              </p>
            </ScrollReveal>

            {/* CTAs */}
            <ScrollReveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <MagneticButton>
                  <Link
                    href={localeHref("/reading/new")}
                    className="btn-gold pulse-ring text-base inline-flex items-center gap-2 px-10 py-3.5 text-lg group"
                  >
                    {t("hero.cta1")}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>

                <MagneticButton>
                  <Link
                    href={localeHref("/shop")}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white/60 hover:border-gold/30 hover:text-gold transition-all text-base backdrop-blur-sm"
                  >
                    <ShoppingBag size={16} />
                    {t("hero.cta2")}
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>

            {/* Trust + Stats inline */}
            <ScrollReveal delay={0.4}>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-white/[0.06]">
                <p className="text-white/25 text-xs tracking-wide">{t("hero.trust")}</p>
                <span className="hidden sm:block w-px h-4 bg-white/10" />
                <div className="flex items-center gap-4 text-white/35 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-gold/50" />
                    {t("hero.stat1")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-gold">★</span>
                    4.9
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5">
                    {t("hero.stat3")}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════════ 五大系统快速入口 ══════════ */}
      <section className="relative z-10 -mt-6 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal delay={0.1}>
            <div className="flex overflow-x-auto scrollbar-none gap-3 pb-2 justify-start sm:justify-center">
              {SYSTEMS.map((sys, i) => (
                <a
                  key={sys.key}
                  href={`#agents`}
                  className="flex-shrink-0 flex items-center gap-2.5 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-2.5 hover:border-gold/25 hover:bg-white/[0.07] transition-all duration-300 group"
                >
                  <span className="text-lg" style={{ filter: `drop-shadow(0 0 6px ${sys.color}40)` }}>{sys.icon}</span>
                  <span className="text-white/60 text-sm font-medium group-hover:text-white/80 transition-colors whitespace-nowrap">
                    {t(`agent.${sys.key}._label`)}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full opacity-60"
                    style={{ background: sys.color }}
                  />
                </a>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ CURATED PRODUCTS ══════════ */}
      <CuratedProducts />

      {/* ══════════ BELOW FOLD ══════════ */}
      <MarketingBelowFold />
    </div>
  )
}
