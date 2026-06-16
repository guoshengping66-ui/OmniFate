"use client"
import { useRef, useState, useEffect } from "react"

const BAGUA = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"] // 乾兑离震巽坎艮坤
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"]

export default function FateOrb() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      setMouse({
        x: (e.clientX - centerX) / rect.width * 10,
        y: (e.clientY - centerY) / rect.height * 10,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      style={{
        transform: `translate(${mouse.x * 0.5}px, ${mouse.y * 0.5}px)`,
        transition: "transform 0.3s ease-out",
      }}
    >
      {/* Container for all layers */}
      <div className="relative w-[520px] h-[520px] md:w-[620px] md:h-[620px]">
        {/* Layer 1: Outermost - Star nodes */}
        <div
          className="absolute inset-0"
          style={{ animation: "spin 120s linear infinite" }}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * 360
            const radius = 48
            return (
              <div
                key={`star-${i}`}
                className="absolute w-1 h-1 rounded-full bg-[#C5A880]/60"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateY(-${radius}%) translateX(-50%)`,
                  boxShadow: "0 0 6px rgba(197,168,128,0.5)",
                }}
              />
            )
          })}
        </div>

        {/* Layer 2: Zodiac orbit */}
        <div
          className="absolute inset-[10%]"
          style={{ animation: "spin 90s linear infinite" }}
        >
          {/* Orbit ring */}
          <div className="absolute inset-0 rounded-full border border-[#C5A880]/10" />
          {/* Zodiac symbols */}
          {ZODIAC.map((symbol, i) => {
            const angle = (i / 12) * 360
            return (
              <div
                key={`zodiac-${i}`}
                className="absolute text-lg md:text-xl text-[#C5A880]/40"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateY(-130px) rotate(-${angle}deg) translateX(-50%)`,
                  transformOrigin: "0 0",
                }}
              >
                {symbol}
              </div>
            )
          })}
        </div>

        {/* Layer 3: Bagua ring */}
        <div
          className="absolute inset-[25%]"
          style={{ animation: "spin-reverse 60s linear infinite" }}
        >
          {/* Bagua ring */}
          <div className="absolute inset-0 rounded-full border border-[#C5A880]/15" />
          {/* Bagua symbols */}
          {BAGUA.map((symbol, i) => {
            const angle = (i / 8) * 360
            return (
              <div
                key={`bagua-${i}`}
                className="absolute text-xl md:text-2xl text-[#C5A880]/50 font-serif"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateY(-90px) rotate(-${angle}deg) translateX(-50%)`,
                  transformOrigin: "0 0",
                  textShadow: "0 0 10px rgba(197,168,128,0.3)",
                }}
              >
                {symbol}
              </div>
            )
          })}
        </div>

        {/* Layer 4: Inner orbit ring */}
        <div
          className="absolute inset-[38%] rounded-full border border-[#C5A880]/20"
          style={{ animation: "spin 40s linear infinite" }}
        />

        {/* Layer 5: Particle convergence ring */}
        <div
          className="absolute inset-[35%] pointer-events-none"
          style={{ animation: "spin 20s linear infinite" }}
        >
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * 360
            return (
              <div
                key={`particle-${i}`}
                className="absolute w-[3px] h-[3px] rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateY(-${30 + (i % 3) * 8}px)`,
                  background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(212,175,55,0.6) 50%, transparent 100%)",
                  boxShadow: "0 0 8px rgba(212,175,55,0.6)",
                  animation: `particlePulse 2s ease-in-out infinite ${i * 0.15}s`,
                }}
              />
            )
          })}
        </div>

        {/* Layer 6: Destiny core - golden layered disc */}
        <div className="absolute inset-[40%] rounded-full overflow-hidden">
          {/* Outer halo ring */}
          <div
            className="absolute inset-[-10%] rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent 0%, rgba(197,168,128,0.15) 25%, transparent 50%, rgba(212,175,55,0.1) 75%, transparent 100%)",
              animation: "spin 15s linear infinite",
            }}
          />
          {/* Main golden disc */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(212,175,55,0.5) 0%, rgba(197,168,128,0.2) 40%, rgba(197,168,128,0.05) 65%, transparent 80%)",
              animation: "breathe 6s ease-in-out infinite",
            }}
          />
          {/* Mid ring */}
          <div
            className="absolute inset-[15%] rounded-full border border-[#D4AF37]/20"
            style={{ animation: "spin-reverse 25s linear infinite" }}
          />
          {/* Inner glow */}
          <div
            className="absolute inset-[20%] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(197,168,128,0.9) 0%, rgba(212,175,55,0.4) 45%, transparent 70%)",
              animation: "breathe 5s ease-in-out infinite 0.5s",
            }}
          />
          {/* Bright core */}
          <div
            className="absolute inset-[35%] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(232,213,183,0.7) 30%, rgba(212,175,55,0.5) 55%, transparent 75%)",
              animation: "corePulse 3s ease-in-out infinite",
            }}
          />
          {/* Hot center point */}
          <div
            className="absolute inset-[44%] rounded-full"
            style={{
              background: "radial-gradient(circle, #fff 0%, rgba(255,255,255,0.8) 20%, rgba(212,175,55,0.6) 50%, transparent 80%)",
              animation: "corePulse 3s ease-in-out infinite 0.3s",
              boxShadow: "0 0 30px rgba(212,175,55,0.4), 0 0 60px rgba(197,168,128,0.2)",
            }}
          />
        </div>

        {/* Layer 7: Outer glow aura */}
        <div
          className="absolute inset-[25%] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(197,168,128,0.06) 40%, transparent 70%)",
            animation: "breathe 6s ease-in-out infinite",
            filter: "blur(30px)",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes corePulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes particlePulse {
          0%, 100% { opacity: 0.4; transform: rotate(var(--angle, 0deg)) translateY(-30px) scale(0.8); }
          50% { opacity: 1; transform: rotate(var(--angle, 0deg)) translateY(-30px) scale(1.2); }
        }
      `}</style>
    </div>
  )
}
