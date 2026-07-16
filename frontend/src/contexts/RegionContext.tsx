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
  region: "overseas",
  switchRegion: () => {},
  isLoaded: true,
  detectionSource: "middleware",
})

export function RegionProvider({ children }: { children: ReactNode; initialRegion?: Region }) {
  const [isLoaded, setIsLoaded] = useState(true)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const switchRegion = () => {
    // Unified global pricing — region switching disabled
  }

  const value = useMemo(
    () => ({ region: "overseas" as Region, switchRegion, isLoaded, detectionSource: "middleware" as const }),
    [isLoaded],
  )

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  )
}

export function useRegion(): RegionContextValue {
  return useContext(RegionContext)
}
