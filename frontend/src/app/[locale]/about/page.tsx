"use client"
import { Sparkles, Shield, Star, Compass, Lock, Eye, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useLanguage } from "@/contexts/LanguageContext"

export default function AboutPage() {
  const { t, localeHref } = useLanguage()

  const pillars = [
    {
      icon: Sparkles,
      title: t("about.pillar1Title"),
      subtitle: t("about.pillar1Subtitle"),
      desc: t("about.pillar1Desc"),
      color: "#C9A84C",
    },
    {
      icon: Star,
      title: t("about.pillar2Title"),
      subtitle: t("about.pillar2Subtitle"),
      desc: t("about.pillar2Desc"),
      color: "#52B788",
    },
    {
      icon: Compass,
      title: t("about.pillar3Title"),
      subtitle: t("about.pillar3Subtitle"),
      desc: t("about.pillar3Desc"),
      color: "#2980B9",
    },
  ]

  const privacyItems = [
    {
      icon: Lock,
      title: t("about.privacy"),
      desc: t("about.privacyP1"),
    },
    {
      icon: Eye,
      title: t("about.privacySubtitle"),
      desc: t("about.privacyP2"),
    },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ label: t("nav.about") }]} />

        {/* ══════════ Hero — Brand Statement ══════════ */}
        <ScrollReveal>
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("nav.about")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4 leading-tight">
              {t("about.title")}
            </h1>
            <p className="text-parchment-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("about.heroDesc")}
            </p>
          </div>
        </ScrollReveal>

        {/* ══════════ Origin — Co-Star Style Quote ══════════ */}
        <ScrollReveal delay={0.1}>
          <div className="card-solid-elevated p-8 md:p-12 mb-16 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gold/5 blur-[80px] pointer-events-none" />
            <div className="relative">
              {/* Large quote mark */}
              <div className="text-gold/15 text-[80px] leading-none font-serif absolute -top-2 -left-2 select-none">&ldquo;</div>

              <div className="pl-6 md:pl-10">
                <h2 className="font-serif text-xl md:text-2xl text-gold/80 mb-6">{t("about.origin")}</h2>

                <div className="space-y-5">
                  <p className="text-parchment-300 text-sm md:text-base leading-relaxed">
                    {t("about.originP1")}
                  </p>
                  <p className="text-parchment-300 text-sm md:text-base leading-relaxed">
                    {t("about.originP2")}
                  </p>
                </div>

                {/* Closing quote — mission statement */}
                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <p className="text-gold/60 text-sm md:text-base italic leading-relaxed">
                    {t("about.originP3")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ══════════ Core Philosophy — Three Pillars ══════════ */}
        <ScrollReveal delay={0.12}>
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-2">{t("about.philosophy")}</h2>
              <p className="text-parchment-400 text-sm">{t("about.philosophySubtitle")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="card-interactive p-5 relative overflow-hidden group hover:border-white/15 transition-all duration-300">
                  {/* Accent top line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-50"
                    style={{ background: `linear-gradient(90deg, ${pillar.color}, transparent)` }}
                  />
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${pillar.color}12`, border: `1px solid ${pillar.color}30` }}
                  >
                    <pillar.icon size={18} style={{ color: pillar.color }} />
                  </div>
                  <h3 className="font-serif font-bold text-sm mb-0.5" style={{ color: pillar.color }}>{pillar.title}</h3>
                  <p className="text-parchment-400 text-xs mb-2">{pillar.subtitle}</p>
                  <p className="text-parchment-400 text-xs leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ══════════ Privacy & Security ══════════ */}
        <ScrollReveal delay={0.14}>
          <div className="card-solid-elevated p-6 md:p-8 mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <Shield size={18} className="text-green-400" />
              </div>
              <div>
                <h2 className="font-serif text-lg md:text-xl text-parchment-100">{t("about.privacy")}</h2>
                <p className="text-parchment-400 text-xs">{t("about.privacySubtitle")}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {privacyItems.map((item) => (
                <div key={item.title} className="bg-white/[0.03] rounded-xl p-5 border border-white/[0.06]">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <item.icon size={14} className="text-green-400" />
                    </div>
                    <h3 className="text-parchment-200 font-medium text-sm">{item.title}</h3>
                  </div>
                  <p className="text-parchment-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ══════════ CTA ══════════ */}
        <ScrollReveal delay={0.16}>
          <div className="text-center card-solid p-8 md:p-10">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-3">{t("about.ctaTitle")}</h2>
            <p className="text-parchment-400 text-sm mb-6 max-w-md mx-auto">{t("about.ctaDesc")}</p>
            <Link
              href={localeHref("/reading/new")}
              className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm group"
            >
              {t("about.ctaButton")}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
