"use client"

import Link from "next/link"
import { TrendingUp, TrendingDown } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ResultPreview() {
  const { t, locale, localeHref } = useLanguage()

  const DEMO_RESULT = {
    code: "DXIP",
    title: t("am16.DXIP.title"),
    fateLevel: { emoji: "⚔️", name: locale === "zh" ? "逆命" : "Rebel", beatPercent: 88 },
    destinyPower: { total: 7820, strongest: { label: locale === "zh" ? "事业" : "Career", rank: "S+" }, weakest: { label: locale === "zh" ? "感情" : "Romance", rank: "B-" } },
  }

  return (
    <section className="py-20 px-4 bg-white/[0.015]">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              {t("homepage.resultPreview.title")}
            </h2>
            <p className="text-white/40 text-sm">{t("homepage.resultPreview.subtitle")}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <Link href={localeHref("/am16")} className="block group">
            <div className="card-glass-elevated p-6 md:p-8 relative overflow-hidden hover:border-gold/20 transition-all duration-300">
              <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gold/5 blur-[80px] pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="text-center md:text-left flex-1">
                  <div className="text-5xl md:text-6xl font-bold text-gold mb-2 font-serif tracking-wider">
                    {DEMO_RESULT.code}
                  </div>
                  <div className="text-white/70 text-lg mb-4">{DEMO_RESULT.title}</div>

                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className="inline-flex items-center gap-2 bg-white/[0.05] rounded-full px-4 py-2">
                      <span className="text-gold">{DEMO_RESULT.fateLevel.emoji}</span>
                      <span className="text-white/60 text-sm">{t("homepage.resultPreview.fateLevel")}</span>
                      <span className="text-gold font-medium">{DEMO_RESULT.fateLevel.name}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/[0.05] rounded-full px-4 py-2">
                      <span className="text-gold">⚡</span>
                      <span className="text-white/60 text-sm">{t("homepage.resultPreview.destinyPower")}</span>
                      <span className="text-gold font-medium">{DEMO_RESULT.destinyPower.total}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-emerald-400 mb-1">
                      <TrendingUp size={14} />
                      <span className="text-xs">{t("homepage.resultPreview.strongest")}</span>
                    </div>
                    <div className="text-white/80 font-medium">{DEMO_RESULT.destinyPower.strongest.label}</div>
                    <div className="text-gold text-sm font-bold">{DEMO_RESULT.destinyPower.strongest.rank}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-rose-400 mb-1">
                      <TrendingDown size={14} />
                      <span className="text-xs">{t("homepage.resultPreview.weakest")}</span>
                    </div>
                    <div className="text-white/80 font-medium">{DEMO_RESULT.destinyPower.weakest.label}</div>
                    <div className="text-white/50 text-sm font-bold">{DEMO_RESULT.destinyPower.weakest.rank}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
                <span className="text-gold/60 text-sm group-hover:text-gold transition-colors">
                  {t("homepage.resultPreview.clickToTest")} →
                </span>
              </div>
            </div>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}
