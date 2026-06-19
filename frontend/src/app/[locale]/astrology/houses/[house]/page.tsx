import { notFound } from "next/navigation"
import { AstrologyHouses } from "@/data/programmatic/astrology/houses"
import { AstrologyHouseTemplate } from "@/components/templates/AstrologyHouseTemplate"

interface PageProps {
  params: Promise<{ locale: string; house: string }>
}

export async function generateStaticParams() {
  return AstrologyHouses.map(house => ({ house: house.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, house } = await params
  const data = AstrologyHouses.find(h => h.id === house)
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
      url: `https://www.khanfate.com/${locale}/astrology/houses/${house}`,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/astrology/houses/${house}`,
      languages: {
        en: `https://www.khanfate.com/en/astrology/houses/${house}`,
        zh: `https://www.khanfate.com/zh/astrology/houses/${house}`,
        "x-default": `https://www.khanfate.com/en/astrology/houses/${house}`,
      },
    },
  }
}

export default async function AstrologyHousePage({ params }: PageProps) {
  const { locale, house } = await params
  const data = AstrologyHouses.find(h => h.id === house)
  if (!data) notFound()

  return <AstrologyHouseTemplate data={data} locale={locale} />
}
