"use client"
import { useState, useRef, useEffect } from "react"
import { Link } from "@/i18n/navigation"
import { useRouter } from "next/navigation"
import { Mail, Loader2, Eye, EyeOff, CheckCircle, KeyRound } from "lucide-react"
import toast from "react-hot-toast"
import { forgotPassword, resetPasswordWithCode } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ForgotPasswordPage() {
  const { t, localeHref } = useLanguage()
  const router = useRouter()

  // Step 1: Enter email
  const [step, setStep] = useState<"email" | "reset">("email")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  // Step 2: Enter code + new password
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [done, setDone] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error(t("auth.fillEmail"))
      return
    }
    setLoading(true)
    try {
      await forgotPassword(email)
      toast.success(t("forgotPassword.verifyCodeSent"))
      setStep("reset")
      startResendCooldown()
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? t("auth.resetFail")
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length !== 6) {
      toast.error(t("forgotPassword.enterCode"))
      return
    }
    if (!password || password.length < 6) {
      toast.error(t("auth.passwordMin6"))
      return
    }
    if (password !== confirmPassword) {
      toast.error(t("auth.passwordMismatch"))
      return
    }
    setResetLoading(true)
    try {
      await resetPasswordWithCode(email, code, password)
      setDone(true)
      toast.success(t("auth.resetSuccess"))
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? t("auth.resetFail")
      toast.error(detail)
    } finally {
      setResetLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    try {
      await forgotPassword(email)
      toast.success(t("forgotPassword.resendSuccess"))
      startResendCooldown()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? t("forgotPassword.resendFail"))
    }
  }

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup interval on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startResendCooldown = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setResendCooldown(60)
    timerRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Done: success screen
  if (done) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md text-center">
          <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-serif font-bold text-gold mb-2">{t("auth.resetSuccess")}</h1>
          <p className="text-white/40 text-sm mb-6">{t("auth.resetSuccessDesc")}</p>
          <button
            onClick={() => router.push(localeHref("/login"))}
            className="btn-gold px-8 py-3"
          >
            {t("auth.goToLogin")}
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Enter code + new password
  if (step === "reset") {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <KeyRound className="text-gold mx-auto mb-3" size={28} />
            <h1 className="text-2xl font-serif font-bold text-gold">{t("auth.resetPassword")}</h1>
            <p className="text-white/40 text-sm mt-1">
              {t("forgotPassword.verifyCodeSent")} <span className="text-white/60">{email}</span>
            </p>
          </div>

          <form onSubmit={handleReset} className="card-glass p-6 md:p-8 space-y-5">
            <div>
              <label className="label">{t("forgotPassword.enterCode")}</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            <div>
              <label className="label">{t("auth.newPassword")}</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t("auth.passwordPlaceholder2")}
                  className="input-field pr-10"
                  autoComplete="new-password"
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

            <div>
              <label className="label">{t("auth.confirmPassword")}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t("auth.confirmPasswordPlaceholder")}
                className="input-field"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={resetLoading || code.length !== 6}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3"
            >
              {resetLoading ? (
                <><Loader2 size={18} className="animate-spin" /> {t("forgotPassword.resetting")}</>
              ) : (
                <><CheckCircle size={18} /> {t("forgotPassword.resetBtn")}</>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="text-gold/60 hover:text-gold text-sm transition-colors disabled:opacity-40"
              >
                {resendCooldown > 0 ? `${resendCooldown}s ${t("forgotPassword.resendCooldown")}` : t("forgotPassword.resendCode")}
              </button>
            </div>

            <p className="text-center text-white/40 text-sm">
              <button type="button" onClick={() => setStep("email")} className="text-gold hover:underline">
                {t("forgotPassword.changeEmail")}
              </button>
            </p>
          </form>
        </div>
      </div>
    )
  }

  // Step 1: Enter email
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Mail className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold">{t("auth.forgotPassword")}</h1>
          <p className="text-white/40 text-sm mt-1">{t("auth.forgotPasswordDesc")}</p>
        </div>

        <form onSubmit={handleSendCode} className="card-glass p-6 md:p-8 space-y-5">
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

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> {t("auth.sending")}</> : t("forgotPassword.sendingCode")}
          </button>

          <p className="text-center text-white/40 text-sm">
            <Link href={localeHref("/login")} className="text-gold hover:underline">{t("auth.backToLogin")}</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
