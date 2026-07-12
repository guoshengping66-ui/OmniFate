"use client"
export const dynamic = "force-dynamic"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

const SECTION_KEYS = [
  "legal.terms.s1", "legal.terms.s2", "legal.terms.s3", "legal.terms.s4",
  "legal.terms.s5", "legal.terms.s6", "legal.terms.s7", "legal.terms.s8",
  "legal.terms.s9",
]

export default function TermsPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <BookOpen className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold mb-2">{t("legal.terms.title")}</h1>
          <p className="text-white/40 text-sm">{t("legal.lastUpdated")}</p>
        </div>

        <div className="card-glass p-6 md:p-10 space-y-8">
          <p className="text-white/60 text-sm leading-relaxed">
            {t("legal.terms.intro")}
          </p>

          {SECTION_KEYS.map((key, i) => (
            <div key={i}>
              <h2 className="text-gold font-medium text-lg mb-3">{t(`${key}.title`)}</h2>
              <div className="text-white/55 text-sm leading-relaxed whitespace-pre-line">
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
