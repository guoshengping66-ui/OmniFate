"use client"
import { useEffect, useState } from "react"
import { Zap } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface EnergyInjectProps {
  show: boolean
  amount: number
  onComplete?: () => void
}

export function EnergyInject({ show, amount, onComplete }: EnergyInjectProps) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Radial glow */}
      <div
        className="absolute w-32 h-32 rounded-full bg-gold/30 blur-xl anim-fade-in"
        style={{ animation: "fadeIn 0.3s ease-out, scaleOut 1.5s ease-out 0.3s forwards" }}
      />

      {/* Particle burst */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * 360
        const rad = (angle * Math.PI) / 180
        const px = Math.cos(rad) * 100
        const py = Math.sin(rad) * 100
        return (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gold rounded-full"
            style={{
              "--px": `${px}px`,
              "--py": `${py}px`,
              animation: "particleBurst 0.8s ease-out 0.2s forwards",
            } as React.CSSProperties}
          />
        )
      })}

      {/* Center icon + amount */}
      <div className="relative flex flex-col items-center anim-slide-up">
        <div className="w-16 h-16 rounded-full bg-gold/20 border border-gold/40
                      flex items-center justify-center mb-2">
          <Zap size={28} className="text-gold" />
        </div>
        <span className="text-gold font-bold text-lg anim-fade-in" style={{ animationDelay: "0.3s" }}>
          {amount > 0 ? `+${amount}` : amount} {t("energyInject.stardust")}
        </span>
      </div>
    </div>
  )
}
