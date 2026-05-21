"use client"
import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function DisclaimerPage() {
  const { t } = useLanguage()

  useEffect(() => {
    document.title = t("disclaimer.title") + " - Destiny Mirror"
  }, [t])

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <AlertTriangle className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold mb-2">{t("disclaimer.title")}</h1>
          <p className="text-white/40 text-sm">{t("disclaimer.updated")}</p>
        </div>

        {/* Important notice banner */}
        <div className="mb-8 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <p className="text-amber-200/80 text-sm leading-relaxed text-center font-medium">
            {t("disclaimer.importantNotice")}
          </p>
        </div>

        {/* Content */}
        <div className="card-glass p-6 md:p-10 space-y-8">
          <p className="text-white/60 text-sm leading-relaxed">
            {t("disclaimer.intro")}
          </p>

          <div>
            <h2 className="text-gold font-medium text-lg mb-3">{t("disclaimer.s1Title")}</h2>
            <div className="text-white/55 text-sm leading-relaxed whitespace-pre-line">{t("disclaimer.s1Content")}</div>
          </div>

          <div>
            <h2 className="text-gold font-medium text-lg mb-3">{t("disclaimer.s2Title")}</h2>
            <div className="text-white/55 text-sm leading-relaxed whitespace-pre-line">{t("disclaimer.s2Content")}</div>
          </div>

          <div>
            <h2 className="text-gold font-medium text-lg mb-3">{t("disclaimer.s3Title")}</h2>
            <div className="text-white/55 text-sm leading-relaxed whitespace-pre-line">{t("disclaimer.s3Content")}</div>
          </div>

          <div>
            <h2 className="text-gold font-medium text-lg mb-3">{t("disclaimer.s4Title")}</h2>
            <div className="text-white/55 text-sm leading-relaxed whitespace-pre-line">{t("disclaimer.s4Content")}</div>
          </div>

          <div>
            <h2 className="text-gold font-medium text-lg mb-3">{t("disclaimer.s5Title")}</h2>
            <div className="text-white/55 text-sm leading-relaxed whitespace-pre-line">{t("disclaimer.s5Content")}</div>
          </div>

          <div>
            <h2 className="text-gold font-medium text-lg mb-3">{t("disclaimer.s6Title")}</h2>
            <div className="text-white/55 text-sm leading-relaxed whitespace-pre-line">{t("disclaimer.s6Content")}</div>
          </div>

          <div>
            <h2 className="text-gold font-medium text-lg mb-3">{t("disclaimer.s7Title")}</h2>
            <div className="text-white/55 text-sm leading-relaxed whitespace-pre-line">{t("disclaimer.s7Content")}</div>
          </div>

          <div>
            <h2 className="text-gold font-medium text-lg mb-3">{t("disclaimer.s8Title")}</h2>
            <div className="text-white/55 text-sm leading-relaxed whitespace-pre-line">{t("disclaimer.s8Content")}</div>
          </div>

          {/* Operator info */}
          <div className="border-t border-white/10 pt-6">
            <h2 className="text-gold font-medium text-lg mb-3">{t("disclaimer.operatorTitle")}</h2>
            <div className="text-white/55 text-sm leading-relaxed space-y-1">
              <p>{t("disclaimer.operatorName")}</p>
              <p>{t("disclaimer.operatorEmail")}</p>
              <p>{t("disclaimer.operatorUrl")}</p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-gold/60 hover:text-gold text-sm transition-colors">
            {t("disclaimer.backHome")}
          </Link>
        </div>
      </div>
    </div>
  )
}
