"use client"
import { useEffect, useRef, useMemo } from "react"

/**
 * Full-page animated starfield background.
 * Renders a canvas with:
 *  - Layered star field (parallax depth)
 *  - Nebula clouds (soft colour blobs)
 *  - Shooting stars (occasional streaks)
 *  - Constellation lines (faint connections)
 *
 * Performance: single <canvas>, requestAnimationFrame loop, no React re-renders.
 */

interface Star {
  x: number; y: number; r: number; a: number; speed: number; twinklePhase: number; twinkleSpeed: number
}
interface Nebula {
  x: number; y: number; rx: number; ry: number; color: string; opacity: number; driftX: number; driftY: number
}
interface ShootingStar {
  x: number; y: number; angle: number; speed: number; length: number; life: number; maxLife: number
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const config = useMemo(() => ({
    starCount: 280,
    nebulaCount: 5,
    shootingStarInterval: 4000, // ms between shooting stars
    colors: {
      gold: "rgba(197,168,128,",
      white: "rgba(255,255,255,",
      blue: "rgba(120,140,200,",
      purple: "rgba(160,120,200,",
    },
  }), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let w = 0, h = 0
    let stars: Star[] = []
    let nebulae: Nebula[] = []
    let shootingStars: ShootingStar[] = []
    let lastShootingStar = 0

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      w = window.innerWidth
      h = document.documentElement.scrollHeight
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = w + "px"
      canvas!.style.height = h + "px"
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      initStars()
      initNebulae()
    }

    function initStars() {
      stars = Array.from({ length: config.starCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.3,
        a: Math.random() * 0.6 + 0.15,
        speed: Math.random() * 0.3 + 0.05,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      }))
    }

    function initNebulae() {
      const palette = [
        "rgba(197,168,128,0.015)",
        "rgba(120,140,200,0.012)",
        "rgba(160,100,180,0.01)",
        "rgba(197,168,128,0.01)",
        "rgba(100,130,180,0.008)",
      ]
      nebulae = Array.from({ length: config.nebulaCount }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        rx: Math.random() * 400 + 200,
        ry: Math.random() * 300 + 150,
        color: palette[i % palette.length],
        opacity: 1,
        driftX: (Math.random() - 0.5) * 0.15,
        driftY: (Math.random() - 0.5) * 0.1,
      }))
    }

    function spawnShootingStar(time: number) {
      if (time - lastShootingStar < config.shootingStarInterval) return
      lastShootingStar = time
      const angle = Math.random() * 0.4 + 0.3 // roughly 15-40 degrees
      shootingStars.push({
        x: Math.random() * w * 0.8,
        y: Math.random() * h * 0.3,
        angle,
        speed: Math.random() * 6 + 4,
        length: Math.random() * 80 + 40,
        life: 0,
        maxLife: Math.random() * 40 + 30,
      })
    }

    function drawStars(time: number) {
      for (const s of stars) {
        s.twinklePhase += s.twinkleSpeed
        const twinkle = 0.5 + 0.5 * Math.sin(s.twinklePhase)
        const alpha = s.a * (0.4 + twinkle * 0.6)

        ctx!.beginPath()
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2)

        // Vary star color: mostly white/gold, some blue
        if (s.r > 1.3) {
          ctx!.fillStyle = `rgba(197,168,128,${alpha})`
        } else if (s.r < 0.6) {
          ctx!.fillStyle = `rgba(160,180,220,${alpha * 0.8})`
        } else {
          ctx!.fillStyle = `rgba(255,255,255,${alpha})`
        }
        ctx!.fill()

        // Glow for larger stars
        if (s.r > 1.2) {
          ctx!.beginPath()
          ctx!.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2)
          const grad = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3)
          grad.addColorStop(0, `rgba(197,168,128,${alpha * 0.15})`)
          grad.addColorStop(1, "rgba(197,168,128,0)")
          ctx!.fillStyle = grad
          ctx!.fill()
        }
      }
    }

    function drawNebulae(time: number) {
      for (const n of nebulae) {
        n.x += n.driftX
        n.y += n.driftY
        // Wrap around
        if (n.x < -n.rx) n.x = w + n.rx
        if (n.x > w + n.rx) n.x = -n.rx
        if (n.y < -n.ry) n.y = h + n.ry
        if (n.y > h + n.ry) n.y = -n.ry

        const breathe = 1 + 0.1 * Math.sin(time * 0.0003 + n.x * 0.001)
        ctx!.save()
        ctx!.translate(n.x, n.y)
        ctx!.scale(breathe, breathe * 0.8)
        const grad = ctx!.createRadialGradient(0, 0, 0, 0, 0, n.rx)
        grad.addColorStop(0, n.color)
        grad.addColorStop(1, "rgba(0,0,0,0)")
        ctx!.fillStyle = grad
        ctx!.fillRect(-n.rx, -n.ry, n.rx * 2, n.ry * 2)
        ctx!.restore()
      }
    }

    function drawShootingStars(time: number) {
      spawnShootingStar(time)

      shootingStars = shootingStars.filter(ss => {
        ss.life++
        if (ss.life > ss.maxLife) return false

        const progress = ss.life / ss.maxLife
        const fadeOut = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8
        const alpha = Math.max(0, fadeOut)

        const dx = Math.cos(ss.angle) * ss.speed
        const dy = Math.sin(ss.angle) * ss.speed
        ss.x += dx
        ss.y += dy

        const tailX = ss.x - Math.cos(ss.angle) * ss.length * fadeOut
        const tailY = ss.y - Math.sin(ss.angle) * ss.length * fadeOut

        const grad = ctx!.createLinearGradient(tailX, tailY, ss.x, ss.y)
        grad.addColorStop(0, "rgba(197,168,128,0)")
        grad.addColorStop(0.7, `rgba(255,255,255,${alpha * 0.3})`)
        grad.addColorStop(1, `rgba(197,168,128,${alpha * 0.8})`)

        ctx!.beginPath()
        ctx!.moveTo(tailX, tailY)
        ctx!.lineTo(ss.x, ss.y)
        ctx!.strokeStyle = grad
        ctx!.lineWidth = 1.5
        ctx!.stroke()

        // Head glow
        ctx!.beginPath()
        ctx!.arc(ss.x, ss.y, 2, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(255,255,255,${alpha * 0.9})`
        ctx!.fill()

        return true
      })
    }

    function drawConstellations(time: number) {
      // Connect nearby stars with faint lines
      const maxDist = 120
      const maxConnections = 40
      let count = 0

      for (let i = 0; i < stars.length && count < maxConnections; i++) {
        for (let j = i + 1; j < stars.length && count < maxConnections; j++) {
          const dx = stars[i].x - stars[j].x
          const dy = stars[i].y - stars[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist && stars[i].r > 0.8 && stars[j].r > 0.8) {
            const alpha = (1 - dist / maxDist) * 0.04
            ctx!.beginPath()
            ctx!.moveTo(stars[i].x, stars[i].y)
            ctx!.lineTo(stars[j].x, stars[j].y)
            ctx!.strokeStyle = `rgba(197,168,128,${alpha})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
            count++
          }
        }
      }
    }

    function frame(time: number) {
      ctx!.clearRect(0, 0, w, h)

      // Deep space gradient base
      const bgGrad = ctx!.createLinearGradient(0, 0, 0, h)
      bgGrad.addColorStop(0, "#050510")
      bgGrad.addColorStop(0.3, "#080812")
      bgGrad.addColorStop(0.6, "#0a0a14")
      bgGrad.addColorStop(1, "#080810")
      ctx!.fillStyle = bgGrad
      ctx!.fillRect(0, 0, w, h)

      drawNebulae(time)
      drawConstellations(time)
      drawStars(time)
      drawShootingStars(time)

      animId = requestAnimationFrame(frame)
    }

    resize()
    animId = requestAnimationFrame(frame)

    // Debounced resize
    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 200)
    }
    window.addEventListener("resize", onResize)

    // Also re-measure height when content changes
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 300)
    })
    resizeObserver.observe(document.body)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", onResize)
      resizeObserver.disconnect()
    }
  }, [config])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "transparent" }}
    />
  )
}
