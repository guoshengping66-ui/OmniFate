"use client"

import React from "react"

class SafeDynamicWrapper extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}

/* ── Starfield data: fixed seed, deterministic ── */
function genStars(n: number) {
  let seed = 42
  const rng = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646 }
  const colors = [
    "rgba(220,230,255,",   // blue-white
    "rgba(240,245,255,",   // pure white
    "rgba(255,245,220,",   // warm white
    "rgba(200,210,240,",   // cool blue
  ]
  return Array.from({ length: n }, (_, i) => {
    const size = rng() < 0.1 ? 1.8 + rng() * 1.2 : 0.4 + rng() * 1.0
    const color = colors[Math.floor(rng() * colors.length)]
    const opacity = size > 1.5 ? 0.2 + rng() * 0.3 : 0.06 + rng() * 0.18
    return {
      id: i, left: rng() * 100, top: rng() * 100,
      size, color, opacity,
    }
  })
}

const FIELD_STARS = genStars(100)

export default function AnimatedBackground() {
  const [extra, setExtra] = React.useState<React.ComponentType | null>(null)

  React.useEffect(() => {
    const idleFn = typeof requestIdleCallback !== "undefined"
      ? requestIdleCallback
      : (cb: IdleRequestCallback) => setTimeout(cb, 200) as unknown as number
    const id = idleFn(() => {
      import("./NebulaBackground").then(m => setExtra(() => m.NebulaBackground))
    }, { timeout: 3000 })
    return () => {
      if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(id)
      else clearTimeout(id as unknown as number)
    }
  }, [])

  return (
    <div suppressHydrationWarning>
      {/* ═══ Static deep space backdrop — instant on all pages ═══ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(25, 40, 90, 0.25), transparent 40%)," +
          "radial-gradient(ellipse at 70% 30%, rgba(15, 25, 55, 0.22), transparent 38%)," +
          "radial-gradient(ellipse at 50% 60%, rgba(12, 18, 38, 0.28), transparent 35%)," +
          "linear-gradient(180deg, #02050f 0%, #060e1f 42%, #0a0f1e 100%)",
        zIndex: 0,
      }} />

      {/* ═══ Sparse far stars — always visible ═══ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex: 1 }}>
        {FIELD_STARS.map(s => (
          <span key={s.id} style={{
            position: "absolute", left: `${s.left}%`, top: `${s.top}%`,
            width: s.size, height: s.size, borderRadius: "50%",
            background: `${s.color}${s.opacity})`,
            boxShadow: s.size > 1.5 ? `0 0 ${s.size * 2}px ${s.color}${s.opacity * 0.5})` : "none",
            opacity: s.opacity,
          }} />
        ))}
      </div>

      {/* ═══ Subtle nebula glow ═══ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        background:
          "radial-gradient(ellipse at 24% 60%, rgba(80, 50, 140, 0.08), transparent 34%)," +
          "radial-gradient(ellipse at 72% 44%, rgba(30, 80, 150, 0.09), transparent 36%)," +
          "radial-gradient(ellipse at 50% 38%, rgba(100, 150, 220, 0.05), transparent 28%)",
        filter: "blur(38px)", opacity: 0.6, mixBlendMode: "screen" as const,
        zIndex: 1,
      }} />

      {/* ═══ Vignette ═══ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, transparent 22%, transparent 52%, rgba(0,0,0,0.70) 100%)",
        zIndex: 2,
      }} />

      {/* ═══ Optional extra nebula (lazy loaded) ═══ */}
      {extra && (
        <SafeDynamicWrapper>
          {React.createElement(extra)}
        </SafeDynamicWrapper>
      )}
    </div>
  )
}
