"use client"
import { ScrollReveal } from "./ScrollReveal"

interface SectionHeaderProps {
  badge?: string
  title: string
  subtitle?: string
  cta?: { label: string; href: string }
  align?: "center" | "left"
  className?: string
}

export function SectionHeader({ badge, title, subtitle, cta, align = "center", className = "" }: SectionHeaderProps) {
  return (
    <ScrollReveal>
      <div className={`${align === "center" ? "text-center" : ""} mb-10 md:mb-12 ${className}`}>
        {badge && (
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gold/40 font-medium mb-3">
            <span className="w-6 h-px bg-white/[0.08]" />
            {badge}
            <span className="w-6 h-px bg-white/[0.08]" />
          </span>
        )}
        <h2 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-white/90 mb-3 leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-white/35 text-sm max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        {cta && (
          <div className="mt-5">
            <a href={cta.href} className="inline-flex items-center gap-2 text-gold/60 text-sm hover:text-gold/80 transition-colors group">
              {cta.label}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        )}
      </div>
    </ScrollReveal>
  )
}
