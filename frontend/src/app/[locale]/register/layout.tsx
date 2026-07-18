import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Register - Inner Atlas AI",
  description: "Create your Inner Atlas AI account and start your AI behavioral analysis journey.",
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
