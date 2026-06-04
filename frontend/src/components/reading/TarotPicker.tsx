"use client"
import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw, Sparkles, Hand } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

/* ── Major Arcana data ──────────────────────────────────────── */

const MAJOR_ARCANA = [
  { emoji: "🌟", zh: "愚者",       en: "The Fool" },
  { emoji: "🎩", zh: "魔术师",     en: "The Magician" },
  { emoji: "🌙", zh: "女祭司",     en: "The High Priestess" },
  { emoji: "👑", zh: "皇后",       en: "The Empress" },
  { emoji: "🏛️", zh: "皇帝",       en: "The Emperor" },
  { emoji: "📿", zh: "教皇",       en: "The Hierophant" },
  { emoji: "💕", zh: "恋人",       en: "The Lovers" },
  { emoji: "⚡", zh: "战车",       en: "The Chariot" },
  { emoji: "🦁", zh: "力量",       en: "Strength" },
  { emoji: "🏔️", zh: "隐者",       en: "The Hermit" },
  { emoji: "🎡", zh: "命运之轮",   en: "Wheel of Fortune" },
  { emoji: "⚖️", zh: "正义",       en: "Justice" },
  { emoji: "🔄", zh: "倒吊人",     en: "The Hanged Man" },
  { emoji: "💀", zh: "死神",       en: "Death" },
  { emoji: "🏺", zh: "节制",       en: "Temperance" },
  { emoji: "😈", zh: "恶魔",       en: "The Devil" },
  { emoji: "🗼", zh: "塔",         en: "The Tower" },
  { emoji: "⭐", zh: "星星",       en: "The Star" },
  { emoji: "🌕", zh: "月亮",       en: "The Moon" },
  { emoji: "☀️", zh: "太阳",       en: "The Sun" },
  { emoji: "📯", zh: "审判",       en: "Judgement" },
  { emoji: "🌍", zh: "世界",       en: "The World" },
]

const NUM_CARDS = 10
const SELECT_COUNT = 3

interface CardData {
  position: string
  card: string
  reversed: boolean
  arcana: typeof MAJOR_ARCANA[number]
}

interface Props {
  onSelect: (cards: CardData[]) => void
}

/* ── Shuffle helper ─────────────────────────────────────────── */

function shuffleDeck(): typeof MAJOR_ARCANA {
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, NUM_CARDS)
}

/* ── Card back (pure CSS / SVG) ─────────────────────────────── */

function CardBack() {
  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden"
      style={{
        backfaceVisibility: "hidden",
        background: "linear-gradient(145deg, #1a0a2e 0%, #0d1b3e 50%, #160830 100%)",
      }}>
      {/* Gold outer border */}
      <div className="absolute inset-0 rounded-xl border-2 border-gold/30" />
      {/* Inner decorative border */}
      <div className="absolute inset-[5px] rounded-[10px] border border-gold/15" />

      {/* Center mandala SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 140">
        {/* Outer ring */}
        <circle cx="50" cy="70" r="36" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
        <circle cx="50" cy="70" r="30" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gold" />
        {/* 5-pointed star */}
        {[0, 72, 144, 216, 288].map((angle) => {
          const rad = (angle * Math.PI) / 180
          const x1 = 50 + 22 * Math.cos(rad)
          const y1 = 70 + 22 * Math.sin(rad)
          const rad2 = ((angle + 144) * Math.PI) / 180
          const x2 = 50 + 22 * Math.cos(rad2)
          const y2 = 70 + 22 * Math.sin(rad2)
          return (
            <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="currentColor" strokeWidth="0.4" className="text-gold" />
          )
        })}
        {/* Center eye */}
        <circle cx="50" cy="70" r="4" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold/60" />
        <circle cx="50" cy="70" r="1.5" fill="currentColor" className="text-gold/50" />
        {/* Corner ornaments */}
        {[[18, 22], [82, 22], [18, 118], [82, 118]].map(([cx, cy], i) => (
          <polygon key={i} points={`${cx},${cy! - 3} ${cx! + 2.5},${cy} ${cx},${cy! + 3} ${cx! - 2.5},${cy}`}
            fill="currentColor" className="text-gold/25" />
        ))}
      </svg>

      {/* Breathing glow */}
      <div className="absolute inset-0 rounded-xl animate-tarot-breathe pointer-events-none" />
    </div>
  )
}

/* ── Card front face ────────────────────────────────────────── */

function CardFront({ arcana, reversed }: { arcana: typeof MAJOR_ARCANA[number]; reversed: boolean }) {
  const { locale } = useLanguage()
  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-0.5"
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        background: "linear-gradient(160deg, #1e1040 0%, #0f1a35 100%)",
      }}>
      <div className="absolute inset-0 rounded-xl border-2 border-gold/40" />
      <div className="absolute inset-0 rounded-xl"
        style={{ background: "radial-gradient(circle at 50% 35%, rgba(201,168,76,0.18) 0%, transparent 65%)" }} />

      <span className={`text-3xl sm:text-4xl leading-none ${reversed ? "scale-y-[-1]" : ""}`}>
        {arcana.emoji}
      </span>
      <p className="text-gold font-serif font-bold text-[11px] sm:text-xs leading-tight text-center px-1.5 mt-1">
        {locale === "zh" ? arcana.zh : arcana.en}
      </p>
      {locale === "en" && (
        <p className="text-gold/40 text-[9px]">{arcana.zh}</p>
      )}
      {reversed && (
        <span className="text-white/40 text-[9px] mt-0.5">
          {locale === "zh" ? "逆位" : "Reversed"}
        </span>
      )}
    </div>
  )
}

/* ── Flash on reveal ────────────────────────────────────────── */

function RevealFlash() {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl pointer-events-none z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.7, 0] }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        background: "radial-gradient(circle, rgba(201,168,76,0.5) 0%, transparent 70%)",
      }}
    />
  )
}

/* ── Main TarotPicker ───────────────────────────────────────── */

type Phase = "spread" | "select" | "reveal" | "confirm"

export function TarotPicker({ onSelect }: Props) {
  const { t, locale } = useLanguage()
  const [phase, setPhase] = useState<Phase>("spread")
  const [deck] = useState(() => shuffleDeck())
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [revealedCards, setRevealedCards] = useState<CardData[]>([])
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const POSITIONS = useMemo(() => [
    t("new.tarot.past"),
    t("new.tarot.present"),
    t("new.tarot.future"),
  ], [t])

  /* ── Auto-transition: spread → select after fan animation ── */
  useEffect(() => {
    const totalSpreadDuration = NUM_CARDS * 60 + 400 // stagger + settle
    const timer = setTimeout(() => setPhase("select"), totalSpreadDuration)
    return () => clearTimeout(timer)
  }, [])

  /* Cleanup timers on unmount */
  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    }
  }, [])

  /* ── Card click handler ── */
  const handleCardClick = useCallback((index: number) => {
    if (phase !== "select") return
    if (selectedIndices.includes(index)) return
    if (selectedIndices.length >= SELECT_COUNT) return

    const newSelected = [...selectedIndices, index]
    setSelectedIndices(newSelected)

    if (newSelected.length === SELECT_COUNT) {
      setPhase("reveal")

      revealTimerRef.current = setTimeout(() => {
        const cards: CardData[] = newSelected.map((idx, i) => {
          const arcana = deck[idx]
          return {
            position: POSITIONS[i],
            card: locale === "zh" ? arcana.zh : arcana.en,
            reversed: Math.random() > 0.65,
            arcana,
          }
        })
        setRevealedCards(cards)
        onSelect(cards)

        revealTimerRef.current = setTimeout(() => setPhase("confirm"), 700)
      }, 300)
    }
  }, [phase, selectedIndices, deck, POSITIONS, locale, onSelect])

  /* ── Redraw ── */
  const handleRedraw = useCallback(() => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    setSelectedIndices([])
    setRevealedCards([])
    setPhase("spread")
    setTimeout(() => setPhase("select"), NUM_CARDS * 60 + 400)
  }, [])

  /* ── Fan layout math ── */
  const fanLayout = useMemo(() => {
    const totalAngle = 44 // degrees
    const start = -totalAngle / 2
    const step = totalAngle / (NUM_CARDS - 1)
    return Array.from({ length: NUM_CARDS }, (_, i) => ({
      rotation: start + step * i,
      y: Math.abs(start + step * i) * 0.35,
      delay: i * 0.06,
    }))
  }, [])

  const isInteractive = phase === "select"

  return (
    <div className="space-y-3">
      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70">
          {t("new.tarotDrawTitle")}
        </h3>
        {(phase === "confirm" || phase === "select") && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            type="button" onClick={handleRedraw}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition-all"
          >
            <RotateCcw size={12} />
            {selectedIndices.length > 0 ? t("new.tarotRedraw") : t("new.tarotRedraw")}
          </motion.button>
        )}
      </div>

      {/* ── Instruction ── */}
      <AnimatePresence mode="wait">
        {phase === "select" && (
          <motion.p key="pick"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-white/40 text-xs"
          >
            <Hand size={12} className="inline mr-1 -mt-0.5" />
            {t("new.tarotPickCards") || `请选择 ${SELECT_COUNT} 张牌 — 过去、现在、未来`}
          </motion.p>
        )}
        {phase === "reveal" && (
          <motion.p key="reveal"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-gold/60 text-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles size={12} className="text-gold" />
            {t("new.tarotRevealing") || "命运之牌正在揭示…"}
            <Sparkles size={12} className="text-gold" />
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Card fan area ── */}
      <div className="relative flex justify-center items-start" style={{ minHeight: 200 }}>
        {deck.map((arcana, i) => {
          const isSelected = selectedIndices.includes(i)
          const selectOrder = selectedIndices.indexOf(i)
          const isRevealed = phase === "reveal" || phase === "confirm"
          const shouldHide = isRevealed && !isSelected
          const isFlipped = isSelected && isRevealed
          const cardData = revealedCards[selectOrder]
          const layout = fanLayout[i]

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.4, y: 60 }}
              animate={{
                opacity: shouldHide ? 0 : 1,
                scale: isSelected
                  ? (isRevealed ? 1.08 : 1.12)
                  : (isRevealed ? 0.7 : 1),
                rotate: isSelected ? 0 : layout.rotation,
                x: isSelected ? (selectOrder - 1) * 120 : 0,
                y: isSelected
                  ? (isRevealed ? -8 : -25)
                  : layout.y,
                zIndex: shouldHide ? 0 : (isSelected ? 30 : (10 - Math.abs(layout.rotation) * 0.1)),
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 22,
                delay: phase === "spread" ? layout.delay : 0,
              }}
              whileHover={
                isInteractive && !isSelected
                  ? { y: layout.y - 14, scale: 1.06, transition: { duration: 0.15 } }
                  : undefined
              }
              whileTap={isInteractive && !isSelected ? { scale: 0.97 } : undefined}
              onClick={() => handleCardClick(i)}
              className={`absolute ${isInteractive && !isSelected ? "cursor-pointer" : ""} ${shouldHide ? "pointer-events-none" : ""}`}
            >
              {/* 3D flip container */}
              <div className="relative" style={{ perspective: 800 }}>
                <motion.div
                  className="relative w-[72px] h-[108px] sm:w-[84px] sm:h-[126px]"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <CardBack />
                  {cardData && <CardFront arcana={cardData.arcana} reversed={cardData.reversed} />}
                  {isFlipped && <RevealFlash />}

                  {/* Selection glow ring */}
                  {isSelected && !isRevealed && (
                    <motion.div
                      className="absolute -inset-[3px] rounded-xl pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        background: "conic-gradient(from 0deg, transparent 0%, rgba(201,168,76,0.5) 25%, transparent 50%, rgba(201,168,76,0.5) 75%, transparent 100%)",
                        animation: "glow-rotate 2.5s linear infinite",
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        padding: "2px",
                      }}
                    />
                  )}
                </motion.div>
              </div>

              {/* Position label — OUTSIDE the 3D container */}
              {isSelected && isRevealed && cardData && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + selectOrder * 0.12, duration: 0.35 }}
                  className="text-center mt-2"
                >
                  <span className="text-gold/70 text-[10px] font-medium whitespace-nowrap">
                    {cardData.position}
                  </span>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* ── Confirm: result summary cards ── */}
      {phase === "confirm" && revealedCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8"
        >
          <div className="grid grid-cols-3 gap-3">
            {revealedCards.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.12 }}
                className="card-glow p-3 text-center"
              >
                <div className="text-[10px] text-white/40 mb-1">{c.position}</div>
                <div className={`text-2xl mb-1 ${c.reversed ? "scale-y-[-1]" : ""}`}>
                  {c.arcana.emoji}
                </div>
                <div className="text-gold text-sm font-medium leading-tight">{c.card}</div>
                {c.reversed && (
                  <div className="text-white/30 text-[10px] mt-0.5">
                    {locale === "zh" ? "逆位" : "Reversed"}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Empty / hint state ── */}
      {phase === "spread" && (
        <div className="border border-dashed border-white/10 rounded-xl p-4 text-center text-white/30 text-xs">
          {t("new.tarotHint")}
        </div>
      )}
    </div>
  )
}
