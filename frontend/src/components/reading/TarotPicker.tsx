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

/* ── Card Back ──────────────────────────────────────────────── */

function CardBack() {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden"
      style={{
        backfaceVisibility: "hidden",
        background: "linear-gradient(160deg, #12082a 0%, #0a1628 40%, #15092e 100%)",
      }}>
      {/* Outer border */}
      <div className="absolute inset-0 rounded-2xl border-[1.5px] border-gold/25" />
      {/* Inner border */}
      <div className="absolute inset-[4px] rounded-[12px] border border-gold/12" />

      {/* Pentagram SVG — larger and more visible */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140">
        {/* Outer circle */}
        <circle cx="50" cy="70" r="38" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-gold/30" />
        {/* Middle circle */}
        <circle cx="50" cy="70" r="32" fill="none" stroke="currentColor" strokeWidth="0.4" className="text-gold/20" />
        {/* Inner circle */}
        <circle cx="50" cy="70" r="26" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gold/15" />
        {/* Pentagram star */}
        {[0, 72, 144, 216, 288].map((a) => {
          const r1 = (a * Math.PI) / 180, r2 = ((a + 144) * Math.PI) / 180
          return <line key={a}
            x1={50 + 24 * Math.cos(r1)} y1={70 + 24 * Math.sin(r1)}
            x2={50 + 24 * Math.cos(r2)} y2={70 + 24 * Math.sin(r2)}
            stroke="currentColor" strokeWidth="0.5" className="text-gold/35" />
        })}
        {/* Center dot */}
        <circle cx="50" cy="70" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold/25" />
        <circle cx="50" cy="70" r="1.2" fill="currentColor" className="text-gold/20" />
        {/* Corner diamonds */}
        {[[16, 18], [84, 18], [16, 122], [84, 122]].map(([cx, cy], i) => (
          <polygon key={i}
            points={`${cx},${cy! - 3.5} ${cx! + 3},${cy} ${cx},${cy! + 3.5} ${cx! - 3},${cy}`}
            fill="none" stroke="currentColor" strokeWidth="0.4" className="text-gold/20" />
        ))}
        {/* Top/bottom decorative dots */}
        {[20, 50, 80].map((x) => (
          <g key={`tb-${x}`}>
            <circle cx={x} cy={12} r="0.8" fill="currentColor" className="text-gold/15" />
            <circle cx={x} cy={128} r="0.8" fill="currentColor" className="text-gold/15" />
          </g>
        ))}
      </svg>

      {/* Breathing glow */}
      <div className="absolute inset-0 rounded-2xl animate-tarot-breathe pointer-events-none" />
    </div>
  )
}

/* ── Card Front ─────────────────────────────────────────────── */

function CardFront({ arcana, reversed }: { arcana: typeof MAJOR_ARCANA[number]; reversed: boolean }) {
  const { locale } = useLanguage()
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col items-center justify-center"
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        background: "linear-gradient(170deg, #1a0f3a 0%, #0c1a38 50%, #180d35 100%)",
      }}>
      {/* Outer gold border */}
      <div className="absolute inset-0 rounded-2xl border-[1.5px] border-gold/40" />
      {/* Inner border */}
      <div className="absolute inset-[3px] rounded-[13px] border border-gold/15" />

      {/* Top radial glow behind emoji */}
      <div className="absolute inset-0 rounded-2xl"
        style={{ background: "radial-gradient(ellipse at 50% 38%, rgba(201,168,76,0.2) 0%, transparent 55%)" }} />

      {/* Decorative top line */}
      <div className="absolute top-[10px] left-[15px] right-[15px] h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      {/* Decorative bottom line */}
      <div className="absolute bottom-[10px] left-[15px] right-[15px] h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

      {/* Corner ornaments */}
      <svg className="absolute top-1.5 left-1.5 w-4 h-4 text-gold/20" viewBox="0 0 16 16">
        <path d="M0 8 Q0 0 8 0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute top-1.5 right-1.5 w-4 h-4 text-gold/20" viewBox="0 0 16 16">
        <path d="M16 8 Q16 0 8 0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-1.5 left-1.5 w-4 h-4 text-gold/20" viewBox="0 0 16 16">
        <path d="M0 8 Q0 16 8 16" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-1.5 right-1.5 w-4 h-4 text-gold/20" viewBox="0 0 16 16">
        <path d="M16 8 Q16 16 8 16" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Emoji — large and prominent */}
      <span className={`text-5xl sm:text-6xl leading-none mb-2 drop-shadow-[0_0_12px_rgba(201,168,76,0.3)] ${reversed ? "scale-y-[-1]" : ""}`}>
        {arcana.emoji}
      </span>

      {/* Card name */}
      <p className="text-gold font-serif font-bold text-sm sm:text-[15px] leading-tight text-center px-2">
        {locale === "zh" ? arcana.zh : arcana.en}
      </p>
      {locale === "en" && (
        <p className="text-gold/30 text-[9px] mt-0.5">{arcana.zh}</p>
      )}

      {/* Reversed indicator */}
      {reversed && (
        <span className="text-white/40 text-[10px] mt-1 tracking-wider">
          {locale === "zh" ? "逆位" : "Reversed"}
        </span>
      )}
    </div>
  )
}

/* ── Reveal flash + particles ───────────────────────────────── */

function RevealFlash() {
  return (
    <>
      {/* Main gold flash */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.85, 0] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.65) 0%, transparent 65%)" }}
      />
      {/* Sparkle particles radiating outward */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const dist = 30 + Math.random() * 25
        return (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full pointer-events-none z-20"
            style={{ background: i % 2 === 0 ? "#c9a84c" : "#e8d48b" }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: [0, 1.3, 0],
            }}
            transition={{ duration: 0.5, delay: 0.08 + i * 0.025, ease: "easeOut" }}
          />
        )
      })}
    </>
  )
}

/* ══════════════════════════════════════════════════════════════ */
/*  Main TarotPicker — Tap to Draw                              */
/* ══════════════════════════════════════════════════════════════ */

export function TarotPicker({ onSelect }: Props) {
  const { t, locale } = useLanguage()

  const [phase, setPhase] = useState<Phase>("deck")
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
  const [currentDrawIndex, setCurrentDrawIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [flipComplete, setFlipComplete] = useState<boolean[]>([false, false, false])

  const deckRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const drawnCardsRef = useRef<DrawnCard[]>([])

  const picks = useRef(shuffleAndPick())

  const POSITIONS = useMemo(() => [
    t("new.tarot.past"),
    t("new.tarot.present"),
    t("new.tarot.future"),
  ], [t])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])
  useEffect(() => { drawnCardsRef.current = drawnCards }, [drawnCards])

  /* ── Draw a card (shake → slide → flip → flash) ──────── */
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

    // Phase 1: Shake deck (200ms)
    setIsShaking(true)

    timerRef.current = setTimeout(() => {
      setIsShaking(false)

      // Phase 2: Card appears and slides to slot (350ms)
      timerRef.current = setTimeout(() => {
        setDrawnCards(prev => [...prev, card])

        // Phase 3: Flip card (400ms after appear)
        timerRef.current = setTimeout(() => {
          setFlipComplete(prev => { const c = [...prev]; c[idx] = true; return c })

          // Phase 4: Check if done (600ms for flip)
          timerRef.current = setTimeout(() => {
            const nextIdx = idx + 1
            setCurrentDrawIndex(nextIdx)
            setIsAnimating(false)

            if (nextIdx >= SELECT_COUNT) {
              const allCards = [...drawnCardsRef.current]
              onSelect(allCards.length === SELECT_COUNT ? allCards : [card])
              timerRef.current = setTimeout(() => setPhase("complete"), 400)
            }
          }, 600)
        }, 400)
      }, 350)
    }, 200)
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
    setIsShaking(false)
    setPhase("deck")
  }, [])

  /* ── Position slots ───────────────────────────────────────── */
  const slotX = [-130, 0, 130]
  const isDeckVisible = phase !== "complete" && currentDrawIndex < SELECT_COUNT

  return (
    <div className="space-y-2">
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

      {/* ── Instruction text ── */}
      <AnimatePresence mode="wait">
        {phase === "deck" && (
          <motion.p key="deck" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center text-white/35 text-xs">
            {t("new.tarotTapDeck") || "点击牌堆，抽取命运之牌"}
          </motion.p>
        )}
        {phase === "drawing" && currentDrawIndex < SELECT_COUNT && (
          <motion.p key={`draw-${currentDrawIndex}`} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center text-gold/45 text-xs flex items-center justify-center gap-1.5">
            <Sparkles size={10} className="text-gold/50" />
            {t(`new.tarotDraw${currentDrawIndex + 1}`) ||
              ["抽取第二张 — 现在", "抽取最后一张 — 未来"][currentDrawIndex - 1] ||
              "继续抽取…"}
            <Sparkles size={10} className="text-gold/50" />
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
      {phase !== "complete" && (
      <div className="relative flex justify-center items-center" style={{ minHeight: 220 }}>

        {/* ── Drawn cards (slots) ── */}
        <div className="relative flex items-start justify-center" style={{ width: "100%", maxWidth: 440 }}>
          {drawnCards.map((card, i) => {
            const isFlipped = flipComplete[i]
            return (
              <motion.div
                key={`card-${i}`}
                initial={{ opacity: 0, y: 30, scale: 0.5, x: 0 }}
                animate={{
                  opacity: 1,
                  x: slotX[i],
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 18,
                  mass: 0.8,
                }}
                className="absolute"
                style={{ perspective: 800, left: "50%", marginLeft: -45 }}
              >
                <motion.div
                  className="relative w-[90px] h-[135px]"
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                    className="text-center mt-2.5"
                  >
                    <span className="text-gold/80 text-[11px] font-medium tracking-wide">{card.position}</span>
                  </motion.div>
                )}
              </motion.div>
            )
          })}

          {/* ── Deck (tappable) ── */}
          {isDeckVisible && (
              <motion.div
                ref={deckRef}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isAnimating ? 0.6 : 1,
                  scale: isAnimating && !isShaking ? 0.88 : 1,
                  x: 0,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                onClick={drawCard}
                className={`absolute cursor-pointer select-none ${isShaking ? "animate-tarot-shake" : ""}`}
                style={{ perspective: 800, left: "50%", marginLeft: -45 }}
                whileHover={!isAnimating ? { scale: 1.06, y: -5 } : undefined}
                whileTap={!isAnimating ? { scale: 0.9 } : undefined}
              >
                {/* Stacked deck: 4 offset card backs */}
                <div className="relative w-[90px] h-[135px]">
                  {[3, 2, 1, 0].map(layer => (
                    <div key={layer}
                      className="absolute inset-0 transition-transform duration-300"
                      style={{
                        transform: `translate(${layer * 1.5}px, ${layer * 2}px)`,
                        opacity: 0.35 + layer * 0.2,
                        zIndex: layer,
                      }}>
                      <CardBack />
                    </div>
                  ))}

                  {/* Pulsing glow ring */}
                  <div className="absolute -inset-3 rounded-2xl pointer-events-none"
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

                {/* "Tap to draw" hint — above deck */}
                <motion.div
                  animate={{ opacity: [0.35, 0.75, 0.35] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 left-0 right-0 text-center"
                >
                  <span className="text-gold/55 text-[10px] whitespace-nowrap font-medium">
                    ✦ {t("new.tarotTapHint") || "点击抽取"} ✦
                  </span>
                </motion.div>

                {/* Deck sparkles during shake — INSIDE deck container */}
                {isShaking && (
                  <div className="absolute -inset-4 pointer-events-none overflow-visible">
                    {Array.from({ length: 8 }).map((_, i) => {
                      const angle = (i / 8) * Math.PI * 2
                      const dist = 55 + Math.random() * 15
                      return (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{
                            background: i % 2 === 0 ? "#c9a84c" : "#f0d878",
                            top: `calc(50% + ${Math.sin(angle) * dist}px)`,
                            left: `calc(50% + ${Math.cos(angle) * dist}px)`,
                          }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                          transition={{ duration: 0.4, delay: i * 0.03 }}
                        />
                      )
                    })}
                  </div>
                )}
              </motion.div>
          )}
        </div>
      </div>
      )}

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
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 200, damping: 18 }}
                className="rounded-2xl p-3 text-center"
                style={{
                  background: "linear-gradient(170deg, rgba(26,15,58,0.8) 0%, rgba(12,26,56,0.6) 100%)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  boxShadow: "0 0 20px rgba(201,168,76,0.08)",
                }}
              >
                <div className="text-[10px] text-white/35 mb-1.5 uppercase tracking-wider">{c.position}</div>
                <div className={`text-3xl mb-1.5 drop-shadow-[0_0_8px_rgba(201,168,76,0.25)] ${c.reversed ? "scale-y-[-1]" : ""}`}>
                  {c.arcana.emoji}
                </div>
                <div className="text-gold text-sm font-serif font-bold leading-tight">{c.card}</div>
                {c.reversed && (
                  <div className="text-white/30 text-[10px] mt-1 tracking-wider">
                    {locale === "zh" ? "逆位" : "Reversed"}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
