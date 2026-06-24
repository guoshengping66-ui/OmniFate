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
  // Stardust
  stardust_balance?: number
  stardust_lifetime_earned?: number
  // Founder
  is_founder?: boolean
  founder_seat_no?: number
  founder_region?: string
  // Referral
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
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
})

const USER_CACHE_KEY = "alpha_mirror_user"
const ACCESS_TOKEN_KEY = "alpha_mirror_access_token"
const REFRESH_TOKEN_KEY = "alpha_mirror_refresh_token"

// ── Token helpers (sessionStorage) ────────────────────────────────────────
function getAccessToken(): string | null {
  try { return sessionStorage.getItem(ACCESS_TOKEN_KEY) } catch { return null }
}
function getRefreshToken(): string | null {
  try { return sessionStorage.getItem(REFRESH_TOKEN_KEY) } catch { return null }
}
function storeTokens(access: string, refresh: string) {
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, access)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  } catch { /* ignore */ }
}
function clearTokens() {
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch { /* ignore */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore cached user AFTER hydration
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(USER_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached) as AuthUser
        setUser(parsed)
      }
    } catch { /* ignore */ }
  }, [])

  const cacheUser = (u: AuthUser | null) => {
    try {
      if (u) {
        sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(u))
      } else {
        sessionStorage.removeItem(USER_CACHE_KEY)
      }
    } catch { /* ignore */ }
  }

  const isAuthFailure = (err: any): boolean => {
    const status = err?.response?.status
    return status === 401 || status === 403
  }

  // ── Refresh token and fetch user ─────────────────────────────────────────
  const refreshAndFetchUser = async (): Promise<boolean> => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false
    try {
      // Send refresh_token in body (backend reads from body OR cookie)
      const r = await apiAuth.post("/api/auth/refresh", { refresh_token: refreshToken })
      // Store new tokens
      storeTokens(r.data.access_token, r.data.refresh_token)
      // Fetch user with new access token
      const meRes = await apiAuth.get("/api/auth/me")
      setUser(meRes.data)
      cacheUser(meRes.data)
      return true
    } catch {
      clearTokens()
      return false
    }
  }

  // ── Init auth on mount ───────────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = getAccessToken()
      if (!accessToken) {
        // No token — definitely logged out
        setLoading(false)
        return
      }
      try {
        const res = await apiAuth.get("/api/auth/me")
        setUser(res.data)
        cacheUser(res.data)
      } catch (err: any) {
        const isNetwork = err?.code === "ERR_NETWORK" || err?.code === "ECONNABORTED" || !err?.response
        if (!isNetwork && isAuthFailure(err)) {
          // Access token expired — try refresh
          const ok = await refreshAndFetchUser()
          if (!ok) {
            clearTokens()
            sessionStorage.removeItem(USER_CACHE_KEY)
            setUser(null)
          }
        }
        // Network errors: keep cached user, retry later
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  // ── Axios interceptors: Bearer token + auto-refresh ──────────────────────
  useEffect(() => {
    // Request interceptor: attach Bearer token to all requests
    const requestInterceptor = (config: any) => {
      const token = getAccessToken()
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
      config._sourceClient = config._sourceClient || api
      return config
    }

    // Response interceptor: handle 401 → refresh → retry
    let isRefreshing = false
    let failedQueue: Array<{ resolve: Function; reject: Function }> = []

    const processQueue = (error: any) => {
      failedQueue.forEach(prom => {
        if (error) prom.reject(error)
        else prom.resolve()
      })
      failedQueue = []
    }

    const clearAuth = () => {
      clearTokens()
      sessionStorage.removeItem(USER_CACHE_KEY)
      setUser(null)
    }

    const handle401 = async (error: any) => {
      const originalRequest = error?.config
      if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error)
      }

      // Skip refresh for auth endpoints
      const skipPaths = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/verify-email"]
      if (skipPaths.some(p => originalRequest.url?.includes(p))) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          // Retry with new token (interceptor will attach it)
          return (originalRequest._sourceClient || api)(originalRequest)
        }).catch(err => {
          clearAuth()
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) {
          clearAuth()
          return Promise.reject(error)
        }
        // Refresh via Bearer token in body
        const r = await apiAuth.post("/api/auth/refresh", { refresh_token: refreshToken })
        storeTokens(r.data.access_token, r.data.refresh_token)
        processQueue(null)
        // Retry original request (interceptor will attach new access token)
        return (originalRequest._sourceClient || api)(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        clearAuth()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    const i1 = api.interceptors.request.use(requestInterceptor)
    const i2 = apiDirect.interceptors.request.use(requestInterceptor)
    const i3 = apiAuth.interceptors.request.use(requestInterceptor)
    const r1 = api.interceptors.response.use(response => response, handle401)
    const r2 = apiDirect.interceptors.response.use(response => response, handle401)
    const r3 = apiAuth.interceptors.response.use(response => response, handle401)
    return () => {
      api.interceptors.request.eject(i1)
      apiDirect.interceptors.request.eject(i2)
      apiAuth.interceptors.request.eject(i3)
      api.interceptors.response.eject(r1)
      apiDirect.interceptors.response.eject(r2)
      apiAuth.interceptors.response.eject(r3)
    }
  }, [])

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await apiAuth.post("/api/auth/login", { email, password })
    const data = res.data
    // Store tokens from response body (survives proxy/cookie issues)
    if (data.access_token && data.refresh_token) {
      storeTokens(data.access_token, data.refresh_token)
    }
    setUser(data.user)
    cacheUser(data.user)
  }, [])

  const register = useCallback(async (email: string, password: string, displayName?: string, birthData?: RegisterBirthData) => {
    const res = await apiAuth.post("/api/auth/register", {
      email,
      password,
      display_name: displayName,
      birth_data: birthData || undefined,
    })
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiAuth.post("/api/auth/logout")
    } catch {
      // Ignore — clear local state regardless
    }
    clearTokens()
    sessionStorage.removeItem(USER_CACHE_KEY)
    sessionStorage.removeItem("alpha_mirror_profiles")
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiAuth.get("/api/auth/me")
      setUser(res.data)
      cacheUser(res.data)
    } catch {
      // ignore
    }
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
