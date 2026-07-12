"use client"
export const dynamic = "force-dynamic"
import { useState } from "react"
import { Mail, MessageCircle, Send, CheckCircle, Loader2 } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function ContactPage() {
  const { t, localeHref } = useLanguage()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(t("contact.form.fillAll"))
      return
    }
    setSending(true)
    try {
      await api.post("/api/contact", { name, email, subject, message })
      setSubmitted(true)
      toast.success(t("contact.form.sentSuccess"))
    } catch {
      toast.error(t("contact.form.sendFailed"))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs items={[{ label: t("contact.title") }]} />

        {/* Header */}
        <div className="text-center mb-12">
          <Mail size={36} className="text-gold mx-auto mb-3" />
          <h1 className="text-4xl font-serif font-bold text-gold mb-2">{t("contact.title")}</h1>
          <p className="text-white/50">{t("contact.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <ScrollReveal>
            <div className="space-y-6">
              <div className="card-glow p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <Mail size={18} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="text-white/80 font-medium text-sm">{t("contact.email")}</h3>
                    <p className="text-gold/70 text-sm">support@khanfate.com</p>
                  </div>
                </div>
                <p className="text-white/30 text-xs">{t("contact.emailHint")}</p>
              </div>

              <div className="card-glow p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <MessageCircle size={18} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="text-white/80 font-medium text-sm">{t("contact.wechat")}</h3>
                    <p className="text-gold/70 text-sm">khan18553325258</p>
                  </div>
                </div>
                <p className="text-white/30 text-xs">{t("contact.wechatHint")}</p>
              </div>

              <div className="card-glow p-6">
                <h3 className="text-white/80 font-medium text-sm mb-2">{t("contact.faq.title")}</h3>
                <p className="text-white/30 text-xs leading-relaxed">
                  {t("contact.faq.desc")}
                </p>
                <a href={localeHref("/faq")} className="text-gold/60 text-xs hover:text-gold mt-2 inline-block">
                  {t("contact.faq.link")}
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Contact Form */}
          <ScrollReveal delay={0.15}>
            {submitted ? (
              <div className="card-glass p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h2 className="font-serif text-xl text-gold mb-2">{t("contact.sent")}</h2>
                <p className="text-white/50 text-sm mb-6">
                  {t("contact.sentDesc")}
                </p>
                <button
                  onClick={() => { setSubmitted(false); setName(""); setEmail(""); setSubject(""); setMessage("") }}
                  className="text-gold text-sm hover:underline"
                >
                  {t("contact.sendNew")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-glass p-6 space-y-4">
                <h2 className="font-serif text-lg text-gold mb-2">{t("contact.form.title")}</h2>

                <div>
                  <label className="label">{t("contact.form.name")}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t("contact.form.namePlaceholder")}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">{t("contact.form.email")}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">{t("contact.form.subject")}</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="input-field"
                  >
                    <option value="" className="bg-[#0f0f1a] text-white">{t("contact.form.subjectPlaceholder")}</option>
                    <option value="general" className="bg-[#0f0f1a] text-white">{t("contact.form.subjectGeneral")}</option>
                    <option value="technical" className="bg-[#0f0f1a] text-white">{t("contact.form.subjectTech")}</option>
                    <option value="billing" className="bg-[#0f0f1a] text-white">{t("contact.form.subjectBilling")}</option>
                    <option value="feedback" className="bg-[#0f0f1a] text-white">{t("contact.form.subjectFeedback")}</option>
                    <option value="other" className="bg-[#0f0f1a] text-white">{t("contact.form.subjectOther")}</option>
                  </select>
                </div>

                <div>
                  <label className="label">{t("contact.form.message")}</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={5}
                    placeholder={t("contact.form.messagePlaceholder")}
                    className="input-field resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {sending ? t("contact.form.sending") : t("contact.form.send")}
                </button>
                <p className="text-white/20 text-[10px] text-center">
                  {t("contact.form.note")}
                </p>
              </form>
            )}
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
