"use client"

import React from "react"

// Error boundary to prevent framer-motion crashes from killing the entire layout
class SafeDynamicWrapper extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    console.warn("[AnimatedBackground] Component failed to load:", error.message)
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}

// Lazy-load each component individually so one failure doesn't crash all three
let NebulaBackground: React.ComponentType = () => null
let StarField: React.ComponentType = () => null
let MagicCursor: React.ComponentType = () => null

if (typeof window !== "undefined") {
  // Dynamic imports only run on client side
  import("./NebulaBackground")
    .then((m) => { NebulaBackground = m.NebulaBackground })
    .catch((e) => console.warn("[AnimatedBackground] NebulaBackground load failed:", e))
  import("./StarField")
    .then((m) => { StarField = m.StarField })
    .catch((e) => console.warn("[AnimatedBackground] StarField load failed:", e))
  import("./MagicCursor")
    .then((m) => { MagicCursor = m.MagicCursor })
    .catch((e) => console.warn("[AnimatedBackground] MagicCursor load failed:", e))
}

export default function AnimatedBackground() {
  return (
    <SafeDynamicWrapper>
      <NebulaBackground />
      <SafeDynamicWrapper>
        <StarField />
      </SafeDynamicWrapper>
      <SafeDynamicWrapper>
        <MagicCursor />
      </SafeDynamicWrapper>
    </SafeDynamicWrapper>
  )
}
