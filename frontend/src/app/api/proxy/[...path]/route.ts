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
 * connection (localhost → localhost:8003) is not subject to CORS restrictions.
 *
 * PROXY CORRUPTION: Some client-side proxies (Clash/V2Ray) performing
 * HTTPS MITM intercept and corrupt POST request bodies. To survive this,
 * the client sends data in BOTH the body AND a ?_data= URL parameter.
 * The proxy route tries URL param first (with error handling), then
 * falls back to the body. If both fail, it returns a clear error.
 *
 * CHINA MAINLAND: The proxy connects to the local backend (localhost:8003),
 * bypassing Cloudflare entirely. This ensures reliable connectivity from
 * mainland China where external API calls may be blocked or slow.
 */

// In production, proxy to the local backend (same server, no Cloudflare hop).
// The backend listens on localhost:8003 — nginx exposes it externally via port 443.
// Using localhost avoids an unnecessary round-trip through Cloudflare for
// server-to-server communication, improving speed and reliability.
const BACKEND = process.env.BACKEND_URL || "http://localhost:8003"
const TIMEOUT_MS = 30_000  // 30s for regular requests (POST/GET with expected fast response)
const ANALYSIS_TIMEOUT_MS = 120_000  // 2 min for LLM-heavy endpoints (analyze-event, readings)
const SSE_TIMEOUT_MS = 600_000  // 10 min for SSE streams (analysis can take 5-8 min with two-call approach)
const MAX_BODY_SIZE = 10 * 1024 * 1024  // 10MB — prevents memory exhaustion from oversized requests
const IS_DEV = process.env.NODE_ENV !== "production"

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

  // ── SECURITY: Validate and sanitize path segments ──
  // Prevent path traversal (../, %2e%2e, etc.) by validating each segment
  const sanitizedSegments: string[] = []
  for (const seg of path) {
    // Reject path traversal patterns — check both raw and decoded forms
    let decoded: string
    try { decoded = decodeURIComponent(seg) } catch { decoded = seg }
    if (
      seg === ".." || seg === "." || seg === "" ||
      decoded === ".." || decoded === "." || decoded === "" ||
      decoded.includes("/") || decoded.includes("\\") ||
      /%2[eE]/i.test(seg)
    ) {
      return new Response(
        JSON.stringify({ detail: "Invalid path" }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } },
      )
    }
    sanitizedSegments.push(seg)
  }
  const targetPath = "/" + sanitizedSegments.join("/")

  // ── SECURITY: Block sensitive admin/cron/webhook endpoints from proxy ──
  const BLOCKED_PATHS = [
    "/api/cron/",
    "/api/webhooks/",          // Webhooks must hit backend directly
    "/api/payments/webhooks/", // PayPal/CJ webhooks must hit backend directly
    "/api/credits/grant",      // Admin-only
    "/api/credits/monthly-grant",
    "/api/credits/admin/",     // Admin credit audit/management
    "/api/admin/",             // All admin endpoints
    "/api/personal-payments/admin/",  // Admin personal payment management
    "/api/referrals/admin",    // Admin referral management
    "/api/users/admin",        // Admin user management
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
    const authTag = targetPath.includes("/auth/") ? "AUTH|" : ""
    if (IS_DEV) console.log(`[Proxy] ${authTag}${request.method} ${targetPath} ct=${contentType}`)

    if (isMultipart) {
      // ⚠️ CRITICAL: Use arrayBuffer() for multipart to preserve binary file data.
      // text() corrupts binary by interpreting bytes as UTF-8.
      const ab = await request.arrayBuffer()
      if (ab.byteLength > MAX_BODY_SIZE) {
        return new Response(
          JSON.stringify({ detail: "Request body too large" }),
          { status: 413, headers: { "Content-Type": "application/json; charset=utf-8" } },
        )
      }
      body = ab
      if (IS_DEV) console.log(`[Proxy] ${authTag}multipart body size: ${ab.byteLength}`)
    } else if (dataParam) {
      // Data from URL param — decode and use as JSON body
      try {
        body = decodeURIComponent(dataParam)
        if ((body as string).length > MAX_BODY_SIZE) {
          return new Response(
            JSON.stringify({ detail: "Request body too large" }),
            { status: 413, headers: { "Content-Type": "application/json; charset=utf-8" } },
          )
        }
        headers.set("Content-Type", "application/json")
        if (IS_DEV) console.log(`[Proxy] ${authTag}body from _data param, len=${(body as string)?.length}`)
      } catch {
        // URL param decoding failed — fall through to body
        dataParam = null
        body = undefined
      }
    }
    if (!dataParam && body === undefined) {
      // Fall back to reading the request body directly
      const raw = await request.text()
      if (raw.length > MAX_BODY_SIZE) {
        return new Response(
          JSON.stringify({ detail: "Request body too large" }),
          { status: 413, headers: { "Content-Type": "application/json; charset=utf-8" } },
        )
      }
      if (IS_DEV) console.log(`[Proxy] ${authTag}body from request.text(), len=${raw?.length ?? 0}`)
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
        // set-cookie can appear multiple times (access_token + refresh_token).
        // Headers.set() overwrites previous values — use append() to keep all.
        if (key.toLowerCase() === "set-cookie") {
          respHeaders.append(key, value)
        } else {
          respHeaders.set(key, value)
        }
      }
    })

    // Ensure charset=utf-8 for JSON responses — Chinese mobile browsers
    // default to GBK when charset is missing, causing garbled text
    const ct = respHeaders.get("content-type") || ""
    if (ct.includes("application/json") && !ct.includes("charset")) {
      respHeaders.set("Content-Type", "application/json; charset=utf-8")
    }

    // DEBUG: log auth response status (dev only — production logs leak tokens)
    if (IS_DEV && targetPath.includes("/auth/")) {
      console.log(`[Proxy] ${targetPath} → ${resp.status}`)
    }

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: respHeaders,
    })
  } catch (err: any) {
    console.error(`[Proxy] ${targetPath} failed:`, err?.name || err?.message)
    const msg = err?.name === "AbortError"
      ? `Backend timeout (${Math.round(timeoutMs / 1000)}s) — analysis is running, please check back in a moment`
      : "Backend service temporarily unavailable. Please try again later."
    return new Response(
      JSON.stringify({ detail: msg }),
      { status: 502, headers: { "Content-Type": "application/json; charset=utf-8" } },
    )
  } finally {
    clearTimeout(timer)
  }
}

