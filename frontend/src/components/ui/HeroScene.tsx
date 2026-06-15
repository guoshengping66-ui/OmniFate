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
    let rafId = 0
    let pendingMouse: { x: number; y: number } | null = null
    let pendingScroll: number | null = null

    const flush = () => {
      rafId = 0
      if (pendingMouse) { setMouse(pendingMouse); pendingMouse = null }
      if (pendingScroll !== null) { setScrollY(pendingScroll); pendingScroll = null }
    }

    const handleMouse = (e: MouseEvent) => {
      pendingMouse = {
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      }
      if (!rafId) rafId = requestAnimationFrame(flush)
    }
    const handleScroll = () => {
      pendingScroll = window.scrollY
      if (!rafId) rafId = requestAnimationFrame(flush)
    }

    window.addEventListener("mousemove", handleMouse, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("mousemove", handleMouse)
      window.removeEventListener("scroll", handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const rotate = scrollY / 1200 * 15
  const scaleVal = 1 - Math.min(scrollY / 800, 1) * 0.1
  const fadeOpacity = 1 - Math.min(scrollY / 600, 1) * 0.6

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        transform: `rotate(${rotate}deg) scale(${scaleVal})`,
        opacity: fadeOpacity,
      }}
    >
      {/* Layer 1: Outer glow ring */}
      <div className="absolute w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full bg-gradient-to-r from-gold/[0.03] via-transparent to-gold/[0.03] animate-pulse-slow" />

      {/* Layer 2: Rotating astrolabe (mouse tracking on parent, rotation via CSS animation) */}
      <div style={{ transform: `translate(${mouse.x * 0.5}px, ${mouse.y * 0.5}px)` }}>
        <svg
          width={360} height={360}
          viewBox="0 0 360 360"
          className="md:w-[440px] md:h-[440px] hero-rotate"
        >
          {/* Outer ring */}
          <circle cx="180" cy="180" r="170" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.2" />

          {/* 8 Trigrams */}
          {[
            { label: "乾", angle: 0 },    { label: "兑", angle: 45 },
            { label: "离", angle: 90 },   { label: "震", angle: 135 },
            { label: "巽", angle: 180 },  { label: "坎", angle: 225 },
            { label: "艮", angle: 270 },  { label: "坤", angle: 315 },
          ].map(({ label, angle }) => {
            const rad = (angle * Math.PI) / 180
            const r = 145
            const displayLabel = isEn ? BAGUA_TRANSLATION[label]?.pinyin || label : label
            return (
              <text
                key={label}
                x={180 + r * Math.cos(rad)}
                y={180 + r * Math.sin(rad)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#C9A84C"
                fontSize="13"
                fontWeight="bold"
                fontFamily="serif"
                opacity="0.3"
              >
                {displayLabel}
              </text>
            )
          })}

          {/* Inner Tai Chi */}
          <g transform="translate(180,180)">
            <circle cx="0" cy="0" r="55" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.25" />
            <path
              d="M0,-55 A27.5,27.5 0 0,1 0,0 A27.5,27.5 0 0,0 0,55 A55,55 0 0,1 0,-55"
              fill="#C9A84C" opacity="0.12"
            />
            <circle cx="0" cy="-27.5" r="7" fill="#C9A84C" opacity="0.2" />
            <circle cx="0" cy="27.5" r="7" fill="#1A0F2E" opacity="0.4" />
          </g>
        </svg>
      </div>

      {/* Layer 3: Counter-rotating inner ring */}
      <div style={{ transform: `translate(${mouse.x * 0.3}px, ${mouse.y * 0.3}px)` }}>
        <svg width="220" height="220" viewBox="0 0 220 220" className="md:w-[280px] md:h-[280px] hero-rotate-reverse">
          {[
            { label: "木", angle: 72, color: "#2D6A4F" },
            { label: "火", angle: 144, color: "#C1121F" },
            { label: "土", angle: 216, color: "#C9A84C" },
            { label: "金", angle: 288, color: "#E8D5B7" },
            { label: "水", angle: 360, color: "#2980B9" },
          ].map(({ label, angle, color }) => {
            const rad = (angle * Math.PI) / 180
            const r = 85
            const displayLabel = isEn ? WUXING_TRANSLATION[label]?.pinyin || label : label
            return (
              <g key={label}>
                <circle
                  cx={110 + r * Math.cos(rad)}
                  cy={110 + r * Math.sin(rad)}
                  r="10"
                  fill={color}
                  opacity="0.12"
                />
                <text
                  x={110 + r * Math.cos(rad)}
                  y={110 + r * Math.sin(rad)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontSize="10"
                  fontWeight="bold"
                  opacity="0.4"
                >
                  {displayLabel}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Layer 4: Floating particles */}
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: ["#C9A84C", "#2D6A4F", "#C1121F", "#2980B9"][i],
            left: `${35 + (i * 10) % 30}%`,
            top: `${25 + (i * 15) % 50}%`,
            animation: `particleFloat ${4 + i}s ease-in-out ${i * 0.8}s infinite`,
          }}
        />
      ))}

      {/* Keyframes defined in globals.css */}
    </div>
  )
}
