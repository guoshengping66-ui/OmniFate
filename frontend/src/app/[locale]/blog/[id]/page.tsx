import { notFound } from "next/navigation"
import { ARTICLES } from "@/data/articles"
import { isArticleAvailable } from "@/lib/seo/editorialArticle"
import BlogArticleClient from "./BlogArticleClient"

type Props = { params: Promise<{ locale: string; id: string }> }

export const dynamic = "force-dynamic"

export default async function BlogArticlePage({ params }: Props) {
  const { locale, id } = await params
  const article = ARTICLES.find((entry) => entry.id === id)

  if (!article || !isArticleAvailable(article, locale as "en" | "zh")) notFound()

  return <BlogArticleClient />
}
