import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/faq`

  return {
    title: isZh ? "常见问题 — Inner Atlas AI" : "FAQ - Inner Atlas AI",
    description: isZh
      ? "关于Inner Atlas AI 行为分析平台的常见问题，包括功能、隐私和定价。"
      : "Frequently asked questions about Inner Atlas AI behavioral analysis platform, including features, privacy, and pricing.",
    keywords: isZh
      ? "常见问题,FAQ,行为分析,隐私,定价,Inner Atlas AI"
      : ["FAQ", "behavioral analysis", "privacy", "pricing", "Inner Atlas AI"],
    openGraph: {
      title: isZh ? "常见问题 — Inner Atlas AI" : "FAQ - Inner Atlas AI",
      description: isZh ? "Inner Atlas AI常见问题解答" : "Frequently asked questions about Inner Atlas AI",
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
