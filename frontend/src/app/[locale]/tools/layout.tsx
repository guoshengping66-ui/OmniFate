import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/tools`

  return {
    title: isZh ? "免费探索工具｜星际分析、性格测验与今日指令 | 观我 Fate OS" : "Free Exploration Tools | Star Analysis, Personality Quiz, Today Command | Guanwo Fate OS",
    description: isZh
      ? "星际分析、性格测验、八字、星盘、塔罗、面相、手相与五行查询，作为进入观我 Fate OS 的低门槛探索入口。"
      : "Star Analysis, personality quizzes, Bazi, astrology, tarot, face reading, palm reading, and Five Elements as low-friction entry points into Guanwo Fate OS.",
    keywords: isZh
      ? "免费探索工具,星际分析,性格测验,八字,星盘,塔罗,面相,手相,五行,观我"
      : ["free exploration tools", "star analysis", "personality quiz", "bazi", "astrology", "tarot", "face reading", "palm reading", "five elements"],
    openGraph: {
      title: isZh ? "免费探索工具 | 观我 Fate OS" : "Free Exploration Tools | Guanwo Fate OS",
      description: isZh ? "星际分析、性格测验和今日趋势是进入命运行动系统的低门槛入口。" : "Star Analysis, personality quizzes, and daily trends are low-friction entries into the destiny action system.",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/tools`, zh: `${base}/zh/tools`, "x-default": `${base}/en/tools` },
    },
  }
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}
