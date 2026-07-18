import { notFound } from "next/navigation"
import { BaziTenGods } from "@/data/programmatic/bazi/tenGods"
import { BaziTenGodTemplate } from "@/components/templates/BaziTenGodTemplate"

interface PageProps {
  params: Promise<{ locale: string; god: string }>
}

export async function generateStaticParams() {
  return BaziTenGods.map(god => ({ god: god.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, god } = await params
  const data = BaziTenGods.find(g => g.id === god)
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
      url: `https://www.khanfate.com/${locale}/bazi/ten-gods/${god}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.title_zh} | Inner Atlas AI` : `${data.title_en} | Inner Atlas AI`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/bazi/ten-gods/${god}`,
      languages: {
        en: `https://www.khanfate.com/en/bazi/ten-gods/${god}`,
        zh: `https://www.khanfate.com/zh/bazi/ten-gods/${god}`,
        "x-default": `https://www.khanfate.com/en/bazi/ten-gods/${god}`,
      },
    },
  }
}

export default async function BaziTenGodPage({ params }: PageProps) {
  const { locale, god } = await params
  const data = BaziTenGods.find(g => g.id === god)
  if (!data) notFound()

  return <BaziTenGodTemplate data={data} locale={locale} />
}
