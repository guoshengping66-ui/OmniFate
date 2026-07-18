import { notFound } from "next/navigation"
import { FaceShapes } from "@/data/programmatic/face/shapes"
import { FaceShapeTemplate } from "@/components/templates/FaceShapeTemplate"

interface PageProps {
  params: Promise<{ locale: string; shape: string }>
}

export async function generateStaticParams() {
  return FaceShapes.map(shape => ({ shape: shape.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, shape } = await params
  const data = FaceShapes.find(s => s.id === shape)
  if (!data) return {}

  const isZh = locale === "zh"

  return {
    title: isZh ? data.title_zh : data.title_en,
    description: isZh ? data.meta_description_zh : data.meta_description_en,
    keywords: isZh ? data.keywords_zh : data.keywords_en,
    openGraph: {
      title: isZh ? data.title_zh : data.title_en,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
      type: "article",
      locale: isZh ? "zh_CN" : "en_US",
      url: `https://www.khanfate.com/${locale}/face-reading/shapes/${shape}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.title_zh} | KhanFate` : `${data.title_en} | KhanFate`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/face-reading/shapes/${shape}`,
      languages: {
        en: `https://www.khanfate.com/en/face-reading/shapes/${shape}`,
        zh: `https://www.khanfate.com/zh/face-reading/shapes/${shape}`,
        "x-default": `https://www.khanfate.com/en/face-reading/shapes/${shape}`,
      },
    },
  }
}

export default async function FaceShapePage({ params }: PageProps) {
  const { locale, shape } = await params
  const data = FaceShapes.find(s => s.id === shape)
  if (!data) notFound()

  return <FaceShapeTemplate data={data} locale={locale} />
}
