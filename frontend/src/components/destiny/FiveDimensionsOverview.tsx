"use client"

import { useEffect, useRef, useState } from "react"
import { Brain, Compass, Crosshair, Route, TimerReset } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const COPY = {
  zh: {
    badge: "Five-Dimension Growth Engine",
    title: "五个维度，不是堆料，是交叉验证",
    desc: "普通命理产品只给解释。成长命盘把稳定天赋、长期路径、当前卡点、行动时机和成长处方合成一个可执行系统。",
    demo: "* 示例数据。真实分数会在分析完成后由你的档案生成。",
    items: [
      { key: "base", title: "天赋底盘", desc: "你天然如何驱动自己，适合用什么方式创造价值。", score: 86, color: "#C5A880", icon: Brain },
      { key: "route", title: "人生主线", desc: "把长期方向从泛泛预测变成可选择的成长路径。", score: 82, color: "#2D6A4F", icon: Compass },
      { key: "block", title: "当前卡点", desc: "识别最近反复消耗你的情绪、关系或事业模式。", score: 74, color: "#C1121F", icon: Crosshair },
      { key: "timing", title: "行动时机", desc: "判断未来 7 天、30 天、90 天更适合推进还是调整。", score: 79, color: "#2980B9", icon: TimerReset },
      { key: "prescription", title: "成长处方", desc: "输出本周行动、30 天路线和下一次复盘问题。", score: 91, color: "#9B59B6", icon: Route },
    ],
    validation: "系统会标注哪些结论被多个维度支持，哪些结论存在冲突，需要通过后续复盘校准。",
  },
  en: {
    badge: "Five-Dimension Growth Engine",
    title: "Five dimensions, cross-checked for action",
    desc: "Most destiny tools explain. A growth chart combines stable talent, long-term direction, current blockage, timing, and prescription into an executable system.",
    demo: "* Demo data. Your actual scores appear after analysis.",
    items: [
      { key: "base", title: "Talent Base", desc: "How you naturally move, decide, and create value.", score: 86, color: "#C5A880", icon: Brain },
      { key: "route", title: "Life Direction", desc: "Turns broad prediction into a growth path you can choose.", score: 82, color: "#2D6A4F", icon: Compass },
      { key: "block", title: "Current Blockage", desc: "Names the emotional, relational, or career pattern draining you now.", score: 74, color: "#C1121F", icon: Crosshair },
      { key: "timing", title: "Timing", desc: "Shows when to push, pause, or recalibrate across 7, 30, and 90 days.", score: 79, color: "#2980B9", icon: TimerReset },
      { key: "prescription", title: "Growth Prescription", desc: "Produces this week's action, a 30-day route, and reflection prompts.", score: 91, color: "#9B59B6", icon: Route },
    ],
    validation: "The system separates conclusions supported by multiple dimensions from conflicts that need later reflection.",
  },
} as const

function PentagonRadar({ size = 280, scores, colors }: { size?: number; scores: number[]; colors: string[] }) {
  const [animate, setAnimate] = useState(false)
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.34
  const labelRadius = size * 0.46

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 300)
    return () => clearTimeout(timer)
  }, [])

  function vertex(i: number, r: number) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  function pentagon(r: number) {
    return Array.from({ length: 5 }, (_, i) => {
      const v = vertex(i, r)
      return `${v.x},${v.y}`
    }).join(" ")
  }

  const values = scores.map(score => score / 100)
  const dataPoints = Array.from({ length: 5 }, (_, i) => {
    const v = vertex(i, radius * values[i])
    return `${v.x},${v.y}`
  }).join(" ")

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {Array.from({ length: 5 }, (_, li) => {
        const r = (radius * (li + 1)) / 5
        return <polygon key={li} points={pentagon(r)} fill="none" stroke="#C5A880" strokeOpacity={0.04 + 0.04 * li} strokeWidth={0.5} />
      })}
      {Array.from({ length: 5 }, (_, i) => {
        const v = vertex(i, radius)
        return <line key={i} x1={cx} y1={cy} x2={v.x} y2={v.y} stroke="#C5A880" strokeOpacity={0.1} strokeWidth={0.5} />
      })}
      <polygon
        points={dataPoints}
        fill="rgba(197,168,128,0.12)"
        stroke="#C5A880"
        strokeWidth={1.5}
        strokeOpacity={0.6}
        style={{
          transition: "all 1s ease-out",
          transformOrigin: `${cx}px ${cy}px`,
          transform: animate ? "scale(1)" : "scale(0)",
          opacity: animate ? 1 : 0,
        }}
      />
      {scores.map((score, i) => {
        const v = vertex(i, radius * values[i])
        const label = vertex(i, labelRadius)
        return (
          <g key={i}>
            <circle cx={v.x} cy={v.y} r={3} fill={colors[i]} style={{ transition: "all 1s ease-out 0.2s", opacity: animate ? 1 : 0 }} />
            <text x={label.x} y={label.y + 4} textAnchor="middle" fill={colors[i]} fontSize={11} fontWeight="bold" fontFamily="sans-serif">
              {score}
            </text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={2} fill="#C5A880" fillOpacity={0.3} />
    </svg>
  )
}

export default function FiveDimensionsOverview() {
  const { locale } = useLanguage()
  const copy = locale === "zh" ? COPY.zh : COPY.en
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={containerRef} className="relative px-4 py-16 md:py-32" style={{ background: "#080808" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C5A880]/[0.02] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div
          className="mb-16 text-center transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          <span className="text-xs font-medium uppercase tracking-[0.4em] text-[#C5A880]/50">{copy.badge}</span>
          <h2 className="mb-4 mt-4 font-serif text-3xl font-bold tracking-normal md:text-5xl">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {copy.title}
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/34">{copy.desc}</p>
          <p className="mt-2 text-[11px] italic text-white/20">{copy.demo}</p>
        </div>

        <div
          className="grid items-center gap-6 transition-all delay-300 duration-1000 md:grid-cols-2 md:gap-12"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(20px)" }}
        >
          <div className="flex justify-center">
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur">
              <PentagonRadar scores={copy.items.map(item => item.score)} colors={copy.items.map(item => item.color)} />
              <p className="mx-auto mt-2 max-w-xs text-center text-xs leading-relaxed text-white/34">{copy.validation}</p>
            </div>
          </div>

          <div className="space-y-3">
            {copy.items.map((dim, i) => {
              const Icon = dim.icon
              return (
                <div
                  key={dim.key}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-500"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateX(0)" : "translateX(30px)",
                    transitionDelay: `${0.4 + i * 0.1}s`,
                  }}
                >
                  <div className="absolute bottom-3 left-0 top-3 w-[2px] rounded-full transition-all duration-500" style={{ background: `${dim.color}60` }} />
                  <div className="flex items-start gap-4 pl-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-105" style={{ background: `${dim.color}12`, border: `1px solid ${dim.color}25` }}>
                      <Icon size={18} style={{ color: dim.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <h3 className="font-serif text-sm font-bold" style={{ color: dim.color }}>{dim.title}</h3>
                        <span className="font-mono text-xs font-bold" style={{ color: dim.color }}>{dim.score}/100</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-white/34">{dim.desc}</p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.04]">
                        <div
                          className="h-full rounded-full transition-all delay-500 duration-1000"
                          style={{
                            width: isVisible ? `${dim.score}%` : "0%",
                            background: `linear-gradient(90deg, ${dim.color}44, ${dim.color})`,
                            transitionDelay: `${0.6 + i * 0.15}s`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
