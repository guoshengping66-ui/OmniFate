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
 * Multi-layer region detection (priority order):
 *   1. Middleware-set "region" cookie (Cloudflare CF-IPCountry — most accurate)
 *   2. localStorage cache (fast, survives refresh)
 *   3. /api/region endpoint (Cloudflare CF-IPCountry via fetch)
 *   4. Browser locale / timezone heuristic (fallback)
 */
function detectRegionFromBrowser(): Region {
  if (typeof window === "undefined") return "domestic"

  const lang = navigator.language || ""
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""

  if (lang.startsWith("zh") || timezone.includes("Shanghai") || timezone.includes("Hong_Kong") || timezone.includes("Taipei")) {
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

  // On mount, if no cookie and no cache, fetch from API in background
  useEffect(() => {
    const cookieRegion = getCookie("region")
    if (cookieRegion) return // Middleware already detected

    const cached = getCachedRegion()
    if (cached) return // Already have a valid cached value

    fetch("/api/region", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.region === "domestic" || data.region === "overseas") {
          setRegion(data.region)
          cacheRegion(data.region)
        }
      })
      .catch(() => {
        // API unreachable — keep browser heuristic result
      })
  }, [])

  const switchRegion = (newRegion: Region) => {
    cacheRegion(newRegion)
    setRegion(newRegion)
  }

  return { region, switchRegion, isLoaded }
}
