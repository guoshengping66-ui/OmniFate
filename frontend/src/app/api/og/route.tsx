import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

/**
 * Dynamic OG Image Generator for Fate OS
 *
 * Usage: /api/og?name=用户名&element=金&level=7&fortune=Supreme Alignment
 *
 * Generates a 1200x630 cyberpunk-style share card for Twitter/X
 */

// Element colors and icons
const ELEMENT_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  木: { color: "#52B788", icon: "🌿", label: "Wood" },
  火: { color: "#E63946", icon: "🔥", label: "Fire" },
  土: { color: "#C9A84C", icon: "🪨", label: "Earth" },
  金: { color: "#E8E8E8", icon: "⚔️", label: "Metal" },
  水: { color: "#2980B9", icon: "💧", label: "Water" },
}

// Fortune level colors
const FORTUNE_COLORS: Record<number, string> = {
  7: "#C9A84C", // 大吉 - Gold
  6: "#52B788", // 中吉 - Green
  5: "#3498DB", // 小吉 - Blue
  4: "#1ABC9C", // 吉 - Teal
  3: "#F1C40F", // 末吉 - Yellow
  2: "#E67E22", // 凶 - Orange
  1: "#E74C3C", // 大凶 - Red
}

// Radar chart dimensions
const DIMENSIONS = ["Wealth", "Career", "Bonds", "Health", "Protocol"]
const DIMENSIONS_ZH = ["财运", "事业", "感情", "健康", "学业"]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const name = searchParams.get("name") || "User"
  const element = searchParams.get("element") || "金"
  const level = parseInt(searchParams.get("level") || "5")
  const fortune = searchParams.get("fortune") || "System Analysis"
  const scores = searchParams.get("scores")?.split(",").map(Number) || [70, 85, 60, 75, 80]

  const elementConfig = ELEMENT_CONFIG[element] || ELEMENT_CONFIG["金"]
  const fortuneColor = FORTUNE_COLORS[level] || "#C9A84C"

  // Generate radar chart SVG
  const radarSvg = generateRadarChart(scores, elementConfig.color)

  const html = `
    <div style="
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #0d0a1a 0%, #1a1030 50%, #0d0a1a 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      position: relative;
      overflow: hidden;
    ">
      <!-- Background grid pattern -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image:
          linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px);
        background-size: 50px 50px;
      "></div>

      <!-- Glowing orb -->
      <div style="
        position: absolute;
        top: -100px;
        right: -100px;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, ${elementConfig.color}20 0%, transparent 70%);
        border-radius: 50%;
        filter: blur(60px);
      "></div>

      <!-- Main content -->
      <div style="
        display: flex;
        width: 100%;
        height: 100%;
        padding: 60px;
        position: relative;
        z-index: 1;
      ">
        <!-- Left side - Info -->
        <div style="
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-right: 40px;
        ">
          <!-- Badge -->
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 20px;
          ">
            <div style="
              background: ${elementConfig.color}20;
              border: 1px solid ${elementConfig.color}40;
              border-radius: 20px;
              padding: 6px 16px;
              font-size: 14px;
              color: ${elementConfig.color};
              letter-spacing: 2px;
              text-transform: uppercase;
            ">
              FATE OS
            </div>
          </div>

          <!-- User name -->
          <div style="
            font-size: 48px;
            font-weight: 700;
            color: #E8CB7A;
            margin-bottom: 8px;
            letter-spacing: -1px;
          ">
            ${name}
          </div>

          <!-- Element tag -->
          <div style="
            font-size: 20px;
            color: ${elementConfig.color};
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span style="font-size: 24px;">${elementConfig.icon}</span>
            ${elementConfig.label} Element · System Core
          </div>

          <!-- Fortune level -->
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          ">
            <div style="
              width: 60px;
              height: 60px;
              background: ${fortuneColor}20;
              border: 2px solid ${fortuneColor};
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              font-weight: 700;
              color: ${fortuneColor};
            ">
              ${level}
            </div>
            <div>
              <div style="
                font-size: 24px;
                font-weight: 600;
                color: ${fortuneColor};
              ">
                ${fortune}
              </div>
              <div style="
                font-size: 14px;
                color: rgba(255,255,255,0.5);
                letter-spacing: 1px;
              ">
                POWER LEVEL
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div style="
            margin-top: 20px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #C9A84C, #B8942E);
            border-radius: 30px;
            font-size: 16px;
            font-weight: 600;
            color: #0d0a1a;
            display: inline-block;
            width: fit-content;
          ">
            SCAN YOUR DESTINY →
          </div>
        </div>

        <!-- Right side - Radar Chart -->
        <div style="
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 400px;
            height: 400px;
            position: relative;
          ">
            ${radarSvg}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="
        position: absolute;
        bottom: 30px;
        left: 60px;
        right: 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(201,168,76,0.2);
        padding-top: 20px;
      ">
        <div style="
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1px;
        ">
          DESTINY MIRROR · MULTI-DIMENSION ANALYSIS
        </div>
        <div style="
          font-size: 14px;
          color: rgba(255,255,255,0.4);
        ">
          khanfate.com
        </div>
      </div>
    </div>
  `

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0d0a1a 0%, #1a1030 50%, #0d0a1a 100%)",
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

function generateRadarChart(scores: number[], color: string): string {
  const centerX = 200
  const centerY = 200
  const radius = 150
  const levels = 5

  // Calculate points for each dimension
  const angleStep = (2 * Math.PI) / DIMENSIONS.length
  const points = scores.map((score, i) => {
    const angle = angleStep * i - Math.PI / 2
    const r = (score / 100) * radius
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
      labelX: centerX + (radius + 30) * Math.cos(angle),
      labelY: centerY + (radius + 30) * Math.sin(angle),
    }
  })

  // Generate grid circles
  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * radius
    return `<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="rgba(201,168,76,0.15)" stroke-width="1"/>`
  }).join("")

  // Generate axis lines
  const axisLines = points
    .map(
      (p) =>
        `<line x1="${centerX}" y1="${centerY}" x2="${p.x}" y2="${p.y}" stroke="rgba(201,168,76,0.2)" stroke-width="1"/>`
    )
    .join("")

  // Generate data polygon
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ")

  // Generate labels
  const labels = DIMENSIONS.map((dim, i) => {
    const p = points[i]
    const zh = DIMENSIONS_ZH[i]
    const score = scores[i]
    return `
      <text x="${p.labelX}" y="${p.labelY - 8}" text-anchor="middle" fill="#E8CB7A" font-size="14" font-weight="600">${dim}</text>
      <text x="${p.labelX}" y="${p.labelY + 12}" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="11">${zh} ${score}</text>
    `
  }).join("")

  // Generate data points
  const dataPoints = points
    .map(
      (p) =>
        `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}" stroke="#0d0a1a" stroke-width="2"/>`
    )
    .join("")

  return `
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Grid -->
      ${gridCircles}

      <!-- Axis lines -->
      ${axisLines}

      <!-- Data polygon -->
      <polygon
        points="${polygonPoints}"
        fill="${color}20"
        stroke="${color}"
        stroke-width="2"
      />

      <!-- Data points -->
      ${dataPoints}

      <!-- Labels -->
      ${labels}
    </svg>
  `
}
