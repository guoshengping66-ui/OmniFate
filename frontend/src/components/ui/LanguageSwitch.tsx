"use client"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Locale } from "@/i18n/config"

const LANGUAGES: { locale: Locale; label: string; flag: string }[] = [
  { locale: "zh", label: "中文", flag: "🇨🇳" },
  { locale: "en", label: "EN", flag: "🇺🇸" },
]

export function LanguageSwitch() {
  const { locale, setLocale, preloadLocale } = useLanguage()

  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.locale}
          onClick={() => setLocale(lang.locale)}
          onMouseEnter={() => preloadLocale(lang.locale)}
          className={`relative px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
            locale === lang.locale
              ? "text-gold"
              : "text-parchment-400 hover:text-parchment-400"
          }`}
        >
          {locale === lang.locale && (
            <div
              className="absolute inset-0 bg-gold/10 border border-gold/30 rounded-full"
              style={{
                animation: "langSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1">
            <span className="text-xs">{lang.flag}</span>
            {lang.label}
          </span>
        </button>
      ))}
    </div>
  )
}
