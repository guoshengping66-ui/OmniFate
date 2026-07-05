import { notFound } from "next/navigation"
import { ZodiacSigns } from "@/data/programmatic/zodiac/signs"
import { ZodiacCompatibility } from "@/data/programmatic/zodiac/compatibility"
import { CompatibilityTemplate } from "@/components/templates/CompatibilityTemplate"

interface PageProps {
  params: Promise<{ locale: string; sign: string; other: string }>
}

export async function generateStaticParams() {
  const params: Array<{ sign: string; other: string }> = []
  for (const sign of ZodiacSigns) {
    for (const other of ZodiacSigns) {
      if (sign.id !== other.id) {
        params.push({ sign: sign.id, other: other.id })
      }
    }
  }
  return params
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, sign, other } = await params
  const signData = ZodiacSigns.find(s => s.id === sign)
  const otherData = ZodiacSigns.find(s => s.id === other)
  const compatibility = ZodiacCompatibility.find(c => c.sign_a === sign && c.sign_b === other)

  if (!signData || !otherData || !compatibility) return {}

  const isZh = locale === "zh"

  return {
    title: isZh ? compatibility.title_zh : compatibility.title_en,
    description: isZh ? compatibility.meta_description_zh : compatibility.meta_description_en,
    keywords: isZh ? compatibility.keywords_zh : compatibility.keywords_en,
    openGraph: {
      title: isZh ? compatibility.title_zh : compatibility.title_en,
      description: isZh ? compatibility.meta_description_zh : compatibility.meta_description_en,
      type: "article",
      locale: isZh ? "zh_CN" : "en_US",
      url: `https://www.khanfate.com/${locale}/zodiac/${sign}/compatibility/${other}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${compatibility.title_zh} | 观我` : `${compatibility.title_en} | Guanwo`,
      description: isZh ? compatibility.meta_description_zh : compatibility.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/zodiac/${sign}/compatibility/${other}`,
      languages: {
        en: `https://www.khanfate.com/en/zodiac/${sign}/compatibility/${other}`,
        zh: `https://www.khanfate.com/zh/zodiac/${sign}/compatibility/${other}`,
        "x-default": `https://www.khanfate.com/en/zodiac/${sign}/compatibility/${other}`,
      },
    },
  }
}

export default async function ZodiacCompatibilityPage({ params }: PageProps) {
  const { locale, sign, other } = await params
  const signData = ZodiacSigns.find(s => s.id === sign)
  const otherData = ZodiacSigns.find(s => s.id === other)
  const compatibility = ZodiacCompatibility.find(c => c.sign_a === sign && c.sign_b === other)

  if (!signData || !otherData || !compatibility) notFound()

  return <CompatibilityTemplate data={compatibility} locale={locale} />
}
