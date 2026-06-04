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

const USER_CACHE_KEY = "alpha_mirror_user" // Cached user for instant restore after reload

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // INSTANT restore from cache — no API call needed
    // This prevents "logged out" flash during language switch or page reload
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  // Helper: save user to cache
  const cacheUser = (u: AuthUser | null) => {
    try {
      if (u) {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u))
      } else {
        localStorage.removeItem(USER_CACHE_KEY)
      }
    } catch { /* ignore quota errors */ }
  }

  // Helper: check if error is a definitive auth failure (should clear state)
  const isAuthFailure = (err: any): boolean => {
    const status = err?.response?.status
    // 401/403 = token definitely invalid → clear
    // Network errors / timeouts = keep cached user, retry later
    return status === 401 || status === 403
  }

  // Helper: refresh token and fetch user data
  const refreshAndFetchUser = async (): Promise<boolean> => {
    try {
      // Refresh via cookie — backend reads refresh_token cookie automatically
      const r = await apiAuth.post("/api/auth/refresh", {})
      // New tokens are set as cookies by the backend
      const meRes = await apiAuth.get("/api/auth/me")
      setUser(meRes.data)
      cacheUser(meRes.data)
      return true
    } catch {
      return false
    }
  }

  // On mount, check if user is authenticated via cookie and fetch user data
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await apiAuth.get("/api/auth/me")
        setUser(res.data)
        cacheUser(res.data)
      } catch (err: any) {
        const isNetwork = err?.code === "ERR_NETWORK" || err?.code === "ECONNABORTED" || !err?.response
        if (!isNetwork && isAuthFailure(err)) {
          // Try refresh if cookies exist
          const ok = await refreshAndFetchUser()
          if (!ok) {
            localStorage.removeItem(USER_CACHE_KEY)
            setUser(null)
          }
        }
        // Network errors: keep cached user
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  // Set up axios interceptors for 401 handling (auto-refresh via cookies)
  useEffect(() => {
    // Tag requests with source client for retry
    const makeTagSource = (client: typeof api) => (config: any) => {
      config._sourceClient = client
      return config
    }

    // Response interceptor: handle 401 by refreshing token and retrying
    let isRefreshing = false
    let failedQueue: Array<{ resolve: Function; reject: Function }> = []

    const processQueue = (error: any) => {
      failedQueue.forEach(prom => {
        if (error) {
          prom.reject(error)
        } else {
          prom.resolve()
        }
      })
      failedQueue = []
    }

    const clearAuth = () => {
      localStorage.removeItem(USER_CACHE_KEY)
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
          return (originalRequest._sourceClient || api)(originalRequest)
        }).catch(err => {
          clearAuth()
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Refresh via cookie — backend reads refresh_token cookie
        await apiAuth.post("/api/auth/refresh", {})
        processQueue(null)
        return (originalRequest._sourceClient || api)(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        clearAuth()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    const interceptor1 = api.interceptors.request.use(makeTagSource(api))
    const interceptor2 = apiDirect.interceptors.request.use(makeTagSource(apiDirect))
    const interceptor3 = apiAuth.interceptors.request.use(makeTagSource(apiAuth))
    const responseInterceptor1 = api.interceptors.response.use(response => response, handle401)
    const responseInterceptor2 = apiDirect.interceptors.response.use(response => response, handle401)
    const responseInterceptor3 = apiAuth.interceptors.response.use(response => response, handle401)
    return () => {
      api.interceptors.request.eject(interceptor1)
      apiDirect.interceptors.request.eject(interceptor2)
      apiAuth.interceptors.request.eject(interceptor3)
      api.interceptors.response.eject(responseInterceptor1)
      apiDirect.interceptors.response.eject(responseInterceptor2)
      apiAuth.interceptors.response.eject(responseInterceptor3)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiAuth.post("/api/auth/login", { email, password })
    const data = res.data
    // Tokens are set as httpOnly cookies by the backend
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
    // Register endpoint returns { message, email } — no tokens yet.
    // User must verify email first, then the verify-email endpoint returns tokens.
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiAuth.post("/api/auth/logout")
    } catch {
      // Ignore — clear local state regardless
    }
    localStorage.removeItem(USER_CACHE_KEY)
    localStorage.removeItem("alpha_mirror_profiles")
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

  // Memoize context value — prevents unnecessary re-renders of ALL consumers
  // (Navbar, CartProviderWithAuth, etc.) when only one field changes
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
