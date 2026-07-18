import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ARTICLES } from "@/data/articles"
import { safeJsonLd } from "@/utils/safeJsonLd"
import { createArticleJsonLd, createFaqJsonLd, getArticleLocales, isArticleAvailable } from "@/lib/seo/editorialArticle"

type Props = { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/blog/${id}`

  const article = ARTICLES.find(a => a.id === id)
  if (!article) {
    notFound()
  }

  if (!isArticleAvailable(article, locale as "en" | "zh")) {
    return {
      title: article.title_en,
      robots: { index: false, follow: true },
      alternates: { canonical: `${base}/en/blog/${id}` },
    }
  }

  const title = isZh ? article.title_zh : article.title_en
  const summary = isZh ? article.summary_zh : article.summary_en
  const tags = isZh ? article.tags_zh : article.tags_en

  return {
    title: `${title} | Inner Atlas AI`,
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
      languages: Object.fromEntries([
        ...getArticleLocales(article).map((itemLocale) => [itemLocale, `${base}/${itemLocale}/blog/${id}`]),
        ["x-default", `${base}/en/blog/${id}`],
      ]),
    },
  }
}

export default async function BlogArticleLayout({ children, params }: Props & { children: React.ReactNode }) {
  const { locale, id } = await params
  const article = ARTICLES.find((entry) => entry.id === id)
  if (!article) notFound()
  if (!isArticleAvailable(article, locale as "en" | "zh")) return children

  const editorial = article as typeof article & { faq?: Array<{ question: string; answer: string }> }
  const articleJsonLd = createArticleJsonLd(article, locale as "en" | "zh")
  const faqJsonLd = createFaqJsonLd(editorial.faq ?? [])

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />
    {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />}
    {children}
  </>
}
