"use client"
export const dynamic = "force-dynamic"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Radar, ShieldCheck, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth, storeTokens } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { EasternCard, EasternPageShell, FiveDimensionOrbit } from "@/components/brand/EasternDesign"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; nonce?: string }) => void
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

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
      router.push(localeHref("/dashboard"))
    } catch (err: any) {
      console.error("[Login] error:", err)
      if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED" || err.message?.includes("Network Error")) {
        toast.error(t("auth.noNetwork"))
      } else if (err?.response) {
        const status = err.response.status
        const detail = err.response.data?.detail
        if (status === 403) toast.error(detail ?? t("auth.unverified"), { duration: 8000 })
        else if (status === 429) toast.error(detail ?? t("auth.rateLimited"))
        else if (status === 502 || status === 504) toast.error(t("auth.serverTimeout"))
        else if (status === 503) toast.error(detail ?? t("auth.serverUnavailable"))
        else if (status >= 500) toast.error(detail ?? t("auth.serverError"))
        else toast.error(detail ?? t("auth.loginFail"))
      } else {
        toast.error(err?.message ? `${t("auth.noNetwork")} (${err.message})` : t("auth.loginFail"))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <EasternPageShell>
      <div className="mx-auto grid min-h-screen w-full max-w-[1180px] items-center gap-8 px-4 pb-12 pt-24 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[620px] overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#030918] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(214,182,90,0.14),transparent_24%),radial-gradient(circle_at_25%_70%,rgba(61,139,121,0.16),transparent_32%)]" />
          <FiveDimensionOrbit
            labels={["Daily Action", "Life Report", "Relationships", "Archive", "Pattern State"]}
            center="Inner Atlas"
          />

          <EasternCard className="absolute left-8 top-8 max-w-sm p-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
              <ShieldCheck size={14} />
              Secure Personal Archive
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-[var(--color-text-primary)]">
              Continue your AI life atlas
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              Sign in to view daily action, saved reports, relationship readings, and your personal pattern history.
            </p>
          </EasternCard>

          <EasternCard className="absolute bottom-8 right-8 max-w-xs p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">Today</p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              One clear action, recalculated from your profile and today's signal.
            </p>
          </EasternCard>
        </section>

        <section className="min-w-0">
          <div className="mb-7 text-center lg:hidden">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-gold-soft)] bg-[rgba(200,168,74,0.08)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
              <Sparkles size={13} />
              Inner Atlas AI
            </p>
            <h1 className="mx-auto max-w-[320px] text-3xl font-semibold leading-tight text-[var(--color-text-primary)]">
              Continue your life atlas
            </h1>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">Sign in to view daily action and reports.</p>
          </div>

          <EasternCard className="mx-auto w-full max-w-[342px] p-6 md:max-w-[420px] md:p-8">
            <div className="mb-7 hidden text-center lg:block">
              <LockKeyhole className="mx-auto text-[var(--color-gold)]" size={28} />
              <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">Sign in</h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Access your reports, daily action board, and saved analysis.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.passwordPlaceholder")}
                    className="input-field pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="ow-gold-button w-full">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-white/35">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <GoogleLoginButton />

              <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <Link href={localeHref("/forgot-password")} className="text-[var(--color-gold)] hover:underline">
                  Forgot password?
                </Link>
                <p className="text-white/45">
                  New here?{" "}
                  <Link href={localeHref("/register")} className="text-[var(--color-gold)] hover:underline">
                    Create account
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#060E24] p-4">
              <p className="flex items-center gap-2 text-xs leading-6 text-white/45">
                <Radar size={14} className="text-[var(--color-gold)]" />
                By signing in, you agree to the terms and privacy policy.
              </p>
              <p className="mt-2 text-xs text-white/35">
                <a href={localeHref("/privacy")} className="text-[var(--color-gold)] hover:underline">Privacy Policy</a>
                {" / "}
                <a href={localeHref("/terms")} className="text-[var(--color-gold)] hover:underline">Terms of Service</a>
              </p>
            </div>
          </EasternCard>
        </section>
      </div>
    </EasternPageShell>
  )
}

function GoogleLoginButton() {
  const { t, localeHref } = useLanguage()
  const googleBtnRef = useRef<HTMLDivElement>(null)
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const nonceRef = useRef<string>("")

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const nonce = crypto.randomUUID()
    nonceRef.current = nonce

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
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existingScript) existingScript.remove()
    }
  }, [])

  const handleGoogleResponse = async (response: any) => {
    try {
      const { api } = await import("@/lib/api")
      const nonce = nonceRef.current
      const result = await api.post("/api/auth/google", {
        credential: response.credential,
        nonce: nonce || undefined,
      })

      const data = result.data
      if (data.user) {
        try {
          sessionStorage.setItem("alpha_mirror_user", JSON.stringify(data.user))
        } catch {}
        if (data.access_token) {
          storeTokens(data.access_token, data.refresh_token || "")
        }
      }

      toast.success(t("auth.loginSuccess"))
      window.location.href = localeHref("/dashboard")
    } catch (err: any) {
      console.error("[Google Login] error:", err)
      toast.error(err?.response?.data?.detail ?? t("auth.loginFail"))
    }
  }

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div ref={googleBtnRef} className="flex w-full justify-center" style={{ minHeight: 44 }}>
      {!googleLoaded && (
        <div className="w-full rounded-full border border-white/10 bg-[#060E24] py-3 text-center text-sm text-white/45">
          Google sign in
        </div>
      )}
    </div>
  )
}
