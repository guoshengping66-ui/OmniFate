import { notFound } from "next/navigation"
import { AstrologyPlanets } from "@/data/programmatic/astrology/planets"
import { AstrologyPlanetTemplate } from "@/components/templates/AstrologyPlanetTemplate"

interface PageProps {
  params: Promise<{ locale: string; planet: string }>
}

export async function generateStaticParams() {
  return AstrologyPlanets.map(planet => ({ planet: planet.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, planet } = await params
  const data = AstrologyPlanets.find(p => p.id === planet)
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
      url: `https://www.khanfate.com/${locale}/astrology/planets/${planet}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.title_zh} | 观我` : `${data.title_en} | Guanwo`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/astrology/planets/${planet}`,
      languages: {
        en: `https://www.khanfate.com/en/astrology/planets/${planet}`,
        zh: `https://www.khanfate.com/zh/astrology/planets/${planet}`,
        "x-default": `https://www.khanfate.com/en/astrology/planets/${planet}`,
      },
    },
  }
}

export default async function AstrologyPlanetPage({ params }: PageProps) {
  const { locale, planet } = await params
  const data = AstrologyPlanets.find(p => p.id === planet)
  if (!data) notFound()

  return <AstrologyPlanetTemplate data={data} locale={locale} />
}
