import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/faq`

  return {
    title: isZh ? "常见问题 — 命运引擎" : "FAQ - Destiny Engine",
    description: isZh
      ? "关于命运引擎 AI 行为分析平台的常见问题，包括功能、隐私和定价。"
      : "Frequently asked questions about Destiny Engine AI behavioral analysis platform, including features, privacy, and pricing.",
    keywords: isZh
      ? "常见问题,FAQ,行为分析,隐私,定价,命运引擎"
      : ["FAQ", "behavioral analysis", "privacy", "pricing", "destiny engine"],
    openGraph: {
      title: isZh ? "常见问题 — 命运引擎" : "FAQ - Destiny Engine",
      description: isZh ? "命运引擎常见问题解答" : "Frequently asked questions about Destiny Engine",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/faq`,
        zh: `${base}/zh/faq`,
        "x-default": `${base}/en/faq`,
      },
    },
  }
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
