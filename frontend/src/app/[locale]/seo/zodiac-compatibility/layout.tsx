import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Zodiac Compatibility - AI Star Sign Matching Analysis | Destiny Engine",
  description: "AI-powered zodiac compatibility analysis. Discover your romantic, friendship, and work compatibility with any star sign combination.",
  keywords: ["zodiac compatibility", "star sign matching", "horoscope compatibility", "AI zodiac match", "astrology compatibility", "love match"],
  openGraph: {
    title: "Zodiac Compatibility - AI Star Sign Matching Analysis",
    description: "Discover your compatibility with AI-powered zodiac matching analysis",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://www.khanfate.com/seo/zodiac-compatibility",
  },
}

export default function ZodiacCompatibilityLayout({ children }: { children: React.ReactNode }) {
  return children
}
