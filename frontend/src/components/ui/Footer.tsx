"use client"
import Link from "next/link"
import { useState } from "react"
import { Sparkles, Send, MessageCircle, Globe, BookOpen } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function Footer() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail("")
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
                {[
                  { icon: <MessageCircle size={14} />, label: "WeChat" },
                  { icon: <Globe size={14} />, label: "Weibo" },
                  { icon: <BookOpen size={14} />, label: "Xiaohongshu" },
                ].map(s => (
                  <div
                    key={s.label}
 className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all duration-300 cursor-pointer"
                    title={s.label}
                  >
                    {s.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-gold/80 font-medium mb-4 text-sm uppercase tracking-wider">
                {t("footer.nav")}
              </h4>
              <ul className="space-y-2.5">
                {[
                  [t("nav.home"), "/"],
                  [t("nav.reading"), "/reading/new"],
                  [t("nav.almanac"), "/almanac"],
                  [t("nav.events"), "/events"],
                  [t("nav.pricing"), "/pricing"],
                  [t("nav.shop"), "/shop"],
                  [t("nav.blog"), "/blog"],
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
                {[t("agent.bazi"), t("agent.astrology"), t("agent.tarot"), t("agent.face")].map(s => (
                  <li key={s} className="text-white/40 text-sm">{s}</li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-gold/80 font-medium mb-4 text-sm uppercase tracking-wider">
                订阅运势
              </h4>
              <p className="text-white/30 text-xs mb-3 leading-relaxed">
                每周推送五行运势与开运指南
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-gold text-sm py-2">
                  <Sparkles size={14} />
                  订阅成功
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
 className="px-3 py-2 bg-gold/15 border border-gold/30 rounded-lg text-gold text-xs hover:bg-gold/25 transition-colors"
                  >
                    <Send size={12} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/25 text-xs">
              {t("footer.copyright")}
              <span className="mx-2">|</span>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-gold/60 transition-colors">[粤ICP备XXXXXXXX号]</a>
            </p>
            <div className="flex gap-6 text-white/25 text-xs">
              <a href="/faq" className="hover:text-gold/60 transition-colors">常见问题</a>
              <a href="/contact" className="hover:text-gold/60 transition-colors">联系我们</a>
              <a href="/privacy" className="hover:text-gold/60 transition-colors">隐私政策</a>
              <a href="/terms" className="hover:text-gold/60 transition-colors">服务条款</a>
              <a href="/refund" className="hover:text-gold/60 transition-colors">退款政策</a>
              <a href="/disclaimer" className="hover:text-gold/60 transition-colors">免责声明</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
