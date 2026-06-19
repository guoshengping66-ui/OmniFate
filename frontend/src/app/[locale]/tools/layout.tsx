import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/tools`

  return {
    title: isZh ? "命运分析工具 — AI 八字/占星/塔罗/面相/手相 | 命运引擎" : "Destiny Analysis Tools - AI Bazi, Astrology, Tarot, Face & Palm Reading | Destiny Engine",
    description: isZh
      ? "免费 AI 命运分析工具：八字排盘、星盘分析、紫微斗数、塔罗牌解读、面相分析、手相分析、五行查询。"
      : "Free AI destiny analysis tools: Bazi chart, birth chart, Ziwei Doushu, tarot reading, face analysis, palm reading, and Five Elements.",
    keywords: isZh
      ? "命运分析,AI工具,八字,占星,塔罗,面相,手相,五行,紫微斗数"
      : ["destiny analysis", "AI tools", "bazi", "astrology", "tarot", "face reading", "palm reading", "five elements"],
    openGraph: {
      title: isZh ? "命运分析工具 | 命运引擎" : "Destiny Analysis Tools | Destiny Engine",
      description: isZh ? "免费 AI 命运分析工具合集" : "Free AI destiny analysis tools",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/tools`, zh: `${base}/zh/tools`, "x-default": `${base}/en/tools` },
    },
  }
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}
