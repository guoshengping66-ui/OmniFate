"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share2, Check, Copy, X, Download, Users, Gift } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"

interface Props {
  sessionId: string
}

export function ShareSheet({ sessionId }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedReferral, setCopiedReferral] = useState(false)
  const { user } = useAuth()

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/reading/${sessionId}`
    : ""

  const referralCode = user ? `DESTINY-${user.id.slice(0, 8).toUpperCase()}` : ""

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("链接已复制")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("复制失败")
    }
  }

  const handleCopyReferral = async () => {
    try {
      const referralUrl = `${window.location.origin}/register?ref=${referralCode}`
      await navigator.clipboard.writeText(referralUrl)
      setCopiedReferral(true)
      toast.success("邀请链接已复制！好友注册后双方各得 ¥10 代金券")
      setTimeout(() => setCopiedReferral(false), 2000)
    } catch {
      toast.error("复制失败")
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "我的命盘报告 - 命盘智镜",
        text: "来看看我的全维度命理分析报告！八字·星盘·塔罗·面相·手相五维合一",
        url: shareUrl,
      }).catch(() => {})
    }
  }

  const handleDownloadPoster = () => {
    // Generate a canvas-based shareable poster
    const canvas = document.createElement("canvas")
    canvas.width = 750
    canvas.height = 1334
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Background
    const grad = ctx.createLinearGradient(0, 0, 750, 1334)
    grad.addColorStop(0, "#1a1030")
    grad.addColorStop(0.5, "#2D1B4E")
    grad.addColorStop(1, "#140f24")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 750, 1334)

    // Gold accent
    ctx.fillStyle = "rgba(201,168,76,0.1)"
    ctx.beginPath()
    ctx.arc(375, 400, 250, 0, Math.PI * 2)
    ctx.fill()

    // Title
    ctx.fillStyle = "#C9A84C"
    ctx.font = "bold 48px serif"
    ctx.textAlign = "center"
    ctx.fillText("命盘智镜", 375, 200)

    ctx.font = "28px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.fillText("全维度命理分析报告", 375, 260)

    // Crystal ball emoji
    ctx.font = "120px serif"
    ctx.fillText("🔮", 375, 450)

    // Stats
    ctx.font = "bold 36px sans-serif"
    ctx.fillStyle = "#C9A84C"
    ctx.fillText("八字 · 星盘 · 塔罗 · 面相 · 手相", 375, 600)

    ctx.font = "24px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.5)"
    ctx.fillText("五维联合 AI 深度解析", 375, 650)

    // Divider
    ctx.strokeStyle = "rgba(201,168,76,0.3)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(150, 700)
    ctx.lineTo(600, 700)
    ctx.stroke()

    // CTA
    ctx.font = "bold 32px sans-serif"
    ctx.fillStyle = "#C9A84C"
    ctx.fillText("扫码查看我的命盘 →", 375, 800)

    // QR placeholder
    ctx.fillStyle = "rgba(255,255,255,0.1)"
    ctx.fillRect(275, 850, 200, 200)
    ctx.font = "20px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    ctx.fillText("QR Code", 375, 960)

    // Footer
    ctx.font = "18px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    ctx.fillText("命盘智镜 · AI 赋能千年玄学", 375, 1150)
    ctx.fillText("destiny-platform.com", 375, 1190)

    // Download
    const link = document.createElement("a")
    link.download = `命盘智镜-分享卡片-${Date.now()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
    toast.success("分享卡片已下载")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20
                   text-white/60 hover:border-gold/40 hover:text-gold transition-all text-sm"
      >
        <Share2 size={14} />
        分享报告
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-ink border-t border-gold/20
                         rounded-t-3xl p-6 pb-10 max-w-lg mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-lg text-gold">分享命盘报告</h3>
                <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <button onClick={handleCopy}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-gold/10
                             border border-white/10 hover:border-gold/30 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                                  group-hover:bg-gold/20 transition-colors">
                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-white/60" />}
                  </div>
                  <span className="text-[10px] text-white/40">{copied ? "已复制" : "复制链接"}</span>
                </button>

                {typeof navigator !== "undefined" && !!navigator.share && (
                  <button onClick={handleShare}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-gold/10
                               border border-white/10 hover:border-gold/30 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                                    group-hover:bg-gold/20 transition-colors">
                      <Share2 size={18} className="text-white/60" />
                    </div>
                    <span className="text-[10px] text-white/40">更多分享</span>
                  </button>
                )}

                <button onClick={handleDownloadPoster}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-gold/10
                             border border-white/10 hover:border-gold/30 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                                  group-hover:bg-gold/20 transition-colors">
                    <Download size={18} className="text-white/60" />
                  </div>
                  <span className="text-[10px] text-white/40">下载卡片</span>
                </button>

                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5
                               border border-white/10 transition-all group opacity-60 cursor-not-allowed">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-sm">💚</span>
                  </div>
                  <span className="text-[10px] text-white/40">微信</span>
                </div>
              </div>

              {/* Referral card */}
              {user && (
                <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent rounded-xl p-4 border border-gold/20 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift size={16} className="text-gold" />
                    <span className="text-gold text-sm font-medium">邀请好友赚代金券</span>
                  </div>
                  <p className="text-white/40 text-xs mb-3">
                    每邀请一位好友注册，双方各得 ¥10 代金券，可叠加使用
                  </p>
                  <button
                    onClick={handleCopyReferral}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gold/10 border border-gold/30 text-gold text-xs hover:bg-gold/20 transition-all"
                  >
                    {copiedReferral ? <><Check size={12} /> 已复制</> : <><Users size={12} /> 复制邀请链接</>}
                  </button>
                </div>
              )}

              {/* Preview card */}
              <div className="bg-gradient-to-br from-gold/10 via-ink-light to-ink rounded-xl p-4 border border-gold/20">
                <p className="text-white/40 text-xs mb-1">分享内容预览</p>
                <p className="text-gold text-sm font-medium">
                  来看看我的全维度命理分析报告 🔮
                </p>
                <p className="text-white/30 text-xs mt-1">
                  八字·星盘·塔罗·面相·手相 · 五维合一
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
