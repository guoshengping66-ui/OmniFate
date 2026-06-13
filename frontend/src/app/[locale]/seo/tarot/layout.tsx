import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Symbol Reading - AI Symbol Card Interpretation | Profile Mirror",
  description: "Online symbol reading with AI interpretation. Multiple spread options available, revealing current state with action guidance and advice.",
  keywords: ["symbol reading", "symbol cards", "online symbol", "symbol spread", "AI symbol", "symbol interpretation"],
  openGraph: {
    title: "Symbol Reading - AI Symbol Card Interpretation",
    description: "AI-powered symbol reading revealing current state and guidance",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://khanfate.com/seo/symbol",
  },
}

export default function SymbolLayout({ children }: { children: React.ReactNode }) {
  return children
}
