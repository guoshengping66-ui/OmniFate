import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/terms`

  return {
    title: isZh ? "服务条款 — KhanFate" : "Terms of Service - KhanFate",
    description: isZh
      ? "KhanFate 服务条款。使用本網站即表示你同意以下条款。"
      : "KhanFate terms of service. By using this website, you agree to the following terms.",
    openGraph: {
      title: isZh ? "服务条款 — KhanFate" : "Terms of Service - KhanFate",
      description: isZh ? "KhanFate 服务条款" : "KhanFate terms of service",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/terms`,
        zh: `${base}/zh/terms`,
        "x-default": `${base}/en/terms`,
      },
    },
  }
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
