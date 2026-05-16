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
  goldBorder30: { borderColor: "rgba(212,175,55,0.3)" },
  goldBorder25: { borderColor: "rgba(212,175,55,0.25)" },
  goldBorder20: { borderColor: "rgba(212,175,55,0.2)" },
  goldBorder60: { borderColor: "rgba(212,175,55,0.6)" },
  whiteBorder10: { borderColor: "rgba(255,255,255,0.1)" },
  whiteBg4: { backgroundColor: "rgba(255,255,255,0.04)" },
  whiteBg5: { backgroundColor: "rgba(255,255,255,0.05)" },
  whiteBg10: { backgroundColor: "rgba(255,255,255,0.1)" },
  gradBar: (w: string) => ({ width: w, background: "linear-gradient(to right, rgba(212,175,55,0.6), #D4AF37)" }),
  gradBarQuiz: (w: string) => ({ width: w, transition: "width 0.4s ease-out", background: "linear-gradient(to right, rgba(212,175,55,0.4), #D4AF37)" }),
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
        <View className="relative w-80 h-80 flex items-center justify-center mb-8">
          <View className="absolute inset-0 rounded-full border-2" style={{ ...S.goldBorder30, animation: "spin 3s linear infinite" }} />
          <View className="absolute inset-8 rounded-full border" style={{ ...S.goldBorder25, animation: "spin 2.2s linear infinite reverse" }} />
          <View className="absolute inset-16 rounded-full border" style={{ ...S.goldBorder20, animation: "spin 1.5s linear infinite" }} />
          <View className="w-16 h-16 rounded-full flex items-center justify-center" style={S.goldBg15}>
            <Text className="text-2xl" style={{ ...S.gold, animation: "pulse 2s ease-in-out infinite" }}>✦</Text>
          </View>
        </View>
        <View className="w-full max-w-sm h-1 rounded-full overflow-hidden mb-6" style={S.whiteBg5}>
          <View className="h-full rounded-full" style={S.gradBar("100%")} />
        </View>
        <Text className="text-lg font-serif" style={{ ...S.gold, animation: "pulse 2s ease-in-out infinite" }}>
          正在解析你的天命编码…
        </Text>
        <Text className="text-xs mt-2" style={S.white30}>✦ 校准星盘坐标中</Text>
      </View>
    )
  }

  // ── 答题界面 ──
  return (
    <View className="min-h-screen px-5 pt-16 pb-8" style={S.bg}>
      <View className="max-w-lg mx-auto">
        <View className="mb-6">
          <View className="flex items-center justify-between mb-2">
            <Text className="text-xs" style={S.white30}>{current + 1}/{total}</Text>
            <Text className="text-xs" style={S.gold50}>{progress}%</Text>
          </View>
          <View className="w-full h-1 rounded-full overflow-hidden" style={S.whiteBg5}>
            <View className="h-full rounded-full" style={S.gradBarQuiz(`${progress}%`)} />
          </View>
        </View>

        {q && (
          <View style={{ opacity: animating ? 0 : 1 }}>
            <View className="text-center mb-5">
              <Text className="text-5xl">{q.emoji}</Text>
            </View>
            <View className="text-center mb-6">
              <Text className="text-base font-serif leading-relaxed" style={S.white90}>
                {q.scenario}
              </Text>
              <Text className="mt-2 block" style={{ ...S.white30, fontSize: "22rpx" }}>你的第一反应是？</Text>
            </View>

            <View>
              {q.options.map((opt, i) => {
                const isSelected = selected === i
                const labels = ["A", "B", "C"]
                return (
                  <View
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className="rounded-xl border p-4 mb-3"
                    style={isSelected
                      ? { ...S.goldBorder60, ...S.goldBg10 }
                      : { ...S.whiteBorder10, ...S.whiteBg4 }
                    }
                  >
                    <View className="flex items-center gap-3">
                      <View
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={isSelected
                          ? { ...S.goldBg, color: "#0A0A0A" }
                          : { ...S.whiteBg10, ...S.white50 }
                        }
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
