"use client"
import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"

export type Region = "domestic" | "overseas"

interface RegionContextValue {
  region: Region
  switchRegion: (r: Region) => void
  isLoaded: boolean
  /** Whether the current region was detected server-side (middleware) or client-side */
  detectionSource: "cookie" | "timezone" | "language" | "middleware"
}

const RegionContext = createContext<RegionContextValue>({
  region: "domestic",
  switchRegion: () => {},
  isLoaded: false,
  detectionSource: "cookie",
})

// ── Browser-based region detection (fallback when no cookie is set) ──

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

// ── Provider ──

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<Region>("domestic")
  const [isLoaded, setIsLoaded] = useState(false)
  const [detectionSource, setDetectionSource] = useState<RegionContextValue["detectionSource"]>("cookie")

  useEffect(() => {
    // Priority order for region detection:
    //   1. "region" cookie (set by middleware on every request via CF-IPCountry / Accept-Language)
    //   2. localStorage cache (survives refresh, persists across tabs)
    //   3. Browser timezone (reliable for domestic/overseas split)
    //   4. Browser language (weak fallback)

    // 1. Check middleware-set cookie first
    const cookieRegion = getCookie("region") as Region | null
    if (cookieRegion === "domestic" || cookieRegion === "overseas") {
      setRegion(cookieRegion)
      setDetectionSource("middleware")
      setLocalStorage("alpha_mirror_region", JSON.stringify({ region: cookieRegion, ts: Date.now() }))
      setIsLoaded(true)
      return
    }

    // 2. Check localStorage cache (set by previous client-side detection)
    const cached = getLocalStorage("alpha_mirror_region")
    if (cached) {
      try {
        const { region: cachedRegion, ts } = JSON.parse(cached)
        if ((cachedRegion === "domestic" || cachedRegion === "overseas") && Date.now() - ts < 24 * 60 * 60 * 1000) {
          setRegion(cachedRegion)
          setDetectionSource("cookie")
          // Sync to cookie for next request
          document.cookie = `region=${cachedRegion}; max-age=2592000; path=/; SameSite=lax`
          setIsLoaded(true)
          return
        }
      } catch {}
    }

    // 3. Browser timezone detection
    const tzRegion = detectFromTimezone()
    setRegion(tzRegion)
    setDetectionSource("timezone")
    setLocalStorage("alpha_mirror_region", JSON.stringify({ region: tzRegion, ts: Date.now() }))
    document.cookie = `region=${tzRegion}; max-age=2592000; path=/; SameSite=lax`

    // 4. Language fallback (only if timezone didn't give a clear signal)
    // For now, timezone is reliable enough. Language is a weak fallback.
    if (tzRegion === "overseas") {
      const langRegion = detectFromLanguage()
      if (langRegion === "domestic") {
        setRegion("domestic")
        setDetectionSource("language")
        setLocalStorage("alpha_mirror_region", JSON.stringify({ region: "domestic", ts: Date.now() }))
        document.cookie = `region=domestic; max-age=2592000; path=/; SameSite=lax`
      }
    }

    setIsLoaded(true)
  }, [])

  const switchRegion = (newRegion: Region) => {
    setRegion(newRegion)
    setLocalStorage("alpha_mirror_region", JSON.stringify({ region: newRegion, ts: Date.now() }))
    document.cookie = `region=${newRegion}; max-age=2592000; path=/; SameSite=lax`
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
