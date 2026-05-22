/**
 * i18n barrel — re-exports from modular files.
 * zh.json / en.json are loaded server-side by next-intl (zero client bundle).
 * The legacy `getTranslation()` / `t()` helpers remain for any stray imports.
 */
// NOTE: Do NOT import zh.json/en.json here — they are loaded server-side by
// next-intl via request.ts. Importing them here would bundle ~280KB of
// translations into the client JavaScript, destroying page load performance.

// Re-export the canonical Locale type from config
export type { Locale } from "./config"

type TranslationMap = Record<string, string>

// Lazy-loaded translation caches (loaded on demand, not at import time)
const translationCache: Record<string, TranslationMap> = {}

async function loadLocale(locale: string): Promise<TranslationMap> {
  if (translationCache[locale]) return translationCache[locale]
  try {
    const mod = await import(`./${locale}.json`)
    translationCache[locale] = mod.default as unknown as TranslationMap
  } catch {
    // fallback: empty object
    translationCache[locale] = {}
  }
  return translationCache[locale]
}

export async function getTranslation(locale: string): Promise<TranslationMap> {
  return loadLocale(locale)
}

export async function t(locale: string, key: string): Promise<string> {
  const msgs = await loadLocale(locale)
  return msgs[key] || key
}
