import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Astrology Chart - AI Natal Chart Reading | Destiny Mirror",
  description: "Enter birth information for AI-powered astrology chart analysis. Planetary placements, aspect angles, and soul mission interpretation.",
  keywords: ["astrology chart", "natal chart", "birth chart", "astrology reading", "planet placement", "AI astrology", "online chart"],
  openGraph: {
    title: "Astrology Chart - AI Natal Chart Reading",
    description: "AI-powered astrology chart with planetary and aspect analysis",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://destinymirror.com/seo/astrology",
  },
}

export default function AstrologyLayout({ children }: { children: React.ReactNode }) {
  return children
}
