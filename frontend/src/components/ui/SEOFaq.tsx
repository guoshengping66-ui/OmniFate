"use client"
import { useMemo } from "react"
import { HelpCircle } from "lucide-react"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { safeJsonLd } from "@/utils/safeJsonLd"

interface FaqItem {
  question: string
  answer: string
}

interface SEOFaqProps {
  title: string
  items: FaqItem[]
}

/**
 * FAQ section with JSON-LD FAQPage structured data for SEO rich snippets.
 * Use on SEO landing pages to boost search visibility.
 */
export function SEOFaq({ title, items }: SEOFaqProps) {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  }), [items])

  if (items.length === 0) return null

  return (
    <ScrollReveal delay={0.3}>
      <div className="card-glass p-8 md:p-10 mb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle size={22} className="text-gold" />
          <h2 className="font-serif text-2xl text-gold">{title}</h2>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <AccordionItem
              key={i}
              question={item.question}
              answer={item.answer}
              defaultOpen={false}
            />
          ))}
        </div>
      </div>
    </ScrollReveal>
  )
}
