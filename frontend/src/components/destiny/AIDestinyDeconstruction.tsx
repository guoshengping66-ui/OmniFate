"use client"
import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const SYSTEMS = [
  { id: "bazi", icon: "☰", labelZh: "八字", labelEn: "Bazi", color: "#C5A880", angle: -60 },
  { id: "astrology", icon: "✧", labelZh: "星盘", labelEn: "Astrology", color: "#5B9BD5", angle: -30 },
  { id: "face", icon: "◉", labelZh: "面相", labelEn: "Face", color: "#EC78A0", angle: 0 },
  { id: "palm", icon: "☯", labelZh: "手相", labelEn: "Palm", color: "#2D6A4F", angle: 30 },
  { id: "tarot", icon: "★", labelZh: "塔罗", labelEn: "Tarot", color: "#9B59B6", angle: 60 },
]

const AI_INSIGHTS = [
  { zh: "五行能量场共振分析", en: "Five-Element Energy Resonance" },
  { zh: "灵魂成长轨迹解码", en: "Soul Growth Trajectory Decode" },
  { zh: "行为模式深层映射", en: "Behavioral Pattern Deep Mapping" },
  { zh: "天赋潜能激活指数", en: "Talent Activation Index" },
  { zh: "人生节奏同步校准", en: "Life Rhythm Synchronization" },
]

export default function AIDestinyDeconstruction() {
  const { locale } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeInsight, setActiveInsight] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    const timer = setInterval(() => {
      setActiveInsight((prev) => (prev + 1) % AI_INSIGHTS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [isVisible])

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-36 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[#C5A880]/[0.02] blur-[180px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          className="text-center mb-16 sm:mb-24 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(40px)" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/[0.05] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
            <span className="text-[#C5A880]/70 text-xs tracking-[0.15em] uppercase">
              {locale === "zh" ? "AI 解构" : "AI Deconstruction"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-wide mb-5">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C5A880] via-[#E8D5B7] to-[#C5A880]">
              {locale === "zh" ? "AI 解构你的命盘" : "AI Deconstructs Your Chart"}
            </span>
          </h2>

          <p className="text-white/30 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {locale === "zh"
              ? "五大命理体系的数据汇入 AI 引擎，交叉验证后生成你独有的人生底层代码"
              : "Data from five destiny systems flows into the AI engine, cross-validated to generate your unique life code"}
          </p>
        </div>

        {/* Main visual: Systems → AI Core → Insights */}
        <div
          className="relative flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 transition-all duration-1000 delay-300"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          {/* Left: 5 System nodes feeding into center */}
          <div className="relative w-[300px] h-[340px] sm:w-[360px] sm:h-[400px] flex-shrink-0">
            {/* Connection lines to center */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 400">
              {SYSTEMS.map((sys, i) => {
                const startX = 180 + Math.cos((sys.angle * Math.PI) / 180) * 130
                const startY = 200 + Math.sin((sys.angle * Math.PI) / 180) * 130
                return (
                  <line
                    key={sys.id}
                    x1={startX}
                    y1={startY}
                    x2="180"
                    y2="200"
                    stroke={sys.color}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity={isVisible ? 0.3 : 0}
                    style={{ transition: `opacity 1s ease ${0.5 + i * 0.15}s` }}
                  />
                )
              })}
            </svg>

            {/* System nodes */}
            {SYSTEMS.map((sys, i) => {
              const x = 50 + Math.cos((sys.angle * Math.PI) / 180) * 36
              const y = 50 + Math.sin((sys.angle * Math.PI) / 180) * 33
              return (
                <div
                  key={sys.id}
                  className="absolute transition-all duration-700"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: "translate(-50%, -50%)",
                    opacity: isVisible ? 1 : 0,
                    transitionDelay: `${0.3 + i * 0.12}s`,
                  }}
                >
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-500 hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${sys.color}18, ${sys.color}08)`,
                      border: `1px solid ${sys.color}30`,
                      boxShadow: `0 0 24px ${sys.color}15`,
                    }}
                  >
                    <span className="text-xl sm:text-2xl" style={{ color: sys.color }}>{sys.icon}</span>
                    <span className="text-[9px] sm:text-[10px] font-medium" style={{ color: `${sys.color}aa` }}>
                      {locale === "zh" ? sys.labelZh : sys.labelEn}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Center: AI Core */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
              style={{ transitionDelay: "0.8s", opacity: isVisible ? 1 : 0 }}
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                {/* Pulsing rings */}
                <div className="absolute inset-0 rounded-full border border-[#C5A880]/20 animate-ping" style={{ animationDuration: "3s" }} />
                <div className="absolute inset-2 rounded-full border border-[#C5A880]/15 animate-ping" style={{ animationDuration: "4s", animationDelay: "0.5s" }} />
                {/* Core */}
                <div
                  className="absolute inset-0 rounded-full flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(197,168,128,0.08) 60%, transparent 80%)",
                    border: "1px solid rgba(197,168,128,0.3)",
                    boxShadow: "0 0 40px rgba(212,175,55,0.15), inset 0 0 30px rgba(212,175,55,0.1)",
                  }}
                >
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl">✦</div>
                    <div className="text-[8px] sm:text-[9px] text-[#C5A880]/70 tracking-[0.2em] uppercase mt-1">AI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI Insights output */}
          <div className="flex-1 max-w-md">
            <div className="space-y-4">
              {AI_INSIGHTS.map((insight, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-500"
                  style={{
                    background: activeInsight === i
                      ? "linear-gradient(135deg, rgba(197,168,128,0.08), rgba(197,168,128,0.02))"
                      : "rgba(255,255,255,0.01)",
                    border: activeInsight === i
                      ? "1px solid rgba(197,168,128,0.2)"
                      : "1px solid rgba(255,255,255,0.04)",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateX(0)" : "translateX(30px)",
                    transitionDelay: `${0.6 + i * 0.1}s`,
                  }}
                >
                  {/* Step indicator */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500"
                    style={{
                      background: activeInsight === i
                        ? "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(197,168,128,0.1))"
                        : "rgba(255,255,255,0.03)",
                      border: activeInsight === i
                        ? "1px solid rgba(212,175,55,0.3)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      className="text-xs font-mono font-bold transition-colors duration-500"
                      style={{ color: activeInsight === i ? "#D4AF37" : "rgba(255,255,255,0.2)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium transition-colors duration-500 truncate"
                      style={{ color: activeInsight === i ? "#C5A880" : "rgba(255,255,255,0.3)" }}
                    >
                      {locale === "zh" ? insight.zh : insight.en}
                    </div>
                  </div>

                  {/* Active indicator */}
                  {activeInsight === i && (
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Confidence bar */}
            <div className="mt-8 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/30 text-[10px] tracking-wider uppercase">
                  {locale === "zh" ? "交叉验证置信度" : "Cross-Validation Confidence"}
                </span>
                <span className="text-[#C5A880] text-xs font-bold">97.3%</span>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-[2s] ease-out"
                  style={{
                    width: isVisible ? "97.3%" : "0%",
                    background: "linear-gradient(90deg, #C5A880, #D4AF37)",
                    transitionDelay: "1.5s",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes dataStream {
          0% { opacity: 0; transform: translateY(-20px); }
          50% { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(20px); }
        }
      `}</style>
    </section>
  )
}
