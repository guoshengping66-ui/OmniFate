"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, Star } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { MilkyWayBackground } from "@/components/brand/MilkyWayBackground"
import { BaguaOrbit } from "@/components/brand/BaguaOrbit"

const CLASSICS = [
  "《周易》", "《滴天髓》", "《三命通会》", "《子平真诠》",
  "《穷通宝鉴》", "《渊海子平》", "《紫微斗数全书》", "《果老星宗》",
  "《增删卜易》", "《卜筮正宗》", "《六壬大全》", "《烟波钓叟歌》",
]

const FEATURES = {
  zh: [
    { char: "命", title: "八字排盘", desc: "录入生辰，按古法自动起盘排柱", href: "/bazi", free: true },
    { char: "紫", title: "紫微斗数", desc: "十二宫排盘，看主星四化与大限流年", href: "/ziwei", free: true },
    { char: "卦", title: "六爻起卦", desc: "依《增删卜易》《卜筮正宗》参详卦象", href: "/divination", free: false },
    { char: "星", title: "星盘解读", desc: "七政四余 · 恒星制，以二十八宿论命格", href: "/astrology", free: true },
    { char: "缘", title: "八字合盘", desc: "两盘对照，参看缘分契合与互补", href: "/bazi/compatibility", free: true },
    { char: "面", title: "面相分析", desc: "五官十二宫，看先天禀赋与后天运势", href: "/face-reading", free: false },
  ],
  en: [
    { char: "命", title: "Bazi Chart", desc: "Ancient method birth chart calculation", href: "/bazi", free: true },
    { char: "紫", title: "Ziwei Stars", desc: "12 palaces, main stars, and decade luck", href: "/ziwei", free: true },
    { char: "卦", title: "Hexagram", desc: "I Ching divination with classical commentary", href: "/divination", free: false },
    { char: "星", title: "Astrology", desc: "28 lunar mansions, sidereal chart reading", href: "/astrology", free: true },
    { char: "缘", title: "Synastry", desc: "Two charts compared for compatibility", href: "/bazi/compatibility", free: true },
    { char: "面", title: "Face Reading", desc: "12 palace facial feature analysis", href: "/face-reading", free: false },
  ],
}

const COPY = {
  zh: {
    brand: "观我",
    sub: "AETHER POUCH",
    tagline: "古籍为根 · AI 参详",
    desc: "《周易》《滴天髓》《三命通会》原文为根，AI 逐句参详，专业克制，按次计费，不订阅",
    primaryCTA: "开始排盘",
    secondaryCTA: "六爻起卦",
    marqueeLabel: "古籍为根 · 逐句可溯源",
    stats: [
      { num: "8+", label: "大推演模块" },
      { num: "4", label: "维交互模式" },
      { num: "50", label: "注册即赠灵签" },
      { num: "0", label: "月费订阅" },
    ],
    featureTitle: "核心功能",
    featureDesc: "每一句解读都引自古籍原文，可溯源、不空谈、千人千面",
    flagship: {
      char: "参",
      title: "三术合参",
      badge: "旗舰 · 三盘互证",
      free: "概览免费",
      desc: "八字 × 紫微 × 七政三盘互证 — 信度分级的旗舰整合解读",
    },
    ctaSection: {
      title: "注册即赠",
      highlight: "50",
      suffix: "灵签",
      desc: "按次计费，无订阅，充值额外赠 15%",
      btn: "免费注册",
    },
    pwa: {
      title: "随身携带你的",
      highlight: "观我",
      desc: "添加到手机桌面，像原生 App 一样随时打开。无需下载，无需应用商店，一键直达",
    },
  },
  en: {
    brand: "Guanwo",
    sub: "AETHER POUCH",
    tagline: "Classical Roots · AI Insight",
    desc: "Anchored in I Ching, Di Tian Sui, and San Ming Tong Hui. AI-powered line-by-line analysis. Pay-per-use, no subscription.",
    primaryCTA: "Start Reading",
    secondaryCTA: "Cast Hexagram",
    marqueeLabel: "Rooted in classical texts · Every line traceable",
    stats: [
      { num: "8+", label: "Divination Systems" },
      { num: "4", label: "Interaction Modes" },
      { num: "50", label: "Free Tokens" },
      { num: "0", label: "Monthly Fee" },
    ],
    featureTitle: "Core Features",
    featureDesc: "Every interpretation cites the original text. Traceable, grounded, and uniquely yours.",
    flagship: {
      char: "参",
      title: "Tri-Reading",
      badge: "Flagship · Triple Cross-Check",
      free: "Preview Free",
      desc: "Bazi × Ziwei × Astrology — three systems, one integrated portrait with confidence scoring.",
    },
    ctaSection: {
      title: "Sign up and get",
      highlight: "50",
      suffix: "Tokens",
      desc: "Pay-per-use. No subscription. Get 15% extra on every top-up.",
      btn: "Sign Up Free",
    },
    pwa: {
      title: "Take",
      highlight: "Guanwo",
      desc: "Add to your home screen. Works like a native app — no download, no app store, one tap.",
    },
  },
}

export function GalaxyHomeExperience() {
  const { locale, localeHref } = useLanguage()
  const isZh = locale === "zh"
  const copy = isZh ? COPY.zh : COPY.en
  const features = isZh ? FEATURES.zh : FEATURES.en

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* ═══ Background Layers ═══ */}
      <MilkyWayBackground />
      <BaguaOrbit />

      {/* ═══ Hero Section ═══ */}
      <section className="relative z-[2] flex min-h-[88vh] w-full flex-col items-center justify-center px-6 text-center">
        {/* Gold foil heading */}
        <div className="relative">
          <h1 className="font-display text-8xl font-bold text-gold md:text-9xl"
            style={{
              background: "linear-gradient(180deg, #E8CB7A 0%, #C9A84C 40%, #A07C2A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              filter: "drop-shadow(0 0 30px rgba(201,168,76,0.3))",
            }}
          >
            {copy.brand}
          </h1>
          <p className="mt-4 text-sm tracking-[0.1em] text-gold/50">{copy.sub}</p>
        </div>

        {/* Tagline + desc */}
        <div className="mt-9">
          <p className="font-display text-xl text-parchment-100/85">{copy.tagline}</p>
          <div className="mx-auto mt-4 h-px w-48 bg-gradient-to-r from-transparent via-stellar-blue/30 to-transparent" />
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-parchment-300/60">
            {copy.desc}
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-11 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href={localeHref("/reading/new")}
            className="group relative rounded-xl bg-gold px-9 py-3.5 font-medium text-cosmos-950 shadow-lg shadow-black/40 transition-all hover:shadow-xl hover:shadow-gold/20 hover:bg-gold-light"
          >
            <span className="relative z-[1] flex items-center gap-2">
              {copy.primaryCTA}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href={localeHref("/divination")}
            className="group relative rounded-xl border border-parchment-300/30 px-9 py-3.5 text-parchment-100/90 transition-all hover:border-gold/50 hover:bg-gold/10 hover:text-gold"
          >
            <span className="relative z-[1] flex items-center gap-2">
              {copy.secondaryCTA}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 opacity-50">
          <div className="mx-auto h-8 w-5 rounded-full border border-parchment-300/25">
            <div className="mx-auto mt-1.5 h-2 w-1 rounded-full bg-parchment-300/40 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══ Classics Marquee ═══ */}
      <section className="relative z-[2] border-b border-white/[0.04] py-7">
        <p className="mb-3 text-center text-xs tracking-[0.4em] text-parchment-300/35">{copy.marqueeLabel}</p>
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap text-[15px] text-gold/55 font-serif">
            {[...CLASSICS, ...CLASSICS].map((name, i) => (
              <span key={i} className="mx-3">{name}<span className="mx-2 text-gold/20">·</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Stats Row ═══ */}
      <section className="relative z-[2] mx-auto max-w-5xl px-6">
        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] md:grid-cols-4">
          {copy.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2 bg-[#030918] px-4 py-7">
              <span className="font-display text-4xl text-gold">{stat.num}</span>
              <span className="text-xs tracking-[0.18em] text-parchment-300/55">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Feature Cards ═══ */}
      <section className="relative z-[2] mx-auto max-w-5xl px-6">
        <h2 className="mt-24 text-center font-display text-3xl text-parchment-100">{copy.featureTitle}</h2>
        <div className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <p className="mt-4 text-center text-sm text-parchment-300/55">{copy.featureDesc}</p>

        {/* Flagship card */}
        <div className="mt-14">
          <Link
            href={localeHref("/reading/new")}
            className="group relative flex flex-col gap-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#060E24] to-[#030918] p-8 transition-all hover:border-gold/20 md:flex-row md:items-center md:gap-8 md:p-10"
          >
            <span className="inline-block self-start font-display text-6xl text-gold md:self-center">{copy.flagship.char}</span>
            <div className="flex-1 text-left">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-display text-2xl text-parchment-100">{copy.flagship.title}</h3>
                <span className="rounded-full bg-gold/[0.1] px-3 py-0.5 text-xs tracking-[0.12em] text-gold">{copy.flagship.badge}</span>
                <span className="rounded-full bg-white/[0.04] px-3 py-0.5 text-xs text-parchment-300/70">{copy.flagship.free}</span>
              </div>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-parchment-300/65">{copy.flagship.desc}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gold/70 transition-all group-hover:gap-3 group-hover:text-gold">
              <span>{isZh ? "了解更多" : "Learn more"}</span>
              <span>→</span>
            </div>
          </Link>
        </div>

        {/* Feature grid */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.title}
              href={localeHref(f.href)}
              className="group relative flex flex-col rounded-2xl border border-white/[0.05] bg-gradient-to-br from-[#060E24] to-[#030918] p-7 transition-all hover:border-gold/15 hover:-translate-y-1"
            >
              {f.free && (
                <span className="absolute right-4 top-4 rounded-full bg-gold/[0.1] px-3 py-0.5 text-xs text-gold">{isZh ? "免费" : "Free"}</span>
              )}
              <span className="inline-block self-start font-display text-4xl text-gold/80">{f.char}</span>
              <h3 className="mt-4 font-display text-xl text-parchment-100">{f.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-parchment-300/60">{f.desc}</p>
              <div className="mt-5 flex items-center gap-1.5 text-xs text-gold/60 transition-colors group-hover:text-gold">
                <span>{isZh ? "了解更多" : "Learn more"}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ Register CTA ═══ */}
      <section className="relative z-[2] mx-auto mt-24 max-w-2xl px-6 pb-20 text-center">
        <p className="font-display text-3xl text-parchment-100">
          {copy.ctaSection.title} <span className="text-gold">{copy.ctaSection.highlight}</span> {copy.ctaSection.suffix}
        </p>
        <p className="mt-3 text-sm text-parchment-300/60">{copy.ctaSection.desc}</p>
        <Link
          href={localeHref("/register")}
          className="group relative mt-10 inline-block rounded-xl bg-gold px-12 py-4 font-medium text-cosmos-950 transition-all hover:bg-gold-light hover:shadow-xl hover:shadow-gold/25"
        >
          <span className="relative z-[1]">{copy.ctaSection.btn}</span>
        </Link>
      </section>

      {/* ═══ PWA CTA ═══ */}
      <section className="relative z-[2] mx-auto max-w-2xl px-6 pb-20 text-center">
        <Star size={32} className="mx-auto mb-4 text-gold/40" />
        <h2 className="font-display text-2xl text-parchment-100">
          {copy.pwa.title} <span className="text-gold">{copy.pwa.highlight}</span>
        </h2>
        <p className="mt-3 max-w-sm mx-auto text-sm leading-relaxed text-parchment-300/45">{copy.pwa.desc}</p>
        <p className="mt-6 text-xs text-parchment-300/30">{isZh ? "使用手机浏览器访问本页，即可添加到桌面" : "Open this page in mobile browser to add to home screen"}</p>
      </section>

    </main>
  )
}
