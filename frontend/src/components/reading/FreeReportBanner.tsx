"use client"
import { Sparkles, ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface FreeReportBannerProps {
  weakestLabel: string
  onCtaClick?: () => void
}

export function FreeReportBanner({ weakestLabel, onCtaClick }: FreeReportBannerProps) {
  const { t } = useLanguage()
  return (
    <div className="card-glass p-5 md:p-6 border-l-2 border-l-gold/30 hover:border-l-gold/50 transition-all duration-500 group">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Sparkles size={20} className="text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-sm md:text-base leading-relaxed mb-1">
            {t("freeBanner.weakEnergy")} <span className="text-gold font-semibold">{weakestLabel}</span>
          </p>
          <p className="text-white/30 text-xs leading-relaxed">
            {t("freeBanner.subtitle")}
          </p>
        </div>
        <button
          onClick={onCtaClick}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border border-gold/40 text-gold/80 text-sm hover:bg-gold/10 hover:text-gold hover:border-gold/60 transition-all duration-300 group/btn"
        >
          <span className="hidden sm:inline">{t("freeBanner.cta")}</span>
          <span className="sm:hidden">{t("freeBanner.ctaShort")}</span>
          <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
      <p className="text-[10px] text-white/15 mt-3 ml-14">
        {t("freeBanner.hint")}
      </p>
    </div>
  )
}
