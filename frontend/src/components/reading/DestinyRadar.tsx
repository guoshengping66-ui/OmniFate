"use client"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

interface Props {
  scores: Record<string, number>
  labels?: string[]
  size?: number
}

/**
 * Pure SVG pentagon radar chart — no external charting library needed.
 * Renders 5 concentric pentagons, gold grid lines, and a filled data area.
 */
export function DestinyRadar({ scores, labels, size = 280 }: Props) {
  const { t: rawT } = useLanguage()
  const t = rawT as unknown as (key: string) => string
  const defaultLabels = [
    t("destinyRadar.wealth"),
    t("destinyRadar.relationship"),
    t("destinyRadar.career"),
    t("destinyRadar.health"),
    t("destinyRadar.spiritual"),
  ]
  const resolvedLabels = labels ?? defaultLabels
  const [animate, setAnimate] = useState(false)
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.34            // inner radius for data
  const labelRadius = size * 0.45       // radius for labels
  const levels = 5                      // concentric pentagons

  // Trigger entrance animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Get the 5 dimension values in fixed order
  const dims = ["wealth", "relationship", "career", "health", "spiritual"]
  const values = dims.map(d => scores[d] ?? 5)

  // Compute pentagon vertex positions
  function vertex(i: number, r: number, offset = 0) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2 + offset
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  // Build pentagon point string
  function pentagon(r: number, offset = 0) {
    return Array.from({ length: 5 }, (_, i) => {
      const v = vertex(i, r, offset)
      return `${v.x},${v.y}`
    }).join(" ")
  }

  // Build data polygon (scaled by score/10)
  const dataPoints = Array.from({ length: 5 }, (_, i) => {
    const ratio = Math.max(0.02, Math.min(1, values[i] / 10))
    const v = vertex(i, radius * ratio)
    return `${v.x},${v.y}`
  }).join(" ")

  // Grid stroke opacity
  function gridOpacity(level: number) {
    return 0.06 + 0.06 * level
  }

  return (
    <div className="card-glass p-5 inline-flex flex-col items-center">
      <h3 className="font-serif text-gold text-sm mb-2">{t("destinyRadar.title")}</h3>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid pentagons */}
        {Array.from({ length: levels }, (_, li) => {
          const r = (radius * (li + 1)) / levels
          return (
            <polygon
              key={li}
              points={pentagon(r)}
              fill="none"
              stroke="#C9A84C"
              strokeOpacity={gridOpacity(li)}
              strokeWidth={0.5}
            />
          )
        })}

        {/* Spokes */}
        {Array.from({ length: 5 }, (_, i) => {
          const v = vertex(i, radius)
          return (
            <line
              key={i}
              x1={cx} y1={cy}
              x2={v.x} y2={v.y}
              stroke="#C9A84C"
              strokeOpacity={0.12}
              strokeWidth={0.5}
            />
          )
        })}

        {/* Data area */}
        <polygon
          points={dataPoints}
          fill="rgba(201, 168, 76, 0.15)"
          stroke="#C9A84C"
          strokeWidth={1.5}
          strokeOpacity={0.7}
          style={{
            transition: "all 1s ease-out",
            transformOrigin: `${cx}px ${cy}px`,
            transform: animate ? "scale(1)" : "scale(0)",
            opacity: animate ? 1 : 0,
          }}
        />

        {/* Data points */}
        {Array.from({ length: 5 }, (_, i) => {
          const ratio = Math.max(0.02, Math.min(1, values[i] / 10))
          const v = vertex(i, radius * ratio)
          return (
            <circle
              key={i}
              cx={v.x} cy={v.y}
              r={3}
              fill="#C9A84C"
              style={{
                transition: "all 1s ease-out 0.2s",
                opacity: animate ? 1 : 0,
              }}
            />
          )
        })}

        {/* Labels + score numbers */}
        {Array.from({ length: 5 }, (_, i) => {
          const v = vertex(i, labelRadius)
          const val = Math.round(values[i] * 10) / 10
          return (
            <g key={i}>
              {/* Label text */}
              <text
                x={v.x} y={v.y - 10}
                textAnchor="middle"
                className="fill-white/70"
                fontSize={11}
                fontFamily="sans-serif"
              >
                {resolvedLabels[i]}
              </text>
              {/* Score number */}
              <text
                x={v.x} y={v.y + 6}
                textAnchor="middle"
                className="fill-gold"
                fontSize={13}
                fontWeight="bold"
                fontFamily="sans-serif"
                style={{
                  transition: "all 1s ease-out 0.3s",
                  opacity: animate ? 1 : 0,
                }}
              >
                {val.toFixed(1)}
              </text>
            </g>
          )
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={1.5} fill="#C9A84C" fillOpacity={0.4} />
      </svg>
    </div>
  )
}
