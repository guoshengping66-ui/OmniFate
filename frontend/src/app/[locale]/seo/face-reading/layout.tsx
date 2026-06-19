import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Face Analysis - Intelligent Face Feature Analysis | Destiny Engine",
  description: "Upload a photo for AI-powered face analysis. Analyzes face shape, features, Three Divisions Five Eyes, and decodes behavioral patterns.",
  keywords: ["face analysis", "AI face analysis", "face feature", "facial features", "status analysis", "online face analysis"],
  openGraph: {
    title: "AI Face Analysis - Intelligent Face Feature Analysis",
    description: "Upload a photo for AI face analysis and behavioral analysis",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://www.khanfate.com/seo/face-reading",
  },
}

export default function FaceReadingLayout({ children }: { children: React.ReactNode }) {
  return children
}
