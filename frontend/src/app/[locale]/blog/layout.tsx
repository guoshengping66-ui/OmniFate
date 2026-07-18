import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/blog`

  return {
    title: isZh ? "Inner Atlas AI 博客 — 命理知识与 AI 解读 | Inner Atlas AI" : "Inner Atlas AI Blog - Destiny Knowledge & AI Insights | Inner Atlas AI",
    description: isZh
      ? "探索八字、星盘、塔罗、面相等命理知识，AI 智能解读助您了解自我。"
      : "Explore Bazi, Astrology, Tarot, Face Reading and more. AI-powered insights for self-discovery.",
    keywords: isZh
      ? "命理博客,八字知识,星盘解读,塔罗指南,面相分析,AI命理"
      : ["destiny blog", "bazi knowledge", "astrology insights", "tarot guide", "face reading", "AI destiny"],
    openGraph: {
      title: isZh ? "Inner Atlas AI 博客 — 命理知识与 AI 解读" : "Inner Atlas AI Blog - Destiny Knowledge & AI Insights",
      description: isZh
        ? "探索八字、星盘、塔罗、面相等命理知识"
        : "Explore Bazi, Astrology, Tarot, Face Reading and more",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/blog`, zh: `${base}/zh/blog`, "x-default": `${base}/en/blog` },
    },
  }
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
