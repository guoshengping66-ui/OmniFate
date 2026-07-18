import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/knowledge`

  return {
    title: isZh ? "Inner Atlas AI 知识库｜文化解读指南" : "Inner Atlas AI Knowledge Library | Cultural Interpretation Guides",
    description: isZh
      ? "面向八字、占星、塔罗、面相、手相与 AI 辅助反思的公开教育指南。"
      : "Public educational guides to Bazi, astrology, tarot, face reading, palm reading, and AI-assisted reflection.",
    openGraph: {
      title: isZh ? "Inner Atlas AI 知识库" : "Inner Atlas AI Knowledge Library",
      description: isZh
        ? "探索八字、占星、塔罗、面相、手相与 AI 辅助反思的公开文化解读指南。"
        : "Public cultural interpretation guides for Bazi, astrology, tarot, face reading, palm reading, and AI-assisted reflection.",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/knowledge`,
        zh: `${base}/zh/knowledge`,
        "x-default": `${base}/en/knowledge`,
      },
    },
  }
}

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return children
}
