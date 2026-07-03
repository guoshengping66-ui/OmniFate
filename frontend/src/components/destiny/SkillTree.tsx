"use client"
import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const NODES = [
  { key: "wealth", label: "wealth", icon: "💰", x: 50, y: 15, color: "#C5A880", score: 85 },
  { key: "career", label: "career", icon: "💼", x: 85, y: 35, color: "#2D6A4F", score: 92 },
  { key: "love", label: "relationship", icon: "💕", x: 80, y: 70, color: "#C1121F", score: 68 },
  { key: "health", label: "health", icon: "🏥", x: 50, y: 85, color: "#2980B9", score: 78 },
  { key: "family", label: "spirit", icon: "✨", x: 20, y: 70, color: "#9B59B6", score: 88 },
  { key: "growth", label: "growth", icon: "🌱", x: 15, y: 35, color: "#E8D5B7", score: 75 },
]

const CONNECTIONS = NODES.map((_, i) => [i, (i + 1) % NODES.length])

export default function SkillTree() {
  const { t } = useLanguage()
  const [activeNode, setActiveNode] = useState<number | null>(null)
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
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center py-32 px-4"
      style={{ background: "#080808" }}
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* Section header */}
        <div
          className="text-center mb-20 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          <span className="text-[#C5A880]/50 text-xs tracking-[0.4em] uppercase font-medium">
            {t("report.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-4 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {t("report.title")}
            </span>
          </h2>
          <p className="text-parchment-400 text-sm max-w-lg mx-auto">{t("report.desc")}</p>
        </div>

        {/* Skill tree visualization */}
        <div
          className="relative w-full aspect-square max-w-[600px] mx-auto transition-all duration-1000 delay-300"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {CONNECTIONS.map(([from, to], i) => (
              <line
                key={i}
                x1={NODES[from].x}
                y1={NODES[from].y}
                x2={NODES[to].x}
                y2={NODES[to].y}
                stroke="#C5A880"
                strokeWidth="0.15"
                opacity={isVisible ? 0.2 : 0}
                style={{ transition: `opacity 0.8s ease ${0.5 + i * 0.1}s` }}
              />
            ))}
            {/* Lines to center */}
            {NODES.map((node, i) => (
              <line
                key={`center-${i}`}
                x1={node.x}
                y1={node.y}
                x2={50}
                y2={50}
                stroke="#C5A880"
                strokeWidth="0.1"
                opacity={isVisible ? 0.1 : 0}
                strokeDasharray="1 2"
                style={{ transition: `opacity 1s ease ${0.8 + i * 0.1}s` }}
              />
            ))}
          </svg>

          {/* Center node */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-700"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.5)",
            }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
              style={{
                background: "linear-gradient(135deg, rgba(197,168,128,0.15), rgba(197,168,128,0.05))",
                border: "1px solid rgba(197,168,128,0.25)",
                boxShadow: "0 0 40px rgba(197,168,128,0.1)",
              }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(197,168,128,0.2), rgba(197,168,128,0.08))",
                  border: "1px solid rgba(197,168,128,0.3)",
                }}
              >
                <span className="text-lg font-serif text-[#C5A880]">命</span>
              </div>
            </div>
          </div>

          {/* Orbital nodes */}
          {NODES.map((node, i) => (
            <div
              key={node.key}
              className="absolute z-10 cursor-pointer transition-all duration-700"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
                opacity: isVisible ? 1 : 0,
                transitionDelay: `${0.3 + i * 0.1}s`,
              }}
              onClick={() => setActiveNode(activeNode === i ? null : i)}
            >
              <div
                className="relative group"
                style={{
                  transform: `scale(${activeNode === i ? 1.15 : 1})`,
                  transition: "transform 0.3s ease",
                }}
              >
                {/* Glow ring */}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-500"
                  style={{
                    boxShadow: activeNode === i
                      ? `0 0 30px ${node.color}40, 0 0 60px ${node.color}20`
                      : "none",
                  }}
                />
                {/* Node circle */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: activeNode === i
                      ? `linear-gradient(135deg, ${node.color}25, ${node.color}10)`
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${activeNode === i ? node.color + "50" : "rgba(255,255,255,0.08)"}`,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span className="text-xl">{node.icon}</span>
                </div>
                {/* Label */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs text-parchment-400 tracking-wider uppercase">
                    {t(`report.${node.label}`)}
                  </span>
                </div>
                {/* Score */}
                {activeNode === i && (
                  <div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
                    style={{
                      background: `${node.color}20`,
                      border: `1px solid ${node.color}40`,
                      color: node.color,
                    }}
                  >
                    {node.score}/100
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
