import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/shop`

  return {
    title: isZh ? "藏宝阁 - AI 画像匹配好物 | 观我" : "The Vault - AI-Matched Items | Guanwo AI",
    description: isZh
      ? "观我根据你的 AI 命运画像、五维状态和近期趋势，匹配适合当下阶段的生活方式好物、饰品、香道与服务。"
      : "Guanwo matches lifestyle items, jewelry, incense, and services to your AI profile, five-dimension state, and current trend.",
    keywords: isZh
      ? "观我,藏宝阁,AI画像匹配,生活方式好物,水晶,饰品,香道,个人成长"
      : ["Guanwo", "AI profile match", "lifestyle items", "crystals", "jewelry", "incense", "personal growth"],
    openGraph: {
      title: isZh ? "藏宝阁 - 观我 AI 画像匹配好物" : "The Vault - Guanwo AI-Matched Items",
      description: isZh
        ? "不是普通商城，而是基于你的画像、趋势和成长课题生成的匹配建议。"
        : "Not a generic shop. These recommendations are matched to your profile, trend, and growth task.",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/shop`,
        zh: `${base}/zh/shop`,
        "x-default": `${base}/en/shop`,
      },
    },
  }
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
