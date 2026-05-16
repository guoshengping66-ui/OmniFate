"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import { AM16_QUESTIONS } from "@/lib/am16/constants"

interface Props {
  onComplete: (answers: number[]) => void
}

export function AM16Quiz({ onComplete }: Props) {
  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const total = AM16_QUESTIONS.length
  const progress = started ? ((currentQ) / total) * 100 : 0
  const question = AM16_QUESTIONS[currentQ]

  const handleStart = () => setStarted(true)

  const handleAnswer = (choice: number) => {
    if (selectedOption !== null) return // 防止连点
    setSelectedOption(choice)

    // Haptic feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([15])
    }

    const newAnswers = [...answers, choice]
    setAnswers(newAnswers)

    setTimeout(() => {
      setSelectedOption(null)
      if (currentQ + 1 < total) {
        setCurrentQ(currentQ + 1)
      } else {
        // 答完所有题，进入分析
        setAnalyzing(true)
        setTimeout(() => onComplete(newAnswers), 2200)
      }
    }, 400)
  }

  // ── 开屏 ──
  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 py-12"
      >
        {/* Logo */}
        <div className="relative inline-block">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-gold/10 rounded-full blur-3xl"
            style={{ width: 200, height: 200, margin: "auto", left: 0, right: 0, top: -40 }}
          />
          <div className="relative text-7xl mb-4">🪞</div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gold mb-2">
            AM16 天命能级测验
          </h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            12 道沉浸式情景题，解锁你的精神状态密码
          </p>
          <p className="text-white/25 text-xs mt-2">
            Flow · Defiance · Xinxue · Shiwu · Giver · Individual · Patience · Execution
          </p>
        </div>

        {/* 四维预览 */}
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {[
            { emoji: "☯", label: "顺天 vs 逆天", color: "text-blue-400" },
            { emoji: "🔮", label: "心觉 vs 格物", color: "text-purple-400" },
            { emoji: "🫂", label: "渡人 vs 修仙", color: "text-pink-400" },
            { emoji: "⚡", label: "稳如 vs 执行", color: "text-amber-400" },
          ].map((d, i) => (
            <motion.div
              key={d.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="card-glass p-3 text-center"
            >
              <div className="text-xl mb-1">{d.emoji}</div>
              <div className={`text-xs ${d.color}`}>{d.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={handleStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-gold inline-flex items-center gap-2 text-sm"
        >
          <Sparkles size={16} />
          开始测试
        </motion.button>

        <p className="text-white/20 text-[11px]">免费 · 无需注册 · 1 分钟出结果</p>
      </motion.div>
    )
  }

  // ── 分析中 ──
  if (analyzing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20 space-y-6"
      >
        {/* 进度条 100% */}
        <div className="w-full max-w-md mx-auto h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full"
            initial={{ width: `${progress}%` }}
            animate={{ width: "100%" }}
          />
        </div>

        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-6xl"
        >
          🪞
        </motion.div>

        <div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gold text-lg font-serif"
          >
            正在解析你的天命编码...
          </motion.p>
          <p className="text-white/30 text-xs mt-2">连接宇宙量子场 · 校准四维坐标</p>
        </div>

        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-gold"
            />
          ))}
        </div>
      </motion.div>
    )
  }

  // ── 答题界面 ──
  return (
    <div className="max-w-lg mx-auto">
      {/* 顶部进度条 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/30 text-xs">
            {currentQ + 1} / {total}
          </span>
          <span className="text-gold/50 text-xs">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold/40 to-gold rounded-full"
            animate={{ width: `${((currentQ) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      <AnimatePresence mode="wait">
        {question && (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            {/* 情景描述 */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="text-5xl mb-4"
              >
                {question.emoji}
              </motion.div>
              <h2 className="text-lg md:text-xl font-serif text-white/90 leading-relaxed">
                {question.scenario}
              </h2>
              <p className="text-white/30 text-xs mt-2">你的第一反应是？</p>
            </div>

            {/* 选项 */}
            <div className="space-y-3">
              {[question.optionA, question.optionB].map((opt, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedOption === i
                      ? "border-gold/60 bg-gold/10 shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                      selectedOption === i
                        ? "bg-gold text-ink"
                        : "bg-white/10 text-white/50"
                    }`}>
                      {selectedOption === i ? (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          ✓
                        </motion.span>
                      ) : (
                        String.fromCharCode(65 + i) // A / B
                      )}
                    </span>
                    <span className={`text-sm leading-relaxed ${
                      selectedOption === i ? "text-white/90" : "text-white/60"
                    }`}>
                      {opt.text}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
