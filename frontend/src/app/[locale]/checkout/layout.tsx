import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout - Profile Mirror",
  description: "Confirm your order and choose a payment method to complete your purchase.",
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
