import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ - Destiny Mirror",
  description: "Frequently asked questions about Destiny Mirror AI destiny analysis platform, including features, privacy, and pricing.",
  keywords: ["FAQ", "destiny analysis", "privacy", "pricing"],
  openGraph: {
    title: "FAQ - Destiny Mirror",
    description: "Frequently asked questions about Destiny Mirror",
    type: "website",
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
