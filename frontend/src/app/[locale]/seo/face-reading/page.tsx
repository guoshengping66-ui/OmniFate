"use client"
import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { useLanguage } from "@/contexts/LanguageContext"

export default function FaceReadingSEOPage() {
  const { t } = useLanguage()

  const features = [
    { icon: "📸", title: t("seo.face.f1Title"), desc: t("seo.face.f1Desc") },
    { icon: "🎭", title: t("seo.face.f2Title"), desc: t("seo.face.f2Desc") },
    { icon: "👁️", title: t("seo.face.f3Title"), desc: t("seo.face.f3Desc") },
    { icon: "👃", title: t("seo.face.f4Title"), desc: t("seo.face.f4Desc") },
    { icon: "✨", title: t("seo.face.f5Title"), desc: t("seo.face.f5Desc") },
    { icon: "🔒", title: t("seo.face.f6Title"), desc: t("seo.face.f6Desc") },
  ]

  const areas = [
    { area: t("seo.face.a1Area"), icon: "🧠", meaning: t("seo.face.a1Meaning") },
    { area: t("seo.face.a2Area"), icon: "👁️", meaning: t("seo.face.a2Meaning") },
    { area: t("seo.face.a3Area"), icon: "✨", meaning: t("seo.face.a3Meaning") },
    { area: t("seo.face.a4Area"), icon: "👃", meaning: t("seo.face.a4Meaning") },
    { area: t("seo.face.a5Area"), icon: "👄", meaning: t("seo.face.a5Meaning") },
    { area: t("seo.face.a6Area"), icon: "😊", meaning: t("seo.face.a6Meaning") },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("seo.face.breadcrumb") }]} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t("seo.face.title"),
            "description": t("seo.face.desc"),
            "url": "https://destinymirror.com/seo/face-reading",
            "applicationCategory": "LifestyleApplication",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">👁️</div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4">
              {t("seo.face.title")}
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
              {t("seo.face.desc")}
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
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.face.areasTitle")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map((a) => (
                <div key={a.area} className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <h3 className="text-white font-medium text-sm">{a.area}</h3>
                    <p className="text-white/40 text-xs">{a.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">{t("seo.face.whatTitle")}</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>{t("seo.face.p1")}</p>
              <p>{t("seo.face.p2")}</p>
              <p>{t("seo.face.p3")}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-green-400" />
              <h3 className="text-white font-medium">{t("seo.face.privacyTitle")}</h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {t("seo.face.privacyDesc")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.5}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">📸</div>
              <h2 className="font-serif text-2xl text-gold mb-4">{t("seo.face.ctaTitle")}</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {t("seo.face.ctaDesc")}
              </p>
              <Link
                href="/reading/new"
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {t("seo.face.ctaBtn")} <ArrowRight size={20} />
              </Link>
              <p className="text-white/20 text-xs mt-4">{t("seo.face.ctaNote")}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
