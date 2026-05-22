"use client"
import { useRef, useEffect, useState, type ReactNode } from "react"

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  duration?: number
}

export function ScrollReveal({
  children, className = "", delay = 0,
  direction = "up", duration = 0.6,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "-60px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const offset = {
    up: "translateY(48px)",
    down: "translateY(-48px)",
    left: "translateX(48px)",
    right: "translateX(-48px)",
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0,0)" : offset[direction],
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}
