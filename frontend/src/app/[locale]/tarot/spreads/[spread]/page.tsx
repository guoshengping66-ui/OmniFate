import { notFound } from "next/navigation"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { TarotSpreads } from "@/data/programmatic/tarot/spreads"
import { safeJsonLd } from "@/utils/safeJsonLd"

interface PageProps {
  params: Promise<{ locale: string; spread: string }>
}

export async function generateStaticParams() {
  return TarotSpreads.map(s => ({ spread: s.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, spread } = await params
  const data = TarotSpreads.find(s => s.id === spread)
  if (!data) return {}

  const isZh = locale === "zh"

  return {
    title: isZh ? data.title_zh : data.title_en,
    description: isZh ? data.meta_description_zh : data.meta_description_en,
    keywords: isZh ? data.keywords_zh : data.keywords_en,
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/tarot/spreads/${spread}`,
      languages: {
        en: `https://www.khanfate.com/en/tarot/spreads/${spread}`,
        zh: `https://www.khanfate.com/zh/tarot/spreads/${spread}`,
        "x-default": `https://www.khanfate.com/en/tarot/spreads/${spread}`,
      },
    },
  }
}

export default async function TarotSpreadPage({ params }: PageProps) {
  const { locale, spread } = await params
  const data = TarotSpreads.find(s => s.id === spread)
  if (!data) notFound()

  const isZh = locale === "zh"

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: isZh ? "塔罗牌" : "Tarot", href: "/tarot" },
            { label: isZh ? "牌阵" : "Spreads", href: "/tarot/spreads" },
            { label: isZh ? data.name_zh : data.name_en },
          ]}
          currentPath={`/${locale}/tarot/spreads/${spread}`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": isZh ? data.title_zh : data.title_en,
            "description": isZh ? data.meta_description_zh : data.meta_description_en,
            "url": `https://www.khanfate.com/${locale}/tarot/spreads/${spread}`,
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">{data.emoji}</div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              {isZh ? data.title_zh : data.title_en}
            </h1>
            <p className="text-parchment-400 text-sm max-w-2xl mx-auto">
              {isZh ? data.meta_description_zh : data.meta_description_en}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "牌阵概述" : "Spread Overview"}</h2>
            <p className="text-parchment-400 text-sm leading-relaxed">{isZh ? data.overview_zh : data.overview_en}</p>
            <div className="mt-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
              <p className="text-parchment-400 text-xs">{isZh ? `使用卡片数量：${data.card_count}` : `Cards Used: ${data.card_count}`}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "牌位含义" : "Card Positions"}</h2>
            <div className="text-parchment-400 text-sm leading-relaxed whitespace-pre-line">
              {isZh ? data.positions_zh : data.positions_en}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "解读方法" : "How to Read"}</h2>
            <p className="text-parchment-400 text-sm leading-relaxed">{isZh ? data.how_to_read_zh : data.how_to_read_en}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="card-solid p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "最适合" : "Best For"}</h2>
            <p className="text-parchment-400 text-sm leading-relaxed">{isZh ? data.best_for_zh : data.best_for_en}</p>
          </div>
        </ScrollReveal>

        <SEOFaq
          title={isZh ? "常见问题" : "Frequently Asked Questions"}
          items={isZh ? data.faq_zh : data.faq_en}
        />
      </div>
    </div>
  )
}
