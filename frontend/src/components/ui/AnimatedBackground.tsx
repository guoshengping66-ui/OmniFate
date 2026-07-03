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
  return Array.from({ length: n }, (_, i) => ({
    id: i, left: rng() * 100, top: rng() * 100,
    size: 0.5 + rng() * 0.8, opacity: 0.08 + rng() * 0.2,
  }))
}

const FIELD_STARS = genStars(60)

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
          "radial-gradient(circle at 50% 34%, rgba(218,180,74,0.04), transparent 26%)," +
          "radial-gradient(circle at 70% 46%, rgba(24,88,116,0.10), transparent 34%)," +
          "radial-gradient(circle at 25% 65%, rgba(86,66,28,0.07), transparent 32%)," +
          "linear-gradient(180deg, #02050d 0%, #06101b 42%, #02040a 100%)",
        zIndex: 0,
      }} />

      {/* ═══ Sparse far stars — always visible ═══ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex: 1 }}>
        {FIELD_STARS.map(s => (
          <span key={s.id} style={{
            position: "absolute", left: `${s.left}%`, top: `${s.top}%`,
            width: s.size, height: s.size, borderRadius: "50%",
            background: "rgba(255,255,255,0.5)", opacity: s.opacity,
          }} />
        ))}
      </div>

      {/* ═══ Subtle nebula glow ═══ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        background:
          "radial-gradient(ellipse at 24% 60%, rgba(120,88,36,0.06), transparent 34%)," +
          "radial-gradient(ellipse at 72% 44%, rgba(42,130,155,0.07), transparent 36%)," +
          "radial-gradient(ellipse at 50% 38%, rgba(218,180,74,0.03), transparent 28%)",
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
