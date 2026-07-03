"use client"

import { useEffect } from "react"
import { useChunkLoadRecovery } from "@/lib/chunk-load-recovery"

/**
 * Checkout error boundary.
 *
 * Deliberately avoids context-dependent hooks (useLanguage, useAuth, etc.)
 * so the boundary itself never crashes — even when the main page tree is
 * in an unstable state (e.g. during a re-render storm caused by 401 cascade
 * or stale chunks).
 */
export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { autoReloading } = useChunkLoadRecovery(error)

  useEffect(() => {
    console.error("[CheckoutError]", error)
  }, [error])

  if (autoReloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmos-950 px-4">
        <div className="max-w-md w-full card-solid p-8 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <h2 className="font-serif text-xl text-gold mb-3">Loading...</h2>
          <p className="text-parchment-400 text-sm">
            Page resources updated, auto-refreshing...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cosmos-950 px-4">
      <div className="max-w-md w-full card-solid p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-serif text-xl text-gold mb-3">Something went wrong</h2>
        <p className="text-parchment-400 text-sm mb-6">
          The checkout page encountered an error. Please try again.
        </p>
        {/* Error details hidden in all environments to prevent info leakage */}
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary text-sm px-6 py-2">
            Try again
          </button>
          <button
            onClick={() => {
              const url = new URL(window.location.href)
              url.searchParams.set("_cb", Date.now().toString())
              window.location.href = url.toString()
            }}
            className="px-6 py-2 rounded-full border border-white/20 text-parchment-400 hover:text-parchment-200 hover:border-white/40 text-sm transition-all"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  )
}
