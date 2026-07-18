import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/shop`

  return {
    title: isZh ? "生活方式精选：水晶、饰品与香品 | Inner Atlas AI" : "Lifestyle Shop: Crystals, Jewelry & Incense | Inner Atlas AI",
    description: isZh
      ? "Inner Atlas AI 根据你的 AI 命运画像、五维状态和近期趋势，匹配适合当下阶段的生活方式好物、饰品、香道与服务。"
      : "Browse crystals, jewelry, incense, and talismans as cultural and lifestyle references, then create an Inner Atlas AI dossier for a more personal ordering.",
    keywords: isZh
      ? "Inner Atlas AI,藏宝阁,AI画像匹配,生活方式好物,水晶,饰品,香道,个人成长"
      : ["Inner Atlas AI", "lifestyle shop", "crystals", "jewelry", "incense", "talismans", "personal growth"],
    openGraph: {
      title: isZh ? "生活方式精选 - Inner Atlas AI" : "Lifestyle Shop: Crystals, Jewelry & Incense",
      description: isZh
        ? "不是普通商城，而是基于你的画像、趋势和成长课题生成的匹配建议。"
        : "Browse lifestyle objects first, then create a dossier to receive a more personal ordering.",
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
