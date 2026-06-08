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
    //   1. Middleware-set cookie (from CF-IPCountry — most reliable, server-side)
    //   2. Browser timezone detection (fallback when no cookie)
    //   3. Browser language (weak fallback)
    //
    // IMPORTANT: We do NOT override the server's IP-based detection with timezone.
    // The server (Cloudflare CF-IPCountry) is the authoritative source for region.
    // Timezone is only used as a fallback when no cookie exists.

    // 1. Read middleware-set cookie (set by server via CF-IPCountry)
    const cookieRegion = getCookie("region") as Region | null
    const hasCookie = cookieRegion === "domestic" || cookieRegion === "overseas"

    if (hasCookie) {
      // Cookie exists from middleware — trust it (authoritative)
      setRegion(cookieRegion)
      setDetectionSource("middleware")
      setLocalStorage("alpha_mirror_region", JSON.stringify({ region: cookieRegion, ts: Date.now() }))
    } else {
      // No cookie — use timezone as fallback
      const tzRegion = detectFromTimezone()
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
