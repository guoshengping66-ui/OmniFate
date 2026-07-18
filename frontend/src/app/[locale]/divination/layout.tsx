import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/divination`

  return {
    title: isZh ? "AI 占卜 — 天机神谕 | Inner Atlas AI" : "AI Divination - Celestial Oracle | Inner Atlas AI",
    description: isZh
      ? "AI 天机神谕，融合古老占卜智慧与现代数据分析，为你揭示命运指引。"
      : "AI-powered Celestial Oracle combining ancient divination wisdom with modern data analysis for destiny guidance.",
    keywords: isZh
      ? "AI占卜,天机神谕,占卜,命运指引,在线占卜"
      : ["AI divination", "celestial oracle", "divination", "destiny guidance", "online divination"],
    openGraph: {
      title: isZh ? "AI 占卜 — 天机神谕 | Inner Atlas AI" : "AI Divination - Celestial Oracle | Inner Atlas AI",
      description: isZh
        ? "AI 天机神谕，揭示命运指引"
        : "AI-powered Celestial Oracle for destiny guidance",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/divination`,
        zh: `${base}/zh/divination`,
        "x-default": `${base}/en/divination`,
      },
    },
  }
}

export default function DivinationLayout({ children }: { children: React.ReactNode }) {
  return children
}
