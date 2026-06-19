import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Five Elements Analysis - AI Metal Wood Water Fire Earth | Destiny Engine",
  description: "AI-powered Five Elements analysis. Discover your elemental balance, generating & overcoming cycles, and personalized life guidance.",
  keywords: ["five elements analysis", "metal wood water fire earth", "wu xing", "five elements balance", "AI five elements", "elemental chart"],
  openGraph: {
    title: "Five Elements Analysis - AI Metal Wood Water Fire Earth",
    description: "Discover your elemental balance with AI-powered Five Elements analysis",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://www.khanfate.com/seo/five-elements",
  },
}

export default function FiveElementsLayout({ children }: { children: React.ReactNode }) {
  return children
}
