import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Membership Plans - Destiny Mirror",
  description: "Choose the right membership plan. Unlock multi-dimension destiny analysis, daily almanac, event review, and exclusive features.",
  keywords: ["membership", "pricing", "VIP", "destiny membership"],
  openGraph: {
    title: "Membership Plans - Destiny Mirror",
    description: "Unlock multi-dimension destiny analysis and exclusive features",
    type: "website",
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
