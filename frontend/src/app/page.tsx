"use client"
import { useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Sparkles, Star, ArrowRight, ShieldCheck, Zap, Eye, ShoppingBag, ScrollText } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { MagneticButton } from "@/components/ui/MagneticButton"
import { TiltCard } from "@/components/ui/TiltCard"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { useUserStore } from "@/stores/useUserStore"
import { CountUpNumber } from "@/components/ui/CountUpNumber"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

// ── Lazy-loaded heavy animated components (ssr: false) ───────────
const LiveBar = dynamic(() => import("@/components/ui/LiveBar").then(m => m.LiveBar), { ssr: false })
const FloatingCTA = dynamic(() => import("@/components/ui/FloatingCTA").then(m => m.FloatingCTA), { ssr: false })
const HeroScene = dynamic(() => import("@/components/ui/HeroScene").then(m => m.HeroScene), { ssr: false })
const FloatingRunes = dynamic(() => import("@/components/ui/FloatingRunes").then(m => m.FloatingRunes), { ssr: false })
const MagicCursor = dynamic(() => import("@/components/ui/MagicCursor").then(m => m.MagicCursor), { ssr: false })
const FloatingOracleIcon = dynamic(() => import("@/components/ui/FloatingOracleIcon").then(m => m.FloatingOracleIcon), { ssr: false })

// ── Lazy-loaded below-the-fold sections ──────────────────────────
const UserDashboard = dynamic(() => import("@/components/dashboard/UserDashboard").then(m => m.UserDashboard), {
  ssr: false,
  loading: () => <div className="card-glass p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})
const DailyDashboard = dynamic(() => import("@/components/DailyDashboard").then(m => m.DailyDashboard), {
  ssr: false,
  loading: () => <div className="card-glass p-8"><div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>,
})

// ── Stats Section: framer-motion 数字滚动增长 ─────────────────────────────────
function StatCard({ end, suffix, prefix, label, delay, duration }: {
  end: number; suffix?: string; prefix?: string; label: string; delay: number; duration?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <div className="text-2xl md:text-3xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
        <CountUpNumber end={end} duration={duration || 2.5} suffix={suffix} prefix={prefix} />
      </div>
      <div className="text-[11px] md:text-xs text-white/40 mt-1.5 tracking-wider font-medium">{label}</div>
      {/* Gold accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeOut" }}
        className="w-8 h-0.5 bg-gold/30 rounded-full mx-auto mt-2 origin-center"
      />
    </motion.div>
  )
}

function StatsSection() {
  const { t } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  const stats = [
    { end: 12000, suffix: "+", label: t("hero.stat1") },
    { end: 98, suffix: ".7%", label: t("hero.stat2") },
    { end: 5, label: t("hero.stat3") },
    { end: 40, suffix: "s", label: t("hero.stat4"), prefix: "<" },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="mt-16"
    >
      {/* Top decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-8 origin-center"
      />

      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        {stats.map((s, i) => (
          <StatCard
            key={s.label}
            end={s.end}
            suffix={s.suffix}
            prefix={s.prefix}
            label={s.label}
            delay={i * 0.15}
            duration={2 + i * 0.3}
          />
        ))}
      </div>

      {/* Bottom decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        className="w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-8 origin-center"
      />
    </motion.div>
  )
}

export default function HomePage() {
  const { t, locale } = useLanguage()
  const { user, loading: authLoading } = useAuth()
  const { userProfile, loading: profileLoading, fetchBirthProfiles } = useUserStore()

  // Fetch birth profile on mount when user is logged in
  useEffect(() => {
    if (user) fetchBirthProfiles()
  }, [user])

  // ── Auth gate: prevent flash of wrong layout ────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  const hasProfile = !!user && !!userProfile
  const profileStillLoading = !!user && profileLoading && !userProfile

  const AGENTS = [
    {
      icon: "☯", title: t("agent.bazi"), tag: t("agent.bazi.tag"),
      desc: t("agent.bazi.desc"),
      detail: t("agent.bazi.detail"),
      accent: "#2D6A4F", span: "md:col-span-1",
    },
    {
      icon: "✦", title: t("agent.astrology"), tag: t("agent.astrology.tag"),
      desc: t("agent.astrology.desc"),
      detail: t("agent.astrology.detail"),
      accent: "#C1121F", span: "md:col-span-1",
    },
    {
      icon: "🃏", title: t("agent.tarot"), tag: t("agent.tarot.tag"),
      desc: t("agent.tarot.desc"),
      detail: t("agent.tarot.detail"),
      accent: "#C9A84C", span: "md:col-span-1",
    },
    {
      icon: "👁", title: t("agent.face"), tag: t("agent.face.tag"),
      desc: t("agent.face.desc"),
      detail: t("agent.face.detail"),
      accent: "#E8D5B7", span: "md:col-span-1",
    },
    {
      icon: "🤚", title: t("agent.palm"), tag: t("agent.palm.tag"),
      desc: t("agent.palm.desc"),
      detail: t("agent.palm.detail"),
      accent: "#2980B9", span: "md:col-span-1",
    },
  ]

  const products = [
    {
      name: t("home.product1.name"),
      price: "¥388",
      desc: t("home.product1.desc"),
      tag: t("home.product1.tag"),
      gradient: "from-purple-900/40 to-purple-800/10",
      glow: "rgba(147,51,234,0.2)",
      icon: "🔮",
    },
    {
      name: t("home.product2.name"),
      price: "¥268",
      desc: t("home.product2.desc"),
      tag: t("home.product2.tag"),
      gradient: "from-amber-900/40 to-amber-800/10",
      glow: "rgba(245,158,11,0.2)",
      icon: "🧘",
    },
    {
      name: t("home.product3.name"),
      price: "¥328",
      desc: t("home.product3.desc"),
      tag: t("home.product3.tag"),
      gradient: "from-emerald-900/40 to-emerald-800/10",
      glow: "rgba(16,185,129,0.2)",
      icon: "🌿",
    },
  ]

  const testimonials = [
    {
      name: locale === "zh" ? "林小姐" : "Ms. Lin",
      job: locale === "zh" ? "创业者" : "Entrepreneur",
      text: locale === "zh"
        ? "八字说我缺金，推荐了黄水晶，生意确实好转了。三个月后复盘，报告说的那个关键时间窗口是真的！"
        : "Bazi said I lack Metal, recommended citrine — business actually improved!",
    },
    {
      name: locale === "zh" ? "陈先生" : "Mr. Chen",
      job: locale === "zh" ? "工程师" : "Engineer",
      text: locale === "zh"
        ? "星盘把我的土星功课说得一清二楚，感情模式完全对上了。这比我去找大师算得还准。"
        : "The natal chart nailed my Saturn lessons and relationship patterns perfectly!",
    },
    {
      name: locale === "zh" ? "王女士" : "Ms. Wang",
      job: locale === "zh" ? "教师" : "Teacher",
      text: locale === "zh"
        ? "塔罗的疗愈感很强，不是吓人的命理预测，是真的帮我看清了困境和出路。"
        : "The tarot reading was genuinely healing — it helped me see my way through challenges.",
    },
  ]



  // ── Returning users with profile → Dashboard vertical flow ──
  if (hasProfile) {
    return (
      <div className="min-h-screen">
        <LiveBar />

        {/* ── Hero Fold: 底座 + 意图按钮 ───────────────────── */}
        <section className="pt-24 pb-10 px-4">
          <UserDashboard />
        </section>

        {/* ── Daily Focus Fold: 今日运势 + 黄历 ─────────────── */}
        <section className="py-12 px-4 bg-white/[0.015]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("home.dailyBadge")}</span>
              <h2 className="font-serif text-2xl font-bold text-gold mt-2">{t("home.dailyTitle")}</h2>
            </div>
            <DailyDashboard />
          </div>
        </section>

        {/* ── CTA Fold: 改运商城/知识库 ────────────────────── */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="card-glass p-8 text-center">
              <div className="text-3xl mb-4">🛍️</div>
              <h3 className="font-serif text-lg text-gold mb-2">{t("home.shopCta")}</h3>
              <p className="text-white/40 text-sm mb-5">{t("home.shopDesc")}</p>
              <div className="flex justify-center gap-4">
                <Link href="/shop" className="btn-gold text-sm px-6 py-2">{t("home.shopButton")}</Link>
                <Link href="/blog" className="border border-white/20 text-white/60 hover:text-gold hover:border-gold/30 rounded-full text-sm px-6 py-2 transition-all">{t("home.knowledgeButton")}</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // ── Loading profile (logged in, no data yet) ────────────────
  if (profileStillLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  // ── New / logged-out visitors → Marketing ────────────────────
  return (
    <div className="min-h-screen">
      <LiveBar />
      <FloatingCTA />

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
        {/* Cyber astrolabe background */}
        <HeroScene />
        <FloatingRunes />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/30 to-ink pointer-events-none" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-gold/20 rounded-full px-4 py-1.5 text-gold text-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                </span>
                {t("hero.badge")} 128 {t("hero.badgePeople")}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <h1 className="text-[2.5rem] md:text-6xl lg:text-7xl font-serif font-bold leading-[1.05] mb-6">
                <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                  {t("hero.title1")}
                </span>
                <br />
                <span className="text-white">{t("hero.title2")}</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="text-lg md:text-xl text-white/50 max-w-xl leading-relaxed mb-10 whitespace-pre-line">
                <span className="text-gold">{t("hero.desc").split("\n")[0]}</span>
                <br />
                {t("hero.desc").split("\n")[1]}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.45}>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <MagneticButton>
                  <Link
                    href="/reading/new"
                    className="btn-gold pulse-ring text-base inline-flex items-center gap-2 px-10 py-4 text-lg group"
                  >
                    {t("hero.cta1")}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>

                <MagneticButton>
                  <a
                    href="#agents"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white/60 hover:border-gold/30 hover:text-gold transition-all text-lg backdrop-blur-sm"
                  >
                    {t("hero.cta2")}
                  </a>
                </MagneticButton>

                {/* FloatingOracleIcon — beside CTA */}
                <FloatingOracleIcon />
              </div>
            </ScrollReveal>

            {/* Social proof strip — framer-motion scroll-triggered */}
            <StatsSection />
          </div>
        </div>
      </section>

      {/* ══════════ DISCOVERY: What People Found ══════════ */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Subtle gradient divider */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("discovery.badge")}</span>
              <h2 className="section-title mt-3">{t("discovery.title")}</h2>
              <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm">
                {t("discovery.desc")}
              </p>
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
                      <p className="text-white/40 text-sm leading-relaxed">
                        {t(`discovery.items.${item.key}.desc`)}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.5}>
            <div className="text-center mt-10">
              <MagneticButton>
                <Link
                  href="/reading/new"
                  className="btn-gold inline-flex items-center gap-2 px-8 py-3"
                >
                  {t("discovery.cta")}
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ BENTO GRID: 5 Agents ══════════ */}
      <section id="agents" className="py-28 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("agents.badge")}</span>
              <h2 className="section-title mt-3">{t("agents.title")}</h2>
              <p className="text-white/40 mt-4 max-w-lg mx-auto">
                {t("agents.desc")}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 auto-rows-fr">
            {AGENTS.map((agent, i) => (
              <ScrollReveal key={agent.title} delay={i * 0.08} direction="up">
                <TiltCard
                  className={`${agent.span} col-span-1 h-full`}
                  glare={true}
                  rotateX={6}
                  rotateY={6}
                  scale={1.03}
                >
                  <div
 className="h-full bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-7 group cursor-default transition-all duration-500"
                    style={{
                      borderLeft: `2px solid ${agent.accent}44`,
                      boxShadow: i === 0
                        ? `0 0 40px ${agent.accent}10`
                        : "none",
                    }}
                  >
                    {/* Element badge */}
                    <div
 className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 text-white/40 mb-4"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full element-pulse"
                        style={{ background: agent.accent, color: agent.accent }}
                      />
                      {agent.tag}
                    </div>

                    {/* Icon */}
                    <div className="text-4xl mb-4 transition-transform duration-500 group-hover:scale-110">
                      {agent.icon}
                    </div>

                    <h3
                      className="font-serif font-bold text-lg mb-2"
                      style={{ color: agent.accent }}
                    >
                      {agent.title}
                    </h3>

                    <p className="text-white/40 text-sm leading-relaxed mb-3">{agent.desc}</p>
                    <p className="text-white/20 text-xs leading-relaxed">{agent.detail}</p>
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

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: "01", title: t("step1"), icon: "📋", desc: t("step1.desc") },
              { n: "02", title: t("step2"), icon: "📸", desc: t("step2.desc") },
              { n: "03", title: t("step3"), icon: "⚡", desc: t("step3.desc") },
              { n: "04", title: t("step4"), icon: "📖", desc: t("step4.desc") },
            ].map((s, i) => (
              <ScrollReveal key={s.n} delay={i * 0.1} direction="up">
                <div className="text-center group">
 <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-2xl group-hover:border-gold/30 group-hover:bg-gold/5 transition-all duration-300">
                    {s.icon}
                  </div>
                  <div className="text-sm text-gold/40 font-bold mb-2">{s.n}</div>
                  <h3 className="text-white font-bold mb-1">{s.title}</h3>
                  <p className="text-white/30 text-xs">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Connector line (hidden on mobile) */}
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
              <p className="text-white/40 mt-4 max-w-lg mx-auto">
                {t("report.desc")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="card-glass-elevated p-8 md:p-10 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

              <div className="grid md:grid-cols-2 gap-8 relative">
                {/* Left: Report content preview */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <ScrollText size={20} className="text-gold" />
                    <h3 className="font-serif text-xl text-gold">{t("report.card")}</h3>
                  </div>

                  {/* Sample content */}
                  <div className="space-y-3 mb-6">
                    {[
                      { label: t("report.dayMaster"), value: locale === "zh" ? "甲木 — 参天大树之命" : "Yang Wood — Towering Tree", color: "#2D6A4F" },
                      { label: t("report.fiveElements"), value: locale === "zh" ? "木旺缺金 · 喜火调和" : "Wood strong, Metal weak · Fire favorable", color: "#C1121F" },
                      { label: t("report.tenGods"), value: locale === "zh" ? "正官格 · 贵人运强" : "Officer pattern · Strong mentor luck", color: "#C9A84C" },
                      { label: t("report.annual"), value: locale === "zh" ? "2026 驿马动 · 适合远行求财" : "2026 Horse year · Good for distant ventures", color: "#2980B9" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${item.color}22`, color: item.color }}
                        >
                          {item.label}
                        </span>
                        <span className="text-white/60 text-sm">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Gold seal / stamp */}
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

                {/* Right: Radar + scores */}
                <div className="flex flex-col items-center justify-center gap-6">
                  {/* Mini radar */}
                  <div className="w-full max-w-[240px] aspect-square rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-full h-full p-2">
                      {/* Pentagon grid */}
                      {[0.2, 0.4, 0.6, 0.8, 1].map((scale, si) => (
                        <polygon
                          key={si}
                          points={[0, 1, 2, 3, 4].map(i => {
                            const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
                            const r = 65 * scale
                            return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`
                          }).join(" ")}
                          fill="none"
                          stroke="#C9A84C"
                          strokeOpacity={0.06 + 0.06 * si}
                          strokeWidth={0.5}
                        />
                      ))}
                      {/* Data */}
                      <polygon
                        points={[0.8, 0.6, 0.9, 0.7, 0.5].map((v, i) => {
                          const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
                          const r = 65 * v
                          return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`
                        }).join(" ")}
                        fill="rgba(201,168,76,0.15)"
                        stroke="#C9A84C"
                        strokeWidth={1.5}
                        strokeOpacity={0.7}
                      />
                      {/* Score labels */}
                      {[0.8, 0.6, 0.9, 0.7, 0.5].map((v, i) => {
                        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
                        const r = 85
                        return (
                          <text key={i}
                            x={100 + r * Math.cos(a)}
                            y={100 + r * Math.sin(a)}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="white"
                            fillOpacity="0.5"
                            fontSize="9"
                          >
                            {[t("home.radar.wealth"), t("home.radar.love"), t("home.radar.career"), t("home.radar.health"), t("home.radar.spirit")][i]}
                          </text>
                        )
                      })}
                    </svg>
                  </div>

                  {/* Score bars */}
                  <div className="w-full space-y-2">
                    {[
                      [`💰 ${t("report.wealth")}`, 80, "#C9A84C"],
                      [`💕 ${t("report.relationship")}`, 60, "#C1121F"],
                      [`💼 ${t("report.career")}`, 90, "#2D6A4F"],
                      [`🏥 ${t("report.health")}`, 70, "#2980B9"],
                    ].map(([label, score, color]) => (
                      <div key={String(label)} className="flex items-center gap-3">
                        <span className="text-white/40 text-xs w-14">{String(label)}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 delay-300"
                            style={{
                              width: `${score}%`,
                              background: `linear-gradient(90deg, ${String(color)}66, ${String(color)})`,
                            }}
                          />
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

      {/* ══════════ PRODUCT SHOWCASE ══════════ */}
      <section className="py-28 px-4 bg-white/[0.015] relative">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("products.badge")}</span>
              <h2 className="section-title mt-3">{t("products.title")}</h2>
              <p className="text-white/40 mt-4 max-w-lg mx-auto">
                {t("products.desc")}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <ScrollReveal key={p.name} delay={i * 0.12} direction="up">
                <Link href="/shop">
                  <TiltCard glare={true} scale={1.02}>
                    <div
 className="relative overflow-hidden rounded-2xl border border-white/10 p-6 h-full group cursor-pointer transition-all duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${p.gradient}, transparent)`,
                        boxShadow: `0 0 60px ${p.glow}`,
                      }}
                    >
                      {/* Glow on hover */}
                      <div
                        className="absolute -inset-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 50% 50%, ${p.glow}, transparent 60%)`,
                        }}
                      />

                      {/* Tag */}
 <div className="relative z-10 inline-block text-[10px] font-bold px-2 py-1 rounded-full bg-white/10 text-white/60 mb-4 border border-white/10">
                        {p.tag}
                      </div>

                      {/* Product icon */}
 <div className="relative z-10 w-24 h-24 mx-auto mb-5 rounded-2xl border border-white/10 flex items-center justify-center text-4xl bg-white/[0.03] group-hover:scale-110 transition-transform duration-500">
                        {p.icon}
                      </div>

                      <div className="relative z-10 text-center">
                        <h3 className="font-serif font-bold text-white text-lg mb-1">{p.name}</h3>
                        <p className="text-white/30 text-xs mb-3">{p.desc}</p>
                        <div className="text-gold font-bold text-xl">{p.price}</div>
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TRUST ══════════ */}
      <ScrollReveal>
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              [ShieldCheck, t("trust.security"), t("trust.security.desc")],
              [Zap, t("trust.speed"), t("trust.speed.desc")],
              [Eye, t("trust.privacy"), t("trust.privacy.desc")],
            ].map(([Icon, title, desc]) => (
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

      {/* ══════════ DAILY FORTUNE + ALMANAC ══════════ */}
      <section className="py-28 px-4 bg-white/[0.015] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("fortune.badge")}</span>
              <h2 className="section-title mt-3">{t("home.dailyTitle")}</h2>
              <p className="text-white/40 mt-4 max-w-lg mx-auto">
                {t("fortune.sectionDesc")}
              </p>
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
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.1} direction="up">
                <TiltCard glare={false} rotateX={4} rotateY={4} scale={1.02}>
                  <div className="card-glow p-6 h-full">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, si) => (
                        <Star key={si} size={14} className="text-gold fill-gold" />
                      ))}
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-4">"{t.text}"</p>
                    <div className="border-t border-white/10 pt-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold">
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{t.name}</div>
                        <div className="text-white/30 text-xs">{t.job}</div>
                      </div>
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
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-gold/60 text-sm tracking-[0.2em] uppercase">{t("faq.badge")}</span>
              <h2 className="section-title mt-3">{t("faq.title")}</h2>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {[
              {
                q: t("faq.q1"),
                a: t("faq.a1"),
              },
              {
                q: t("faq.q2"),
                a: t("faq.a2"),
              },
              {
                q: t("faq.q3"),
                a: t("faq.a3"),
              },
              {
                q: t("faq.q4"),
                a: t("faq.a4"),
              },
              {
                q: t("faq.q5"),
                a: t("faq.a5"),
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <AccordionItem question={item.q} answer={item.a} defaultOpen={i === 0} />
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
                <p className="text-white/50 mb-10 max-w-md mx-auto">
                  {t("cta.desc")}
                </p>
                <MagneticButton>
                  <Link
                    href="/reading/new"
                    className="btn-gold inline-flex items-center gap-2 text-lg px-12 py-5 group"
                  >
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
    </div>
  )
}
