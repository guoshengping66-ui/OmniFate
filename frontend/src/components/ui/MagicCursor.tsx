"use client"
import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
}

export function MagicCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", handleMouseMove)

    const createParticle = (x: number, y: number, vx: number, vy: number): Particle => ({
      x, y,
      vx: vx * 0.5 + (Math.random() - 0.5) * 2,
      vy: vy * 0.5 + (Math.random() - 0.5) * 2 - 1,
      life: 1,
      maxLife: 0.5 + Math.random() * 0.5,
      size: 1 + Math.random() * 3,
      hue: 40 + Math.random() * 20, // gold hue range
    })

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const dx = mouseRef.current.x - lastMouseRef.current.x
      const dy = mouseRef.current.y - lastMouseRef.current.y
      const speed = Math.sqrt(dx * dx + dy * dy)

      if (speed > 3) {
        const count = Math.min(Math.floor(speed / 8), 4)
        for (let i = 0; i < count; i++) {
          particlesRef.current.push(createParticle(
            mouseRef.current.x,
            mouseRef.current.y,
            dx, dy
          ))
        }
      }

      lastMouseRef.current = { ...mouseRef.current }

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02
        p.vx *= 0.98
        p.life -= 0.02

        if (p.life <= 0) return false

        const alpha = p.life * 0.8
        const size = p.size * p.life

        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${alpha})`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${alpha * 0.3})`
        ctx.fill()

        return true
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  )
}
