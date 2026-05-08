import axios from "axios"

// Always use NEXT_PUBLIC_API_URL env var, fallback to localhost for dev
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"

// Main API client — points directly to backend
export const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 90_000,
})

// Direct backend connection for long-running / large-response endpoints
export const apiDirect = axios.create({
  baseURL: BACKEND_URL,
  timeout: 180_000,
})

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
  tarot_cards: { position: string; card: string; reversed: boolean }[]
  palm_raw_text: string
  face_raw_text: string
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
  master_summary: string
  master_detail: string
  is_detail_unlocked: boolean
  astrology: WorkerReport
  tarot: WorkerReport
  bazi: WorkerReport
  qimen: WorkerReport
  ziwei: WorkerReport
  face: WorkerReport
  palm: WorkerReport
  recommended_product_ids: string[]
  recommended_products?: Product[]
  computed_tags: string[]
  dimension_scores: Record<string, number>
  errors: string[]
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

// ── API functions ──────────────────────────────────────────────────────────

export async function runAnalysis(data: AnalysisRequest): Promise<AnalysisResponse> {
  // Step 1: POST starts analysis in background, returns immediately with session_id
  const initRes = await apiDirect.post<AnalysisResponse>("/api/readings", data, { timeout: 30_000 })
  const sessionId = initRes.data.session_id

  // Step 2: Poll until analysis completes (max 5 minutes)
  const deadline = Date.now() + 5 * 60 * 1000
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000))
    const poll = await api.get<AnalysisResponse>(`/api/readings/session/${sessionId}`, { timeout: 60_000 })
    if (poll.data.status === "done" || poll.data.status === "chat") {
      return poll.data
    }
    if (poll.data.errors && poll.data.errors.length > 0 && poll.data.master_summary) {
      return poll.data
    }
  }
  throw new Error("分析超时，请稍后在「我的命盘」中查看结果")
}

export async function getSession(sessionId: string): Promise<AnalysisResponse> {
  const res = await api.get<AnalysisResponse>(`/api/readings/session/${sessionId}`)
  return res.data
}

export async function sendChat(data: ChatRequest): Promise<ChatResponse> {
  const res = await api.post<ChatResponse>("/api/readings/chat", data)
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
  const res = await api.post<Product[]>("/api/products/match", data, { params })
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
  shop_coupon_issued: number
  trial_activated: boolean
}

export async function unlockReport(sessionId: string): Promise<UnlockResult> {
  const res = await api.post<UnlockResult>(`/api/payments/unlock/${sessionId}`)
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
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: AuthUser
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/login", { email, password })
  return res.data
}

export async function registerUser(
  email: string,
  password: string,
  displayName?: string,
  privacyAccepted?: boolean,
): Promise<{ message: string; email: string }> {
  const res = await api.post<{ message: string; email: string }>("/api/auth/register", {
    email,
    password,
    display_name: displayName,
    privacy_accepted: privacyAccepted ?? true,
  })
  return res.data
}

export async function sendVerificationCode(email: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/api/auth/send-code", { email })
  return res.data
}

export async function verifyEmail(email: string, code: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/verify-email", { email, code })
  return res.data
}

export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/api/auth/reset-password", {
    email,
    code,
    new_password: newPassword,
  })
  return res.data
}

export async function getMe(): Promise<AuthUser> {
  const res = await api.get<AuthUser>("/api/auth/me")
  return res.data
}

export async function refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string; token_type: string }> {
  const res = await api.post("/api/auth/refresh", { refresh_token: refreshToken })
  return res.data
}

// ── OAuth (Google & Apple) ─────────────────────────────────────────────────

export async function oauthGoogle(idToken: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/oauth/google", { id_token: idToken })
  return res.data
}

export async function oauthApple(identityToken: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/oauth/apple", { id_token: identityToken })
  return res.data
}

// ── Password Reset ──────────────────────────────────────────────────────────

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/api/auth/forgot-password", { email })
  return res.data
}

// ── Profile Settings ────────────────────────────────────────────────────────

export async function updateProfile(displayName: string): Promise<{ id: string; email: string; display_name: string | null }> {
  const res = await api.put("/api/users/profile", { display_name: displayName })
  return res.data
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await api.put("/api/users/password", { old_password: oldPassword, new_password: newPassword })
  return res.data
}

export async function deleteAccount(password: string): Promise<{ message: string }> {
  const res = await api.delete("/api/auth/delete-account", { data: { password } })
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
  const res = await api.post<CreateOrderResult>("/api/payments/create-order", data)
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

export async function createCheckoutUrl(readingId: string, paymentMethod: string): Promise<{ checkout_url?: string; pay_url?: string; approve_url?: string; code_url?: string; payment_method: string; message: string }> {
  // 根据支付方式调用不同接口
  if (paymentMethod === "alipay") {
    const res = await apiDirect.post(`/api/payments/alipay/create`, null, {
      params: { amount: 69, subject: "命盘智镜高级会员", reading_id: readingId }
    })
    return { pay_url: res.data.pay_url, payment_method: "alipay", message: res.data.message }
  } else if (paymentMethod === "wechat_pay") {
    const res = await apiDirect.post(`/api/payments/wechat/create`, null, {
      params: { amount: 69, description: "命盘智镜高级会员", reading_id: readingId }
    })
    return { code_url: res.data.code_url, payment_method: "wechat_pay", message: res.data.message }
  } else if (paymentMethod === "paypal") {
    const res = await apiDirect.post(`/api/payments/paypal/create`, null, {
      params: { amount: 9.99, description: "Destiny Mirror Premium", reading_id: readingId }
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
  message: string
}

export async function payEvent(eventId: string, useFreeQuota = true): Promise<PayEventResult> {
  const res = await api.post<PayEventResult>("/api/payments/pay-event", {
    event_id: eventId,
    use_free_quota: useFreeQuota,
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
  master:    { icon: "🌟", label: "命盘总览",  color: "text-gold" },
}

// ── Event Analyzer (事件复盘) ────────────────────────────────────────────────

export interface AnalyzeEventRequest {
  session_id: string
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
  energy_score: number
  yi: string[]
  ji: string[]
  hu: { product: Product; reason: string }[]
  daily_quote: string
}

export async function analyzeEvent(data: AnalyzeEventRequest): Promise<AnalyzeEventResponse> {
  const res = await api.post<AnalyzeEventResponse>("/api/readings/analyze-event", data, { timeout: 180_000 })
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

export async function getDailyAlmanac(sessionId: string): Promise<DailyAlmanacResponse> {
  const res = await api.get<DailyAlmanacResponse>("/api/readings/daily-almanac", { params: { session_id: sessionId }, timeout: 30_000 })
  return res.data
}

// ── My Readings (P1-1) ────────────────────────────────────────────────────

export interface ReadingListItem {
  id: string
  status: string
  master_summary: string
  computed_tags: string[]
  dimension_scores: Record<string, number>
  is_detail_unlocked: boolean
  created_at: string
  completed_at: string | null
}

export async function listMyReadings(): Promise<ReadingListItem[]> {
  const res = await api.get<ReadingListItem[]>("/api/readings/my")
  return res.data
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
  const res = await api.post<ProductReview>(`/api/products/${productId}/reviews`, data)
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
}

export async function getDailyFortune(): Promise<DailyFortuneResponse> {
  const res = await api.get<DailyFortuneResponse>("/api/readings/daily-fortune")
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