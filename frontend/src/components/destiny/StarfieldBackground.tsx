"use client"
import { useEffect, useRef, useMemo } from "react"

/**
 * Full-page animated starfield background.
 * Renders a canvas with:
 *  - Layered star field (parallax depth)
 *  - Nebula clouds (soft colour blobs)
 *  - Shooting stars (occasional streaks)
 *  - Constellation lines (faint connections)
 *  - Floating I Ching trigrams & tarot symbols (subtle mystic atmosphere)
 *
 * Performance: single <canvas>, requestAnimationFrame loop, no React re-renders.
 */

interface Star {
  x: number; y: number; r: number; a: number; speed: number; twinklePhase: number; twinkleSpeed: number
}
interface Nebula {
  x: number; y: number; rx: number; ry: number; color: string; driftX: number; driftY: number
}
interface ShootingStar {
  x: number; y: number; angle: number; speed: number; length: number; life: number; maxLife: number
}
interface FloatingSymbol {
  char: string; x: number; y: number; size: number; alpha: number; rotation: number
  driftY: number; rotSpeed: number; alphaPhase: number; alphaSpeed: number; color: string
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const config = useMemo(() => ({
    starCount: 280,
    nebulaCount: 5,
    symbolCount: 30,
    shootingStarInterval: 4000,
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
    let floatingSymbols: FloatingSymbol[] = []
    let lastShootingStar = 0
    let constellationCache: { i: number; j: number; alpha: number }[] = []
    let constellationFrame = 0
    let bgGradient: CanvasGradient | null = null
    let glowSprite: HTMLCanvasElement | null = null

    // I Ching + Tarot symbol pool
    const SYMBOLS = [
      // 八卦 trigrams
      "☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷",
      // 五行 elements
      "金", "木", "水", "火", "土",
      // 核心符号
      "☯",
      // Tarot / cosmic
      "★", "✦", "◇", "✧",
      // 天干地支 hints
      "甲", "癸",
      // 经典符号
      "☰", "☯",
    ]

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const oldW = w, oldH = h
      w = window.innerWidth
      h = document.documentElement.scrollHeight
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = w + "px"
      canvas!.style.height = h + "px"
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Cache background gradient (same every frame, only changes on height change)
      bgGradient = ctx!.createLinearGradient(0, 0, 0, h)
      bgGradient.addColorStop(0, "#050510")
      bgGradient.addColorStop(0.3, "#080812")
      bgGradient.addColorStop(0.6, "#0a0a14")
      bgGradient.addColorStop(1, "#080810")

      // Create glow sprite once (replaces per-frame radialGradient for star glow)
      if (!glowSprite) {
        glowSprite = document.createElement("canvas")
        glowSprite.width = 14; glowSprite.height = 14
        const gCtx = glowSprite.getContext("2d")!
        const gGrad = gCtx.createRadialGradient(7, 7, 0, 7, 7, 7)
        gGrad.addColorStop(0, "rgba(197,168,128,0.15)")
        gGrad.addColorStop(1, "rgba(197,168,128,0)")
        gCtx.fillStyle = gGrad
        gCtx.fillRect(0, 0, 14, 14)
      }

      if (oldW > 0 && oldH > 0) {
        // Scale existing objects proportionally instead of reinitializing
        const sx = w / oldW, sy = h / oldH
        for (const s of stars) { s.x *= sx; s.y *= sy }
        for (const n of nebulae) { n.x *= sx; n.y *= sy }
        for (const sym of floatingSymbols) { sym.x *= sx; sym.y *= sy }
        // Invalidate constellation cache after positions change
        constellationCache = []
      } else {
        initStars()
        initNebulae()
        initSymbols()
      }
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
        driftX: (Math.random() - 0.5) * 0.15,
        driftY: (Math.random() - 0.5) * 0.1,
      }))
    }

    function initSymbols() {
      const symbolColors = [
        "rgba(197,168,128,",  // gold — primary
        "rgba(200,180,100,",  // warm gold
        "rgba(160,180,220,",  // cool blue
        "rgba(180,150,210,",  // purple
      ]
      floatingSymbols = Array.from({ length: config.symbolCount }, (_, i) => {
        // 5 "focal" symbols are bigger and brighter
        const isFocal = i < 5
        return {
          char: isFocal
            ? ["☯", "☰", "☱", "☲", "☳"][i]
            : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          x: Math.random() * w,
          y: Math.random() * h,
          size: isFocal ? Math.random() * 12 + 32 : Math.random() * 14 + 16,
          alpha: 0,
          rotation: Math.random() * Math.PI * 2,
          driftY: -(Math.random() * 0.2 + 0.05),
          rotSpeed: (Math.random() - 0.5) * 0.004,
          alphaPhase: Math.random() * Math.PI * 2,
          alphaSpeed: Math.random() * 0.004 + 0.001,
          color: isFocal ? "rgba(197,168,128," : symbolColors[Math.floor(Math.random() * symbolColors.length)],
        }
      })
    }

    function spawnShootingStar(time: number) {
      if (time - lastShootingStar < config.shootingStarInterval) return
      lastShootingStar = time
      const angle = Math.random() * 0.4 + 0.3
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

        if (s.r > 1.3) {
          ctx!.fillStyle = `rgba(197,168,128,${alpha})`
        } else if (s.r < 0.6) {
          ctx!.fillStyle = `rgba(160,180,220,${alpha * 0.8})`
        } else {
          ctx!.fillStyle = `rgba(255,255,255,${alpha})`
        }
        ctx!.fill()

        if (s.r > 1.2 && glowSprite) {
          const spriteSize = s.r * 6
          ctx!.globalAlpha = alpha
          ctx!.drawImage(glowSprite, s.x - spriteSize / 2, s.y - spriteSize / 2, spriteSize, spriteSize)
          ctx!.globalAlpha = 1
        }
      }
    }

    function drawNebulae(time: number) {
      for (const n of nebulae) {
        n.x += n.driftX
        n.y += n.driftY
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

        ctx!.beginPath()
        ctx!.arc(ss.x, ss.y, 2, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(255,255,255,${alpha * 0.9})`
        ctx!.fill()

        return true
      })
    }

    function drawFloatingSymbols(time: number) {
      for (const sym of floatingSymbols) {
        // Update position — float upward slowly
        sym.y += sym.driftY
        sym.rotation += sym.rotSpeed
        sym.alphaPhase += sym.alphaSpeed

        // Wrap vertically
        if (sym.y < -50) {
          sym.y = h + 50
          sym.x = Math.random() * w
        }

        // Breathing alpha: 0.08 ~ 0.22
        sym.alpha = 0.08 + 0.14 * (0.5 + 0.5 * Math.sin(sym.alphaPhase))

        ctx!.save()
        ctx!.translate(sym.x, sym.y)
        ctx!.rotate(sym.rotation)
        ctx!.font = `${sym.size}px serif`
        ctx!.textAlign = "center"
        ctx!.textBaseline = "middle"

        // Single draw with moderate shadow (replaces 2-pass double-draw)
        ctx!.shadowColor = sym.color + "0.4)"
        ctx!.shadowBlur = 14
        ctx!.fillStyle = `${sym.color}${sym.alpha})`
        ctx!.fillText(sym.char, 0, 0)
        ctx!.shadowBlur = 0

        ctx!.restore()
      }
    }

    function rebuildConstellationCache() {
      constellationCache = []
      const maxDist = 120
      for (let i = 0; i < stars.length; i++) {
        if (stars[i].r <= 0.8) continue
        for (let j = i + 1; j < stars.length; j++) {
          if (stars[j].r <= 0.8) continue
          const dx = stars[i].x - stars[j].x
          const dy = stars[i].y - stars[j].y
          if (dx * dx + dy * dy < maxDist * maxDist) {
            constellationCache.push({
              i, j,
              alpha: (1 - Math.sqrt(dx * dx + dy * dy) / maxDist) * 0.04,
            })
            if (constellationCache.length >= 40) return
          }
        }
      }
    }

    function drawConstellations(time: number) {
      // Recompute every 10 frames instead of every frame (O(n²) → amortized)
      constellationFrame++
      if (constellationFrame % 10 === 0) rebuildConstellationCache()

      ctx!.lineWidth = 0.5
      for (const conn of constellationCache) {
        ctx!.beginPath()
        ctx!.moveTo(stars[conn.i].x, stars[conn.i].y)
        ctx!.lineTo(stars[conn.j].x, stars[conn.j].y)
        ctx!.strokeStyle = `rgba(197,168,128,${conn.alpha})`
        ctx!.stroke()
      }
    }

    function frame(time: number) {
      ctx!.clearRect(0, 0, w, h)

      ctx!.fillStyle = bgGradient!
      ctx!.fillRect(0, 0, w, h)

      drawNebulae(time)
      drawConstellations(time)
      drawStars(time)
      drawFloatingSymbols(time)
      drawShootingStars(time)

      animId = requestAnimationFrame(frame)
    }

    resize()
    animId = requestAnimationFrame(frame)

    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 200)
    }
    window.addEventListener("resize", onResize)

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
