"use client"
import Link from "next/link"
import { ArrowRight, ShoppingBag } from "lucide-react"
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

const SYSTEMS = [
  { key: "bazi", icon: "☯", color: "#2D6A4F", score: "9.2" },
  { key: "astrology", icon: "✦", color: "#C1121F", score: "8.8" },
  { key: "tarot", icon: "🃏", color: "#C9A84C", score: "9.0" },
  { key: "face", icon: "👁", color: "#E8D5B7", score: "8.5" },
  { key: "palm", icon: "🤚", color: "#2980B9", score: "8.7" },
]

export default function MarketingPage() {
  const { t, localeHref } = useLanguage()

  return (
    <div className="min-h-screen">
      <FloatingCTA />
      <FloatingFortuneSubscribe />

      {/* ══════════ HERO ══════════ */}
      <section className="relative flex items-center overflow-hidden pt-20 pb-8" style={{ minHeight: "78vh" }}>
        <HeroScene />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-ink pointer-events-none" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-gold/20 rounded-full px-3 py-1 text-gold text-[11px] mb-4">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
                </span>
                {t("hero.badge")}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h1 className="text-[1.75rem] md:text-4xl lg:text-5xl font-serif font-bold leading-[1.15] mb-4">
                <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                  {t("hero.title1")}
                </span>
                <br />
                <span className="text-white/90">{t("hero.title2")}</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-sm md:text-base text-white/45 max-w-xl leading-relaxed mb-6">
                <span className="text-gold/70">{t("hero.desc").split("\n")[0]}</span>
                <br />
                {t("hero.desc").split("\n")[1]}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <MagneticButton>
                  <Link
                    href={localeHref("/reading/new")}
                    className="btn-gold text-sm inline-flex items-center gap-2 px-8 py-3 group"
                  >
                    {t("hero.cta1")}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    href={localeHref("/shop")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 text-white/50 hover:border-gold/30 hover:text-gold transition-all text-sm backdrop-blur-sm"
                  >
                    <ShoppingBag size={14} />
                    {t("hero.cta2")}
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-white/[0.05]">
                <p className="text-white/20 text-[11px] tracking-wide">{t("hero.trust")}</p>
                <span className="hidden sm:block w-px h-3 bg-white/10" />
                <div className="flex items-center gap-3 text-white/30 text-[11px]">
                  <span>{t("hero.stat1")}</span>
                  <span className="text-gold/60">★ 4.9</span>
                  <span className="hidden sm:inline">{t("hero.stat3")}</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════════ 五大系统快速入口 — 青囊风格紧凑卡片 ══════════ */}
      <section className="relative z-10 -mt-4 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal delay={0.1}>
            <div className="grid grid-cols-5 gap-2">
              {SYSTEMS.map((sys) => (
                <a
                  key={sys.key}
                  href="#agents"
                  className="flex flex-col items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-2 py-3 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300 group"
                >
                  <span className="text-lg">{sys.icon}</span>
                  <span className="text-white/50 text-[11px] font-medium group-hover:text-white/70 transition-colors text-center leading-tight">
                    {t(`agent.${sys.key}._label`)}
                  </span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: `${sys.color}15`, color: `${sys.color}cc` }}
                  >
                    {sys.score}
                  </span>
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
