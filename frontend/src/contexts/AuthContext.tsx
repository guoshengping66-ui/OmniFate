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
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, access)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  } catch {}
}
function clearTokens() {
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
      if (!refreshToken) return false
      const r = await apiAuth.post("/api/auth/refresh", { refresh_token: refreshToken })
      storeTokens(r.data.access_token, r.data.refresh_token)
      return true
    } catch {
      clearTokens()
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
      if (!accessToken) { setLoading(false); return }

      try {
        // Try with current access token
        const res = await apiAuth.get("/api/auth/me")
        setUser(res.data)
        cacheUser(res.data)
      } catch (err: any) {
        const status = err?.response?.status
        if (status === 401 || status === 403) {
          // Access token expired — try refresh
          const ok = await tryRefreshToken()
          if (ok) {
            try {
              const res = await apiAuth.get("/api/auth/me")
              setUser(res.data)
              cacheUser(res.data)
            } catch {
              clearAuth()
            }
          } else {
            clearAuth()
          }
        }
        // Network errors: keep cached user
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
    const resInterceptor = async (error: any) => {
      const originalRequest = error?.config
      if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error)
      }

      // Skip refresh for auth endpoints
      const skipPaths = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/verify-email"]
      if (skipPaths.some(p => originalRequest.url?.includes(p))) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      const ok = await tryRefreshToken()
      if (ok) {
        // Token refreshed — retry original request
        // The reqInterceptor will attach the NEW token from sessionStorage
        return (originalRequest._sourceClient || api)(originalRequest)
      }

      // Refresh failed — clear auth
      clearAuth()
      return Promise.reject(error)
    }

    const i1 = api.interceptors.request.use(reqInterceptor)
    const i2 = apiDirect.interceptors.request.use(reqInterceptor)
    const i3 = apiAuth.interceptors.request.use(reqInterceptor)
    const r1 = api.interceptors.response.use(r => r, resInterceptor)
    const r2 = apiDirect.interceptors.response.use(r => r, resInterceptor)
    const r3 = apiAuth.interceptors.response.use(r => r, resInterceptor)

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
    setUser(data.user)
    cacheUser(data.user)
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
