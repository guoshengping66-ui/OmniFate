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
 * Multi-layer region detection:
 *   1. localStorage cache (instant, survives refresh)
 *   2. /api/region endpoint (Cloudflare CF-IPCountry header)
 *   3. Browser locale / timezone heuristic (fallback)
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
  // Start with cached value if available (synchronous, no flash)
  const [region, setRegion] = useState<Region>(() => {
    const cached = getCachedRegion()
    return cached || detectRegionFromBrowser()
  })
  const [isLoaded, setIsLoaded] = useState(true)

  // On mount, if no cache, fetch from API in background and update
  useEffect(() => {
    const cached = getCachedRegion()
    if (cached) return // Already have a valid cached value

    fetch("/api/region", {
      // Force no-cache so we always get a fresh detection
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
