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

// ── Browser-based region detection (fallback only) ──

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

function setLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

// ── Provider ──

export function RegionProvider({ children, initialRegion }: { children: ReactNode; initialRegion?: Region }) {
  const [region, setRegion] = useState<Region>(initialRegion ?? "domestic")
  const [isLoaded, setIsLoaded] = useState(false)
  const [detectionSource, setDetectionSource] = useState<RegionContextValue["detectionSource"]>("cookie")

  useEffect(() => {
    // Detection priority:
    //   1. Middleware-set cookie (from CF-IPCountry — most reliable, server-side)
    //   2. API verification (ip-api.com — confirms IP-based region)
    //   3. Browser timezone (weak fallback)
    //
    // IMPORTANT: The region cookie is httpOnly, so JavaScript CANNOT read it.
    // We use the initialRegion from the server layout as the starting point,
    // then verify via the /api/region endpoint which checks the IP server-side.
    // This is the only reliable way to detect region on the client.

    // 1. Start with server-provided initialRegion (from cookie read in layout)
    // This is already correct for the initial render

    // 2. Verify via API (ip-api.com from server side — accurate, independent of cookie)
    fetch("/api/region", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data.region === "domestic" || data.region === "overseas") {
          setRegion(data.region)
          setDetectionSource("api")
          setLocalStorage("alpha_mirror_region", JSON.stringify({ region: data.region, ts: Date.now() }))
        }
        setIsLoaded(true)
      })
      .catch(() => {
        // API failed — fall back to timezone detection
        const tzRegion = detectFromTimezone()
        setRegion(tzRegion)
        setDetectionSource("timezone")
        setLocalStorage("alpha_mirror_region", JSON.stringify({ region: tzRegion, ts: Date.now() }))
        setIsLoaded(true)
      })
  }, [])

  const setRegionCookie = (region: Region) => {
    document.cookie = `region=${region};path=/;max-age=31536000;SameSite=Lax`
  }

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
