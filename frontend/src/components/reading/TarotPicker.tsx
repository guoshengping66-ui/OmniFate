"use client"
import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

/* ── Major Arcana ───────────────────────────────────────────── */

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

const SELECT_COUNT = 3

/* ── State machine ──────────────────────────────────────────── */

type Phase = "deck" | "drawing" | "complete"

interface DrawnCard {
  position: string
  card: string
  reversed: boolean
  arcana: typeof MAJOR_ARCANA[number]
}

interface Props {
  onSelect: (cards: DrawnCard[]) => void
}

/* ── Helpers ────────────────────────────────────────────────── */

function shuffleAndPick(): typeof MAJOR_ARCANA {
  return [...MAJOR_ARCANA]
    .sort(() => Math.random() - 0.5)
    .slice(0, SELECT_COUNT)
}

/* ── Card Back (shared) ─────────────────────────────────────── */

function CardBack({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 rounded-xl overflow-hidden ${className}`}
      style={{
        backfaceVisibility: "hidden",
        background: "linear-gradient(145deg, #1a0a2e 0%, #0d1b3e 50%, #160830 100%)",
      }}>
      <div className="absolute inset-0 rounded-xl border-2 border-gold/30" />
      <div className="absolute inset-[5px] rounded-[10px] border border-gold/15" />

      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 140">
        <circle cx="50" cy="70" r="36" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
        <circle cx="50" cy="70" r="30" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gold" />
        {[0, 72, 144, 216, 288].map((a) => {
          const r1 = (a * Math.PI) / 180, r2 = ((a + 144) * Math.PI) / 180
          return <line key={a} x1={50 + 22 * Math.cos(r1)} y1={70 + 22 * Math.sin(r1)}
            x2={50 + 22 * Math.cos(r2)} y2={70 + 22 * Math.sin(r2)}
            stroke="currentColor" strokeWidth="0.4" className="text-gold" />
        })}
        <circle cx="50" cy="70" r="4" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold/60" />
        <circle cx="50" cy="70" r="1.5" fill="currentColor" className="text-gold/50" />
        {[[18, 22], [82, 22], [18, 118], [82, 118]].map(([cx, cy], i) => (
          <polygon key={i} points={`${cx},${cy! - 3} ${cx! + 2.5},${cy} ${cx},${cy! + 3} ${cx! - 2.5},${cy}`}
            fill="currentColor" className="text-gold/25" />
        ))}
      </svg>

      <div className="absolute inset-0 rounded-xl animate-tarot-breathe pointer-events-none" />
    </div>
  )
}

/* ── Card Front ─────────────────────────────────────────────── */

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
      {locale === "en" && <p className="text-gold/40 text-[9px]">{arcana.zh}</p>}
      {reversed && (
        <span className="text-white/40 text-[9px] mt-0.5">
          {locale === "zh" ? "逆位" : "Reversed"}
        </span>
      )}
    </div>
  )
}

/* ── Reveal flash ───────────────────────────────────────────── */

function RevealFlash() {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl pointer-events-none z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.7, 0] }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ background: "radial-gradient(circle, rgba(201,168,76,0.5) 0%, transparent 70%)" }}
    />
  )
}

/* ══════════════════════════════════════════════════════════════ */
/*  Main TarotPicker — Tap to Draw                              */
/* ══════════════════════════════════════════════════════════════ */

export function TarotPicker({ onSelect }: Props) {
  const { t, locale } = useLanguage()

  const [phase, setPhase] = useState<Phase>("deck")
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
  const [currentDrawIndex, setCurrentDrawIndex] = useState(0) // 0, 1, 2
  const [isAnimating, setIsAnimating] = useState(false)
  const [flipComplete, setFlipComplete] = useState<boolean[]>([false, false, false])

  const deckRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const drawnCardsRef = useRef<DrawnCard[]>([]) // mirror state for stale closures

  const picks = useRef(shuffleAndPick())

  const POSITIONS = useMemo(() => [
    t("new.tarot.past"),
    t("new.tarot.present"),
    t("new.tarot.future"),
  ], [t])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  // Keep drawnCardsRef in sync with state
  useEffect(() => { drawnCardsRef.current = drawnCards }, [drawnCards])

  /* ── Draw a card ──────────────────────────────────────────── */
  const drawCard = useCallback(() => {
    if (isAnimating || phase === "complete") return
    if (currentDrawIndex >= SELECT_COUNT) return

    setIsAnimating(true)
    const idx = currentDrawIndex
    const arcana = picks.current[idx]
    const card: DrawnCard = {
      position: POSITIONS[idx],
      card: locale === "zh" ? arcana.zh : arcana.en,
      reversed: Math.random() > 0.65,
      arcana,
    }

    // Step 1: card slides out from deck (animation handled by motion)
    // Step 2: after slide completes, flip
    timerRef.current = setTimeout(() => {
      setDrawnCards(prev => [...prev, card])
      setFlipComplete(prev => { const c = [...prev]; c[idx] = true; return c })

      // Step 3: after flip completes, check if done
      timerRef.current = setTimeout(() => {
        const nextIdx = idx + 1
        setCurrentDrawIndex(nextIdx)
        setIsAnimating(false)

        if (nextIdx >= SELECT_COUNT) {
          // All 3 drawn — use ref to avoid stale closure
          const allCards = [...drawnCardsRef.current]
          onSelect(allCards.length === SELECT_COUNT ? allCards : [card])
          timerRef.current = setTimeout(() => setPhase("complete"), 400)
        }
      }, 700) // flip duration
    }, 350) // slide duration
  }, [isAnimating, phase, currentDrawIndex, POSITIONS, locale, onSelect])

  /* ── Redraw ───────────────────────────────────────────────── */
  const handleRedraw = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    picks.current = shuffleAndPick()
    drawnCardsRef.current = []
    setDrawnCards([])
    setCurrentDrawIndex(0)
    setFlipComplete([false, false, false])
    setIsAnimating(false)
    setPhase("deck")
  }, [])

  /* ── Position slots (left, center, right) ─────────────────── */
  const slotX = [-130, 0, 130] // px offsets from center
  const isDeckVisible = phase !== "complete" && currentDrawIndex < SELECT_COUNT

  return (
    <div className="space-y-3">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70">
          {t("new.tarotDrawTitle")}
        </h3>
        {phase === "complete" && (
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

      {/* ── Instruction ── */}
      <AnimatePresence mode="wait">
        {phase === "deck" && (
          <motion.p key="deck" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center text-white/40 text-xs">
            {t("new.tarotTapDeck") || "点击牌堆，抽取命运之牌"}
          </motion.p>
        )}
        {phase === "drawing" && currentDrawIndex < SELECT_COUNT && (
          <motion.p key={`draw-${currentDrawIndex}`} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center text-gold/50 text-xs flex items-center justify-center gap-1.5">
            <Sparkles size={11} className="text-gold/60" />
            {t(`new.tarotDraw${currentDrawIndex + 1}`) ||
              ["抽取第二张 — 现在", "抽取最后一张 — 未来"][currentDrawIndex - 1] ||
              "继续抽取…"}
            <Sparkles size={11} className="text-gold/60" />
          </motion.p>
        )}
        {phase === "complete" && (
          <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center text-gold/60 text-xs flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="text-gold" />
            {t("new.tarotComplete") || "三张命运之牌已揭示"}
            <Sparkles size={12} className="text-gold" />
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Main area: cards + deck ── */}
      <div className="relative flex justify-center items-center" style={{ minHeight: 180 }}>

        {/* ── Drawn cards (slots) ── */}
        <div className="relative flex items-start justify-center" style={{ width: "100%", maxWidth: 440 }}>
          {drawnCards.map((card, i) => {
            const isFlipped = flipComplete[i]
            return (
              <motion.div
                key={`card-${i}`}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.6, rotate: 0 }}
                animate={{
                  opacity: 1,
                  x: slotX[i],
                  y: 0,
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.05,
                }}
                className="absolute"
                style={{ perspective: 800, left: "50%", marginLeft: -42 }}
              >
                <motion.div
                  className="relative w-[84px] h-[126px]"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <CardBack />
                  <CardFront arcana={card.arcana} reversed={card.reversed} />
                  {isFlipped && <RevealFlash />}
                </motion.div>

                {/* Position label */}
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="text-center mt-2"
                  >
                    <span className="text-gold/70 text-[10px] font-medium">{card.position}</span>
                  </motion.div>
                )}
              </motion.div>
            )
          })}

          {/* ── Deck (tappable) — no AnimatePresence to avoid React DOM conflict ── */}
          {isDeckVisible && (
              <motion.div
                ref={deckRef}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: isAnimating ? 0.95 : 1,
                  x: 0,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                onClick={drawCard}
                className="absolute cursor-pointer select-none"
                style={{ perspective: 800, left: "50%", marginLeft: -42 }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.93 }}
              >
                {/* Stacked deck: 3-4 offset card backs */}
                <div className="relative w-[84px] h-[126px]">
                  {[3, 2, 1, 0].map(layer => (
                    <div key={layer}
                      className="absolute inset-0"
                      style={{
                        transform: `translate(${layer * 1.5}px, ${layer * 2}px)`,
                        opacity: 0.5 + layer * 0.15,
                        zIndex: layer,
                      }}>
                      <CardBack />
                    </div>
                  ))}

                  {/* Pulsing glow ring around deck */}
                  <div className="absolute -inset-2 rounded-xl pointer-events-none"
                    style={{
                      background: "conic-gradient(from 0deg, transparent, rgba(201,168,76,0.3), transparent, rgba(201,168,76,0.3), transparent)",
                      animation: "glow-rotate 3s linear infinite",
                      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                      padding: "2px",
                    }}
                  />
                </div>

                {/* "Tap to draw" hint on the deck */}
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-6 left-0 right-0 text-center"
                >
                  <span className="text-gold/50 text-[10px] whitespace-nowrap">
                    ✦ {t("new.tarotTapHint") || "点击抽取"} ✦
                  </span>
                </motion.div>
              </motion.div>
          )}
        </div>
      </div>

      {/* ── Complete: summary cards ── */}
      {phase === "complete" && drawnCards.length === SELECT_COUNT && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-2"
        >
          <div className="grid grid-cols-3 gap-3">
            {drawnCards.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
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

      {/* ── Deck empty state ── */}
      {phase === "deck" && (
        <div className="border border-dashed border-white/10 rounded-xl p-3 text-center text-white/25 text-[11px]">
          {t("new.tarotHint")}
        </div>
      )}
    </div>
  )
}
