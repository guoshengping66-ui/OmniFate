import { notFound } from "next/navigation"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { SEOFaq } from "@/components/ui/SEOFaq"
import { BaziAnalyses } from "@/data/programmatic/bazi/analysis"
import { safeJsonLd } from "@/utils/safeJsonLd"

interface PageProps {
  params: Promise<{ locale: string; type: string }>
}

export async function generateStaticParams() {
  return BaziAnalyses.map(a => ({ type: a.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, type } = await params
  const data = BaziAnalyses.find(a => a.id === type)
  if (!data) return {}

  const isZh = locale === "zh"

  return {
    title: isZh ? data.title_zh : data.title_en,
    description: isZh ? data.meta_description_zh : data.meta_description_en,
    keywords: isZh ? data.keywords_zh : data.keywords_en,
    openGraph: {
      title: `${isZh ? data.title_zh : data.title_en} | Inner Atlas AI`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
      url: `https://www.khanfate.com/${locale}/bazi/analysis/${type}`,
      siteName: "Inner Atlas AI",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.title_zh} | Inner Atlas AI` : `${data.title_en} | Inner Atlas AI`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/bazi/analysis/${type}`,
      languages: {
        en: `https://www.khanfate.com/en/bazi/analysis/${type}`,
        zh: `https://www.khanfate.com/zh/bazi/analysis/${type}`,
        "x-default": `https://www.khanfate.com/en/bazi/analysis/${type}`,
      },
    },
  }
}

export default async function BaziAnalysisPage({ params }: PageProps) {
  const { locale, type } = await params
  const data = BaziAnalyses.find(a => a.id === type)
  if (!data) notFound()

  const isZh = locale === "zh"

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: isZh ? "八字" : "Bazi", href: "/bazi" },
            { label: isZh ? data.name_zh : data.name_en },
          ]}
          currentPath={`/${locale}/bazi/analysis/${type}`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": isZh ? data.title_zh : data.title_en,
            "description": isZh ? data.meta_description_zh : data.meta_description_en,
            "author": { "@type": "Organization", "name": "Inner Atlas AI" },
            "publisher": { "@type": "Organization", "name": "Inner Atlas AI", "logo": { "@type": "ImageObject", "url": "/logo.png" } },
            "url": `https://www.khanfate.com/${locale}/bazi/analysis/${type}`,
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">{data.emoji}</div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              {isZh ? data.title_zh : data.title_en}
            </h1>
            <p className="text-white/40 text-sm max-w-2xl mx-auto">
              {isZh ? data.meta_description_zh : data.meta_description_en}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "概述" : "Overview"}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{isZh ? data.overview_zh : data.overview_en}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "分析方法" : "Analysis Method"}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{isZh ? data.method_zh : data.method_en}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "关键因素" : "Key Factors"}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{isZh ? data.factors_zh : data.factors_en}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <h2 className="font-serif text-2xl text-gold mb-4">{isZh ? "解读" : "Interpretation"}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{isZh ? data.interpretation_zh : data.interpretation_en}</p>
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
