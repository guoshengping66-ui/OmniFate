import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "My Readings - Inner Atlas AI",
  description: "View all your behavioral analysis report history.",
}

export default function ReadingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
