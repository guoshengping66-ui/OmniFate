import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/contact`

  return {
    title: isZh ? "联系我们 — 命运引擎" : "Contact Us - Destiny Engine",
    description: isZh
      ? "有问题或建议？联系命运引擎团队。我们提供邮件和微信支持。"
      : "Have questions or suggestions? Contact the Destiny Engine team. We provide email and WeChat support.",
    keywords: isZh
      ? "联系我们,客服支持,技术支持,反馈,命运引擎"
      : ["contact us", "customer support", "technical support", "feedback", "destiny engine"],
    openGraph: {
      title: isZh ? "联系我们 — 命运引擎" : "Contact Us - Destiny Engine",
      description: isZh ? "联系命运引擎团队" : "Contact the Destiny Engine team",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/contact`,
        zh: `${base}/zh/contact`,
        "x-default": `${base}/en/contact`,
      },
    },
  }
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
