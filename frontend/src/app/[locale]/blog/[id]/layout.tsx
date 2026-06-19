import type { Metadata } from "next"
import { ARTICLES } from "@/data/articles"

type Props = { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/blog/${id}`

  const article = ARTICLES.find(a => a.id === id)
  if (!article) {
    return {
      title: isZh ? "文章未找到 | 命运引擎" : "Article Not Found | Destiny Engine",
    }
  }

  const title = isZh ? article.title_zh : article.title_en
  const summary = isZh ? article.summary_zh : article.summary_en
  const tags = isZh ? article.tags_zh : article.tags_en

  return {
    title: `${title} | 命运引擎`,
    description: summary,
    keywords: tags,
    openGraph: {
      title,
      description: summary,
      type: "article",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
      publishedTime: article.created_at,
      modifiedTime: article.created_at,
      tags,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/blog/${id}`,
        zh: `${base}/zh/blog/${id}`,
        "x-default": `${base}/en/blog/${id}`,
      },
    },
  }
}

export default function BlogArticleLayout({ children }: { children: React.ReactNode }) {
  return children
}
