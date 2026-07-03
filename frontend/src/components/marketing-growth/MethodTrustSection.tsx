"use client"

import { ShieldCheck } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy, type Locale } from "./growthContent"

function normalizeLocale(locale: string): Locale {
  return locale === "zh" ? "zh" : "en"
}

export function MethodTrustSection() {
  const { locale } = useLanguage()
  const activeLocale = normalizeLocale(locale)
  const copy = getGrowthCopy(activeLocale)

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold/60">Method & Trust</p>
          <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-5xl">
            {activeLocale === "zh" ? "我们不和别人拼更玄，而是拼更有用" : "We do not compete on being more mystical. We compete on usefulness."}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {copy.trust.map((item) => (
            <div key={item.title} className="border border-white/[0.06] bg-white/[0.025] p-6">
              <ShieldCheck className="mb-5 text-gold" size={24} />
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-parchment-300">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
