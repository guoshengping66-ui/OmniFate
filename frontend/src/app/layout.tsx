import type { Metadata, Viewport } from "next"
import { SEO_BRAND_DESCRIPTION, SEO_BRAND_NAME, SEO_SITE_URL } from "@/lib/seo/brand"

export const viewport: Viewport = {
  themeColor: "#C9A84C",
}

export const metadata: Metadata = {
  title: {
    default: `${SEO_BRAND_NAME} | AI-Guided Personal Insight`,
    template: `%s | ${SEO_BRAND_NAME}`,
  },
  description: SEO_BRAND_DESCRIPTION,
  keywords: ["bazi", "astrology", "tarot", "face reading", "palm reading", "ziwei", "personal insight", "cultural interpretation"],
  icons: { icon: "/logo.png" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SEO_BRAND_NAME,
  },
  openGraph: {
    title: `${SEO_BRAND_NAME} | AI-Guided Personal Insight`,
    description: SEO_BRAND_DESCRIPTION,
    url: SEO_SITE_URL,
    siteName: SEO_BRAND_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SEO_BRAND_NAME} | AI-Guided Personal Insight`,
    description: SEO_BRAND_DESCRIPTION,
  },
  alternates: {
    canonical: SEO_SITE_URL,
    languages: {
      en: `${SEO_SITE_URL}/en`,
      zh: `${SEO_SITE_URL}/zh`,
      "x-default": `${SEO_SITE_URL}/en`,
    },
  },
}

/**
 * Root layout is a minimal shell. Middleware redirects the root path to a locale route.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
