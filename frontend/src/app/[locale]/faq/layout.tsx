import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ - Profile Mirror",
  description: "Frequently asked questions about Profile Mirror AI behavioral analysis platform, including features, privacy, and pricing.",
  keywords: ["FAQ", "behavioral analysis", "privacy", "pricing"],
  openGraph: {
    title: "FAQ - Profile Mirror",
    description: "Frequently asked questions about Profile Mirror",
    type: "website",
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
