import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#C9A84C",
}

export const metadata: Metadata = {
  title: "Profile Mirror · Multi-Dimension Behavioral Analysis",
  description:
    "AI-powered behavioral analysis combining Bazi, Western chart analysis, Symbol analysis, face reading, and hand analysis. Discover your behavioral blueprint and personalized status guidance.",
  keywords: ["bazi", "chart analysis", "symbol", "face reading", "profile", "status"],
  icons: { icon: "/logo.png" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Profile Mirror",
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
