import { notFound } from "next/navigation"
import { ZiweiPalaces } from "@/data/programmatic/ziwei/palaces"
import { ZiweiPalaceTemplate } from "@/components/templates/ZiweiPalaceTemplate"

interface PageProps {
  params: Promise<{ locale: string; palace: string }>
}

export async function generateStaticParams() {
  return ZiweiPalaces.map(palace => ({ palace: palace.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, palace } = await params
  const data = ZiweiPalaces.find(p => p.id === palace)
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
      url: `https://www.khanfate.com/${locale}/ziwei/palaces/${palace}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.title_zh} | KhanFate` : `${data.title_en} | KhanFate`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/ziwei/palaces/${palace}`,
      languages: {
        en: `https://www.khanfate.com/en/ziwei/palaces/${palace}`,
        zh: `https://www.khanfate.com/zh/ziwei/palaces/${palace}`,
        "x-default": `https://www.khanfate.com/en/ziwei/palaces/${palace}`,
      },
    },
  }
}

export default async function ZiweiPalacePage({ params }: PageProps) {
  const { locale, palace } = await params
  const data = ZiweiPalaces.find(p => p.id === palace)
  if (!data) notFound()

  return <ZiweiPalaceTemplate data={data} locale={locale} />
}
