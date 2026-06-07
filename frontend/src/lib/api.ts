import axios from "axios"

// ── Unicode Escape Helper ──────────────────────────────────────────────────
// Some proxies (Clash/V2Ray) and old nginx versions mangle UTF-8 bytes in
// POST request bodies, turning valid JSON into garbage that nginx rejects
// with a 400 *before* FastAPI's CORS middleware runs — resulting in a
// misleading "CORS" error in the browser.  By converting all non-ASCII
// characters to \uXXXX escapes the body becomes pure ASCII and passes
// through any proxy untouched.  The server-side JSON decoder understands
// \uXXXX natively so no changes are needed on the backend.
function escapeUnicode(str: string): string {
  // Preserve already-escaped sequences, convert raw non-ASCII chars
  return str.replace(/[-￿]/g, (ch) =>
    "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0")
  )
}

// ── Global 429 Rate-Limit Cooldown ─────────────────────────────────────────
// When any request hits 429, pause NON-CRITICAL requests for COOLDOWN_MS.
// Critical endpoints (readings, analysis, SSE) are exempt — they should
// never be blocked by auth rate limits.
const COOLDOWN_MS = 3_000
let _cooldownUntil = 0

// Endpoints that must NEVER be delayed by the 429 cooldown
const CRITICAL_PATHS = [
  "/api/readings",           // POST: create reading
  "/api/readings/session/",  // GET: poll/poll session
  "/api/readings/chat",      // POST: follow-up chat
  "/api/readings/daily",     // GET: daily fortune/almanac
  "/api/payments/",          // Payment flows
]

function _isCriticalPath(url: string): boolean {
  return CRITICAL_PATHS.some(p => url.includes(p))
}

function _getCooldownRemaining(): number {
  return Math.max(0, _cooldownUntil - Date.now())
}

function _enterCooldown() {
  _cooldownUntil = Date.now() + COOLDOWN_MS
}

// ── API routing ────────────────────────────────────────────────────────────
// Frontend and backend run on the SAME server. Nginx routes /api/* to the
// Next.js proxy route, which forwards to the backend on localhost:8002.
// No cross-origin requests — everything goes through the same domain.
const isBrowser = typeof window !== "undefined"
const isLocalhost = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
const isProduction = !isLocalhost

// In production: calls go to /api/proxy/* (Next.js server-side proxy → localhost:8002)
// In local dev: calls go directly to the backend
const PROD_BACKEND = "https://api.khanfate.com"
const BACKEND_URL = isLocalhost
  ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002")
  : PROD_BACKEND

// Main API client — routes through Next.js proxy in production
export const api = axios.create({
  baseURL: isLocalhost ? BACKEND_URL : "/api/proxy",
  timeout: 90_000,
  withCredentials: true,
})

// Auto-pass locale for error translation on all API clients
const addLangInterceptor = (client: typeof api) => {
  client.interceptors.request.use((config) => {
    try {
      const lang = localStorage.getItem("destiny_mirror_lang") || (navigator.language.startsWith("zh") ? "zh" : "en")
      config.params = { ...config.params, lang }
    } catch {}
    return config
  })
}
addLangInterceptor(api)

// ── 429 Rate-Limit Interceptor (api client) ───────────────────────────────
// When any request hits 429, delay all subsequent requests for COOLDOWN_MS.
// This prevents the burst of simultaneous API calls from multiple components
// (fetchBirthProfiles, listMyReadings, getDailyFortune, etc.) from
// overwhelming the backend rate limiter.
if (isBrowser) {
  api.interceptors.request.use((config) => {
    // Skip cooldown for critical endpoints (readings, payments, SSE)
    const url = config.url || ""
    if (!_isCriticalPath(url)) {
      const remaining = _getCooldownRemaining()
      if (remaining > 0) {
        return new Promise((resolve) => setTimeout(() => resolve(config), remaining))
      }
    }
    return config
  })

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err?.response?.status === 429) {
        _enterCooldown()
      }
      return Promise.reject(err)
    },
  )
}

// Direct backend connection for long-running / large-response endpoints
export const apiDirect = axios.create({
  baseURL: isLocalhost ? BACKEND_URL : "/api/proxy",
  timeout: 360_000,
  withCredentials: true,
})

// Apply same 429 cooldown to apiDirect (skip critical paths)
if (isBrowser) {
  apiDirect.interceptors.request.use((config) => {
    const url = config.url || ""
    if (!_isCriticalPath(url)) {
      const remaining = _getCooldownRemaining()
      if (remaining > 0) {
        return new Promise((resolve) => setTimeout(() => resolve(config), remaining))
      }
    }
    return config
  })
  apiDirect.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err?.response?.status === 429) _enterCooldown()
      return Promise.reject(err)
    },
  )
}

// Auth endpoints — route through Next.js proxy in production for
// China mainland reliability (direct api.khanfate.com connections
// can fail due to Cloudflare routing / GFW interference).
// In local dev: connect directly to backend.
export const apiAuth = axios.create({
  baseURL: isLocalhost ? BACKEND_URL : "/api/proxy",
  timeout: 15_000,
  withCredentials: true,
})

// Pass locale to backend so error messages are translated
apiAuth.interceptors.request.use((config) => {
  try {
    const lang = localStorage.getItem("destiny_mirror_lang") || (navigator.language.startsWith("zh") ? "zh" : "en")
    config.params = { ...config.params, lang }
  } catch {}
  return config
})

// Apply unicode escape interceptor to apiAuth in production (same as api/apiDirect)
// so POST bodies survive Clash/V2Ray/nginx UTF-8 mangling
if (!isLocalhost) {
  apiAuth.interceptors.request.use((config) => {
    const method = (config.method || "").toLowerCase()
    if (["post", "patch", "put"].includes(method)) {
      if (config.data instanceof FormData) {
        if (config.headers) {
          delete config.headers["Content-Type"]
          delete config.headers["content-type"]
        }
        return config
      }
      let jsonStr: string
      if (typeof config.data === "string") {
        jsonStr = config.data
      } else if (config.data !== undefined && config.data !== null) {
        jsonStr = JSON.stringify(config.data)
      } else {
        return config
      }
      config.data = escapeUnicode(jsonStr)
      config.headers = config.headers || {}
      if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
        config.headers["Content-Type"] = "application/json"
      }
    }
    return config
  })
}

// ── Production proxy interceptor ───────────────────────────────────────────
// Unicode-escape POST bodies to survive nginx/Clash UTF-8 mangling.
if (!isLocalhost) {
  const productionInterceptor = (config: any) => {
    const method = (config.method || "").toLowerCase()
    if (["post", "patch", "put"].includes(method)) {
      // Skip for FormData — must pass binary intact
      if (config.data instanceof FormData) {
        if (config.headers) {
          delete config.headers["Content-Type"]
          delete config.headers["content-type"]
        }
        return config
      }

      let jsonStr: string
      if (typeof config.data === "string") {
        jsonStr = config.data
      } else if (config.data !== undefined && config.data !== null) {
        jsonStr = JSON.stringify(config.data)
      } else {
        return config
      }
      config.data = escapeUnicode(jsonStr)
      config.headers = config.headers || {}
      if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
        config.headers["Content-Type"] = "application/json"
      }
    }
    return config
  }
  api.interceptors.request.use(productionInterceptor)
  apiDirect.interceptors.request.use(productionInterceptor)
}

// ── Types aligned with new 1+5 agent backend ──────────────────────────────

export type Gender = "male" | "female" | "other"

export interface AnalysisRequest {
  gender: Gender
  birth_year: number
  birth_month: number
  birth_day: number
  birth_hour: number
  birth_minute: number
  birth_city: string
  latitude?: number
  longitude?: number
  user_question: string
  is_premium: boolean
  language?: "zh" | "en"
  tarot_cards: { position: string; card: string; reversed: boolean }[]
  palm_raw_text: string
  face_raw_text: string
  intent?: string
  // Partner fields for RELATIONSHIP
  partner_name?: string
  partner_gender?: Gender
  partner_birth_year?: number
  partner_birth_month?: number
  partner_birth_day?: number
  partner_birth_hour?: number
  partner_birth_minute?: number
  partner_birth_city?: string
  partner_latitude?: number
  partner_longitude?: number
  partner_face_raw_text?: string
  partner_palm_raw_text?: string
  relationship_type?: string
}

export interface WorkerReport {
  agent_id: string
  report: string
  tags: string[]
  error?: string
  duration_ms?: number
}

export interface AnalysisResponse {
  session_id: string
  status: string
  progress_pct?: number
  progress_message?: string
  master_summary: string
  master_detail: string
  is_detail_unlocked: boolean
  is_detailed_unlocked: boolean
  astrology: WorkerReport
  tarot: WorkerReport
  bazi: WorkerReport
  qimen: WorkerReport
  ziwei: WorkerReport
  face: WorkerReport
  palm: WorkerReport
  partner_face?: WorkerReport
  partner_palm?: WorkerReport
  recommended_product_ids: string[]
  recommended_products?: Product[]
  computed_tags: string[]
  dimension_scores: Record<string, number>
  errors: string[]
  intent?: string
}

export interface ChatRequest {
  session_id: string
  question: string
}

export interface ChatResponse {
  answer: string
  routed_to: string
  session_id: string
  loop_count: number
  free_followup_used?: boolean
  has_used_free_followup?: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  short_pitch: string
  category: string
  price_cny: number
  price_usd?: number
  image_url?: string
  detail_images?: string[]
  keyword_tags?: string[]
  wuxing_tags?: string[]
  astro_tags?: string[]
  elements?: string[]
  planets?: string[]
  chakras?: string[]
  function_tags?: string[]
  material?: string
  rating?: number
  sales_count?: number
  /** 详细内容 */
  usage?: string
  precautions?: string
  efficacy?: string
  specifications?: Record<string, string>
  /** Present when returned from match endpoints */
  match_score?: number
  match_reasons?: string[]
  recommendation_text?: string
}

export interface MatchRequest {
  weakness_tags: string[]
  boost_elements?: string[]
  astro_weakness_tags?: string[]
  master_summary?: string
  top_k?: number
  include_explain?: boolean
}

// ── Safe JSON serializer ──────────────────────────────────────────────────
// Stringify + Unicode-escape non-ASCII so Chinese text survives proxies.
// Pass the result directly as `data` in axios requests.
function safeJson(data: unknown): string {
  return escapeUnicode(JSON.stringify(data))
}

// ── API functions ──────────────────────────────────────────────────────────

export async function runAnalysis(data: AnalysisRequest): Promise<AnalysisResponse> {
  // Step 1: POST starts analysis in background, returns immediately with session_id
  // Retry up to 3 times on any transient error (network, 400, 502, 503)
  // NOTE: We JSON.stringify the payload manually so the Unicode escape
  //       interceptor can process it (converting Chinese chars to \uXXXX
  //       before they hit any proxy that might re-encode UTF-8).
  let lastError: any = null
  let sessionId: string | undefined
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const body = safeJson(data)
      const initRes = await apiDirect.post<AnalysisResponse>("/api/readings", body, {
        timeout: 30_000,
        headers: { "Content-Type": "application/json" },
      })
      sessionId = initRes.data.session_id
      break
    } catch (err: any) {
      lastError = err
      const status = err?.response?.status
      // Don't retry client errors (4xx) except 429 (rate limit)
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw err
      }
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 2000 * attempt))
        continue
      }
      throw err
    }
  }
  if (typeof sessionId === "undefined") throw lastError

  // Step 2: Poll until analysis completes (max 5 minutes)
  const deadline = Date.now() + 5 * 60 * 1000
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000))
    const poll = await api.get<AnalysisResponse>(`/api/readings/session/${sessionId}`, { timeout: 60_000 })
    if (poll.data.status === "done" || poll.data.status === "completed" || poll.data.status === "chat") {
      return poll.data
    }
    if (poll.data.errors && poll.data.errors.length > 0 && poll.data.master_summary) {
      return poll.data
    }
  }
  throw new Error("分析超时，请稍后在「我的命盘」中查看结果")
}

// ── Reading cache (browser sessionStorage) ──────────────────────────────────
// Cache completed readings to avoid re-fetching on revisit. TTL: 10 minutes.
const READING_CACHE_TTL = 10 * 60 * 1000

function _getCachedReading(sessionId: string): AnalysisResponse | null {
  try {
    const raw = sessionStorage.getItem(`reading:${sessionId}`)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > READING_CACHE_TTL) {
      sessionStorage.removeItem(`reading:${sessionId}`)
      return null
    }
    return data as AnalysisResponse
  } catch { return null }
}

function _setCachedReading(sessionId: string, data: AnalysisResponse) {
  try {
    // Only cache completed readings
    if (data.status !== "done" && data.status !== "chat") return
    // Don't cache unlock status — it depends on the user's premium
    // status which may change. Always fetch fresh from backend.
    const { is_detail_unlocked, is_detailed_unlocked, ...rest } = data
    sessionStorage.setItem(`reading:${sessionId}`, JSON.stringify({ ts: Date.now(), data: rest }))
  } catch { /* quota exceeded — ignore */ }
}

export async function getSession(sessionId: string, lang?: string): Promise<AnalysisResponse> {
  // Fast path: browser cache for completed readings (skip network entirely)
  if (!lang) {
    const cached = _getCachedReading(sessionId)
    if (cached) return cached
  }
  const params: Record<string, string> = {}
  if (lang) params.lang = lang
  // In production, GET requests go directly to backend (bypass proxy for speed).
  // CORS is configured on backend to allow khanfate.com origin.
  const client = isProduction ? apiDirect : api

  // Retry on 500 errors (server may need time to recover after deploy)
  const MAX_RETRIES = 5
  const RETRY_DELAY_MS = 3000
  let lastError: unknown = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await client.get<AnalysisResponse>(`/api/readings/session/${sessionId}`, { params })
      // Cache completed readings for instant revisit
      _setCachedReading(sessionId, res.data)
      return res.data
    } catch (err: any) {
      lastError = err
      const status = err?.response?.status
      // Only retry on 500 (server error) — don't retry 404/403/etc.
      if (status === 500 && attempt < MAX_RETRIES - 1) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
        continue
      }
      throw err
    }
  }
  throw lastError
}

// ── SSE Streaming ──────────────────────────────────────────────────────────

export type AgentStatusValue = "pending" | "running" | "done" | "error" | "skipped"

export interface SSEEvent {
  type: "phase" | "worker_done" | "subtask_done" | "complete" | "error" | "progress" | "agent_status" | "heartbeat"
  phase?: string
  agent_id?: string
  duration_ms?: number
  subtask?: string
  length?: number
  master_summary?: string
  master_detail?: string
  message?: string
  pct?: number
  status?: Record<string, AgentStatusValue>
}

/**
 * Connect to the SSE stream for a session.
 * Calls `onEvent` for each progress event. Resolves when analysis is complete.
 *
 * IMPORTANT: In production, SSE connections go through the Next.js proxy
 * (same-origin, no CORS issues). The backend sends heartbeats every ~15s,
 * well within the proxy's timeout, so the connection stays alive.
 * This approach works reliably from mainland China because the server
 * proxies locally (localhost) — no Cloudflare/GFW in the path.
 *
 * SECURITY: Includes auto-reconnect with exponential backoff (max 3 retries).
 */
export function streamSession(
  sessionId: string,
  onEvent: (event: SSEEvent) => void,
  maxRetries: number = 3,
): Promise<AnalysisResponse> {
  return new Promise((resolve, reject) => {
    let retryCount = 0
    let settled = false // prevent double resolve/reject

    function connect() {
      // Route SSE through the same-origin proxy path.
      // This avoids CORS issues and works reliably from mainland China
      // (direct connections to api.khanfate.com may be blocked by GFW).
      // In local dev, connect directly to backend (no proxy needed).
      const sseBaseUrl = isProduction ? "" : BACKEND_URL
      const url = isProduction
        ? `/api/proxy/api/readings/session/${sessionId}/stream`
        : `${BACKEND_URL}/api/readings/session/${sessionId}/stream`

      const es = new EventSource(url)

      es.onmessage = (e) => {
        try {
          const data: SSEEvent = JSON.parse(e.data)
          // Ignore heartbeat events (keep connection alive)
          if (data.type === "heartbeat") return
          onEvent(data)
          if (data.type === "complete") {
            settled = true
            es.close()
            resolve({
              session_id: sessionId,
              status: "done",
              master_summary: data.master_summary || "",
              master_detail: data.master_detail || "",
              is_detail_unlocked: false,
              astrology: { agent_id: "astrology", report: "", tags: [] },
              tarot: { agent_id: "tarot", report: "", tags: [] },
              bazi: { agent_id: "bazi", report: "", tags: [] },
              qimen: { agent_id: "qimen", report: "", tags: [] },
              ziwei: { agent_id: "ziwei", report: "", tags: [] },
              face: { agent_id: "face", report: "", tags: [] },
              palm: { agent_id: "palm", report: "", tags: [] },
              recommended_product_ids: [],
              computed_tags: [],
              dimension_scores: {},
              errors: [],
            })
          }
          if (data.type === "error") {
            settled = true
            es.close()
            reject(new Error(data.message || "Stream error"))
          }
        } catch { /* ignore parse errors */ }
      }

      es.onerror = async () => {
        es.close()
        if (!settled && retryCount < maxRetries) {
          retryCount++
          // Try to get the actual HTTP status for a better error message
          try {
            const resp = await fetch(url, { method: "HEAD" })
            if (resp.status === 401 || resp.status === 403) {
              settled = true
              reject(new Error(resp.status === 401 ? "认证已过期，请重新登录" : "无权访问"))
              return
            }
          } catch { /* ignore — will retry below */ }
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
          setTimeout(connect, delay)
        } else if (!settled) {
          settled = true
          reject(new Error("SSE unavailable after retries"))
        }
      }
    }

    connect()
  })
}

/**
 * Start analysis and return the session_id immediately.
 *
 * IMPORTANT: This does NOT wait for the analysis to complete.
 * The reading page ([id]/page.tsx) handles progress display via SSE + polling.
 * Previously this function blocked on polling fallback (up to 3 minutes),
 * which prevented the progress bar from ever showing.
 *
 * @returns session_id — caller should navigate to /reading/{session_id}
 */
export async function runAnalysisStream(
  data: AnalysisRequest,
  onEvent?: (event: SSEEvent) => void,
): Promise<{ session_id: string }> {
  // POST to start analysis in background, return session_id immediately.
  // Retry up to 3 times on transient errors (network, 429, 502, 503).
  const body = safeJson(data)
  let initRes: { data: AnalysisResponse } | null = null
  let lastError: any = null

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      initRes = await apiDirect.post<AnalysisResponse>("/api/readings", body, {
        timeout: 30_000,
        headers: { "Content-Type": "application/json" },
      })
      break
    } catch (err: any) {
      lastError = err
      const status = err?.response?.status
      // Only retry on transient errors (network, 429, 502, 503)
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw err // Client error — don't retry
      }
      if (attempt < 3) {
        console.warn(`[AnalysisStream] Attempt ${attempt} failed (${status || err?.code || err?.message}), retrying...`)
        await new Promise(r => setTimeout(r, 1500 * attempt))
        continue
      }
      throw err
    }
  }
  if (!initRes) throw lastError

  const sessionId = initRes.data.session_id

  // Try to establish SSE stream in background (don't block).
  // The reading page will also establish its own SSE connection.
  // This early connection is a warm-up that may deliver initial progress events.
  if (onEvent) {
    streamSession(sessionId, onEvent).catch(() => {
      // SSE unavailable from this context — reading page will handle it
    })
  }

  return { session_id: sessionId }
}

export async function sendChat(data: ChatRequest): Promise<ChatResponse> {
  const res = await api.post<ChatResponse>("/api/readings/chat", safeJson(data), {
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

export async function uploadFaceImage(
  sessionId: string,
  file: File,
): Promise<{ face_text: string; features: Record<string, string> }> {
  const form = new FormData()
  form.append("file", file)
  const res = await api.post(`/api/readings/upload-face/${sessionId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data
}

export async function analyzeFaceImage(
  file: File,
): Promise<{ face_text: string; features: Record<string, string> }> {
  const form = new FormData()
  form.append("file", file)
  const res = await api.post("/api/readings/analyze-face", form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data
}

export async function analyzePalmImage(
  file: File,
): Promise<{ palm_text: string; features: Record<string, string> }> {
  const form = new FormData()
  form.append("file", file)
  const res = await api.post("/api/readings/analyze-palm", form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data
}

export async function uploadPalmImage(
  sessionId: string,
  file: File,
): Promise<{ palm_text: string; features: Record<string, string> }> {
  const form = new FormData()
  form.append("file", file)
  const res = await api.post(`/api/readings/upload-palm-image/${sessionId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data
}

export async function listProducts(category?: string, lang?: string): Promise<Product[]> {
  const params: Record<string, string> = {}
  if (category) params.category = category
  if (lang) params.lang = lang
  const res = await api.get<Product[]>("/api/products", { params })
  return res.data
}

export async function matchProducts(data: MatchRequest, lang?: string): Promise<Product[]> {
  const params: Record<string, string> = lang ? { lang } : {}
  const res = await api.post<Product[]>("/api/products/match", safeJson(data), {
    params,
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

export async function createCheckout(sessionId: string): Promise<{ checkout_url: string }> {
  const res = await api.post(`/api/payments/create-checkout/${sessionId}`)
  return res.data
}

export interface UnlockResult {
  unlocked: boolean
  reading_id: string
  message: string
  tier?: string
  stardust_deducted?: number
  balance_after?: number
  shop_coupon_issued?: number
  trial_activated?: boolean
}

export async function unlockReport(sessionId: string, source: "payment" | "stardust" = "payment", tier: "detailed" | "full" = "full"): Promise<UnlockResult> {
  const res = await api.post<UnlockResult>(`/api/payments/unlock/${sessionId}?source=${source}&tier=${tier}`)
  return res.data
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  display_name: string | null
  is_premium: boolean
  premium_expires_at: string | null
  shop_coupon_balance: number
  subscription_tier: string | null
  active_birth_profile_id?: string | null
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: AuthUser
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await apiAuth.post<AuthResponse>("/api/auth/login", { email, password })
  return res.data
}

export interface RegisterBirthData {
  nickname?: string
  gender: string
  birth_year: number
  birth_month: number
  birth_day: number
  birth_hour: number
  birth_minute?: number
  birth_city?: string
  latitude?: number | null
  longitude?: number | null
}

export async function registerUser(
  email: string,
  password: string,
  displayName?: string,
  privacyAccepted?: boolean,
  birthData?: RegisterBirthData,
): Promise<{ message: string; email: string }> {
  const res = await apiAuth.post<{ message: string; email: string }>("/api/auth/register", safeJson({
    email,
    password,
    display_name: displayName,
    privacy_accepted: privacyAccepted ?? true,
    birth_data: birthData || undefined,
  }), {
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

export async function sendVerificationCode(email: string): Promise<{ message: string }> {
  const res = await apiAuth.post<{ message: string }>("/api/auth/send-code", { email })
  return res.data
}

export async function verifyEmail(email: string, code: string): Promise<AuthResponse> {
  const res = await apiAuth.post<AuthResponse>("/api/auth/verify-email", { email, code })
  return res.data
}

export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ message: string }> {
  const res = await apiAuth.post<{ message: string }>("/api/auth/reset-password", {
    email,
    code,
    new_password: newPassword,
  })
  return res.data
}

export async function getMe(): Promise<AuthUser> {
  const res = await apiAuth.get<AuthUser>("/api/auth/me")
  return res.data
}

export async function refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string; token_type: string }> {
  const res = await apiAuth.post("/api/auth/refresh", { refresh_token: refreshToken })
  return res.data
}

// ── Password Reset ──────────────────────────────────────────────────────────

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await apiAuth.post<{ message: string }>("/api/auth/forgot-password", { email })
  return res.data
}

// ── Profile Settings ────────────────────────────────────────────────────────

export async function updateProfile(displayName: string): Promise<{ id: string; email: string; display_name: string | null }> {
  const res = await api.put("/api/users/profile", safeJson({ display_name: displayName }), {
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await api.put("/api/users/password", safeJson({ old_password: oldPassword, new_password: newPassword }), {
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

export async function deleteAccount(password: string): Promise<{ message: string }> {
  const res = await apiAuth.delete("/api/auth/delete-account", {
    data: safeJson({ password }),
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

// ── Payment / Order / Subscription ──────────────────────────────────────────

export interface SubscribeResult {
  subscription_id: string
  tier: string
  status: string
  current_period_end: string
  message: string
}

export async function subscribe(tier: "premium_monthly" | "premium_yearly"): Promise<SubscribeResult> {
  const res = await api.post<SubscribeResult>("/api/payments/subscribe", null, { params: { tier } })
  return res.data
}

export async function cancelSubscription(): Promise<{ status: string; message: string }> {
  const res = await api.post("/api/payments/cancel-subscription")
  return res.data
}

export interface CreateOrderRequest {
  items: { product_id: string; product_name: string; quantity: number; unit_price_cny: number }[]
  total_cny: number
  use_coupon?: boolean
  address_id?: string
  notes?: string
  payment_method?: string
}

export interface CreateOrderResult {
  order_id: string
  order_no: string
  status: string
  original_total: number
  coupon_used: number
  final_total: number
}

export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResult> {
  const res = await api.post<CreateOrderResult>("/api/payments/create-order", safeJson(data), {
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

// ── Payment Methods ──────────────────────────────────────────────────────────

export interface PaymentMethod {
  id: string
  name: string
  name_en: string
  icon: string
  category: "china" | "global"
  enabled: boolean
}

export interface PaymentMethodsResponse {
  methods: PaymentMethod[]
  count: number
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const res = await api.get<PaymentMethodsResponse>("/api/payments/payment-methods")
  return res.data.methods
}

export interface PayPalConfig {
  client_id: string
  mode: "sandbox" | "live"
}

export async function getPayPalConfig(): Promise<PayPalConfig> {
  const res = await apiDirect.get<PayPalConfig>("/api/payments/paypal/config")
  return res.data
}

export async function capturePayPalOrder(paypalOrderId: string): Promise<{ status: string }> {
  const res = await apiDirect.post(`/api/payments/paypal/capture`, null, {
    params: { paypal_order_id: paypalOrderId },
  })
  return res.data
}

export async function createCheckoutUrl(
  readingId: string,
  paymentMethod: string,
  itemType: string = "unlock_report",
): Promise<{ checkout_url?: string; pay_url?: string; approve_url?: string; code_url?: string; payment_method: string; message: string }> {
  // 根据支付方式调用不同接口 — 金额由服务端决定
  if (paymentMethod === "alipay") {
    const res = await apiDirect.post(`/api/payments/alipay/create`, null, {
      params: { item_type: itemType, subject: "命盘智镜", reading_id: readingId }
    })
    return { pay_url: res.data.pay_url, payment_method: "alipay", message: res.data.message }
  } else if (paymentMethod === "wechat_pay") {
    const res = await apiDirect.post(`/api/payments/wechat/create`, null, {
      params: { item_type: itemType, description: "命盘智镜", reading_id: readingId }
    })
    return { code_url: res.data.code_url, payment_method: "wechat_pay", message: res.data.message }
  } else if (paymentMethod === "paypal") {
    const res = await apiDirect.post(`/api/payments/paypal/create`, null, {
      params: { item_type: itemType, description: "Destiny Mirror", reading_id: readingId }
    })
    return { approve_url: res.data.approve_url, payment_method: "paypal", message: res.data.message }
  } else {
    throw new Error("不支持的支付方式")
  }
}

export interface PayEventResult {
  paid: boolean
  event_id: string
  charge: number
  used_free_quota: boolean
  remaining_free_quota: number
  stardust_deducted: number
  message: string
}

export async function payEvent(
  eventId: string,
  useFreeQuota = true,
  source: "payment" | "stardust" = "payment",
): Promise<PayEventResult> {
  const res = await api.post<PayEventResult>("/api/payments/pay-event", {
    event_id: eventId,
    use_free_quota: useFreeQuota,
    source,
  })
  return res.data
}

export const AGENT_LABELS: Record<string, { icon: string; label: string; color: string }> = {
  astrology: { icon: "✦", label: "西方星盘",  color: "text-purple-400" },
  tarot:     { icon: "🃏", label: "塔罗疗愈",  color: "text-jade-light" },
  bazi:      { icon: "☯", label: "周易八字",  color: "text-gold" },
  qimen:     { icon: "🎯", label: "奇门遁甲",  color: "text-amber-400" },
  ziwei:     { icon: "⭐", label: "紫微斗数",  color: "text-purple-400" },
  face:      { icon: "👁", label: "AI 面相",   color: "text-rose-400" },
  palm:      { icon: "🤚", label: "手相解读",  color: "text-amber-400" },
  partner_face: { icon: "👁", label: "对方面相", color: "text-rose-400" },
  partner_palm: { icon: "🤚", label: "对方手相", color: "text-amber-400" },
  master:    { icon: "🌟", label: "命盘总览",  color: "text-gold" },
}

// ── Event Analyzer (事件复盘) ────────────────────────────────────────────────

export interface AnalyzeEventRequest {
  session_id?: string
  event_description: string
  event_datetime: string
  emotion_score?: number
}

export interface AnalyzeEventResponse {
  event_id: string
  causal_analysis: string
  current_advice: string
  future_prevention: string
  remedy_keywords: string[]
  recommended_products: Product[]
}

export interface EventListItem {
  id: string
  event_description: string
  event_datetime: string
  emotion_score: number | null
  causal_analysis: string | null
  created_at: string
}

export interface DailyAlmanacResponse {
  date: string
  lunar_date: string
  bazi_day_pillar: string
  energy_score: number
  yi: string[]
  ji: string[]
  hu: { product: Product; reason: string }[]
  daily_quote: string
  wuxing_analysis: string
}

export async function analyzeEvent(data: AnalyzeEventRequest): Promise<AnalyzeEventResponse> {
  const res = await api.post<AnalyzeEventResponse>("/api/readings/analyze-event", safeJson(data), {
    timeout: 360_000,
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

export async function listEvents(sessionId: string): Promise<EventListItem[]> {
  const res = await api.get<EventListItem[]>("/api/readings/events", { params: { session_id: sessionId } })
  return res.data
}

export async function getEventDetail(eventId: string): Promise<AnalyzeEventResponse> {
  const res = await api.get<AnalyzeEventResponse>(`/api/readings/events/${eventId}`)
  return res.data
}

export async function getDailyAlmanac(sessionId: string, lang: string = "zh"): Promise<DailyAlmanacResponse> {
  const res = await api.get<DailyAlmanacResponse>("/api/readings/daily-almanac", { params: { session_id: sessionId, lang }, timeout: 30_000 })
  return res.data
}

export interface PersonalizedAlmanacParams {
  birth_year: number
  birth_month: number
  birth_day: number
  birth_hour: number
  birth_minute?: number
  gender?: string
  birth_city?: string
  latitude?: number
  longitude?: number
}

export async function getPersonalizedDailyAlmanac(
  params: PersonalizedAlmanacParams,
  lang: string = "zh",
  fast: boolean = true,
): Promise<DailyAlmanacResponse> {
  const res = await api.post<DailyAlmanacResponse>(
    "/api/readings/personalized-almanac",
    safeJson({ ...params, birth_minute: params.birth_minute ?? 0, gender: params.gender ?? "male", lang }),
    { timeout: 30_000, headers: { "Content-Type": "application/json" } },
  )
  return res.data
}

export async function getPersonalizedFortune(
  birthProfile: { birth_year: number; birth_month: number; birth_day: number; birth_hour: number },
  lang: string = "zh",
): Promise<DailyFortuneResponse | null> {
  try {
    const res = await api.get<DailyFortuneResponse>("/api/readings/daily-fortune", {
      params: {
        birth_year: birthProfile.birth_year,
        birth_month: birthProfile.birth_month,
        birth_day: birthProfile.birth_day,
        birth_hour: birthProfile.birth_hour,
        lang,
      },
      timeout: 15_000,
    })
    return res.data
  } catch {
    return null
  }
}

// ── My Readings (P1-1) ────────────────────────────────────────────────────

export interface ReadingListItem {
  id: string
  session_id: string
  status: string
  master_summary: string
  computed_tags: string[]
  dimension_scores: Record<string, number>
  is_detail_unlocked: boolean
  is_detailed_unlocked: boolean
  created_at: string
  completed_at: string | null
}

export async function listMyReadings(): Promise<ReadingListItem[]> {
  const res = await api.get<ReadingListItem[]>("/api/readings/my")
  return res.data
}

export async function deleteReading(sessionId: string): Promise<void> {
  await api.delete(`/api/readings/${sessionId}`)
}

// ── Product Detail (P1-2) ─────────────────────────────────────────────────

export async function getProduct(productId: string, lang?: string): Promise<Product> {
  const params: Record<string, string> = lang ? { lang } : {}
  const res = await api.get<Product>(`/api/products/${productId}`, { params })
  return res.data
}

// ── Product Reviews (P3-2) ────────────────────────────────────────────────

export interface ProductReview {
  id: string
  product_id: string
  user_name: string
  rating: number
  content: string
  tags: string[]
  created_at: string
}

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const res = await api.get<ProductReview[]>(`/api/products/${productId}/reviews`)
  return res.data
}

export async function createProductReview(
  productId: string,
  data: { rating: number; content: string; tags?: string[] }
): Promise<ProductReview> {
  const res = await api.post<ProductReview>(`/api/products/${productId}/reviews`, safeJson(data), {
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

// ── Favorites (P3-3) ──────────────────────────────────────────────────────

export async function getFavorites(): Promise<Product[]> {
  const res = await api.get<Product[]>("/api/users/favorites")
  return res.data
}

export async function addFavorite(productId: string): Promise<void> {
  await api.post(`/api/users/favorites/${productId}`)
}

export async function removeFavorite(productId: string): Promise<void> {
  await api.delete(`/api/users/favorites/${productId}`)
}

// ── User Orders (P2-1) ────────────────────────────────────────────────────

export interface OrderListItem {
  id: string
  order_no: string
  status: string
  total_cny: number
  item_count: number
  created_at: string
  paid_at: string | null
}

export async function listMyOrders(): Promise<OrderListItem[]> {
  const res = await api.get<OrderListItem[]>("/api/users/orders")
  return res.data
}

// ── Addresses ─────────────────────────────────────────────────────────────

export interface Address {
  id: string
  recipient_name: string
  phone: string
  country: string
  province: string | null
  city: string | null
  district: string | null
  address_line1: string
  address_line2: string | null
  postal_code: string | null
  is_default: boolean
  created_at: string
}

export interface AddressFormData {
  recipient_name: string
  phone: string
  country: string
  province?: string | null
  city?: string | null
  district?: string | null
  address_line1: string
  address_line2?: string | null
  postal_code?: string | null
  is_default?: boolean
}

export async function getAddresses(): Promise<Address[]> {
  const res = await api.get<Address[]>("/api/users/addresses")
  return res.data
}

export async function createAddress(data: AddressFormData): Promise<Address> {
  const res = await api.post<Address>("/api/users/addresses", data)
  return res.data
}

export async function updateAddress(id: string, data: AddressFormData): Promise<Address> {
  const res = await api.put<Address>(`/api/users/addresses/${id}`, data)
  return res.data
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/api/users/addresses/${id}`)
}

export async function setDefaultAddress(id: string): Promise<void> {
  await api.put(`/api/users/addresses/${id}/default`)
}

// ── Order Detail ──────────────────────────────────────────────────────────

export interface OrderItemDetail {
  id: string
  product_name: string
  quantity: number
  unit_price_cny: number
  subtotal_cny: number
  recommendation_reason: string | null
}

export interface OrderDetail {
  id: string
  order_no: string
  status: string
  total_cny: number
  total_usd: number | null
  payment_method: string | null
  recipient_name: string | null
  recipient_phone: string | null
  shipping_address: {
    country?: string
    province?: string
    city?: string
    district?: string
    address_line1?: string
    address_line2?: string
    postal_code?: string
  } | null
  tracking_number: string | null
  shipping_carrier: string | null
  notes: string | null
  items: OrderItemDetail[]
  created_at: string
  paid_at: string | null
  shipped_at: string | null
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail> {
  const res = await api.get<OrderDetail>(`/api/users/orders/${orderId}`)
  return res.data
}

export async function cancelOrder(orderId: string): Promise<{ status: string; message: string }> {
  const res = await api.post(`/api/users/orders/${orderId}/cancel`)
  return res.data
}

export async function confirmReceive(orderId: string): Promise<{ status: string; message: string }> {
  const res = await api.post(`/api/users/orders/${orderId}/confirm-receive`)
  return res.data
}

export async function requestRefund(orderId: string): Promise<{ status: string; message: string }> {
  const res = await api.post(`/api/users/orders/${orderId}/request-refund`)
  return res.data
}

// ── Tracking ──────────────────────────────────────────────────────────────

export interface TrackingTrajectory {
  time: string
  description: string
}

export interface TrackingInfo {
  order_no: string
  status: string
  tracking_number: string | null
  shipping_carrier: string | null
  shipped_at: string | null
  trajectory: TrackingTrajectory[]
}

export async function getTrackingInfo(orderId: string): Promise<TrackingInfo> {
  const res = await api.get<TrackingInfo>(`/api/payments/tracking/${orderId}`)
  return res.data
}

// ── Daily Fortune (P2-3) ──────────────────────────────────────────────────

export interface DailyFortuneResponse {
  date: string
  greeting: string
  overall_score: number
  wealth_fortune: number
  career_fortune: number
  love_fortune: number
  health_fortune: number
  lucky_color: string
  lucky_number: number
  advice: string
  warning: string
  personalized?: boolean
}

export async function getDailyFortune(lang: string = "zh"): Promise<DailyFortuneResponse> {
  const res = await api.get<DailyFortuneResponse>("/api/readings/daily-fortune", { params: { lang } })
  return res.data
}

// ── Blog / Knowledge Base (P2-2) ──────────────────────────────────────────

export interface BlogArticle {
  id: string
  title: string
  summary: string
  content: string
  category: string
  tags: string[]
  read_time: number
  cover_emoji: string
  created_at: string
}

export async function listBlogArticles(category?: string): Promise<BlogArticle[]> {
  const params = category ? { category } : {}
  const res = await api.get<BlogArticle[]>("/api/blog", { params })
  return res.data
}

export async function getBlogArticle(id: string): Promise<BlogArticle> {
  const res = await api.get<BlogArticle>(`/api/blog/${id}`)
  return res.data
}

// ── Stardust (星尘) API ─────────────────────────────────────────────────────

export interface StardustBalance {
  balance: number
  lifetime_earned: number
}

export interface StardustTransaction {
  id: string
  amount: number
  balance_after: number
  reason: string
  reference_id: string | null
  status: string
  created_at: string | null
}

export async function getStardustBalance(): Promise<StardustBalance> {
  const res = await api.get<StardustBalance>("/api/credits/balance")
  return res.data
}

export async function getStardustHistory(limit = 50): Promise<{ items: StardustTransaction[] }> {
  const res = await api.get<{ items: StardustTransaction[] }>("/api/credits/history", { params: { limit } })
  return res.data
}

export async function deductStardust(
  action: string,
  referenceId?: string,
): Promise<{ transaction_id: string; deducted: number; balance_after: number }> {
  const res = await api.post("/api/credits/deduct", safeJson({
    action,
    reference_id: referenceId,
  }), {
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

export async function confirmStardustDeduction(transactionId: string): Promise<{ status: string }> {
  const res = await api.post("/api/credits/confirm", null, {
    params: { transaction_id: transactionId },
  })
  return res.data
}

export async function refundStardust(
  transactionId: string,
  reason?: string,
): Promise<{ status: string; balance_after: number }> {
  const res = await api.post("/api/credits/refund", safeJson({
    transaction_id: transactionId,
    reason,
  }), {
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

// ── Billing / Geo Config ─────────────────────────────────────────────────

export interface StardustPackage {
  id: string
  stardust: number
  price: number
  popular: boolean
}

export interface GeoConfig {
  region: string
  currency: string
  symbol: string
  packages: StardustPackage[]
  channels: string[]
  aifadian_url?: string
  wallet_addresses?: Record<string, string>
  crypto_rate?: Record<string, number>
}

export async function getGeoConfig(regionOverride?: string): Promise<GeoConfig> {
  const params = regionOverride ? { region: regionOverride } : {}
  const res = await api.get<GeoConfig>("/api/billing/geo-config", { params })
  return res.data
}

export async function redeemCode(code: string): Promise<{ message: string; stardust_granted: number; balance_after: number }> {
  const res = await api.post("/api/billing/redeem", safeJson({ code }), {
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

export async function verifyTx(
  tx_id: string,
  network: "TRC20" | "ARBITRUM",
): Promise<{ success: boolean; stardust_granted: number; balance_after: number; message: string }> {
  const res = await api.post("/api/billing/verify-tx", safeJson({ tx_id, network }), {
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

// ── Fortune Subscription ──────────────────────────────────────────────────

export interface FortuneSubscription {
  frequency: string
  is_active: boolean
}

export interface WeeklyFortuneResponse {
  id?: string
  week_start: string
  week_end: string
  score: number
  theme: string
  lucky_color: string
  lucky_number: string
  lucky_direction: string
  tarot_card: string
  tarot_desc: string
  ai_insight: string
  daily_yi_ji: { day: number; yi: string; ji: string }[]
  is_read: boolean
}

export interface FortuneDailyResponse {
  id?: string
  date: string
  score: number
  theme: string
  lucky_color: string
  lucky_number: string
  lucky_direction: string
  tarot_card: string
  tarot_desc: string
  ai_insight: string
  yi: string[]
  ji: string[]
  is_read: boolean
}

export async function subscribeFortune(frequency: string): Promise<FortuneSubscription> {
  const res = await api.post<FortuneSubscription>("/api/fortune/subscribe", safeJson({ frequency }), {
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

export async function getFortuneDaily(locale: string = "zh"): Promise<FortuneDailyResponse> {
  const res = await api.get<FortuneDailyResponse>("/api/fortune/daily", { params: { locale } })
  return res.data
}

export async function getFortuneSubscription(): Promise<FortuneSubscription> {
  const res = await api.get<FortuneSubscription>("/api/fortune/subscription")
  return res.data
}

export async function getWeeklyFortune(locale: string = "zh"): Promise<WeeklyFortuneResponse> {
  const res = await api.get<WeeklyFortuneResponse>("/api/fortune/weekly", { params: { locale } })
  return res.data
}
