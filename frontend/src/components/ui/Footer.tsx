"use client"
import Link from "next/link"
import { useState } from "react"
import { Star, Send, MessageCircle, Globe, BookOpen, Loader2, Copy } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/lib/api"
import toast from "react-hot-toast"
import { ComplianceNotice } from "@/components/compliance/ComplianceNotice"

const WECHAT_ID = "khan18553325258"

export function Footer() {
  const { t, localeHref } = useLanguage()
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await api.post("/api/contact/newsletter", { email })
      setSubscribed(true)
      setEmail("")
      toast.success(t("footer.subscribed"))
    } catch {
      toast.error(t("footer.subscribeError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="relative z-10 mt-24 section-cosmos-deep">
      {/* Stellar divider */}
      <div className="section-divider-stellar" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-10 md:gap-8">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cosmos-800 border border-stellar-blue/20 flex items-center justify-center">
                <Star size={18} className="text-stellar-blue" />
              </div>
              <span className="font-display font-bold text-parchment-100 text-lg">{t("app.name")}</span>
            </div>
            <p className="text-parchment-400 text-sm leading-relaxed mb-6 max-w-sm">
              {t("footer.desc")}
            </p>
            <ComplianceNotice compact className="mb-5 max-w-md" />

            {/* Social icons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(WECHAT_ID)
                  toast.success(`WeChat ID copied: ${WECHAT_ID}`)
                }}
                className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-parchment-400 hover:text-stellar-blue hover:border-stellar-blue/30 transition-all"
                title={`WeChat: ${WECHAT_ID}`}
              >
                <MessageCircle size={14} />
              </button>
              <button
                className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-parchment-400 opacity-50 cursor-not-allowed"
                aria-label="Weibo (coming soon)"
                disabled
              >
                <Globe size={14} />
              </button>
              <button
                className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-parchment-400 opacity-50 cursor-not-allowed"
                aria-label="Xiaohongshu (coming soon)"
                disabled
              >
                <BookOpen size={14} />
              </button>
            </div>
            <p className="text-parchment-400 text-xs mt-2 flex items-center gap-1">
              <Copy size={10} /> {t("footer.wechatHint")}: {WECHAT_ID}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-parchment-200 font-semibold mb-4 text-sm">
              {t("footer.nav")}
            </h4>
            <ul className="space-y-2.5">
              {[
                [t("nav.home"), localeHref("/")],
                [t("nav.pricing"), localeHref("/pricing")],
                [t("nav.shop"), localeHref("/shop")],
                [t("nav.blog"), localeHref("/blog")],
              ].map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-parchment-400 hover:text-parchment-200 text-sm transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Systems */}
          <div>
            <h4 className="text-parchment-200 font-semibold mb-4 text-sm">
              {t("footer.systems")}
            </h4>
            <ul className="space-y-2.5">
              {[t("agent.bazi._label"), t("agent.astrology._label"), t("agent.tarot._label"), t("agent.face._label")].map(s => (
                <li key={s} className="text-parchment-400 text-sm">{s}</li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-parchment-200 font-semibold mb-4 text-sm">
              {t("footer.newsletter")}
            </h4>
            <p className="text-parchment-400 text-xs mb-3 leading-relaxed">
              {t("footer.newsletterDesc")}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-gold text-sm py-2">
                <Star size={14} />
                {t("footer.subscribed")}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-parchment-200 placeholder-parchment-400 focus:border-gold/30 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-2 bg-gold/[0.08] border border-gold/20 rounded-lg text-gold text-xs hover:bg-gold/[0.15] transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-3 text-center">
          <p className="text-parchment-400 text-xs leading-relaxed">
            {t("footer.entertainmentDisclaimer")}
          </p>
        </div>
        <div className="border-t border-white/[0.03]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-parchment-400 text-xs">
              {t("footer.copyright")}
              <span className="mx-2 text-white/[0.1]">|</span>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-parchment-200 transition-colors">{t("footer.icp")}</a>
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-parchment-400 text-xs">
              <a href={localeHref("/faq")} className="hover:text-parchment-200 transition-colors">{t("footer.faq")}</a>
              <a href={localeHref("/contact")} className="hover:text-parchment-200 transition-colors">{t("footer.contactUs")}</a>
              <a href={localeHref("/privacy")} className="hover:text-parchment-200 transition-colors">{t("footer.privacy")}</a>
              <a href={localeHref("/terms")} className="hover:text-parchment-200 transition-colors">{t("footer.terms")}</a>
              <a href={localeHref("/refund")} className="hover:text-parchment-200 transition-colors">{t("footer.refund")}</a>
              <a href={localeHref("/disclaimer")} className="hover:text-parchment-200 transition-colors">{t("footer.disclaimer")}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
