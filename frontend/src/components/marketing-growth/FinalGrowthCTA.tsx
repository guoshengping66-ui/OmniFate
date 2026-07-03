"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy, type Locale } from "./growthContent"

function normalizeLocale(locale: string): Locale {
  return locale === "zh" ? "zh" : "en"
}

export function FinalGrowthCTA() {
  const { locale, localeHref } = useLanguage()
  const copy = getGrowthCopy(normalizeLocale(locale))

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl border border-gold/18 bg-[linear-gradient(135deg,rgba(199,164,93,0.12),rgba(255,255,255,0.025))] p-8 text-center sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold/65">Start</p>
        <h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl font-bold text-white sm:text-5xl">{copy.finalCta.title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-parchment-300">{copy.finalCta.body}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={localeHref("/reading/new")} className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 text-sm">
            {copy.finalCta.primary}
            <ArrowRight size={16} />
          </Link>
          <a href="#sample-growth-report" className="btn-secondary inline-flex items-center justify-center px-8 py-3 text-sm">
            {copy.finalCta.secondary}
          </a>
        </div>
      </div>
    </section>
  )
}
