"use client"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { ARTICLES } from "@/data/articles"
import { useLanguage } from "@/contexts/LanguageContext"

export default function BlogArticlePage() {
  const { id } = useParams<{ id: string }>()
  const { locale, t } = useLanguage()
  const isZh = locale === "zh"

  const article = ARTICLES.find(a => a.id === id)

  if (!article) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40">{t("blog.loadingContent")}</p>
          <Link href="/blog" className="text-gold text-sm mt-4 inline-block">{t("blog.backToBlog")}</Link>
        </div>
      </div>
    )
  }

  const title = isZh ? article.title_zh : article.title_en
  const content = isZh ? article.content_zh : article.content_en
  const tags = isZh ? article.tags_zh : article.tags_en

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link href="/blog"
          className="flex items-center gap-1.5 text-white/40 hover:text-gold text-sm mb-8 transition-colors">
          <ArrowLeft size={14} /> {t("blog.backToBlog")}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="text-5xl mb-4">{article.cover_emoji}</div>
          <h1 className="text-3xl font-serif font-bold text-gold mb-3 leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-3 text-white/30 text-xs">
            <span className="flex items-center gap-1"><Clock size={10} /> {article.read_time} {t("blog.minRead")}</span>
            <div className="flex gap-1">
              {tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-white/[0.04] rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="card-glass p-6 md:p-10">
          <div className="space-y-4">
            {content.split("\n").map((line, i) => {
              const trimmed = line.trim()
              if (!trimmed) return <br key={i} />
              // Strip markdown symbols
              const clean = trimmed
                .replace(/^#{1,3}\s+/, "")
                .replace(/^\-+\s+/, "")
                .replace(/\*\*(.+?)\*\*/g, "$1")
                .replace(/^→\s*/, "")
                .replace(/^\|.*\|$/, (row) => row.split("|").filter(c => c.trim()).map(c => c.trim()).join("  "))
              // Detect if it's a heading (was preceded by ##)
              const isH2 = trimmed.startsWith("## ") && !trimmed.startsWith("### ")
              const isH3 = trimmed.startsWith("### ")
              if (isH2) return <h2 key={i} className="text-xl mt-8 mb-3 text-gold font-serif font-bold">{clean}</h2>
              if (isH3) return <h3 key={i} className="text-lg mt-6 mb-2 text-gold/80 font-serif">{clean}</h3>
              return <p key={i} className="text-sm text-white/60 leading-relaxed mb-2">{clean}</p>
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center card-glass p-8">
          <p className="text-white/40 text-sm mb-4">{t("blog.ctaQuestion")}</p>
          <Link href="/reading/new" className="btn-gold inline-flex items-center gap-2 text-sm">
            {t("blog.ctaButton")} 🔮
          </Link>
        </div>
      </div>
    </div>
  )
}
