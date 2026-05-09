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

  // Forward headers (exclude host and origin which are proxy-specific)
  const headers = new Headers()
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (lower !== "host" && lower !== "origin" && lower !== "referer") {
      headers.set(key, value)
    }
  })
  // Set the correct host for the backend
  headers.set("Host", new URL(BACKEND).host)

  // Forward the body for methods that have one
  let body: BodyInit | undefined
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer()
  }

  try {
    const resp = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    })

    // Build response headers
    const respHeaders = new Headers()
    resp.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      // Skip hop-by-hop headers
      if (lower !== "transfer-encoding" && lower !== "connection") {
        respHeaders.set(key, value)
      }
    })

    // Stream the response body
    const responseBody = resp.body

    return new Response(responseBody, {
      status: resp.status,
      statusText: resp.statusText,
      headers: respHeaders,
    })
  } catch (err: any) {
    return new Response(
      JSON.stringify({ detail: `Proxy error: ${err.message}` }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
