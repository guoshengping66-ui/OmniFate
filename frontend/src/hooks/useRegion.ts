"use client"
import { useState, useEffect } from "react"

export type Region = "domestic" | "overseas"

const REGION_KEY = "alpha_mirror_region"
const REGION_TTL = 24 * 60 * 60 * 1000 // 24 hours

interface CachedRegion {
  region: Region
  timestamp: number
}

/**
 * Read a cookie value by name.
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Region detection (priority order):
 *   1. "region" cookie (set by previous detection)
 *   2. localStorage cache (fast, survives refresh)
 *   3. Browser timezone (reliable for domestic/overseas split)
 *   4. Browser language as weak fallback
 */
function detectRegionFromBrowser(): Region {
  if (typeof window === "undefined") return "domestic"

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""
  const lang = navigator.language || ""

  // Timezone is the most reliable signal for domestic vs overseas
  const domesticTimezones = [
    "Asia/Shanghai",      // China mainland
    "Asia/Chongqing",     // China (alias)
    "Asia/Harbin",        // China (alias)
    "Asia/Urumqi",        // China (alias)
    "Asia/Hong_Kong",     // Hong Kong
    "Asia/Macau",         // Macau
    "Asia/Taipei",        // Taiwan
  ]

  if (domesticTimezones.some(tz => timezone === tz || timezone.startsWith(tz + "/"))) {
    return "domestic"
  }

  // Weak fallback: language
  if (lang.startsWith("zh")) {
    return "domestic"
  }

  return "overseas"
}

function getCachedRegion(): Region | null {
  try {
    const raw = localStorage.getItem(REGION_KEY)
    if (!raw) return null
    const cached: CachedRegion = JSON.parse(raw)
    if (Date.now() - cached.timestamp < REGION_TTL) {
      return cached.region
    }
    // Expired — remove and let API detect again
    localStorage.removeItem(REGION_KEY)
  } catch {
    // Corrupted value — ignore
  }
  return null
}

function cacheRegion(region: Region) {
  try {
    const cached: CachedRegion = { region, timestamp: Date.now() }
    localStorage.setItem(REGION_KEY, JSON.stringify(cached))
  } catch {
    // localStorage full or blocked — ignore
  }
}

export function useRegion() {
  // Start with the most accurate source available (synchronous, no flash)
  const [region, setRegion] = useState<Region>(() => {
    // 1. Middleware cookie (set by Cloudflare IP detection) — highest priority
    const cookieRegion = getCookie("region") as Region | null
    if (cookieRegion === "domestic" || cookieRegion === "overseas") {
      cacheRegion(cookieRegion) // sync to localStorage for future visits
      return cookieRegion
    }
    // 2. localStorage cache
    const cached = getCachedRegion()
    if (cached) return cached
    // 3. Browser heuristic
    return detectRegionFromBrowser()
  })
  const [isLoaded, setIsLoaded] = useState(true)

  // On mount: use browser timezone to detect and cache region.
  // Timezone is reliable and doesn't require network requests.
  // Cloudflare headers (CF-IPCountry, CF-Connecting-IP) are unreliable
  // or not passed to the origin.
  useEffect(() => {
    const detected = detectRegionFromBrowser()
    setRegion(detected)
    cacheRegion(detected)
    document.cookie = `region=${detected}; max-age=86400; path=/; SameSite=lax`
  }, [])

  const switchRegion = (newRegion: Region) => {
    cacheRegion(newRegion)
    setRegion(newRegion)
  }

  return { region, switchRegion, isLoaded }
}
