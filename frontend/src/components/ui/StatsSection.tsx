"use client"
import { useRef, useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

function CountUp({ end, duration = 2.5, suffix = "", prefix = "" }: {
  end: number; duration?: number; suffix?: string; prefix?: string
}) {
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { rootMargin: "-60px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = (now - start) / (duration * 1000)
      if (elapsed >= 1) {
        setValue(end)
        return
      }
      setValue(Math.floor(end * elapsed))
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, end, duration])

  return (
    <span ref={ref}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  )
}

function StatCard({ end, suffix, prefix, label, delay, duration }: {
  end: number; suffix?: string; prefix?: string; label: string; delay: number; duration?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "-80px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.9)",
        transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
      }}
    >
      <div className="text-2xl md:text-3xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
        <CountUp end={end} duration={duration || 2.5} suffix={suffix} prefix={prefix} />
      </div>
      <div className="text-xs md:text-xs text-parchment-400 mt-1.5 tracking-wider font-medium">{label}</div>
      {/* Gold accent line */}
      <div
        className="w-8 h-0.5 bg-gold/30 rounded-full mx-auto mt-2 origin-center"
        style={{
          transform: visible ? "scaleX(1)" : "scaleX(0)",
          transition: `transform 0.8s ease-out ${delay + 0.3}s`,
        }}
      />
    </div>
  )
}

export function StatsSection() {
  const { t } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "-60px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const stats = [
    { end: 12000, suffix: "+", label: t("hero.stat1") },
    { end: 98, suffix: ".7%", label: t("hero.stat2") },
    { end: 5, label: t("hero.stat3") },
    { end: 40, suffix: "s", label: t("hero.stat4"), prefix: "<" },
  ]

  return (
    <div
      ref={ref}
      className="mt-16"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease-out",
      }}
    >
      {/* Top decorative line */}
      <div
        className="w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-8 origin-center"
        style={{
          transform: visible ? "scaleX(1)" : "scaleX(0)",
          transition: "transform 1.2s ease-out",
        }}
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
      <div
        className="w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-8 origin-center"
        style={{
          transform: visible ? "scaleX(1)" : "scaleX(0)",
          transition: "transform 1.2s ease-out 0.5s",
        }}
      />
    </div>
  )
}
