import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/five-elements`

  return {
    title: isZh ? "五行分析 — AI 金木水火土元素平衡 | 命运引擎" : "Five Elements Analysis - AI Metal Wood Water Fire Earth | Destiny Engine",
    description: isZh
      ? "AI 五行分析，发现你的元素平衡、相生相克关系，获得个性化的生活调和建议。"
      : "AI-powered Five Elements analysis. Discover your elemental balance, generating & overcoming cycles, and personalized life guidance.",
    keywords: isZh
      ? "五行分析,金木水火土,五行平衡,五行相生相克,AI五行,五行诊断"
      : ["five elements analysis", "metal wood water fire earth", "wu xing", "five elements balance", "AI five elements", "elemental chart"],
    openGraph: {
      title: isZh ? "五行分析 — AI 金木水火土平衡 | 命运引擎" : "Five Elements Analysis - AI Metal Wood Water Fire Earth",
      description: isZh
        ? "AI 五行分析，发现你的元素平衡"
        : "Discover your elemental balance with AI-powered Five Elements analysis",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/five-elements`, zh: `${base}/zh/five-elements`, "x-default": `${base}/en/five-elements` },
    },
  }
}

export default function FiveElementsLayout({ children }: { children: React.ReactNode }) {
  return children
}
