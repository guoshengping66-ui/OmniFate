import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Destiny Blog - Destiny Mirror",
  description: "Explore Bazi, astrology, tarot, face reading, and palmistry knowledge with AI-powered insights.",
  keywords: ["destiny blog", "bazi tutorial", "astrology guide", "tarot reading", "face reading"],
  openGraph: {
    title: "Destiny Blog - Destiny Mirror",
    description: "Explore destiny analysis knowledge and AI insights",
    type: "website",
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
