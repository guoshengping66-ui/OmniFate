import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/about`

  return {
    title: isZh ? "关于我们 — KhanFate 团队与理念 | KhanFate" : "About Us - KhanFate Team & Vision | KhanFate",
    description: isZh
      ? "了解KhanFate 团队。我们用 AI 技术解读传统命理，帮助您理解行为模式与人生轨迹。"
      : "Meet the KhanFate team. We use AI to decode traditional destiny analysis, helping you understand behavioral patterns and life trajectory.",
    openGraph: {
      title: isZh ? "关于我们 — KhanFate 团队与理念" : "About Us - KhanFate Team & Vision",
      description: isZh
        ? "了解KhanFate 团队与理念"
        : "Meet the KhanFate team and our vision",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/about`, zh: `${base}/zh/about`, "x-default": `${base}/en/about` },
    },
  }
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
