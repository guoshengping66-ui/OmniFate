"use client"

export function NebulaBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }} suppressHydrationWarning>
      {/* Nebula clouds */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(45,27,78,0.4) 0%, transparent 70%)",
          left: "10%",
          top: "20%",
          filter: "blur(80px)",
          animation: "nebulaDrift1 20s ease-in-out infinite",
        }}
      />

      <div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
          right: "15%",
          top: "40%",
          filter: "blur(60px)",
          animation: "nebulaDrift2 25s ease-in-out infinite",
        }}
      />

      <div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(45,106,79,0.1) 0%, transparent 70%)",
          left: "50%",
          bottom: "10%",
          filter: "blur(70px)",
          animation: "nebulaDrift3 18s ease-in-out infinite",
        }}
      />

      {/* Floating mystical symbols */}
      {["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"].map((symbol, i) => (
        <div
          key={i}
          className="absolute text-gold/5 font-serif text-2xl"
          style={{
            left: `${10 + i * 12}%`,
            top: `${30 + (i % 3) * 25}%`,
            animation: `symbolFloat ${8 + i * 2}s ease-in-out ${i * 0.5}s infinite`,
          }}
        >
          {symbol}
        </div>
      ))}
    </div>
  )
}
