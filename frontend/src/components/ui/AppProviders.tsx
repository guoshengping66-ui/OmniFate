"use client"
import { type ReactNode } from "react"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { LanguageProvider } from "@/contexts/LanguageContext"

function CartProviderWithAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const isMember = !!user?.is_premium
  return <CartProvider isMember={isMember}>{children}</CartProvider>
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProviderWithAuth>
          {children}
        </CartProviderWithAuth>
      </AuthProvider>
    </LanguageProvider>
  )
}
