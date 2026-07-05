"use client"

export function NebulaBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }} suppressHydrationWarning>
      {/* Deep space base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(25, 40, 90, 0.32) 0%, transparent 55%),
            radial-gradient(ellipse at 70% 30%, rgba(15, 25, 55, 0.28) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 60%, rgba(12, 18, 38, 0.35) 0%, transparent 45%),
            radial-gradient(ellipse at 85% 70%, rgba(20, 30, 65, 0.22) 0%, transparent 50%)
          `
        }}
      />

      {/* Large cosmic nebula — deep blue */}
      <div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(ellipse at 40% 40%, rgba(30, 60, 140, 0.28) 0%, rgba(15, 30, 80, 0.14) 35%, transparent 65%)",
          width: "55vw",
          height: "55vw",
          left: "-8%",
          top: "5%",
          animation: "nebulaDrift1 28s ease-in-out infinite",
          filter: "blur(2px)",
        }}
      />

      {/* Large cosmic nebula — rich purple */}
      <div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(ellipse at 55% 45%, rgba(80, 35, 130, 0.24) 0%, rgba(35, 15, 70, 0.12) 40%, transparent 70%)",
          width: "50vw",
          height: "50vw",
          right: "-5%",
          top: "10%",
          animation: "nebulaDrift2 32s ease-in-out infinite",
          filter: "blur(2px)",
        }}
      />

      {/* Teal nebula — cosmic dust */}
      <div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(20, 100, 100, 0.18) 0%, rgba(10, 50, 55, 0.09) 40%, transparent 70%)",
          width: "45vw",
          height: "40vw",
          left: "25%",
          top: "40%",
          animation: "nebulaDrift3 24s ease-in-out infinite",
          filter: "blur(3px)",
        }}
      />

      {/* Subtle gold nebula — warm starlight */}
      <div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(200, 168, 74, 0.1) 0%, rgba(160, 120, 40, 0.05) 30%, transparent 60%)",
          width: "35vw",
          height: "30vw",
          left: "40%",
          top: "25%",
          animation: "nebulaDrift1 22s ease-in-out infinite reverse",
          filter: "blur(4px)",
        }}
      />

      {/* Galaxy band — horizontal milky way strip */}
      <div
        className="absolute left-0 right-0"
        style={{
          height: "35vh",
          top: "38%",
          background: `
            linear-gradient(180deg,
              transparent 0%,
              rgba(40, 60, 140, 0.06) 15%,
              rgba(60, 35, 120, 0.08) 25%,
              rgba(30, 70, 130, 0.1) 35%,
              rgba(200, 168, 74, 0.04) 42%,
              rgba(20, 50, 100, 0.08) 48%,
              rgba(40, 30, 90, 0.07) 55%,
              rgba(25, 55, 110, 0.05) 65%,
              transparent 85%
            )
          `,
          transform: "skewY(-6deg)",
          animation: "galaxyBandFlow 18s ease-in-out infinite alternate",
        }}
      />

      {/* Second galaxy band — thinner, higher */}
      <div
        className="absolute left-0 right-0"
        style={{
          height: "18vh",
          top: "15%",
          background: `
            linear-gradient(180deg,
              transparent 0%,
              rgba(50, 40, 120, 0.05) 20%,
              rgba(25, 55, 110, 0.07) 45%,
              rgba(180, 140, 60, 0.03) 55%,
              transparent 100%
            )
          `,
          transform: "skewY(4deg)",
          animation: "galaxyBandFlow 22s ease-in-out infinite alternate-reverse",
        }}
      />

      {/* Cosmic dust sparkle — tiny bright dots simulating distant star clusters */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 22% 28%, rgba(180, 200, 255, 0.25) 0 1.5px, transparent 2px),
            radial-gradient(circle at 58% 42%, rgba(200, 180, 140, 0.2) 0 1px, transparent 1.5px),
            radial-gradient(circle at 75% 18%, rgba(180, 190, 240, 0.22) 0 1.5px, transparent 2px),
            radial-gradient(circle at 35% 55%, rgba(200, 170, 120, 0.18) 0 1px, transparent 1.5px),
            radial-gradient(circle at 68% 62%, rgba(160, 180, 220, 0.2) 0 1px, transparent 1.5px),
            radial-gradient(circle at 15% 45%, rgba(190, 170, 130, 0.16) 0 1px, transparent 1.5px),
            radial-gradient(circle at 82% 35%, rgba(170, 190, 230, 0.2) 0 1.5px, transparent 2px),
            radial-gradient(circle at 48% 22%, rgba(180, 160, 120, 0.18) 0 1px, transparent 1.5px)
          `,
          backgroundSize: "100% 100%",
          opacity: 0.7,
          animation: "cosmicDustPulse 8s ease-in-out infinite alternate",
        }}
      />

      {/* Floating bagua symbols — ethereal ancient wisdom in space */}
      {["☰", "☷", "☵", "☲", "☴", "☳", "☶", "☱"].map((symbol, i) => (
        <div
          key={i}
          className="absolute font-serif select-none"
          style={{
            left: `${8 + i * 11}%`,
            top: `${15 + (i % 4) * 22}%`,
            fontSize: `${20 + (i % 3) * 8}px`,
            color: `rgba(200, 168, 74, ${0.08 + (i % 3) * 0.06})`,
            animation: `symbolFloat ${10 + i * 2}s ease-in-out ${i * 0.8}s infinite`,
            filter: "blur(0.3px)",
          }}
        >
          {symbol}
        </div>
      ))}

      {/* Subtle vignette — darker edges for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(2, 3, 12, 0.35) 70%, rgba(2, 3, 12, 0.55) 100%)
          `,
        }}
      />
    </div>
  )
}
