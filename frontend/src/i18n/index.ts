/**
 * i18n barrel — single source of truth.
 * zh.json / en.json are loaded both server-side (next-intl) and client-side (helpers).
 * The `.ts` locale files are DEPRECATED — all keys must live in the JSON files.
 */
import zh from "./zh.json"
import en from "./en.json"

// Re-export the canonical Locale type from config
export type { Locale } from "./config"

type TranslationMap = Record<string, string>

/** Flatten nested JSON into dot-notation keys for the legacy helper. */
function flatten(obj: Record<string, any>, prefix = ""): TranslationMap {
  const result: TranslationMap = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === "object" && value !== null) {
      Object.assign(result, flatten(value, fullKey))
    } else {
      result[fullKey] = String(value)
    }
  }
  return result
}

const locales: Record<string, TranslationMap> = {
  zh: flatten(zh as Record<string, any>),
  en: flatten(en as Record<string, any>),
}

export function getTranslation(locale: string): TranslationMap {
  return locales[locale] || locales.zh
}

export function t(locale: string, key: string): string {
  return locales[locale]?.[key] || locales.zh[key] || key
}
