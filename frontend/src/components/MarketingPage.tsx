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

/** 五大分析系统 — Hero 下方快速入口 */
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
      <section className="relative flex items-center overflow-hidden pt-20 pb-12" style={{ minHeight: "80vh" }}>
        {/* Background */}
        <HeroScene />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/30 to-ink pointer-events-none" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            {/* Badge */}
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-full px-4 py-1.5 text-gold/80 text-xs mb-6">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold/60 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold/80" />
                </span>
                {t("hero.badge")}
              </div>
            </ScrollReveal>

            {/* Title */}
            <ScrollReveal delay={0.1}>
              <h1 className="text-[1.75rem] md:text-4xl lg:text-5xl font-serif font-bold leading-[1.2] mb-5">
                <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                  {t("hero.title1")}
                </span>
                <br />
                <span className="text-white/90">{t("hero.title2")}</span>
              </h1>
            </ScrollReveal>

            {/* Description */}
            <ScrollReveal delay={0.2}>
              <p className="text-sm md:text-base text-white/45 max-w-lg leading-relaxed mb-8">
                <span className="text-gold/70">{t("hero.desc").split("\n")[0]}</span>
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
                    className="btn-gold inline-flex items-center gap-2 px-8 py-3 text-base group"
                  >
                    {t("hero.cta1")}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>

                <MagneticButton>
                  <Link
                    href={localeHref("/shop")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.12] text-white/50 hover:border-gold/30 hover:text-gold/80 transition-all text-base"
                  >
                    <ShoppingBag size={15} />
                    {t("hero.cta2")}
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>

            {/* Trust + Stats inline */}
            <ScrollReveal delay={0.4}>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 mt-8 pt-6 border-t border-white/[0.06]">
                <p className="text-white/30 text-xs tracking-wide">{t("hero.trust")}</p>
                <span className="hidden sm:block w-px h-3.5 bg-white/[0.08]" />
                <div className="flex items-center gap-4 text-white/40 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={11} className="text-gold/50" />
                    {t("hero.stat1")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-gold/70">★</span>
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
      <section className="relative z-10 -mt-8 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal delay={0.1}>
            <div className="flex overflow-x-auto scrollbar-none gap-2.5 pb-2 justify-start sm:justify-center">
              {SYSTEMS.map((sys, i) => (
                <a
                  key={sys.key}
                  href={`#agents`}
                  className="flex-shrink-0 flex items-center gap-2 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl px-3.5 py-2 hover:border-gold/20 hover:bg-white/[0.05] transition-all duration-300 group"
                >
                  <span className="text-base" style={{ filter: `drop-shadow(0 0 4px ${sys.color}30)` }}>{sys.icon}</span>
                  <span className="text-white/50 text-xs font-medium group-hover:text-white/70 transition-colors whitespace-nowrap">
                    {t(`agent.${sys.key}._label`)}
                  </span>
                  <span
                    className="w-1 h-1 rounded-full opacity-40"
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
