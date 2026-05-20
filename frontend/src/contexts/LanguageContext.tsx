"use client"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { type Locale, type TranslationKey, loadTranslation, getTranslation, t as translate } from "@/i18n"

interface LanguageState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  ready: boolean
}

const LanguageContext = createContext<LanguageState>({
  locale: "zh",
  setLocale: () => {},
  t: (key: string) => key,
  ready: false,
})

const LANG_KEY = "destiny_mirror_lang"

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "zh"
  const stored = localStorage.getItem(LANG_KEY)
  if (stored === "en" || stored === "zh") return stored
  // Auto-detect from browser
  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith("en") ? "en" : "zh"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh")
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [ready, setReady] = useState(false)

  // Load translations asynchronously on mount
  useEffect(() => {
    const initial = getInitialLocale()
    setLocaleState(initial)
    loadTranslation(initial).then((t) => {
      setTranslations(t)
      setReady(true)
    })
  }, [])

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(LANG_KEY, newLocale)
    document.documentElement.lang = newLocale === "zh" ? "zh-CN" : "en"
    // Load new language translations (may already be cached)
    const t = await loadTranslation(newLocale)
    setTranslations(t)
  }, [])

  const t = useCallback((key: string): string => {
    return translations[key] || key
  }, [translations])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, ready }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
