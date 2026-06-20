import { notFound } from "next/navigation"
import { KnowledgeCategories, KnowledgeCategoryMap } from "@/data/knowledge"
import { KnowledgeSubcategoryClient } from "./KnowledgeSubcategoryClient"

export function generateStaticParams() {
  const params: Array<{ category: string; subcategory: string }> = []
  for (const cat of KnowledgeCategories) {
    for (const sub of cat.subcategories) {
      params.push({ category: cat.id, subcategory: sub.id })
    }
  }
  return params
}

interface PageProps {
  params: Promise<{ locale: string; category: string; subcategory: string }>
}

export default async function KnowledgeSubcategoryPage({ params }: PageProps) {
  const { locale, category, subcategory } = await params
  const catData = KnowledgeCategoryMap[category]
  if (!catData) notFound()

  const subData = catData.subcategories.find((s) => s.id === subcategory)
  if (!subData) notFound()

  return <KnowledgeSubcategoryClient category={catData} subcategory={subData} locale={locale} />
}
