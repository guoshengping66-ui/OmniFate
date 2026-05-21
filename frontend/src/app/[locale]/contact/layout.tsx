import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us - Destiny Mirror",
  description: "Have questions or suggestions? Contact the Destiny Mirror team. We provide email and WeChat support.",
  keywords: ["contact us", "customer support", "technical support", "feedback"],
  openGraph: {
    title: "Contact Us - Destiny Mirror",
    description: "Contact the Destiny Mirror team",
    type: "website",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
