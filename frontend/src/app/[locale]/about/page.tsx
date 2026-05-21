"use client"
import { Sparkles, Shield, Star, Compass, Layers, Lock, Eye, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useLanguage } from "@/contexts/LanguageContext"

export default function AboutPage() {
  const { t } = useLanguage()

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
      title: "Zero Data Retention",
      desc: t("about.privacyP1"),
    },
    {
      icon: Eye,
      title: "End-to-End Encryption",
      desc: t("about.privacyP2"),
    },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ label: t("nav.about") }]} />

        {/* Hero Section */}
        <ScrollReveal>
          <div className="text-center mb-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center mx-auto mb-6">
              <Sparkles size={28} className="text-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4">
              {t("about.title")}
            </h1>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              {t("about.heroDesc")}
            </p>
          </div>
        </ScrollReveal>

        {/* Origin & Mission */}
        <ScrollReveal delay={0.1}>
          <div className="card-glass-elevated p-8 md:p-12 mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                <Sparkles size={18} className="text-gold" />
              </div>
              <h2 className="font-serif text-2xl text-gold">{t("about.origin")}</h2>
            </div>
            <div className="space-y-4">
              <p className="text-white/60 leading-relaxed">
                {t("about.originP1")}
              </p>
              <p className="text-white/60 leading-relaxed">
                {t("about.originP2")}
              </p>
              <p className="text-gold/60 leading-relaxed italic">
                {t("about.originP3")}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Core Philosophy - Three Pillars */}
        <ScrollReveal delay={0.15}>
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl text-gold mb-2">{t("about.philosophy")}</h2>
              <p className="text-white/40 text-sm">{t("about.philosophySubtitle")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {pillars.map((pillar, i) => (
                <div key={pillar.title} className="card-glow p-6 relative overflow-hidden group">
                  {/* Accent line */}
                  <div
                    className="absolute top-0 left-0 w-full h-1 opacity-60"
                    style={{ background: `linear-gradient(90deg, ${pillar.color}, transparent)` }}
                  />
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${pillar.color}15`, border: `1px solid ${pillar.color}40` }}
                    >
                      <pillar.icon size={18} style={{ color: pillar.color }} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-gold">{pillar.title}</h3>
                      <p className="text-white/30 text-xs">{pillar.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Privacy & Security */}
        <ScrollReveal delay={0.2}>
          <div className="card-glass-elevated p-8 md:p-12 mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <Shield size={18} className="text-green-400" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-gold">{t("about.privacy")}</h2>
                <p className="text-white/40 text-sm">{t("about.privacySubtitle")}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {privacyItems.map((item) => (
                <div key={item.title} className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <item.icon size={14} className="text-green-400" />
                    </div>
                    <h3 className="text-white/80 font-medium text-sm">{item.title}</h3>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal delay={0.25}>
          <div className="text-center card-glass-elevated p-10 md:p-12">
            <h2 className="font-serif text-2xl text-gold mb-4">{t("about.ctaTitle")}</h2>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">{t("about.ctaDesc")}</p>
            <Link
              href="/reading/new"
              className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4 group"
            >
              {t("about.ctaButton")}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
