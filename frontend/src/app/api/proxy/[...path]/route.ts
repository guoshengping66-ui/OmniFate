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
 * connection (localhost → localhost:8002) is不受 CORS restrictions.
 *
 * PROXY CORRUPTION: Some client-side proxies (Clash/V2Ray) performing
 * HTTPS MITM intercept and corrupt POST request bodies. To survive this,
 * the client sends data in BOTH the body AND a ?_data= URL parameter.
 * The proxy route tries URL param first (with error handling), then
 * falls back to the body. If both fail, it returns a clear error.
 *
 * CHINA MAINLAND: The proxy connects to the local backend (localhost:8002),
 * bypassing Cloudflare entirely. This ensures reliable connectivity from
 * mainland China where external API calls may be blocked or slow.
 */

// In production, proxy to the local backend (same server, no Cloudflare hop).
// The backend listens on localhost:8002 — nginx exposes it externally via port 443.
// Using localhost avoids an unnecessary round-trip through Cloudflare for
// server-to-server communication, improving speed and reliability.
const BACKEND = process.env.BACKEND_URL || "http://localhost:8002"
const TIMEOUT_MS = 30_000  // 30s for regular requests (POST/GET with expected fast response)
const ANALYSIS_TIMEOUT_MS = 120_000  // 2 min for LLM-heavy endpoints (analyze-event, readings)
const SSE_TIMEOUT_MS = 600_000  // 10 min for SSE streams (analysis can take 5-8 min with two-call approach)

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

  // ── SECURITY: Block sensitive admin/cron/webhook endpoints from proxy ──
  const BLOCKED_PATHS = [
    "/api/cron/",
    "/api/webhooks/",          // Webhooks must hit backend directly
    "/api/credits/grant",      // Admin-only
    "/api/credits/monthly-grant",
    "/api/credits/admin/",
  ]
  if (BLOCKED_PATHS.some(p => targetPath.startsWith(p))) {
    return new Response(
      JSON.stringify({ detail: "This endpoint is not accessible via proxy" }),
      { status: 403, headers: { "Content-Type": "application/json; charset=utf-8" } },
    )
  }

  const url = new URL(request.url)

  // ── Detect multipart (file upload) requests ──────────────────────────────
  const contentType = request.headers.get("content-type") || ""
  const isMultipart = contentType.includes("multipart/form-data")

  // ── Dual data extraction: URL param + body fallback ──────────────────────
  // The client sends data in BOTH places to survive proxy corruption.
  // Try URL param first (more resilient), fall back to body.
  // NOTE: Skip dual-encoding for multipart (file uploads) — it must pass through intact.
  let dataParam: string | null = null
  if (!isMultipart) {
    try {
      dataParam = url.searchParams.get("_data")
      if (dataParam) {
        url.searchParams.delete("_data")
      }
    } catch {
      // URL parsing failed — continue without dataParam
    }
  }

  const cleanSearch = url.search
  const targetUrl = `${BACKEND}${targetPath}${cleanSearch}`

  // Forward headers — exclude hop-by-hop and proxy-specific headers.
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

  // Read body — handle multipart (binary) vs JSON differently
  let body: string | ArrayBuffer | undefined
  if (request.method !== "GET" && request.method !== "HEAD") {
    if (isMultipart) {
      // ⚠️ CRITICAL: Use arrayBuffer() for multipart to preserve binary file data.
      // text() corrupts binary by interpreting bytes as UTF-8.
      const ab = await request.arrayBuffer()
      body = ab
    } else if (dataParam) {
      // Data from URL param — decode and use as JSON body
      try {
        body = decodeURIComponent(dataParam)
        headers.set("Content-Type", "application/json")
      } catch {
        // URL param decoding failed — fall through to body
        dataParam = null
        body = undefined
      }
    }
    if (!dataParam && body === undefined) {
      // Fall back to reading the request body directly
      const raw = await request.text()
      if (raw) {
        body = raw
        // Ensure Content-Type is set for the backend
        if (!headers.get("content-type")) {
          headers.set("Content-Type", "application/json")
        }
      }
    }
  }

  // AbortController with timeout to prevent hanging.
  // SSE streaming endpoints (/stream) get a longer timeout since analysis
  // can take 2-3 minutes and heartbeats keep the connection alive.
  // LLM-heavy endpoints (analyze-event, readings) get 2 min timeout.
  const isStream = targetPath.includes("/stream")
  const isAnalysis = targetPath.includes("/analyze-event") || targetPath.includes("/readings/stream")
  const controller = new AbortController()
  const timeoutMs = isStream ? SSE_TIMEOUT_MS : (isAnalysis ? ANALYSIS_TIMEOUT_MS : TIMEOUT_MS)
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const resp = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      signal: controller.signal,
      cache: "no-store",
    })

    // Build response headers — strip headers that the runtime handles
    // (decompression, chunked transfer) and CORS headers from the backend
    // (unnecessary for same-origin proxy responses).
    const respHeaders = new Headers()
    const skipHeaders = new Set([
      "transfer-encoding",
      "connection",
      "content-encoding",   // Runtime auto-decompresses; forwarding gzip header breaks browser
      "content-length",     // Length changes after decompression
      "access-control-allow-origin",      // Backend CORS — not needed for same-origin proxy
      "access-control-allow-methods",
      "access-control-allow-headers",
      "access-control-allow-credentials",
      "access-control-max-age",
      "vary",                // Backend Vary: Origin — not needed for same-origin proxy
    ])
    resp.headers.forEach((value, key) => {
      if (!skipHeaders.has(key.toLowerCase())) {
        respHeaders.set(key, value)
      }
    })

    // Ensure charset=utf-8 for JSON responses — Chinese mobile browsers
    // default to GBK when charset is missing, causing garbled text (乱码)
    const ct = respHeaders.get("content-type") || ""
    if (ct.includes("application/json") && !ct.includes("charset")) {
      respHeaders.set("Content-Type", "application/json; charset=utf-8")
    }

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: respHeaders,
    })
  } catch (err: any) {
    const msg = err?.name === "AbortError"
      ? `Backend timeout (${Math.round(timeoutMs / 1000)}s) — analysis is running, please check back in a moment`
      : `Proxy error: ${err?.message || "unknown"}`
    console.error(`[Proxy] ${targetPath} failed:`, err?.name || err?.message)
    return new Response(
      JSON.stringify({ detail: msg }),
      { status: 502, headers: { "Content-Type": "application/json; charset=utf-8" } },
    )
  } finally {
    clearTimeout(timer)
  }
}
