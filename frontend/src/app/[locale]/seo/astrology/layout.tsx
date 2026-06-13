import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chart Analysis - AI Natal Chart Reading | Profile Mirror",
  description: "Enter birth information for AI-powered chart analysis. Planetary placements, aspect angles, and behavioral pattern interpretation.",
  keywords: ["chart analysis", "natal chart", "birth chart", "chart reading", "planet placement", "AI chart analysis", "online chart"],
  openGraph: {
    title: "Chart Analysis - AI Natal Chart Reading",
    description: "AI-powered chart analysis with planetary and aspect analysis",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://khanfate.com/seo/astrology",
  },
}

export default function AstrologyLayout({ children }: { children: React.ReactNode }) {
  return children
}
