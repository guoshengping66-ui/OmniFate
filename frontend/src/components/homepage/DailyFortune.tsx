"use client"

import Link from "next/link"
import { Calendar, ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useLanguage } from "@/contexts/LanguageContext"
import dynamic from "next/dynamic"

const DailyDashboard = dynamic(() => import("@/components/DailyDashboard").then(m => m.DailyDashboard), {
  ssr: false,
  loading: () => <div className="card-glass p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})

export default function DailyFortune() {
  const { t, localeHref } = useLanguage()

  return (
    <section className="py-24 px-4 bg-white/[0.015]">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 text-gold text-xs mb-4">
              <Calendar size={12} />
              {t("homepage.dailyFortune.badge")}
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              {t("homepage.dailyFortune.title")}
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              {t("homepage.dailyFortune.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <DailyDashboard />
        </ScrollReveal>
      </div>
    </section>
  )
}
