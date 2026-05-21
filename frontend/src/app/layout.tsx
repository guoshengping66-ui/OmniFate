import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#C9A84C",
}

export const metadata: Metadata = {
  title: "Destiny Mirror · Multi-Dimension Destiny Analysis",
  description:
    "AI-powered destiny analysis combining Bazi, Western astrology, Tarot, face reading, and palmistry. Discover your life blueprint and personalized fortune guidance.",
  keywords: ["bazi", "astrology", "tarot", "face reading", "destiny", "fortune"],
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Destiny Mirror",
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
