"use client"
import { useRef, useEffect, useState } from "react"

export default function EnergyBridge() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative h-24 sm:h-32 overflow-hidden pointer-events-none">
      {/* Central golden line */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[2px] h-full"
        style={{
          background: "linear-gradient(to bottom, rgba(212,175,55,0.6), rgba(197,168,128,0.2), transparent)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease-out",
        }}
      />

      {/* Glow aura around line */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 w-8 h-full"
        style={{
          background: "linear-gradient(to bottom, rgba(212,175,55,0.15), rgba(197,168,128,0.05), transparent)",
          filter: "blur(8px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 1s ease-out 0.2s",
        }}
      />

      {/* Falling particles */}
      {visible && Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 3,
            height: 3,
            background: "radial-gradient(circle, rgba(212,175,55,0.9) 0%, transparent 100%)",
            boxShadow: "0 0 8px rgba(212,175,55,0.5)",
            animation: `energyDrop ${1.2 + i * 0.15}s ease-in infinite ${i * 0.18}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes energyDrop {
          0% { transform: translateX(-50%) translateY(-10px); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(-50%) translateY(80px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
