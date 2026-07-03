"use client"

/**
 * Rotating Bagua diagram with qi vortex particles.
 * Center: Tai Chi symbol with golden glow
 * Rings: 2 rotating rings with 8 trigrams
 * Vortex: 12 golden particles in spiral orbit
 */
export function BaguaOrbit() {
  const trigrams = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"]
  const trigramNames = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"]

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="relative w-[min(85vw,520px)] h-[min(85vw,520px)]">
        {/* Outermost ring — slow rotation */}
        <div className="absolute inset-0 rounded-full border border-stellar-blue/[0.06]" style={{ animation: "ringSpinSlow 90s linear infinite" }} />

        {/* Ring 2 — medium rotation */}
        <div
          className="absolute inset-[6%] rounded-full border border-stellar-violet/[0.08]"
          style={{ animation: "ringSpinRev 75s linear infinite" }}
        />

        {/* Ring 3: Trigram ring — medium-fast reverse */}
        <div className="absolute inset-[14%]" style={{ animation: "ringSpinSlow 60s linear infinite" }}>
          <div className="absolute inset-0 rounded-full border border-gold/[0.08]" />
          {trigrams.map((symbol, i) => {
            const angle = (i / 8) * 360
            return (
              <div
                key={i}
                className="absolute text-xl md:text-2xl text-gold/25 font-serif"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateY(-${i % 2 === 0 ? "38%" : "34%"}) rotate(-${angle}deg) translateX(-50%)`,
                  transformOrigin: "0 0",
                  textShadow: "0 0 8px rgba(201,168,76,0.2)",
                  filter: "blur(0.3px)",
                }}
              >
                {symbol}
              </div>
            )
          })}
        </div>

        {/* Ring 4: Inner trigram ring — faster */}
        <div className="absolute inset-[22%]" style={{ animation: "ringSpinRev 45s linear infinite" }}>
          <div className="absolute inset-0 rounded-full border border-stellar-violet/[0.1]" />
          {trigrams.map((symbol, i) => {
            const angle = (i / 8) * 360 + 22.5
            return (
              <div
                key={i}
                className="absolute text-lg md:text-xl text-stellar-violet/30 font-serif"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateY(-${i % 2 === 0 ? "30%" : "27%"}) rotate(-${angle}deg) translateX(-50%)`,
                  transformOrigin: "0 0",
                  textShadow: "0 0 6px rgba(139,126,199,0.25)",
                }}
              >
                {symbol}
              </div>
            )
          })}
        </div>

        {/* Ring 5: Near-core ring */}
        <div
          className="absolute inset-[30%] rounded-full border border-gold/[0.1]"
          style={{ animation: "ringSpinSlow 35s linear infinite" }}
        />

        {/* Qi vortex particles — spiral orbit */}
        <div className="absolute inset-[25%]" style={{ animation: "ringSpinRev 30s linear infinite" }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360
            const r = 20 + (i % 2) * 8
            return (
              <div
                key={`qi-${i}`}
                className="absolute rounded-full qi-particle"
                style={{
                  left: "50%",
                  top: "50%",
                  width: 3 + (i % 3),
                  height: 3 + (i % 3),
                  transform: `rotate(${angle}deg) translateY(-${r}%)`,
                  background: "radial-gradient(circle, rgba(201,168,76,0.9) 0%, rgba(201,168,76,0.3) 60%, transparent 100%)",
                  boxShadow: `0 0 ${6 + (i % 4) * 3}px rgba(201,168,76,0.5)`,
                  animation: `qiPulse ${2 + (i % 3) * 0.8}s ease-in-out ${i * 0.25}s infinite`,
                }}
              />
            )
          })}
        </div>

        {/* Core: Tai Chi symbol + golden glow */}
        <div className="absolute inset-[32%] rounded-full flex items-center justify-center">
          {/* Outer glow */}
          <div
            className="absolute inset-[-15%] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 40%, transparent 70%)",
              animation: "coreBreathe 6s ease-in-out infinite",
            }}
          />
          {/* Gold ring */}
          <div
            className="absolute inset-0 rounded-full border border-gold/[0.15]"
            style={{
              animation: "ringSpinSlow 25s linear infinite",
              boxShadow: "0 0 30px rgba(201,168,76,0.08), inset 0 0 30px rgba(201,168,76,0.04)",
            }}
          />
          {/* Tai Chi symbol */}
          <div
            className="absolute inset-[15%] rounded-full flex items-center justify-center text-2xl md:text-4xl text-gold/70 font-serif"
            style={{
              animation: "ringSpinSlow 20s linear infinite",
              textShadow: "0 0 20px rgba(201,168,76,0.5), 0 0 40px rgba(201,168,76,0.2)",
            }}
          >
            ☯
          </div>
          {/* Center dot */}
          <div
            className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full bg-gold"
            style={{
              boxShadow: "0 0 15px rgba(201,168,76,0.9), 0 0 30px rgba(201,168,76,0.5)",
            }}
          />
        </div>

        {/* Trigram name labels on outermost ring */}
        <div className="absolute inset-0" style={{ animation: "ringSpinSlow 90s linear infinite" }}>
          {trigramNames.map((name, i) => {
            const angle = (i / 8) * 360
            return (
              <div
                key={`name-${i}`}
                className="absolute text-[10px] text-parchment-400/40 font-serif"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateY(-48%) rotate(-${angle}deg) translateX(-50%)`,
                  transformOrigin: "0 0",
                }}
              >
                {name}
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes ringSpinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ringSpinRev {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes qiPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes coreBreathe {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
