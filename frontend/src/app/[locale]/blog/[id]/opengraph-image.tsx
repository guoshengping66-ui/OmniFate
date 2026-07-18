import { ImageResponse } from "next/og"
import { notFound } from "next/navigation"
import { ARTICLES } from "@/data/articles"
import { isArticleAvailable } from "@/lib/seo/editorialArticle"

export const runtime = "edge"
export const alt = "Inner Atlas AI editorial article"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

type Props = { params: Promise<{ locale: string; id: string }> }

export default async function OpenGraphImage({ params }: Props) {
  const { locale, id } = await params
  const article = ARTICLES.find((entry) => entry.id === id)

  if (!article || !isArticleAvailable(article, locale as "en" | "zh")) notFound()

  const isZh = locale === "zh"
  const title = isZh ? article.title_zh : article.title_en
  const category = isZh ? article.category : article.category.replace(/-/g, " ")

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "58px 64px",
          color: "#F7F0DC",
          background: "linear-gradient(135deg, #071713 0%, #102D26 50%, #08100E 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px", color: "#E8CB7A", fontSize: 28 }}>
          <span style={{ fontSize: 38 }}>✦</span>
          <span>INNER ATLAS AI</span>
          <span style={{ opacity: 0.72 }}>·</span>
          <span style={{ opacity: 0.86 }}>{category}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "42px" }}>
          <div
            style={{
              width: 150,
              height: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "999px",
              border: "2px solid rgba(232, 203, 122, 0.55)",
              background: "rgba(232, 203, 122, 0.08)",
              fontSize: 78,
            }}
          >
            {article.cover_emoji}
          </div>
          <div style={{ display: "flex", maxWidth: "820px", fontSize: 58, lineHeight: 1.13, fontFamily: "serif" }}>
            {title}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(247, 240, 220, 0.72)", fontSize: 24 }}>
          <span>{isZh ? "用于自我觉察的文化与象征性指南" : "Cultural and symbolic guides for reflective self-discovery"}</span>
          <span>{article.created_at}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
