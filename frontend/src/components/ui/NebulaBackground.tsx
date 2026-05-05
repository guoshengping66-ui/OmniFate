"use client"
import { motion } from "framer-motion"

export function NebulaBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      {/* Nebula clouds */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(45,27,78,0.4) 0%, transparent 70%)",
          left: "10%",
          top: "20%",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
          right: "15%",
          top: "40%",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, -25, 0],
          y: [0, 25, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(45,106,79,0.1) 0%, transparent 70%)",
          left: "50%",
          bottom: "10%",
          filter: "blur(70px)",
        }}
        animate={{
          x: [0, 20, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating mystical symbols */}
      {["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"].map((symbol, i) => (
        <motion.div
          key={i}
          className="absolute text-gold/5 font-serif text-2xl"
          style={{
            left: `${10 + i * 12}%`,
            top: `${30 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.03, 0.08, 0.03],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          {symbol}
        </motion.div>
      ))}
    </div>
  )
}
