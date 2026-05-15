"use client"
import { useEffect, useState, type ReactNode } from "react"

interface NebulaUnlockProps {
  children: ReactNode
  trigger?: boolean
  onComplete?: () => void
}

export function NebulaUnlock({ children, trigger = false, onComplete }: NebulaUnlockProps) {
  const [phase, setPhase] = useState<"idle" | "converge" | "flash" | "reveal">("idle")

  useEffect(() => {
    if (!trigger) {
      setPhase("idle")
      return
    }

    setPhase("converge")
    const t1 = setTimeout(() => setPhase("flash"), 600)
    const t2 = setTimeout(() => setPhase("reveal"), 900)
    const t3 = setTimeout(() => {
      setPhase("idle")
      onComplete?.()
    }, 1600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [trigger, onComplete])

  if (phase === "idle") {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Particle converge overlay */}
      {(phase === "converge" || phase === "flash") && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Particles converging to center */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360
            const rad = (angle * Math.PI) / 180
            const startX = Math.cos(rad) * 40
            const startY = Math.sin(rad) * 40
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 w-2 h-2 bg-gold rounded-full"
                style={{
                  animation: `nebula-particle-${i % 3} 0.6s ease-in forwards`,
                  transform: `translate(-50%, -50%)`,
                }}
              />
            )
          })}

          {/* Flash */}
          {phase === "flash" && (
            <div className="absolute inset-0 bg-gold/20 animate-[nebula-flash_0.3s_ease-out]" />
          )}
        </div>
      )}

      {/* Content with reveal */}
      <div className={phase === "reveal" ? "animate-[nebula-reveal_0.5s_ease-out]" : ""}>
        {children}
      </div>
    </div>
  )
}
