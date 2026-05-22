"use client"
import { useRef, useState, useCallback, type ReactNode } from "react"

interface Props {
  children: ReactNode
  className?: string
  glare?: boolean
  scale?: number
  rotateX?: number
  rotateY?: number
  glowColor?: string
}

export function TiltCard({
  children, className = "", glare = true,
  scale = 1.02, rotateX = 8, rotateY = 8,
  glowColor = "201,168,76",
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, hover: false })

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy

    setTilt({
      rx: (dy / (rect.height / 2)) * -rotateX,
      ry: (dx / (rect.width / 2)) * rotateY,
      gx: (dx / rect.width) * 50 + 50,
      gy: (dy / rect.height) * 50 + 50,
      hover: true,
    })
  }, [rotateX, rotateY])

  const handleLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, hover: false })
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className={`relative group ${className}`}
    >
      <div
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.hover ? scale : 1})`,
          transformStyle: "preserve-3d",
          transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          willChange: "transform",
        }}
        className="relative w-full h-full"
      >
        {children}

        {/* Glare overlay */}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            style={{
              opacity: tilt.hover ? 1 : 0,
              background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(${glowColor},0.2) 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Animated border glow */}
        <div
          className="absolute -inset-[1px] rounded-2xl transition-opacity duration-500 pointer-events-none"
          style={{
            opacity: tilt.hover ? 1 : 0,
            background: `conic-gradient(from 0deg, transparent, rgba(${glowColor},0.4), transparent, rgba(${glowColor},0.2), transparent)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            padding: "1px",
          }}
        />

        {/* Corner accent */}
        <div
          className="absolute -top-px -right-px w-8 h-8 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: tilt.hover ? 1 : 0 }}
        >
          <div className="absolute top-0 right-0 w-full h-[1px]"
            style={{ background: `linear-gradient(to left, rgba(${glowColor},0.6), transparent)` }}
          />
          <div className="absolute top-0 right-0 h-full w-[1px]"
            style={{ background: `linear-gradient(to bottom, rgba(${glowColor},0.6), transparent)` }}
          />
        </div>
      </div>
    </div>
  )
}
