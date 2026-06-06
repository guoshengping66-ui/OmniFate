import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * Lightweight endpoint that returns the current Next.js build ID.
 * Used by the client-side version-check hook to detect stale cached HTML
 * after a deployment.  Response is tiny (~40 bytes) and no-cache.
 */
export async function GET() {
  let buildId: string | undefined

  // In standalone mode, process.cwd() = .next/standalone/frontend/
  // BUILD_ID is at .next/BUILD_ID relative to the project root.
  // Try multiple paths to cover both standalone and dev modes.
  const cwd = process.cwd()
  const possiblePaths = [
    join(cwd, ".next", "BUILD_ID"),           // dev mode: cwd = frontend/
    join(cwd, "..", ".next", "BUILD_ID"),     // standalone: cwd = .next/standalone/frontend/ → ../../
    join(cwd, "..", "..", ".next", "BUILD_ID"), // deep standalone: cwd = .next/standalone/frontend/.next/...
  ]

  for (const p of possiblePaths) {
    try {
      buildId = readFileSync(p, "utf-8").trim()
      if (buildId) break
    } catch {}
  }

  // Fallback: dynamic import
  if (!buildId) {
    try {
      const mod = await import("next/dist/shared/lib/constants")
      buildId = (mod as any).BUILD_ID
    } catch {}
  }

  return NextResponse.json(
    { buildId: buildId || "unknown" },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Surrogate-Control": "no-store",
        "CDN-Cache-Control": "no-store",
      },
    },
  )
}
