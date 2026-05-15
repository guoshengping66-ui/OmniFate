"use client"
import { useState } from "react"
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

  // Step 1: Registration form
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  // Step 2: Verification code
  const [step, setStep] = useState<"register" | "verify">("register")
  const [verifyCode, setVerifyCode] = useState("")
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // ServiceTerms modal
  const [showTerms, setShowTerms] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error(t("auth.fillEmailPassword"))
      return
    }
    if (password.length < 6) {
      toast.error(t("auth.passwordMin6"))
      return
    }
    if (!privacyAccepted) {
      toast.error("请先阅读并同意隐私政策和服务条款")
      return
    }
    setLoading(true)
    try {
      await registerUser(email, password, displayName || undefined, privacyAccepted)
      toast.success("注册成功，请查收邮箱验证码")
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
      toast.error("请输入6位验证码")
      return
    }
    setVerifyLoading(true)
    try {
      const res = await verifyEmail(email, verifyCode)
      // Store tokens and log in (must match AuthContext keys)
      localStorage.setItem("alpha_mirror_token", res.access_token)
      localStorage.setItem("alpha_mirror_refresh", res.refresh_token)
      toast.success("邮箱验证成功！")
      router.replace("/")
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "验证失败"
      toast.error(detail)
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    try {
      await sendVerificationCode(email)
      toast.success("验证码已重新发送")
      startResendCooldown()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "发送失败")
    }
  }

  const startResendCooldown = () => {
    setResendCooldown(60)
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
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
            <h1 className="text-2xl font-serif font-bold text-gold">邮箱验证</h1>
            <p className="text-white/40 text-sm mt-1">
              验证码已发送至 <span className="text-white/60">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="card-glass p-6 md:p-8 space-y-5">
            <div>
              <label className="label">6位验证码</label>
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
                <><Loader2 size={18} className="animate-spin" /> 验证中...</>
              ) : (
                <><CheckCircle size={18} /> 验证并登录</>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="text-gold/60 hover:text-gold text-sm transition-colors disabled:opacity-40"
              >
                {resendCooldown > 0 ? `${resendCooldown}s 后可重新发送` : "重新发送验证码"}
              </button>
            </div>

            <p className="text-center text-white/40 text-sm">
              <button type="button" onClick={() => setStep("register")} className="text-gold hover:underline">
                ← 返回注册
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

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={e => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/40"
            />
            <span className="text-white/50 text-xs leading-relaxed">
              我已阅读并同意{" "}
              <a href="/privacy" target="_blank" className="text-gold hover:underline">《隐私政策》</a>
              {" "}和{" "}
              <button type="button" onClick={() => setShowTerms(true)} className="text-gold hover:underline">
                《服务条款》
              </button>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !privacyAccepted}
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
