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
      <div className={`${align === "center" ? "text-center" : ""} mb-12 md:mb-16 ${className}`}>
        {badge && (
          <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-4">
            <span className="w-8 h-px bg-gradient-to-r from-transparent to-gold/30" />
            {badge}
            <span className="w-8 h-px bg-gradient-to-l from-transparent to-gold/30" />
          </span>
        )}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-4 leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        {cta && (
          <div className="mt-6">
            <a href={cta.href} className="inline-flex items-center gap-2 text-gold/60 text-sm hover:text-gold transition-colors group">
              {cta.label}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        )}
      </div>
    </ScrollReveal>
  )
}
