import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Palm Reading - Intelligent Palm Line Analysis | Destiny Engine",
  description: "Upload a palm photo for AI-powered palm reading. Analyzes life line, head line, heart line, and reveals behavioral patterns.",
  keywords: ["palm reading", "AI palm reading", "palm line analysis", "palmistry", "hand reading AI", "online palm reading"],
  openGraph: {
    title: "AI Palm Reading - Intelligent Palm Line Analysis",
    description: "AI-powered palm reading revealing life patterns and guidance",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://www.khanfate.com/seo/palm-reading",
  },
}

export default function PalmReadingLayout({ children }: { children: React.ReactNode }) {
  return children
}
