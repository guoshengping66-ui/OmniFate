"use client"
import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"

export type Region = "domestic" | "overseas"

interface RegionContextValue {
  region: Region
  switchRegion: (r: Region) => void
  isLoaded: boolean
  detectionSource: "cookie" | "timezone" | "language" | "middleware" | "api"
}

const RegionContext = createContext<RegionContextValue>({
  region: "domestic",
  switchRegion: () => {},
  isLoaded: false,
  detectionSource: "middleware",
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

// No-op: region cookie is set securely by middleware (httpOnly, secure, SameSite=lax).
// Client-side cookie setting is intentionally omitted to avoid overwriting the server cookie.
// eslint-disable-next-line @typescript-eslint/no-empty-function
function setRegionCookie(_region: Region) {}

// ── Provider ──

export function RegionProvider({ children, initialRegion }: { children: ReactNode; initialRegion?: Region }) {
  const [region, setRegion] = useState<Region>(initialRegion ?? "domestic")
  const [isLoaded, setIsLoaded] = useState(false)
  const [detectionSource, setDetectionSource] = useState<RegionContextValue["detectionSource"]>("cookie")

  useEffect(() => {
    // Detection priority:
    //   1. Middleware-set cookie (from CF-IPCountry — most reliable, server-side)
    //   2. Browser language (strong signal — zh = domestic)
    //   3. Browser timezone (weak signal — Asia/* = domestic, but unreliable for VPN users)
    //
    // IMPORTANT: Language is checked BEFORE timezone because many overseas Chinese
    // users have Chinese timezone (from VPN or OS settings) which causes timezone
    // to incorrectly detect them as domestic. Language is a more reliable signal.

    // 1. Read middleware-set cookie (set by server via CF-IPCountry)
    const cookieRegion = getCookie("region") as Region | null
    const hasCookie = cookieRegion === "domestic" || cookieRegion === "overseas"

    if (hasCookie) {
      // Cookie exists from middleware — trust it (authoritative)
      setRegion(cookieRegion)
      setDetectionSource("middleware")
      setLocalStorage("alpha_mirror_region", JSON.stringify({ region: cookieRegion, ts: Date.now() }))
    } else {
      // No cookie — check language first (more reliable than timezone)
      const langRegion = detectFromLanguage()
      if (langRegion === "domestic") {
        // Chinese browser language → almost certainly domestic
        setRegion("domestic")
        setDetectionSource("language")
        setLocalStorage("alpha_mirror_region", JSON.stringify({ region: "domestic", ts: Date.now() }))
        setRegionCookie("domestic")
      } else {
        // Non-Chinese language → check timezone as secondary signal
        const tzRegion = detectFromTimezone()
        setRegion(tzRegion)
        setDetectionSource("timezone")
        setLocalStorage("alpha_mirror_region", JSON.stringify({ region: tzRegion, ts: Date.now() }))
        setRegionCookie(tzRegion)
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
