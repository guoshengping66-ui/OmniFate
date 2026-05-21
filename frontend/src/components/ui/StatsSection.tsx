"use client"
import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { CountUpNumber } from "@/components/ui/CountUpNumber"

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

export function StatsSection() {
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
