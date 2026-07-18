import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/astrology`

  return {
    title: isZh ? "星盘分析 — AI 本命星盘解读与相位诊断 | Inner Atlas AI" : "Chart Analysis - AI Natal Chart Reading | Inner Atlas AI",
    description: isZh
      ? "输入出生信息，AI 解读星盘行星落位、相位角度和行为模式。不是占星算命，是用天文学数据照见你的内在模式。"
      : "Enter birth information for AI-powered chart analysis. Planetary placements, aspect angles, and behavioral pattern interpretation.",
    keywords: isZh
      ? "星盘,本命盘,星盘分析,行星落位,相位分析,AI星盘,占星,星盘解读"
      : ["chart analysis", "natal chart", "birth chart", "chart reading", "planet placement", "AI chart analysis", "online chart"],
    openGraph: {
      title: isZh ? "星盘分析 — AI 本命星盘解读 | Inner Atlas AI" : "Chart Analysis - AI Natal Chart Reading",
      description: isZh
        ? "AI 星盘分析，行星落位与相位诊断"
        : "AI-powered chart analysis with planetary and aspect analysis",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/astrology`, zh: `${base}/zh/astrology`, "x-default": `${base}/en/astrology` },
    },
  }
}

export default function AstrologyLayout({ children }: { children: React.ReactNode }) {
  return children
}
