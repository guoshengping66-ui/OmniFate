"use client"
import Link from "next/link"
import { useState } from "react"
import { Sparkles, Send, MessageCircle, Globe, BookOpen, Loader2, Copy } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

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
    <footer className="relative z-10 mt-24">
      {/* Top decorative divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="bg-ink/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-5 gap-10 md:gap-8">
            {/* Brand column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
 <div className="w-10 h-10 rounded-full bg-gold-shine flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.3)]">
                  <Sparkles size={18} className="text-ink" />
                </div>
                <span className="font-serif font-bold text-gold text-lg">{t("app.name")}</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-sm">
                {t("footer.desc")}
              </p>

              {/* Social icons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(WECHAT_ID)
                    toast.success(`WeChat ID copied: ${WECHAT_ID}`)
                  }}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all duration-300"
                  title={`WeChat: ${WECHAT_ID}`}
                >
                  <MessageCircle size={14} />
                </button>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all duration-300"
                  title="Weibo"
                >
                  <Globe size={14} />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all duration-300"
                  title="Xiaohongshu"
                >
                  <BookOpen size={14} />
                </a>
              </div>
              <p className="text-white/30 text-[11px] mt-2 flex items-center gap-1">
                <Copy size={10} /> {t("footer.wechatHint")}: {WECHAT_ID}
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-gold/80 font-medium mb-4 text-sm uppercase tracking-wider">
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
                    <Link
                      href={h}
                      className="text-white/40 hover:text-gold text-sm transition-colors duration-200"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Systems */}
            <div>
              <h4 className="text-gold/80 font-medium mb-4 text-sm uppercase tracking-wider">
                {t("footer.systems")}
              </h4>
              <ul className="space-y-2.5">
                {[t("agent.bazi._label"), t("agent.astrology._label"), t("agent.tarot._label"), t("agent.face._label")].map(s => (
                  <li key={s} className="text-white/40 text-sm">{s}</li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-gold/80 font-medium mb-4 text-sm uppercase tracking-wider">
                {t("footer.newsletter")}
              </h4>
              <p className="text-white/30 text-xs mb-3 leading-relaxed">
                {t("footer.newsletterDesc")}
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-gold text-sm py-2">
                  <Sparkles size={14} />
                  {t("footer.subscribed")}
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
 className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:border-gold/40 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-2 bg-gold/15 border border-gold/30 rounded-lg text-gold text-xs hover:bg-gold/25 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06]">
          {/* Entertainment disclaimer */}
          <div className="max-w-7xl mx-auto px-6 py-3 text-center">
            <p className="text-white/20 text-[11px] leading-relaxed">
              {t("footer.entertainmentDisclaimer")}
            </p>
          </div>
          <div className="border-t border-white/[0.04]">
            <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/25 text-xs">
                {t("footer.copyright")}
                <span className="mx-2">|</span>
                <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-gold/60 transition-colors">{t("footer.icp")}</a>
              </p>
              <div className="flex gap-6 text-white/25 text-xs">
                <a href={localeHref("/faq")} className="hover:text-gold/60 transition-colors">{t("footer.faq")}</a>
                <a href={localeHref("/contact")} className="hover:text-gold/60 transition-colors">{t("footer.contactUs")}</a>
                <a href={localeHref("/privacy")} className="hover:text-gold/60 transition-colors">{t("footer.privacy")}</a>
                <a href={localeHref("/terms")} className="hover:text-gold/60 transition-colors">{t("footer.terms")}</a>
                <a href={localeHref("/refund")} className="hover:text-gold/60 transition-colors">{t("footer.refund")}</a>
                <a href={localeHref("/disclaimer")} className="hover:text-gold/60 transition-colors">{t("footer.disclaimer")}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
