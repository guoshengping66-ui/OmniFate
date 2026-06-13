import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Profile Mirror",
  description: "Log in to your Profile Mirror account to view reports and membership benefits.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
