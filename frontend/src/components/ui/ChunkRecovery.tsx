"use client"

import { useEffect } from "react"

const STORAGE_KEY = "destiny_chunk_reload_attempted"
const VERSION_KEY = "destiny_build_id"

/**
 * Multi-layer chunk-load error recovery.
 *
 * After deployment, cached HTML references old chunk filenames that no longer
 * exist (404 -> ChunkLoadError). This component handles three scenarios:
 *
 * 1. React.lazy() chunk failures (unhandledrejection / window.onerror)
 * 2. Build version mismatch (server has newer build than embedded HTML)
 * 3. Stale chunk probe failure (fetching a known chunk returns 404)
 *
 * All recovery paths use cache-busting reload (window.location.reload(true))
 * to bypass Cloudflare/browser cache on the first attempt, then fall back
 * to normal reload. Maximum 2 reload attempts per session.
 */
export function ChunkRecovery() {
  useEffect(() => {
    const getAttemptCount = (): number => {
      try {
        return parseInt(sessionStorage.getItem(STORAGE_KEY) || "0", 10)
      } catch {
        return 0
      }
    }

    const incrementAttempt = () => {
      try {
        sessionStorage.setItem(STORAGE_KEY, String(getAttemptCount() + 1))
      } catch {}
    }

    const canRetry = () => getAttemptCount() < 2

    const isChunkError = (msg: string) => {
      const lower = msg.toLowerCase()
      return (
        lower.includes("chunk") ||
        lower.includes("loading chunk") ||
        lower.includes("loading css chunk") ||
        lower.includes("failed to fetch dynamically imported module") ||
        lower.includes("importing a module script failed")
      )
    }

    // ── Layer 1: Catch chunk load failures ──────────────────────────
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const msg =
        reason?.message || (typeof reason === "string" ? reason : "") || ""
      if (!isChunkError(msg)) return
      if (!canRetry()) return

      console.warn("[ChunkRecovery] Chunk load error detected — reloading with cache-bust")
      incrementAttempt()
      // First attempt: hard reload (bypass cache). Second: normal reload.
      window.location.reload(getAttemptCount() <= 1)
    }

    const handleWindowError = (
      _message: string | Event,
      _source?: string,
      _lineno?: number,
      _colno?: number,
      error?: Error
    ) => {
      const msg = error?.message || ""
      if (!msg || !isChunkError(msg)) return
      if (!canRetry()) return

      console.warn("[ChunkRecovery] Chunk load error via onerror — reloading with cache-bust")
      incrementAttempt()
      window.location.reload(getAttemptCount() <= 1)
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    window.addEventListener("error", handleWindowError)

    // ── Layer 2: Version check on mount ─────────────────────────────
    const checkVersion = async () => {
      try {
        const res = await fetch("/api/version", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        })
        if (!res.ok) return
        const { buildId: serverBuildId } = await res.json()

        // Read embedded build ID from the page
        let embeddedBuildId: string | null = null
        try {
          const nextData = (window as Record<string, unknown>).__NEXT_DATA__
          if (nextData && typeof nextData === "object") {
            embeddedBuildId = (nextData as { buildId?: string }).buildId || null
          }
        } catch {}

        if (!embeddedBuildId) {
          // Extract from script tags
          const scripts = document.querySelectorAll('script[src*="/_next/static/"]')
          for (const script of scripts) {
            const src = script.getAttribute("src") || ""
            const match = src.match(/\/_next\/static\/([^/]+)\//)
            if (match) {
              embeddedBuildId = match[1]
              break
            }
          }
        }

        if (serverBuildId && embeddedBuildId && serverBuildId !== embeddedBuildId) {
          console.warn(
            `[ChunkRecovery] Build mismatch: embedded=${embeddedBuildId} server=${serverBuildId}. Reloaded with cache-bust.`
          )
          // Store server build ID for future comparisons
          try {
            sessionStorage.setItem(VERSION_KEY, serverBuildId)
          } catch {}
          if (canRetry()) {
            incrementAttempt()
            window.location.reload(true)
          }
        }
      } catch {
        // Network error — skip, pre-React script handles this
      }
    }

    // Check version after a short delay (don't block initial render)
    const versionTimer = setTimeout(checkVersion, 3000)

    return () => {
      clearTimeout(versionTimer)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("error", handleWindowError)
    }
  }, [])

  return null
}
