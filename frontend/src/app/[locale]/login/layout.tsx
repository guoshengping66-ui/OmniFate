import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Login - Inner Atlas AI",
  description: "Log in to your Inner Atlas AI account to view reports and membership benefits.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
