import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Register - KhanFate",
  description: "Create your KhanFate account and start your AI behavioral analysis journey.",
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
