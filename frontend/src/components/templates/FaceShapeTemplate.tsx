"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { useLanguage } from "@/contexts/LanguageContext"
import type { FaceShape } from "@/data/programmatic/face/shapes"
import { FaceShapes } from "@/data/programmatic/face/shapes"
import { safeJsonLd } from "@/utils/safeJsonLd"
import { createPublisherJsonLd } from "@/lib/seo/structuredData"

interface FaceShapeTemplateProps {
  data: FaceShape
  locale: string
}

export function FaceShapeTemplate({ data, locale }: FaceShapeTemplateProps) {
  const { t, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const content = {
    title: isZh ? data.name_zh : data.name_en,
    overview: isZh ? data.overview_zh : data.overview_en,
    description: isZh ? data.description_zh : data.description_en,
    personality: isZh ? data.personality_zh : data.personality_en,
    career: isZh ? data.career_zh : data.career_en,
    relationships: isZh ? data.relationships_zh : data.relationships_en,
    faq: isZh ? data.faq_zh : data.faq_en,
  }

  const elementLabels: Record<string, { zh: string; en: string }> = {
    wood: { zh: "木", en: "Wood" },
    fire: { zh: "火", en: "Fire" },
    earth: { zh: "土", en: "Earth" },
    metal: { zh: "金", en: "Metal" },
    water: { zh: "水", en: "Water" },
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: t("nav.divination") || "Divination", href: localeHref("/face-reading") },
          ]}
          currentPath={`/${locale}/face-reading/shapes/${data.id}`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": content.title,
            "description": isZh ? data.meta_description_zh : data.meta_description_en,
            "author": createPublisherJsonLd(),
            "publisher": createPublisherJsonLd(),
            "url": `https://www.khanfate.com/${locale}/face-reading/shapes/${data.id}`,
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
              {isZh ? "📝 描述" : "📝 Description"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.description}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "🧠 性格特征" : "🧠 Personality"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.personality}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "💼 事业运势" : "💼 Career"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.career}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "💕 感情运势" : "💕 Relationships"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.relationships}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "🔮 五行属性" : "🔮 Five Element"}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-4xl">
                {data.element === "wood" ? "🌳" : data.element === "fire" ? "🔥" : data.element === "earth" ? "⛰️" : data.element === "metal" ? "⚔️" : "💧"}
              </span>
              <div>
                <div className="text-xl text-white font-bold">
                  {isZh ? elementLabels[data.element]?.zh : elementLabels[data.element]?.en}
                </div>
                <div className="text-sm text-white/40">
                  {isZh ? `五行属${elementLabels[data.element]?.zh}` : `${elementLabels[data.element]?.en} Element`}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <SEOFaq title={isZh ? "常见问题" : "Frequently Asked Questions"} items={content.faq} />

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "探索其他脸型" : "Explore Other Face Shapes"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.related_shapes.map(shape => {
                const relatedShape = FaceShapes.find(s => s.id === shape)
                return (
                  <Link
                    key={shape}
                    href={localeHref(`/face-reading/shapes/${shape}`)}
                    className="card-glow p-3 text-center hover:border-gold/30 transition-all group"
                  >
                    <div className="text-2xl mb-1">{relatedShape?.emoji}</div>
                    <div className="text-xs text-white/60 group-hover:text-gold transition-colors">
                      {isZh ? relatedShape?.name_zh : relatedShape?.name_en}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.45}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden mt-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4 animate-float">👤</div>
              <h2 className="font-serif text-2xl text-gold mb-4">
                {isZh ? "获取你的完整面相分析" : "Get Your Complete Face Reading"}
              </h2>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {isZh ? "开始分析" : "Start Reading"} 👤
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
