"use client"
import { type ReactNode, useMemo } from "react"
import { NextIntlClientProvider } from "next-intl"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { RegionProvider, useRegion } from "@/contexts/RegionContext"
import { useVersionCheck } from "@/hooks/useVersionCheck"

function CartProviderWithAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { region } = useRegion()
  const isMember = useMemo(() => !!user?.is_premium, [user?.is_premium])
  return <CartProvider isMember={isMember} region={region}>{children}</CartProvider>
}

interface AppProvidersProps {
  children: ReactNode
  messages: Record<string, unknown>
  locale: string
  initialRegion?: "domestic" | "overseas"
}

export function AppProviders({ children, messages, locale, initialRegion }: AppProvidersProps) {
  // Post-React version check — safe for auth state because it runs AFTER
  // AuthProvider has mounted and restored cached user from sessionStorage.
  // Replaces the inline pre-React version check which could trigger a reload
  // before AuthProvider mounts, causing auth state to flash as logged-out.
  useVersionCheck()

  return (
    <NextIntlClientProvider messages={messages} locale={locale} timeZone="Asia/Shanghai">
      <RegionProvider initialRegion={initialRegion}>
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
