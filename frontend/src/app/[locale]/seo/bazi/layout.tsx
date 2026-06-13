import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bazi Chart - AI Four Pillars Analysis | Profile Mirror",
  description: "Enter birth time for AI-powered Bazi charting. Four Pillars arrangement, Five Elements analysis, Ten Dimensions pattern, and annual cycle forecast.",
  keywords: ["bazi chart", "bazi analysis", "four pillars", "birth chart", "five elements", "AI bazi", "online charting"],
  openGraph: {
    title: "Bazi Chart - AI Four Pillars Analysis",
    description: "AI-powered Bazi charting with Five Elements and Ten Dimensions analysis",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://khanfate.com/seo/bazi",
  },
}

export default function BaziLayout({ children }: { children: React.ReactNode }) {
  return children
}
