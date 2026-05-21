import { View } from "@tarojs/components"

const PARTICLES = [
  { x: 8, y: 12, s: 3, d: 3, a: "twinkle" },
  { x: 85, y: 8, s: 2, d: 4, a: "twinkle" },
  { x: 22, y: 35, s: 4, d: 3.5, a: "drift" },
  { x: 70, y: 25, s: 2, d: 5, a: "twinkle" },
  { x: 45, y: 55, s: 3, d: 4.5, a: "drift" },
  { x: 15, y: 70, s: 2, d: 3, a: "twinkle" },
  { x: 90, y: 60, s: 3, d: 4, a: "drift" },
  { x: 55, y: 80, s: 2, d: 3.5, a: "twinkle" },
  { x: 35, y: 15, s: 2, d: 5, a: "twinkle" },
  { x: 75, y: 45, s: 3, d: 4, a: "drift" },
]

interface StarBackgroundProps {
  variant?: "default" | "glow"
}

export default function StarBackground({ variant = "default" }: StarBackgroundProps) {
  return (
    <View style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" as const }}>
      {/* 径向渐变光晕 */}
      <View style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: variant === "glow"
          ? "radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(201,168,76,0.07) 0%, transparent 50%)"
          : "radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(201,168,76,0.04) 0%, transparent 50%)",
        animation: "glowPulse 8s ease-in-out infinite",
      }} />
      {/* 星星粒子 */}
      {PARTICLES.map((s, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: s.x + "%",
            top: s.y + "%",
            width: s.s + "rpx",
            height: s.s + "rpx",
            borderRadius: "50%",
            backgroundColor: i % 3 === 0 ? "rgba(201,168,76,0.6)" : "rgba(255,255,255,0.5)",
            animation: s.a + " " + s.d + "s ease-in-out infinite",
          }}
        />
      ))}
    </View>
  )
}
