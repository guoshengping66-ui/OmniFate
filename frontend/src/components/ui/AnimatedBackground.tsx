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

export default function AnimatedBackground() {
  const [nebula, setNebula] = React.useState<React.ComponentType | null>(null)
  const [stars, setStars] = React.useState<React.ComponentType | null>(null)

  React.useEffect(() => {
    // Phase 1: Load nebula (lightweight CSS gradient)
    import("./NebulaBackground").then(m => setNebula(() => m.NebulaBackground))

    // Phase 2: Load stars after paint
    const idleFn = typeof requestIdleCallback !== "undefined"
      ? requestIdleCallback
      : (cb: IdleRequestCallback) => setTimeout(cb, 200) as unknown as number
    const idleId = idleFn(() => {
      import("./StarField").then(m => setStars(() => m.StarField))
    }, { timeout: 3000 })

    return () => {
      if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(idleId)
      else clearTimeout(idleId as unknown as number)
    }
  }, [])

  return (
    <div suppressHydrationWarning>
      {nebula && (
        <SafeDynamicWrapper>
          {React.createElement(nebula)}
        </SafeDynamicWrapper>
      )}
      {stars && (
        <SafeDynamicWrapper>
          {React.createElement(stars)}
        </SafeDynamicWrapper>
      )}
    </div>
  )
}
