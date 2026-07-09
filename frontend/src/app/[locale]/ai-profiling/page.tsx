"use client"
import Link from "next/link"
import { ArrowRight, AlertTriangle, Brain, BarChart3, Check, Sparkles, Shield, Zap, Target, TrendingUp, FileText } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { TiltCard } from "@/components/ui/TiltCard"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { useLanguage } from "@/contexts/LanguageContext"
import { Footer } from "@/components/ui/Footer"

const VALUE_ICONS = [AlertTriangle, Brain, BarChart3]

const REPORT_ICONS = [Sparkles, Target, Shield, Zap, TrendingUp]

export default function AiProfilingPage() {
  const { t, localeHref } = useLanguage()
  const p = (key: string) => t(`aiProfiling.${key}`) as string
  const pi = (key: string) => t(`aiProfiling.${key}`) as string[]

  return (
    <div className="min-h-screen">
      {/* ══════════ 1. HERO SECTION ══════════ */}
      <section className="relative flex items-center overflow-hidden pt-20 pb-16" style={{ minHeight: "85vh" }}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B2A] via-[#1B2838] to-ink pointer-events-none" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 bg-white/5  border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-xs mb-5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-400" />
                </span>
                {p("hero.badge")}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h1 className="text-[2rem] md:text-5xl lg:text-6xl font-serif font-bold leading-[1.1] mb-5">
                <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                  {p("hero.title1")}
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-gold bg-clip-text text-transparent">
                  {p("hero.title2")}
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-base md:text-lg text-white/50 max-w-xl leading-relaxed mb-8">
                {p("hero.subtitle")}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <MagneticButton>
                  <Link
                    href={localeHref("/reading/new")}
                    className="btn-gold text-base inline-flex items-center gap-2 px-10 py-3.5 group"
                  >
                    {p("hero.cta1")}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    href={localeHref("/pricing")}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/[0.08] text-white/60 hover:border-blue-400/30 hover:text-blue-400 transition-all text-base "
                  >
                    <FileText size={16} />
                    {p("hero.cta2")}
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-white/[0.06]">
                <p className="text-white/25 text-xs tracking-wide">{p("hero.trust")}</p>
                <span className="hidden sm:block w-px h-4 bg-white/10" />
                <div className="flex items-center gap-4 text-white/35 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-blue-400/50" />
                    {p("hero.stat1")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-blue-400">★</span>
                    97.3%
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5">
                    {p("hero.stat3")}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════════ 2. VALUE SECTION ══════════ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge={p("value.badge")}
            title={p("value.title")}
            subtitle={p("value.subtitle")}
          />
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {pi("value.items").map((item: string, i: number) => {
              const Icon = VALUE_ICONS[i]
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="card-glass p-6 h-full">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                      <Icon size={22} className="text-blue-400" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">{t(`aiProfiling.value.items.${i}.title`)}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{t(`aiProfiling.value.items.${i}.desc`)}</p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════ 3. PRODUCT EXPLANATION ══════════ */}
      <section className="py-20 px-4 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge={p("product.badge")}
            title={p("product.title")}
            subtitle={p("product.subtitle")}
          />
          <div className="mt-12 space-y-6">
            <ScrollReveal>
              <div className="card-glass p-8">
                <p className="text-white/60 text-base leading-relaxed mb-4">{p("product.desc1")}</p>
                <p className="text-white/45 text-sm leading-relaxed">{p("product.desc2")}</p>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {[0, 1, 2].map(i => (
                <ScrollReveal key={i} delay={i * 0.15}>
                  <div className="card-glass p-6 relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-5xl font-bold text-white/[0.03] font-serif">
                      {t(`aiProfiling.product.steps.${i}.num`)}
                    </div>
                    <div className="relative">
                      <h3 className="text-white font-semibold mb-2">{t(`aiProfiling.product.steps.${i}.title`)}</h3>
                      <p className="text-white/45 text-sm leading-relaxed">{t(`aiProfiling.product.steps.${i}.desc`)}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 4. REPORT PREVIEW ══════════ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge={p("report.badge")}
            title={p("report.title")}
            subtitle={p("report.subtitle")}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {[0, 1, 2, 3, 4].map(i => {
              const Icon = REPORT_ICONS[i]
              return (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <TiltCard className="h-full">
                    <div className="card-glass p-6 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Icon size={18} className="text-blue-400" />
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {t(`aiProfiling.report.items.${i}.tag`)}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-base mb-1.5">{t(`aiProfiling.report.items.${i}.title`)}</h3>
                      <p className="text-white/40 text-sm leading-relaxed flex-1">{t(`aiProfiling.report.items.${i}.desc`)}</p>
                    </div>
                  </TiltCard>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════ 5. INSIGHTS SECTION ══════════ */}
      <section className="py-20 px-4 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge={p("insights.badge")}
            title={p("insights.title")}
            subtitle={p("insights.subtitle")}
          />
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[0, 1, 2].map(i => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="card-glow p-6 h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                      <Sparkles size={14} className="text-gold" />
                    </div>
                    <span className="text-[10px] text-gold/60 tracking-wider uppercase font-medium">Model Simulation</span>
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2">{t(`aiProfiling.insights.items.${i}.title`)}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{t(`aiProfiling.insights.items.${i}.desc`)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.3}>
            <p className="text-white/25 text-[11px] text-center mt-8 leading-relaxed max-w-2xl mx-auto">
              {p("insights.disclaimer")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ 6. PRICING SECTION ══════════ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge={p("pricing.badge")}
            title={p("pricing.title")}
            subtitle={p("pricing.subtitle")}
          />
          <div className="grid md:grid-cols-3 gap-6 mt-12 items-stretch">
            {[0, 1, 2].map(i => {
              const isPopular = i === 1
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className={`card-glass p-6 h-full flex flex-col ${isPopular ? "border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)]" : ""}`}>
                    {isPopular && (
                      <div className="text-center mb-4">
                        <span className="text-[10px] px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 font-medium">
                          {t(`aiProfiling.pricing.plans.${i}.badge`)}
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <h3 className="text-white font-serif text-xl mb-2">{t(`aiProfiling.pricing.plans.${i}.name`)}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-3xl font-bold ${isPopular ? "text-blue-400" : "text-white"}`}>
                          {t(`aiProfiling.pricing.plans.${i}.price`)}
                        </span>
                        <span className="text-white/40 text-sm">{t(`aiProfiling.pricing.plans.${i}.period`)}</span>
                      </div>
                    </div>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {[0, 1, 2, 3, 4, 5, 6].map(j => {
                        const feature = t(`aiProfiling.pricing.plans.${i}.features.${j}`)
                        if (!feature || feature.startsWith("aiProfiling")) return null
                        return (
                          <li key={j} className="flex items-start gap-2 text-sm text-white/50">
                            <Check size={14} className={`mt-0.5 flex-shrink-0 ${isPopular ? "text-blue-400" : "text-gold/60"}`} />
                            <span>{feature}</span>
                          </li>
                        )
                      })}
                    </ul>
                    <Link
                      href={localeHref("/reading/new")}
                      className={`w-full py-3 rounded-xl text-center text-sm font-semibold transition-all ${
                        isPopular
                          ? "bg-blue-500 text-white hover:bg-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                          : "border border-white/20 text-white/60 hover:border-gold/30 hover:text-gold"
                      }`}
                    >
                      {t(`aiProfiling.pricing.plans.${i}.cta`)}
                    </Link>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════ 7. LEGAL DISCLAIMER ══════════ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="card-glass p-8 border-amber-500/20">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={20} className="text-amber-400" />
                <h3 className="text-white font-semibold">{p("disclaimer.title")}</h3>
              </div>
              <div className="text-white/40 text-sm leading-relaxed whitespace-pre-line">
                {p("disclaimer.content")}
              </div>
              <div className="mt-6 text-center">
                <Link
                  href={localeHref("/reading/new")}
                  className="inline-flex items-center gap-2 text-gold/60 text-sm hover:text-gold transition-colors group"
                >
                  {p("disclaimer.cta")}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ 8. FINAL CTA ══════════ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
              {p("finalCta.title")}
            </h2>
            <p className="text-white/40 text-sm md:text-base mb-8 max-w-lg mx-auto">
              {p("finalCta.subtitle")}
            </p>
            <MagneticButton>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 px-10 py-3.5 text-base group"
              >
                {p("finalCta.cta")}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ 9. FOOTER ══════════ */}
      <Footer />
    </div>
  )
}
