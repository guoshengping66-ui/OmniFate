import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/privacy`

  return {
    title: isZh ? "隐私政策 — 命运引擎" : "Privacy Policy - Destiny Engine",
    description: isZh
      ? "命运引擎隐私政策。了解我们如何收集、使用和保护你的个人信息。"
      : "Destiny Engine privacy policy. Learn how we collect, use, and protect your personal information.",
    openGraph: {
      title: isZh ? "隐私政策 — 命运引擎" : "Privacy Policy - Destiny Engine",
      description: isZh ? "命运引擎隐私政策" : "Destiny Engine privacy policy",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/privacy`,
        zh: `${base}/zh/privacy`,
        "x-default": `${base}/en/privacy`,
      },
    },
  }
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
