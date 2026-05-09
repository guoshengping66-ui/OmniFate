/**
 * Next.js API Proxy — routes all /api/proxy/* requests to the backend.
 *
 * WHY: The server's nginx (1.14.1) rejects certain POST request bodies
 * before FastAPI's CORS middleware can add Access-Control-Allow-Origin
 * headers. This causes the browser to report a "CORS error" on every
 * POST request (readings, chat, payments, etc.).
 *
 * SOLUTION: By proxying through Next.js Server-side, the browser sees
 * same-origin requests (no CORS needed), and the server-to-server
 * connection (Vercel → api.khanfate.com) is不受 CORS restrictions.
 */

const BACKEND = "https://api.khanfate.com"
const TIMEOUT_MS = 60_000 // 60 seconds — generous for analysis POST

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params)
}
export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params)
}
export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params)
}
export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params)
}
export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params)
}
export async function OPTIONS(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params)
}

async function proxy(request: Request, params: Promise<{ path: string[] }>) {
  const { path } = await params
  const targetPath = "/" + path.join("/")
  const url = new URL(request.url)
  const targetUrl = `${BACKEND}${targetPath}${url.search}`

  // Forward headers — exclude hop-by-hop and proxy-specific headers.
  // Do NOT forward Content-Length (fetch will compute it from the body).
  const headers = new Headers()
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (
      lower === "host" ||
      lower === "origin" ||
      lower === "referer" ||
      lower === "content-length" ||
      lower === "connection"
    ) {
      return
    }
    headers.set(key, value)
  })

  // Read body as text for correct UTF-8 handling (avoids ArrayBuffer
  // encoding issues with Chinese characters that cause backend 400/500).
  let body: string | undefined
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text()
  }

  // AbortController with timeout to prevent hanging
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const resp = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      signal: controller.signal,
    })

    // Build response headers (skip hop-by-hop)
    const respHeaders = new Headers()
    resp.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      if (lower !== "transfer-encoding" && lower !== "connection") {
        respHeaders.set(key, value)
      }
    })

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: respHeaders,
    })
  } catch (err: any) {
    const msg = err?.name === "AbortError"
      ? "Backend timeout — analysis is running, please check back in a moment"
      : `Proxy error: ${err.message}`
    return new Response(
      JSON.stringify({ detail: msg }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    )
  } finally {
    clearTimeout(timer)
  }
}
