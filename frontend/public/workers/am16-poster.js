// AM16 Poster Canvas Web Worker
// Receives text data, generates 750×1334 poster, returns blob URL

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split("")
  let line = ""
  let currentY = y
  for (const char of chars) {
    const testLine = line + char
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY)
      line = char
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) ctx.fillText(line, x, currentY)
}

self.onmessage = function (e) {
  const { code, emoji, title, quote, quoteExplain, diagnosis, advice, inviteCode, poster } = e.data

  let canvas
  try {
    canvas = new OffscreenCanvas(750, 1334)
  } catch {
    // OffscreenCanvas not supported — post error back
    self.postMessage({ error: "OffscreenCanvas not supported" })
    return
  }

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    self.postMessage({ error: "Failed to get canvas context" })
    return
  }

  // Background
  const grad = ctx.createLinearGradient(0, 0, 750, 1334)
  grad.addColorStop(0, "#1a1030")
  grad.addColorStop(0.5, "#2D1B4E")
  grad.addColorStop(1, "#140f24")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 750, 1334)

  // Glow circle
  ctx.fillStyle = "rgba(201,168,76,0.08)"
  ctx.beginPath()
  ctx.arc(375, 350, 280, 0, Math.PI * 2)
  ctx.fill()

  ctx.textAlign = "center"

  // Title
  ctx.fillStyle = "#C9A84C"
  ctx.font = "bold 32px sans-serif"
  ctx.fillText(poster.title, 375, 100)

  // Code
  ctx.font = "bold 120px sans-serif"
  ctx.shadowColor = "rgba(201,168,76,0.6)"
  ctx.shadowBlur = 30
  ctx.fillText(code, 375, 280)
  ctx.shadowBlur = 0

  // Personality title
  ctx.font = "bold 36px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.9)"
  ctx.fillText(title, 375, 360)

  // Emoji
  ctx.font = "80px serif"
  ctx.fillText(emoji, 375, 470)

  // Quote
  ctx.fillStyle = "rgba(201,168,76,0.8)"
  ctx.font = "italic 28px serif"
  ctx.fillText(`"${quote}"`, 375, 560)

  // Quote explain
  ctx.fillStyle = "rgba(255,255,255,0.5)"
  ctx.font = "22px sans-serif"
  ctx.fillText(quoteExplain, 375, 600)

  // Divider
  ctx.strokeStyle = "rgba(201,168,76,0.2)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(150, 640)
  ctx.lineTo(600, 640)
  ctx.stroke()

  // Diagnosis header
  ctx.fillStyle = "rgba(255,255,255,0.7)"
  ctx.font = "bold 24px sans-serif"
  ctx.fillText(poster.diagnosis, 375, 700)

  // Diagnosis body
  ctx.font = "20px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.5)"
  wrapText(ctx, diagnosis, 375, 740, 580, 28)

  // Guide header
  ctx.fillStyle = "rgba(255,255,255,0.7)"
  ctx.font = "bold 24px sans-serif"
  ctx.fillText(poster.guide, 375, 920)

  // Guide body
  ctx.font = "20px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.5)"
  wrapText(ctx, advice, 375, 960, 580, 28)

  // CTA
  ctx.fillStyle = "#C9A84C"
  ctx.font = "bold 28px sans-serif"
  ctx.fillText(poster.scan, 375, 1130)

  // Invite code
  ctx.fillStyle = "rgba(255,255,255,0.3)"
  ctx.font = "18px sans-serif"
  ctx.fillText(`${poster.stardust}${inviteCode}`, 375, 1180)

  // Brand
  ctx.font = "16px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.2)"
  ctx.fillText(poster.brand, 375, 1300)

  // Convert to blob and post back
  canvas.convertToBlob({ type: "image/png" }).then(blob => {
    const url = URL.createObjectURL(blob)
    self.postMessage({ url })
  }).catch(err => {
    self.postMessage({ error: err.message })
  })
}
