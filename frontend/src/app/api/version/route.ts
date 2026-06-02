import { NextResponse } from "next/server"

/**
 * Lightweight endpoint that returns the current Next.js build ID.
 * Used by the client-side version-check hook to detect stale cached HTML
 * after a deployment.  Response is tiny (~40 bytes) and cachable for a
 * short window.
 */
export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { BUILD_ID } = await import("next/dist/shared/lib/constants")
  return NextResponse.json(
    { buildId: BUILD_ID },
    {
      headers: {
        // Short cache — we want this to be fairly fresh
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    },
  )
}
