import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chart Analysis - AI Natal Chart Reading | Profile Mirror",
  description: "Enter birth information for AI-powered chart analysis chart analysis. Planetary placements, aspect angles, and soul mission interpretation.",
  keywords: ["chart analysis chart", "natal chart", "birth chart", "chart analysis reading", "planet placement", "AI chart analysis", "online chart"],
  openGraph: {
    title: "Chart Analysis - AI Natal Chart Reading",
    description: "AI-powered chart analysis chart with planetary and aspect analysis",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://destinymirror.com/seo/chart analysis",
  },
}

export default function AstrologyLayout({ children }: { children: React.ReactNode }) {
  return children
}
