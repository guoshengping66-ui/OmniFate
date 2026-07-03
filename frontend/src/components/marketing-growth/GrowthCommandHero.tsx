"use client"

import Link from "next/link"
import { Activity, ArrowRight, Brain, CheckCircle2, GitBranch, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy, getHeroCopy, type HeroVariant, type Locale } from "./growthContent"

function normalizeLocale(locale: string): Locale {
  return locale === "zh" ? "zh" : "en"
}

export function GrowthCommandHero({ variant }: { variant: HeroVariant }) {
  const { locale, localeHref } = useLanguage()
  const activeLocale = normalizeLocale(locale)
  const copy = getGrowthCopy(activeLocale)
  const hero = getHeroCopy(activeLocale, variant)

  return (
    <section className="relative min-h-[92vh] overflow-hidden px-4 pb-14 pt-24 sm:pt-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(199,164,93,0.16),transparent_34%),linear-gradient(180deg,rgba(8,10,14,0.3),#080808_82%)]" />
        <div className="absolute left-1/2 top-16 h-[520px] w-[880px] -translate-x-1/2 rounded-full border border-white/[0.04]" />
        <div className="absolute left-1/2 top-28 h-[360px] w-[620px] -translate-x-1/2 rounded-full border border-gold/[0.08]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 border border-gold/20 bg-gold/[0.07] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-gold/75">
            <Sparkles size={14} />
            {hero.eyebrow}
          </div>

          <h1 className="font-serif text-4xl font-bold leading-[1.02] tracking-normal text-white sm:text-5xl lg:text-7xl">
            {hero.title}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-parchment-300">{hero.subtitle}</p>

          <div className="mt-7">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-gold/60">
              {hero.methodLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {copy.methodStrip.map((item) => (
                <span key={item} className="border border-white/[0.06] bg-white/[0.035] px-3 py-2 text-xs text-parchment-300">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={localeHref("/reading/new")} className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-3 text-sm">
              {hero.primaryCta}
              <ArrowRight size={16} />
            </Link>
            <a href="#sample-growth-report" className="btn-secondary inline-flex items-center justify-center gap-2 px-7 py-3 text-sm">
              {hero.secondaryCta}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="border border-white/[0.06] bg-[#0A1118]/92 p-4 shadow-[0_40px_140px_rgba(0,0,0,0.48)] sm:p-5">
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="border border-gold/15 bg-gold/[0.045] p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/65">
                      {copy.commandCenter.title}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{copy.commandCenter.todayPattern}</h2>
                  </div>
                  <Activity className="text-gold" size={22} />
                </div>

                <div className="relative mx-auto my-7 aspect-square max-w-[330px]">
                  <div className="absolute inset-[15%] rounded-full border border-white/[0.06]" />
                  <div className="absolute inset-[27%] rounded-full border border-gold/[0.10]" />
                  <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center border border-gold/25 bg-black/25 text-center">
                    <Brain size={20} className="mb-1 text-gold" />
                    <span className="text-xs uppercase tracking-[0.16em] text-parchment-400">5D Sync</span>
                  </div>
                  {copy.dimensions.map((dimension, index) => {
                    const positions = [
                      "left-1/2 top-0 -translate-x-1/2",
                      "right-0 top-[28%]",
                      "right-[10%] bottom-[4%]",
                      "left-[10%] bottom-[4%]",
                      "left-0 top-[28%]",
                    ]
                    return (
                      <div
                        key={dimension.key}
                        className={`absolute ${positions[index]} w-28 border border-white/[0.06] bg-black/35 p-2 backdrop-blur`}
                      >
                        <div className="mb-1 h-1.5 w-8" style={{ backgroundColor: dimension.color }} />
                        <p className="text-xs font-semibold text-parchment-200">{dimension.name}</p>
                        <p className="mt-1 text-xs leading-snug text-parchment-400">{dimension.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="border border-white/[0.06] bg-white/[0.035] p-5">
                  <div className="mb-4 flex items-center gap-2 text-gold/75">
                    <GitBranch size={18} />
                    <p className="text-xs font-semibold uppercase tracking-[0.16em]">Output Preview</p>
                  </div>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-xs uppercase tracking-[0.16em] text-parchment-400">Blind spot</dt>
                      <dd className="mt-1 text-sm leading-6 text-parchment-200">{copy.commandCenter.blindSpot}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.16em] text-parchment-400">Opportunity</dt>
                      <dd className="mt-1 text-sm leading-6 text-parchment-200">{copy.commandCenter.opportunity}</dd>
                    </div>
                  </dl>
                </div>

                <div className="border border-gold/18 bg-gold/[0.055] p-5">
                  <div className="mb-3 flex items-center gap-2 text-gold">
                    <CheckCircle2 size={18} />
                    <p className="text-sm font-semibold">Today Action</p>
                  </div>
                  <p className="text-sm leading-7 text-parchment-200">{copy.commandCenter.action}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
