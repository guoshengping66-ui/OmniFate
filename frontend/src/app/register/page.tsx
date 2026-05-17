"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, Loader2, Eye, EyeOff, Mail, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { registerUser, sendVerificationCode, verifyEmail } from "@/lib/api"
import { ServiceTerms } from "@/components/ui/ServiceTerms"

export default function RegisterPage() {
  const router = useRouter()
  const { login: authLogin } = useAuth()
  const { t } = useLanguage()

  // Read referral code from URL ?ref=XXXX
  const [referralCode, setReferralCode] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get("ref")
    if (ref) setReferralCode(ref.toUpperCase())
  }, [])

  // Step 1: Registration form
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [ageConfirmed, setAgeConfirmed] = useState(false)

  // Step 2: Verification code
  const [step, setStep] = useState<"register" | "verify">("register")
  const [verifyCode, setVerifyCode] = useState("")
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [])

  // ServiceTerms modal
  const [showTerms, setShowTerms] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error(t("auth.fillEmailPassword"))
      return
    }
    if (password.length < 8) {
      toast.error(t("auth.pwdMin8"))
      return
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error(t("auth.pwdRequirements"))
      return
    }
    if (!privacyAccepted) {
      toast.error(t("auth.acceptPrivacy"))
      return
    }
    if (!ageConfirmed) {
      toast.error(t("auth.confirmAge"))
      return
    }
    setLoading(true)
    try {
      const res = await registerUser(email, password, displayName || undefined, privacyAccepted, referralCode || undefined)
      // Email verification is always required — user must enter the 6-digit code
      toast.success(t("auth.registerSuccessMsg"))
      setStep("verify")
      startResendCooldown()
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? t("auth.registerFail")
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyCode || verifyCode.length !== 6) {
      toast.error(t("auth.enterVerifyCode"))
      return
    }
    setVerifyLoading(true)
    try {
      const res = await verifyEmail(email, verifyCode)
      // Store tokens and log in (must match AuthContext keys)
      localStorage.setItem("alpha_mirror_token", res.access_token)
      localStorage.setItem("alpha_mirror_refresh", res.refresh_token)
      toast.success(t("auth.loginSuccess"))
      router.replace("/")
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? t("auth.verifyFail")
      toast.error(detail)
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    try {
      await sendVerificationCode(email)
      toast.success(t("auth.resendSuccess"))
      startResendCooldown()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? t("auth.resendFail"))
    }
  }

  const startResendCooldown = () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    setResendCooldown(60)
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!)
          cooldownRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Step 2: Verification code input
  if (step === "verify") {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Mail className="text-gold mx-auto mb-3" size={28} />
            <h1 className="text-2xl font-serif font-bold text-gold">{t("auth.verifyTitle")}</h1>
            <p className="text-white/40 text-sm mt-1">
              {t("auth.verifySentTo")} <span className="text-white/60">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="card-glass p-6 md:p-8 space-y-5">
            <div>
              <label className="label">{t("auth.verifyCodeLabel")}</label>
              <input
                type="text"
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              disabled={verifyLoading || verifyCode.length !== 6}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3"
            >
              {verifyLoading ? (
                <><Loader2 size={18} className="animate-spin" /> {t("auth.verifying")}</>
              ) : (
                <><CheckCircle size={18} /> {t("auth.verifyAndLogin")}</>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="text-gold/60 hover:text-gold text-sm transition-colors disabled:opacity-40"
              >
                {resendCooldown > 0 ? `${resendCooldown}${t("auth.resendIn")}` : t("auth.resendCode")}
              </button>
            </div>

            <p className="text-center text-white/40 text-sm">
              <button type="button" onClick={() => setStep("register")} className="text-gold hover:underline">
                {t("auth.backToRegister")}
              </button>
            </p>
          </form>
        </div>
      </div>
    )
  }

  // Step 1: Registration form
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Sparkles className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold">{t("auth.registerTitle")}</h1>
          <p className="text-white/40 text-sm mt-1">{t("auth.registerSubtitle")}</p>
        </div>

        <form onSubmit={handleRegister} className="card-glass p-6 md:p-8 space-y-5">
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
            <label className="label">{t("auth.nameOptional")} <span className="text-white/20 text-xs">{t("auth.nameOptionalHint")}</span></label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={t("auth.displayNamePlaceholder")}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">{t("auth.password")}</label>
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

          {/* Referral code (optional) */}
          <div>
            <label className="label">
              {t("auth.referralCode")} <span className="text-white/20 text-xs">{t("auth.referralHint")}</span>
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={e => setReferralCode(e.target.value.toUpperCase())}
              placeholder={t("auth.referralPlaceholder")}
              maxLength={8}
              className="input-field font-mono tracking-widest text-center"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={e => setAgeConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/40"
            />
            <span className="text-white/50 text-xs leading-relaxed">
              {t("auth.ageConfirm")}
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={e => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/40"
            />
            <span className="text-white/50 text-xs leading-relaxed">
              {t("auth.agreePolicy")}{" "}
              <a href="/privacy" target="_blank" className="text-gold hover:underline">{t("auth.privacyPolicyLink")}</a>
              {" "}{t("auth.and")}{" "}
              <button type="button" onClick={() => setShowTerms(true)} className="text-gold hover:underline">
                {t("auth.termsLink")}
              </button>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !privacyAccepted || !ageConfirmed}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> {t("auth.registering")}</> : t("auth.register")}
          </button>

          <p className="text-center text-white/40 text-sm">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="text-gold hover:underline">
              {t("auth.loginNow")}
            </Link>
          </p>
        </form>

        <ServiceTerms open={showTerms} onClose={() => setShowTerms(false)} />
      </div>
    </div>
  )
}
