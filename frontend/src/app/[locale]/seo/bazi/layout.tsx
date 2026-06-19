import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/seo/bazi`

  return {
    title: isZh ? "八字分析 — AI 四柱排盘与五行诊断 | 命运引擎" : "Bazi Chart - AI Four Pillars Analysis | Destiny Engine",
    description: isZh
      ? "输入出生时间，AI 自动生成八字排盘、五行分析、十维模式和流年运势预测。不是算命，是用数据读懂你的行为蓝图。"
      : "Enter birth time for AI-powered Bazi charting. Four Pillars arrangement, Five Elements analysis, Ten Dimensions pattern, and annual cycle forecast.",
    keywords: isZh
      ? "八字,四柱排盘,五行分析,八字算命,AI八字,在线排盘,天干地支,命理分析"
      : ["bazi chart", "bazi analysis", "four pillars", "birth chart", "five elements", "AI bazi", "online charting"],
    openGraph: {
      title: isZh ? "八字分析 — AI 四柱排盘 | 命运引擎" : "Bazi Chart - AI Four Pillars Analysis",
      description: isZh
        ? "AI 八字排盘，五行分析，十维模式诊断"
        : "AI-powered Bazi charting with Five Elements and Ten Dimensions analysis",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/seo/bazi`, zh: `${base}/zh/seo/bazi`, "x-default": `${base}/en/seo/bazi` },
    },
  }
}

export default function BaziLayout({ children }: { children: React.ReactNode }) {
  return children
}
