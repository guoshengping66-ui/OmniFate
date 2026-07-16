"use client"
import { useRef, useEffect, useState, useMemo } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

/* ═══════════════════════════════════════════════════════════════════
   HeroRouteBridge — Hero → Timeline 电影级转场

   设计：Hero 淡出后，金色能量流从上至下倾泻，
   配合浮动文字 "AI 正在构建你的命运星图"，
   最终汇入 AI 解构命盘 section。
   ═══════════════════════════════════════════════════════════════════ */

interface Particle {
  key: string
  x: number
  delay: number
  speed: number
  size: number
  drift: number
}

export default function EnergyBridge() {
  const { locale } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [, setScrollProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const onScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 = top of section at bottom of viewport, 1 = bottom of section at top of viewport
      const progress = Math.max(0, Math.min(1, 1 - (rect.top / vh)))
      setScrollProgress(progress)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [visible])

  // Generate particles (memoized)
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      key: `ep-${i}`,
      x: 15 + Math.random() * 70,
      delay: Math.random() * 4,
      speed: 2 + Math.random() * 3,
      size: 2 + Math.random() * 3,
      drift: (Math.random() - 0.5) * 20,
    }))
  }, [])

  // Energy stream positions
  const streams = useMemo(() => [
    { x: 20, opacity: 0.12, width: 2, delay: 0 },
    { x: 40, opacity: 0.08, width: 1.5, delay: 0.3 },
    { x: 60, opacity: 0.15, width: 2.5, delay: 0.1 },
    { x: 80, opacity: 0.06, width: 1, delay: 0.5 },
  ], [])

  return (
    <div
      ref={ref}
      className="relative overflow-hidden pointer-events-none"
      style={{ height: "280px" }}
    >
      {/* ── Background: deep space fade ── */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, transparent 0%, rgba(5,8,22,0.3) 40%, rgba(5,8,22,0.6) 100%)",
      }} />

      {/* ── Central glow aura ── */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[600px] h-full" style={{
        background: "radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.06) 0%, transparent 70%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 1.5s ease-out",
      }} />

      {/* ── Energy streams (vertical golden lines) ── */}
      {streams.map((s, i) => (
        <div
          key={i}
          className="absolute top-0 h-full"
          style={{
            left: `${s.x}%`,
            width: `${s.width}px`,
            background: `linear-gradient(to bottom, rgba(212,175,55,${s.opacity}) 0%, rgba(197,168,128,${s.opacity * 0.5}) 50%, rgba(197,168,128,${s.opacity * 0.15}) 100%)`,
            opacity: visible ? 1 : 0,
            transition: `opacity 1s ease-out ${s.delay}s`,
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* ── Glow halos around streams ── */}
      {streams.map((s, i) => (
        <div
          key={`glow-${i}`}
          className="absolute top-0 h-full"
          style={{
            left: `${s.x}%`,
            width: `${s.width * 8}px`,
            transform: "translateX(-50%)",
            background: `linear-gradient(to bottom, rgba(212,175,55,${s.opacity * 0.3}) 0%, transparent 60%)`,
            filter: "blur(8px)",
            opacity: visible ? 1 : 0,
            transition: `opacity 1.2s ease-out ${s.delay + 0.3}s`,
          }}
        />
      ))}

      {/* ── Cascading particles ── */}
      {visible && particles.map((p) => (
        <div
          key={p.key}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: "radial-gradient(circle, rgba(212,175,55,0.9) 0%, rgba(197,168,128,0.4) 50%, transparent 100%)",
            boxShadow: "0 0 6px rgba(212,175,55,0.4)",
            animation: `bridgeParticle ${p.speed}s ease-in infinite ${p.delay}s`,
            "--drift": `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* ── Floating text ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-center transition-all duration-[2000ms]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
            transitionDelay: "0.8s",
          }}
        >
          <div className="inline-flex items-center gap-3">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/30" />
            <span className="text-[#C5A880]/50 text-[11px] sm:text-xs tracking-[0.2em] uppercase font-medium">
              {locale === "zh" ? "AI 正在构建你的命运星图" : "AI Is Constructing Your Star Chart"}
            </span>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/30" />
          </div>
        </div>
      </div>

      {/* ── Bottom glow merge line ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{
        background: "linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.15) 30%, rgba(212,175,55,0.25) 50%, rgba(212,175,55,0.15) 70%, transparent 95%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 1.5s ease-out 1.2s",
        boxShadow: "0 0 20px rgba(212,175,55,0.1)",
      }} />

      <style jsx>{`
        @keyframes bridgeParticle {
          0% {
            transform: translateY(-15px) translateX(0);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(295px) translateX(var(--drift, 0px));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
