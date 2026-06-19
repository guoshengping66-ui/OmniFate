import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Purple Star Astrology - AI Zi Wei Dou Shu Analysis | Destiny Engine",
  description: "AI-powered Purple Star Astrology (Zi Wei Dou Shu) analysis. Map your 12 life palaces, star placements, and destiny trajectory.",
  keywords: ["purple star astrology", "zi wei dou shu", "purple star chart", "ziwei analysis", "AI purple star", "destiny chart"],
  openGraph: {
    title: "Purple Star Astrology - AI Zi Wei Dou Shu Analysis",
    description: "Map your life palaces with AI-powered Purple Star Astrology analysis",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://www.khanfate.com/seo/ziwei",
  },
}

export default function ZiweiLayout({ children }: { children: React.ReactNode }) {
  return children
}
