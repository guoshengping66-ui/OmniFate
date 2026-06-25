"use client"

import { useEffect } from "react"
import { useChunkLoadRecovery } from "@/lib/chunk-load-recovery"

/**
 * Global error boundary.
 * Avoids context-dependent hooks (useLanguage, useAuth, etc.)
 * so the boundary never crashes when the page tree is unstable.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { autoReloading } = useChunkLoadRecovery(error)

  useEffect(() => {
    console.error("[GlobalError]", error)
  }, [error])

  if (autoReloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink px-4">
        <div className="max-w-md w-full card-glass p-8 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <h2 className="font-serif text-xl text-gold mb-3">Loading...</h2>
          <p className="text-white/50 text-sm mb-2">
            Page resources updated, auto-refreshing...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="max-w-md w-full card-glass p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-serif text-xl text-gold mb-3">Something went wrong</h2>
        <p className="text-white/50 text-sm mb-2">
          The page encountered an error. Please try again.
        </p>
        {/* Error details are NOT shown in any environment to prevent info leakage.
            Debug via server-side logs or the error digest in monitoring tools. */}
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-gold text-sm px-6 py-2">
            Try again
          </button>
          <button
            onClick={() => {
              const url = new URL(window.location.href)
              url.searchParams.set("_cb", Date.now().toString())
              window.location.href = url.toString()
            }}
            className="px-6 py-2 rounded-full border border-white/20 text-white/60 hover:text-white/80 hover:border-white/40 text-sm transition-all"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  )
}
