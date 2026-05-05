"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Clock, Loader2, ChevronRight } from "lucide-react"
import { ARTICLES, CATEGORIES } from "@/data/articles"
import { useLanguage } from "@/contexts/LanguageContext"

export default function BlogPage() {
  const { locale, t } = useLanguage()
  const [activeCategory, setActiveCategory] = useState("")
  const [articles, setArticles] = useState(ARTICLES)

  const isZh = locale === "zh"

  useEffect(() => {
    if (activeCategory) {
      setArticles(ARTICLES.filter(a => a.category === activeCategory))
    } else {
      setArticles(ARTICLES)
    }
  }, [activeCategory])

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <BookOpen size={36} className="text-gold mx-auto mb-3" />
          <h1 className="text-4xl font-serif font-bold text-gold mb-2">{t("blog.title")}</h1>
          <p className="text-white/50">{t("blog.subtitle")}</p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none mb-8 pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                ${activeCategory === cat.key
                  ? "bg-gold/15 text-gold border border-gold/30"
                  : "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/60"
                }`}
            >
              {isZh ? cat.label_zh : cat.label_en}
            </button>
          ))}
        </div>

        {/* Articles grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map(article => (
            <Link
              key={article.id}
              href={`/blog/${article.id}`}
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
      </div>
    </div>
  )
}
