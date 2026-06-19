import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/disclaimer`

  return {
    title: isZh ? "免责声明 — 命运引擎" : "Disclaimer - Destiny Engine",
    description: isZh
      ? "命运引擎免责声明。本网站提供的分析仅供参考，不构成专业建议。"
      : "Destiny Engine disclaimer. Analysis provided on this site is for reference only and does not constitute professional advice.",
    openGraph: {
      title: isZh ? "免责声明 — 命运引擎" : "Disclaimer - Destiny Engine",
      description: isZh ? "命运引擎免责声明" : "Destiny Engine disclaimer",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/disclaimer`,
        zh: `${base}/zh/disclaimer`,
        "x-default": `${base}/en/disclaimer`,
      },
    },
  }
}

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children
}
