"use client"
import { type ReactNode } from "react"
import { NextIntlClientProvider } from "next-intl"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { LanguageProvider } from "@/contexts/LanguageContext"

function CartProviderWithAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const isMember = !!user?.is_premium
  return <CartProvider isMember={isMember}>{children}</CartProvider>
}

interface AppProvidersProps {
  children: ReactNode
  messages: Record<string, unknown>
  locale: string
}

export function AppProviders({ children, messages, locale }: AppProvidersProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <LanguageProvider>
        <AuthProvider>
          <CartProviderWithAuth>
            {children}
          </CartProviderWithAuth>
        </AuthProvider>
      </LanguageProvider>
    </NextIntlClientProvider>
  )
}
