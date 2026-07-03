"use client"
import { Shield } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

const SECTION_KEYS = [
  "legal.privacy.s1", "legal.privacy.s2", "legal.privacy.s3", "legal.privacy.s4",
  "legal.privacy.s5", "legal.privacy.s6", "legal.privacy.s7", "legal.privacy.s8",
  "legal.privacy.s9", "legal.privacy.s10", "legal.privacy.s11",
]

export default function PrivacyPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Shield className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold mb-2">{t("legal.privacy.title")}</h1>
          <p className="text-parchment-400 text-sm">{t("legal.lastUpdated")}</p>
        </div>

        <div className="card-solid p-6 md:p-10 space-y-8">
          <p className="text-parchment-400 text-sm leading-relaxed">
            {t("legal.privacy.intro")}
          </p>

          {SECTION_KEYS.map((key, i) => (
            <div key={i}>
              <h2 className="text-gold font-medium text-lg mb-3">{t(`${key}.title`)}</h2>
              <div className="text-parchment-300 text-sm leading-relaxed whitespace-pre-line">
                {t(`${key}.content`)}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-gold/60 hover:text-gold text-sm transition-colors">
            {t("legal.backHome")}
          </Link>
        </div>
      </div>
    </div>
  )
}
