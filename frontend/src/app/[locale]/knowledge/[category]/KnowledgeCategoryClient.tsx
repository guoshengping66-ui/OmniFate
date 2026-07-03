"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { useLanguage } from "@/contexts/LanguageContext"
import type { KnowledgeCategory } from "@/data/knowledge"
import { safeJsonLd } from "@/utils/safeJsonLd"

export function KnowledgeCategoryClient({ data, locale }: { data: KnowledgeCategory; locale: string }) {
  const { localeHref } = useLanguage()
  const isZh = locale === "zh"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": isZh ? data.name_zh : data.name_en,
    "description": isZh ? data.description_zh : data.description_en,
    "url": `https://www.khanfate.com/${locale}${data.canonical_path}`,
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
        <Breadcrumbs
          items={[
            { label: isZh ? "知识库" : "Knowledge", href: localeHref("/knowledge") },
          ]}
          currentPath={`/${locale}${data.canonical_path}`}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">{data.emoji}</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {isZh ? data.name_zh : data.name_en}
            </h1>
            <p className="text-parchment-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {isZh ? data.description_zh : data.description_en}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {data.subcategories.map((sub, idx) => (
            <ScrollReveal key={sub.id} delay={0.05 * (idx + 1)}>
              <Link
                href={localeHref(`${data.canonical_path}/${sub.id}`)}
                className="card-interactive p-6 md:p-8 hover:border-gold/30 transition-all duration-300 group block h-full"
              >
                <h2 className="font-serif text-xl font-bold text-white group-hover:text-gold transition-colors mb-2">
                  {isZh ? sub.name_zh : sub.name_en}
                </h2>
                <p className="text-parchment-400 text-sm leading-relaxed mb-4">
                  {isZh ? sub.description_zh : sub.description_en}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sub.items.slice(0, 8).map((item) => (
                    <span key={item.id} className="text-xs bg-white/[0.04] text-parchment-400 px-2.5 py-1 rounded-full">
                      {item.emoji} {isZh ? item.name_zh : item.name_en}
                    </span>
                  ))}
                  {sub.items.length > 8 && (
                    <span className="text-xs text-gold/60 px-2.5 py-1">
                      +{sub.items.length - 8} {isZh ? "更多" : "more"}
                    </span>
                  )}
                </div>
                <p className="text-gold/60 text-xs mt-3">
                  {isZh ? `${sub.items.length} 篇文章` : `${sub.items.length} articles`}
                </p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}
