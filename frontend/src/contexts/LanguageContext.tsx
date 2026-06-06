"use client"
import { createContext, useContext, useCallback, useEffect, useMemo, useRef, type ReactNode } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { type Locale, locales } from "@/i18n/config"

interface LanguageState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  /** Prefix a bare path with the current locale, e.g. "/pricing" → "/en/pricing" */
  localeHref: (path: string) => string
  /** Preload a locale page for instant switching */
  preloadLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageState>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
  localeHref: (path: string) => path,
  preloadLocale: () => {},
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

  // Suppress next-intl INVALID_MESSAGE console errors.
  // This happens when useTranslations() is called with keys that don't exist
  // in the messages object (e.g. during not-found page rendering).
  useEffect(() => {
    const original = console.error
    console.error = (...args: any[]) => {
      if (typeof args[0] === "string" && args[0].includes("INVALID_MESSAGE")) return
      original.apply(console, args)
    }
    return () => { console.error = original }
  }, [])

  let tFn: ReturnType<typeof useTranslations>
  try {
    tFn = useTranslations()
  } catch {
    // If useTranslations() fails (e.g. messages not loaded yet),
    // provide a fallback that returns the key
    tFn = ((key: string) => key) as ReturnType<typeof useTranslations>
  }
  const router = useRouter()

  // Wrap tFn in a ref so the `t` function identity is stable across renders.
  const tFnRef = useRef(tFn)
  tFnRef.current = tFn
  const t = useCallback(
    (key: string): string => {
      try {
        return tFnRef.current(key)
      } catch {
        return key
      }
    },
    [],
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

  // Preload the other locale for instant switching
  const preloadLocale = useCallback(
    (targetLocale: Locale) => {
      if (targetLocale === locale) return
      const currentPath = window.location.pathname
      const stripped = currentPath.replace(/^\/(en|zh)(\/|$)/, "/")
      const targetPath = `/${targetLocale}${stripped.startsWith("/") ? stripped : `/${stripped}`}`
      // Prefetch the target page
      router.prefetch(targetPath)
    },
    [locale, router],
  )

  // Memoize context value — prevents unnecessary re-renders of ALL consumers
  const value = useMemo(
    () => ({ locale, setLocale, t, localeHref, preloadLocale }),
    [locale, setLocale, t, localeHref, preloadLocale],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
