"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { useLanguage } from "@/contexts/LanguageContext"
import { KnowledgeCategories } from "@/data/knowledge"

function safeJsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
}

export default function KnowledgePage() {
  const { t, localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": isZh ? "命理知识库" : "Knowledge Base",
    "description": isZh
      ? "探索中国命理学、西方占星学、占卜术和相术的完整知识体系"
      : "Explore the complete knowledge system of Chinese metaphysics, Western astrology, divination, and body reading",
    "url": `https://www.khanfate.com/${locale}/knowledge`,
  }

  const totalItems = KnowledgeCategories.reduce((sum, cat) =>
    sum + cat.subcategories.reduce((s, sub) => s + sub.items.length, 0), 0
  )

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
        <Breadcrumbs items={[{ label: isZh ? "知识库" : "Knowledge Base" }]} currentPath={`/${locale}/knowledge`} />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {isZh ? "命理知识库" : "Knowledge Base"}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {isZh
                ? `探索 ${totalItems} 篇关于命理、占星、占卜和相术的深度文章`
                : `Explore ${totalItems} in-depth articles on metaphysics, astrology, divination, and body reading`}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {KnowledgeCategories.map((cat, idx) => {
            const itemCount = cat.subcategories.reduce((s, sub) => s + sub.items.length, 0)
            return (
              <ScrollReveal key={cat.id} delay={0.05 * (idx + 1)}>
                <Link
                  href={localeHref(cat.canonical_path)}
                  className="card-glow p-6 md:p-8 hover:border-gold/30 transition-all duration-300 group block h-full"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform flex-shrink-0">
                      {cat.emoji}
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-serif text-xl font-bold text-white group-hover:text-gold transition-colors mb-2">
                        {isZh ? cat.name_zh : cat.name_en}
                      </h2>
                      <p className="text-white/40 text-sm leading-relaxed mb-4">
                        {isZh ? cat.description_zh : cat.description_en}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cat.subcategories.map((sub) => (
                          <span key={sub.id} className="text-xs bg-white/5 text-white/50 px-2.5 py-1 rounded-full">
                            {isZh ? sub.name_zh : sub.name_en}
                            <span className="text-white/30 ml-1">({sub.items.length})</span>
                          </span>
                        ))}
                      </div>
                      <p className="text-gold/60 text-xs mt-3">
                        {isZh ? `${itemCount} 篇文章` : `${itemCount} articles`}
                      </p>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </div>
  )
}
