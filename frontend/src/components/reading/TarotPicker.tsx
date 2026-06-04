"use client"
import { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw, Sparkles } from "lucide-react"
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

const NUM_CARDS = 10  // cards shown in the spread
const SELECT_COUNT = 3 // how many to pick

interface CardData {
  position: string
  card: string
  reversed: boolean
  arcana: typeof MAJOR_ARCANA[number]
}

interface Props {
  onSelect: (cards: CardData[]) => void
}

/* ── Card back SVG pattern ──────────────────────────────────── */

function CardBack() {
  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden"
      style={{
        backfaceVisibility: "hidden",
        background: "linear-gradient(135deg, #1a0a2e 0%, #0d1b3e 50%, #1a0a2e 100%)",
      }}>
      {/* Gold border */}
      <div className="absolute inset-0 rounded-xl border-2 border-gold/30" />

      {/* Inner decorative border */}
      <div className="absolute inset-[6px] rounded-lg border border-gold/15" />

      {/* Center mandala pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 140">
        {/* Outer circle */}
        <circle cx="50" cy="70" r="35" fill="none" stroke="currentColor" strokeWidth="0.5"
          className="text-gold" />
        <circle cx="50" cy="70" r="28" fill="none" stroke="currentColor" strokeWidth="0.3"
          className="text-gold" />
        {/* Star pattern */}
        {[0, 72, 144, 216, 288].map((angle) => {
          const rad = (angle * Math.PI) / 180
          const x1 = 50 + 20 * Math.cos(rad)
          const y1 = 70 + 20 * Math.sin(rad)
          const rad2 = ((angle + 144) * Math.PI) / 180
          const x2 = 50 + 20 * Math.cos(rad2)
          const y2 = 70 + 20 * Math.sin(rad2)
          return (
            <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="currentColor" strokeWidth="0.4" className="text-gold" />
          )
        })}
        {/* Center dot */}
        <circle cx="50" cy="70" r="3" fill="currentColor" className="text-gold/40" />
        {/* Corner diamonds */}
        {[[15, 20], [85, 20], [15, 120], [85, 120]].map(([cx, cy], i) => (
          <polygon key={i} points={`${cx},${cy! - 4} ${cx! + 3},${cy} ${cx},${cy! + 4} ${cx! - 3},${cy}`}
            fill="currentColor" className="text-gold/30" />
        ))}
      </svg>

      {/* Breathing glow overlay */}
      <div className="absolute inset-0 rounded-xl animate-tarot-breathe pointer-events-none" />
    </div>
  )
}

/* ── Card front face ────────────────────────────────────────── */

function CardFront({ arcana, reversed }: { arcana: typeof MAJOR_ARCANA[number]; reversed: boolean }) {
  const { locale } = useLanguage()
  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden flex flex-col items-center justify-center"
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        background: "linear-gradient(160deg, #1e1040 0%, #0f1a35 100%)",
      }}>
      {/* Gold border */}
      <div className="absolute inset-0 rounded-xl border-2 border-gold/40" />

      {/* Radial glow */}
      <div className="absolute inset-0 rounded-xl"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(201,168,76,0.15) 0%, transparent 60%)" }} />

      {/* Emoji */}
      <span className={`text-4xl mb-2 ${reversed ? "scale-y-[-1]" : ""}`}>
        {arcana.emoji}
      </span>

      {/* Card name */}
      <p className="text-gold font-serif font-bold text-sm leading-tight text-center px-2">
        {locale === "zh" ? arcana.zh : arcana.en}
      </p>
      {locale === "en" && (
        <p className="text-gold/50 text-[10px] mt-0.5">{arcana.zh}</p>
      )}

      {/* Reversed indicator */}
      {reversed && (
        <div className="mt-2 px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
          <span className="text-white/50 text-[10px]">
            {locale === "zh" ? "逆位" : "Reversed"}
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Position label ─────────────────────────────────────────── */

function PositionLabel({ label, index }: { label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.15, duration: 0.4 }}
      className="text-center mt-3"
    >
      <span className="text-gold/70 text-xs font-medium">{label}</span>
    </motion.div>
  )
}

/* ── Reveal flash effect ────────────────────────────────────── */

function RevealFlash() {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl pointer-events-none z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0] }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        background: "radial-gradient(circle, rgba(201,168,76,0.6) 0%, transparent 70%)",
      }}
    />
  )
}

/* ── Main TarotPicker component ─────────────────────────────── */

type Phase = "spread" | "select" | "reveal" | "confirm"

export function TarotPicker({ onSelect }: Props) {
  const { t, locale } = useLanguage()
  const [phase, setPhase] = useState<Phase>("spread")
  const [deck, setDeck] = useState(() => shuffleDeck())
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [revealedCards, setRevealedCards] = useState<CardData[]>([])

  const POSITIONS = useMemo(() => [
    t("new.tarot.past"),
    t("new.tarot.present"),
    t("new.tarot.future"),
  ], [t])

  /* Shuffle 22 arcana, pick 10 for the spread */
  function shuffleDeck(): typeof MAJOR_ARCANA {
    const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, NUM_CARDS)
  }

  const handleCardClick = useCallback((index: number) => {
    if (phase !== "select") return
    if (selectedIndices.includes(index)) return
    if (selectedIndices.length >= SELECT_COUNT) return

    const newSelected = [...selectedIndices, index]
    setSelectedIndices(newSelected)

    // When 3 cards are selected, trigger reveal
    if (newSelected.length === SELECT_COUNT) {
      setPhase("reveal")

      // Build the card data after a short delay for the flip animation
      setTimeout(() => {
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

        // Transition to confirm phase after flip animation
        setTimeout(() => setPhase("confirm"), 800)
      }, 200)
    }
  }, [phase, selectedIndices, deck, POSITIONS, locale, onSelect])

  const handleRedraw = useCallback(() => {
    setDeck(shuffleDeck())
    setSelectedIndices([])
    setRevealedCards([])
    setPhase("spread")
    // Brief delay then go to select
    setTimeout(() => setPhase("select"), 600)
  }, [])

  /* Fan layout: compute rotation & position for each card */
  const fanLayout = useMemo(() => {
    const totalSpread = 50 // degrees total fan
    const startAngle = -totalSpread / 2
    const step = totalSpread / (NUM_CARDS - 1)
    return Array.from({ length: NUM_CARDS }, (_, i) => ({
      rotation: startAngle + step * i,
      x: 0,
      y: Math.abs(startAngle + step * i) * 0.4, // slight arc
      delay: i * 0.06,
    }))
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70">
          {t("new.tarotDrawTitle")}
        </h3>
        {phase === "confirm" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            type="button" onClick={handleRedraw}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition-all"
          >
            <RotateCcw size={12} />
            {t("new.tarotRedraw")}
          </motion.button>
        )}
      </div>

      {/* Instruction text */}
      {phase === "select" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white/40 text-xs"
        >
          {t("new.tarotPickCards") || `请选择 ${SELECT_COUNT} 张牌 — 过去、现在、未来`}
        </motion.p>
      )}

      {phase === "reveal" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gold/60 text-xs flex items-center justify-center gap-1.5"
        >
          <Sparkles size={12} className="text-gold" />
          {t("new.tarotRevealing") || "命运之牌正在揭示…"}
          <Sparkles size={12} className="text-gold" />
        </motion.p>
      )}

      {/* ── Card spread area ── */}
      <div className="relative flex justify-center" style={{ minHeight: 220 }}>
        <AnimatePresence mode="popLayout">
          {deck.map((arcana, i) => {
            const isSelected = selectedIndices.includes(i)
            const selectOrder = selectedIndices.indexOf(i)
            const isRevealed = phase === "reveal" || phase === "confirm"
            const isUnselectedRevealed = isRevealed && !isSelected
            const layout = fanLayout[i]
            const isFlipped = isSelected && (phase === "reveal" || phase === "confirm")
            const cardData = revealedCards[selectOrder]

            return (
              <motion.div
                key={i}
                layout
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  rotate: 0,
                  x: 0,
                  y: 30,
                }}
                animate={{
                  opacity: isUnselectedRevealed ? 0 : 1,
                  scale: isSelected
                    ? (isRevealed ? 1.05 : 1.1)
                    : (isRevealed ? 0.8 : 1),
                  rotate: isSelected ? 0 : layout.rotation,
                  x: isSelected ? (selectOrder - 1) * 110 : layout.x,
                  y: isSelected
                    ? (isRevealed ? -10 : -20)
                    : layout.y,
                  zIndex: isSelected ? 20 : (10 - Math.abs(layout.rotation)),
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  y: 40,
                  transition: { duration: 0.3 },
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: phase === "spread" ? layout.delay : 0,
                }}
                whileHover={
                  phase === "select" && !isSelected
                    ? { y: layout.y - 12, scale: 1.05, transition: { duration: 0.2 } }
                    : undefined
                }
                onClick={() => handleCardClick(i)}
                className={`absolute cursor-pointer select-none ${phase === "select" && !isSelected ? "hover:z-30" : ""}`}
                style={{ perspective: 1000 }}
              >
                {/* Card container with 3D flip */}
                <motion.div
                  className="relative w-[76px] h-[114px] sm:w-[88px] sm:h-[132px]"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Card Back */}
                  <CardBack />

                  {/* Card Front */}
                  {cardData && (
                    <CardFront arcana={cardData.arcana} reversed={cardData.reversed} />
                  )}

                  {/* Reveal flash effect */}
                  {isFlipped && <RevealFlash />}

                  {/* Selected glow ring */}
                  {isSelected && !isRevealed && (
                    <motion.div
                      className="absolute -inset-1 rounded-xl pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        background: "conic-gradient(from 0deg, transparent, rgba(201,168,76,0.4), transparent, rgba(201,168,76,0.4), transparent)",
                        animation: "glow-rotate 3s linear infinite",
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        padding: "2px",
                      }}
                    />
                  )}

                  {/* Position label for selected cards */}
                  {isSelected && phase === "confirm" && cardData && (
                    <PositionLabel label={cardData.position} index={selectOrder} />
                  )}
                </motion.div>

                {/* Position label BELOW the card (for confirm phase) */}
                {isSelected && phase === "confirm" && cardData && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + selectOrder * 0.15 }}
                    className="absolute -bottom-7 left-0 right-0 text-center"
                  >
                    <span className="text-gold/70 text-[10px] font-medium whitespace-nowrap">
                      {cardData.position}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* ── Selected cards summary (confirm phase) ── */}
      {phase === "confirm" && revealedCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 pt-4"
        >
          <div className="grid grid-cols-3 gap-3">
            {revealedCards.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
                className="card-glow p-3 text-center"
              >
                <div className="text-xs text-white/40 mb-1">{c.position}</div>
                <div className={`text-2xl mb-1 ${c.reversed ? "scale-y-[-1]" : ""}`}>
                  {c.arcana.emoji}
                </div>
                <div className="text-gold text-sm font-medium leading-tight">{c.card}</div>
                {c.reversed && (
                  <div className="text-white/30 text-xs mt-1">
                    {locale === "zh" ? "逆位" : "Reversed"}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Empty state ── */}
      {phase === "spread" && selectedIndices.length === 0 && (
        <div className="border border-dashed border-white/10 rounded-xl p-4 text-center text-white/30 text-xs">
          {t("new.tarotHint")}
        </div>
      )}
    </div>
  )
}
