"use client"

import { useEffect } from "react"

const STORAGE_KEY_PREFIX = "profile_chunk_reload_attempted:"

/**
 * Reload once for each distinct missing chunk. A deployment changes hashes,
 * so retries must not be shared permanently between different releases.
 */
export function ChunkRecovery() {
  useEffect(() => {
    const retryKey = (message: string) => `${STORAGE_KEY_PREFIX}${message.slice(0, 160)}`

    const hasRetried = (message: string) => {
      try {
        return sessionStorage.getItem(retryKey(message)) === "1"
      } catch {
        return false
      }
    }

    const markRetried = (message: string) => {
      try {
        sessionStorage.removeItem("profile_chunk_reload_attempted")
        sessionStorage.setItem(retryKey(message), "1")
      } catch {}
    }

    const isChunkError = (message: string) => {
      const lower = message.toLowerCase()
      return (
        lower.includes("chunk") ||
        lower.includes("failed to fetch dynamically imported module") ||
        lower.includes("importing a module script failed")
      )
    }

    const reload = (message: string) => {
      if (!isChunkError(message) || hasRetried(message)) return

      markRetried(message)
      const url = new URL(window.location.href)
      url.searchParams.set("_cb", Date.now().toString())
      window.location.replace(url.toString())
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      reload(reason?.message || (typeof reason === "string" ? reason : ""))
    }

    const handleWindowError = (
      _message: string | Event,
      _source?: string,
      _lineno?: number,
      _colno?: number,
      error?: Error
    ) => reload(error?.message || "")

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    window.addEventListener("error", handleWindowError)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("error", handleWindowError)
    }
  }, [])

  return null
}
