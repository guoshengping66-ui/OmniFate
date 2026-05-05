"use client"
import { useEffect, useRef, useState } from "react"

interface Props {
  imageUrl: string
  isScanning: boolean
  onComplete?: () => void
}

/**
 * FaceScanAnimation — Canvas-based laser scan overlay for face/palm images.
 *
 * 1. Renders the user's uploaded image as background
 * 2. Animates a gold gradient scan line top-to-bottom (3s)
 * 3. On complete, briefly highlights key zones with pulsing dots
 * 4. Fades out with configurable callback
 */
export function FaceScanAnimation({ imageUrl, isScanning, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(true)
  const [phase, setPhase] = useState<"scanning" | "highlight" | "done">("scanning")
  const scanPos = useRef(0)
  const animFrame = useRef(0)

  useEffect(() => {
    if (!isScanning || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl
    img.onload = () => {
      // Fit canvas to image
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      let startTime: number | null = null
      const SCAN_DURATION = 2500 // ms
      const HIGHLIGHT_DURATION = 800 // ms

      function drawScan(timestamp: number) {
        if (!ctx) return
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime

        if (elapsed < SCAN_DURATION) {
          // — SCANNING PHASE —
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          // Draw dimmed image
          ctx.globalAlpha = 0.6
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 1.0

          // Scan line position (top to bottom)
          const progress = elapsed / SCAN_DURATION
          const y = progress * canvas.height

          // Gradient scan line
          const gradient = ctx.createLinearGradient(0, y - 15, 0, y + 15)
          gradient.addColorStop(0, "rgba(201, 168, 76, 0)")
          gradient.addColorStop(0.4, "rgba(201, 168, 76, 0.7)")
          gradient.addColorStop(0.5, "rgba(201, 168, 76, 1)")
          gradient.addColorStop(0.6, "rgba(201, 168, 76, 0.7)")
          gradient.addColorStop(1, "rgba(201, 168, 76, 0)")

          ctx.fillStyle = gradient
          ctx.fillRect(0, y - 15, canvas.width, 30)

          // Scan text at top
          ctx.fillStyle = "rgba(201, 168, 76, 0.8)"
          ctx.font = "14px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("🔍 面部特征扫描中…", canvas.width / 2, 30)

          animFrame.current = requestAnimationFrame(drawScan)
        } else if (elapsed < SCAN_DURATION + HIGHLIGHT_DURATION) {
          // — HIGHLIGHT PHASE —
          setPhase("highlight")
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 0.7
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 1.0

          // Pulse effect on key facial zones (simplified)
          const hlProgress = (elapsed - SCAN_DURATION) / HIGHLIGHT_DURATION
          const pulse = 0.4 + 0.6 * Math.abs(Math.sin(hlProgress * Math.PI * 3))

          // Highlight points (approximate facial feature positions)
          const features = [
            { x: canvas.width * 0.5, y: canvas.height * 0.2, label: "额头" },
            { x: canvas.width * 0.5, y: canvas.height * 0.55, label: "鼻头" },
            { x: canvas.width * 0.3, y: canvas.height * 0.45, label: "左颧" },
            { x: canvas.width * 0.7, y: canvas.height * 0.45, label: "右颧" },
            { x: canvas.width * 0.5, y: canvas.height * 0.75, label: "地阁" },
            { x: canvas.width * 0.35, y: canvas.height * 0.38, label: "左眼" },
            { x: canvas.width * 0.65, y: canvas.height * 0.38, label: "右眼" },
          ]

          features.forEach(f => {
            ctx.beginPath()
            ctx.arc(f.x, f.y, 5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(201, 168, 76, ${pulse})`
            ctx.fill()
            ctx.strokeStyle = `rgba(201, 168, 76, ${pulse * 0.7})`
            ctx.lineWidth = 1.5
            ctx.stroke()

            ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
            ctx.font = "11px sans-serif"
            ctx.textAlign = "center"
            ctx.fillText(f.label, f.x, f.y - 12)
          })

          ctx.fillStyle = "rgba(201, 168, 76, 0.8)"
          ctx.font = "14px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("✅ 特征识别完成", canvas.width / 2, 30)

          animFrame.current = requestAnimationFrame(drawScan)
        } else {
          // — DONE —
          setPhase("done")
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Fade out and complete
          setTimeout(() => {
            setVisible(false)
            onComplete?.()
          }, 400)
        }
      }

      animFrame.current = requestAnimationFrame(drawScan)
    }

    return () => cancelAnimationFrame(animFrame.current)
  }, [isScanning, imageUrl, onComplete])

  if (!visible) return null

  return (
    <div className={`relative rounded-xl overflow-hidden border border-gold/30
      transition-all duration-500 ${phase === "done" ? "opacity-0" : "opacity-100"}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-auto max-h-80 object-contain"
        style={{ backgroundColor: "#1a0f2e" }}
      />
    </div>
  )
}
