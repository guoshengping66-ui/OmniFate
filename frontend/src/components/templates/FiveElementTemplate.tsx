"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { useLanguage } from "@/contexts/LanguageContext"
import type { FiveElement } from "@/data/programmatic/five-elements/elements"
import { FiveElements } from "@/data/programmatic/five-elements/elements"
import { safeJsonLd } from "@/utils/safeJsonLd"

interface FiveElementTemplateProps {
  data: FiveElement
  locale: string
}

export function FiveElementTemplate({ data, locale }: FiveElementTemplateProps) {
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
    health: isZh ? data.health_zh : data.health_en,
    faq: isZh ? data.faq_zh : data.faq_en,
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: t("nav.divination") || "Divination", href: localeHref("/five-elements") },
          ]}
          currentPath={`/${locale}/five-elements/${data.id}`}
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
            "url": `https://www.khanfate.com/${locale}/five-elements/${data.id}`,
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
              {isZh ? "🏥 健康运势" : "🏥 Health"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.health}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "🔄 五行关系" : "🔄 Element Relationships"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-lg text-green-400 mb-2">
                  {isZh ? "生" : "Generates"}
                </div>
                <Link
                  href={localeHref(`/five-elements/${data.generates}`)}
                  className="text-gold hover:underline"
                >
                  {isZh ? {
                    wood: "木", fire: "火", earth: "土", metal: "金", water: "水"
                  }[data.generates] : data.generates}
                </Link>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-lg text-red-400 mb-2">
                  {isZh ? "克" : "Controls"}
                </div>
                <Link
                  href={localeHref(`/five-elements/${data.controls}`)}
                  className="text-gold hover:underline"
                >
                  {isZh ? {
                    wood: "木", fire: "火", earth: "土", metal: "金", water: "水"
                  }[data.controls] : data.controls}
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <SEOFaq title={isZh ? "常见问题" : "Frequently Asked Questions"} items={content.faq} />

        <ScrollReveal delay={0.5}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "探索其他五行" : "Explore Other Elements"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FiveElements.filter(e => e.id !== data.id).map(element => (
                <Link
                  key={element.id}
                  href={localeHref(`/five-elements/${element.id}`)}
                  className="card-glow p-3 text-center hover:border-gold/30 transition-all group"
                >
                  <div className="text-2xl mb-1">{element.emoji}</div>
                  <div className="text-xs text-white/60 group-hover:text-gold transition-colors">
                    {isZh ? element.name_zh : element.name_en}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.55}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden mt-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4 animate-float">🔮</div>
              <h2 className="font-serif text-2xl text-gold mb-4">
                {isZh ? "获取你的五行分析" : "Get Your Five Elements Reading"}
              </h2>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {isZh ? "开始分析" : "Start Reading"} 🔮
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
