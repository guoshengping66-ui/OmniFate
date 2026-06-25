"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, Loader2, Eye, EyeOff, Zap, Layers, Brain } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

const FEATURES = [
  { icon: Zap, color: "#C5A880", key: "speed" },
  { icon: Layers, color: "#5B9BD5", key: "dimensions" },
  { icon: Brain, color: "#9B59B6", key: "knowledge" },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { t, localeHref } = useLanguage()
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
      window.location.href = localeHref("/")
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left: Brand area (desktop: full height, mobile: compact header) ── */}
      <div className="relative lg:flex-1 lg:flex lg:items-center lg:justify-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] md:w-[600px] h-[300px] sm:h-[450px] md:h-[600px] rounded-full bg-[#C5A880]/[0.03] blur-[100px] sm:blur-[140px] md:blur-[180px]" />
          <div className="absolute top-1/3 left-1/4 w-[150px] sm:w-[220px] md:w-[300px] h-[150px] sm:h-[220px] md:h-[300px] rounded-full bg-blue-500/[0.01] blur-[80px] sm:blur-[110px] md:blur-[140px]" />
        </div>

        {/* Mobile: compact brand bar */}
        <div className="lg:hidden pt-24 pb-6 px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/[0.05] backdrop-blur-sm mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
            <span className="text-[#C5A880]/70 text-xs tracking-[0.3em] uppercase font-medium">
              Destiny Engine
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {t("auth.loginTitle")}
            </span>
          </h1>
          <p className="text-white/30 text-xs mt-1">{t("auth.loginSubtitle")}</p>
        </div>

        {/* Desktop: full brand showcase */}
        <div className="hidden lg:block relative z-10 max-w-lg px-12">
          {/* Logo */}
          <div className="mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(197,168,128,0.12), rgba(197,168,128,0.04))",
                border: "1px solid rgba(197,168,128,0.2)",
              }}
            >
              <Sparkles className="text-[#C5A880]" size={28} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl xl:text-4xl font-serif font-bold mb-3 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              命运引擎
            </span>
          </h1>
          <p className="text-white/30 text-sm mb-10 leading-relaxed">
            {t("auth.loginSubtitle")}
          </p>

          {/* Feature bullet points */}
          <div className="space-y-5">
            {FEATURES.map((feat) => {
              const Icon = feat.icon
              return (
                <div key={feat.key} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${feat.color}15, ${feat.color}08)`,
                      border: `1px solid ${feat.color}25`,
                    }}
                  >
                    <Icon size={18} style={{ color: feat.color }} />
                  </div>
                  <div>
                    <div className="text-white/60 text-sm font-medium">
                      {t(`auth.loginFeatures.${feat.key}`)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Decorative glyphs */}
          <div className="absolute -bottom-10 -right-10 text-8xl font-serif text-[#C5A880]/[0.03] select-none">☯</div>
          <div className="absolute top-10 -right-16 text-6xl font-serif text-[#C5A880]/[0.02] select-none">☰</div>
        </div>
      </div>

      {/* ── Right: Login form ── */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center px-4 py-8 lg:py-0">
        <div className="w-full max-w-sm">
          {/* Mobile: skip extra header (already shown above) */}
          {/* Desktop: show header inside form area */}
          <div className="hidden lg:block text-center mb-8">
            <h2 className="text-2xl font-serif font-bold text-gold">{t("auth.loginTitle")}</h2>
            <p className="text-white/40 text-sm mt-1">{t("auth.loginSubtitle")}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl p-6 md:p-8"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="space-y-5">
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
            </div>

            <p className="text-center text-white/25 text-[10px] mt-4">
              {t("auth.agreeTo")}{" "}
              <a href={localeHref("/privacy")} className="text-gold/50 hover:text-gold underline">{t("auth.privacyPolicy")}</a>
              {" "}{t("auth.and")}{" "}
              <a href={localeHref("/terms")} className="text-gold/50 hover:text-gold underline">{t("auth.termsOfService")}</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

function GoogleLoginButton() {
  const { t, localeHref } = useLanguage()
  const googleBtnRef = useRef<HTMLDivElement>(null)
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const nonceRef = useRef<string>("")

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    // Generate CSRF nonce for Google OAuth.
    // Stored only in-memory (nonceRef) — NOT in sessionStorage to prevent XSS exfiltration.
    const nonce = crypto.randomUUID()
    nonceRef.current = nonce

    // Load Google Identity Services script
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          nonce,
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
      const nonce = nonceRef.current  // In-memory only — NOT from sessionStorage
      const result = await api.post("/api/auth/google", {
        credential: response.credential,
        nonce: nonce || undefined,
      })

      // Tokens are now httpOnly cookies set by the backend — no need for
      // sessionStorage. Only cache user data for fast UI hydration.
      const data = result.data
      if (data.user) {
        try {
          sessionStorage.setItem("alpha_mirror_user", JSON.stringify(data.user))
        } catch {}
      }

      toast.success(t("auth.loginSuccess"))
      window.location.href = localeHref("/")
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
