"use client"
import { X, Shield } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface ServiceTermsProps {
  open: boolean
  onClose: () => void
}

export function ServiceTerms({ open, onClose }: ServiceTermsProps) {
  const { t } = useLanguage()
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 anim-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[80vh] card-glass rounded-2xl overflow-hidden anim-scale-in"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-gold" />
            <h2 className="font-serif text-lg text-gold">{t("serviceTerms.title")}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4 text-white/60 text-sm leading-relaxed">
          <div>
            <h3 className="text-white/80 font-medium mb-2">{t("serviceTerms.s1.title")}</h3>
            <p>{t("serviceTerms.s1.desc")}</p>
          </div>
          <div>
            <h3 className="text-white/80 font-medium mb-2">{t("serviceTerms.s2.title")}</h3>
            <p>{t("serviceTerms.s2.desc")}</p>
          </div>
          <div>
            <h3 className="text-white/80 font-medium mb-2">{t("serviceTerms.s3.title")}</h3>
            <p>{t("serviceTerms.s3.desc")}</p>
          </div>
          <div>
            <h3 className="text-white/80 font-medium mb-2">{t("serviceTerms.s4.title")}</h3>
            <p>{t("serviceTerms.s4.desc")}</p>
          </div>
          <div>
            <h3 className="text-white/80 font-medium mb-2">{t("serviceTerms.s5.title")}</h3>
            <p>{t("serviceTerms.s5.desc")}</p>
          </div>
          <div className="pt-2 border-t border-white/10">
            <p className="text-white/40 text-xs">{t("serviceTerms.footer.note")}</p>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gold/10 border border-gold/20 rounded-xl text-gold text-sm
                     hover:bg-gold/20 transition-colors"
          >
            {t("serviceTerms.readAndUnderstand")}
          </button>
        </div>
      </div>
    </div>
  )
}
