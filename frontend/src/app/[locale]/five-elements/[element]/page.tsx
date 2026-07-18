import { notFound } from "next/navigation"
import { FiveElements } from "@/data/programmatic/five-elements/elements"
import { FiveElementTemplate } from "@/components/templates/FiveElementTemplate"

interface PageProps {
  params: Promise<{ locale: string; element: string }>
}

export async function generateStaticParams() {
  return FiveElements.map(element => ({ element: element.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, element } = await params
  const data = FiveElements.find(e => e.id === element)
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
      url: `https://www.khanfate.com/${locale}/five-elements/${element}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.title_zh} | KhanFate` : `${data.title_en} | KhanFate`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/five-elements/${element}`,
      languages: {
        en: `https://www.khanfate.com/en/five-elements/${element}`,
        zh: `https://www.khanfate.com/zh/five-elements/${element}`,
        "x-default": `https://www.khanfate.com/en/five-elements/${element}`,
      },
    },
  }
}

export default async function FiveElementPage({ params }: PageProps) {
  const { locale, element } = await params
  const data = FiveElements.find(e => e.id === element)
  if (!data) notFound()

  return <FiveElementTemplate data={data} locale={locale} />
}
