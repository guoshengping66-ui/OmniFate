"use client"

import { useEffect, useRef, useMemo } from "react"

interface Star {
  x: number; y: number
  size: number; alpha: number
  phase: number; speed: number
  hue: number // 0=white, 30=gold, 220=blue
}

export default function StarField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const stars = useMemo(() => {
    const count = 320
    const result: Star[] = []
    for (let i = 0; i < count; i++) {
      result.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.4 + Math.random() * 2.6,
        alpha: 0.2 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.7,
        hue: Math.random() < 0.08 ? 30 : Math.random() < 0.12 ? 220 : 0,
      })
    }
    return result
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf: number
    let start = performance.now()
    let w = 0, h = 0

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas!.width = w
      canvas!.height = h
    }
    resize()
    window.addEventListener("resize", resize)

    function draw(now: number) {
      const t = (now - start) / 1000
      ctx!.clearRect(0, 0, w, h)
      
      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed * 1.2 + s.phase)
        const a = s.alpha * (0.4 + 0.6 * twinkle)
        const x = s.x * w
        const y = s.y * h
        
        ctx!.beginPath()
        ctx!.arc(x, y, s.size, 0, Math.PI * 2)
        
        if (s.hue === 30) {
          ctx!.fillStyle = `rgba(255, 220, 150, ${a})`
        } else if (s.hue === 220) {
          ctx!.fillStyle = `rgba(180, 210, 255, ${a})`
        } else {
          ctx!.fillStyle = `rgba(255, 255, 255, ${a})`
        }
        ctx!.fill()
        
        if (s.size > 1.8 && a > 0.5) {
          ctx!.beginPath()
          ctx!.arc(x, y, s.size * 1.6, 0, Math.PI * 2)
          ctx!.fillStyle = s.hue === 30
            ? `rgba(255, 220, 150, ${a * 0.12})`
            : s.hue === 220
            ? `rgba(180, 210, 255, ${a * 0.12})`
            : `rgba(255, 255, 255, ${a * 0.10})`
          ctx!.fill()
        }
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [stars])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  )
}
