"use client"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { BAGUA_TRANSLATION, WUXING_TRANSLATION } from "@/lib/translations"

/**
 * Cyber-Metaphysics Hero Scene
 * Multi-layered rotating astrolabe + bagua with parallax and mouse tracking.
 * Pure CSS/SVG — no framer-motion required.
 */
export function HeroScene() {
  const { locale } = useLanguage()
  const isEn = locale === "en"
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    const handleScroll = () => setScrollY(window.scrollY)

    window.addEventListener("mousemove", handleMouse)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("mousemove", handleMouse)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const rotate = scrollY / 800 * 25
  const scaleVal = 1 - Math.min(scrollY / 800, 1) * 0.15
  const fadeOpacity = 1 - Math.min(scrollY / 600, 1) * 0.7

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        transform: `rotate(${rotate}deg) scale(${scaleVal})`,
        opacity: fadeOpacity,
      }}
    >
      {/* Layer 1: Outer glow ring */}
      <div className="absolute w-[420px] h-[420px] md:w-[520px] md:h-[520px] rounded-full bg-gradient-to-r from-gold/5 via-transparent to-gold/5 animate-pulse-slow" />

      {/* Layer 2: Rotating astrolabe (mouse tracking on parent, rotation via CSS animation) */}
      <div style={{ transform: `translate(${mouse.x}px, ${mouse.y}px)` }}>
        <svg
          width={380} height={380}
          viewBox="0 0 380 380"
          className="md:w-[480px] md:h-[480px] hero-rotate"
        >
          {/* Outer rings */}
          <circle cx="190" cy="190" r="180" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.25" />
          <circle cx="190" cy="190" r="170" fill="none" stroke="#C9A84C" strokeWidth="0.3" opacity="0.15" strokeDasharray="4 6" />

          {/* Zodiac / 24-solar ring */}
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 15 * Math.PI) / 180
            const r1 = 160
            const r2 = 175
            return (
              <line
                key={i}
                x1={190 + r1 * Math.cos(angle)}
                y1={190 + r1 * Math.sin(angle)}
                x2={190 + r2 * Math.cos(angle)}
                y2={190 + r2 * Math.sin(angle)}
                stroke="#C9A84C"
                strokeWidth="0.4"
                opacity="0.2"
              />
            )
          })}

          {/* 8 Trigrams */}
          {[
            { label: "乾", angle: 0 },    { label: "兑", angle: 45 },
            { label: "离", angle: 90 },   { label: "震", angle: 135 },
            { label: "巽", angle: 180 },  { label: "坎", angle: 225 },
            { label: "艮", angle: 270 },  { label: "坤", angle: 315 },
          ].map(({ label, angle }) => {
            const rad = (angle * Math.PI) / 180
            const r = 155
            const displayLabel = isEn ? BAGUA_TRANSLATION[label]?.pinyin || label : label
            return (
              <text
                key={label}
                x={190 + r * Math.cos(rad)}
                y={190 + r * Math.sin(rad)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#C9A84C"
                fontSize="14"
                fontWeight="bold"
                fontFamily="serif"
                opacity="0.35"
              >
                {displayLabel}
              </text>
            )
          })}

          {/* Inner Tai Chi */}
          <g transform="translate(190,190)">
            <circle cx="0" cy="0" r="60" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />
            <path
              d="M0,-60 A30,30 0 0,1 0,0 A30,30 0 0,0 0,60 A60,60 0 0,1 0,-60"
              fill="#C9A84C" opacity="0.15"
            />
            <circle cx="0" cy="-30" r="8" fill="#C9A84C" opacity="0.25" />
            <circle cx="0" cy="30" r="8" fill="#1A0F2E" opacity="0.5" />
          </g>
        </svg>
      </div>

      {/* Layer 3: Counter-rotating inner ring */}
      <div style={{ transform: `translate(${mouse.x}px, ${mouse.y}px)` }}>
        <svg width="260" height="260" viewBox="0 0 260 260" className="md:w-[320px] md:h-[320px] hero-rotate-reverse">
          {[
            { label: "木", angle: 72, color: "#2D6A4F" },
            { label: "火", angle: 144, color: "#C1121F" },
            { label: "土", angle: 216, color: "#C9A84C" },
            { label: "金", angle: 288, color: "#E8D5B7" },
            { label: "水", angle: 360, color: "#2980B9" },
          ].map(({ label, angle, color }) => {
            const rad = (angle * Math.PI) / 180
            const r = 100
            const displayLabel = isEn ? WUXING_TRANSLATION[label]?.pinyin || label : label
            return (
              <g key={label}>
                <circle
                  cx={130 + r * Math.cos(rad)}
                  cy={130 + r * Math.sin(rad)}
                  r="12"
                  fill={color}
                  opacity="0.15"
                />
                <text
                  x={130 + r * Math.cos(rad)}
                  y={130 + r * Math.sin(rad)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontSize="11"
                  fontWeight="bold"
                  opacity="0.5"
                >
                  {displayLabel}
                </text>
                <line
                  x1={130 + 100 * Math.cos(rad)}
                  y1={130 + 100 * Math.sin(rad)}
                  x2={130 + 100 * Math.cos(rad - 2 * Math.PI / 5)}
                  y2={130 + 100 * Math.sin(rad - 2 * Math.PI / 5)}
                  stroke={color}
                  strokeWidth="0.3"
                  opacity="0.1"
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Layer 4: Floating particles */}
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: ["#C9A84C", "#2D6A4F", "#C1121F", "#E8D5B7", "#2980B9", "#C9A84C"][i],
            left: `${30 + (i * 7) % 40}%`,
            top: `${20 + (i * 13) % 60}%`,
            animation: `particleFloat ${3 + i}s ease-in-out ${i * 0.7}s infinite`,
          }}
        />
      ))}

      {/* Keyframes defined in globals.css */}
    </div>
  )
}
