import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1A0F2E 0%, #0D0715 60%, #050208 100%)",
          position: "relative",
        }}
      >
        {/* Decorative ring */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            border: "1px solid rgba(201, 168, 76, 0.15)",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 350,
            height: 350,
            borderRadius: "50%",
            border: "1px solid rgba(201, 168, 76, 0.10)",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "1px solid rgba(201, 168, 76, 0.08)",
            background: "radial-gradient(circle, rgba(201, 168, 76, 0.10), transparent)",
            transform: "translate(-50%, -50%)",
          }}
        />
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201, 168, 76, 0.06), transparent 60%)",
            transform: "translate(-50%, -50%)",
          }}
        />
        {/* Brand */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              fontFamily: "serif",
              background: "linear-gradient(135deg, #C9A84C, #E8CB7A)",
              color: "transparent",
              backgroundClip: "text",
              lineHeight: 1.1,
            }}
          >
            Inner Atlas AI
          </span>
          <span
            style={{
              fontSize: 24,
              color: "rgba(255, 255, 255, 0.65)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            AI Life Reports &amp; Daily Action
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
