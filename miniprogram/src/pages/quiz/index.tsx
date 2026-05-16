import { useState, useCallback, useMemo } from "react"
import { View, Text } from "@tarojs/components"
import Taro from "@tarojs/taro"
import { QUESTIONS, type Question } from "../../constants/am16"

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function haptic(type: "light" | "medium" | "success") {
  try {
    if (type === "success") Taro.vibrateShort({ type: "heavy" })
    else if (type === "medium") Taro.vibrateShort({ type: "medium" })
    else Taro.vibrateShort({ type: "light" })
  } catch (_) {}
}

// ── 内联样式常量 ──
const S = {
  bg: { backgroundColor: "#0A0A0A" },
  gold: { color: "#D4AF37" },
  goldBg: { backgroundColor: "#D4AF37" },
  white30: { color: "rgba(255,255,255,0.3)" },
  white50: { color: "rgba(255,255,255,0.5)" },
  white60: { color: "rgba(255,255,255,0.6)" },
  white90: { color: "rgba(255,255,255,0.9)" },
  gold50: { color: "rgba(212,175,55,0.5)" },
  goldBg10: { backgroundColor: "rgba(212,175,55,0.1)" },
  goldBg15: { backgroundColor: "rgba(212,175,55,0.15)" },
  goldBorder60: { borderColor: "rgba(212,175,55,0.6)" },
  whiteBorder10: { borderColor: "rgba(255,255,255,0.1)" },
  whiteBg4: { backgroundColor: "rgba(255,255,255,0.04)" },
  whiteBg5: { backgroundColor: "rgba(255,255,255,0.05)" },
  whiteBg10: { backgroundColor: "rgba(255,255,255,0.1)" },
}

// ── Web 级 card-glass 样式 ──
const cardGlass = {
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "1rpx solid rgba(255,255,255,0.1)",
  borderRadius: "24rpx",
  boxShadow: "0 8rpx 32rpx rgba(0,0,0,0.3), 0 0 80rpx rgba(201,168,76,0.04)",
}

// ── Web 级 card-glass-elevated 样式 ──
const cardElevated = {
  backgroundColor: "rgba(255,255,255,0.07)",
  border: "1rpx solid rgba(255,255,255,0.15)",
  borderRadius: "24rpx",
  boxShadow: "0 0 0 1rpx rgba(255,255,255,0.05), 0 8rpx 32rpx rgba(0,0,0,0.3), 0 0 80rpx rgba(201,168,76,0.06)",
}

// ── Web 级 btn-gold 样式 ──
const btnGold = {
  background: "linear-gradient(135deg, #C9A84C 0%, #E8CB7A 40%, #C9A84C 80%)",
  color: "#0A0A0A",
  borderRadius: "999rpx",
  fontWeight: "700" as const,
  boxShadow: "0 4rpx 16rpx rgba(201,168,76,0.3), 0 0 40rpx rgba(201,168,76,0.1)",
}

export default function QuizPage() {
  const questions = useMemo(() => shuffle(QUESTIONS), [])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C">>({})
  const [animating, setAnimating] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const total = questions.length
  const q: Question | undefined = questions[current]
  const progress = Math.round((current / total) * 100)

  const handleAnswer = useCallback((choice: number) => {
    if (selected !== null || animating) return
    setSelected(choice)
    haptic("light")
    const label = choice === 0 ? "A" : choice === 1 ? "B" : "C"
    const newAnswers = { ...answers, [q!.id]: label as "A" | "B" | "C" }
    setAnswers(newAnswers)
    setAnimating(true)
    setTimeout(() => {
      setSelected(null)
      setAnimating(false)
      if (current + 1 < total) {
        setCurrent(current + 1)
      } else {
        setAnalyzing(true)
        haptic("success")
        setTimeout(() => {
          Taro.setStorageSync("am16_answers", JSON.stringify(newAnswers))
          Taro.navigateTo({ url: "/pages/result/index" })
        }, 2200)
      }
    }, 350)
  }, [selected, animating, answers, current, total, q])

  // ── 分析中 ──
  if (analyzing) {
    return (
      <View className="min-h-screen flex flex-col items-center justify-center px-6" style={S.bg}>
        {/* 浮动粒子 */}
        {[0,1,2,3,4].map(i => (
          <View key={i} className="absolute pointer-events-none" style={{
            top: `${25 + i * 10}%`,
            left: `${10 + (i % 3) * 30}%`,
            width: `${3 + (i % 3) * 2}rpx`,
            height: `${3 + (i % 3) * 2}rpx`,
            borderRadius: "50%",
            backgroundColor: `rgba(212,175,55,${0.2 + (i % 3) * 0.1})`,
            animation: `float ${2.5 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
          }} />
        ))}

        <View className="relative w-80 h-80 flex items-center justify-center mb-8">
          {/* 三层轨道环 — 金色外发光 */}
          <View className="absolute inset-0 rounded-full" style={{
            border: "2rpx solid rgba(212,175,55,0.2)",
            boxShadow: "0 0 24rpx rgba(212,175,55,0.1), inset 0 0 24rpx rgba(212,175,55,0.05)",
            animation: "orbit 4s linear infinite",
          }} />
          <View className="absolute inset-8 rounded-full" style={{
            border: "1.5rpx solid rgba(212,175,55,0.15)",
            boxShadow: "0 0 18rpx rgba(212,175,55,0.08)",
            animation: "orbit 3s linear infinite reverse",
          }} />
          <View className="absolute inset-16 rounded-full" style={{
            border: "1rpx solid rgba(212,175,55,0.12)",
            boxShadow: "0 0 14rpx rgba(212,175,55,0.06)",
            animation: "orbit 2s linear infinite",
          }} />
          {/* 轨道光点 */}
          <View className="absolute pointer-events-none" style={{
            top: "0", left: "50%", width: "10rpx", height: "10rpx",
            marginLeft: "-5rpx", marginTop: "-5rpx", borderRadius: "50%",
            backgroundColor: "#C9A84C",
            boxShadow: "0 0 16rpx rgba(201,168,76,0.7), 0 0 32rpx rgba(201,168,76,0.3)",
            animation: "orbit 4s linear infinite",
          }} />
          {/* 中心符号 — 强发光 */}
          <View className="w-16 h-16 rounded-full flex items-center justify-center" style={{
            backgroundColor: "rgba(201,168,76,0.12)",
            boxShadow: "0 0 40rpx rgba(201,168,76,0.15), inset 0 0 20rpx rgba(201,168,76,0.1)",
          }}>
            <Text className="text-2xl" style={{
              color: "#C9A84C",
              textShadow: "0 0 20rpx rgba(201,168,76,0.7), 0 0 40rpx rgba(201,168,76,0.4)",
              animation: "glowPulse 2s ease-in-out infinite",
            }}>✦</Text>
          </View>
        </View>

        {/* 进度条 */}
        <View className="relative w-full max-w-sm h-1.5 rounded-full overflow-hidden mb-6" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <View className="h-full rounded-full" style={{
            width: "100%",
            background: "linear-gradient(to right, rgba(201,168,76,0.5), #C9A84C)",
            boxShadow: "0 0 12rpx rgba(201,168,76,0.5)",
          }} />
        </View>

        <Text className="text-lg font-serif" style={{
          color: "#C9A84C",
          textShadow: "0 0 20rpx rgba(201,168,76,0.4)",
          animation: "glowPulse 2s ease-in-out infinite",
        }}>
          正在解析你的天命编码…
        </Text>
        <Text className="text-xs mt-2" style={S.white30}>✦ 校准星盘坐标中</Text>
      </View>
    )
  }

  // ── 答题界面 ──
  return (
    <View className="min-h-screen px-5 pt-14 pb-8" style={S.bg}>
      <View className="max-w-lg mx-auto">
        {/* 进度条 */}
        <View className="mb-6">
          <View className="flex items-center justify-between mb-2">
            <Text className="text-xs" style={S.white30}>{current + 1}/{total}</Text>
            <Text className="text-xs font-medium" style={{ color: "rgba(201,168,76,0.6)" }}>{progress}%</Text>
          </View>
          <View className="relative w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <View className="h-full rounded-full" style={{
              width: `${progress}%`,
              transition: "width 0.4s ease-out",
              background: "linear-gradient(to right, rgba(201,168,76,0.5), #C9A84C)",
              boxShadow: "0 0 10rpx rgba(201,168,76,0.4)",
            }} />
            {/* 发光端点 */}
            <View className="absolute top-1/2 pointer-events-none" style={{
              left: `${progress}%`, width: "14rpx", height: "14rpx",
              marginTop: "-7rpx", marginLeft: "-7rpx", borderRadius: "50%",
              backgroundColor: "#C9A84C",
              boxShadow: "0 0 14rpx rgba(201,168,76,0.7), 0 0 28rpx rgba(201,168,76,0.3)",
            }} />
          </View>
        </View>

        {q && (
          <View style={{ opacity: animating ? 0 : 1, transition: "opacity 0.2s" }}>
            {/* Emoji */}
            <View className="text-center mb-5">
              <Text className="text-5xl" style={{ animation: "fadeInUp 0.3s ease-out" }}>{q.emoji}</Text>
            </View>
            {/* 题目 */}
            <View className="text-center mb-6">
              <Text className="text-base font-serif leading-relaxed" style={S.white90}>
                {q.scenario}
              </Text>
              <Text className="mt-2 block" style={{ ...S.white30, fontSize: "22rpx" }}>你的第一反应是？</Text>
            </View>

            {/* 选项 — Web 级 card-glass 风格 */}
            <View>
              {q.options.map((opt, i) => {
                const isSelected = selected === i
                const labels = ["A", "B", "C"]
                return (
                  <View
                    key={`${q.id}-${i}`}
                    onClick={() => handleAnswer(i)}
                    className="rounded-2xl p-4 mb-3"
                    style={{
                      ...(isSelected ? {
                        backgroundColor: "rgba(201,168,76,0.1)",
                        border: "1rpx solid rgba(201,168,76,0.6)",
                        boxShadow: "0 0 24rpx rgba(201,168,76,0.15), inset 0 0 24rpx rgba(201,168,76,0.05), 0 8rpx 32rpx rgba(0,0,0,0.2)",
                        transform: "scale(1.02)",
                      } : {
                        backgroundColor: "rgba(255,255,255,0.04)",
                        border: "1rpx solid rgba(255,255,255,0.1)",
                        boxShadow: "0 4rpx 16rpx rgba(0,0,0,0.15)",
                        transform: "scale(1)",
                      }),
                      animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both`,
                      transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  >
                    <View className="flex items-center gap-3">
                      <View
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={isSelected ? {
                          ...S.goldBg, color: "#0A0A0A",
                          boxShadow: "0 0 16rpx rgba(201,168,76,0.5)",
                        } : {
                          backgroundColor: "rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {isSelected ? "✓" : labels[i]}
                      </View>
                      <Text className="text-sm leading-relaxed" style={isSelected ? S.white90 : S.white60}>
                        {opt.text}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
