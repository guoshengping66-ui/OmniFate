"use client"
import { useEffect, useState, useRef, type ReactNode } from "react"
import { Sparkles } from "lucide-react"

interface NebulaUnlockProps {
  children: ReactNode
  trigger?: boolean
  onComplete?: () => void
}

const LOADING_STATUSES = [
  "正在校准星历数据...",
  "正在调和五行能量...",
  "正在检索心学典籍...",
  "正在推演天机命盘...",
  "正在感应星辰共振...",
  "正在编织命运经纬...",
  "正在解密宇宙密码...",
  "正在凝聚星尘之力...",
]

export function NebulaUnlock({ children, trigger = false, onComplete }: NebulaUnlockProps) {
  const [phase, setPhase] = useState<"idle" | "converge" | "flash" | "reveal">("idle")
  const [statusIndex, setStatusIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!trigger) {
      setPhase("idle")
      return
    }

    setPhase("converge")
    setStatusIndex(0)

    // Cycle loading statuses
    intervalRef.current = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % LOADING_STATUSES.length)
    }, 800)

    const t1 = setTimeout(() => setPhase("flash"), 600)
    const t2 = setTimeout(() => setPhase("reveal"), 900)
    const t3 = setTimeout(() => {
      setPhase("idle")
      if (intervalRef.current) clearInterval(intervalRef.current)
      onComplete?.()
    }, 1600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [trigger, onComplete])

  if (phase === "idle") {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Particle converge overlay with loading status */}
      {(phase === "converge" || phase === "flash") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Loading status text */}
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30
                            flex items-center justify-center animate-[spin_3s_linear_infinite]">
                <Sparkles size={24} className="text-gold animate-pulse" />
              </div>
            </div>
            <p className="text-gold/80 text-sm font-medium tracking-wide animate-pulse">
              {LOADING_STATUSES[statusIndex]}
            </p>

            {/* Particles converging to center */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * 360
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
          </div>

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
