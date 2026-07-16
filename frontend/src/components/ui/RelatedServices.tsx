"use client"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useLanguage } from "@/contexts/LanguageContext"

interface ServiceLink {
  icon: string
  title: string
  href: string
  desc: string
}

interface RelatedServicesProps {
  heading: string
  services: ServiceLink[]
}

/**
 * Internal cross-linking component for SEO pages.
 * Links to related services to improve site crawlability and link equity.
 */
export function RelatedServices({ heading, services }: RelatedServicesProps) {
  const { localeHref } = useLanguage()

  return (
    <ScrollReveal delay={0.4}>
      <div className="mb-16">
        <h2 className="font-serif text-xl text-white/60 mb-4 text-center">{heading}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {services.map((s) => (
            <Link
              key={s.href}
              href={localeHref(s.href)}
              className="card-glow p-4 text-center hover:border-gold/30 transition-all duration-300 group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
              <h3 className="text-white/70 text-xs font-medium mb-1 group-hover:text-gold transition-colors">{s.title}</h3>
              <p className="text-white/30 text-[10px] leading-relaxed">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </ScrollReveal>
  )
}
