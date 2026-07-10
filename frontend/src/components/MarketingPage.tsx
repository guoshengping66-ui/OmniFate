"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { useLanguage } from "@/contexts/LanguageContext"

const HeroScene = dynamic(() => import("@/components/ui/HeroScene").then((m) => m.HeroScene), { ssr: false })
const CuratedProducts = dynamic(() => import("@/components/shop/CuratedProducts").then((m) => m.CuratedProducts), {
  ssr: false,
  loading: () => <div className="py-16 text-center"><div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gold/30 border-t-gold" /></div>,
})
const MarketingBelowFold = dynamic(() => import("@/components/MarketingBelowFold").then((m) => m.MarketingBelowFold), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gold/30 border-t-gold" /></div>,
})

const SYSTEMS = [
  { key: "bazi", icon: "Birth", color: "#2D6A4F", score: "9.2" },
  { key: "astrology", icon: "Stars", color: "#C1121F", score: "8.8" },
  { key: "tarot", icon: "Symbol", color: "#C9A84C", score: "9.0" },
  { key: "face", icon: "Visual", color: "#E8D5B7", score: "8.5" },
  { key: "palm", icon: "Path", color: "#2980B9", score: "8.7" },
]

export default function MarketingPage() {
  const { t, localeHref } = useLanguage()

  return (
    <div className="min-h-screen">
      <section className="relative flex items-center overflow-hidden pb-8 pt-20" style={{ minHeight: "78vh" }}>
        <HeroScene />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-ink" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <ScrollReveal>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/5 px-3 py-1 text-[11px] text-gold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
                </span>
                {t("hero.badge")}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h1 className="mb-4 font-serif text-[1.75rem] font-bold leading-[1.15] md:text-4xl lg:text-5xl">
                <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                  {t("hero.title1")}
                </span>
                <br />
                <span className="text-white/90">{t("hero.title2")}</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="mb-6 max-w-xl text-sm leading-relaxed text-white/45 md:text-base">
                <span className="text-gold/70">{t("hero.desc").split("\n")[0]}</span>
                <br />
                {t("hero.desc").split("\n")[1]}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="flex flex-col items-start gap-3 sm:flex-row">
                <MagneticButton>
                  <Link
                    href={localeHref("/reading/new")}
                    className="btn-gold group inline-flex items-center gap-2 px-8 py-3 text-sm"
                  >
                    {t("hero.cta1")}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    href={localeHref("/shop")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-white/50 transition-all hover:border-gold/30 hover:text-gold"
                  >
                    <ShoppingBag size={14} />
                    {t("hero.cta2")}
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-4 pb-6">
        <div className="mx-auto max-w-4xl px-4">
          <ScrollReveal delay={0.1}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {SYSTEMS.map((sys) => (
                <a
                  key={sys.key}
                  href="#agents"
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.06] bg-[#030918] px-2 py-3 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{sys.icon}</span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
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

      <CuratedProducts />
      <MarketingBelowFold />
    </div>
  )
}
