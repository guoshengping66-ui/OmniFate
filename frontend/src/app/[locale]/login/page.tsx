"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

// Google Client ID — replace with your actual Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = ""  // TODO: Set this in env or hardcode here

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

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
      // Use window.location for instant full-page reload instead of client-side navigation
      // This avoids the slow RSC payload fetch and re-render cycle
      window.location.href = "/"
    } catch (err: any) {
      console.error("[Login] error:", err)
      if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED" || err.message?.includes("Network Error")) {
        toast.error(t("auth.noNetwork"))
      } else if (err?.response) {
        const status = err.response.status
        const detail = err.response.data?.detail
        if (status === 403) {
          // Unverified email — backend already sent verification code
          toast.error(detail ?? t("auth.unverified"), { duration: 8000 })
        } else if (status === 429) {
          toast.error(detail ?? t("auth.rateLimited"))
        } else if (status === 502 || status === 504) {
          toast.error(t("auth.serverTimeout"))
        } else if (status === 503) {
          toast.error(detail ?? t("auth.serverUnavailable"))
        } else if (status >= 500) {
          toast.error(detail ?? t("auth.serverError"))
        } else {
          toast.error(detail ?? t("auth.loginFail"))
        }
      } else {
        toast.error(err?.message ? `${t("auth.noNetwork")} (${err.message})` : t("auth.loginFail"))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Sparkles className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold">{t("auth.loginTitle")}</h1>
          <p className="text-white/40 text-sm mt-1">{t("auth.loginSubtitle")}</p>
        </div>

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

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">{t("auth.or")}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Login Button */}
          <GoogleLoginButton />

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

          <p className="text-center text-white/25 text-[10px] mt-2">
            {t("auth.agreeTo")}{" "}
            <a href="/privacy" className="text-gold/50 hover:text-gold underline">{t("auth.privacyPolicy")}</a>
            {" "}{t("auth.and")}{" "}
            <a href="/terms" className="text-gold/50 hover:text-gold underline">{t("auth.termsOfService")}</a>
          </p>
        </form>
      </div>
    </div>
  )
}

function GoogleLoginButton() {
  const { t } = useLanguage()
  const googleBtnRef = useRef<HTMLDivElement>(null)
  const [googleLoaded, setGoogleLoaded] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    // Load Google Identity Services script
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        })
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
          })
          setGoogleLoaded(true)
        }
      }
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existingScript) existingScript.remove()
    }
  }, [])

  const handleGoogleResponse = async (response: any) => {
    try {
      const { api } = await import("@/lib/api")
      const result = await api.post("/api/auth/google", {
        credential: response.credential,
      })

      // Store tokens
      localStorage.setItem("access_token", result.data.access_token)
      localStorage.setItem("refresh_token", result.data.refresh_token)

      toast.success(t("auth.loginSuccess"))
      window.location.href = "/"
    } catch (err: any) {
      console.error("[Google Login] error:", err)
      toast.error(err?.response?.data?.detail ?? t("auth.loginFail"))
    }
  }

  if (!GOOGLE_CLIENT_ID) {
    return null  // Don't show if not configured
  }

  return (
    <div
      ref={googleBtnRef}
      className="w-full flex justify-center"
      style={{ minHeight: 44 }}
    >
      {!googleLoaded && (
        <div className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-white/30 text-sm text-center">
          Google {t("auth.login")}
        </div>
      )}
    </div>
  )
}
