"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Archive, Eye, EyeOff, Loader2, Radar, ShieldCheck, Sparkles } from "lucide-react"
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
  const { t, locale, localeHref } = useLanguage()
  const isZh = locale === "zh"
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
        if (status === 403) {
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
    <EasternPageShell>
      <div className="mx-auto grid min-h-screen w-[min(1180px,calc(100vw-32px))] items-center gap-8 pb-12 pt-24 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[620px] overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#030918] p-8 lg:block">
          <FiveDimensionOrbit labels={isZh ? ["今日行动", "完整报告", "关系合参", "历史分析", "五维状态"] : ["Daily action", "Reports", "Relationship", "History", "Five-state"]} center={isZh ? "观我档案" : "Guanwo"} />
          <EasternCard className="absolute left-8 top-8 max-w-sm p-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
              <Archive size={14} />
              {isZh ? "个人档案系统" : "Personal dossier"}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-[var(--color-text-primary)]">
              {isZh ? "继续查看你的观我档案" : "Continue your Guanwo dossier"}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              {isZh ? "登录后查看今日行动、完整报告、关系合参和历史分析记录。" : "Sign in to view daily action, complete reports, relationship readings, and past analysis."}
            </p>
          </EasternCard>
          <EasternCard className="absolute bottom-8 right-8 max-w-xs p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">{isZh ? "今日行动建议" : "Daily action"}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              {isZh ? "先完成一个确定性任务，再处理复杂决策。" : "Finish one certain task before complex decisions."}
            </p>
          </EasternCard>
        </section>

        <section>
          <div className="mb-7 text-center lg:hidden">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-gold-soft)] bg-[rgba(200,168,74,0.08)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
              <Sparkles size={13} />
              Guanwo
            </p>
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">{isZh ? "继续查看你的观我档案" : "Continue your Guanwo dossier"}</h1>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{isZh ? "登录后查看今日行动与历史报告。" : "Sign in to view daily action and reports."}</p>
          </div>

          <EasternCard className="mx-auto w-full max-w-md p-6 md:p-8">
            <div className="mb-7 hidden text-center lg:block">
              <ShieldCheck className="mx-auto text-[var(--color-gold)]" size={28} />
              <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">{isZh ? "登录 / 注册" : "Sign in / Register"}</h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{isZh ? "继续进入你的观我档案系统" : "Continue into your Guanwo dossier"}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="ow-gold-button w-full">
                {loading ? <><Loader2 size={18} className="animate-spin" /> {t("auth.loggingIn")}</> : t("auth.login")}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-white/35">{t("auth.or")}</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <GoogleLoginButton />

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <Link href={localeHref("/forgot-password")} className="text-[var(--color-gold)] hover:underline">
                  {t("auth.forgotPassword")}
                </Link>
                <p className="text-white/45">
                  {t("auth.noAccount")}{" "}
                  <Link href={localeHref("/register")} className="text-[var(--color-gold)] hover:underline">
                    {t("auth.registerNow")}
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#060E24] p-4">
              <p className="flex items-center gap-2 text-xs leading-6 text-white/45">
                <Radar size={14} className="text-[var(--color-gold)]" />
                {isZh ? "登录即表示你同意服务条款与隐私政策。" : "By signing in, you agree to the terms and privacy policy."}
              </p>
              <p className="mt-2 text-xs text-white/35">
                <a href={localeHref("/privacy")} className="text-[var(--color-gold)] hover:underline">{t("auth.privacyPolicy")}</a>
                {" · "}
                <a href={localeHref("/terms")} className="text-[var(--color-gold)] hover:underline">{t("auth.termsOfService")}</a>
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

  if (!GOOGLE_CLIENT_ID) {
    return null
  }

  return (
    <div ref={googleBtnRef} className="flex w-full justify-center" style={{ minHeight: 44 }}>
      {!googleLoaded && (
        <div className="w-full rounded-full border border-white/10 bg-[#060E24] py-3 text-center text-sm text-white/45">
          Google {t("auth.login")}
        </div>
      )}
    </div>
  )
}
