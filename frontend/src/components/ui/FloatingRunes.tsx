"use client"
import { motion } from "framer-motion"

const RUNES = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷", "☯", "✦", "✧", "⬡"]

export function FloatingRunes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {RUNES.map((rune, i) => (
        <motion.div
          key={i}
          className="absolute text-gold/20 font-serif select-none"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: `${15 + (i * 11) % 70}%`,
            fontSize: `${14 + (i % 3) * 6}px`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        >
          {rune}
        </motion.div>
      ))}
    </div>
  )
}
