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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold/60">Product Paths</p>
            <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-5xl">
              {activeLocale === "zh" ? "从一次报告，到每天使用，再到生活方式处方" : "From one report to daily use and lifestyle prescriptions"}
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-parchment-300 lg:ml-auto">
            {activeLocale === "zh"
              ? "首页不再罗列一堆工具，而是把用户带进清晰闭环：先建立画像，再执行今天，再把洞察转成现实选择。"
              : "The homepage should not list disconnected tools. It should move users through a clear loop: build a profile, act today, then turn insight into real choices."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {copy.services.map((service) => (
            <Link
              key={service.title}
              href={localeHref(service.href)}
              className="group border border-white/[0.06] bg-white/[0.025] p-6 transition-colors hover:border-gold/35 hover:bg-gold/[0.045]"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-gold/60">Path</span>
                <ArrowUpRight className="text-parchment-400 transition-colors group-hover:text-gold" size={18} />
              </div>
              <h3 className="text-xl font-semibold text-white">{service.title}</h3>
              <p className="mt-3 text-sm leading-7 text-parchment-300">{service.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
