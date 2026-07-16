"use client"
import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

interface Props {
  imageUrl: string
  isScanning: boolean
  onComplete?: () => void
}

/**
 * FaceScanAnimation — Canvas-based laser scan overlay for face/palm images.
 */
export function FaceScanAnimation({ imageUrl, isScanning, onComplete }: Props) {
  const { t } = useLanguage()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(true)
  const [phase, setPhase] = useState<"scanning" | "highlight" | "done">("scanning")
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
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      let startTime: number | null = null
      const SCAN_DURATION = 2500
      const HIGHLIGHT_DURATION = 800

      const scanText = t("faceScan.scanning")
      const completeText = t("faceScan.complete")

      const featureLabels = [
        t("faceScan.forehead"),
        t("faceScan.noseTip"),
        t("faceScan.leftCheek"),
        t("faceScan.rightCheek"),
        t("faceScan.jaw"),
        t("faceScan.leftEye"),
        t("faceScan.rightEye"),
      ]

      function drawScan(timestamp: number) {
        if (!ctx) return
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime

        if (elapsed < SCAN_DURATION) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 0.6
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 1.0

          const progress = elapsed / SCAN_DURATION
          const y = progress * canvas.height

          const gradient = ctx.createLinearGradient(0, y - 15, 0, y + 15)
          gradient.addColorStop(0, "rgba(201, 168, 76, 0)")
          gradient.addColorStop(0.4, "rgba(201, 168, 76, 0.7)")
          gradient.addColorStop(0.5, "rgba(201, 168, 76, 1)")
          gradient.addColorStop(0.6, "rgba(201, 168, 76, 0.7)")
          gradient.addColorStop(1, "rgba(201, 168, 76, 0)")

          ctx.fillStyle = gradient
          ctx.fillRect(0, y - 15, canvas.width, 30)

          ctx.fillStyle = "rgba(201, 168, 76, 0.8)"
          ctx.font = "14px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(scanText, canvas.width / 2, 30)

          animFrame.current = requestAnimationFrame(drawScan)
        } else if (elapsed < SCAN_DURATION + HIGHLIGHT_DURATION) {
          setPhase("highlight")
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 0.7
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 1.0

          const hlProgress = (elapsed - SCAN_DURATION) / HIGHLIGHT_DURATION
          const pulse = 0.4 + 0.6 * Math.abs(Math.sin(hlProgress * Math.PI * 3))

          const featurePositions = [
            { x: canvas.width * 0.5, y: canvas.height * 0.2 },
            { x: canvas.width * 0.5, y: canvas.height * 0.55 },
            { x: canvas.width * 0.3, y: canvas.height * 0.45 },
            { x: canvas.width * 0.7, y: canvas.height * 0.45 },
            { x: canvas.width * 0.5, y: canvas.height * 0.75 },
            { x: canvas.width * 0.35, y: canvas.height * 0.38 },
            { x: canvas.width * 0.65, y: canvas.height * 0.38 },
          ]

          featurePositions.forEach((f, idx) => {
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
            ctx.fillText(featureLabels[idx] || "", f.x, f.y - 12)
          })

          ctx.fillStyle = "rgba(201, 168, 76, 0.8)"
          ctx.font = "14px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(completeText, canvas.width / 2, 30)

          animFrame.current = requestAnimationFrame(drawScan)
        } else {
          setPhase("done")
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          setTimeout(() => {
            setVisible(false)
            onComplete?.()
          }, 400)
        }
      }

      animFrame.current = requestAnimationFrame(drawScan)
    }

    return () => cancelAnimationFrame(animFrame.current)
  }, [isScanning, imageUrl, onComplete, t])

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
