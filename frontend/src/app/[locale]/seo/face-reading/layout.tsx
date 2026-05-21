import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Face Reading - Intelligent Face Analysis | Destiny Mirror",
  description: "Upload a photo for AI-powered face reading. Analyzes face shape, features, Three Divisions Five Eyes, and decodes destiny patterns.",
  keywords: ["face reading", "AI face reading", "face analysis", "facial features", "fortune reading", "online face reading"],
  openGraph: {
    title: "AI Face Reading - Intelligent Face Analysis",
    description: "Upload a photo for AI face reading and destiny analysis",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://destinymirror.com/seo/face-reading",
  },
}

export default function FaceReadingLayout({ children }: { children: React.ReactNode }) {
  return children
}
