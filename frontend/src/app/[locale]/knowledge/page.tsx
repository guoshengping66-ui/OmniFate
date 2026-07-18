"use client"
export const dynamic = "force-dynamic"

import Link from "next/link"
import { BookOpenCheck, SearchCheck } from "lucide-react"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useLanguage } from "@/contexts/LanguageContext"
import { KnowledgeCategories } from "@/data/knowledge"
import { createPublisherJsonLd } from "@/lib/seo/structuredData"
import { safeJsonLd } from "@/utils/safeJsonLd"
import { EasternCard, EasternPageShell, EasternSection } from "@/components/brand/EasternDesign"

export default function KnowledgePage() {
  const { localeHref, locale } = useLanguage()
  const isZh = locale === "zh"

  const totalItems = KnowledgeCategories.reduce((sum, cat) =>
    sum + cat.subcategories.reduce((s, sub) => s + sub.items.length, 0), 0
  )

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `https://www.khanfate.com/${locale}/knowledge#collection`,
    "name": isZh ? "KhanFate 知识库" : "KhanFate Guide",
    "description": isZh
      ? "用克制、解释型的方法理解八字、星盘、塔罗、面相、手相与 AI 合参。"
      : "A grounded guide to Bazi, astrology, tarot, body reading, and AI synthesis.",
    "url": `https://www.khanfate.com/${locale}/knowledge`,
    "inLanguage": isZh ? "zh-CN" : "en",
    "publisher": createPublisherJsonLd(),
  }

  return (
    <EasternPageShell>
      <div className="mx-auto w-[min(1180px,calc(100vw-32px))] pb-16 pt-24">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
        <Breadcrumbs items={[{ label: isZh ? "知识库" : "Guide" }]} currentPath={`/${locale}/knowledge`} />
      </div>

      <EasternSection
        eyebrow={isZh ? "方法与信任" : "Method and Trust"}
        title={isZh ? "用更清醒的方式理解命理、人格与行动" : "A clearer way to read pattern, personality, and action"}
        headingTag="h1"
        description={isZh
          ? `这里不是神神叨叨的断语集合，而是 ${totalItems} 篇关于八字、星盘、塔罗、面相、手相与 AI 合参方法的解释型内容。`
          : `This is not a pile of verdicts. It is a ${totalItems}-article guide to Bazi, astrology, tarot, face reading, palm reading, and AI synthesis.`}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {(isZh
            ? [
                ["解释", "先讲清楚概念、边界和适用场景。"],
                ["合参", "把多个维度放在同一问题里交叉验证。"],
                ["行动", "从理解走向今日可执行的一步。"],
              ]
            : [
                ["Explain", "Clarify concepts, limits, and use cases."],
                ["Synthesize", "Cross-check several sources inside one question."],
                ["Act", "Move from insight into one executable step."],
              ]).map(([title, body]) => (
            <EasternCard key={title} className="p-6">
              <SearchCheck className="text-[var(--color-gold)]" size={24} />
              <h2 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">{body}</p>
            </EasternCard>
          ))}
        </div>
      </EasternSection>

      <section className="mx-auto w-[min(1180px,calc(100vw-32px))] pb-24">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {KnowledgeCategories.map((cat, idx) => {
            const itemCount = cat.subcategories.reduce((s, sub) => s + sub.items.length, 0)
            return (
              <ScrollReveal key={cat.id} delay={0.05 * (idx + 1)}>
                <Link href={localeHref(cat.canonical_path)} className="group ow-card block h-full p-6 transition hover:border-[var(--color-gold-soft)] md:p-8">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl border border-[var(--color-gold-soft)] bg-[rgba(200,168,74,0.08)] text-2xl">
                      {cat.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] transition group-hover:text-[var(--color-gold)] md:text-xl">
                          {isZh ? cat.name_zh : cat.name_en}
                        </h2>
                        <BookOpenCheck size={18} className="text-[var(--color-gold)]" />
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                        {isZh ? cat.description_zh : cat.description_en}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {cat.subcategories.map(sub => (
                          <span key={sub.id} className="rounded-full border border-white/[0.08] bg-[#060E24] px-3 py-1 text-xs text-white/50">
                            {isZh ? sub.name_zh : sub.name_en}
                            <span className="ml-1 text-white/30">({sub.items.length})</span>
                          </span>
                        ))}
                      </div>
                      <p className="mt-4 text-xs text-[var(--color-gold)]">
                        {isZh ? `${itemCount} 篇文章` : `${itemCount} articles`}
                      </p>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      </section>
    </EasternPageShell>
  )
}
