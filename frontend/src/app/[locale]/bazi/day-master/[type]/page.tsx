import { notFound } from "next/navigation"
import { BaziDayMasters } from "@/data/programmatic/bazi/dayMasters"
import { BaziDayMasterTemplate } from "@/components/templates/BaziDayMasterTemplate"

interface PageProps {
  params: Promise<{ locale: string; type: string }>
}

export async function generateStaticParams() {
  return BaziDayMasters.map(master => ({ type: master.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, type } = await params
  const data = BaziDayMasters.find(m => m.id === type)
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
      url: `https://www.khanfate.com/${locale}/bazi/day-master/${type}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.title_zh} | 观我` : `${data.title_en} | Guanwo`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/bazi/day-master/${type}`,
      languages: {
        en: `https://www.khanfate.com/en/bazi/day-master/${type}`,
        zh: `https://www.khanfate.com/zh/bazi/day-master/${type}`,
        "x-default": `https://www.khanfate.com/en/bazi/day-master/${type}`,
      },
    },
  }
}

export default async function BaziDayMasterPage({ params }: PageProps) {
  const { locale, type } = await params
  const data = BaziDayMasters.find(m => m.id === type)
  if (!data) notFound()

  return <BaziDayMasterTemplate data={data} locale={locale} />
}
