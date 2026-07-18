import { notFound } from "next/navigation"
import { FaceFeatures } from "@/data/programmatic/face/features"
import { FaceFeatureTemplate } from "@/components/templates/FaceFeatureTemplate"

interface PageProps {
  params: Promise<{ locale: string; feature: string }>
}

export async function generateStaticParams() {
  return FaceFeatures.map(feature => ({ feature: feature.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, feature } = await params
  const data = FaceFeatures.find(f => f.id === feature)
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
      url: `https://www.khanfate.com/${locale}/face-reading/features/${feature}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.title_zh} | Inner Atlas AI` : `${data.title_en} | Inner Atlas AI`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/face-reading/features/${feature}`,
      languages: {
        en: `https://www.khanfate.com/en/face-reading/features/${feature}`,
        zh: `https://www.khanfate.com/zh/face-reading/features/${feature}`,
        "x-default": `https://www.khanfate.com/en/face-reading/features/${feature}`,
      },
    },
  }
}

export default async function FaceFeaturePage({ params }: PageProps) {
  const { locale, feature } = await params
  const data = FaceFeatures.find(f => f.id === feature)
  if (!data) notFound()

  return <FaceFeatureTemplate data={data} locale={locale} />
}
