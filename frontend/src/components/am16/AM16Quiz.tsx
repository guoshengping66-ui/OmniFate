"use client"
import { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { AM16_QUESTIONS, type AM16Question } from "@/lib/am16/constants"

// ── Fisher-Yates 洗牌 ──
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── 多级触觉反馈（参照 CelestialOracle）──
function triggerHaptic(pattern: "light" | "medium" | "success") {
  if (typeof navigator === "undefined" || !navigator.vibrate) return
  const patterns: Record<string, number[]> = {
    light:   [10],
    medium:  [20, 30, 20],
    success: [10, 50, 10, 50, 30],
  }
  navigator.vibrate(patterns[pattern] || [10])
}

// ── 旋转星轨动画（参照 CelestialOracle StarAxis）──
function AnalysisOrbit() {
  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* 外环 */}
      <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-[spin_3s_linear_infinite]" />
      {/* 中环 */}
      <div className="absolute inset-4 rounded-full border border-gold/25 animate-[spin_2.2s_linear_infinite_reverse]" />
      {/* 内环 */}
      <div className="absolute inset-8 rounded-full border border-gold/20 animate-[spin_1.5s_linear_infinite]" />
      {/* 核心 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
          <Sparkles size={20} className="text-gold animate-pulse" />
        </div>
      </div>
      {/* 轨道粒子 */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const angle = (i / 6) * Math.PI * 2
        const r = 60 + (i % 2) * 10
        return (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-gold/60"
            style={{
              left: `calc(50% + ${Math.cos(angle) * r}px - 3px)`,
              top: `calc(50% + ${Math.sin(angle) * r}px - 3px)`,
              animation: `star-particle ${1.2 + (i % 3) * 0.3}s ease-in-out infinite ${i * 0.2}s`,
            }}
          />
        )
      })}
    </div>
  )
}

interface Props {
  onComplete: (answers: number[]) => void
}

export function AM16Quiz({ onComplete }: Props) {
  const { t: rawT } = useLanguage()
  const t = rawT as unknown as (key: string) => string
  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [calibrated, setCalibrated] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)

  // 随机化题目顺序
  const questions = useMemo(() => shuffle(AM16_QUESTIONS), [])
  const total = questions.length
  const progress = started ? ((currentQ) / total) * 100 : 0
  const question = questions[currentQ]

  const handleStart = useCallback(() => {
    triggerHaptic("medium")
    setStarted(true)
  }, [])

  const handleAnswer = useCallback((choice: number) => {
    if (selectedOption !== null) return
    setSelectedOption(choice)
    triggerHaptic("light")

    const newAnswers = [...answers, choice]
    setAnswers(newAnswers)

    setTimeout(() => {
      setSelectedOption(null)
      if (currentQ + 1 < total) {
        setCurrentQ(currentQ + 1)
      } else {
        setAnalyzing(true)
        // 分步解析动画
        setTimeout(() => setAnalysisStep(0), 200)
        setTimeout(() => setAnalysisStep(1), 600)
        setTimeout(() => setAnalysisStep(2), 1000)
        setTimeout(() => setAnalysisStep(3), 1400)
        setTimeout(() => setCalibrated(true), 1800)
        setTimeout(() => {
          triggerHaptic("success")
          onComplete(newAnswers)
        }, 2500)
      }
    }, 400)
  }, [selectedOption, answers, currentQ, total, onComplete])

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
            {t("am16.title")}
          </h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            {t("am16.subtitle")}
          </p>
          <p className="text-white/25 text-xs mt-2">
            {t("am16.dimSubtitle")}
          </p>
        </div>

        {/* 四维预览 */}
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {[
            { emoji: "☯", label: t("am16.flowDefiance"), color: "text-blue-400" },
            { emoji: "🔮", label: t("am16.xinxueShiwu"), color: "text-purple-400" },
            { emoji: "🫂", label: t("am16.giverIndividual"), color: "text-pink-400" },
            { emoji: "⚡", label: t("am16.patienceExecution"), color: "text-amber-400" },
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
          {t("am16.start")}
        </motion.button>

        <p className="text-white/20 text-[11px]">{t("am16.free")}</p>
      </motion.div>
    )
  }

  // ── 分析中 ──
  if (analyzing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 space-y-6"
      >
        {/* 旋转星轨 */}
        <AnalysisOrbit />

        {/* 进度条 100% */}
        <div className="w-full max-w-md mx-auto h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full"
            initial={{ width: `${progress}%` }}
            animate={{ width: "100%" }}
          />
        </div>

        <div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gold text-lg font-serif"
          >
            {calibrated ? t("am16.calibrating") : t("am16.analyzing")}
          </motion.p>
          <p className="text-white/30 text-xs mt-2">
            {calibrated ? "✦" : t(`am16.step${analysisStep + 1}`)}
          </p>
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
            {currentQ + 1} {t("am16.questionOf").replace("{total}", String(total))}
          </span>
          <span className="text-gold/50 text-xs">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label={t("am16.progress")}>
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
                {t(`am16.q${question.id}`)}
              </h2>
              <p className="text-white/30 text-xs mt-2">{t("am16.yourFirstReaction")}</p>
            </div>

            {/* 选项 */}
            <div className="space-y-3" role="radiogroup" aria-label={t("am16.yourFirstReaction")}>
              {question.options.map((opt, i) => {
                // 翻译键：第一选项 = qa, 第二选项 = qb, 第三选项 = qc
                const suffix = i === 0 ? "a" : i === 1 ? "b" : "mc"
                const optText = t(`am16.q${question.id}${suffix}`)
                const isSelected = selectedOption === i
                return (
                  <motion.button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={selectedOption !== null}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={optText}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "border-gold/60 bg-gold/10 shadow-[0_0_24px_rgba(201,168,76,0.2)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 transition-all duration-200 ${
                        isSelected
                          ? "bg-gold text-ink shadow-[0_0_12px_rgba(201,168,76,0.4)]"
                          : "bg-white/10 text-white/50"
                      }`}>
                        {isSelected ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            ✓
                          </motion.span>
                        ) : (
                          String.fromCharCode(65 + i)
                        )}
                      </span>
                      <span className={`text-sm leading-relaxed ${
                        isSelected ? "text-white/90" : "text-white/60"
                      }`}>
                        {optText}
                      </span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
