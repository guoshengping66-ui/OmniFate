"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy, type Locale } from "./growthContent"

function normalizeLocale(locale: string): Locale {
  return locale === "zh" ? "zh" : "en"
}

export function SampleGrowthReport() {
  const { locale } = useLanguage()
  const activeLocale = normalizeLocale(locale)
  const copy = getGrowthCopy(activeLocale)
  const [activeKey, setActiveKey] = useState(copy.reportTabs[0].key)
  const active = copy.reportTabs.find((tab) => tab.key === activeKey) ?? copy.reportTabs[0]

  return (
    <section id="sample-growth-report" className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl border border-white/[0.08] bg-[#0A1017] p-4 sm:p-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/60">Sample Report</p>
            <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-5xl">
              {activeLocale === "zh" ? "不是玄学长文，而是可执行的命运行动图" : "Not a long mystical essay. An executable fate action map."}
            </h2>
          </div>
          <div className="flex border border-white/[0.08] bg-black/20 p-1">
            {copy.reportTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveKey(tab.key)}
                className={`px-4 py-2 text-sm transition-colors ${
                  active.key === tab.key ? "bg-gold text-black" : "text-white/55 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border border-gold/15 bg-gold/[0.045] p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold/60">Growth Archetype</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">{active.title}</h3>
            <p className="mt-4 text-base leading-8 text-white/65">{active.body}</p>
          </div>
          <div className="grid gap-3">
            {active.bullets.map((bullet) => (
              <div key={bullet} className="flex gap-3 border border-white/[0.08] bg-white/[0.025] p-4">
                <Check className="mt-0.5 shrink-0 text-gold" size={18} />
                <p className="text-sm leading-6 text-white/70">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
