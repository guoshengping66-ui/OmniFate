"use client"
import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { BookOpen, Clock, Loader2, ChevronRight, Search, X } from "lucide-react"
import { ARTICLES, CATEGORIES } from "@/data/articles"
import { useLanguage } from "@/contexts/LanguageContext"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

export default function BlogPage() {
  const { locale, t, localeHref } = useLanguage()
  const [activeCategory, setActiveCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const isZh = locale === "zh"

  // 搜索 + 分类过滤
  const filteredArticles = useMemo(() => {
    let result = ARTICLES

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
  }, [activeCategory, searchQuery, isZh])

  // 分类文章计数
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "": ARTICLES.length }
    ARTICLES.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ label: t("nav.blog") }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <BookOpen size={36} className="text-gold mx-auto mb-3" />
          <h1 className="text-4xl font-serif font-bold text-gold mb-2">{t("blog.title")}</h1>
          <p className="text-white/50">{t("blog.subtitle")}</p>
        </div>

        {/* 搜索框 */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
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
              <span className="ml-1 text-[10px] opacity-50">{categoryCounts[cat.key] || 0}</span>
            </button>
          ))}
        </div>

        {/* 文章数量提示 */}
        {searchQuery && (
          <p className="text-white/30 text-xs text-center mb-4">
            {isZh ? `找到 ${filteredArticles.length} 篇文章` : `Found ${filteredArticles.length} articles`}
          </p>
        )}

        {/* Articles grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArticles.map(article => (
              <Link
                key={article.id}
                href={localeHref(`/blog/${article.id}`)}
                className="card-glow p-5 hover:border-gold/30 transition-all duration-300 group block"
              >
                {/* Cover emoji */}
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
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
                <p className="text-white/35 text-xs leading-relaxed line-clamp-3 mb-3">
                  {isZh ? article.summary_zh : article.summary_en}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(isZh ? article.tags_zh : article.tags_en).map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/[0.04] rounded-full text-white/30">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Read more */}
                <span className="text-gold/50 text-xs group-hover:text-gold transition-colors flex items-center gap-1">
                  {t("blog.readMore")} <ChevronRight size={10} />
                </span>
              </Link>
            ))}
          </div>
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
