"use client"
export const dynamic = "force-dynamic"
import { lazy, Suspense } from "react"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { Sparkles, Clock, Gift, Crown } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const CelestialOracle = lazy(() => import("@/components/divination/CelestialOracle").then(m => ({ default: m.CelestialOracle })))

export default function DivinationPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <Breadcrumbs items={[{ label: t("nav.divination") }]} />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gold mb-2">{t("divination.title")}</h1>
          <p className="text-white/40 text-sm">
            {t("divination.subtitle")}
          </p>
        </div>

        <Suspense fallback={<div className="card-glass p-8 flex justify-center"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>}>
          <CelestialOracle />
        </Suspense>

        {/* Analysis Rules */}
        <div
          className="mt-8 space-y-4 animate-[fadeIn_0.3s_ease-out_0.3s_both]"
        >
          {/* Rules Card */}
          <div className="card-glass p-5">
            <h3 className="text-gold/70 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={12} />
              {t("divination.rules")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={12} className="text-gold/60" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">{t("divination.rule1Title")}</p>
                  <p className="text-white/30 text-[11px]">{t("divination.rule1Desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-gold/60" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">{t("divination.rule2Title")}</p>
                  <p className="text-white/30 text-[11px]">{t("divination.rule2Desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Gift size={12} className="text-gold/60" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">{t("divination.rule4Title")}</p>
                  <p className="text-white/30 text-[11px]">{t("divination.rule4Desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Crown size={12} className="text-gold/60" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">{t("divination.founderUnlimited")}</p>
                  <p className="text-white/30 text-[11px]">{t("divination.founderDesc")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center">
            <p className="text-white/15 text-[11px] leading-relaxed max-w-md mx-auto">
              {t("divination.disclaimer")}
              {t("divination.motto")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
