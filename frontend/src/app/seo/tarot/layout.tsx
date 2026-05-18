import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tarot Reading - AI Tarot Card Interpretation | Destiny Mirror",
  description: "Online tarot reading with AI interpretation. Multiple spread options available, revealing current energy state with action guidance and advice.",
  keywords: ["tarot reading", "tarot cards", "online tarot", "tarot spread", "AI tarot", "tarot interpretation"],
  openGraph: {
    title: "Tarot Reading - AI Tarot Card Interpretation",
    description: "AI-powered tarot reading revealing current energy state and guidance",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://destinymirror.com/seo/tarot",
  },
}

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return children
}
