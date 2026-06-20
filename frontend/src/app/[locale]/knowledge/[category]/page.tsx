import { notFound } from "next/navigation"
import { KnowledgeCategories, KnowledgeCategoryMap } from "@/data/knowledge"
import { KnowledgeCategoryClient } from "./KnowledgeCategoryClient"

export function generateStaticParams() {
  return KnowledgeCategories.map((cat) => ({ category: cat.id }))
}

interface PageProps {
  params: Promise<{ locale: string; category: string }>
}

export default async function KnowledgeCategoryPage({ params }: PageProps) {
  const { locale, category } = await params
  const data = KnowledgeCategoryMap[category]
  if (!data) notFound()

  return <KnowledgeCategoryClient data={data} locale={locale} />
}
