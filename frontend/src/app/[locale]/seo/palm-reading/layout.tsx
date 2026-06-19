import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/seo/palm-reading`

  return {
    title: isZh ? "AI 手相分析 — 智能掌纹解读与行为模式 | 命运引擎" : "AI Palm Reading - Intelligent Palm Line Analysis | Destiny Engine",
    description: isZh
      ? "上传手掌照片，AI 分析生命线、智慧线、感情线，解读行为模式。不是看手相，是用数据照见你的内在模式。"
      : "Upload a palm photo for AI-powered palm reading. Analyzes life line, head line, heart line, and reveals behavioral patterns.",
    keywords: isZh
      ? "手相分析,AI手相,掌纹分析,手相解读,在线手相,手相测试"
      : ["palm reading", "AI palm reading", "palm line analysis", "palmistry", "hand reading AI", "online palm reading"],
    openGraph: {
      title: isZh ? "AI 手相分析 — 智能掌纹解读 | 命运引擎" : "AI Palm Reading - Intelligent Palm Line Analysis",
      description: isZh
        ? "AI 手相分析，掌纹与行为模式解读"
        : "AI-powered palm reading revealing life patterns and guidance",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/seo/palm-reading`, zh: `${base}/zh/seo/palm-reading` },
    },
  }
}

export default function PalmReadingLayout({ children }: { children: React.ReactNode }) {
  return children
}
