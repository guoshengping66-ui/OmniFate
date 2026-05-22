"use client"
import { useRef, useState, useCallback, type ReactNode } from "react"

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
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    setOffset({ x: dx * strength, y: dy * strength })
  }, [strength])

  const handleLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 })
  }, [])

  const Tag = as === "a" ? "a" : "button"

  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className="inline-block">
      <Tag
        href={href as any}
        onClick={onClick}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: "transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          willChange: "transform",
        }}
        className={className}
      >
        {children}
      </Tag>
    </div>
  )
}
