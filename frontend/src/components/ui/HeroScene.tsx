"use client"
import { useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { BAGUA_TRANSLATION, WUXING_TRANSLATION } from "@/lib/translations"

/**
 * Cyber-Metaphysics Hero Scene
 * Multi-layered rotating astrolabe + bagua with parallax and mouse tracking.
 * Pure CSS/SVG — no Three.js required.
 */
export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null)
  const { locale } = useLanguage()
  const isEn = locale === "en"
  const { scrollY } = useScroll()
  const rotate = useTransform(scrollY, [0, 800], [0, 25])
  const scale = useTransform(scrollY, [0, 800], [1, 0.85])
  const opacity = useTransform(scrollY, [0, 600], [1, 0.3])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    function handleMouse(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      mouseX.set(x)
      mouseY.set(y)
    }
    window.addEventListener("mousemove", handleMouse)
    return () => window.removeEventListener("mousemove", handleMouse)
  }, [mouseX, mouseY])

  return (
    <motion.div
      ref={ref}
      style={{ rotate, scale, opacity }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      {/* Layer 1: Outer glow ring */}
 <div className="absolute w-[420px] h-[420px] md:w-[520px] md:h-[520px] rounded-full bg-gradient-to-r from-gold/5 via-transparent to-gold/5 animate-pulse-slow" />

      {/* Layer 2: Rotating astrolabe */}
      <motion.svg
        width={380} height={380}
        viewBox="0 0 380 380"
        className="md:w-[480px] md:h-[480px]"
        style={{ x: mouseX, y: mouseY }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
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

        {/* 8 Trigrams around outer ring */}
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
      </motion.svg>

      {/* Layer 3: Counter-rotating inner ring */}
      <motion.div
        className="absolute"
        style={{ x: mouseX, y: mouseY }}
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      >
        <svg width="260" height="260" viewBox="0 0 260 260" className="md:w-[320px] md:h-[320px]">
          {/* 5 Elements stars */}
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
                {/* Connection lines */}
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
      </motion.div>

      {/* Layer 4: Floating particles around the scene */}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: ["#C9A84C", "#2D6A4F", "#C1121F", "#E8D5B7", "#2980B9", "#C9A84C"][i],
            left: `${30 + Math.random() * 40}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: i * 0.7,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  )
}
