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

export default function AnimatedBackground() {
  const [components, setComponents] = React.useState<{
    NebulaBackground?: React.ComponentType
    StarField?: React.ComponentType
    MagicCursor?: React.ComponentType
  }>({})

  React.useEffect(() => {
    Promise.allSettled([
      import("./NebulaBackground").then(m => setComponents(c => ({ ...c, NebulaBackground: m.NebulaBackground }))),
      import("./StarField").then(m => setComponents(c => ({ ...c, StarField: m.StarField }))),
      import("./MagicCursor").then(m => setComponents(c => ({ ...c, MagicCursor: m.MagicCursor }))),
    ]).catch(e => console.warn("[AnimatedBackground] load failed:", e))
  }, [])

  const { NebulaBackground, StarField, MagicCursor } = components

  return (
    <div suppressHydrationWarning>
      {NebulaBackground && (
        <SafeDynamicWrapper>
          <NebulaBackground />
        </SafeDynamicWrapper>
      )}
      {StarField && (
        <SafeDynamicWrapper>
          <StarField />
        </SafeDynamicWrapper>
      )}
      {MagicCursor && (
        <SafeDynamicWrapper>
          <MagicCursor />
        </SafeDynamicWrapper>
      )}
    </div>
  )
}
