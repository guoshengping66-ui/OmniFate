"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

declare global {
  interface Window {
    google?: any
    AppleID?: any
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { login, loginWithOAuth } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null)

  // ── Google Identity Services ──
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) return

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      })
    }
    document.head.appendChild(script)
  }, [])

  const handleGoogleCredential = useCallback(async (response: { credential: string }) => {
    setOauthLoading("google")
    try {
      await loginWithOAuth("google", response.credential)
      toast.success(t("auth.loginSuccess"))
      router.replace("/")
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? t("auth.loginFail")
      toast.error(detail)
    } finally {
      setOauthLoading(null)
    }
  }, [loginWithOAuth, router, t])

  // ── Apple Sign In ──
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID
    if (!clientId) return

    const script = document.createElement("script")
    script.src = "https://appleid.apple.com/auth//appleid.auth.js"
    script.async = true
    script.onload = () => {
      window.AppleID?.auth.init({
        clientId: clientId,
        scope: "name email",
        redirectURI: window.location.origin,
        usePopup: true,
      })
    }
    document.head.appendChild(script)

    // Listen for Apple auth response
    const handler = (e: any) => {
      if (e.detail?.user) {
        handleAppleAuth(e.detail)
      }
    }
    window.addEventListener("AppleIDSignInOnSuccess" as any, handler)
    return () => window.removeEventListener("AppleIDSignInOnSuccess" as any, handler)
  }, [])

  const handleAppleAuth = useCallback(async (data: { user?: any; authorization: any }) => {
    setOauthLoading("apple")
    try {
      const idToken = data.authorization?.id_token
      if (!idToken) throw new Error("No token")
      await loginWithOAuth("apple", idToken)
      toast.success(t("auth.loginSuccess"))
      router.replace("/")
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? t("auth.loginFail")
      toast.error(detail)
    } finally {
      setOauthLoading(null)
    }
  }, [loginWithOAuth, router, t])

  const triggerGoogleLogin = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
    }
  }

  const triggerAppleLogin = () => {
    if (window.AppleID?.auth) {
      window.AppleID.auth.signIn()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error(t("auth.fillEmailPassword"))
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      toast.success(t("auth.loginSuccess"))
      router.replace("/")
    } catch (err: any) {
      if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        toast.error(t("auth.noNetwork"))
      } else {
        const detail = err?.response?.data?.detail ?? t("auth.loginFail")
        toast.error(detail)
      }
    } finally {
      setLoading(false)
    }
  }

  const hasGoogle = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const hasApple = !!process.env.NEXT_PUBLIC_APPLE_CLIENT_ID

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Sparkles className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold">{t("auth.loginTitle")}</h1>
          <p className="text-white/40 text-sm mt-1">{t("auth.loginSubtitle")}</p>
        </div>

        {/* OAuth Buttons */}
        {(hasGoogle || hasApple) && (
          <div className="card-glass p-6 md:p-8 space-y-3 mb-4">
            {hasGoogle && (
              <button
                onClick={triggerGoogleLogin}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-50"
              >
                {oauthLoading === "google" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                )}
                <span>{t("auth.loginWithGoogle")}</span>
              </button>
            )}
            {hasApple && (
              <button
                onClick={triggerAppleLogin}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-50"
              >
                {oauthLoading === "apple" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                )}
                <span>{t("auth.loginWithApple")}</span>
              </button>
            )}

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-transparent text-white/30">{t("auth.or")}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-glass p-6 md:p-8 space-y-5">
          <div>
            <label className="label">{t("auth.email")}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-field"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">{t("auth.password")}</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                className="input-field pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> {t("auth.loggingIn")}</> : t("auth.login")}
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-gold/60 hover:text-gold">
              {t("auth.forgotPassword")}
            </Link>
            <p className="text-white/40">
              {t("auth.noAccount")}{" "}
              <Link href="/register" className="text-gold hover:underline">
                {t("auth.registerNow")}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
