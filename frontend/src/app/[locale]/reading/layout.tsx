import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Profile Reading - Profile Mirror",
  description: "Enter birth information for AI-powered five-dimension behavioral analysis: Bazi, chart analysis, symbol, face reading, and hand analysis.",
  keywords: ["AI destiny reading", "bazi chart", "chart analysis", "symbol reading", "face reading"],
  openGraph: {
    title: "AI Profile Reading - Profile Mirror",
    description: "Five-dimension AI behavioral analysis for your life blueprint",
    type: "website",
  },
}

export default function ReadingLayout({ children }: { children: React.ReactNode }) {
  return children
}
