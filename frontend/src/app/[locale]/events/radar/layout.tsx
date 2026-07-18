import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/events/radar`

  return {
    title: isZh ? "事件雷达 — AI 事件趋势分析 | KhanFate" : "Event Radar - AI Event Trend Analysis | KhanFate",
    description: isZh
      ? "AI 事件雷达，分析你生活中关键事件的趋势和周期，预测未来走向。"
      : "AI Event Radar analyzing trends and cycles of key life events to predict future directions.",
    keywords: isZh
      ? "事件雷达,事件趋势,AI分析,生活事件,KhanFate"
      : ["event radar", "event trends", "AI analysis", "life events", "KhanFate"],
    openGraph: {
      title: isZh ? "事件雷达 — KhanFate" : "Event Radar - KhanFate",
      description: isZh
        ? "AI 分析关键事件趋势与周期"
        : "AI analysis of key life event trends and cycles",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/events/radar`,
        zh: `${base}/zh/events/radar`,
        "x-default": `${base}/en/events/radar`,
      },
    },
  }
}

export default function EventsRadarLayout({ children }: { children: React.ReactNode }) {
  return children
}
