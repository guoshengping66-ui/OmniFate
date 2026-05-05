"use client"
import { useState } from "react"
import Link from "next/link"
import { Sparkles, Loader2, Mail, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"
import { forgotPassword } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [devToken, setDevToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error(t("auth.fillEmail"))
      return
    }
    setLoading(true)
    try {
      const res = await forgotPassword(email)
      setSent(true)
      if (res.dev_token) {
        setDevToken(res.dev_token)
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? t("auth.resetFail")
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <CheckCircle className="text-green-400 mx-auto mb-3" size={48} />
            <h1 className="text-2xl font-serif font-bold text-gold">{t("auth.resetSent")}</h1>
            <p className="text-white/40 text-sm mt-2">{t("auth.resetSentDesc")}</p>
          </div>

          {devToken && (
            <div className="card-glass p-6 mb-4">
              <p className="text-yellow-400 text-xs mb-2">🔑 开发模式 Token（生产环境会通过邮件发送）：</p>
              <code className="block bg-white/5 rounded-lg p-3 text-xs text-white/70 break-all">{devToken}</code>
              <Link
                href={`/reset-password?token=${devToken}`}
                className="btn-gold w-full mt-4 flex items-center justify-center gap-2 py-3 text-sm"
              >
                {t("auth.resetNow")}
              </Link>
            </div>
          )}

          <p className="text-center text-white/30 text-sm">
            <Link href="/login" className="text-gold hover:underline">{t("auth.backToLogin")}</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Mail className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold">{t("auth.forgotPassword")}</h1>
          <p className="text-white/40 text-sm mt-1">{t("auth.forgotPasswordDesc")}</p>
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

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> {t("auth.sending")}</> : t("auth.sendResetLink")}
          </button>

          <p className="text-center text-white/40 text-sm">
            <Link href="/login" className="text-gold hover:underline">{t("auth.backToLogin")}</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
