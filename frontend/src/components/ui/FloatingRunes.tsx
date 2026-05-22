"use client"

const RUNES = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷", "☯", "✦", "✧", "⬡"]

export function FloatingRunes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {RUNES.map((rune, i) => (
        <div
          key={i}
          className="absolute text-gold/20 font-serif select-none"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: `${15 + (i * 11) % 70}%`,
            fontSize: `${14 + (i % 3) * 6}px`,
            animation: `runeFloat ${5 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
          }}
        >
          {rune}
        </div>
      ))}
      {/* Keyframes defined in globals.css */}
    </div>
  )
}
