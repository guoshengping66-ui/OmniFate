"use client"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Locale } from "@/i18n/config"

const LANGUAGES: { locale: Locale; label: string; flag: string }[] = [
  { locale: "zh", label: "中文", flag: "🇨🇳" },
  { locale: "en", label: "EN", flag: "🇺🇸" },
]

export function LanguageSwitch() {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.locale}
          onClick={() => setLocale(lang.locale)}
          className={`relative px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
            locale === lang.locale
              ? "text-gold"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          {locale === lang.locale && (
            <motion.div
              layoutId="lang-indicator"
              className="absolute inset-0 bg-gold/10 border border-gold/30 rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1">
            <span className="text-[10px]">{lang.flag}</span>
            {lang.label}
          </span>
        </button>
      ))}
    </div>
  )
}
