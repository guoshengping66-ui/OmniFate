import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Status Shop - Profile Mirror",
  description: "AI-curated status items based on your profile chart, including crystals, jewelry, incense, and talismans with personalized recommendations.",
  keywords: ["status items", "crystals", "profile shop", "AI recommendations"],
  openGraph: {
    title: "Status Shop - Profile Mirror",
    description: "AI-curated status items matched to your profile chart",
    type: "website",
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
