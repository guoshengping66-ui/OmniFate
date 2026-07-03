"use client"

import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy, type Locale } from "./growthContent"

function normalizeLocale(locale: string): Locale {
  return locale === "zh" ? "zh" : "en"
}

export function SignalToActionWorkflow() {
  const { locale } = useLanguage()
  const activeLocale = normalizeLocale(locale)
  const copy = getGrowthCopy(activeLocale)

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold/60">Signal To Action</p>
          <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-5xl">
            {activeLocale === "zh" ? "从合参信号到行动处方" : "From synthesis signals to an action prescription"}
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {copy.workflow.map((step, index) => (
            <div key={step.title} className="relative border border-white/[0.06] bg-white/[0.025] p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/65">0{index + 1}</span>
                {index < copy.workflow.length - 1 && <ArrowRight className="hidden text-parchment-400 lg:block" size={18} />}
              </div>
              <h3 className="text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-parchment-300">{step.body}</p>
              <div className="mt-6 border border-gold/15 bg-gold/[0.045] p-4">
                <p className="text-xs leading-6 text-gold/85">{step.output}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
