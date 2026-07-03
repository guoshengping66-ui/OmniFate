"use client"
import { useState, useCallback } from "react"
import { Share2, Check, Copy, X, Download, Users, Gift, FileText } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

interface Props {
  sessionId: string
}

export function ShareSheet({ sessionId }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedReferral, setCopiedReferral] = useState(false)
  const { user } = useAuth()
  const { t } = useLanguage()

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/reading/${sessionId}`
    : ""

  const referralCode = user ? `DESTINY-${user.id.slice(0, 8).toUpperCase()}` : ""

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success(t("share.linkCopied"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t("share.copyFail"))
    }
  }

  const handleCopyReferral = async () => {
    try {
      const referralUrl = `${window.location.origin}/register?ref=${referralCode}`
      await navigator.clipboard.writeText(referralUrl)
      setCopiedReferral(true)
      toast.success(t("share.referralCopied"))
      setTimeout(() => setCopiedReferral(false), 2000)
    } catch {
      toast.error(t("share.copyFail"))
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t("share.shareTitle"),
        text: t("share.shareText"),
        url: shareUrl,
      }).catch(() => {})
    }
  }

  const handleDownloadPdf = useCallback(async () => {
    try {
      const { generateReadingPdf } = await import("@/lib/generate-pdf")
      // Find the main report content area
      const reportEl = document.querySelector("[data-report-content]") as HTMLElement
      if (!reportEl) {
        toast.error(t("share.pdfNotFound"))
        return
      }
      await generateReadingPdf({
        element: reportEl,
        filename: `profile-mirror-report-${sessionId.slice(0, 8)}`,
      })
      toast.success(t("share.pdfDownloaded"))
    } catch (err) {
      console.error("PDF generation failed:", err)
      toast.error(t("share.pdfError"))
    }
  }, [sessionId, t])

  const handleDownloadPoster = () => {
    const canvas = document.createElement("canvas")
    canvas.width = 750
    canvas.height = 1334
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const grad = ctx.createLinearGradient(0, 0, 750, 1334)
    grad.addColorStop(0, "#1a1030")
    grad.addColorStop(0.5, "#2D1B4E")
    grad.addColorStop(1, "#140f24")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 750, 1334)

    ctx.fillStyle = "rgba(201,168,76,0.1)"
    ctx.beginPath()
    ctx.arc(375, 400, 250, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#C9A84C"
    ctx.font = "bold 48px serif"
    ctx.textAlign = "center"
    ctx.fillText(t("share.canvasTitle"), 375, 200)

    ctx.font = "28px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.fillText(t("share.canvasSubtitle"), 375, 260)

    ctx.font = "120px serif"
    ctx.fillText("🔮", 375, 450)

    ctx.font = "bold 36px sans-serif"
    ctx.fillStyle = "#C9A84C"
    ctx.fillText(t("share.canvasSystems"), 375, 600)

    ctx.font = "24px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.5)"
    ctx.fillText(t("share.canvasDesc"), 375, 650)

    ctx.strokeStyle = "rgba(201,168,76,0.3)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(150, 700)
    ctx.lineTo(600, 700)
    ctx.stroke()

    ctx.font = "bold 32px sans-serif"
    ctx.fillStyle = "#C9A84C"
    ctx.fillText(t("share.canvasCTA"), 375, 800)

    ctx.fillStyle = "rgba(255,255,255,0.1)"
    ctx.fillRect(275, 850, 200, 200)
    ctx.font = "20px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    ctx.fillText("QR Code", 375, 960)

    ctx.font = "18px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    ctx.fillText(t("share.canvasFooter"), 375, 1150)
    ctx.fillText("destiny-platform.com", 375, 1190)

    const link = document.createElement("a")
    link.download = `profile-mirror-share-${Date.now()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
    toast.success(t("share.cardDownloaded"))
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-parchment-400 hover:border-gold/40 hover:text-gold transition-all text-sm"
      >
        <Share2 size={14} />
        {t("share.title")}
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm anim-fade-in"
          />

          <div className="fixed bottom-0 left-0 right-0 z-50 bg-cosmos-950 border-t border-gold/20 rounded-t-3xl p-6 pb-10 max-w-lg mx-auto anim-slide-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg text-gold">{t("share.title")}</h3>
              <button onClick={() => setOpen(false)} className="text-parchment-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <button onClick={handleCopy}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.04] hover:bg-gold/10 border border-white/[0.06] hover:border-gold/30 transition-all group">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-parchment-400" />}
                </div>
                <span className="text-xs text-parchment-400">{copied ? t("share.copied") : t("share.copyLink")}</span>
              </button>

              {typeof navigator !== "undefined" && !!navigator.share && (
                <button onClick={handleShare}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.04] hover:bg-gold/10 border border-white/[0.06] hover:border-gold/30 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <Share2 size={18} className="text-parchment-400" />
                  </div>
                  <span className="text-xs text-parchment-400">{t("share.moreShare")}</span>
                </button>
              )}

              <button onClick={handleDownloadPoster}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.04] hover:bg-gold/10 border border-white/[0.06] hover:border-gold/30 transition-all group">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <Download size={18} className="text-parchment-400" />
                </div>
                <span className="text-xs text-parchment-400">{t("share.downloadCard")}</span>
              </button>

              <button onClick={handleDownloadPdf}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.04] hover:bg-gold/10 border border-white/[0.06] hover:border-gold/30 transition-all group">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <FileText size={18} className="text-parchment-400" />
                </div>
                <span className="text-xs text-parchment-400">{t("share.downloadPdf")}</span>
              </button>

              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] transition-all group opacity-60 cursor-not-allowed">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-sm">💚</span>
                </div>
                <span className="text-xs text-parchment-400">{t("share.wechat")}</span>
              </div>
            </div>

            {user && (
              <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent rounded-xl p-4 border border-gold/20 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift size={16} className="text-gold" />
                  <span className="text-gold text-sm font-medium">{t("share.inviteFriend")}</span>
                </div>
                <p className="text-parchment-400 text-xs mb-3">{t("share.inviteDesc")}</p>
                <button
                  onClick={handleCopyReferral}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gold/10 border border-gold/30 text-gold text-xs hover:bg-gold/20 transition-all"
                >
                  {copiedReferral ? <><Check size={12} /> {t("share.copied")}</> : <><Users size={12} /> {t("share.copyReferral")}</>}
                </button>
              </div>
            )}

            <div className="bg-gradient-to-br from-gold/10 via-ink-light to-ink rounded-xl p-4 border border-gold/20">
              <p className="text-parchment-400 text-xs mb-1">{t("share.previewTitle")}</p>
              <p className="text-gold text-sm font-medium">{t("share.previewText")}</p>
              <p className="text-parchment-400 text-xs mt-1">{t("share.previewDesc")}</p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
