/**
 * ChunkLoadError recovery utility.
 *
 * After a deployment, users with cached HTML try to load old JS chunk filenames
 * that no longer exist on the server (404 → ChunkLoadError).  This module
 * detects that condition and auto-reloads the page once, showing a brief
 * "refreshing…" UI while doing so.
 *
 * Usage in any error.tsx:
 *
 *   import { useChunkLoadRecovery } from "@/lib/chunk-load-recovery"
 *
 *   export default function MyError({ error, reset }) {
 *     const { autoReloading } = useChunkLoadRecovery(error)
 *     if (autoReloading) return <RefreshingUI />
 *     return <ErrorUI onRetry={reset} />
 *   }
 */

import { useEffect, useRef, useState } from "react"

const STORAGE_KEY = "profile_chunk_reload_attempted"

function isChunkLoadError(error: Error): boolean {
  const msg = (error.message || "").toLowerCase()
  const digest = ((error as Error & { digest?: string }).digest || "").toLowerCase()
  return (
    msg.includes("chunk") ||
    msg.includes("loading chunk") ||
    msg.includes("loading css chunk") ||
    digest.includes("chunk")
  )
}

function hasAlreadyRetried(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

function markRetried() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1")
  } catch {}
}

export function useChunkLoadRecovery(error: Error | null): { autoReloading: boolean } {
  const [autoReloading, setAutoReloading] = useState(false)
  const hasRetried = useRef(false)

  useEffect(() => {
    if (!error) return
    if (!isChunkLoadError(error)) return
    if (hasRetried.current || hasAlreadyRetried()) return

    hasRetried.current = true
    markRetried()
    setAutoReloading(true)
    console.warn("[ChunkLoadRecovery] Stale chunk detected — auto-reloading in 500ms")
    const timer = setTimeout(() => {
      const url = new URL(window.location.href)
      url.searchParams.set("_cb", Date.now().toString())
      window.location.href = url.toString()
    }, 500)
    return () => clearTimeout(timer)
  }, [error])

  return { autoReloading }
}
