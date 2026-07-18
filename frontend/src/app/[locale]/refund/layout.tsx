import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/refund`

  return {
    title: isZh ? "退款政策 — KhanFate" : "Refund Policy - KhanFate",
    description: isZh
      ? "KhanFate退款政策。了解会员服务和商品的退款条件与流程。"
      : "KhanFate refund policy. Learn about refund conditions and procedures for memberships and products.",
    openGraph: {
      title: isZh ? "退款政策 — KhanFate" : "Refund Policy - KhanFate",
      description: isZh ? "KhanFate退款政策" : "KhanFate refund policy",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/refund`,
        zh: `${base}/zh/refund`,
        "x-default": `${base}/en/refund`,
      },
    },
  }
}

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return children
}
