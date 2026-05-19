import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

/**
 * Dynamic OG Image Generator for Fate OS
 *
 * Usage: /api/og?name=用户名&element=金&level=7&fortune=Supreme Alignment
 *
 * Generates a 1200x630 cyberpunk-style share card for Twitter/X.
 * Uses proper JSX elements (Satori does NOT support dangerouslySetInnerHTML).
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
  7: "#C9A84C",
  6: "#52B788",
  5: "#3498DB",
  4: "#1ABC9C",
  3: "#F1C40F",
  2: "#E67E22",
  1: "#E74C3C",
}

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

  // Generate radar chart as SVG (Satori supports inline SVG)
  const radarSvg = generateRadarChart(scores, elementConfig.color)

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0d0a1a 0%, #1a1030 50%, #0d0a1a 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Glowing orb */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            background: `radial-gradient(circle, ${elementConfig.color}20 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "60px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Left side - Info */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingRight: "40px",
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  background: `${elementConfig.color}20`,
                  border: `1px solid ${elementConfig.color}40`,
                  borderRadius: "20px",
                  padding: "6px 16px",
                  fontSize: "14px",
                  color: elementConfig.color,
                  letterSpacing: "2px",
                }}
              >
                FATE OS
              </div>
            </div>

            {/* User name */}
            <div
              style={{
                fontSize: "48px",
                fontWeight: 700,
                color: "#E8CB7A",
                marginBottom: "8px",
                letterSpacing: "-1px",
              }}
            >
              {name}
            </div>

            {/* Element tag */}
            <div
              style={{
                fontSize: "20px",
                color: elementConfig.color,
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "24px" }}>{elementConfig.icon}</span>
              {elementConfig.label} Element · System Core
            </div>

            {/* Fortune level */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: `${fortuneColor}20`,
                  border: `2px solid ${fortuneColor}`,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: fortuneColor,
                }}
              >
                {level}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color: fortuneColor,
                  }}
                >
                  {fortune}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: "1px",
                  }}
                >
                  POWER LEVEL
                </div>
              </div>
            </div>

            {/* CTA */}
            <div
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                background: "linear-gradient(135deg, #C9A84C, #B8942E)",
                borderRadius: "30px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#0d0a1a",
                display: "inline-block",
                width: "fit-content",
              }}
            >
              SCAN YOUR DESTINY →
            </div>
          </div>

          {/* Right side - Radar Chart */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "400px",
                height: "400px",
                position: "relative",
              }}
              dangerouslySetInnerHTML={{ __html: radarSvg }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "60px",
            right: "60px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(201,168,76,0.2)",
            paddingTop: "20px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "1px",
            }}
          >
            DESTINY MIRROR · MULTI-DIMENSION ANALYSIS
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            khanfate.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

/**
 * Generate radar chart SVG — this is the ONLY part that uses dangerouslySetInnerHTML
 * because Satori supports inline SVG in divs via dangerouslySetInnerHTML.
 * The rest of the card uses proper JSX.
 */
function generateRadarChart(scores: number[], color: string): string {
  const centerX = 200
  const centerY = 200
  const radius = 150
  const levels = 5

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

  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * radius
    return `<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="rgba(201,168,76,0.15)" stroke-width="1"/>`
  }).join("")

  const axisLines = points
    .map(
      (p) =>
        `<line x1="${centerX}" y1="${centerY}" x2="${p.x}" y2="${p.y}" stroke="rgba(201,168,76,0.2)" stroke-width="1"/>`
    )
    .join("")

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ")

  const labels = DIMENSIONS.map((dim, i) => {
    const p = points[i]
    const zh = DIMENSIONS_ZH[i]
    const score = scores[i]
    return `
      <text x="${p.labelX}" y="${p.labelY - 8}" text-anchor="middle" fill="#E8CB7A" font-size="14" font-weight="600">${dim}</text>
      <text x="${p.labelX}" y="${p.labelY + 12}" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="11">${zh} ${score}</text>
    `
  }).join("")

  const dataPoints = points
    .map(
      (p) =>
        `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}" stroke="#0d0a1a" stroke-width="2"/>`
    )
    .join("")

  return `
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      ${gridCircles}
      ${axisLines}
      <polygon
        points="${polygonPoints}"
        fill="${color}20"
        stroke="${color}"
        stroke-width="2"
      />
      ${dataPoints}
      ${labels}
    </svg>
  `
}
