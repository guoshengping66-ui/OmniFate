import { NextResponse } from "next/server"

/**
 * Region detection API — unified global pricing, always overseas (USD).
 */

export async function GET() {
  return NextResponse.json(
    { region: "overseas", country: "GLOBAL", source: "unified" },
    { headers: { "Cache-Control": "no-store" } },
  )
}
