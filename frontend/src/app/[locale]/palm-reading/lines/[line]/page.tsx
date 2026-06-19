import { notFound } from "next/navigation"
import { PalmLines } from "@/data/programmatic/palm/lines"
import { PalmLineTemplate } from "@/components/templates/PalmLineTemplate"

interface PageProps {
  params: Promise<{ locale: string; line: string }>
}

export async function generateStaticParams() {
  return PalmLines.map(line => ({ line: line.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, line } = await params
  const data = PalmLines.find(l => l.id === line)
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
      url: `https://www.khanfate.com/${locale}/palm-reading/lines/${line}`,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/palm-reading/lines/${line}`,
      languages: {
        en: `https://www.khanfate.com/en/palm-reading/lines/${line}`,
        zh: `https://www.khanfate.com/zh/palm-reading/lines/${line}`,
        "x-default": `https://www.khanfate.com/en/palm-reading/lines/${line}`,
      },
    },
  }
}

export default async function PalmLinePage({ params }: PageProps) {
  const { locale, line } = await params
  const data = PalmLines.find(l => l.id === line)
  if (!data) notFound()

  return <PalmLineTemplate data={data} locale={locale} />
}
