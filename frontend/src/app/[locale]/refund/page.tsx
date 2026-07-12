"use client"
export const dynamic = "force-dynamic"
import { RotateCcw } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

const SECTION_KEYS = [
  "legal.refund.s1", "legal.refund.s2", "legal.refund.s3",
  "legal.refund.s4", "legal.refund.s5", "legal.refund.s6",
]

export default function RefundPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <RotateCcw className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold mb-2">{t("legal.refund.title")}</h1>
          <p className="text-white/40 text-sm">{t("legal.lastUpdated")}</p>
        </div>

        <div className="card-glass p-6 md:p-10 space-y-8">
          <p className="text-white/60 text-sm leading-relaxed">
            {t("legal.refund.intro")}
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
