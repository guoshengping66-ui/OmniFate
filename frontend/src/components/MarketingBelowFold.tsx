"use client"
import Link from "next/link"
import { Star, ArrowRight, ShieldCheck, Zap, Eye, ScrollText } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { TiltCard } from "@/components/ui/TiltCard"
import { useLanguage } from "@/contexts/LanguageContext"
import { AccordionItem } from "@/components/ui/AccordionItem"
import dynamic from "next/dynamic"

const DailyDashboard = dynamic(() => import("@/components/DailyDashboard").then(m => m.DailyDashboard), {
  ssr: false,
  loading: () => <div className="card-glass p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})

const AGENTS = [
  { key: "bazi", icon: "☯", accent: "#2D6A4F", span: "md:col-span-1" },
  { key: "astrology", icon: "✦", accent: "#C1121F", span: "md:col-span-1" },
  { key: "tarot", icon: "🃏", accent: "#C9A84C", span: "md:col-span-1" },
  { key: "face", icon: "👁", accent: "#E8D5B7", span: "md:col-span-1" },
  { key: "palm", icon: "🤚", accent: "#2980B9", span: "md:col-span-1" },
]

export function MarketingBelowFold() {
  const { t, locale, localeHref } = useLanguage()

  const testimonials = Array.isArray(t("home.testimonials.list", { returnObjects: true }))
    ? (t("home.testimonials.list", { returnObjects: true }) as Array<{ name: string; job: string; text: string; score: string; source: string }>)
    : [
      { name: "林小姐", job: "创业者", text: "八字说我缺金，推荐了黄水晶，生意确实好转了。", score: "9.2", source: "小红书" },
      { name: "陈先生", job: "工程师", text: "星盘把我的土星功课说得一清二楚，感情模式完全对上了。", score: "9.5", source: "知乎" },
      { name: "王女士", job: "教师", text: "塔罗的疗愈感很强，不是吓人的命理预测，是真的帮我看清了困境和出路。", score: "8.8", source: "微信" },
    ]

  return (
    <>
      {/* ══════════ DISCOVERY ══════════ */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("discovery.badge")}</span>
              <h2 className="section-title mt-3">{t("discovery.title")}</h2>
              <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm">{t("discovery.desc")}</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "sabotage", icon: "💔" },
              { key: "money", icon: "🌊" },
              { key: "disconnected", icon: "🌙" },
              { key: "empathy", icon: "✨" },
            ].map((item, i) => (
              <ScrollReveal key={item.key} delay={i * 0.1} direction="up">
                <div className="card-glass p-6 group hover:border-gold/30 transition-all duration-300 cursor-default">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-0.5">{item.icon}</span>
                    <div>
                      <h3 className="font-serif text-white/90 font-medium mb-1.5 group-hover:text-gold transition-colors">
                        {t(`discovery.items.${item.key}.title`)}
                      </h3>
                      <p className="text-white/40 text-sm leading-relaxed">{t(`discovery.items.${item.key}.desc`)}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.5}>
            <div className="text-center mt-10">
              <MagneticButton>
                <Link href={localeHref("/reading/new")} className="btn-gold inline-flex items-center gap-2 px-8 py-3">
                  {t("discovery.cta")}
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ 5 Agents ══════════ */}
      <section id="agents" className="py-28 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("agents.badge")}</span>
              <h2 className="section-title mt-3">{t("agents.title")}</h2>
              <p className="text-white/40 mt-4 max-w-lg mx-auto">{t("agents.desc")}</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 auto-rows-fr">
            {AGENTS.map((agent, i) => (
              <ScrollReveal key={agent.key} delay={i * 0.08} direction="up">
                <TiltCard className={`${agent.span} col-span-1 h-full`} glare={true} rotateX={6} rotateY={6} scale={1.03}>
                  <div
                    className="h-full bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-7 group cursor-default transition-all duration-500"
                    style={{ borderLeft: `2px solid ${agent.accent}44`, boxShadow: i === 0 ? `0 0 40px ${agent.accent}10` : "none" }}
                  >
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 text-white/40 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full element-pulse" style={{ background: agent.accent, color: agent.accent }} />
                      {t(`agent.${agent.key}.tag`)}
                    </div>
                    <div className="text-4xl mb-4 transition-transform duration-500 group-hover:scale-110">{agent.icon}</div>
                    <h3 className="font-serif font-bold text-lg mb-2" style={{ color: agent.accent }}>{t(`agent.${agent.key}._label`)}</h3>
                    <p className="text-white/40 text-sm leading-relaxed mb-3">{t(`agent.${agent.key}.desc`)}</p>
                    <p className="text-white/20 text-xs leading-relaxed">{t(`agent.${agent.key}.detail`)}</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ How It Works ══════════ */}
      <section className="py-28 px-4 bg-white/[0.015] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("steps.badge")}</span>
              <h2 className="section-title mt-3">{t("steps.title")}</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "01", title: t("step1._label"), icon: "📋", desc: t("step1.desc") },
              { n: "02", title: t("step3._label"), icon: "⚡", desc: t("step3.desc") },
              { n: "03", title: t("step4._label"), icon: "📖", desc: t("step4.desc") },
            ].map((s, i) => (
              <ScrollReveal key={s.n} delay={i * 0.12} direction="up">
                <div className="text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-2xl group-hover:border-gold/30 group-hover:bg-gold/5 transition-all duration-300">{s.icon}</div>
                  <div className="text-sm text-gold/40 font-bold mb-2">{s.n}</div>
                  <h3 className="text-white font-bold mb-1">{s.title}</h3>
                  <p className="text-white/30 text-xs">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="hidden md:block absolute top-[88px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ══════════ REPORT PREVIEW ══════════ */}
      <section className="py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("report.badge")}</span>
              <h2 className="section-title mt-3">{t("report.title")}</h2>
              <p className="text-white/40 mt-4 max-w-lg mx-auto">{t("report.desc")}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="card-glass-elevated p-8 md:p-10 relative overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
              <div className="grid md:grid-cols-2 gap-8 relative">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <ScrollText size={20} className="text-gold" />
                    <h3 className="font-serif text-xl text-gold">{t("report.card")}</h3>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[
                      { label: t("report.dayMaster"), value: locale === "zh" ? "甲木 — 参天大树之命" : "Yang Wood — Towering Tree", color: "#2D6A4F" },
                      { label: t("report.fiveElements"), value: locale === "zh" ? "木旺缺金 · 喜火调和" : "Wood strong, Metal weak · Fire favorable", color: "#C1121F" },
                      { label: t("report.tenGods"), value: locale === "zh" ? "正官格 · 贵人运强" : "Officer pattern · Strong mentor luck", color: "#C9A84C" },
                      { label: t("report.annual"), value: locale === "zh" ? "2026 驿马动 · 适合远行求财" : "2026 Horse year · Good for distant ventures", color: "#2980B9" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${item.color}22`, color: item.color }}>{item.label}</span>
                        <span className="text-white/60 text-sm">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-2 border border-gold/30 rounded-xl px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-gold text-xs font-serif font-bold">命</span>
                    </div>
                    <div>
                      <div className="text-gold text-xs font-medium">{t("report.aiCert")}</div>
                      <div className="text-white/20 text-[10px]">{t("report.confidence")}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="w-full max-w-[240px] aspect-square rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
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
                      <div key={String(label)} className="flex items-center gap-3">
                        <span className="text-white/40 text-xs w-14">{String(label)}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000 delay-300" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${String(color)}66, ${String(color)})` }} />
                        </div>
                        <span className="text-white/40 text-xs w-8 text-right">{String(score)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ DAILY FORTUNE ══════════ */}
      <section className="py-28 px-4 bg-white/[0.015] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("fortune.badge")}</span>
              <h2 className="section-title mt-3">{t("home.dailyTitle")}</h2>
              <p className="text-white/40 mt-4 max-w-lg mx-auto">{t("fortune.sectionDesc")}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <DailyDashboard />
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("reviews.badge")}</span>
              <h2 className="section-title mt-3">{t("reviews.title")}</h2>
              <p className="text-white/30 text-xs mt-2">{t("pricing.reviewDisclaimer")}</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <ScrollReveal key={item.name} delay={i * 0.1} direction="up">
                <TiltCard glare={false} rotateX={4} rotateY={4} scale={1.02}>
                  <div className="card-glow p-6 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-0.5">{[...Array(5)].map((_, si) => (<Star key={si} size={12} className="text-gold fill-gold" />))}</div>
                      <span className="text-gold/60 text-xs font-medium">★ {item.score}</span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-4">"{item.text}"</p>
                    <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold">{item.name[0]}</div>
                        <div>
                          <div className="text-white text-sm font-medium">{item.name}</div>
                          <div className="text-white/30 text-xs">{item.job}</div>
                        </div>
                      </div>
                      {item.source && (
                        <span className="text-white/15 text-[10px] bg-white/5 px-2 py-0.5 rounded-full">{item.source}</span>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TRUST ══════════ */}
      <ScrollReveal>
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
            {[[ShieldCheck, t("trust.security._label"), t("trust.security.desc")], [Zap, t("trust.speed._label"), t("trust.speed.desc")], [Eye, t("trust.privacy._label"), t("trust.privacy.desc")]].map(([Icon, title, desc]) => (
              <div key={String(title)} className="flex items-center gap-3 text-white/40">
                <Icon size={20} className="text-gold/50" />
                <div>
                  <div className="text-sm text-white/60">{String(title)}</div>
                  <div className="text-xs text-white/20">{String(desc)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ══════════ FAQ ══════════ */}
      <section className="py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("faq.badge")}</span>
              <h2 className="section-title mt-3">{t("faq.title")}</h2>
            </div>
          </ScrollReveal>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((n, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <AccordionItem question={t(`faq.q${n}`)} answer={t(`faq.a${n}`)} defaultOpen={i === 0} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <ScrollReveal>
        <section className="py-32 px-4 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.03] to-transparent pointer-events-none" />
          <div className="max-w-2xl mx-auto relative">
            <div className="card-glass-elevated p-12 md:p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
              <div className="relative">
                <div className="text-5xl mb-6 animate-float">🔮</div>
                <h2 className="section-title mb-4">{t("cta.title")}</h2>
                <p className="text-white/50 mb-10 max-w-md mx-auto">{t("cta.desc")}</p>
                <MagneticButton>
                  <Link href={localeHref("/reading/new")} className="btn-gold inline-flex items-center gap-2 text-lg px-12 py-5 group">
                    {t("cta.button")}
                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>
                <p className="text-white/20 text-xs mt-4">{t("cta.note")}</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </>
  )
}
