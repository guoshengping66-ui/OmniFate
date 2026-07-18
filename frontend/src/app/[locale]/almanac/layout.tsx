import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/almanac`

  return {
    title: isZh ? "每日运势 — 个性化黄历 | Inner Atlas AI" : "Daily Almanac - Personalized Fortune Calendar | Inner Atlas AI",
    description: isZh
      ? "基于你的命盘生成的个性化每日运势，包括每日评分、宜忌和指导建议。"
      : "Personalized daily almanac based on your profile chart, including daily score, do's and don'ts, and guidance.",
    keywords: isZh
      ? "每日运势,黄历,每日评分,每日分析,Inner Atlas AI"
      : ["daily almanac", "daily score", "daily analysis", "fortune calendar", "Inner Atlas AI"],
    openGraph: {
      title: isZh ? "每日运势 — Inner Atlas AI" : "Daily Almanac - Inner Atlas AI",
      description: isZh
        ? "基于命盘的个性化每日运势"
        : "Personalized daily almanac based on your profile chart",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/almanac`,
        zh: `${base}/zh/almanac`,
        "x-default": `${base}/en/almanac`,
      },
    },
  }
}

export default function AlmanacLayout({ children }: { children: React.ReactNode }) {
  return children
}
