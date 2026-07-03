"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const FEATURES = {
  zh: [
    { num: "01", label: "八字", sub: "命盘", href: "/bazi" },
    { num: "02", label: "紫微", sub: "斗数", href: "/ziwei" },
    { num: "03", label: "星盘", sub: "解读", href: "/astrology" },
    { num: "04", label: "塔罗", sub: "占卜", href: "/tarot" },
  ],
  en: [
    { num: "01", label: "Bazi", sub: "Chart", href: "/bazi" },
    { num: "02", label: "Ziwei", sub: "Stars", href: "/ziwei" },
    { num: "03", label: "Astro", sub: "Read", href: "/astrology" },
    { num: "04", label: "Tarot", sub: "Draw", href: "/tarot" },
  ],
}

const COPY = {
  zh: {
    name: "观我",
    tagline: "AI 命运画像 · 每日行动系统",
    desc: "八字、紫微、星盘、塔罗、面相与手相信号，整合成持续更新的 AI 自我画像。每天给你趋势、提醒和一条可执行行动。",
    cta: "开始分析",
    status: "今日宜行动",
    email: "hello@khanfate.com",
  },
  en: {
    name: "Guanwo",
    tagline: "AI Destiny Profile · Daily Action System",
    desc: "Bazi, Ziwei, astrology, tarot, face and palm signals become a living AI self-knowledge profile. Every day you get trends, warnings, and one practical action.",
    cta: "Start Reading",
    status: "Ready for action",
    email: "hello@khanfate.com",
  },
}

export function MinimalHero() {
  const { locale, localeHref } = useLanguage()
  const isZh = locale === "zh"
  const copy = isZh ? COPY.zh : COPY.en
  const features = isZh ? FEATURES.zh : FEATURES.en

  const [activeIndex, setActiveIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [time, setTime] = useState("")
  const [revealed, setRevealed] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)

  // Live clock — CNS timezone
  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("zh-CN", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Shanghai",
        })
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    if (heroRef.current) observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  // ESC to close menu
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const navItems = [
    { num: "01", label: isZh ? "八字" : "Bazi", href: "/bazi" },
    { num: "02", label: isZh ? "紫微" : "Ziwei", href: "/ziwei" },
    { num: "03", label: isZh ? "星盘" : "Astro", href: "/astrology" },
    { num: "04", label: isZh ? "塔罗" : "Tarot", href: "/tarot" },
    { num: "05", label: isZh ? "面相" : "Face", href: "/face-reading" },
  ]

  return (
    <main ref={heroRef} className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* ═══ Constellation Background ═══ */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        {/* Star dots */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.3) 0 0.5px, transparent 1px), radial-gradient(circle, rgba(201,168,76,0.12) 0 0.5px, transparent 1px)",
            backgroundPosition: "0 0, 40px 60px",
            backgroundSize: "100px 100px, 150px 150px",
            maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          }}
        />
        {/* Constellation lines SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 1440 900" preserveAspectRatio="none">
          {[[100,200,300,150],[400,100,600,250],[800,180,1000,120],[200,500,500,400],[700,450,1100,350],[1300,200,1400,300],[50,700,250,600],[500,650,800,700],[1000,600,1300,550]].map(([x1,y1,x2,y2],i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(201,168,76,0.3)" strokeWidth="0.5" />
          ))}
        </svg>
      </div>

      {/* ═══ Navbar ═══ */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-[1340px] items-center justify-between py-9 px-4 md:py-8 md:px-5">
          {/* Desktop nav (md+) */}
          <nav className="hidden md:flex items-center gap-5 xl:gap-6" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.num}
                href={localeHref(item.href)}
                className="nav-link group flex items-baseline gap-1"
              >
                <span className="text-[8px] leading-3 font-medium uppercase text-white/50">
                  {item.num}
                </span>
                <span className="nav-link-label text-xs leading-4 font-medium uppercase text-white/80">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Mobile nav (3 items only) */}
          <nav className="flex md:hidden items-center gap-3" aria-label="Main navigation">
            {navItems.slice(0, 3).map((item) => (
              <Link key={item.num} href={localeHref(item.href)} className="flex items-baseline gap-0.5">
                <span className="text-[8px] leading-3 text-white/50">{item.num}</span>
                <span className="text-[11px] leading-4 font-medium uppercase text-white/80">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: email + clock (md+) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-white/80">
            <a href={`mailto:${copy.email}`} className="hover:text-gold transition-colors">
              {copy.email}
            </a>
            <span className="text-white/50" aria-label="China Standard Time" role="status">
              CNS {time}
            </span>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white/80 p-1"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-[420ms] ease-out ${
            menuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-3 px-4 pb-6">
            {navItems.map((item) => (
              <Link
                key={item.num}
                href={localeHref(item.href)}
                onClick={() => setMenuOpen(false)}
                className="text-[28px] leading-8 font-medium text-white/80 hover:text-gold transition-colors"
              >
                <span className="text-white/30 mr-2">{item.num}</span>
                {item.label}
              </Link>
            ))}
            <a href={`mailto:${copy.email}`} className="text-sm text-white/40 mt-2">
              {copy.email}
            </a>
          </div>
        </div>
      </header>

      {/* ═══ Hero Content ═══ */}
      <div className="relative z-[2] mx-auto flex max-w-[1340px] flex-col justify-end gap-[120px] pt-[160px] px-4 md:gap-[150px] md:pt-[190px] md:px-5">

        {/* Section 1: Feature Switcher + Status */}
        <div className="flex flex-col gap-7 md:flex-row">
          {/* Feature buttons */}
          <div className="flex-[4] flex flex-wrap gap-x-6 gap-y-3 md:gap-x-8">
            {features.map((f, i) => (
              <button
                key={f.num}
                onClick={() => setActiveIndex(i)}
                className={`group flex items-baseline gap-1.5 transition-all duration-300 hover:translate-x-1 ${
                  i === activeIndex ? "opacity-100" : "opacity-55 hover:opacity-75"
                }`}
              >
                <span className="text-[8px] leading-3 font-medium uppercase text-white/50">{f.num}</span>
                <span
                  className="text-xs leading-4 font-medium uppercase transition-colors duration-300"
                  style={{ color: i === activeIndex ? "#C9A84C" : "white" }}
                >
                  {f.label}
                </span>
                <span className="hidden lg:inline text-[10px] leading-3 text-white/30">{f.sub}</span>
              </button>
            ))}
          </div>

          {/* Status dot */}
          <div className="flex-1 flex items-center gap-3">
            <span className="dot-pulse inline-block h-[7px] w-[7px] rounded-full" aria-hidden="true" />
            <span className="text-xs font-medium text-white/80">{copy.status}</span>
          </div>
        </div>

        {/* Section 2: Name + CTA */}
        <div className="flex flex-col items-start gap-8 pb-11 md:flex-row md:items-end md:gap-7 md:pb-[60px]">
          {/* Giant name */}
          <div className="flex-[2]">
            <h1
              className="font-display font-bold uppercase text-[clamp(68px,18vw,200px)] leading-[0.85] tracking-[-0.03em] md:text-[130px] md:leading-[0.87] xl:text-[200px] xl:leading-[0.81]"
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translateY(0)" : "translateY(80px)",
                transition: "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {copy.name}
              <span style={{ color: "#C9A84C" }}>.</span>
            </h1>
          </div>

          {/* Description + CTA */}
          <div
            className="flex-1 md:pl-6 xl:pl-[50px]"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateX(0)" : "translateX(100px)",
              transition: "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <p className="text-sm md:text-base leading-relaxed font-medium text-white/60 max-w-[420px]">
              {copy.desc}
            </p>

            <div
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translateX(0)" : "translateX(100px)",
                transition: "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.08s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.08s",
              }}
            >
              <Link
                href={localeHref("/reading/new")}
                className="btn-fill group relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/30 px-8 py-3 text-sm font-medium lowercase text-white transition-colors duration-500 hover:border-[#C9A84C] hover:text-black"
              >
                <span className="relative z-[1]">{copy.cta}</span>
                <span className="relative z-[1] ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}
