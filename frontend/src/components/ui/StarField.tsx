"use client"
import { useEffect, useRef, useCallback } from "react"

interface Star {
  x: number
  y: number
  size: number
  element: HTMLDivElement
}

export function StarField() {
  const ref = useRef<HTMLDivElement>(null)
  const starsRef = useRef<Star[]>([])
  const shootingStarsRef = useRef<HTMLDivElement[]>([])

  const createShootingStar = useCallback(() => {
    if (!ref.current) return
    const star = document.createElement("div")
    const startX = Math.random() * window.innerWidth
    const startY = Math.random() * (window.innerHeight * 0.5)
    const angle = 30 + Math.random() * 30
    const distance = 200 + Math.random() * 300

    star.className = "shooting-star"
    star.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      width: 100px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #C9A84C, transparent);
      transform: rotate(${angle}deg);
      opacity: 0;
      pointer-events: none;
      z-index: 1;
    `
    ref.current.appendChild(star)
    shootingStarsRef.current.push(star)

    star.animate([
      { opacity: 0, transform: `rotate(${angle}deg) translateX(0)` },
      { opacity: 0.8, transform: `rotate(${angle}deg) translateX(${distance * 0.3}px)`, offset: 0.2 },
      { opacity: 0, transform: `rotate(${angle}deg) translateX(${distance}px)` },
    ], {
      duration: 1500 + Math.random() * 1000,
      easing: "ease-out",
    }).onfinish = () => {
      star.remove()
      shootingStarsRef.current = shootingStarsRef.current.filter(s => s !== star)
    }
  }, [])

  useEffect(() => {
    if (!ref.current) return
    const container = ref.current

    // Defer heavy DOM work to idle callback
    const createStars = () => {
      // Reduced from 150 to 60 stars — still visually rich, much lighter
      for (let i = 0; i < 60; i++) {
        const star = document.createElement("div")
        const size = Math.random() * 2.5 + 0.5
        const x = Math.random() * 100
        const y = Math.random() * 100
        star.className = "star"
        star.style.cssText = `
          width:${size}px; height:${size}px;
          left:${x}%; top:${y}%;
          --dur:${(Math.random() * 4 + 2).toFixed(1)}s;
          animation-delay:${(Math.random() * 5).toFixed(1)}s;
          opacity:${Math.random() * 0.6 + 0.1};
        `
        container.appendChild(star)
        starsRef.current.push({ x, y, size, element: star })
      }

      // Reduced from 8 to 4 constellation lines
      const bigStars = starsRef.current.filter(s => s.size > 1.5)
      for (let i = 0; i < Math.min(4, bigStars.length - 1); i++) {
        const s1 = bigStars[i]
        const s2 = bigStars[i + 1]
        const line = document.createElement("div")
        line.className = "constellation-line"
        const dx = s2.x - s1.x
        const dy = s2.y - s1.y
        const length = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)
        line.style.cssText = `
          position: absolute;
          left: ${s1.x}%;
          top: ${s1.y}%;
          width: ${length}%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent);
          transform-origin: 0 0;
          transform: rotate(${angle}deg);
          opacity: 0;
          animation: constellation-fade 8s ease-in-out infinite;
          animation-delay: ${i * 1.5}s;
        `
        container.appendChild(line)
      }
    }

    // Use requestIdleCallback to defer star creation, fallback to setTimeout
    const idleId = typeof requestIdleCallback !== "undefined"
      ? requestIdleCallback(createStars, { timeout: 2000 })
      : setTimeout(createStars, 500) as unknown as number

    // Shooting stars: less frequent (every 5s instead of 3s)
    const interval = setInterval(() => {
      if (Math.random() > 0.7) createShootingStar()
    }, 5000)

    return () => {
      if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(idleId)
      else clearTimeout(idleId)
      clearInterval(interval)
      shootingStarsRef.current.forEach(s => s.remove())
    }
  }, [createShootingStar])

  return <div ref={ref} className="stars" aria-hidden />
}
