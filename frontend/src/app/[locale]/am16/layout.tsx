import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AM16 Profile Level Test | Guanwo Fate OS",
  description: "Free AM16 Profile Level Test — 12 immersive scenario questions to pinpoint your behavioral state across four dimensions.",
  openGraph: {
    title: "AM16 Profile Level Test — Unlock Your Behavioral Code",
    description: "12 immersive questions across four dimensions to pinpoint your behavioral state",
    url: "https://www.khanfate.com/am16",
    siteName: "Guanwo Fate OS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AM16 Profile Level Test | Guanwo Fate OS",
    description: "12 immersive questions to unlock your behavioral code",
  },
  alternates: {
    canonical: "https://www.khanfate.com/am16",
  },
}

export default function AM16Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
