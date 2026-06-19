"use client"
import { useState, useMemo } from "react"
import { HelpCircle, Search, X, MessageCircle } from "lucide-react"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useLanguage } from "@/contexts/LanguageContext"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import Link from "next/link"

/** FAQ categories for filtering */
const FAQ_CATEGORIES = [
  { key: "general", zhLabel: "基础了解", enLabel: "General" },
  { key: "accuracy", zhLabel: "准确度", enLabel: "Accuracy" },
  { key: "privacy", zhLabel: "隐私安全", enLabel: "Privacy" },
  { key: "pricing", zhLabel: "付费服务", enLabel: "Pricing" },
  { key: "getting_started", zhLabel: "开始使用", enLabel: "Getting Started" },
]

/** FAQ items with categories */
const FAQ_DATA = [
  { key: "q1", aKey: "a1", category: "general" },
  { key: "q2", aKey: "a2", category: "accuracy" },
  { key: "q3", aKey: "a3", category: "privacy" },
  { key: "q4", aKey: "a4", category: "pricing" },
  { key: "q5", aKey: "a5", category: "getting_started" },
]

export default function FAQPage() {
  const { t, locale, localeHref } = useLanguage()
  const [activeCategory, setActiveCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const isZh = locale === "zh"

  const filteredFaqs = useMemo(() => {
    let result = FAQ_DATA

    if (activeCategory) {
      result = result.filter(f => f.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(f => {
        const question = t(`faq.${f.key}`)
        const answer = t(`faq.${f.aKey}`)
        return (
          question.toLowerCase().includes(q) ||
          answer.toLowerCase().includes(q)
        )
      })
    }

    return result
  }, [activeCategory, searchQuery, t])

  // FAQPage JSON-LD for rich snippets
  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_DATA.map(item => ({
      "@type": "Question",
      "name": t(`faq.${item.key}`),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": t(`faq.${item.aKey}`),
      },
    })),
  }), [t])

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <Breadcrumbs items={[{ label: t("faq.breadcrumb") }]} currentPath={`/${locale}/faq`} />

        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("faq.breadcrumb")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <HelpCircle size={28} className="text-gold mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">{t("faq.title")}</h1>
            <p className="text-white/40 text-sm">{t("faq.contactDesc")}</p>
          </div>
        </ScrollReveal>

        {/* Search */}
        <ScrollReveal delay={0.08}>
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isZh ? "搜索问题..." : "Search questions..."}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-gold/30 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Category filters */}
        <ScrollReveal delay={0.1}>
          <div className="flex gap-2 overflow-x-auto scrollbar-none mb-8 pb-2 justify-center flex-wrap">
            {FAQ_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(activeCategory === cat.key ? "" : cat.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                  ${activeCategory === cat.key
                    ? "bg-gold/15 text-gold border border-gold/30"
                    : "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/60"
                  }`}
              >
                {isZh ? cat.zhLabel : cat.enLabel}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Search result count */}
        {searchQuery && (
          <p className="text-white/30 text-xs text-center mb-4">
            {isZh ? `找到 ${filteredFaqs.length} 个问题` : `Found ${filteredFaqs.length} questions`}
          </p>
        )}

        {/* FAQ List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-3 mb-16">
            {filteredFaqs.map((item, i) => (
              <ScrollReveal key={item.key} delay={0.04 * i}>
                <AccordionItem
                  question={t(`faq.${item.key}`)}
                  answer={t(`faq.${item.aKey}`)}
                  defaultOpen={false}
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-16">
            <p className="text-white/30 text-sm mb-2">{isZh ? "没有找到相关问题" : "No matching questions found"}</p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("") }}
                className="text-gold text-xs hover:underline"
              >
                {isZh ? "清除搜索" : "Clear search"}
              </button>
            )}
          </div>
        )}

        {/* Contact CTA */}
        <ScrollReveal>
          <div className="card-glass p-6 text-center">
            <MessageCircle size={24} className="text-gold/50 mx-auto mb-3" />
            <h2 className="font-serif text-lg text-white/80 mb-2">{t("faq.moreQuestions")}</h2>
            <p className="text-white/35 text-sm mb-5">
              {t("faq.contactTeamDesc")}
            </p>
            <Link
              href={localeHref("/contact")}
              className="btn-gold inline-flex items-center gap-2 px-7 py-2.5 text-sm"
            >
              {t("faq.contactUs")}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
