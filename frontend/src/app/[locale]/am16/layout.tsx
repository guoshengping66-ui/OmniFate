import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AM16 Destiny Level Test | AlphaMirror",
  description: "Free AM16 Destiny Level Test — 12 immersive scenario questions to pinpoint your spiritual state across four dimensions.",
  openGraph: {
    title: "AM16 Destiny Level Test — Unlock Your Spiritual Code",
    description: "12 immersive questions across four dimensions to pinpoint your spiritual state",
    url: "https://alphamirror.app/am16",
    siteName: "AlphaMirror",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AM16 Destiny Level Test | AlphaMirror",
    description: "12 immersive questions to unlock your spiritual code",
  },
  alternates: {
    canonical: "https://alphamirror.app/am16",
  },
}

export default function AM16Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
