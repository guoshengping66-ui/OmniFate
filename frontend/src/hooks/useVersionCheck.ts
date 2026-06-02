"use client"

import { useEffect } from "react"

const CHECK_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const VERSION_KEY = "destiny_build_id"

/**
 * Proactive build version check.
 *
 * On mount, reads the build ID embedded in the DOM by Next.js (__NEXT_DATA__
 * or the script tag). Then every CHECK_INTERVAL_MS it fetches /api/version and
 * compares.  If the server reports a different build, the page is reloaded
 * *before* any lazy-loaded chunks fail with 404.
 *
 * This is the "preventive" counterpart to the chunk-load-recovery utility
 * which handles errors *after* they occur.
 */
export function useVersionCheck() {
  useEffect(() => {
    // Read the build ID that was baked into the page at render time
    const embeddedBuildId = getEmbeddedBuildId()
    if (!embeddedBuildId) return

    // Store it for the first time
    try {
      sessionStorage.setItem(VERSION_KEY, embeddedBuildId)
    } catch {}

    let timer: ReturnType<typeof setInterval> | null = null

    async function checkVersion() {
      try {
        const res = await fetch("/api/version", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        })
        if (!res.ok) return
        const { buildId: serverBuildId } = await res.json()
        if (serverBuildId && serverBuildId !== embeddedBuildId) {
          console.warn(
            `[VersionCheck] Build mismatch: embedded=${embeddedBuildId} server=${serverBuildId}. Reloading...`,
          )
          // Clear interval to prevent re-checking during reload
          if (timer) clearInterval(timer)
          window.location.reload()
        }
      } catch {
        // Network error — skip, will retry next interval
      }
    }

    // Check after a short delay (don't block initial render)
    const initialTimer = setTimeout(checkVersion, 10_000)
    // Then periodically
    timer = setInterval(checkVersion, CHECK_INTERVAL_MS)

    return () => {
      clearTimeout(initialTimer)
      if (timer) clearInterval(timer)
    }
  }, [])
}

/**
 * Extract the Next.js build ID from the page's __NEXT_DATA__ script or
 * the `next/script` injection.
 */
function getEmbeddedBuildId(): string | null {
  try {
    // Method 1: __NEXT_DATA__ (standard Next.js hydration data)
    const nextData = (window as Record<string, unknown>).__NEXT_DATA__
    if (nextData && typeof nextData === "object") {
      const buildId = (nextData as { buildId?: string }).buildId
      if (buildId) return buildId
    }
  } catch {}

  try {
    // Method 2: Look for the build ID in the next/static script paths
    const scripts = document.querySelectorAll('script[src*="/_next/static/"]')
    for (const script of scripts) {
      const src = script.getAttribute("src") || ""
      // Pattern: /_next/static/{buildId}/...
      const match = src.match(/\/_next\/static\/([^/]+)\//)
      if (match) return match[1]
    }
  } catch {}

  return null
}
