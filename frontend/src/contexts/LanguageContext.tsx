"use client"
import { createContext, useContext, useCallback, type ReactNode } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { type Locale, locales } from "@/i18n/config"

interface LanguageState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  /** Prefix a bare path with the current locale, e.g. "/pricing" → "/en/pricing" */
  localeHref: (path: string) => string
}

const LanguageContext = createContext<LanguageState>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
  localeHref: (path: string) => path,
})

const LANG_KEY = "destiny_mirror_lang"

/**
 * Detect if we're running on the client (browser).
 * During SSG or server rendering this is false, preventing
 * hooks like useRouter from being called in a server context.
 */
const isClient = typeof window !== "undefined"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useLocale() as Locale
  const tFn = useTranslations()
  const router = useRouter()

  const t = useCallback(
    (key: string): string => {
      try {
        return tFn(key)
      } catch {
        return key
      }
    },
    [tFn],
  )

  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (!locales.includes(newLocale)) return
      localStorage.setItem(LANG_KEY, newLocale)
      document.documentElement.lang = newLocale === "zh" ? "zh-CN" : "en"
      const currentPath = window.location.pathname
      const stripped = currentPath.replace(/^\/(en|zh)(\/|$)/, "/")
      router.replace(stripped, { locale: newLocale })
    },
    [router],
  )

  /** Prefix a bare path with the current locale, e.g. "/pricing" → "/en/pricing" */
  const localeHref = useCallback(
    (path: string) => {
      // Already prefixed → return as-is
      if (locales.some((l) => path.startsWith(`/${l}/`) || path === `/${l}`)) {
        return path
      }
      return `/${locale}${path.startsWith("/") ? path : `/${path}`}`
    },
    [locale],
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, localeHref }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
