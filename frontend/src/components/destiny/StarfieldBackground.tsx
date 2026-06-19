"use client"
import { useEffect, useRef } from "react"

/**
 * 五层深空背景系统
 * Layer 1: 宇宙渐变
 * Layer 2: 星云（金色+紫蓝）
 * Layer 3: 八卦暗纹
 * Layer 4: 流星粒子（15个）
 * Layer 5: 命盘轨道
 */

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number; alpha: number
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (typeof window === "undefined" || !document.documentElement) return

    let animId: number
    let w = 0, h = 0
    let particles: Particle[] = []
    let bgGradient: CanvasGradient | null = null
    let paused = false

    // 八卦符号
    const BAGUA = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"]

    function resize() {
      if (!document.documentElement) return
      const dpr = Math.min(window.devicePixelRatio, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = w + "px"
      canvas!.style.height = h + "px"
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Layer 1: 宇宙渐变
      bgGradient = ctx!.createLinearGradient(0, 0, 0, h)
      bgGradient.addColorStop(0, "#050816")
      bgGradient.addColorStop(0.4, "#080F2E")
      bgGradient.addColorStop(1, "#0A1235")

      initParticles()
    }

    function initParticles() {
      // Layer 4: 流星粒子 - 最多15个
      particles = Array.from({ length: 12 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: Math.random() * 0.5 + 0.2,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.1,
      }))
    }

    function drawLayer1() {
      // 宇宙渐变背景
      ctx!.fillStyle = bgGradient!
      ctx!.fillRect(0, 0, w, h)
    }

    function drawLayer2(time: number) {
      // 星云 - 左上金色，右下紫蓝
      const breathe = 1 + 0.1 * Math.sin(time * 0.0002)

      // 左上金色星云
      const goldGrad = ctx!.createRadialGradient(
        w * 0.2, h * 0.3, 0,
        w * 0.2, h * 0.3, w * 0.4
      )
      goldGrad.addColorStop(0, "rgba(197,168,128,0.08)")
      goldGrad.addColorStop(0.5, "rgba(197,168,128,0.03)")
      goldGrad.addColorStop(1, "rgba(0,0,0,0)")
      ctx!.fillStyle = goldGrad
      ctx!.fillRect(0, 0, w, h)

      // 右下紫蓝星云
      const purpleGrad = ctx!.createRadialGradient(
        w * 0.8, h * 0.7, 0,
        w * 0.8, h * 0.7, w * 0.5
      )
      purpleGrad.addColorStop(0, "rgba(100,80,180,0.08)")
      purpleGrad.addColorStop(0.5, "rgba(80,60,160,0.03)")
      purpleGrad.addColorStop(1, "rgba(0,0,0,0)")
      ctx!.fillStyle = purpleGrad
      ctx!.fillRect(0, 0, w, h)
    }

    function drawLayer3() {
      // 八卦暗纹 - opacity 0.03
      ctx!.save()
      ctx!.font = "120px serif"
      ctx!.textAlign = "center"
      ctx!.textBaseline = "middle"
      ctx!.fillStyle = "rgba(197,168,128,0.03)"

      // 分散放置八卦符号
      const positions = [
        { x: w * 0.15, y: h * 0.2 },
        { x: w * 0.85, y: h * 0.3 },
        { x: w * 0.1, y: h * 0.6 },
        { x: w * 0.9, y: h * 0.8 },
        { x: w * 0.5, y: h * 0.15 },
        { x: w * 0.5, y: h * 0.85 },
      ]

      positions.forEach((pos, i) => {
        ctx!.fillText(BAGUA[i % BAGUA.length], pos.x, pos.y)
      })
      ctx!.restore()
    }

    function drawLayer4(time: number) {
      // 流星粒子 - 慢速移动
      ctx!.save()
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        // 边界循环
        if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10

        // 绘制粒子
        const gradient = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        gradient.addColorStop(0, `rgba(197,168,128,${p.alpha})`)
        gradient.addColorStop(1, "rgba(197,168,128,0)")

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx!.fillStyle = gradient
        ctx!.fill()

        // 核心亮点
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(255,255,255,${p.alpha * 0.8})`
        ctx!.fill()
      }
      ctx!.restore()
    }

    function drawLayer5(time: number) {
      // 命盘轨道 - 右侧区域
      const centerX = w * 0.75
      const centerY = h * 0.45

      ctx!.save()
      ctx!.translate(centerX, centerY)

      // 三层轨道环
      const orbits = [120, 180, 240]
      orbits.forEach((radius, i) => {
        const rotation = time * 0.00005 * (i % 2 === 0 ? 1 : -1)
        ctx!.save()
        ctx!.rotate(rotation)

        ctx!.beginPath()
        ctx!.arc(0, 0, radius, 0, Math.PI * 2)
        ctx!.strokeStyle = `rgba(197,168,128,${0.05 - i * 0.01})`
        ctx!.lineWidth = 1
        ctx!.stroke()

        // 轨道上的节点
        const nodeCount = 6 + i * 2
        for (let j = 0; j < nodeCount; j++) {
          const angle = (j / nodeCount) * Math.PI * 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius

          ctx!.beginPath()
          ctx!.arc(x, y, 2, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(197,168,128,${0.1 - i * 0.02})`
          ctx!.fill()
        }

        ctx!.restore()
      })

      ctx!.restore()
    }

    function frame(time: number) {
      if (paused) {
        animId = requestAnimationFrame(frame)
        return
      }
      ctx!.clearRect(0, 0, w, h)

      drawLayer1()
      drawLayer2(time)
      drawLayer3()
      drawLayer4(time)
      drawLayer5(time)

      animId = requestAnimationFrame(frame)
    }

    function onVisibilityChange() {
      paused = document.hidden
    }

    resize()
    animId = requestAnimationFrame(frame)

    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 200)
    }
    window.addEventListener("resize", onResize)
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(resizeTimer)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "transparent" }}
    />
  )
}
