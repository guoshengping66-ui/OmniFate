"use client"
import { useEffect, useRef, useCallback } from "react"

interface Star {
  x: number
  y: number
  size: number
  element: HTMLDivElement
}

const STAR_COLORS = [
  "rgba(220,230,255,",   // blue-white (hot stars)
  "rgba(240,245,255,",   // pure white
  "rgba(255,245,220,",   // warm white
  "rgba(200,210,240,",   // cool blue
  "rgba(255,240,210,",   // warm gold-white
  "rgba(180,200,255,",   // deeper blue
]

export function StarField() {
  const ref = useRef<HTMLDivElement>(null)
  const starsRef = useRef<Star[]>([])
  const shootingStarsRef = useRef<HTMLDivElement[]>([])

  const createShootingStar = useCallback(() => {
    if (!ref.current) return
    const star = document.createElement("div")
    const startX = Math.random() * window.innerWidth
    const startY = Math.random() * (window.innerHeight * 0.6)
    const angle = 25 + Math.random() * 35
    const distance = 250 + Math.random() * 400
    const color = Math.random() > 0.7 ? "rgba(200,168,74," : "rgba(200,220,255,"

    star.className = "shooting-star"
    star.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      width: 120px;
      height: 1.5px;
      background: linear-gradient(90deg, transparent, ${color}0.9), ${color}0.2), transparent);
      transform: rotate(${angle}deg);
      opacity: 0;
      pointer-events: none;
      z-index: 1;
      border-radius: 1px;
      box-shadow: 0 0 6px ${color}0.4);
    `
    ref.current.appendChild(star)
    shootingStarsRef.current.push(star)

    star.animate([
      { opacity: 0, transform: `rotate(${angle}deg) translateX(0)` },
      { opacity: 0.9, transform: `rotate(${angle}deg) translateX(${distance * 0.25}px)`, offset: 0.15 },
      { opacity: 0.5, transform: `rotate(${angle}deg) translateX(${distance * 0.6}px)`, offset: 0.5 },
      { opacity: 0, transform: `rotate(${angle}deg) translateX(${distance}px)` },
    ], {
      duration: 1200 + Math.random() * 1400,
      easing: "ease-out",
    }).onfinish = () => {
      star.remove()
      shootingStarsRef.current = shootingStarsRef.current.filter(s => s !== star)
    }
  }, [])

  useEffect(() => {
    if (!ref.current) return
    const container = ref.current
    const orphanNodes: HTMLDivElement[] = []

    const createStars = () => {
      for (let i = 0; i < 120; i++) {
        const star = document.createElement("div")
        const size = Math.random() < 0.1
          ? 2.8 + Math.random() * 1.8
          : Math.random() < 0.3
            ? 1.5 + Math.random() * 1.3
            : 0.4 + Math.random() * 1.1
        const x = Math.random() * 100
        const y = Math.random() * 100
        const colorIdx = Math.floor(Math.random() * STAR_COLORS.length)
        const baseOpacity = size > 2.5 ? 0.5 + Math.random() * 0.4 : 0.08 + Math.random() * 0.35

        star.className = "star"
        star.style.cssText = `
          width:${size}px; height:${size}px;
          left:${x}%; top:${y}%;
          --dur:${(Math.random() * 5 + 2.5).toFixed(1)}s;
          animation-delay:${(Math.random() * 6).toFixed(1)}s;
          opacity:${baseOpacity};
          background:${STAR_COLORS[colorIdx]}${baseOpacity});
          box-shadow: ${size > 2.2
            ? `0 0 ${size * 3}px ${STAR_COLORS[colorIdx]}${baseOpacity * 0.6})`
            : "none"};
        `
        container.appendChild(star)
        orphanNodes.push(star)
        starsRef.current.push({ x, y, size, element: star })
      }

      const brightStars = starsRef.current.filter(s => s.size > 2.0)
      const usedPairs = new Set<string>()
      for (let i = 0; i < brightStars.length; i++) {
        for (let j = i + 1; j < brightStars.length; j++) {
          const s1 = brightStars[i]
          const s2 = brightStars[j]
          const dx = s2.x - s1.x
          const dy = s2.y - s1.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 28 && dist > 3 && usedPairs.size < 8) {
            const pairKey = `${i}-${j}`
            if (usedPairs.has(pairKey)) continue
            usedPairs.add(pairKey)

            const line = document.createElement("div")
            line.className = "constellation-line"
            const angle = Math.atan2(dy, dx) * (180 / Math.PI)
            line.style.cssText = `
              position: absolute;
              left: ${s1.x}%;
              top: ${s1.y}%;
              width: ${dist}%;
              height: 0.5px;
              background: linear-gradient(90deg, rgba(180,200,240,0.18), rgba(200,168,74,0.12), rgba(160,180,220,0.1));
              transform-origin: 0 0;
              transform: rotate(${angle}deg);
              opacity: 0;
              animation: constellation-fade ${6 + (i + j) % 5}s ease-in-out infinite;
              animation-delay: ${(i + j) * 0.7}s;
            `
            container.appendChild(line)
            orphanNodes.push(line)
          }
        }
      }
    }

    const idleId = typeof requestIdleCallback !== "undefined"
      ? requestIdleCallback(createStars, { timeout: 2000 })
      : setTimeout(createStars, 500) as unknown as number

    const interval = setInterval(() => {
      if (Math.random() > 0.65) createShootingStar()
    }, 4000)

    return () => {
      if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(idleId)
      else clearTimeout(idleId)
      clearInterval(interval)
      orphanNodes.forEach(n => n.remove())
      shootingStarsRef.current.forEach(s => s.remove())
    }
  }, [createShootingStar])

  return <div ref={ref} className="stars" aria-hidden />
}
