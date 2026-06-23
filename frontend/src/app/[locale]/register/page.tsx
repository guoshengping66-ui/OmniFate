"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, Loader2, Eye, EyeOff, Mail, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { registerUser, sendVerificationCode, verifyEmail } from "@/lib/api"
import type { RegisterBirthData } from "@/lib/api"
import { ServiceTerms } from "@/components/ui/ServiceTerms"
import { DateSelector } from "@/components/reading/DateSelector"
import { ShichenSelector } from "@/components/reading/ShichenSelector"
import { LocationSelector } from "@/components/reading/LocationSelector"

type Step = "account" | "birth" | "verify"

export default function RegisterPage() {
  const router = useRouter()
  const { t, localeHref } = useLanguage()

  // Step 1: Account
  const [step, setStep] = useState<Step>("account")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [ageConfirmed, setAgeConfirmed] = useState(false)

  // Step 2: Birth info
  const [birthGender, setBirthGender] = useState<"female" | "male" | "other">("female")
  const [birthYear, setBirthYear] = useState(0)
  const [birthMonth, setBirthMonth] = useState(0)
  const [birthDay, setBirthDay] = useState(0)
  const [birthHour, setBirthHour] = useState(0)
  const [birthMinute, setBirthMinute] = useState(0)
  const [birthCity, setBirthCity] = useState("")

  // Step 3: Verification code
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

  const hasBirthData = birthYear > 0 && birthMonth > 0 && birthDay > 0

  // ── Step 1: Account → submit to backend ──────────────────────
  const handleAccountSubmit = async (e: React.FormEvent) => {
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
    setStep("birth")
  }

  // ── Step 2: Birth info → submit with birth data ──────────────
  const handleBirthSubmit = async () => {
    setLoading(true)
    try {
      const birthData: RegisterBirthData | undefined = hasBirthData ? {
        nickname: t("auth.birth.defaultNickname") || "Myself",
        gender: birthGender,
        birth_year: birthYear,
        birth_month: birthMonth,
        birth_day: birthDay,
        birth_hour: birthHour,
        birth_minute: birthMinute,
        birth_city: birthCity,
      } : undefined

      await registerUser(email, password, displayName || undefined, privacyAccepted, birthData)
      toast.success(hasBirthData ? t("auth.registerSuccessWithBirth") : t("auth.registerSuccessMsg"))
      setStep("verify")
      startResendCooldown()
    } catch (err: any) {
      console.error("[Register] birth submit error:", err)
      if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED" || err.message?.includes("Network Error")) {
        toast.error(t("auth.noNetwork"))
      } else {
        const detail = err?.response?.data?.detail ?? err?.message ?? t("auth.registerFail")
        toast.error(detail)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSkipBirth = async () => {
    setLoading(true)
    try {
      const res = await registerUser(email, password, displayName || undefined, privacyAccepted, undefined)
      // Email verification is always required — user must enter the 6-digit code
      toast.success(t("auth.registerSuccessMsg"))
      setStep("verify")
      startResendCooldown()
    } catch (err: any) {
      console.error("[Register] skip birth error:", err)
      if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED" || err.message?.includes("Network Error")) {
        toast.error(t("auth.noNetwork"))
      } else {
        const detail = err?.response?.data?.detail ?? err?.message ?? t("auth.registerFail")
        toast.error(detail)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: Verify email ─────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyCode || verifyCode.length !== 6) {
      toast.error(t("auth.enterVerifyCode"))
      return
    }
    setVerifyLoading(true)
    try {
      await verifyEmail(email, verifyCode)
      // Tokens are set as httpOnly cookies by the backend — no localStorage needed
      toast.success(t("auth.loginSuccess"))
      router.replace(localeHref("/dashboard"))
    } catch (err: any) {
      console.error("[Register] verify email error:", err)
      if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED" || err.message?.includes("Network Error")) {
        toast.error(t("auth.noNetwork"))
      } else {
        const detail = err?.response?.data?.detail ?? err?.message ?? t("auth.verifyFail")
        toast.error(detail)
      }
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
          // Clear interval from outside callback to avoid stale closure
          setTimeout(() => { if (cooldownRef.current) clearInterval(cooldownRef.current) }, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // ── Step 3: Verification code input ──────────────────────────
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
              <button type="button" onClick={() => setStep("birth")} className="text-gold hover:underline">
                ← {t("auth.birth.prevStep")}
              </button>
            </p>
          </form>
        </div>
      </div>
    )
  }

  // ── Step 2: Birth info ───────────────────────────────────────
  if (step === "birth") {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-4xl mb-3 block">🔮</span>
            <h1 className="text-2xl font-serif font-bold text-gold">{t("auth.birth.title")}</h1>
            <p className="text-white/40 text-sm mt-1">
              {t("auth.birth.subtitle")}
            </p>
          </div>

          <div className="card-glass p-6 md:p-8 space-y-5">
            {/* Gender */}
            <div>
              <label className="label">{t("auth.birth.gender")}</label>
              <div className="flex gap-3">
                {([["female", t("auth.birth.female")], ["male", t("auth.birth.male")], ["other", t("auth.birth.other")]] as [string, string][]).map(([v, l]) => (
                  <label key={v} className="flex-1 cursor-pointer">
                    <input type="radio" value={v} checked={birthGender === v}
                      onChange={() => setBirthGender(v as any)} className="sr-only peer" />
                    <div className="text-center py-2.5 rounded-xl border border-white/20 text-white/60 peer-checked:border-gold peer-checked:text-gold peer-checked:bg-gold/10 hover:border-white/40 transition-all text-sm">{l}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date */}
            <DateSelector
              year={birthYear}
              month={birthMonth}
              day={birthDay}
              onYearChange={setBirthYear}
              onMonthChange={setBirthMonth}
              onDayChange={setBirthDay}
            />

            {/* Time */}
            <ShichenSelector
              value={birthHour}
              onChange={(h) => { setBirthHour(h); setBirthMinute(0) }}
            />

            {/* City */}
            <LocationSelector
              value={birthCity}
              onChange={setBirthCity}
              placeholder={t("auth.birth.cityPlaceholder")}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("account")}
                className="flex items-center gap-1 px-4 py-2.5 rounded-full border border-white/20 text-white/60 hover:border-white/40 transition-all text-sm"
              >
                <ChevronLeft size={14} /> {t("auth.birth.prevStep")}
              </button>

              <button
                type="button"
                onClick={handleSkipBirth}
                disabled={loading}
                className="flex-1 py-2.5 rounded-full border border-white/20 text-white/40 hover:text-white/60 hover:border-white/40 transition-all text-sm"
              >
                {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : t("auth.birth.skip")}
              </button>

              <button
                type="button"
                onClick={handleBirthSubmit}
                disabled={loading || !hasBirthData}
                className="btn-gold flex items-center gap-1 text-sm disabled:opacity-40"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle size={14} /> {t("auth.birth.complete")}</>}
              </button>
            </div>

            <p className="text-white/25 text-[10px] text-center">
              {t("auth.birth.securityNote")}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 1: Account info ─────────────────────────────────────
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Sparkles className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold">{t("auth.registerTitle")}</h1>
          <p className="text-white/40 text-sm mt-1">{t("auth.registerSubtitle")}</p>
        </div>

        <form onSubmit={handleAccountSubmit} className="card-glass p-6 md:p-8 space-y-5">
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
              <a href={localeHref("/privacy")} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">{t("auth.privacyPolicyLink")}</a>
              {" "}{t("auth.and")}{" "}
              <button type="button" onClick={() => setShowTerms(true)} className="text-gold hover:underline">
                {t("auth.termsLink")}
              </button>
            </span>
          </label>

          <button
            type="submit"
            disabled={!privacyAccepted}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40"
          >
            {t("auth.birth.nextStep")} <ChevronRight size={16} />
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
