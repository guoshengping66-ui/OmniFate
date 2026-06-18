"use client"
import { useRef, useState, useEffect, useMemo } from "react"

const BAGUA = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"]
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"]

/** Map scrollProgress into a 0-1 value within a phase window */
function phase(progress: number, start: number, end: number): number {
  if (progress <= start) return 0
  if (progress >= end) return 1
  return (progress - start) / (end - start)
}

interface Props {
  scrollProgress?: number
}

export default function FateOrb({ scrollProgress = 0 }: Props) {
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

  const sp = scrollProgress

  // Phase values (0-1 within each phase window)
  const p1 = phase(sp, 0, 0.2)      // core brighten
  const p2 = phase(sp, 0.2, 0.4)    // neural network
  const p3 = phase(sp, 0.4, 0.6)    // zodiac deconstruct
  const p4 = phase(sp, 0.6, 0.8)    // energy flow down
  const p5 = phase(sp, 0.8, 1.0)    // route line

  // Simplified neural network — 8 nodes, nearest-neighbor connections only
  const neuralData = useMemo(() => {
    const nodes = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2
      const r = 90 + (i % 2) * 15
      return { x: 260 + Math.cos(angle) * r, y: 260 + Math.sin(angle) * r }
    })
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = []
    for (let i = 0; i < nodes.length; i++) {
      const next = (i + 1) % nodes.length
      lines.push({ x1: nodes[i].x, y1: nodes[i].y, x2: nodes[next].x, y2: nodes[next].y })
    }
    return { nodes, lines }
  }, [])

  // Energy flow-down particles (reduced from 20 to 8)
  const flowParticles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      x: 240 + (Math.random() - 0.5) * 80,
      delay: i * 0.12,
      speed: 0.6 + Math.random() * 0.4,
      size: 2 + Math.random() * 3,
    }))
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
      <div className="relative w-[520px] h-[520px] md:w-[620px] md:h-[620px]" style={{ willChange: "transform" }}>

        {/* Layer 1: Outermost star nodes — fade out in phase 3 */}
        <div
          className="absolute inset-0"
          style={{
            animation: "spin 120s linear infinite",
            opacity: 1 - p3 * 0.6,
            willChange: "transform",
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360
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

        {/* Layer 2: Zodiac orbit — deconstruct in phase 3 */}
        <div
          className="absolute inset-[10%]"
          style={{ animation: "spin 90s linear infinite" }}
        >
          <div
            className="absolute inset-0 rounded-full border border-[#C5A880]/10"
            style={{
              borderColor: `rgba(197,168,128,${0.1 + p1 * 0.15})`,
              transform: `scale(${1 + p3 * 0.3})`,
              opacity: 1 - p3 * 0.8,
              transition: "transform 0.1s, opacity 0.1s",
            }}
          />
          {ZODIAC.map((symbol, i) => {
            const angle = (i / 12) * 360
            // In phase 3, scatter outward
            const scatter = p3 * 60
            const fade = 1 - p3 * 0.9
            const rotate = p3 * (i % 2 === 0 ? 45 : -45)
            return (
              <div
                key={`zodiac-${i}`}
                className="absolute text-lg md:text-xl text-[#C5A880]/40"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateY(-${130 + scatter}px) rotate(-${angle + rotate}deg) translateX(-50%)`,
                  transformOrigin: "0 0",
                  opacity: fade,
                  filter: `blur(${p3 * 2}px)`,
                  transition: "transform 0.1s, opacity 0.1s",
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
          <div
            className="absolute inset-0 rounded-full border border-[#C5A880]/15"
            style={{
              borderColor: `rgba(197,168,128,${0.15 + p1 * 0.2})`,
            }}
          />
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
                  textShadow: `0 0 ${10 + p1 * 15}px rgba(197,168,128,${0.3 + p1 * 0.4})`,
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
          style={{
            animation: "spin 40s linear infinite",
            borderColor: `rgba(197,168,128,${0.2 + p1 * 0.3})`,
          }}
        />

        {/* Layer 5: Particle convergence ring — intensify in phase 1 */}
        <div
          className="absolute inset-[35%] pointer-events-none"
          style={{ animation: "spin 20s linear infinite" }}
        >
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * 360
            const baseR = 30 + (i % 3) * 8
            const pulseR = baseR + p1 * 5
            return (
              <div
                key={`particle-${i}`}
                className="absolute w-[3px] h-[3px] rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateY(-${pulseR}px)`,
                  background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(212,175,55,0.6) 50%, transparent 100%)",
                  boxShadow: `0 0 ${8 + p1 * 12}px rgba(212,175,55,${0.6 + p1 * 0.4})`,
                  animation: `particlePulse 2s ease-in-out infinite ${i * 0.15}s`,
                }}
              />
            )
          })}
        </div>

        {/* Phase 2: Simplified neural network (8 nodes, ring connections) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: p2, transition: "opacity 0.3s" }}
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 520 520">
            {neuralData.lines.map((line, i) => (
              <line
                key={i}
                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                stroke="rgba(212,175,55,0.5)"
                strokeWidth="0.8"
              />
            ))}
            {neuralData.nodes.map((node, i) => (
              <circle
                key={i}
                cx={node.x} cy={node.y}
                r={2 + p2 * 1.5}
                fill="rgba(212,175,55,0.9)"
              />
            ))}
          </svg>
        </div>

        {/* Layer 6: Destiny core — brighten in phase 1 */}
        <div className="absolute inset-[40%] rounded-full overflow-hidden">
          {/* Outer halo ring */}
          <div
            className="absolute inset-[-10%] rounded-full"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, rgba(197,168,128,${0.15 + p1 * 0.2}) 25%, transparent 50%, rgba(212,175,55,${0.1 + p1 * 0.15}) 75%, transparent 100%)`,
              animation: "spin 15s linear infinite",
            }}
          />
          {/* Main golden disc */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(212,175,55,${0.5 + p1 * 0.4}) 0%, rgba(197,168,128,${0.2 + p1 * 0.2}) 40%, rgba(197,168,128,${0.05 + p1 * 0.1}) 65%, transparent 80%)`,
              animation: "breathe 6s ease-in-out infinite",
              transform: `scale(${1 + p1 * 0.15})`,
            }}
          />
          {/* Mid ring */}
          <div
            className="absolute inset-[15%] rounded-full border border-[#D4AF37]/20"
            style={{
              animation: "spin-reverse 25s linear infinite",
              borderColor: `rgba(212,175,55,${0.2 + p1 * 0.3})`,
            }}
          />
          {/* Inner glow */}
          <div
            className="absolute inset-[20%] rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(197,168,128,${0.9 + p1 * 0.1}) 0%, rgba(212,175,55,${0.4 + p1 * 0.3}) 45%, transparent 70%)`,
              animation: "breathe 5s ease-in-out infinite 0.5s",
              transform: `scale(${1 + p1 * 0.1})`,
            }}
          />
          {/* Bright core */}
          <div
            className="absolute inset-[35%] rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,${0.95 + p1 * 0.05}) 0%, rgba(232,213,183,${0.7 + p1 * 0.3}) 30%, rgba(212,175,55,${0.5 + p1 * 0.3}) 55%, transparent 75%)`,
              animation: "corePulse 3s ease-in-out infinite",
            }}
          />
          {/* Hot center point */}
          <div
            className="absolute inset-[44%] rounded-full"
            style={{
              background: `radial-gradient(circle, #fff 0%, rgba(255,255,255,${0.8 + p1 * 0.2}) 20%, rgba(212,175,55,${0.6 + p1 * 0.3}) 50%, transparent 80%)`,
              animation: "corePulse 3s ease-in-out infinite 0.3s",
              boxShadow: `0 0 ${30 + p1 * 30}px rgba(212,175,55,${0.4 + p1 * 0.4}), 0 0 ${60 + p1 * 40}px rgba(197,168,128,${0.2 + p1 * 0.3})`,
            }}
          />
        </div>

        {/* Layer 7: Outer glow aura — intensify in phase 1 */}
        <div
          className="absolute inset-[25%] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(212,175,55,${0.12 + p1 * 0.15}) 0%, rgba(197,168,128,${0.06 + p1 * 0.1}) 40%, transparent 70%)`,
            animation: "breathe 6s ease-in-out infinite",
            filter: `blur(${30 - p1 * 10}px)`,
            transform: `scale(${1 + p1 * 0.2})`,
          }}
        />

        {/* Phase 4: Energy flow-down particles */}
        {p4 > 0 && (
          <div
            className="absolute inset-[30%] pointer-events-none"
            style={{ opacity: p4 }}
          >
            {flowParticles.map((p, i) => {
              const yOffset = ((sp * 3 + p.delay) % 1) * 300
              const opacity = Math.sin(((sp * 3 + p.delay) % 1) * Math.PI)
              return (
                <div
                  key={`flow-${i}`}
                  className="absolute rounded-full"
                  style={{
                    left: `${(p.x / 520) * 100}%`,
                    top: `50%`,
                    width: p.size,
                    height: p.size,
                    background: "radial-gradient(circle, rgba(212,175,55,0.9) 0%, rgba(197,168,128,0.5) 60%, transparent 100%)",
                    boxShadow: `0 0 ${p.size * 2}px rgba(212,175,55,0.6)`,
                    transform: `translateY(${yOffset}px)`,
                    opacity: Math.max(0, opacity * p4),
                  }}
                />
              )
            })}
          </div>
        )}

        {/* Phase 5: Route line extending downward */}
        {p5 > 0 && (
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              top: "70%",
              width: 2,
              height: `${p5 * 200}px`,
              background: "linear-gradient(to bottom, rgba(212,175,55,0.8), rgba(197,168,128,0.3), transparent)",
              boxShadow: `0 0 12px rgba(212,175,55,${0.4 * p5}), 0 0 30px rgba(212,175,55,${0.2 * p5})`,
              borderRadius: 1,
              opacity: p5,
            }}
          />
        )}
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
