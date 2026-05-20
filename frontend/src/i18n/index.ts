export type Locale = "zh" | "en"

type TranslationMap = Record<string, string>

// ── Dynamic imports: only load the active language ──────────────
// This splits the 261KB i18n chunk into two ~130KB chunks,
// and only loads the one the user needs.
const translationModules: Record<Locale, () => Promise<{ default: TranslationMap }>> = {
  zh: () => import("./zh"),
  en: () => import("./en"),
}

// Cache loaded translations
const loadedTranslations: Partial<Record<Locale, TranslationMap>> = {}

export async function loadTranslation(locale: Locale): Promise<TranslationMap> {
  if (loadedTranslations[locale]) return loadedTranslations[locale]!
  const mod = await translationModules[locale]()
  loadedTranslations[locale] = mod.default
  return mod.default
}

// Synchronous accessor — returns cached translation or empty map.
// LanguageContext calls loadTranslation() on mount, then provides t().
export function getTranslation(locale: Locale): TranslationMap {
  return loadedTranslations[locale] || {}
}

export function t(locale: Locale, key: string): string {
  return loadedTranslations[locale]?.[key] || key
}
