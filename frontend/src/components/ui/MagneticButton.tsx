"use client"
import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

interface Props {
  children: ReactNode
  className?: string
  as?: "button" | "a"
  href?: string
  onClick?: () => void
  strength?: number
}

export function MagneticButton({
  children, className = "", as = "button",
  href, onClick, strength = 0.4,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 15 })
  const springY = useSpring(y, { stiffness: 200, damping: 15 })

  function handleMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    x.set(dx * strength)
    y.set(dy * strength)
  }

  function handleLeave() {
    x.set(0)
    y.set(0)
  }

  const Tag = as === "a" ? motion.a : motion.button

  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className="inline-block">
      <Tag
        href={href as any}
        onClick={onClick}
        style={{ x: springX, y: springY }}
        className={className}
      >
        {children}
      </Tag>
    </div>
  )
}
