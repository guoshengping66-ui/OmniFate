"use client"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useRef, type JSX } from "react"
import { ArrowLeft, Clock, Share2, ChevronUp } from "lucide-react"
import { ARTICLES, CATEGORIES } from "@/data/articles"
import { useLanguage } from "@/contexts/LanguageContext"

/* ── Markdown 渲染器 ────────────────────────────────────────────── */

function renderMarkdown(raw: string) {
  const lines = raw.split("\n")
  const elements: JSX.Element[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // 空行
    if (!trimmed) {
      i++
      continue
    }

    // 表格：收集连续的 | 行
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableRows: string[][] = []
      let j = i
      while (j < lines.length) {
        const row = lines[j].trim()
        if (!row.startsWith("|") || !row.endsWith("|")) break
        // 跳过分隔行 |---|---|
        if (/^\|[\s\-:|]+\|$/.test(row)) { j++; continue }
        const cells = row.split("|").slice(1, -1).map(c => c.trim())
        tableRows.push(cells)
        j++
      }
      if (tableRows.length > 0) {
        const isHeader = tableRows.length > 1
        elements.push(
          <div key={key++} className="overflow-x-auto my-4">
            <table className="w-full text-xs border-collapse">
              {isHeader && (
                <thead>
                  <tr>
                    {tableRows[0].map((cell, ci) => (
                      <th key={ci} className="px-3 py-2 text-left text-gold/80 font-medium border-b border-white/10 bg-white/[0.03]">
                        {renderInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {(isHeader ? tableRows.slice(1) : tableRows).map((row, ri) => (
                  <tr key={ri} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-white/50">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        i = j
        continue
      }
    }

    // 标题
    if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={key++} className="text-xl mt-8 mb-3 text-gold font-serif font-bold">{renderInline(trimmed.slice(3))}</h2>)
      i++; continue
    }
    if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={key++} className="text-lg mt-6 mb-2 text-gold/80 font-serif">{renderInline(trimmed.slice(4))}</h3>)
      i++; continue
    }

    // 无序列表
    if (trimmed.startsWith("- ")) {
      const listItems: string[] = []
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        listItems.push(lines[i].trim().slice(2))
        i++
      }
      elements.push(
        <ul key={key++} className="space-y-1.5 my-3 ml-4">
          {listItems.map((item, li) => (
            <li key={li} className="text-sm text-white/60 leading-relaxed list-disc list-inside">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      )
      continue
    }

    // 有序列表
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""))
        i++
      }
      elements.push(
        <ol key={key++} className="space-y-1.5 my-3 ml-4">
          {listItems.map((item, li) => (
            <li key={li} className="text-sm text-white/60 leading-relaxed list-decimal list-inside">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      )
      continue
    }

    // 引用块
    if (trimmed.startsWith("→ ")) {
      elements.push(
        <p key={key++} className="text-gold/70 text-sm mt-4 mb-2 pl-4 border-l-2 border-gold/30 italic">
          {renderInline(trimmed.slice(2))}
        </p>
      )
      i++; continue
    }

    // 普通段落
    elements.push(<p key={key++} className="text-sm text-white/60 leading-relaxed mb-3">{renderInline(trimmed)}</p>)
    i++
  }

  return elements
}

/** 渲染行内 markdown（加粗、代码等） */
function renderInline(text: string): JSX.Element[] {
  const parts: JSX.Element[] = []
  // 匹配 **bold** 和 `code`
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g
  let lastIndex = 0
  let match
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>)
    }
    if (match[2]) {
      parts.push(<strong key={key++} className="text-white/80 font-medium">{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<code key={key++} className="px-1.5 py-0.5 bg-white/[0.06] rounded text-gold/70 text-xs">{match[3]}</code>)
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>)
  }
  return parts.length > 0 ? parts : [<span key="0">{text}</span>]
}

/* ── 页面组件 ────────────────────────────────────────────── */

export default function BlogArticlePage() {
  const { id } = useParams<{ id: string }>()
  const { locale, t, localeHref } = useLanguage()
  const isZh = locale === "zh"
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const article = ARTICLES.find(a => a.id === id)

  // 阅读进度条
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.scrollHeight - window.innerHeight
      const scrolled = -rect.top
      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)))
      setShowTop(scrolled > 400)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!article) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40">{t("blog.loadingContent")}</p>
          <Link href={localeHref("/blog")} className="text-gold text-sm mt-4 inline-block">{t("blog.backToBlog")}</Link>
        </div>
      </div>
    )
  }

  const title = isZh ? article.title_zh : article.title_en
  const content = isZh ? article.content_zh : article.content_en
  const tags = isZh ? article.tags_zh : article.tags_en

  // 相关文章：同分类的其他文章
  const related = ARTICLES
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 3)
  // 如果同分类不够，补其他分类
  if (related.length < 3) {
    const extra = ARTICLES
      .filter(a => a.id !== article.id && a.category !== article.category && !related.find(r => r.id === a.id))
      .slice(0, 3 - related.length)
    related.push(...extra)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // JSON-LD structured data for article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": isZh ? article.summary_zh : article.summary_en,
    "author": {
      "@type": "Organization",
      "name": "Destiny Engine"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Destiny Engine",
      "url": "https://www.khanfate.com"
    },
    "datePublished": article.created_at,
    "url": `https://www.khanfate.com/${locale}/blog/${article.id}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.khanfate.com/${locale}/blog/${article.id}`
    },
    "keywords": (isZh ? article.tags_zh : article.tags_en).join(", "),
    "articleSection": isZh
      ? (CATEGORIES.find(c => c.key === article.category)?.label_zh || article.category)
      : (CATEGORIES.find(c => c.key === article.category)?.label_en || article.category),
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4" ref={contentRef}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />
      {/* 阅读进度条 */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-white/[0.05]">
        <div
          className="h-full bg-gold/60 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* 返回 */}
        <Link href={localeHref("/blog")}
          className="flex items-center gap-1.5 text-white/40 hover:text-gold text-sm mb-8 transition-colors">
          <ArrowLeft size={14} /> {t("blog.backToBlog")}
        </Link>

        {/* 标题区 */}
        <div className="mb-8">
          <div className="text-5xl mb-4">{article.cover_emoji}</div>
          <h1 className="text-3xl font-serif font-bold text-gold mb-3 leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-3 text-white/30 text-xs flex-wrap">
            <span className="flex items-center gap-1"><Clock size={10} /> {article.read_time} {t("blog.minRead")}</span>
            <span>{article.created_at}</span>
            <button onClick={handleShare} className="flex items-center gap-1 hover:text-gold transition-colors ml-auto">
              <Share2 size={12} /> {t("blog.share") || "分享"}
            </button>
            <div className="flex gap-1">
              {tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-white/[0.04] rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* 文章内容 */}
        <div className="card-glass p-6 md:p-10">
          {renderMarkdown(content)}
        </div>

        {/* 相关文章 */}
        {related.length > 0 && (
          <div className="mt-8">
            <h3 className="text-white/40 text-sm mb-4">{t("blog.related") || "相关推荐"}</h3>
            <div className="grid gap-3">
              {related.map(rel => (
                <Link
                  key={rel.id}
                  href={localeHref(`/blog/${rel.id}`)}
                  className="card-glow p-4 flex items-center gap-3 hover:border-gold/30 transition-all group"
                >
                  <span className="text-2xl">{rel.cover_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white/70 group-hover:text-gold transition-colors truncate">
                      {isZh ? rel.title_zh : rel.title_en}
                    </h4>
                    <p className="text-white/30 text-xs mt-0.5 truncate">
                      {isZh ? rel.summary_zh : rel.summary_en}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center card-glass p-8">
          <p className="text-white/40 text-sm mb-4">{t("blog.ctaQuestion")}</p>
          <Link href={localeHref("/reading/new")} className="btn-gold inline-flex items-center gap-2 text-sm">
            {t("blog.ctaButton")} 🔮
          </Link>
        </div>
      </div>

      {/* 回到顶部 */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/30 transition-all"
        >
          <ChevronUp size={18} />
        </button>
      )}
    </div>
  )
}
