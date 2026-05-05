"use client"
import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

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
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)

  function handleMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy

    x.set((dy / (rect.height / 2)) * -rotateX)
    y.set((dx / (rect.width / 2)) * rotateY)
    glareX.set((dx / rect.width) * 50 + 50)
    glareY.set((dy / rect.height) * 50 + 50)
  }

  function handleLeave() {
    x.set(0)
    y.set(0)
    glareX.set(50)
    glareY.set(50)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className={`relative group ${className}`}
    >
      <motion.div
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full"
        whileHover={{ scale }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {children}

        {/* Glare overlay */}
        {glare && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(${glowColor},0.2) 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Animated border glow */}
        <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent, rgba(${glowColor},0.4), transparent, rgba(${glowColor},0.2), transparent)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            padding: "1px",
            animation: "border-spin 3s linear infinite",
          }}
        />

        {/* Corner accent */}
        <div className="absolute -top-px -right-px w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-[1px]"
            style={{ background: `linear-gradient(to left, rgba(${glowColor},0.6), transparent)` }}
          />
          <div className="absolute top-0 right-0 h-full w-[1px]"
            style={{ background: `linear-gradient(to bottom, rgba(${glowColor},0.6), transparent)` }}
          />
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes border-spin {
          from { --border-angle: 0deg; }
          to { --border-angle: 360deg; }
        }
      `}</style>
    </motion.div>
  )
}
