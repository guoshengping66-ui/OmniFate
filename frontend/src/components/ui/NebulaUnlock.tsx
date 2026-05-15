"use client"

import { useEffect, useState } from "react"

interface NebulaUnlockProps {
  show: boolean
  onComplete?: () => void
}

export function NebulaUnlock({ show, onComplete }: NebulaUnlockProps) {
  const [phase, setPhase] = useState<"idle" | "converge" | "flash" | "done">("idle")

  useEffect(() => {
    if (!show) {
      setPhase("idle")
      return
    }

    // Phase 1: Particles converge
    setPhase("converge")

    // Phase 2: Flash after 800ms
    const flashTimer = setTimeout(() => {
      setPhase("flash")
    }, 800)

    // Phase 3: Done after 1200ms
    const doneTimer = setTimeout(() => {
      setPhase("done")
      onComplete?.()
    }, 1200)

    return () => {
      clearTimeout(flashTimer)
      clearTimeout(doneTimer)
    }
  }, [show, onComplete])

  if (phase === "idle" || phase === "done") return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Converging particles */}
      {phase === "converge" && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * 360
            const rad = (angle * Math.PI) / 180
            const startX = Math.cos(rad) * 200
            const startY = Math.sin(rad) * 200

            return (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gold rounded-full"
                style={{
                  animation: `nebula-converge 0.8s ease-in forwards`,
                  animationDelay: `${i * 0.05}s`,
                  transform: `translate(${startX}px, ${startY}px)`,
                }}
              />
            )
          })}
        </div>
      )}

      {/* Flash effect */}
      {phase === "flash" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-32 h-32 bg-gold/50 rounded-full blur-3xl"
            style={{
              animation: "nebula-flash 0.4s ease-out forwards",
            }}
          />
        </div>
      )}
    </div>
  )
}
