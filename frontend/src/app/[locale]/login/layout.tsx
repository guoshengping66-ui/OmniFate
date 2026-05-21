import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Destiny Mirror",
  description: "Log in to your Destiny Mirror account to view reports and membership benefits.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
