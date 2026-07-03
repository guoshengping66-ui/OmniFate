"use client"

const BAGUA = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"]
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"]

interface Props {
  scrollProgress?: number
}

export default function FateOrb({ scrollProgress = 0 }: Props) {
  // Phase: core brighten from 0→1 as user scrolls
  const p1 = Math.min(1, Math.max(0, scrollProgress / 0.4))

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
      <div className="relative w-[80vw] h-[80vw] max-w-[480px] max-h-[480px] md:w-[560px] md:h-[560px]">
        {/* Layer 1: Outer star nodes */}
        <div className="absolute inset-0 pointer-events-none" style={{ animation: "astrolabeSpin 100s linear infinite" }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360
            return (
              <div
                key={`star-${i}`}
                className="absolute w-1 h-1 rounded-full bg-stellar-blue/50"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateY(-48%) translateX(-50%)`,
                  boxShadow: "0 0 4px rgba(123,158,199,0.4)",
                }}
              />
            )
          })}
        </div>

        {/* Layer 2: Zodiac ring */}
        <div className="absolute inset-[10%]" style={{ animation: "astrolabeSpin 80s linear infinite" }}>
          <div
            className="absolute inset-0 rounded-full border border-stellar-blue/[0.12]"
            style={{ borderColor: `rgba(123,158,199,${0.12 + p1 * 0.12})` }}
          />
          {ZODIAC.map((symbol, i) => {
            const angle = (i / 12) * 360
            return (
              <div
                key={`zodiac-${i}`}
                className="absolute text-base md:text-lg text-stellar-blue/40 font-serif"
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
        <div className="absolute inset-[25%]" style={{ animation: "astrolabeSpinReverse 55s linear infinite" }}>
          <div
            className="absolute inset-0 rounded-full border border-stellar-violet/[0.12]"
            style={{ borderColor: `rgba(139,126,199,${0.12 + p1 * 0.15})` }}
          />
          {BAGUA.map((symbol, i) => {
            const angle = (i / 8) * 360
            return (
              <div
                key={`bagua-${i}`}
                className="absolute text-lg md:text-xl text-stellar-violet/40 font-serif"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateY(-80px) rotate(-${angle}deg) translateX(-50%)`,
                  transformOrigin: "0 0",
                  textShadow: `0 0 ${8 + p1 * 12}px rgba(139,126,199,${0.2 + p1 * 0.25})`,
                }}
              >
                {symbol}
              </div>
            )
          })}
        </div>

        {/* Layer 4: Inner orbit ring */}
        <div
          className="absolute inset-[36%] rounded-full border border-gold/[0.12]"
          style={{
            animation: "astrolabeSpin 35s linear infinite",
            borderColor: `rgba(201,168,76,${0.12 + p1 * 0.2})`,
          }}
        />

        {/* Layer 5: Constellation nodes on inner ring */}
        <div className="absolute inset-[36%] pointer-events-none" style={{ animation: "astrolabeSpin 25s linear infinite" }}>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * 360
            return (
              <div
                key={`node-${i}`}
                className="absolute w-[3px] h-[3px] rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateY(-30px)`,
                  background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(201,168,76,0.5) 60%, transparent 100%)",
                  boxShadow: `0 0 ${6 + p1 * 8}px rgba(201,168,76,0.5)`,
                }}
              />
            )
          })}
        </div>

        {/* Core */}
        <div className="absolute inset-[40%] rounded-full overflow-hidden">
          <div
            className="absolute inset-[-10%] rounded-full"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, rgba(201,168,76,${0.1 + p1 * 0.1}) 25%, transparent 50%, rgba(139,126,199,${0.08 + p1 * 0.08}) 75%, transparent 100%)`,
              animation: "astrolabeSpin 15s linear infinite",
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(201,168,76,${0.4 + p1 * 0.4}) 0%, rgba(201,168,76,${0.15 + p1 * 0.2}) 40%, rgba(201,168,76,${0.04 + p1 * 0.08}) 65%, transparent 80%)`,
              animation: "pulse-slow 6s ease-in-out infinite",
              transform: `scale(${1 + p1 * 0.12})`,
            }}
          />
          <div className="absolute inset-[15%] rounded-full border border-gold/[0.15]" style={{ animation: "astrolabeSpinReverse 20s linear infinite" }} />
          <div
            className="absolute inset-[20%] rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(201,168,76,${0.8 + p1 * 0.2}) 0%, rgba(201,168,76,${0.35 + p1 * 0.25}) 45%, transparent 70%)`,
              animation: "pulse-slow 5s ease-in-out infinite 0.5s",
            }}
          />
          <div
            className="absolute inset-[35%] rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,${0.9 + p1 * 0.1}) 0%, rgba(200,168,76,${0.6 + p1 * 0.3}) 30%, rgba(200,168,76,${0.35 + p1 * 0.3}) 55%, transparent 75%)`,
              animation: "pulse-slow 3s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-[44%] rounded-full"
            style={{
              background: `radial-gradient(circle, #fff 0%, rgba(255,255,255,0.8) 20%, rgba(201,168,76,0.5) 50%, transparent 80%)`,
              animation: "pulse-slow 3s ease-in-out infinite 0.3s",
              boxShadow: `0 0 ${25 + p1 * 25}px rgba(201,168,76,0.35), 0 0 ${50 + p1 * 30}px rgba(139,126,199,0.15)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
