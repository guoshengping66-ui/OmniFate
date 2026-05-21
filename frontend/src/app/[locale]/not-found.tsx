"use client"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function NotFound() {
  const { t, localeHref } = useLanguage()
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">🌌</p>
        <h1 className="text-2xl font-serif font-bold text-gold mb-2">{t("common.error")}</h1>
        <p className="text-white/40 text-sm mb-6">{t("common.back")}</p>
        <Link href={localeHref("/")} className="btn-gold inline-block px-8 py-3">
          {t("nav.home")}
        </Link>
      </div>
    </div>
  )
}
