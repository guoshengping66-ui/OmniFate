"use client"
import { createContext, useContext, useCallback, useMemo, useRef, type ReactNode } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { type Locale, locales } from "@/i18n/config"

type TranslationValues = Record<string, unknown>

interface TranslationFunction {
  (key: string): string
  (key: string, values: TranslationValues & { returnObjects: true }): unknown
  (key: string, values: TranslationValues): string
}

type TranslatorWithRaw = ((key: string, values?: TranslationValues) => string) & {
  raw?: (key: string) => unknown
}

interface LanguageState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslationFunction
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

const LANG_KEY = "profile_mirror_lang"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useLocale() as Locale

  const tFn = useTranslations()
  const router = useRouter()

  // Wrap tFn in a ref so the `t` function identity is stable across renders.
  const tFnRef = useRef(tFn)
  tFnRef.current = tFn
  const t = useCallback(
    (key: string, values?: TranslationValues): string | unknown => {
      try {
        // next-intl v4: use t.raw() for returnObjects to avoid @formatjs INVALID_MESSAGE
        if (values?.returnObjects === true) {
          const translator = tFnRef.current as unknown as TranslatorWithRaw
          return translator.raw ? translator.raw(key) : translator(key, values)
        }
        const translator = tFnRef.current as unknown as TranslatorWithRaw
        return values ? translator(key, values) : translator(key)
      } catch {
        return key
      }
    },
    [],
  ) as TranslationFunction

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
