"use client"
import { useRef, useEffect, useState, type RefObject } from "react"

export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight
        // progress 0 when element top hits viewport bottom
        // progress 1 when element bottom exits viewport top
        const total = rect.height + vh
        const scrolled = vh - rect.top
        const p = Math.max(0, Math.min(1, scrolled / total))
        setProgress(p)
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [ref])

  return progress
}
