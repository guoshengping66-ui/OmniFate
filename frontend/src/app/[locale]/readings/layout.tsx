import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Readings - Profile Mirror",
  description: "View all your behavioral analysis report history.",
}

export default function ReadingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
