"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

const COLORS = [
  "rgba(45,106,79,0.2)",   // 木
  "rgba(193,18,31,0.15)",  // 火
  "rgba(201,168,76,0.2)",  // 土
  "rgba(232,213,183,0.15)",// 金
  "rgba(41,128,185,0.15)", // 水
]

export function HeroParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 10,
      color: COLORS[i % COLORS.length],
      duration: 12 + Math.random() * 20,
      delay: Math.random() * 10,
    }))
    setParticles(items)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.3, 0.8, 1.1, 1],
            opacity: [0.4, 0.8, 0.3, 0.6, 0.4],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
