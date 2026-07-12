"use client"
export const dynamic = "force-dynamic"
import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { RelatedServices } from "@/components/ui/RelatedServices"
import { useMemo } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { safeJsonLd } from "@/utils/safeJsonLd"
export default function ZiweiSEOPage() {
  const { t, localeHref, locale } = useLanguage()

  const faqItems = useMemo(() => [1,2,3,4].map(i => ({
    question: t("seo.ziwei.faqQ" + i),
    answer: t("seo.ziwei.faqA" + i),
  })), [t])

  const relatedServices = useMemo(() => [1,2,3,4].map(i => ({
    icon: ["📊","☯️","⭐","🃏"][i - 1],
    title: t("seo.ziwei.r" + i + "Title"),
    href: ["/bazi","/five-elements","/astrology","/tarot"][i - 1],
    desc: t("seo.ziwei.r" + i + "Desc"),
  })), [t])

  const features = [
    { icon: "⭐", title: t("seo.ziwei.f1Title"), desc: t("seo.ziwei.f1Desc") },
    { icon: "🏛️", title: t("seo.ziwei.f2Title"), desc: t("seo.ziwei.f2Desc") },
    { icon: "🔮", title: t("seo.ziwei.f3Title"), desc: t("seo.ziwei.f3Desc") },
    { icon: "📊", title: t("seo.ziwei.f4Title"), desc: t("seo.ziwei.f4Desc") },
    { icon: "🎯", title: t("seo.ziwei.f5Title"), desc: t("seo.ziwei.f5Desc") },
    { icon: "🛡️", title: t("seo.ziwei.f6Title"), desc: t("seo.ziwei.f6Desc") },
  ]

  const palaces = [
    { icon: "👤", name: t("seo.ziwei.p1Name"), desc: t("seo.ziwei.p1Desc") },
    { icon: "💰", name: t("seo.ziwei.p2Name"), desc: t("seo.ziwei.p2Desc") },
    { icon: "❤️", name: t("seo.ziwei.p3Name"), desc: t("seo.ziwei.p3Desc") },
    { icon: "🏢", name: t("seo.ziwei.p4Name"), desc: t("seo.ziwei.p4Desc") },
    { icon: "🏠", name: t("seo.ziwei.p5Name"), desc: t("seo.ziwei.p5Desc") },
    { icon: "🎓", name: t("seo.ziwei.p6Name"), desc: t("seo.ziwei.p6Desc") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.ziwei.breadcrumb") }]} currentPath={`/${locale}/ziwei`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.ziwei.title"),
            "description": t("seo.ziwei.desc"),
            "url": "https://www.khanfate.com/ziwei",
            "applicationCategory": "LifestyleApplication",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("seo.ziwei.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <div className="text-5xl mb-4">⭐</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("seo.ziwei.title")}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("seo.ziwei.desc")}
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
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.ziwei.palacesTitle")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {palaces.map((p) => (
                <div key={p.name} className="flex items-center gap-3 p-4 bg-[#030918] rounded-xl border border-white/10">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <h3 className="text-white font-medium text-sm">{p.name}</h3>
                    <p className="text-white/40 text-xs">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.ziwei.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.ziwei.p1")}</p>
              <p>{t("seo.ziwei.p2")}</p>
              <p>{t("seo.ziwei.p3")}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-green-400" />
              <h3 className="text-white font-medium">{t("seo.ziwei.privacyTitle")}</h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {t("seo.ziwei.privacyDesc")}
            </p>
          </div>
        </ScrollReveal>

        <SEOFaq
          title={t("seo.ziwei.faqTitle")}
          items={faqItems}
        />

        <RelatedServices
          heading={t("seo.ziwei.relatedTitle")}
          services={relatedServices}
        />

        <ScrollReveal delay={0.5}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">⭐</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.ziwei.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.ziwei.ctaDesc")}
              </p>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.ziwei.ctaBtn")} <ArrowRight size={20} />
              </Link>
              <p className="text-white/20 text-xs mt-4">{t("seo.ziwei.ctaNote")}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
