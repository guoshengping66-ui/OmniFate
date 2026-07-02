"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy, type Locale } from "./growthContent"

function normalizeLocale(locale: string): Locale {
  return locale === "zh" ? "zh" : "en"
}

export function GrowthServicePaths() {
  const { locale, localeHref } = useLanguage()
  const activeLocale = normalizeLocale(locale)
  const copy = getGrowthCopy(activeLocale)

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/60">Product Paths</p>
            <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-5xl">
              {activeLocale === "zh" ? "从一次生成，到每天使用" : "From one generation to daily use"}
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/55 lg:ml-auto">
            {activeLocale === "zh"
              ? "首页不再只展示功能，而是让用户看到自己可以从哪里开始、接下来用什么。"
              : "The homepage should not only list features. It should show where users start and what they use next."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {copy.services.map((service) => (
            <Link
              key={service.title}
              href={localeHref(service.href)}
              className="group border border-white/[0.08] bg-white/[0.025] p-6 transition-colors hover:border-gold/35 hover:bg-gold/[0.045]"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.2em] text-gold/60">Path</span>
                <ArrowUpRight className="text-white/35 transition-colors group-hover:text-gold" size={18} />
              </div>
              <h3 className="text-xl font-semibold text-white">{service.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/55">{service.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
