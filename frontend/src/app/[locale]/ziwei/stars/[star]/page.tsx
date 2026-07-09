import { notFound } from "next/navigation"
import { ZiweiStars } from "@/data/programmatic/ziwei/stars"
import { ZiweiStarTemplate } from "@/components/templates/ZiweiStarTemplate"

interface PageProps {
  params: Promise<{ locale: string; star: string }>
}

export async function generateStaticParams() {
  return ZiweiStars.map(star => ({ star: star.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, star } = await params
  const data = ZiweiStars.find(s => s.id === star)
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
      url: `https://www.khanfate.com/${locale}/ziwei/stars/${star}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.title_zh} | 观我` : `${data.title_en} | Guanwo`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/ziwei/stars/${star}`,
      languages: {
        en: `https://www.khanfate.com/en/ziwei/stars/${star}`,
        zh: `https://www.khanfate.com/zh/ziwei/stars/${star}`,
        "x-default": `https://www.khanfate.com/en/ziwei/stars/${star}`,
      },
    },
  }
}

export default async function ZiweiStarPage({ params }: PageProps) {
  const { locale, star } = await params
  const data = ZiweiStars.find(s => s.id === star)
  if (!data) notFound()

  return <ZiweiStarTemplate data={data} locale={locale} />
}
