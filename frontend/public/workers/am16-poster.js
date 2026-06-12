// AM16 Poster Canvas Web Worker
// Receives text data, generates 750×1334 poster, returns blob URL

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const chars = text.split("")
  let line = ""
  let currentY = y
  let lineCount = 1
  for (const char of chars) {
    const testLine = line + char
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      if (maxLines && lineCount >= maxLines) {
        ctx.fillText(line.slice(0, -1) + "…", x, currentY)
        return currentY
      }
      ctx.fillText(line, x, currentY)
      line = char
      currentY += lineHeight
      lineCount++
    } else {
      line = testLine
    }
  }
  if (line) ctx.fillText(line, x, currentY)
  return currentY
}

self.onmessage = function (e) {
  const { code, emoji, title, quote, quoteExplain, diagnosis, advice, inviteCode, poster, fateLevel, destinyPower } = e.data

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
  ctx.fillText(title, 375, 340)

  // Emoji
  ctx.font = "80px serif"
  ctx.fillText(emoji, 375, 440)

  // Fate Level + Power
  if (fateLevel && destinyPower) {
    ctx.font = "bold 28px sans-serif"
    ctx.fillStyle = "#C9A84C"
    ctx.fillText(`${fateLevel.emoji} ${poster.fateLevel}: ${fateLevel.name}`, 375, 500)
    ctx.font = "24px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.fillText(`${poster.power}: ${destinyPower.total}`, 375, 535)
    ctx.font = "20px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.5)"
    ctx.fillText(`${poster.beat.replace("{percent}", fateLevel.beatPercent)}`, 375, 565)
  }

  // Quote
  ctx.fillStyle = "rgba(201,168,76,0.8)"
  ctx.font = "italic 28px serif"
  ctx.fillText(`"${quote}"`, 375, 620)

  // Quote explain
  ctx.fillStyle = "rgba(255,255,255,0.5)"
  ctx.font = "22px sans-serif"
  ctx.fillText(quoteExplain, 375, 660)

  // Divider
  ctx.strokeStyle = "rgba(201,168,76,0.2)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(150, 700)
  ctx.lineTo(600, 700)
  ctx.stroke()

  // Diagnosis header
  ctx.fillStyle = "rgba(255,255,255,0.7)"
  ctx.font = "bold 24px sans-serif"
  ctx.fillText(poster.diagnosis, 375, 750)

  // Diagnosis body (max 6 lines)
  ctx.font = "20px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.5)"
  const diagEnd = wrapText(ctx, diagnosis, 375, 790, 580, 28, 6)

  // Guide header
  ctx.fillStyle = "rgba(255,255,255,0.7)"
  ctx.font = "bold 24px sans-serif"
  const guideY = Math.max(diagEnd + 40, 980)
  ctx.fillText(poster.guide, 375, guideY)

  // Guide body (max 5 lines)
  ctx.font = "20px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.5)"
  wrapText(ctx, advice, 375, guideY + 40, 580, 28, 5)

  // CTA
  ctx.fillStyle = "#C9A84C"
  ctx.font = "bold 28px sans-serif"
  ctx.fillText(poster.scan, 375, 1170)

  // Invite code
  ctx.fillStyle = "rgba(255,255,255,0.3)"
  ctx.font = "18px sans-serif"
  ctx.fillText(`${poster.stardust}${inviteCode}`, 375, 1220)

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
