import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Membership Plans - Profile Mirror",
  description: "Choose the right membership plan. Unlock multi-dimension behavioral analysis, daily almanac, event review, and exclusive features.",
  keywords: ["membership", "pricing", "VIP", "behavioral membership"],
  openGraph: {
    title: "Membership Plans - Profile Mirror",
    description: "Unlock multi-dimension behavioral analysis and exclusive features",
    type: "website",
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
