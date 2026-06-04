"use client"

import { useEffect } from "react"

const STORAGE_KEY = "destiny_chunk_reload_attempted"

/**
 * Global chunk-load error recovery.
 *
 * After deployment, cached HTML references old chunk filenames that no longer
 * exist (404 → ChunkLoadError).  The page-level error.tsx handles errors
 * inside React error boundaries, but chunk failures can also surface as
 * unhandled promise rejections or window.onerror events — especially when
 * React.lazy() fails outside a boundary.  This component catches those
 * and auto-reloads once.
 */
export function ChunkRecovery() {
  useEffect(() => {
    const alreadyRetried = () => {
      try {
        return sessionStorage.getItem(STORAGE_KEY) === "1"
      } catch {
        return false
      }
    }

    const markRetried = () => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1")
      } catch {}
    }

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
      if (alreadyRetried()) return

      console.warn("[ChunkRecovery] Detected chunk load error via unhandled rejection — reloading")
      markRetried()
      window.location.reload()
    }

    // window.onerror receives string messages, not Error objects for async errors
    const handleWindowError = (
      _message: string | Event,
      _source?: string,
      _lineno?: number,
      _colno?: number,
      error?: Error
    ) => {
      const msg = error?.message || ""
      if (!msg || !isChunkError(msg)) return
      if (alreadyRetried()) return

      console.warn("[ChunkRecovery] Detected chunk load error via window.onerror — reloading")
      markRetried()
      window.location.reload()
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
