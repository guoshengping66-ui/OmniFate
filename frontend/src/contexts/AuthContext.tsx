"use client"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { api, apiDirect, type RegisterBirthData } from "@/lib/api"

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

const TOKEN_KEY = "alpha_mirror_token"
const REFRESH_KEY = "alpha_mirror_refresh"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, try to restore session from stored token
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      api.get("/api/auth/me")
        .then(res => setUser(res.data))
        .catch(() => {
          // Token expired — try refresh
          const refreshToken = localStorage.getItem(REFRESH_KEY)
          if (refreshToken) {
            return api.post("/api/auth/refresh", { refresh_token: refreshToken })
              .then(r => {
                localStorage.setItem(TOKEN_KEY, r.data.access_token)
                localStorage.setItem(REFRESH_KEY, r.data.refresh_token)
                return api.get("/api/auth/me")
              })
              .then(r => setUser(r?.data ?? null))
              .catch(() => {
                localStorage.removeItem(TOKEN_KEY)
                localStorage.removeItem(REFRESH_KEY)
              })
          } else {
            localStorage.removeItem(TOKEN_KEY)
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Set up axios interceptors for JWT on both API instances
  useEffect(() => {
    const attachToken = (config: any) => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    }

    // Response interceptor: handle 401 by refreshing token and retrying
    let isRefreshing = false
    let failedQueue: Array<{ resolve: Function; reject: Function }> = []

    const processQueue = (error: any, token: string | null = null) => {
      failedQueue.forEach(prom => {
        if (error) {
          prom.reject(error)
        } else {
          prom.resolve(token)
        }
      })
      failedQueue = []
    }

    const handle401 = async (error: any) => {
      const originalRequest = error.config
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error)
      }

      // Skip refresh for login/register/refresh endpoints
      const skipPaths = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/verify-email"]
      if (skipPaths.some(p => originalRequest.url?.includes(p))) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem(REFRESH_KEY)
      if (!refreshToken) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_KEY)
        setUser(null)
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const res = await apiDirect.post("/api/auth/refresh", { refresh_token: refreshToken })
        const newToken = res.data.access_token
        localStorage.setItem(TOKEN_KEY, newToken)
        localStorage.setItem(REFRESH_KEY, res.data.refresh_token)
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_KEY)
        setUser(null)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    const interceptor1 = api.interceptors.request.use(attachToken)
    const interceptor2 = apiDirect.interceptors.request.use(attachToken)
    const responseInterceptor1 = api.interceptors.response.use(
      response => response,
      handle401
    )
    const responseInterceptor2 = apiDirect.interceptors.response.use(
      response => response,
      handle401
    )
    return () => {
      api.interceptors.request.eject(interceptor1)
      apiDirect.interceptors.request.eject(interceptor2)
      api.interceptors.response.eject(responseInterceptor1)
      apiDirect.interceptors.response.eject(responseInterceptor2)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post("/api/auth/login", { email, password })
    const data = res.data
    localStorage.setItem(TOKEN_KEY, data.access_token)
    localStorage.setItem(REFRESH_KEY, data.refresh_token)
    setUser(data.user)
  }, [])

  const register = useCallback(async (email: string, password: string, displayName?: string, birthData?: RegisterBirthData) => {
    const res = await api.post("/api/auth/register", {
      email,
      password,
      display_name: displayName,
      birth_data: birthData || undefined,
    })
    // Register endpoint returns { message, email } — no tokens yet.
    // User must verify email first, then the verify-email endpoint returns tokens.
    // So we just return the message; the register page handles the flow.
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/api/auth/me")
      setUser(res.data)
    } catch {
      // ignore
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
