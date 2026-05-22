/**
 * i18n barrel — re-exports from modular files.
 * zh.json / en.json are loaded server-side by next-intl (zero client bundle).
 * The legacy `getTranslation()` / `t()` helpers remain for any stray imports.
 */
import zh from "./zh.json"
import en from "./en.json"

// Re-export the canonical Locale type from config
export type { Locale } from "./config"

type TranslationMap = Record<string, string>

const locales: Record<string, TranslationMap> = {
  zh: zh as unknown as TranslationMap,
  en: en as unknown as TranslationMap,
}

export function getTranslation(locale: string): TranslationMap {
  return locales[locale] || locales.zh
}

export function t(locale: string, key: string): string {
  return locales[locale]?.[key] || locales.zh[key] || key
}
