"use client"

import type { CSSProperties } from "react"

/* ── 八卦 (Bagua) trigram definitions ── */
const BAGUA = [
  { name: "Qian",  lines: [1, 1, 1], angle: -90  },
  { name: "Dui",   lines: [0, 1, 1], angle: -45  },
  { name: "Li",    lines: [1, 0, 1], angle: 0    },
  { name: "Zhen",  lines: [0, 0, 1], angle: 45   },
  { name: "Xun",   lines: [1, 1, 0], angle: 90   },
  { name: "Kan",   lines: [0, 1, 0], angle: 135  },
  { name: "Gen",   lines: [1, 0, 0], angle: 180  },
  { name: "Kun",   lines: [0, 0, 0], angle: 225  },
] as const

/* ── Random stars embedded in the astrolabe ── */
const ASTRO_STARS = Array.from({ length: 24 }, (_, i) => ({
  angle: (i / 24) * 360 + Math.random() * 12 - 6,
  dist: 22 + Math.random() * 24,
  size: 1.0 + Math.random() * 2.5,
}))

function Trigram({ lines }: { lines: readonly number[] }) {
  return (
    <g>
      {lines.map((line, i) => (
        line === 1 ? (
          <rect key={i} x={-5} y={-8 + i * 8} width={10} height={2.4} rx={1} fill="currentColor" />
        ) : (
          <g key={i}>
            <rect x={-5} y={-8 + i * 8} width={4.2} height={2.4} rx={1} fill="currentColor" />
            <rect x={1.8} y={-8 + i * 8} width={4.2} height={2.4} rx={1} fill="currentColor" />
          </g>
        )
      ))}
    </g>
  )
}

export default function AstrolabeBagua({ className = "" }: { className?: string }) {
  const SIZE = 560
  const CX = SIZE / 2
  const R = SIZE / 2 - 20

  return (
    <div className={className} aria-hidden="true" style={{
      position: "absolute", right: "clamp(18px,7vw,108px)", top: "50%",
      zIndex: -1, width: "min(46vw,620px)", minWidth: 460,
      aspectRatio: 1, transform: "translateY(-50%)",
      pointerEvents: "none", overflow: "visible",
    } as CSSProperties}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{
        width: "100%", height: "100%", display: "block",
        animation: "iaAstroSpin 60s linear infinite",
      }}>
        {/* Glow filter */}
        <defs>
          <radialGradient id="astro-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(214,182,90,0.12)" />
            <stop offset="60%" stopColor="rgba(30,111,97,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <circle cx={CX} cy={CX} r={R + 10} fill="url(#astro-glow)" />

        {/* Galaxy band — subtle arc across the astrolabe */}
        <ellipse cx={CX} cy={CX} rx={R * 0.92} ry={R * 0.28}
          transform={`rotate(-28 ${CX} ${CX})`}
          fill="none" stroke="rgba(244,239,226,0.06)" strokeWidth={24}
          filter="blur(2px)" />

        {/* Outer astrolabe ring — tick marks */}
        <g stroke="rgba(214,182,90,0.35)" strokeWidth={1}>
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = (i / 72) * 360 - 90
            const rad = (angle * Math.PI) / 180
            const len = i % 6 === 0 ? 12 : i % 3 === 0 ? 8 : 5
            const x1 = CX + (R - 2) * Math.cos(rad)
            const y1 = CY + (R - 2) * Math.sin(rad)
            const x2 = CX + (R - 2 - len) * Math.cos(rad)
            const y2 = CY + (R - 2 - len) * Math.sin(rad)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          })}
        </g>

        {/* Inner ring */}
        <circle cx={CX} cy={CX} r={R * 0.86}
          fill="none" stroke="rgba(214,182,90,0.12)" strokeWidth={1} />
        <circle cx={CX} cy={CX} r={R * 0.70}
          fill="none" stroke="rgba(129,202,185,0.10)" strokeWidth={0.5} />

        {/* Star pointers (astrolabe rete style) */}
        {ASTRO_STARS.map((s, i) => {
          const rad = (s.angle * Math.PI) / 180
          const x = CX + s.dist / 100 * R * Math.cos(rad)
          const y = CY + s.dist / 100 * R * Math.sin(rad)
          const size = s.size
          return (
            <circle key={i} cx={x} cy={y} r={size}
              fill="rgba(244,239,226,0.6)"
              style={{ animation: `iaAstroPulse ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 3}s` }}
            />
          )
        })}

        {/* Bagua trigrams on the ring */}
        {BAGUA.map((b) => {
          const rad = (b.angle * Math.PI) / 180
          const rPos = R * 0.76
          const x = CX + rPos * Math.cos(rad)
          const y = CY + rPos * Math.sin(rad)
          return (
            <g key={b.name}
              transform={`translate(${x}, ${y})`}
              fill="rgba(244,239,226,0.7)"
              style={{ animation: "iaAstroPulse 4s ease-in-out infinite" }}
            >
              <Trigram lines={b.lines} />
              <text x={0} y={16} textAnchor="middle"
                fill="rgba(244,239,226,0.35)" fontSize={8}
                fontFamily="Inter,sans-serif" letterSpacing={1}
              >
                {b.name}
              </text>
            </g>
          )
        })}

        {/* Mid ring with conic hint */}
        <circle cx={CX} cy={CX} r={R * 0.52}
          fill="none" stroke="rgba(214,182,90,0.08)" strokeWidth={0.5}
          strokeDasharray="2 6" />

        {/* Taiji core */}
        <g transform={`translate(${CX}, ${CX})`}>
          <circle r={R * 0.14}
            fill="none" stroke="rgba(214,182,90,0.20)" strokeWidth={1} />
          <circle r={R * 0.12}
            fill="none" stroke="rgba(214,182,90,0.10)" strokeWidth={0.5} />
          {/* Yin-yang S-curve */}
          <path d={`M 0 ${-R * 0.14} A ${R * 0.07} ${R * 0.07} 0 0 0 0 ${R * 0.14} A ${R * 0.07} ${R * 0.07} 0 0 1 0 ${-R * 0.14}`}
            fill="rgba(214,182,90,0.06)" />
          {/* Dots */}
          <circle cx={0} cy={-R * 0.07} r={R * 0.018}
            fill="rgba(214,182,90,0.25)" />
          <circle cx={0} cy={R * 0.07} r={R * 0.018}
            fill="rgba(129,202,185,0.20)" />
        </g>

        {/* Cardinal direction indicators */}
        {["N", "S", "E", "W"].map((dir, i) => {
          const angle = i * 90 - 90
          const rad = (angle * Math.PI) / 180
          const x = CX + (R + 16) * Math.cos(rad)
          const y = CY + (R + 16) * Math.sin(rad)
          return (
            <text key={dir} x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fill="rgba(244,239,226,0.20)" fontSize={9} fontFamily="Inter,sans-serif"
              letterSpacing={1}
            >
              {dir}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
