"use client"

/**
 * Pure CSS Milky Way / galaxy river background.
 * Replaces Qingnang's ink-sea mountain waves with a cosmic river of stars.
 */
export function MilkyWayBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Layer 1: Deep space gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #020617 0%, #06071C 25%, #0A0A2E 50%, #0E0828 75%, #020617 100%)",
        }}
      />

      {/* Layer 2: Nebula glows */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 35%, rgba(139,126,199,0.06) 0%, transparent 50%)," +
            "radial-gradient(ellipse at 75% 30%, rgba(123,158,199,0.05) 0%, transparent 45%)," +
            "radial-gradient(ellipse at 50% 60%, rgba(201,168,76,0.03) 0%, transparent 55%)," +
            "radial-gradient(ellipse at 85% 70%, rgba(139,126,199,0.04) 0%, transparent 40%)",
        }}
      />

      {/* Layer 3: Galaxy river — horizontal light band */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute left-0 right-0 h-[60%] top-[25%]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(123,158,199,0.06) 15%, rgba(139,126,199,0.08) 30%, rgba(201,168,76,0.04) 45%, rgba(123,158,199,0.05) 60%, rgba(139,126,199,0.03) 75%, transparent 100%)",
            transform: "skewY(-2deg)",
          }}
        />
      </div>

      {/* Layer 4: Star field — dense dots mimicking Milky Way band */}
      <div
        className="absolute inset-0 galaxy-stars"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.7) 0px, transparent 0.5px)," +
            "radial-gradient(circle, rgba(123,158,199,0.5) 0px, transparent 0.5px)," +
            "radial-gradient(circle, rgba(201,168,76,0.3) 0px, transparent 0.5px)," +
            "radial-gradient(circle, rgba(255,255,255,0.4) 0px, transparent 0.5px)",
          backgroundSize: "120px 120px, 200px 200px, 80px 80px, 160px 160px",
          backgroundPosition: "0 0, 40px 60px, 100px 30px, 20px 80px",
          maskImage: "linear-gradient(180deg, transparent 0%, black 10%, black 55%, black 65%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 5%, black 20%, black 80%, transparent 95%)",
        }}
      />

      {/* Layer 5: Drifting light particles — deterministic values to avoid hydration mismatch */}
      {Array.from({ length: 15 }).map((_, i) => {
        // Use deterministic values based on index (no Math.random for SSR safety)
        const seed = ((i * 137 + 53) % 100) / 100
        const isGold = i < 4
        const top = 20 + seed * 45
        const delay = (i * 0.7) % 8
        const duration = 14 + (i % 6) * 3
        const size = isGold ? 2 + (i % 3) : 1.5 + (i % 3) * 0.5
        const opacity = isGold ? 0.4 + (i % 3) * 0.1 : 0.2 + (i % 5) * 0.05
        const leftStart = (i * 7.3) % 100 - 5

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              top: `${top}%`,
              left: `${leftStart}%`,
              background: isGold
                ? "radial-gradient(circle, rgba(201,168,76,0.8) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(200,200,255,0.6) 0%, transparent 70%)",
              boxShadow: isGold
                ? `0 0 ${size * 3}px rgba(201,168,76,0.4)`
                : `0 0 ${size * 2}px rgba(180,180,220,0.3)`,
              opacity,
              animation: `starDrift ${duration}s linear ${delay}s infinite`,
            }}
          />
        )
      })}

    </div>
  )
}
