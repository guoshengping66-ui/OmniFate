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
      { name: "陈先生", job: "工程师", text: "图表分析把我的行为模式说得一清二楚，感情模式完全对上了。", score: "9.5", source: "知乎" },
      { name: "王女士", job: "教师", text: "符号分析的反思感很强，不是吓人的预测，是真的帮我看清了困境和出路。", score: "8.8", source: "微信" },
    ]

  return (
    <>
      {/* ══════════ 5 AGENTS ══════════ */}
      <section id="agents" className="pt-24 pb-32 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge={t("agents.badge")}
            title={t("agents.title")}
            subtitle={t("agents.desc")}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {AGENTS.map((agent, i) => (
              <ScrollReveal key={agent.key} delay={i * 0.08} direction="up">
                <TiltCard className="h-full" glare={true} rotateX={6} rotateY={6} scale={1.03}>
                  <div
                    className="h-full bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-5 group cursor-default transition-all duration-500 hover:border-white/20"
                    style={{ borderTop: `2px solid ${agent.accent}55` }}
                  >
                    {/* Pulse dot */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full element-pulse" style={{ background: agent.accent }} />
                      <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
                        {t(`agent.${agent.key}.tag`)}
                      </span>
                    </div>

                    <div className="text-3xl mb-3 transition-transform duration-500 group-hover:scale-110">{agent.icon}</div>

                    <h3 className="font-serif font-bold text-base mb-1.5" style={{ color: agent.accent }}>
                      {t(`agent.${agent.key}._label`)}
                    </h3>

                    <p className="text-white/40 text-xs leading-relaxed mb-2">
                      {t(`agent.${agent.key}.desc`)}
                    </p>

                    <p className="text-white/20 text-[11px] leading-relaxed">
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
      <section className="py-28 px-4 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge={t("report.badge")}
            title={t("report.title")}
            subtitle={t("report.desc")}
          />

          <ScrollReveal delay={0.15}>
            <div className="card-glass-elevated p-8 md:p-10 relative overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
              <div className="grid md:grid-cols-2 gap-8 relative">
                {/* Left: Report data */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <ScrollText size={18} className="text-gold" />
                    <h3 className="font-serif text-lg text-gold">{t("report.card")}</h3>
                  </div>
                  <div className="space-y-2.5 mb-6">
                    {[
                      { label: t("report.dayMaster"), value: locale === "zh" ? "甲木 — 参天大树之命" : "Yang Wood — Towering Tree", color: "#2D6A4F" },
                      { label: t("report.fiveElements"), value: locale === "zh" ? "木旺缺金 · 喜火调和" : "Wood strong, Metal weak · Fire favorable", color: "#C1121F" },
                      { label: t("report.tenGods"), value: locale === "zh" ? "正官格 · 贵人运强" : "Officer pattern · Strong mentor luck", color: "#C9A84C" },
                      { label: t("report.annual"), value: locale === "zh" ? "2026 驿马动 · 适合远行求财" : "2026 Horse year · Good for distant ventures", color: "#2980B9" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2.5 bg-white/[0.03] rounded-xl p-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${item.color}22`, color: item.color }}>{item.label}</span>
                        <span className="text-white/60 text-xs">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-2 border border-gold/30 rounded-xl px-3 py-1.5">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-gold text-[10px] font-serif font-bold">命</span>
                    </div>
                    <div>
                      <div className="text-gold text-[11px] font-medium">{t("report.aiCert")}</div>
                      <div className="text-white/20 text-[9px]">{t("report.confidence")}</div>
                    </div>
                  </div>
                </div>

                {/* Right: Radar chart + bars */}
                <div className="flex flex-col items-center justify-center gap-5">
                  <div className="w-full max-w-[220px] aspect-square rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-full h-full p-2">
                      {[0.2, 0.4, 0.6, 0.8, 1].map((scale, si) => (
                        <polygon key={si} points={[0, 1, 2, 3, 4].map(i => { const a = (Math.PI * 2 * i) / 5 - Math.PI / 2; const r = 65 * scale; return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}` }).join(" ")} fill="none" stroke="#C9A84C" strokeOpacity={0.06 + 0.06 * si} strokeWidth={0.5} />
                      ))}
                      <polygon points={[0.8, 0.6, 0.9, 0.7, 0.5].map((v, i) => { const a = (Math.PI * 2 * i) / 5 - Math.PI / 2; const r = 65 * v; return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}` }).join(" ")} fill="rgba(201,168,76,0.15)" stroke="#C9A84C" strokeWidth={1.5} strokeOpacity={0.7} />
                      {[0.8, 0.6, 0.9, 0.7, 0.5].map((v, i) => { const a = (Math.PI * 2 * i) / 5 - Math.PI / 2; const r = 85; return (<text key={i} x={100 + r * Math.cos(a)} y={100 + r * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fill="white" fillOpacity="0.5" fontSize="9">{[t("home.radar.wealth"), t("home.radar.love"), t("home.radar.career"), t("home.radar.health"), t("home.radar.spirit")][i]}</text>) })}
                    </svg>
                  </div>
                  <div className="w-full space-y-2">
                    {[[`💰 ${t("report.wealth")}`, 80, "#C9A84C"], [`💕 ${t("report.relationship")}`, 60, "#C1121F"], [`💼 ${t("report.career")}`, 90, "#2D6A4F"], [`🏥 ${t("report.health")}`, 70, "#2980B9"]].map(([label, score, color]) => (
                      <div key={String(label)} className="flex items-center gap-2.5">
                        <span className="text-white/40 text-[11px] w-14">{String(label)}</span>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000 delay-300" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${String(color)}66, ${String(color)})` }} />
                        </div>
                        <span className="text-white/40 text-[11px] w-8 text-right">{String(score)}</span>
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
      <section className="py-28 px-4 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge={t("reviews.badge")}
            title={t("reviews.title")}
            subtitle={t("pricing.reviewDisclaimer")}
          />

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((item, i) => (
              <ScrollReveal key={item.name} delay={i * 0.1} direction="up">
                <TiltCard glare={false} rotateX={4} rotateY={4} scale={1.02}>
                  <div className="card-glow p-5 h-full flex flex-col">
                    {/* Stars */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-0.5">{[...Array(5)].map((_, si) => (<Star key={si} size={11} className="text-gold fill-gold" />))}</div>
                      <span className="text-gold/60 text-[11px] font-medium">★ {item.score}</span>
                    </div>

                    {/* Quote */}
                    <p className="text-white/55 text-sm leading-relaxed mb-4 flex-1">&ldquo;{item.text}&rdquo;</p>

                    {/* Author */}
                    <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-gold text-xs font-bold">{item.name[0]}</div>
                        <div>
                          <div className="text-white/80 text-xs font-medium">{item.name}</div>
                          <div className="text-white/30 text-[10px]">{item.job}</div>
                        </div>
                      </div>
                      {item.source && (
                        <span className="text-white/15 text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full">{item.source}</span>
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
      <section className="py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            badge={t("faq.badge")}
            title={t("faq.title")}
          />
          <div className="space-y-3">
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
        <section className="py-28 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="card-glass-elevated p-10 md:p-14 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
              <div className="relative">
                <div className="text-4xl mb-5 animate-float">✨</div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">{t("cta.title")}</h2>
                <p className="text-white/45 mb-8 max-w-md mx-auto text-sm">{t("cta.desc")}</p>
                <MagneticButton>
                  <Link href={localeHref("/reading/new")} className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4 group">
                    {t("cta.button")}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>
                <p className="text-white/20 text-[11px] mt-4">{t("cta.note")}</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </>
  )
}
