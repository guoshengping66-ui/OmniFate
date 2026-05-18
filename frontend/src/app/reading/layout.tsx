import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Destiny Reading - Destiny Mirror",
  description: "Enter birth information for AI-powered five-dimension destiny analysis: Bazi, astrology, tarot, face reading, and palmistry.",
  keywords: ["AI destiny reading", "bazi chart", "astrology", "tarot reading", "face reading"],
  openGraph: {
    title: "AI Destiny Reading - Destiny Mirror",
    description: "Five-dimension AI destiny analysis for your life blueprint",
    type: "website",
  },
}

export default function ReadingLayout({ children }: { children: React.ReactNode }) {
  return children
}
