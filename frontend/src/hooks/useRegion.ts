"use client"
import { useState } from "react"

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
  // Initialize directly from detectRegion() to avoid an extra render.
  // detectRegion() is safe on mount (reads localStorage + navigator).
  const [region, setRegion] = useState<Region>(detectRegion)
  const [isLoaded, setIsLoaded] = useState(true)

  const switchRegion = (newRegion: Region) => {
    localStorage.setItem(REGION_KEY, newRegion)
    setRegion(newRegion)
  }

  return { region, switchRegion, isLoaded }
}
