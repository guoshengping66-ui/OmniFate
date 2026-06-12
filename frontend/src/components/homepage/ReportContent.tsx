"use client"

import Link from "next/link"
import { AlertTriangle, Lightbulb, TrendingUp, Lock } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { useLanguage } from "@/contexts/LanguageContext"

const REPORT_SECTIONS = [
  {
    key: "problems",
    icon: AlertTriangle,
    color: "#C1121F",
    items: ["事业瓶颈期", "感情迷茫", "健康隐患"],
  },
  {
    key: "advice",
    icon: Lightbulb,
    color: "#C9A84C",
    items: ["佩戴黄水晶增强财运", "每周三冥想提升直觉", "避免东南方重大决策"],
  },
  {
    key: "trends",
    icon: TrendingUp,
    color: "#2D6A4F",
    items: ["2026上半年事业上升", "下半年感情转机", "年底有贵人相助"],
  },
]

export default function ReportContent() {
  const { t, localeHref } = useLanguage()

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              {t("homepage.reportContent.title")}
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              {t("homepage.reportContent.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {REPORT_SECTIONS.map((section, i) => (
            <ScrollReveal key={section.key} delay={i * 0.1} direction="up">
              <div className="card-glass p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${section.color}15` }}
                  >
                    <section.icon size={18} style={{ color: section.color }} />
                  </div>
                  <h3 className="font-serif font-bold text-white">
                    {t(`homepage.reportContent.${section.key}`)}
                  </h3>
                </div>

                <div className="space-y-3">
                  {section.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="text-gold mt-0.5">•</span>
                      <span className="text-white/60 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-8 text-center">
            <Link
              href={localeHref("/reading/new")}
              className="inline-flex items-center gap-2 text-gold/60 hover:text-gold text-sm transition-colors"
            >
              {t("homepage.reportContent.viewFull")}
              <span>→</span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
