"use client"
import { useState, useCallback, useMemo } from "react"
import { Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { AM16_QUESTIONS } from "@/lib/am16/constants"

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

// ── 旋转星轨动画 — 精简版，减少移动端 GPU 开销 ──
function AnalysisOrbit() {
  return (
    <div className="relative w-40 h-40 mx-auto will-change-transform">
      {/* 外环 */}
      <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-[spin_4s_linear_infinite]" />
      {/* 内环 */}
      <div className="absolute inset-6 rounded-full border border-gold/25 animate-[spin_3s_linear_infinite_reverse]" />
      {/* 核心 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
          <Sparkles size={20} className="text-gold animate-pulse" />
        </div>
      </div>
      {/* 轨道粒子 — 减少到 4 个 */}
      {[0, 1, 2, 3].map(i => {
        const angle = (i / 4) * Math.PI * 2
        const r = 65
        return (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-gold/50"
            style={{
              left: `calc(50% + ${Math.cos(angle) * r}px - 3px)`,
              top: `calc(50% + ${Math.sin(angle) * r}px - 3px)`,
              animation: `star-particle ${1.5 + (i % 2) * 0.3}s ease-in-out infinite ${i * 0.3}s`,
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
  const { t: rawT, locale } = useLanguage()
  const t = rawT as unknown as (key: string) => string
  const lang = locale === "zh" ? "zh" : "en"
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
  const progress = started ? ((currentQ + 1) / total) * 100 : 0
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
      <div className="text-center space-y-8 py-12 anim-slide-up">
        {/* Logo */}
        <div className="relative inline-block">
          <div
            className="absolute inset-0 bg-gold/10 rounded-full blur-3xl anim-pulse-glow"
            style={{ width: 200, height: 200, margin: "auto", left: 0, right: 0, top: -40 }}
          />
          <div className="relative text-7xl mb-4">🪞</div>
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gold mb-2">
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
            <div
              key={d.label}
              className="card-glass p-3 text-center anim-slide-up"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <div className="text-xl mb-1">{d.emoji}</div>
              <div className={`text-xs ${d.color}`}>{d.label}</div>
            </div>
          ))}
        </div>

        <div className="inline-block pulse-ring">
          <button
            onClick={handleStart}
            className="btn-gold inline-flex items-center gap-2 text-sm hover:scale-[1.05] active:scale-[0.95] transition-transform"
          >
            <Sparkles size={16} />
            {t("am16.start")}
          </button>
        </div>

        <p className="text-white/20 text-[11px]">{t("am16.free")}</p>
      </div>
    )
  }

  // ── 分析中 ──
  if (analyzing) {
    return (
      <div className="text-center py-16 space-y-6 anim-fade-in">
        {/* 旋转星轨 */}
        <AnalysisOrbit />

        {/* 进度条 100% */}
        <div className="w-full max-w-md mx-auto h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full"
            style={{
              width: "100%",
              transition: "width 0.8s ease-out",
            }}
          />
        </div>

        <div>
          <p className="text-gold text-lg font-serif animate-pulse">
            {calibrated ? t("am16.calibrating") : t("am16.analyzing")}
          </p>
          <p className="text-white/30 text-xs mt-2">
            {calibrated ? "✦" : t(`am16.step${analysisStep + 1}`)}
          </p>
        </div>
      </div>
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
        <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label={t("am16.progress")}>
          <div
            className="h-full bg-gradient-to-r from-gold/40 to-gold rounded-full"
            style={{
              width: `${((currentQ + 1) / total) * 100}%`,
              transition: "width 0.4s ease-out",
            }}
          />
          {/* 发光端点 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold pointer-events-none"
            style={{
              left: `${((currentQ + 1) / total) * 100}%`,
              marginLeft: "-6px",
              boxShadow: "0 0 10px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)",
            }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      {question && (
        <div key={question.id} className="anim-slide-in-right">
          {/* 情景描述 */}
          <div className="text-center mb-6">
            <div className="text-4xl sm:text-5xl mb-4 anim-scale-in">
              {question.emoji}
            </div>
            <h2 className="text-xl md:text-2xl font-serif text-white/90 leading-relaxed">
              {lang === "zh" ? question.titleCn : question.titleEn}
            </h2>
            <p className="text-white/30 text-xs mt-2">{t("am16.yourFirstReaction")}</p>
          </div>

          {/* 选项 */}
          <div className="space-y-3" role="radiogroup" aria-label={t("am16.yourFirstReaction")}>
            {question.options.map((opt, i) => {
              const optText = lang === "zh" ? opt.textCn : opt.textEn
              const isSelected = selectedOption === i
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selectedOption !== null}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={optText}
                  className={`w-full text-left p-4 min-h-[52px] rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    isSelected
                      ? "border-gold/60 bg-gold/10 shadow-[0_0_24px_rgba(201,168,76,0.2)]"
                      : "border-white/10 bg-[#030918] hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 transition-all duration-200 ${
                      isSelected
                        ? "bg-gold text-ink shadow-[0_0_12px_rgba(201,168,76,0.4)]"
                        : "bg-white/10 text-white/50"
                    }`}>
                      {isSelected ? (
                        <span className="anim-scale-in">✓</span>
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
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
