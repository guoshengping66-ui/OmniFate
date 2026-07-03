"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getGrowthCopy, type DimensionKey, type Locale } from "./growthContent"

function normalizeLocale(locale: string): Locale {
  return locale === "zh" ? "zh" : "en"
}

export function FiveDimensionCommandCenter() {
  const { locale } = useLanguage()
  const copy = getGrowthCopy(normalizeLocale(locale))
  const [active, setActive] = useState<DimensionKey>("career")
  const activeDimension = copy.dimensions.find((dimension) => dimension.key === active) ?? copy.dimensions[0]

  return (
    <section className="relative px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/60">Fate OS Signal Board</p>
            <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-5xl">{copy.commandCenter.title}</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/55 lg:ml-auto">{copy.commandCenter.description}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border border-white/[0.08] bg-white/[0.025] p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.dimensions.map((dimension) => (
                <button
                  key={dimension.key}
                  type="button"
                  onClick={() => setActive(dimension.key)}
                  className="group border p-4 text-left transition-colors"
                  style={{
                    borderColor: active === dimension.key ? `${dimension.color}80` : "rgba(255,255,255,0.08)",
                    background: active === dimension.key ? `${dimension.color}12` : "rgba(255,255,255,0.02)",
                  }}
                >
                  <div className="mb-3 h-1 w-10" style={{ backgroundColor: dimension.color }} />
                  <h3 className="text-base font-semibold text-white">{dimension.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/36">{dimension.label}</p>
                  <p className="mt-3 text-sm leading-6 text-white/56">{dimension.signal}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-gold/15 bg-[#0B1118] p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/60">Active Signal</p>
            <h3 className="mt-3 text-3xl font-semibold text-white" style={{ color: activeDimension.color }}>
              {activeDimension.name}
            </h3>
            <div className="mt-8 grid gap-4">
              <div className="border border-white/[0.08] bg-black/20 p-5">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">Contribution</p>
                <p className="mt-2 text-base leading-7 text-white/75">{activeDimension.contribution}</p>
              </div>
              <div className="border border-white/[0.08] bg-black/20 p-5">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">Action Translation</p>
                <p className="mt-2 text-base leading-7 text-white/75">{activeDimension.action}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
