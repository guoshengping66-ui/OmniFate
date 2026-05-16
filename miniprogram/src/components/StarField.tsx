import { View } from "@tarojs/components"

// 预定义的星星位置和参数，避免随机渲染
const STARS = [
  { x: 8, y: 12, size: 3, dur: 3, delay: 0, anim: "twinkle" },
  { x: 85, y: 8, size: 2, dur: 4, delay: 0.5, anim: "twinkle" },
  { x: 22, y: 35, size: 4, dur: 3.5, delay: 1, anim: "drift" },
  { x: 70, y: 25, size: 2, dur: 5, delay: 0.3, anim: "twinkle" },
  { x: 45, y: 55, size: 3, dur: 4.5, delay: 1.2, anim: "drift" },
  { x: 15, y: 70, size: 2, dur: 3, delay: 0.8, anim: "twinkle" },
  { x: 90, y: 60, size: 3, dur: 4, delay: 0.2, anim: "drift" },
  { x: 55, y: 80, size: 2, dur: 3.5, delay: 1.5, anim: "twinkle" },
  { x: 35, y: 15, size: 2, dur: 5, delay: 0.7, anim: "twinkle" },
  { x: 75, y: 45, size: 3, dur: 4, delay: 1, anim: "drift" },
  { x: 10, y: 50, size: 2, dur: 3.5, delay: 0.4, anim: "twinkle" },
  { x: 60, y: 10, size: 3, dur: 4.5, delay: 0.9, anim: "drift" },
  { x: 40, y: 90, size: 2, dur: 3, delay: 1.3, anim: "twinkle" },
  { x: 95, y: 75, size: 2, dur: 4, delay: 0.6, anim: "twinkle" },
  { x: 28, y: 85, size: 3, dur: 5, delay: 1.1, anim: "drift" },
  { x: 50, y: 30, size: 2, dur: 3.5, delay: 0.1, anim: "twinkle" },
  { x: 78, y: 92, size: 3, dur: 4, delay: 1.4, anim: "drift" },
  { x: 5, y: 40, size: 2, dur: 4.5, delay: 0.8, anim: "twinkle" },
  { x: 65, y: 68, size: 2, dur: 3, delay: 0.3, anim: "twinkle" },
  { x: 32, y: 5, size: 3, dur: 5, delay: 1.6, anim: "drift" },
]

export function StarField() {
  return (
    <View className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* 淡紫色 radial-gradient 光晕 — 缓慢脉动 */}
      <View className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(201,168,76,0.04) 0%, transparent 50%)",
        animation: "glowPulse 8s ease-in-out infinite",
      }} />
      {/* 星星粒子 */}
      {STARS.map((s, i) => (
        <View key={i} className="absolute rounded-full pointer-events-none" style={{
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: `${s.size}rpx`,
          height: `${s.size}rpx`,
          backgroundColor: i % 3 === 0 ? "rgba(201,168,76,0.6)" : "rgba(255,255,255,0.5)",
          animation: `${s.anim} ${s.dur}s ease-in-out infinite ${s.delay}s`,
        }} />
      ))}
    </View>
  )
}
