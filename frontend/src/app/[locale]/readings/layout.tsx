import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Readings - Destiny Mirror",
  description: "View all your destiny analysis report history.",
}

export default function ReadingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
