import { notFound } from "next/navigation"
import { TarotCards } from "@/data/programmatic/tarot/cards"
import { TarotCardTemplate } from "@/components/templates/TarotCardTemplate"

interface PageProps {
  params: Promise<{ locale: string; card: string }>
}

export async function generateStaticParams() {
  return TarotCards.map(card => ({ card: card.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, card } = await params
  const data = TarotCards.find(c => c.id === card)
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
      url: `https://www.khanfate.com/${locale}/tarot/cards/${card}`,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/tarot/cards/${card}`,
      languages: {
        en: `https://www.khanfate.com/en/tarot/cards/${card}`,
        zh: `https://www.khanfate.com/zh/tarot/cards/${card}`,
        "x-default": `https://www.khanfate.com/en/tarot/cards/${card}`,
      },
    },
  }
}

export default async function TarotCardPage({ params }: PageProps) {
  const { locale, card } = await params
  const data = TarotCards.find(c => c.id === card)
  if (!data) notFound()

  return <TarotCardTemplate data={data} locale={locale} />
}
