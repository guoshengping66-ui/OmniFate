"use client"
import { type ReactNode, useMemo } from "react"
import { NextIntlClientProvider } from "next-intl"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { RegionProvider } from "@/contexts/RegionContext"

function CartProviderWithAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  // Only re-render CartProvider when isMember actually changes,
  // not on every user state update (e.g. background /api/auth/me refresh)
  const isMember = useMemo(() => !!user?.is_premium, [user?.is_premium])
  return <CartProvider isMember={isMember}>{children}</CartProvider>
}

interface AppProvidersProps {
  children: ReactNode
  messages: Record<string, unknown>
  locale: string
}

export function AppProviders({ children, messages, locale }: AppProvidersProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale} timeZone="Asia/Shanghai">
      <RegionProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProviderWithAuth>
              {children}
            </CartProviderWithAuth>
          </AuthProvider>
        </LanguageProvider>
      </RegionProvider>
    </NextIntlClientProvider>
  )
}
