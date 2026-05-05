"use client"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"
import { resetPassword } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast.error(t("auth.invalidToken"))
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
    setLoading(true)
    try {
      await resetPassword(token, password)
      setDone(true)
      toast.success(t("auth.resetSuccess"))
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? t("auth.resetFail")
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40">{t("auth.invalidToken")}</p>
          <Link href="/forgot-password" className="text-gold text-sm mt-4 inline-block hover:underline">
            {t("auth.requestNewLink")}
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md text-center">
          <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-serif font-bold text-gold mb-2">{t("auth.resetSuccess")}</h1>
          <p className="text-white/40 text-sm mb-6">{t("auth.resetSuccessDesc")}</p>
          <button
            onClick={() => router.push("/login")}
            className="btn-gold px-8 py-3"
          >
            {t("auth.goToLogin")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Sparkles className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold">{t("auth.resetPassword")}</h1>
          <p className="text-white/40 text-sm mt-1">{t("auth.resetPasswordDesc")}</p>
        </div>

        <form onSubmit={handleSubmit} className="card-glass p-6 md:p-8 space-y-5">
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
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> {t("auth.resetting")}</> : t("auth.resetPassword")}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center"><Loader2 size={32} className="text-gold animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
