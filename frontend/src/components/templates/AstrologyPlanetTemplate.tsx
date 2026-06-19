"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
function safeJsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
}
import { useLanguage } from "@/contexts/LanguageContext"
import type { AstrologyPlanet } from "@/data/programmatic/astrology/planets"
import { AstrologyPlanets } from "@/data/programmatic/astrology/planets"

interface AstrologyPlanetTemplateProps {
  data: AstrologyPlanet
  locale: string
}

export function AstrologyPlanetTemplate({ data, locale }: AstrologyPlanetTemplateProps) {
  const { t, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const content = {
    title: isZh ? data.name_zh : data.name_en,
    overview: isZh ? data.overview_zh : data.overview_en,
    personality: isZh ? data.personality_zh : data.personality_en,
    strengths: isZh ? data.strengths_zh : data.strengths_en,
    weaknesses: isZh ? data.weaknesses_zh : data.weaknesses_en,
    career: isZh ? data.career_zh : data.career_en,
    relationships: isZh ? data.relationships_zh : data.relationships_en,
    faq: isZh ? data.faq_zh : data.faq_en,
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: t("nav.astrology") || "Astrology", href: localeHref("/astrology") },
          ]}
          currentPath={`/${locale}/astrology/planets/${data.id}`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": content.title,
            "description": isZh ? data.meta_description_zh : data.meta_description_en,
            "author": { "@type": "Organization", "name": "Destiny Engine" },
            "publisher": { "@type": "Organization", "name": "Destiny Engine", "url": "https://www.khanfate.com" },
            "url": `https://www.khanfate.com/${locale}/astrology/planets/${data.id}`,
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-6xl mb-4">{data.emoji}</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {content.title}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {content.overview}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "🧬 性格特征" : "🧬 Personality"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.personality}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "✨ 优势" : "✨ Strengths"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.strengths}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "⚠️ 劣势" : "⚠️ Weaknesses"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.weaknesses}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "💼 事业运势" : "💼 Career"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.career}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "💕 感情运势" : "💕 Relationships"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.relationships}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.35}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "🔮 行星配置" : "🔮 Planetary Placements"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-sm text-white/40 mb-2">
                  {isZh ? "守护星座" : "Rules"}
                </div>
                <div className="text-gold font-bold">{data.rules_sign}</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-sm text-white/40 mb-2">
                  {isZh ? "旺相" : "Exaltation"}
                </div>
                <div className="text-green-400 font-bold">{data.exaltation}</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-sm text-white/40 mb-2">
                  {isZh ? "落陷" : "Detriment"}
                </div>
                <div className="text-red-400 font-bold">{data.detriment}</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-sm text-white/40 mb-2">
                  {isZh ? "弱势" : "Fall"}
                </div>
                <div className="text-orange-400 font-bold">{data.fall}</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <SEOFaq title={isZh ? "常见问题" : "Frequently Asked Questions"} items={content.faq} />

        <ScrollReveal delay={0.45}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "探索其他行星" : "Explore Other Planets"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.related_planets.map(planet => {
                const relatedPlanet = AstrologyPlanets.find(p => p.id === planet)
                return (
                  <Link
                    key={planet}
                    href={localeHref(`/astrology/planets/${planet}`)}
                    className="card-glow p-3 text-center hover:border-gold/30 transition-all group"
                  >
                    <div className="text-2xl mb-1">{relatedPlanet?.emoji}</div>
                    <div className="text-xs text-white/60 group-hover:text-gold transition-colors">
                      {isZh ? relatedPlanet?.name_zh : relatedPlanet?.name_en}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.5}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden mt-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4 animate-float">🌟</div>
              <h2 className="font-serif text-2xl text-gold mb-4">
                {isZh ? "获取你的完整星盘分析" : "Get Your Complete Natal Chart"}
              </h2>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {isZh ? "开始分析" : "Start Reading"} 🌟
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
