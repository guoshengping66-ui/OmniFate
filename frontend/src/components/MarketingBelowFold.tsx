"use client"
import Link from "next/link"
import { Star, ArrowRight, ScrollText } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { TiltCard } from "@/components/ui/TiltCard"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { useLanguage } from "@/contexts/LanguageContext"
import { AccordionItem } from "@/components/ui/AccordionItem"
import dynamic from "next/dynamic"

const DailyDashboard = dynamic(() => import("@/components/DailyDashboard").then(m => m.DailyDashboard), {
  ssr: false,
  loading: () => <div className="card-glass p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})

const AGENTS = [
  { key: "bazi", icon: "☯", accent: "#2D6A4F" },
  { key: "astrology", icon: "✦", accent: "#C1121F" },
  { key: "tarot", icon: "🃏", accent: "#C9A84C" },
  { key: "face", icon: "👁", accent: "#E8D5B7" },
  { key: "palm", icon: "🤚", accent: "#2980B9" },
]

export function MarketingBelowFold() {
  const { t, locale, localeHref } = useLanguage()

  const testimonials = Array.isArray(t("home.testimonials.list", { returnObjects: true }))
    ? (t("home.testimonials.list", { returnObjects: true }) as Array<{ name: string; job: string; text: string; score: string; source: string }>)
    : [
      { name: "林小姐", job: "创业者", text: "分析说我需要提升专注力，推荐了桌面摆件，生意确实好转了。", score: "9.2", source: "小红书" },
      { name: "陈先生", job: "工程师", text: "星盘分析把我的行为模式说得一清二楚，感情模式完全对上了。", score: "9.5", source: "知乎" },
      { name: "王女士", job: "教师", text: "塔罗分析的反思感很强，不是吓人的预测，是真的帮我看清了困境和出路。", score: "8.8", source: "微信" },
    ]

  return (
    <>
      {/* ══════════ 5 AGENTS ══════════ */}
      <section id="agents" className="pt-20 pb-28 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge={t("agents.badge")}
            title={t("agents.title")}
            subtitle={t("agents.desc")}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {AGENTS.map((agent, i) => (
              <ScrollReveal key={agent.key} delay={i * 0.08} direction="up">
                <TiltCard className="h-full" glare={false} rotateX={4} rotateY={4} scale={1.02}>
                  <div
                    className="h-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 group cursor-default transition-all duration-300 hover:border-white/[0.12]"
                    style={{ borderLeft: `2px solid ${agent.accent}40` }}
                  >
                    {/* Pulse dot */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="w-1 h-1 rounded-full" style={{ background: agent.accent, opacity: 0.5 }} />
                      <span className="text-[9px] font-medium text-white/25 uppercase tracking-wider">
                        {t(`agent.${agent.key}.tag`)}
                      </span>
                    </div>

                    <div className="text-2xl mb-2.5 transition-transform duration-300 group-hover:scale-105">{agent.icon}</div>

                    <h3 className="font-serif font-semibold text-sm mb-1.5" style={{ color: agent.accent }}>
                      {t(`agent.${agent.key}._label`)}
                    </h3>

                    <p className="text-white/35 text-[11px] leading-relaxed mb-1.5">
                      {t(`agent.${agent.key}.desc`)}
                    </p>

                    <p className="text-white/15 text-[10px] leading-relaxed">
                      {t(`agent.${agent.key}.detail`)}
                    </p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ REPORT PREVIEW ══════════ */}
      <section className="py-24 px-4 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge={t("report.badge")}
            title={t("report.title")}
            subtitle={t("report.desc")}
          />

          <ScrollReveal delay={0.15}>
            <div className="card-glass-elevated p-6 md:p-8 relative overflow-hidden">
              <div className="grid md:grid-cols-2 gap-6 relative">
                {/* Left: Report data */}
                <div>
                  <div className="flex items-center gap-2.5 mb-5">
                    <ScrollText size={16} className="text-gold/70" />
                    <h3 className="font-serif text-base text-gold/80">{t("report.card")}</h3>
                  </div>
                  <div className="space-y-2 mb-5">
                    {[
                      { label: t("report.dayMaster"), value: locale === "zh" ? "甲木 — 参天大树之命" : "Yang Wood — Towering Tree", color: "#2D6A4F" },
                      { label: t("report.fiveElements"), value: locale === "zh" ? "木旺缺金 · 喜火调和" : "Wood strong, Metal weak · Fire favorable", color: "#C1121F" },
                      { label: t("report.tenGods"), value: locale === "zh" ? "正官格 · 贵人运强" : "Officer pattern · Strong mentor luck", color: "#C9A84C" },
                      { label: t("report.annual"), value: locale === "zh" ? "2026 驿马动 · 适合远行求财" : "2026 Horse year · Good for distant ventures", color: "#2980B9" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 bg-white/[0.02] rounded-lg p-2">
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: `${item.color}15`, color: `${item.color}cc` }}>{item.label}</span>
                        <span className="text-white/50 text-[11px]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-2 border border-white/[0.08] rounded-lg px-2.5 py-1.5">
                    <div className="w-5 h-5 rounded bg-gold/10 flex items-center justify-center">
                      <span className="text-gold/70 text-[9px] font-serif font-bold">命</span>
                    </div>
                    <div>
                      <div className="text-gold/70 text-[10px] font-medium">{t("report.aiCert")}</div>
                      <div className="text-white/20 text-[8px]">{t("report.confidence")}</div>
                    </div>
                  </div>
                </div>

                {/* Right: Radar chart + bars */}
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-full max-w-[180px] aspect-square rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-full h-full p-2">
                      {[0.2, 0.4, 0.6, 0.8, 1].map((scale, si) => (
                        <polygon key={si} points={[0, 1, 2, 3, 4].map(i => { const a = (Math.PI * 2 * i) / 5 - Math.PI / 2; const r = 65 * scale; return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}` }).join(" ")} fill="none" stroke="#C9A84C" strokeOpacity={0.04 + 0.04 * si} strokeWidth={0.5} />
                      ))}
                      <polygon points={[0.8, 0.6, 0.9, 0.7, 0.5].map((v, i) => { const a = (Math.PI * 2 * i) / 5 - Math.PI / 2; const r = 65 * v; return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}` }).join(" ")} fill="rgba(201,168,76,0.1)" stroke="#C9A84C" strokeWidth={1} strokeOpacity={0.5} />
                      {[0.8, 0.6, 0.9, 0.7, 0.5].map((v, i) => { const a = (Math.PI * 2 * i) / 5 - Math.PI / 2; const r = 85; return (<text key={i} x={100 + r * Math.cos(a)} y={100 + r * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fill="white" fillOpacity="0.4" fontSize="8">{[t("home.radar.wealth"), t("home.radar.love"), t("home.radar.career"), t("home.radar.health"), t("home.radar.spirit")][i]}</text>) })}
                    </svg>
                  </div>
                  <div className="w-full space-y-1.5">
                    {[[`💰 ${t("report.wealth")}`, 80, "#C9A84C"], [`💕 ${t("report.relationship")}`, 60, "#C1121F"], [`💼 ${t("report.career")}`, 90, "#2D6A4F"], [`🏥 ${t("report.health")}`, 70, "#2980B9"]].map(([label, score, color]) => (
                      <div key={String(label)} className="flex items-center gap-2">
                        <span className="text-white/30 text-[10px] w-12">{String(label)}</span>
                        <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000 delay-300" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${String(color)}44, ${String(color)}88)` }} />
                        </div>
                        <span className="text-white/30 text-[10px] w-6 text-right">{String(score)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ DAILY STATUS ══════════ */}
      <section className="py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge={t("fortune.badge")}
            title={t("home.dailyTitle")}
            subtitle={t("fortune.sectionDesc")}
          />
          <ScrollReveal delay={0.15}>
            <DailyDashboard />
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="py-24 px-4 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge={t("reviews.badge")}
            title={t("reviews.title")}
            subtitle={t("pricing.reviewDisclaimer")}
          />

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((item, i) => (
              <ScrollReveal key={item.name} delay={i * 0.1} direction="up">
                <TiltCard glare={false} rotateX={3} rotateY={3} scale={1.01}>
                  <div className="card-glow p-4 h-full flex flex-col">
                    {/* Stars */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex gap-0.5">{[...Array(5)].map((_, si) => (<Star key={si} size={10} className="text-gold/60 fill-gold/60" />))}</div>
                      <span className="text-gold/50 text-[10px] font-medium">★ {item.score}</span>
                    </div>

                    {/* Quote */}
                    <p className="text-white/45 text-xs leading-relaxed mb-3 flex-1">&ldquo;{item.text}&rdquo;</p>

                    {/* Author */}
                    <div className="border-t border-white/[0.05] pt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gold/10 border border-white/[0.08] flex items-center justify-center text-gold/70 text-[10px] font-bold">{item.name[0]}</div>
                        <div>
                          <div className="text-white/70 text-[11px] font-medium">{item.name}</div>
                          <div className="text-white/25 text-[9px]">{item.job}</div>
                        </div>
                      </div>
                      {item.source && (
                        <span className="text-white/10 text-[8px] bg-white/[0.03] px-1.5 py-0.5 rounded">{item.source}</span>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            badge={t("faq.badge")}
            title={t("faq.title")}
          />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((n, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <AccordionItem question={t(`faq.q${n}`)} answer={t(`faq.a${n}`)} defaultOpen={i === 0} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <ScrollReveal>
        <section className="py-24 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="card-glass-elevated p-8 md:p-12 relative overflow-hidden">
              <div className="relative">
                <div className="text-3xl mb-4">✨</div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-white/90 mb-2">{t("cta.title")}</h2>
                <p className="text-white/35 mb-6 max-w-md mx-auto text-sm">{t("cta.desc")}</p>
                <MagneticButton>
                  <Link href="/reading/new" className="btn-gold inline-flex items-center gap-2 text-base px-8 py-3 group">
                    {t("cta.button")}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>
                <p className="text-white/15 text-[10px] mt-3">{t("cta.note")}</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </>
  )
}
