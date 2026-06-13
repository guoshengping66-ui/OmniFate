"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { useLanguage } from "@/contexts/LanguageContext"

export default function AstrologySEOPage() {
  const { t, localeHref } = useLanguage()

  const features = [
    { icon: "☀️", title: t("seo.astrology.f1Title"), desc: t("seo.astrology.f1Desc") },
    { icon: "🌙", title: t("seo.astrology.f2Title"), desc: t("seo.astrology.f2Desc") },
    { icon: "⬆️", title: t("seo.astrology.f3Title"), desc: t("seo.astrology.f3Desc") },
    { icon: "🪐", title: t("seo.astrology.f4Title"), desc: t("seo.astrology.f4Desc") },
    { icon: "📐", title: t("seo.astrology.f5Title"), desc: t("seo.astrology.f5Desc") },
    { icon: "🌟", title: t("seo.astrology.f6Title"), desc: t("seo.astrology.f6Desc") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.astrology.breadcrumb") }]} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.astrology.title"),
            "description": t("seo.astrology.desc"),
            "url": "https://khanfate.com/seo/astrology",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.astrology.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="text-5xl mb-4">✦</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("seo.astrology.title")}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("seo.astrology.desc")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {features.map((f) => (
              <div key={f.title} className="card-glow p-5 hover:border-gold/30 transition-all duration-300">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-serif font-bold text-gold mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.astrology.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.astrology.p1")}</p>
              <p>{t("seo.astrology.p2")}</p>
              <p>{t("seo.astrology.p3")}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">🌟</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.astrology.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.astrology.ctaDesc")}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.astrology.ctaBtn")} <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
