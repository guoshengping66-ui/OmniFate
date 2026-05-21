"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { useLanguage } from "@/contexts/LanguageContext"

export default function BaziSEOPage() {
  const { t } = useLanguage()

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
        <Breadcrumbs items={[{ label: t("seo.bazi.breadcrumb") }]} />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.bazi.title"),
            "description": t("seo.bazi.desc"),
            "url": "https://destinymirror.com/seo/bazi",
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
            <div className="text-5xl mb-4">☯</div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4">
              {t("seo.bazi.title")}
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
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
                href="/reading/new"
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
