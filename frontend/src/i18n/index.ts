import zh from "./zh"
import en from "./en"

export type Locale = "zh" | "en"

type TranslationMap = Record<string, string>

export const locales: Record<Locale, TranslationMap> = {
  zh: zh as unknown as TranslationMap,
  en: en as unknown as TranslationMap,
}

export type TranslationKey = keyof typeof zh

export function getTranslation(locale: Locale): TranslationMap {
  return locales[locale] || locales.zh
}

export function t(locale: Locale, key: string): string {
  return locales[locale]?.[key] || locales.zh[key] || key
}
