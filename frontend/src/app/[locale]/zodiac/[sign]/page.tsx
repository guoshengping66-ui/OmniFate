import { notFound } from "next/navigation"
import { ZodiacSigns } from "@/data/programmatic/zodiac/signs"
import { ZodiacPageTemplate } from "@/components/templates/ZodiacPageTemplate"

interface PageProps {
  params: Promise<{ locale: string; sign: string }>
}

export async function generateStaticParams() {
  return ZodiacSigns.map(sign => ({ sign: sign.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, sign } = await params
  const data = ZodiacSigns.find(s => s.id === sign)
  if (!data) return {}

  const isZh = locale === "zh"

  return {
    title: isZh ? data.title_zh : data.title_en,
    description: isZh ? data.meta_description_zh : data.meta_description_en,
    keywords: isZh ? data.keywords_zh : data.keywords_en,
    openGraph: {
      title: isZh ? data.title_zh : data.title_en,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `https://www.khanfate.com/${locale}/zodiac/${sign}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.title_zh} | KhanFate` : `${data.title_en} | KhanFate`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/zodiac/${sign}`,
      languages: {
        en: `https://www.khanfate.com/en/zodiac/${sign}`,
        zh: `https://www.khanfate.com/zh/zodiac/${sign}`,
        "x-default": `https://www.khanfate.com/en/zodiac/${sign}`,
      },
    },
  }
}

export default async function ZodiacSignPage({ params }: PageProps) {
  const { locale, sign } = await params
  const data = ZodiacSigns.find(s => s.id === sign)
  if (!data) notFound()

  return <ZodiacPageTemplate data={data} locale={locale} />
}
