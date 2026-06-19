import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/ziwei`

  return {
    title: isZh ? "紫微斗数 — AI 紫微星盘分析与宫位解读 | 命运引擎" : "Purple Star Astrology - AI Zi Wei Dou Shu Analysis | Destiny Engine",
    description: isZh
      ? "AI 紫微斗数分析，映射你的 12 宫位、星曜落点和命运轨迹。用数据解读你的行为模式。"
      : "AI-powered Purple Star Astrology (Zi Wei Dou Shu) analysis. Map your 12 life palaces, star placements, and destiny trajectory.",
    keywords: isZh
      ? "紫微斗数,紫微星盘,星盘分析,命宫,AI紫微,在线排盘,星曜落点"
      : ["purple star astrology", "zi wei dou shu", "purple star chart", "ziwei analysis", "AI purple star", "destiny chart"],
    openGraph: {
      title: isZh ? "紫微斗数 — AI 紫微星盘分析 | 命运引擎" : "Purple Star Astrology - AI Zi Wei Dou Shu Analysis",
      description: isZh
        ? "AI 紫微斗数分析，映射 12 宫位与星曜"
        : "Map your life palaces with AI-powered Purple Star Astrology analysis",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/ziwei`, zh: `${base}/zh/ziwei`, "x-default": `${base}/en/ziwei` },
    },
  }
}

export default function ZiweiLayout({ children }: { children: React.ReactNode }) {
  return children
}
