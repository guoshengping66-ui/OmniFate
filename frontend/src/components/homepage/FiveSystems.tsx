"use client"

import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useLanguage } from "@/contexts/LanguageContext"

const SYSTEMS = [
  { key: "bazi", icon: "☯", color: "#2D6A4F", href: "/reading/new" },
  { key: "astrology", icon: "✦", color: "#C1121F", href: "/reading/new" },
  { key: "tarot", icon: "🃏", color: "#C9A84C", href: "/reading/new" },
  { key: "face", icon: "👁", color: "#E8D5B7", href: "/reading/new" },
  { key: "palm", icon: "🤚", color: "#2980B9", href: "/reading/new" },
]

export default function FiveSystems() {
  const { t, localeHref } = useLanguage()

  return (
    <section className="py-24 px-4 bg-white/[0.015]">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              {t("homepage.fiveSystems.title")}
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              {t("homepage.fiveSystems.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {SYSTEMS.map((sys, i) => (
            <ScrollReveal key={sys.key} delay={i * 0.08} direction="up">
              <Link href={localeHref(sys.href)} className="block group">
                <div
                  className="card-glass p-5 text-center hover:border-white/20 transition-all duration-300"
                  style={{ borderTop: `2px solid ${sys.color}55` }}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: sys.color }} />
                    <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
                      {t(`agent.${sys.key}.tag`)}
                    </span>
                  </div>
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{sys.icon}</div>
                  <h3 className="font-serif font-bold text-sm mb-1.5" style={{ color: sys.color }}>
                    {t(`agent.${sys.key}._label`)}
                  </h3>
                  <p className="text-white/40 text-xs leading-relaxed">
                    {t(`agent.${sys.key}.desc`)}
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
