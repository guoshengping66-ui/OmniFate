/**
 * Backward-compat route: /api/fate/event-analyze → /api/readings/analyze-event
 *
 * Old frontend builds call /api/proxy/api/fate/event-analyze which maps
 * to backend /api/fate/event-analyze (404). This route intercepts and
 * forwards to the correct backend endpoint.
 *
 * Can be removed once all clients deploy the corrected api.ts path.
 */

const BACKEND = process.env.BACKEND_URL || "http://localhost:8002"

export async function POST(request: Request) {
  const url = new URL(request.url)
  const targetUrl = `${BACKEND}/api/readings/analyze-event${url.search}`

  const headers = new Headers()
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (["host", "origin", "referer", "content-length", "connection"].includes(lower)) return
    headers.set(key, value)
  })

  const body = await request.text()

  try {
    const resp = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    })
    const respBody = await resp.text()
    return new Response(respBody, {
      status: resp.status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    })
  } catch {
    return new Response(
      JSON.stringify({ detail: "Proxy error" }),
      { status: 502, headers: { "Content-Type": "application/json; charset=utf-8" } },
    )
  }
}
