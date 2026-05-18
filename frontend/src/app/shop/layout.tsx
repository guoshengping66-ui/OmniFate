import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fortune Shop - Destiny Mirror",
  description: "AI-curated fortune items based on your destiny chart, including crystals, jewelry, incense, and talismans with destiny-based recommendations.",
  keywords: ["fortune items", "crystals", "destiny shop", "AI recommendations"],
  openGraph: {
    title: "Fortune Shop - Destiny Mirror",
    description: "AI-curated fortune items matched to your destiny chart",
    type: "website",
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
