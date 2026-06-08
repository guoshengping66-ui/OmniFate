"use client"
import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"

export type Region = "domestic" | "overseas"

interface RegionContextValue {
  region: Region
  switchRegion: (r: Region) => void
  isLoaded: boolean
  detectionSource: "cookie" | "timezone" | "language" | "middleware" | "api" | "tz_override"
}

const RegionContext = createContext<RegionContextValue>({
  region: "domestic",
  switchRegion: () => {},
  isLoaded: false,
  detectionSource: "cookie",
})

// ── Browser-based region detection ──

const DOMESTIC_TIMEZONES = [
  "Asia/Shanghai",
  "Asia/Chongqing",
  "Asia/Harbin",
  "Asia/Urumqi",
  "Asia/Hong_Kong",
  "Asia/Macau",
  "Asia/Taipei",
  // UTC+8 generic timezone formats (POSIX convention uses inverted signs)
  "Etc/GMT-8", // UTC+8 (POSIX: negative = east of UTC)
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
    // Detection priority:
    //   1. Middleware-set cookie (from CF-IPCountry — quick but can be wrong with VPN/proxy)
    //   2. Browser timezone detection (reliable, can't be spoofed easily)
    //   3. Browser language (weak fallback)
    //
    // If server detected "domestic" but browser timezone says "overseas",
    // we override with timezone (handles VPN/proxy scenarios).

    // 1. Read middleware-set cookie
    const cookieRegion = getCookie("region") as Region | null
    const hasCookie = cookieRegion === "domestic" || cookieRegion === "overseas"

    // 2. Browser timezone detection (always runs for accuracy check)
    const tzRegion = detectFromTimezone()

    // 3. Determine final region
    if (hasCookie) {
      // Cookie exists from middleware
      if (cookieRegion !== tzRegion) {
        // Mismatch: server and browser disagree
        // Trust browser timezone (handles VPN/proxy where server sees wrong IP)
        setRegion(tzRegion)
        setDetectionSource("tz_override")
        setLocalStorage("alpha_mirror_region", JSON.stringify({ region: tzRegion, ts: Date.now() }))
        setRegionCookie(tzRegion)
      } else {
        // Agreement: both say the same region
        setRegion(cookieRegion)
        setDetectionSource("middleware")
        setLocalStorage("alpha_mirror_region", JSON.stringify({ region: cookieRegion, ts: Date.now() }))
      }
    } else {
      // No cookie — use timezone
      setRegion(tzRegion)
      setDetectionSource("timezone")
      setLocalStorage("alpha_mirror_region", JSON.stringify({ region: tzRegion, ts: Date.now() }))
      setRegionCookie(tzRegion)

      // Language fallback (only if timezone says overseas)
      if (tzRegion === "overseas") {
        const langRegion = detectFromLanguage()
        if (langRegion === "domestic") {
          setRegion("domestic")
          setDetectionSource("language")
          setLocalStorage("alpha_mirror_region", JSON.stringify({ region: "domestic", ts: Date.now() }))
          setRegionCookie("domestic")
        }
      }
    }

    setIsLoaded(true)
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
