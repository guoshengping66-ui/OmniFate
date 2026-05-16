import { useState, useCallback, useMemo } from "react"
import { View, Text } from "@tarojs/components"
import Taro from "@tarojs/taro"
import { QUESTIONS, type Question } from "../../constants/am16"

// ── Fisher-Yates 洗牌 ──
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── 触觉反馈 ──
function haptic(type: "light" | "medium" | "success") {
  if (type === "success") {
    Taro.vibrateShort({ type: "heavy" })
  } else if (type === "medium") {
    Taro.vibrateShort({ type: "medium" })
  } else {
    Taro.vibrateShort({ type: "light" })
  }
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
          // 存储答案并跳转结果页
          Taro.setStorageSync("am16_answers", JSON.stringify(newAnswers))
          Taro.navigateTo({ url: "/pages/result/index" })
        }, 2200)
      }
    }, 350)
  }, [selected, animating, answers, current, total, q])

  // ── 分析中 ──
  if (analyzing) {
    return (
      <View className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
        {/* 旋转星轨 */}
        <View className="relative w-80 h-80 flex items-center justify-center mb-8">
          <View className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 animate-[spin_3s_linear_infinite]" />
          <View className="absolute inset-8 rounded-full border border-[#D4AF37]/25 animate-[spin_2.2s_linear_infinite_reverse]" />
          <View className="absolute inset-16 rounded-full border border-[#D4AF37]/20 animate-[spin_1.5s_linear_infinite]" />
          <View className="w-16 h-16 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
            <Text className="text-[#D4AF37] text-2xl animate-pulse">✦</Text>
          </View>
        </View>

        {/* 进度条 */}
        <View className="w-full max-w-sm h-1 bg-white/5 rounded-full overflow-hidden mb-6">
          <View
            className="h-full bg-gradient-to-r from-[#D4AF37]/60 to-[#D4AF37] rounded-full transition-all duration-1000"
            style={{ width: "100%" }}
          />
        </View>

        <Text className="text-[#D4AF37] text-lg font-serif animate-pulse">
          正在解析你的天命编码…
        </Text>
        <Text className="text-white/30 text-xs mt-2">✦ 校准星盘坐标中</Text>
      </View>
    )
  }

  // ── 答题界面 ──
  return (
    <View className="min-h-screen bg-[#0A0A0A] px-5 pt-16 pb-8">
      <View className="max-w-lg mx-auto">
        {/* 进度条 */}
        <View className="mb-6">
          <View className="flex items-center justify-between mb-2">
            <Text className="text-white/30 text-xs">
              {current + 1}/{total}
            </Text>
            <Text className="text-[#D4AF37]/50 text-xs">{progress}%</Text>
          </View>
          <View className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <View
              className="h-full bg-gradient-to-r from-[#D4AF37]/40 to-[#D4AF37] rounded-full"
              style={{ width: `${progress}%`, transition: "width 0.4s ease-out" }}
            />
          </View>
        </View>

        {/* 题目卡片 */}
        {q && (
          <View
            className={`transition-all duration-300 ${animating ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0"}`}
          >
            {/* Emoji */}
            <View className="text-center mb-5">
              <Text className="text-5xl">{q.emoji}</Text>
            </View>

            {/* 情景描述 */}
            <View className="text-center mb-6">
              <Text className="text-white/90 text-base font-serif leading-relaxed">
                {q.scenario}
              </Text>
              <Text className="text-white/30 text-[11px] mt-2 block">你的第一反应是？</Text>
            </View>

            {/* 选项 — 毛玻璃卡片 */}
            <View className="space-y-3">
              {q.options.map((opt, i) => {
                const isSelected = selected === i
                const labels = ["A", "B", "C"]
                return (
                  <View
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={`relative rounded-xl border p-4 transition-all duration-200 active:scale-[0.98] ${
                      isSelected
                        ? "border-[#D4AF37]/60 bg-[#D4AF37]/10 shadow-[0_0_24px_rgba(212,175,55,0.15)]"
                        : "border-white/10 bg-white/[0.04] active:bg-white/[0.08]"
                    }`}
                  >
                    <View className="flex items-start gap-3">
                      <View
                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                          isSelected
                            ? "bg-[#D4AF37] text-[#0A0A0A]"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {isSelected ? "✓" : labels[i]}
                      </View>
                      <Text
                        className={`text-sm leading-relaxed ${
                          isSelected ? "text-white/90" : "text-white/60"
                        }`}
                      >
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
