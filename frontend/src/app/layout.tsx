import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#C9A84C",
}

export const metadata: Metadata = {
  title: "Inner Atlas AI · Personal Insight & Action System",
  description:
    "AI-powered destiny analysis combining Bazi, Ziwei, Western astrology, Tarot, face reading, and palm reading. Discover your personal blueprint and daily action guidance.",
  keywords: ["bazi", "astrology", "tarot", "face reading", "palm reading", "ziwei", "destiny", "fortune"],
  icons: { icon: "/logo.png" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Guanwo",
  },
  openGraph: {
    title: "Inner Atlas AI · Personal Insight & Action System",
    description: "AI-powered destiny analysis — Bazi, Ziwei, Astrology, Tarot, Face & Palm reading combined into your personal action blueprint.",
    url: "https://www.khanfate.com",
    siteName: "Inner Atlas AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inner Atlas AI · Personal Insight & Action System",
    description: "AI-powered destiny analysis — your personal action blueprint.",
  },
  alternates: {
    canonical: "https://www.khanfate.com",
    languages: {
      en: "https://www.khanfate.com/en",
      zh: "https://www.khanfate.com/zh",
      "x-default": "https://www.khanfate.com/en",
    },
  },
}

/**
 * Root layout — minimal shell.
 * The middleware redirects "/" to the locale-prefixed layout below.
 * All real content lives under app/[locale]/layout.tsx.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
