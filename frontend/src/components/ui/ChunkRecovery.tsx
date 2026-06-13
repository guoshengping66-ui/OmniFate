"use client"

import { useEffect } from "react"

const STORAGE_KEY = "profile_chunk_reload_attempted"

/**
 * Chunk-load error recovery.
 *
 * After deployment, cached HTML references old chunk filenames that no longer
 * exist (404 -> ChunkLoadError). This component catches those errors and
 * auto-reloads once with cache-busting.
 *
 * Version checking is handled by the pre-React inline script in layout.tsx
 * to avoid redundant/conflicting reload mechanisms.
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

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const msg =
        reason?.message || (typeof reason === "string" ? reason : "") || ""
      if (!isChunkError(msg)) return
      if (!canRetry()) return

      console.warn("[ChunkRecovery] Chunk load error detected — reloading with cache-bust")
      incrementAttempt()
      const url = new URL(window.location.href)
      url.searchParams.set("_cb", Date.now().toString())
      window.location.href = url.toString()
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
      const url = new URL(window.location.href)
      url.searchParams.set("_cb", Date.now().toString())
      window.location.href = url.toString()
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    window.addEventListener("error", handleWindowError)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("error", handleWindowError)
    }
  }, [])

  return null
}
