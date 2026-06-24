"use client"
import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { api, apiDirect, apiAuth, type RegisterBirthData } from "@/lib/api"

export interface AuthUser {
  id: string
  email: string
  display_name: string | null
  is_verified: boolean
  is_premium: boolean
  premium_expires_at: string | null
  shop_coupon_balance: number
  subscription_tier: string | null
  free_event_quota?: number
  stardust_balance?: number
  stardust_lifetime_earned?: number
  is_founder?: boolean
  founder_seat_no?: number
  founder_region?: string
  referral_code?: string
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string, birthData?: RegisterBirthData) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null, loading: true,
  login: async () => {}, register: async () => {},
  logout: () => {}, refreshUser: async () => {},
})

const USER_CACHE_KEY = "alpha_mirror_user"
const ACCESS_TOKEN_KEY = "alpha_mirror_access_token"
const REFRESH_TOKEN_KEY = "alpha_mirror_refresh_token"

function getAccessToken(): string | null {
  try { return sessionStorage.getItem(ACCESS_TOKEN_KEY) } catch { return null }
}
function getRefreshToken(): string | null {
  try { return sessionStorage.getItem(REFRESH_TOKEN_KEY) } catch { return null }
}
function storeTokens(access: string, refresh: string) {
  console.log("[Auth] storeTokens: access_len=", access?.length, "refresh_len=", refresh?.length)
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, access)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    // Verify storage succeeded
    const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY)
    console.log("[Auth] storeTokens: verify stored access_len=", stored?.length, "match=", stored === access)
  } catch (e) {
    console.error("[Auth] storeTokens: FAILED to store tokens:", e)
  }
}
function clearTokens() {
  console.log("[Auth] clearTokens called", new Error().stack?.split("\n").slice(1, 4).join(" <- "))
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {}
}

// ── Global token refresh (shared across all instances) ───────────────────
let _refreshPromise: Promise<boolean> | null = null

async function tryRefreshToken(): Promise<boolean> {
  // If a refresh is already in-flight, wait for it
  if (_refreshPromise) return _refreshPromise

  _refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        console.warn("[Auth] tryRefreshToken: no refresh token in sessionStorage — CANNOT REFRESH")
        return false
      }
      console.log("[Auth] tryRefreshToken: calling /api/auth/refresh, refresh_token_len:", refreshToken.length)
      const r = await apiAuth.post("/api/auth/refresh", { refresh_token: refreshToken })
      console.log("[Auth] tryRefreshToken: refresh OK — new access_len:", r.data?.access_token?.length, "new refresh_len:", r.data?.refresh_token?.length)
      storeTokens(r.data.access_token, r.data.refresh_token)
      return true
    } catch (err: any) {
      const status = err?.response?.status
      const detail = err?.response?.data?.detail
      console.warn("[Auth] tryRefreshToken: FAILED — status:", status, "detail:", detail, "msg:", err?.message, "url:", err?.config?.url)
      // Only clear tokens on clear auth failures (401 = invalid refresh token)
      // On network errors (no response), keep tokens — might work next time
      if (status === 401 || status === 403) {
        console.warn("[Auth] tryRefreshToken: clearing tokens due to auth failure")
        clearTokens()
      }
      // Network errors: don't clear tokens (transient failure)
      return false
    } finally {
      _refreshPromise = null
    }
  })()

  return _refreshPromise
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore cached user AFTER hydration
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(USER_CACHE_KEY)
      if (cached) setUser(JSON.parse(cached) as AuthUser)
    } catch {}
  }, [])

  const cacheUser = (u: AuthUser | null) => {
    try {
      if (u) sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(u))
      else sessionStorage.removeItem(USER_CACHE_KEY)
    } catch {}
  }

  const clearAuth = useCallback(() => {
    clearTokens()
    sessionStorage.removeItem(USER_CACHE_KEY)
    setUser(null)
  }, [])

  // ── Init auth on mount ───────────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()
      const hasCachedUser = !!sessionStorage.getItem(USER_CACHE_KEY)

      console.log("[Auth] initAuth: START — access_token exists:", !!accessToken, "access_len:", accessToken?.length, "refresh_token exists:", !!refreshToken, "refresh_len:", refreshToken?.length, "has_cached_user:", hasCachedUser)

      if (!accessToken) {
        console.log("[Auth] initAuth: no access token in sessionStorage — keeping cached user:", hasCachedUser)
        // If we have a cached user but no token, keep the cached user
        // (token may have been cleared by a transient error)
        setLoading(false)
        return
      }

      try {
        console.log("[Auth] initAuth: calling /api/auth/me, token_len=", accessToken.length)
        const res = await apiAuth.get("/api/auth/me")
        console.log("[Auth] initAuth: /api/auth/me OK, user:", res.data?.email, "user_id:", res.data?.id)
        setUser(res.data)
        cacheUser(res.data)
      } catch (err: any) {
        const status = err?.response?.status
        const isNetworkError = !err?.response && !!err?.code
        const errorMsg = err?.message || "unknown"
        const responseDetail = err?.response?.data?.detail
        console.warn("[Auth] initAuth: /api/auth/me FAILED:", { status, errorMsg, responseDetail, url: err?.config?.url, hasCachedUser, retry: err?.config?._retry })

        if (status === 401 || status === 403) {
          // Check if the interceptor already attempted a refresh+retry.
          if (err?.config?._retry) {
            // Interceptor already tried refresh + retry and it failed.
            // The interceptor may have already called clearAuth().
            // Only clear if tokens are still present (interceptor didn't clear).
            const stillHasTokens = !!getAccessToken()
            console.warn("[Auth] initAuth: interceptor already retried, still_has_tokens:", stillHasTokens)
            if (stillHasTokens) {
              clearAuth()
            }
            // If interceptor already cleared auth, don't clear again.
          } else {
            // Interceptor didn't handle it (e.g. skipPaths matched) — try manually
            console.log("[Auth] initAuth: attempting manual token refresh...")
            const ok = await tryRefreshToken()
            console.log("[Auth] initAuth: manual refresh result:", ok)
            if (ok) {
              try {
                const retryRes = await apiAuth.get("/api/auth/me")
                console.log("[Auth] initAuth: retry /me OK after refresh, user:", retryRes.data?.email)
                setUser(retryRes.data)
                cacheUser(retryRes.data)
              } catch (retryErr: any) {
                console.error("[Auth] initAuth: retry /me FAILED after refresh:", retryErr?.response?.status)
                clearAuth()
              }
            } else {
              console.warn("[Auth] initAuth: refresh failed, clearing auth")
              clearAuth()
            }
          }
        } else if (isNetworkError) {
          // Network error — keep cached user, just stop loading
          console.warn("[Auth] initAuth: network error, keeping cached user")
        } else if (status === 500 || status === 502 || status === 503) {
          // Server error — keep cached user (don't clear on server issues)
          console.warn("[Auth] initAuth: server error", status, "— keeping cached user")
        } else {
          // Unexpected error — keep cached user
          console.warn("[Auth] initAuth: unexpected error", status, "— keeping cached user")
        }
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [clearAuth])

  // ── Axios interceptors: attach Bearer token + auto-refresh on 401 ───────
  useEffect(() => {
    // Request interceptor: always attach fresh token
    const reqInterceptor = (config: any) => {
      const token = getAccessToken()
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    }

    // Response interceptor: catch 401 → refresh → retry ONCE
    // Each client gets its own interceptor so the retry uses the SAME client
    // that made the original request (preserving its interceptors/config).
    function makeResInterceptor(client: typeof api) {
      return async (error: any) => {
        const originalRequest = error?.config
        if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error)
        }

        // Skip refresh for auth endpoints (login/register/refresh/verify)
        const skipPaths = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/verify-email"]
        if (skipPaths.some(p => originalRequest.url?.includes(p))) {
          return Promise.reject(error)
        }

        console.log("[Auth] interceptor: 401 on", originalRequest.url, "— attempting refresh", "has_refresh_token:", !!getRefreshToken(), "refresh_len:", getRefreshToken()?.length)
        originalRequest._retry = true

        const ok = await tryRefreshToken()
        if (ok) {
          console.log("[Auth] interceptor: refresh OK, new access_len:", getAccessToken()?.length, "new refresh_len:", getRefreshToken()?.length, "retrying:", originalRequest.url)
          // Token refreshed — retry with the SAME client that made the original
          // request so its specific interceptors (CSRF, lang, etc.) are applied.
          // The reqInterceptor will re-read the NEW token from sessionStorage.
          try {
            return await client(originalRequest)
          } catch (retryErr: any) {
            // Retry failed (network error etc.) — propagate the original 401
            console.warn("[Auth] interceptor: retry after refresh FAILED:", retryErr?.message, retryErr?.response?.status)
            return Promise.reject(error)
          }
        }

        console.warn("[Auth] interceptor: refresh FAILED — clearing auth. refresh_token_exists:", !!getRefreshToken(), "access_token_exists:", !!getAccessToken())
        // Refresh failed — clear auth
        clearAuth()
        return Promise.reject(error)
      }
    }

    const i1 = api.interceptors.request.use(reqInterceptor)
    const i2 = apiDirect.interceptors.request.use(reqInterceptor)
    const i3 = apiAuth.interceptors.request.use(reqInterceptor)
    const r1 = api.interceptors.response.use(r => r, makeResInterceptor(api))
    const r2 = apiDirect.interceptors.response.use(r => r, makeResInterceptor(apiDirect))
    const r3 = apiAuth.interceptors.response.use(r => r, makeResInterceptor(apiAuth))

    return () => {
      api.interceptors.request.eject(i1)
      apiDirect.interceptors.request.eject(i2)
      apiAuth.interceptors.request.eject(i3)
      api.interceptors.response.eject(r1)
      apiDirect.interceptors.response.eject(r2)
      apiAuth.interceptors.response.eject(r3)
    }
  }, [clearAuth])

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await apiAuth.post("/api/auth/login", { email, password })
    const data = res.data
    console.log("[Auth] login response keys:", Object.keys(data || {}), "has_access:", !!data.access_token, "has_refresh:", !!data.refresh_token, "has_user:", !!data.user)
    if (data.access_token && data.refresh_token) {
      storeTokens(data.access_token, data.refresh_token)
      console.log("[Auth] login: tokens stored in sessionStorage, access_len=", data.access_token.length)
      // Decode the token to log its expiry for debugging
      try {
        const payload = JSON.parse(atob(data.access_token.split(".")[1]))
        console.log("[Auth] login: access_token exp:", new Date(payload.exp * 1000).toISOString(), "sub:", payload.sub)
      } catch {}
      try {
        const payload = JSON.parse(atob(data.refresh_token.split(".")[1]))
        console.log("[Auth] login: refresh_token exp:", new Date(payload.exp * 1000).toISOString(), "sub:", payload.sub)
      } catch {}
    } else {
      console.warn("[Auth] login: NO tokens in response body! Keys:", Object.keys(data || {}))
    }
    if (data.user) {
      setUser(data.user)
      cacheUser(data.user)
    }
  }, [])

  const register = useCallback(async (email: string, password: string, displayName?: string, birthData?: RegisterBirthData) => {
    const res = await apiAuth.post("/api/auth/register", {
      email, password, display_name: displayName,
      birth_data: birthData || undefined,
    })
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try { await apiAuth.post("/api/auth/logout") } catch {}
    clearAuth()
    sessionStorage.removeItem("alpha_mirror_profiles")
  }, [clearAuth])

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiAuth.get("/api/auth/me")
      setUser(res.data)
      cacheUser(res.data)
    } catch {}
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
