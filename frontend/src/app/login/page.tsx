"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

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
