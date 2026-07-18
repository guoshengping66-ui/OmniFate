import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/contact`

  return {
    title: isZh ? "联系我们 — KhanFate" : "Contact Us - KhanFate",
    description: isZh
      ? "有问题或建议？联系KhanFate 团队。我们提供邮件和微信支持。"
      : "Have questions or suggestions? Contact the KhanFate team. We provide email and WeChat support.",
    keywords: isZh
      ? "联系我们,客服支持,技术支持,反馈,KhanFate"
      : ["contact us", "customer support", "technical support", "feedback", "KhanFate"],
    openGraph: {
      title: isZh ? "联系我们 — KhanFate" : "Contact Us - KhanFate",
      description: isZh ? "联系KhanFate 团队" : "Contact the KhanFate team",
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
