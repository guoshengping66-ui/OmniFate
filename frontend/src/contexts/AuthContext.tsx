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

// NOTE: Access and refresh tokens are NO LONGER stored in sessionStorage.
// They are set by the backend as httpOnly, Secure, SameSite=Lax cookies
// (see backend/api/routers/auth.py:_set_auth_cookies).
// The frontend axios instances use `withCredentials: true` to send these
// cookies automatically. This eliminates the XSS token-exfiltration vector
// — even if an XSS vulnerability exists, tokens cannot be read by JS.

function storeTokens(_access: string, _refresh: string) {
  // Tokens are cookie-only — sessionStorage is no longer used for credentials.
  // This function is kept as a no-op for backward compatibility with callers
  // (login page, Google OAuth handler) that still pass tokens.
}
function clearTokens() {
  // Cookies are cleared by POST /api/auth/logout on the backend.
  // sessionStorage cleanup happens via clearAuth() → removeItem(USER_CACHE_KEY).
}

// ── Global token refresh (shared across all instances) ───────────────────
let _refreshPromise: Promise<boolean> | null = null

async function tryRefreshToken(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise

  _refreshPromise = (async () => {
    try {
      // Refresh token is sent via httpOnly cookie (withCredentials: true)
      // Backend reads refresh_token from cookie when body is empty
      const r = await apiAuth.post("/api/auth/refresh", {})
      // Backend sets new tokens as httpOnly cookies in the response
      return true
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401 || status === 403) {
        clearTokens()
      }
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
  // Uses httpOnly cookie-based auth — no tokens in sessionStorage.
  // Calls /api/auth/me to verify the session; cookies are sent automatically
  // via withCredentials: true on the axios instance.
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await apiAuth.get("/api/auth/me")
        setUser(res.data)
        cacheUser(res.data)
      } catch (err: any) {
        const status = err?.response?.status
        const isNetworkError = !err?.response && !!err?.code

        if (status === 401 || status === 403) {
          if (!err?.config?._retry) {
            const ok = await tryRefreshToken()
            if (ok) {
              try {
                const retryRes = await apiAuth.get("/api/auth/me")
                setUser(retryRes.data)
                cacheUser(retryRes.data)
              } catch {
                clearAuth()
              }
            } else {
              clearAuth()
            }
          } else {
            clearAuth()
          }
        } else if (isNetworkError || (status && status >= 500)) {
          // Network or server error — keep cached user if available
          const cached = sessionStorage.getItem(USER_CACHE_KEY)
          if (cached) {
            try { setUser(JSON.parse(cached) as AuthUser) } catch {}
          }
        }
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [clearAuth])

  // ── Axios interceptors ───────────────────────────────────────────────────
  // NOTE: Authentication is cookie-based (httpOnly cookies set by backend).
  // The `withCredentials: true` on all axios instances sends cookies
  // automatically. No manual Authorization header is needed — the backend
  // reads tokens from cookies when no Bearer header is present.
  // We still set the interceptor as a no-op for backward compatibility
  // with any code that manually sets Authorization. The backend prefers
  // Bearer header over cookie, so this is safe.
  useEffect(() => {
    const reqInterceptor = (config: any) => {
      // No-op: auth is handled by httpOnly cookies via withCredentials: true
      return config
    }

    function makeResInterceptor(client: typeof api) {
      return async (error: any) => {
        const originalRequest = error?.config
        if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error)
        }

        const skipPaths = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/verify-email"]
        if (skipPaths.some(p => originalRequest.url?.includes(p))) {
          return Promise.reject(error)
        }

        originalRequest._retry = true

        const ok = await tryRefreshToken()
        if (ok) {
          try {
            return await client(originalRequest)
          } catch {
            return Promise.reject(error)
          }
        }

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
    if (data.access_token && data.refresh_token) {
      storeTokens(data.access_token, data.refresh_token)
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
