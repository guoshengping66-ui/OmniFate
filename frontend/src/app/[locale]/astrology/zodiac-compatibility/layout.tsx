import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/astrology/zodiac-compatibility`

  return {
    title: isZh ? "星座配对 — AI 星座匹配分析与 compatibility | 命运引擎" : "Zodiac Compatibility - AI Star Sign Matching Analysis | Destiny Engine",
    description: isZh
      ? "AI 星座配对分析，发现你与任何星座的恋爱、友谊和工作兼容性。用数据解读星座之间的化学反应。"
      : "AI-powered zodiac compatibility analysis. Discover your romantic, friendship, and work compatibility with any star sign combination.",
    keywords: isZh
      ? "星座配对,星座兼容性,星座匹配,AI星座配对,星座恋爱配对,星座友谊"
      : ["zodiac compatibility", "star sign matching", "horoscope compatibility", "AI zodiac match", "astrology compatibility", "love match"],
    openGraph: {
      title: isZh ? "星座配对 — AI 星座匹配分析 | 命运引擎" : "Zodiac Compatibility - AI Star Sign Matching Analysis",
      description: isZh
        ? "AI 星座配对，发现你的星座兼容性"
        : "Discover your compatibility with AI-powered zodiac matching analysis",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/astrology/zodiac-compatibility`, zh: `${base}/zh/astrology/zodiac-compatibility`, "x-default": `${base}/en/astrology/zodiac-compatibility` },
    },
  }
}

export default function ZodiacCompatibilityLayout({ children }: { children: React.ReactNode }) {
  return children
}
