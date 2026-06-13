import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Behavioral Blog - Profile Mirror",
  description: "Explore Bazi, chart analysis, symbol, face reading, and hand analysis knowledge with AI-powered insights.",
  keywords: ["behavioral blog", "bazi tutorial", "chart analysis guide", "symbol reading", "face reading"],
  openGraph: {
    title: "Behavioral Blog - Profile Mirror",
    description: "Explore behavioral analysis knowledge and AI insights",
    type: "website",
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
