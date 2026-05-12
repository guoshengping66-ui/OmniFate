"use client"
import { useState } from "react"
import { Mail, MessageCircle, Send, CheckCircle } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import toast from "react-hot-toast"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("请填写完整信息")
      return
    }
    setSubmitted(true)
    toast.success("消息已发送，我们会尽快回复！")
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs items={[{ label: "联系我们" }]} />

        {/* Header */}
        <div className="text-center mb-12">
          <Mail size={36} className="text-gold mx-auto mb-3" />
          <h1 className="text-4xl font-serif font-bold text-gold mb-2">联系我们</h1>
          <p className="text-white/50">有任何问题或建议，欢迎随时联系我们的团队</p>
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
                    <h3 className="text-white/80 font-medium text-sm">电子邮件</h3>
                    <p className="text-gold/70 text-sm">support@destinymirror.com</p>
                  </div>
                </div>
                <p className="text-white/30 text-xs">我们会在 24 小时内回复</p>
              </div>

              <div className="card-glow p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <MessageCircle size={18} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="text-white/80 font-medium text-sm">微信客服</h3>
                    <p className="text-gold/70 text-sm">DestinyMirror_CS</p>
                  </div>
                </div>
                <p className="text-white/30 text-xs">工作日 9:00 - 18:00</p>
              </div>

              <div className="card-glow p-6">
                <h3 className="text-white/80 font-medium text-sm mb-2">常见问题</h3>
                <p className="text-white/30 text-xs leading-relaxed">
                  在联系客服之前，建议先查看我们的常见问题页面，可能已有您需要的答案。
                </p>
                <a href="/faq" className="text-gold/60 text-xs hover:text-gold mt-2 inline-block">
                  查看 FAQ →
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
                <h2 className="font-serif text-xl text-gold mb-2">消息已发送</h2>
                <p className="text-white/50 text-sm mb-6">
                  感谢你的反馈！我们的团队会尽快与你联系。
                </p>
                <button
                  onClick={() => { setSubmitted(false); setName(""); setEmail(""); setSubject(""); setMessage("") }}
                  className="text-gold text-sm hover:underline"
                >
                  发送新消息
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-glass p-6 space-y-4">
                <h2 className="font-serif text-lg text-gold mb-2">发送消息</h2>

                <div>
                  <label className="label">姓名</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="你的名字"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">邮箱</label>
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
                  <label className="label">主题</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="input-field"
                  >
                    <option value="" className="bg-[#0f0f1a] text-white">请选择主题</option>
                    <option value="general" className="bg-[#0f0f1a] text-white">一般咨询</option>
                    <option value="technical" className="bg-[#0f0f1a] text-white">技术问题</option>
                    <option value="billing" className="bg-[#0f0f1a] text-white">支付与退款</option>
                    <option value="feedback" className="bg-[#0f0f1a] text-white">功能建议</option>
                    <option value="other" className="bg-[#0f0f1a] text-white">其他</option>
                  </select>
                </div>

                <div>
                  <label className="label">消息内容</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={5}
                    placeholder="请详细描述你的问题或建议..."
                    className="input-field resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-gold w-full py-3 flex items-center justify-center gap-2"
                >
                  <Send size={16} /> 发送消息
                </button>
              </form>
            )}
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
