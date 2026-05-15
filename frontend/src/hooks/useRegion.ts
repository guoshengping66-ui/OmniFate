"use client"
import { useState, useEffect } from "react"

export type Region = "domestic" | "overseas"

const REGION_KEY = "alpha_mirror_region"

function detectRegion(): Region {
  if (typeof window === "undefined") return "domestic"

  // Check stored preference first
  const stored = localStorage.getItem(REGION_KEY)
  if (stored === "domestic" || stored === "overseas") return stored

  // Detect by browser locale
  const lang = navigator.language || ""
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""

  // Chinese locale or Chinese timezone → domestic
  if (lang.startsWith("zh") || timezone.includes("Shanghai") || timezone.includes("Hong_Kong") || timezone.includes("Taipei")) {
    return "domestic"
  }

  return "overseas"
}

export function useRegion() {
  const [region, setRegion] = useState<Region>("domestic")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setRegion(detectRegion())
    setIsLoaded(true)
  }, [])

  const switchRegion = (newRegion: Region) => {
    localStorage.setItem(REGION_KEY, newRegion)
    setRegion(newRegion)
  }

  return { region, switchRegion, isLoaded }
}
