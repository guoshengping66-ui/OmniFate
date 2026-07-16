import type { Metadata } from "next"
import { AI_SEARCH_REFERENCE } from "@/data/seo/aiSearchReference"
import { createAiSearchReferenceJsonLd } from "@/lib/seo/aiSearchReference"
import { safeJsonLd } from "@/utils/safeJsonLd"

const PAGE_URL = "https://www.khanfate.com/en/ai-search"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params

  if (locale === "zh") {
    return {
      alternates: { canonical: PAGE_URL },
      robots: { index: false, follow: true },
    }
  }

  return {
    title: AI_SEARCH_REFERENCE.title,
    description: AI_SEARCH_REFERENCE.description,
    alternates: {
      canonical: PAGE_URL,
      languages: { en: PAGE_URL, "x-default": PAGE_URL },
    },
    robots: { index: true, follow: true },
  }
}

export default async function AiSearchLayout({ children, params }: Props) {
  const { locale } = await params

  if (locale !== "en") return children

  return (
    <>
      {createAiSearchReferenceJsonLd().map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
      ))}
      {children}
    </>
  )
}
