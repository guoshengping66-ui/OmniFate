import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "My Account - Inner Atlas AI",
  description: "Manage your account, view membership status, and order history.",
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children
}
