"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { useLanguage } from "@/contexts/LanguageContext"
import type { KnowledgeCategory, KnowledgeSubcategory } from "@/data/knowledge"
import { safeJsonLd } from "@/utils/safeJsonLd"

export function KnowledgeSubcategoryClient({
  category,
  subcategory,
  locale,
}: {
  category: KnowledgeCategory
  subcategory: KnowledgeSubcategory
  locale: string
}) {
  const { localeHref } = useLanguage()
  const isZh = locale === "zh"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": isZh ? subcategory.name_zh : subcategory.name_en,
    "description": isZh ? subcategory.description_zh : subcategory.description_en,
    "url": `https://www.khanfate.com/${locale}${subcategory.canonical_path}`,
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
        <Breadcrumbs
          items={[
            { label: isZh ? "知识库" : "Knowledge", href: localeHref("/knowledge") },
            { label: isZh ? category.name_zh : category.name_en, href: localeHref(category.canonical_path) },
          ]}
          currentPath={`/${locale}${subcategory.canonical_path}`}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {isZh ? subcategory.name_zh : subcategory.name_en}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {isZh ? subcategory.description_zh : subcategory.description_en}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subcategory.items.map((item, idx) => (
            <ScrollReveal key={item.id} delay={0.03 * (idx + 1)}>
              <Link
                href={localeHref(item.source_path)}
                className="card-glow p-5 hover:border-gold/30 transition-all duration-300 group block h-full"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {item.emoji}
                </div>
                <h3 className="font-serif font-bold text-white text-sm group-hover:text-gold transition-colors mb-2">
                  {isZh ? item.name_zh : item.name_en}
                </h3>
                <p className="text-white/30 text-xs leading-relaxed">
                  {isZh ? item.summary_zh : item.summary_en}
                </p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}
