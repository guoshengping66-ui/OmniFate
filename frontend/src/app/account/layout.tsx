import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Account - Destiny Mirror",
  description: "Manage your account, view membership status, and order history.",
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children
}
