"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { useLanguage } from "@/contexts/LanguageContext"
import { safeJsonLd } from "@/utils/safeJsonLd"
const tools = [
  { icon: "☯", title: "Bazi Calculator", desc: "AI-powered Four Pillars chart generation with Five Elements analysis", href: "/bazi", color: "from-amber-500/10" },
  { icon: "✦", title: "Birth Chart", desc: "Natal chart analysis with planetary placements and aspect interpretation", href: "/astrology", color: "from-blue-500/10" },
  { icon: "⭐", title: "Ziwei Doushu", desc: "Purple Star Astrology chart with 12 life palaces mapping", href: "/ziwei", color: "from-purple-500/10" },
  { icon: "🃏", title: "Tarot Reading", desc: "AI tarot card interpretation with multiple spread options", href: "/tarot", color: "from-violet-500/10" },
  { icon: "👁️", title: "Face Reading", desc: "AI face analysis — features, shape, and behavioral patterns", href: "/face-reading", color: "from-cyan-500/10" },
  { icon: "✋", title: "Palm Reading", desc: "AI palm line analysis — life, head, heart, and fate lines", href: "/palm-reading", color: "from-amber-500/10" },
  { icon: "☯️", title: "Five Elements", desc: "Discover your elemental balance and generating/overcoming cycles", href: "/five-elements", color: "from-green-500/10" },
  { icon: "💕", title: "Zodiac Compatibility", desc: "AI-powered star sign matching for love, friendship, and work", href: "/astrology/zodiac-compatibility", color: "from-pink-500/10" },
]

export default function ToolsPage() {
  const { t, localeHref, locale } = useLanguage()

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ label: t("nav.tools") || "Tools" }]} currentPath={`/${locale}/tools`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Destiny Analysis Tools",
            "description": "Free AI-powered destiny analysis tools including Bazi, Astrology, Tarot, Face Reading, Palm Reading, and more.",
            "url": "https://www.khanfate.com/tools",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
              {t("nav.tools") || "Tools"}
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {t("tools.title") || "Destiny Analysis Tools"}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t("tools.desc") || "AI-powered analysis tools to decode your destiny patterns"}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <ScrollReveal key={tool.href} delay={0.1}>
              <Link
                href={localeHref(tool.href)}
                className="card-glow p-6 hover:border-gold/30 transition-all duration-300 group block"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} via-transparent to-transparent pointer-events-none rounded-xl`} />
                <div className="relative flex items-start gap-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">{tool.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-gold mb-2 group-hover:text-gold-light transition-colors">{tool.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{tool.desc}</p>
                    <div className="flex items-center gap-1 text-gold/60 text-xs mt-3 group-hover:text-gold transition-colors">
                      Try now <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}
