"use client"
import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"

export type Region = "domestic" | "overseas"

interface RegionContextValue {
  region: Region
  switchRegion: (r: Region) => void
  isLoaded: boolean
  /** Whether the current region was detected server-side (middleware) or client-side */
  detectionSource: "cookie" | "timezone" | "language" | "middleware" | "api"
}

const RegionContext = createContext<RegionContextValue>({
  region: "domestic",
  switchRegion: () => {},
  isLoaded: false,
  detectionSource: "cookie",
})

// ── Browser-based region detection (fallback when no API available) ──

const DOMESTIC_TIMEZONES = [
  "Asia/Shanghai",
  "Asia/Chongqing",
  "Asia/Harbin",
  "Asia/Urumqi",
  "Asia/Hong_Kong",
  "Asia/Macau",
  "Asia/Taipei",
]

function detectFromTimezone(): Region {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""
    if (DOMESTIC_TIMEZONES.some(tzName => tz === tzName || tz.startsWith(tzName + "/"))) {
      return "domestic"
    }
  } catch {}
  return "overseas"
}

function detectFromLanguage(): Region {
  try {
    const lang = navigator.language || ""
    if (lang.startsWith("zh")) return "domestic"
  } catch {}
  return "overseas"
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function getLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function setLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

function setRegionCookie(region: Region) {
  document.cookie = `region=${region}; max-age=2592000; path=/; SameSite=lax`
}

// ── Provider ──

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<Region>("domestic")
  const [isLoaded, setIsLoaded] = useState(false)
  const [detectionSource, setDetectionSource] = useState<RegionContextValue["detectionSource"]>("cookie")

  useEffect(() => {
    // Priority order for region detection:
    //   1. "region" cookie (set by middleware via CF-IPCountry)
    //   2. Call /api/region for accurate detection via ip-api.com
    //   3. Browser timezone (fallback)
    //   4. Browser language (weak fallback)

    // 1. Check middleware-set cookie first (fast, no API call)
    const cookieRegion = getCookie("region") as Region | null
    if (cookieRegion === "domestic" || cookieRegion === "overseas") {
      setRegion(cookieRegion)
      setDetectionSource("middleware")
      setLocalStorage("alpha_mirror_region", JSON.stringify({ region: cookieRegion, ts: Date.now() }))

      // 2. Verify with /api/region for accuracy (CF-IPCountry can be wrong)
      //    Override cookie if API returns different result
      fetch("/api/region", { cache: "no-store" })
        .then(r => r.json())
        .then(data => {
          if (data.region && data.region !== cookieRegion) {
            // API detected different region — override
            setRegion(data.region)
            setDetectionSource("api")
            setLocalStorage("alpha_mirror_region", JSON.stringify({ region: data.region, ts: Date.now() }))
            setRegionCookie(data.region)
          }
        })
        .catch(() => {
          // API failed — keep middleware value
        })

      setIsLoaded(true)
      return
    }

    // 3. No cookie — call /api/region for accurate detection
    fetch("/api/region", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        const apiRegion = (data.region === "domestic" || data.region === "overseas") ? data.region : "overseas"
        setRegion(apiRegion)
        setDetectionSource("api")
        setLocalStorage("alpha_mirror_region", JSON.stringify({ region: apiRegion, ts: Date.now() }))
        setRegionCookie(apiRegion)
        setIsLoaded(true)
      })
      .catch(() => {
        // API failed — fallback to timezone
        const tzRegion = detectFromTimezone()
        setRegion(tzRegion)
        setDetectionSource("timezone")
        setLocalStorage("alpha_mirror_region", JSON.stringify({ region: tzRegion, ts: Date.now() }))
        setRegionCookie(tzRegion)

        // Language fallback
        if (tzRegion === "overseas") {
          const langRegion = detectFromLanguage()
          if (langRegion === "domestic") {
            setRegion("domestic")
            setDetectionSource("language")
            setLocalStorage("alpha_mirror_region", JSON.stringify({ region: "domestic", ts: Date.now() }))
            setRegionCookie("domestic")
          }
        }
        setIsLoaded(true)
      })
  }, [])

  const switchRegion = (newRegion: Region) => {
    setRegion(newRegion)
    setLocalStorage("alpha_mirror_region", JSON.stringify({ region: newRegion, ts: Date.now() }))
    setRegionCookie(newRegion)
  }

  const value = useMemo(
    () => ({ region, switchRegion, isLoaded, detectionSource }),
    [region, isLoaded, detectionSource],
  )

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  )
}

// ── Hook ──

export function useRegion(): RegionContextValue {
  return useContext(RegionContext)
}
