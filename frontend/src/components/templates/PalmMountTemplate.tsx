"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { useLanguage } from "@/contexts/LanguageContext"
import type { PalmMount } from "@/data/programmatic/palm/mounts"
import { PalmMounts } from "@/data/programmatic/palm/mounts"
import { safeJsonLd } from "@/utils/safeJsonLd"
import { createPublisherJsonLd } from "@/lib/seo/structuredData"

interface PalmMountTemplateProps {
  data: PalmMount
  locale: string
}

export function PalmMountTemplate({ data, locale }: PalmMountTemplateProps) {
  const { t, localeHref } = useLanguage()
  const isZh = locale === "zh"

  const content = {
    title: isZh ? data.name_zh : data.name_en,
    overview: isZh ? data.overview_zh : data.overview_en,
    location: isZh ? data.location_zh : data.location_en,
    developed: isZh ? data.developed_meaning_zh : data.developed_meaning_en,
    flat: isZh ? data.flat_meaning_zh : data.flat_meaning_en,
    prominent: isZh ? data.prominent_meaning_zh : data.prominent_meaning_en,
    faq: isZh ? data.faq_zh : data.faq_en,
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: t("nav.divination") || "Divination", href: localeHref("/palm-reading") },
          ]}
          currentPath={`/${locale}/palm-reading/mounts/${data.id}`}
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
            "url": `https://www.khanfate.com/${locale}/palm-reading/mounts/${data.id}`,
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
              {isZh ? "📍 位置" : "📍 Location"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.location}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "✨ 发达的掌丘" : "✨ Developed Mount"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.developed}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "➖ 平坦的掌丘" : "➖ Flat Mount"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.flat}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "⬆️ 突出的掌丘" : "⬆️ Prominent Mount"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{content.prominent}</p>
          </div>
        </ScrollReveal>

        <SEOFaq title={isZh ? "常见问题" : "Frequently Asked Questions"} items={content.faq} />

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-6">
              {isZh ? "探索其他掌丘" : "Explore Other Mounts"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.related_mounts.map(mount => {
                const relatedMount = PalmMounts.find(m => m.id === mount)
                return (
                  <Link
                    key={mount}
                    href={localeHref(`/palm-reading/mounts/${mount}`)}
                    className="card-glow p-3 text-center hover:border-gold/30 transition-all group"
                  >
                    <div className="text-2xl mb-1">{relatedMount?.emoji}</div>
                    <div className="text-xs text-white/60 group-hover:text-gold transition-colors">
                      {isZh ? relatedMount?.name_zh : relatedMount?.name_en}
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
              <div className="text-4xl mb-4 animate-float">🖐️</div>
              <h2 className="font-serif text-2xl text-gold mb-4">
                {isZh ? "获取你的完整手相分析" : "Get Your Complete Palm Reading"}
              </h2>
              <Link
                href={localeHref("/reading/new")}
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                {isZh ? "开始分析" : "Start Reading"} 🖐️
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
