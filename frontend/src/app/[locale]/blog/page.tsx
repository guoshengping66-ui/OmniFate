"use client"
export const dynamic = "force-dynamic"
import { useMemo } from "react"
import Link from "next/link"
import { BookOpen, Clock, ChevronRight, Search, X, ArrowRight } from "lucide-react"
import { ARTICLES, CATEGORIES } from "@/data/articles"
import { useLanguage } from "@/contexts/LanguageContext"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useState } from "react"
import { safeJsonLd } from "@/utils/safeJsonLd"
import { isArticleAvailable } from "@/lib/seo/editorialArticle"
import { createPublisherJsonLd } from "@/lib/seo/structuredData"

export default function BlogPage() {
  const { locale, t, localeHref } = useLanguage()
  const [activeCategory, setActiveCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const isZh = locale === "zh"

  // Search + category filter
  const filteredArticles = useMemo(() => {
    let result = ARTICLES.filter((article) => isArticleAvailable(article, locale as "en" | "zh"))

    if (activeCategory) {
      result = result.filter(a => a.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(a => {
        const title = isZh ? a.title_zh : a.title_en
        const summary = isZh ? a.summary_zh : a.summary_en
        const tags = isZh ? a.tags_zh : a.tags_en
        return (
          title.toLowerCase().includes(q) ||
          summary.toLowerCase().includes(q) ||
          tags.some(tag => tag.toLowerCase().includes(q))
        )
      })
    }

    return result
  }, [activeCategory, searchQuery, isZh, locale])

  // Featured article (first article, or first in category)
  const featuredArticle = useMemo(() => {
    return filteredArticles[0]
  }, [filteredArticles])

  // Remaining articles (excluding featured)
  const remainingArticles = useMemo(() => {
    return filteredArticles.filter(a => a.id !== featuredArticle?.id)
  }, [filteredArticles, featuredArticle])

  // Category counts
  const categoryCounts = useMemo(() => {
    const visibleArticles = ARTICLES.filter((article) => isArticleAvailable(article, locale as "en" | "zh"))
    const counts: Record<string, number> = { "": visibleArticles.length }
    visibleArticles.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1
    })
    return counts
  }, [locale])

  // JSON-LD structured data for blog list
  const blogJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": isZh ? "KhanFate 博客 - 命理知识与AI解读" : "KhanFate Blog - Destiny Knowledge & AI Insights",
    "description": isZh
      ? "探索八字、星盘、塔罗、面相等命理知识，AI智能解读助您了解自我"
      : "Explore Bazi, Astrology, Tarot, Face Reading and more. AI-powered insights for self-discovery",
    "url": `https://www.khanfate.com/${locale}/blog`,
    "publisher": createPublisherJsonLd(),
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": ARTICLES.length,
      "itemListElement": ARTICLES.slice(0, 10).map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://www.khanfate.com/${locale}/blog/${article.id}`,
        "name": isZh ? article.title_zh : article.title_en,
      }))
    }
  }), [isZh, locale])

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(blogJsonLd) }}
        />
        <Breadcrumbs items={[{ label: t("nav.blog") }]} currentPath={`/${locale}/blog`} />

        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("nav.blog")}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <BookOpen size={28} className="text-gold mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">{t("blog.title")}</h1>
            <p className="text-white/40 text-sm max-w-lg mx-auto">{t("blog.subtitle")}</p>
          </div>
        </ScrollReveal>

        {/* Search */}
        <ScrollReveal delay={0.08}>
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isZh ? "搜索文章标题、标签..." : "Search articles, tags..."}
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

        {/* Category tabs */}
        <ScrollReveal delay={0.1}>
          <div className="flex gap-2 overflow-x-auto scrollbar-none mb-8 pb-2 justify-center flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(activeCategory === cat.key ? "" : cat.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                  ${activeCategory === cat.key
                    ? "bg-gold/15 text-gold border border-gold/30"
                    : "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/60"
                  }`}
              >
                {isZh ? cat.label_zh : cat.label_en}
                <span className="ml-1.5 text-[10px] opacity-50">{categoryCounts[cat.key] || 0}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Search result count */}
        {searchQuery && (
          <p className="text-white/30 text-xs text-center mb-6">
            {isZh ? `找到 ${filteredArticles.length} 篇文章` : `Found ${filteredArticles.length} articles`}
          </p>
        )}

        {filteredArticles.length > 0 ? (
          <>
            {/* ══════════ Featured Article ══════════ */}
            {featuredArticle && (
              <ScrollReveal delay={0.12}>
                <Link
                  href={localeHref(`/blog/${featuredArticle.id}`)}
                  className="block card-glass p-6 md:p-8 mb-8 hover:border-gold/30 transition-all duration-300 group"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Cover emoji large */}
                    <div className="flex-shrink-0 flex items-center justify-center md:w-32">
                      <div className="text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-500">
                        {featuredArticle.cover_emoji}
                      </div>
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] px-2.5 py-0.5 bg-gold/15 text-gold border border-gold/25 rounded-full font-medium">
                          {isZh ? "精选" : "Featured"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-gold/10 text-gold/70 rounded-full border border-gold/20">
                          {isZh
                            ? (CATEGORIES.find(c => c.key === featuredArticle.category)?.label_zh || featuredArticle.category)
                            : (CATEGORIES.find(c => c.key === featuredArticle.category)?.label_en || featuredArticle.category)
                          }
                        </span>
                        <span className="flex items-center gap-0.5 text-white/25 text-[10px]">
                          <Clock size={8} /> {featuredArticle.read_time} {t("blog.minRead")}
                        </span>
                      </div>

                      <h2 className="font-serif font-bold text-white text-xl md:text-2xl leading-tight mb-3 group-hover:text-gold transition-colors">
                        {isZh ? featuredArticle.title_zh : featuredArticle.title_en}
                      </h2>

                      <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-2">
                        {isZh ? featuredArticle.summary_zh : featuredArticle.summary_en}
                      </p>

                      <div className="flex items-center gap-2 text-gold/60 text-sm group-hover:text-gold transition-colors">
                        {t("blog.readMore")}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )}

            {/* ══════════ Articles Grid ══════════ */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {remainingArticles.map((article, i) => (
                <ScrollReveal key={article.id} delay={0.05 * (i % 6)}>
                  <Link
                    href={localeHref(`/blog/${article.id}`)}
                    className="block card-glow p-5 hover:border-gold/30 transition-all duration-300 group h-full"
                  >
                    {/* Cover emoji */}
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {article.cover_emoji}
                    </div>

                    {/* Category & read time */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 bg-gold/10 text-gold/70 rounded-full border border-gold/20">
                        {isZh
                          ? (CATEGORIES.find(c => c.key === article.category)?.label_zh || article.category)
                          : (CATEGORIES.find(c => c.key === article.category)?.label_en || article.category)
                        }
                      </span>
                      <span className="flex items-center gap-0.5 text-white/20 text-[10px]">
                        <Clock size={8} /> {article.read_time} {t("blog.minRead")}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif font-bold text-white text-sm leading-tight mb-2 group-hover:text-gold transition-colors">
                      {isZh ? article.title_zh : article.title_en}
                    </h3>

                    {/* Summary */}
                    <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-3">
                      {isZh ? article.summary_zh : article.summary_en}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(isZh ? article.tags_zh : article.tags_en).slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/[0.04] rounded-full text-white/30">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Read more */}
                    <span className="text-gold/50 text-xs group-hover:text-gold transition-colors flex items-center gap-1 mt-auto">
                      {t("blog.readMore")} <ChevronRight size={10} />
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm">{t("blog.noArticles")}</p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("") }}
                className="text-gold text-xs mt-2 hover:underline"
              >
                {isZh ? "清除搜索" : "Clear search"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
