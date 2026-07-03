"use client"

import { useEffect } from "react"
import { useChunkLoadRecovery } from "@/lib/chunk-load-recovery"

/**
 * Pricing error boundary.
 * Avoids context-dependent hooks so the boundary never crashes
 * when the main page tree is in an unstable state.
 */
export default function PricingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { autoReloading } = useChunkLoadRecovery(error)

  useEffect(() => {
    console.error("[PricingError]", error)
  }, [error])

  if (autoReloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmos-950 px-4">
        <div className="max-w-md w-full card-solid p-8 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <h2 className="font-serif text-xl text-gold mb-3">Loading...</h2>
          <p className="text-parchment-400 text-sm mb-2">
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
        <p className="text-parchment-400 text-sm mb-2">The pricing page encountered an error.</p>
        {/* Error details hidden in all environments to prevent info leakage */}
        <button onClick={reset} className="btn-primary text-sm px-6 py-2">
          Try again
        </button>
      </div>
    </div>
  )
}
