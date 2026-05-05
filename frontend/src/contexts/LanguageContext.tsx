"use client"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { type Locale, type TranslationKey, getTranslation, t as translate } from "@/i18n"

interface LanguageState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageState>({
  locale: "zh",
  setLocale: () => {},
  t: (key: TranslationKey) => key,
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
  const [translations, setTranslations] = useState(() => getTranslation("zh"))

  // Initialize on mount (client-side only)
  useEffect(() => {
    const initial = getInitialLocale()
    setLocaleState(initial)
    setTranslations(getTranslation(initial))
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    setTranslations(getTranslation(newLocale))
    localStorage.setItem(LANG_KEY, newLocale)
    document.documentElement.lang = newLocale === "zh" ? "zh-CN" : "en"
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    return translations[key] || key
  }, [translations])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
