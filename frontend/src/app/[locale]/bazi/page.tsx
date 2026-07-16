"use client"
export const dynamic = "force-dynamic"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { useMemo } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { safeJsonLd } from "@/utils/safeJsonLd"
export default function BaziSEOPage() {
  const { t, localeHref, locale } = useLanguage()

  const faqItems = useMemo(() => [1,2,3,4].map(i => ({
    question: t("seo.bazi.faqQ" + i),
    answer: t("seo.bazi.faqA" + i),
  })), [t])

  const relatedServices = useMemo(() => [1,2,3,4].map(i => ({
    icon: ["☯️","⭐","🃏","⭐"][i - 1],
    title: t("seo.bazi.r" + i + "Title"),
    href: ["/five-elements","/astrology","/tarot","/ziwei"][i - 1],
    desc: t("seo.bazi.r" + i + "Desc"),
  })), [t])

  const features = [
    { icon: "☯", title: t("seo.bazi.f1Title"), desc: t("seo.bazi.f1Desc") },
    { icon: "🔥", title: t("seo.bazi.f2Title"), desc: t("seo.bazi.f2Desc") },
    { icon: "📊", title: t("seo.bazi.f3Title"), desc: t("seo.bazi.f3Desc") },
    { icon: "📅", title: t("seo.bazi.f4Title"), desc: t("seo.bazi.f4Desc") },
    { icon: "💡", title: t("seo.bazi.f5Title"), desc: t("seo.bazi.f5Desc") },
    { icon: "🎯", title: t("seo.bazi.f6Title"), desc: t("seo.bazi.f6Desc") },
  ]

  const steps = [
    { n: "01", title: t("seo.bazi.s1Title"), desc: t("seo.bazi.s1Desc") },
    { n: "02", title: t("seo.bazi.s2Title"), desc: t("seo.bazi.s2Desc") },
    { n: "03", title: t("seo.bazi.s3Title"), desc: t("seo.bazi.s3Desc") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.bazi.breadcrumb") }]} currentPath={`/${locale}/bazi`} />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.bazi.title"),
            "description": t("seo.bazi.desc"),
            "url": `https://www.khanfate.com/${locale}/bazi`,
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "CNY",
            },
          })}}
        />

        {/* Hero */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.bazi.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="text-5xl mb-4">☯</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("seo.bazi.title")}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("seo.bazi.desc")}
            </p>
          </div>
        </ScrollReveal>

        {/* Features Grid */}
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

        {/* How It Works */}
        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-8 text-center">{t("seo.bazi.stepsTitle")}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s) => (
                <div key={s.n} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center mx-auto mb-4 text-gold font-bold">
                    {s.n}
                  </div>
                  <h3 className="text-white font-medium mb-2">{s.title}</h3>
                  <p className="text-white/40 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* SEO Content */}
        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.bazi.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.bazi.p1")}</p>
              <p>{t("seo.bazi.p2")}</p>
              <p>{t("seo.bazi.p3")}</p>
            </div>
          </div>
        </ScrollReveal>

        <SEOFaq
          title={t("seo.bazi.faqTitle")}
          items={faqItems}
        />

        <RelatedServices
          heading={t("seo.bazi.relatedTitle")}
          services={relatedServices}
        />

        {/* CTA */}
        <ScrollReveal delay={0.4}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4 animate-float">🔮</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.bazi.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.bazi.ctaDesc")}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.bazi.ctaBtn")} <ArrowRight size={20} />
              </Link>
              <p className="text-white/20 text-xs mt-4">{t("seo.bazi.ctaNote")}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
