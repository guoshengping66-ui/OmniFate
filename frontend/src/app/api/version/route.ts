import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * Lightweight endpoint that returns the current Next.js build ID.
 * Used by the client-side version-check hook to detect stale cached HTML
 * after a deployment.  Response is tiny (~40 bytes) and cachable for a
 * short window.
 */
export async function GET() {
  let buildId: string | undefined

  // Strategy 1: Read from .next/BUILD_ID file (works in standalone mode)
  try {
    buildId = readFileSync(join(process.cwd(), ".next", "BUILD_ID"), "utf-8").trim()
  } catch {}

  // Strategy 2: Dynamic import (may fail in standalone)
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
        // No-cache: always return fresh build ID
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  )
}
