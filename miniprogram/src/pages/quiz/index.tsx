import { useState, useCallback, useMemo, useEffect } from "react"
import { View, Text } from "@tarojs/components"
import Taro from "@tarojs/taro"
import { AM16_QUESTIONS, type AM16Question } from "../../constants/am16"
import { DIMENSION_ORDER, DIMENSIONS_MAP } from "../../constants/dimensions"
import StarBackground from "../../components/StarBackground"
import { cardGlass, btnGold, gold, goldRgb } from "../../styles/theme"

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
  bg: { backgroundColor: "#1A0F2E" },
  white30: { color: "rgba(255,255,255,0.3)" },
  white50: { color: "rgba(255,255,255,0.5)" },
  white60: { color: "rgba(255,255,255,0.6)" },
  white90: { color: "rgba(255,255,255,0.9)" },
}

export default function QuizPage() {
  const questions = useMemo(() => shuffle(AM16_QUESTIONS), [])
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [animating, setAnimating] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [analyzingProgress, setAnalyzingProgress] = useState(0)

  const ANALYZE_STEPS = [
    { text: "正在解析你的天命编码…", progress: 10 },
    { text: "校准星盘坐标中…", progress: 35 },
    { text: "计算四维能级分布…", progress: 70 },
    { text: "匹配人格模型…", progress: 100 },
  ]

  // 分析阶段进度动画
  useEffect(() => {
    if (!analyzing) return
    const timers: any[] = []
    ANALYZE_STEPS.forEach((step, i) => {
      timers.push(setTimeout(() => {
        setStepIndex(i)
        setAnalyzingProgress(step.progress)
      }, i * 550))
    })
    return () => timers.forEach(clearTimeout)
  }, [analyzing])

  const total = questions.length
  const q: AM16Question | undefined = questions[current]
  const progress = Math.round(((current + 1) / total) * 100)

  const handleAnswer = useCallback((choice: number) => {
    if (selected !== null || animating) return
    setSelected(choice)
    haptic("light")
    const newAnswers = { ...answers, [q!.id]: choice }
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

  const handleStart = useCallback(() => {
    haptic("medium")
    setStarted(true)
  }, [])

  // ── 开屏 ──
  if (!started) {
    const dimPreviews = DIMENSION_ORDER.map(code => {
      const dim = DIMENSIONS_MAP[code]
      return { icon: dim.icon, label: dim.axisNameCn, code }
    })
    return (
      <View className="min-h-screen flex flex-col items-center justify-center px-6" style={S.bg}>
        <StarBackground />

        <View className="relative mb-6 text-center" style={{ animation: "fadeInUp 0.6s ease-out both" }}>
          {/* Logo 光晕 — 增大范围 */}
          <View className="absolute rounded-full pointer-events-none" style={{
            top: "-60rpx", left: "50%", marginLeft: "-120rpx",
            width: "240rpx", height: "240rpx",
            background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
            animation: "glowPulse 3s ease-in-out infinite",
          }} />
          <Text className="relative text-7xl block mb-2">🪞</Text>
        </View>

        <View className="text-center mb-6" style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}>
          <Text className="font-serif font-bold block mb-2" style={{ color: gold, fontSize: "40rpx" }}>
            AM16 天命能级测验
          </Text>
          <Text className="text-sm block" style={{ color: "rgba(255,255,255,0.4)" }}>
            12 道沉浸式情景题，解锁你的精神状态密码
          </Text>
          <Text className="text-xs block mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
            四维能级 × 16 型人格
          </Text>
        </View>

        {/* 四维预览卡片 — 两行两列，绝对定位 */}
        <View style={{ position: "relative", width: "680rpx", height: "320rpx", marginBottom: "48rpx", animation: "fadeInUp 0.6s ease-out 0.2s both" }}>
          {dimPreviews.map((d, i) => {
            const row = Math.floor(i / 2)
            const col = i % 2
            const cardStyle = {
              position: "absolute" as const,
              left: col === 0 ? "0rpx" : "352rpx",
              top: row === 0 ? "0rpx" : "168rpx",
              width: "328rpx",
              height: "152rpx",
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1rpx solid rgba(255,255,255,0.1)",
              borderRadius: "24rpx",
              boxShadow: "0 4rpx 20rpx rgba(0,0,0,0.3), inset 0 1rpx 0 rgba(255,255,255,0.06)",
              display: "flex" as const,
              flexDirection: "column" as const,
              alignItems: "center" as const,
              justifyContent: "center" as const,
              animation: `fadeInUp 0.4s ease-out ${0.3 + i * 0.1}s both`,
            }
            return (
              <View key={d.code} style={cardStyle}>
                <Text style={{ fontSize: "48rpx", marginBottom: "8rpx" }}>{d.icon}</Text>
                <Text style={{ fontSize: "24rpx", color: "rgba(255,255,255,0.7)" }}>{d.label}</Text>
              </View>
            )
          })}
        </View>

        {/* 开始按钮 */}
        <View
          className="w-full max-w-sm py-3.5 rounded-full text-center relative overflow-hidden"
          style={{
            ...btnGold,
            animation: "fadeInUp 0.6s ease-out 0.5s both",
          }}
          onClick={handleStart}
        >
          {/* 光泽扫过 */}
          <View className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.3) 55%, transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s ease-in-out infinite",
          }} />
          <Text className="relative font-bold" style={{ color: "#1A0F2E", fontSize: "30rpx" }}>
            ✦ 开始测试
          </Text>
        </View>

        <Text className="text-xs mt-3 text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
          免费 · 无需注册 · 1 分钟出结果
        </Text>
      </View>
    )
  }

  // ── 分析中 ──
  if (analyzing) {
    return (
      <View className="min-h-screen flex flex-col items-center justify-center px-6" style={S.bg}>
        <StarBackground />
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
          {/* 两层轨道环 — 金色外发光 */}
          <View className="absolute rounded-full" style={{
            top: 0, left: 0, right: 0, bottom: 0,
            border: "2rpx solid rgba(212,175,55,0.2)",
            boxShadow: "0 0 24rpx rgba(212,175,55,0.1), inset 0 0 24rpx rgba(212,175,55,0.05)",
            animation: "orbit 4s linear infinite",
          }} />
          <View className="absolute rounded-full" style={{
            top: "40rpx", left: "40rpx", right: "40rpx", bottom: "40rpx",
            border: "1.5rpx solid rgba(212,175,55,0.15)",
            boxShadow: "0 0 18rpx rgba(212,175,55,0.08)",
            animation: "orbit 3s linear infinite reverse",
          }} />
          {/* 轨道光点 — 外圈 */}
          <View className="absolute pointer-events-none" style={{
            top: "0", left: "50%", width: "10rpx", height: "10rpx",
            marginLeft: "-5rpx", marginTop: "-5rpx", borderRadius: "50%",
            backgroundColor: "#C9A84C",
            boxShadow: "0 0 16rpx rgba(201,168,76,0.7), 0 0 32rpx rgba(201,168,76,0.3)",
            animation: "orbit 4s linear infinite",
          }} />
          {/* 轨道光点 — 内圈 */}
          <View className="absolute pointer-events-none" style={{
            top: "40rpx", left: "50%", width: "8rpx", height: "8rpx",
            marginLeft: "-4rpx", marginTop: "-4rpx", borderRadius: "50%",
            backgroundColor: "rgba(201,168,76,0.7)",
            boxShadow: "0 0 12rpx rgba(201,168,76,0.5), 0 0 24rpx rgba(201,168,76,0.2)",
            animation: "orbit 3s linear infinite reverse",
          }} />
          {/* 中心符号 — 强发光 */}
          <View className="w-20 h-20 rounded-full flex items-center justify-center" style={{
            backgroundColor: "rgba(201,168,76,0.12)",
            boxShadow: "0 0 40rpx rgba(201,168,76,0.15), inset 0 0 20rpx rgba(201,168,76,0.1)",
          }}>
            <Text className="text-3xl" style={{
              color: "#C9A84C",
              textShadow: "0 0 20rpx rgba(201,168,76,0.7), 0 0 40rpx rgba(201,168,76,0.4)",
              animation: "glowPulse 2s ease-in-out infinite",
            }}>✦</Text>
          </View>
        </View>

        {/* 进度条 — 从 0 增长到 100 */}
        <View className="relative w-full max-w-sm h-2 rounded-full overflow-hidden mb-6" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <View className="h-full rounded-full" style={{
            width: `${analyzingProgress}%`,
            transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
            background: "linear-gradient(to right, rgba(201,168,76,0.5), #C9A84C)",
            boxShadow: "0 0 12rpx rgba(201,168,76,0.5)",
          }} />
          {/* 发光端点 */}
          <View className="absolute top-1/2 pointer-events-none" style={{
            left: `${analyzingProgress}%`, width: "14rpx", height: "14rpx",
            marginTop: "-7rpx", marginLeft: "-7rpx", borderRadius: "50%",
            backgroundColor: "#C9A84C",
            boxShadow: "0 0 14rpx rgba(201,168,76,0.7), 0 0 28rpx rgba(201,168,76,0.3)",
            transition: "left 0.5s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </View>

        {/* 分阶段文字 — 带切换动画 */}
        <View style={{ height: "80rpx", position: "relative", width: "100%", maxWidth: "640rpx" }}>
          {ANALYZE_STEPS.map((step, i) => (
            <View key={i} className="absolute inset-0 flex flex-col items-center justify-center" style={{
              opacity: i === stepIndex ? 1 : 0,
              transform: i === stepIndex ? "translateY(0)" : "translateY(8rpx)",
              transition: "all 0.35s ease-out",
            }}>
              <Text className="text-lg font-serif text-center" style={{
                color: "#C9A84C",
                textShadow: "0 0 20rpx rgba(201,168,76,0.4)",
              }}>
                {step.text}
              </Text>
            </View>
          ))}
        </View>
        <Text className="text-xs mt-2" style={S.white30}>
          第 {stepIndex + 1}/{ANALYZE_STEPS.length} 步
        </Text>
      </View>
    )
  }

  // ── 答题界面 ──
  return (
    <View className="min-h-screen px-5 pt-14 pb-8" style={S.bg}>
      <StarBackground />
      <View className="max-w-lg mx-auto">
        {/* 进度条 */}
        <View className="mb-6">
          <View className="flex items-center justify-between mb-2">
            <Text className="text-xs" style={S.white30}>{current + 1}/{total}</Text>
            <Text className="text-xs font-medium" style={{ color: "rgba(201,168,76,0.6)" }}>{progress}%</Text>
          </View>
          <View className="relative w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
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
            <View className="text-center mb-6">
              <Text className="text-5xl" style={{ animation: "fadeInUp 0.3s ease-out" }}>{q.emoji}</Text>
            </View>
            {/* 题目 */}
            <View className="text-center mb-8">
              <Text className="font-serif leading-relaxed" style={{ color: "rgba(255,255,255,0.9)", fontSize: "32rpx" }}>
                {q.titleCn}
              </Text>
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
                    className="rounded-2xl p-4 mb-3.5"
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
                          backgroundColor: gold, color: "#0A0A0A",
                          boxShadow: "0 0 16rpx rgba(201,168,76,0.5)",
                        } : {
                          backgroundColor: "rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {isSelected ? "✓" : labels[i]}
                      </View>
                      <Text className="text-sm leading-relaxed" style={isSelected ? S.white90 : S.white60}>
                        {opt.textCn}
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
