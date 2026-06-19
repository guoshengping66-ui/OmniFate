import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/events`

  return {
    title: isZh ? "事件复盘 — AI 分析关键事件 | 命运引擎" : "Event Review - AI Key Event Analysis | Destiny Engine",
    description: isZh
      ? "输入关键事件的时间和描述，AI 从个人成长角度分析成因、影响和未来趋势。"
      : "Enter key events with time and description. AI analyzes causes, impacts, and future trends from a personal growth perspective.",
    keywords: isZh
      ? "事件复盘,行为分析,关键事件,AI分析,命运引擎"
      : ["event review", "behavioral analysis", "key events", "AI analysis", "destiny engine"],
    openGraph: {
      title: isZh ? "事件复盘 — 命运引擎" : "Event Review - Destiny Engine",
      description: isZh
        ? "AI 从个人成长角度分析关键事件"
        : "AI analysis of key events from a personal growth perspective",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/events`,
        zh: `${base}/zh/events`,
        "x-default": `${base}/en/events`,
      },
    },
  }
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children
}
