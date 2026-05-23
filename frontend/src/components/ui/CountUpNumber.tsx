"use client"
import { useEffect, useRef, useState } from "react"

interface CountUpNumberProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function CountUpNumber({ end, duration = 2, suffix = "", prefix = "" }: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [inView, setInView] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [inView, end, duration])

  return (
    <span
      ref={ref}
      className={`tabular-nums ${inView ? "anim-slide-up" : "opacity-0"}`}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}
