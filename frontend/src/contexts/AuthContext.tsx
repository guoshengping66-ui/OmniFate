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
    const interceptor1 = api.interceptors.request.use(attachToken)
    const interceptor2 = apiDirect.interceptors.request.use(attachToken)
    return () => {
      api.interceptors.request.eject(interceptor1)
      apiDirect.interceptors.request.eject(interceptor2)
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
