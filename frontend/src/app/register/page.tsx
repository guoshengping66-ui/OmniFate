"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
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
      toast.success(t("auth.registerSuccess"))
      router.replace("/")
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? t("auth.registerFail")
      toast.error(detail)
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
          <h1 className="text-2xl font-serif font-bold text-gold">{t("auth.registerTitle")}</h1>
          <p className="text-white/40 text-sm mt-1">{t("auth.registerSubtitle")}</p>
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
              <a href="/terms" target="_blank" className="text-gold hover:underline">《服务条款》</a>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !privacyAccepted}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3"
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
      </div>
    </div>
  )
}
