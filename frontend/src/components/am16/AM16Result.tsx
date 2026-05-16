"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share2, Download, Check, Copy, X, Sparkles, Heart, Skull, RefreshCw, Users, Gift, Wand2 } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { PERSONALITIES, DIMENSIONS } from "@/lib/am16/constants"
import { calculateAM16 } from "@/lib/am16/calculator"
import Link from "next/link"

// ── 高亮发疯文案：将 **关键词** 包裹为金色高亮 ──
function HighlightCrazy({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <span key={i} className="text-amber-400 font-semibold">
              {part.slice(2, -2)}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

// ── 解析人格内容的 i18n 翻译 ──
function resolvePersonality(p: typeof PERSONALITIES[string], t: (key: string) => string) {
  return {
    ...p,
    title: t(`am16.${p.code}.title`),
    quote: t(`am16.${p.code}.quote`),
    quoteExplain: t(`am16.${p.code}.quoteExplain`),
    diagnosis: t(`am16.${p.code}.diagnosis`),
    advice: t(`am16.${p.code}.advice`),
  }
}

interface Props {
  answers: number[]
  onRestart: () => void
}

export function AM16ResultCard({ answers, onRestart }: Props) {
  const { user } = useAuth()
  const { t: rawT } = useLanguage()
  const t = rawT as unknown as (key: string) => string
  const [shareOpen, setShareOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedReferral, setCopiedReferral] = useState(false)
  const result = calculateAM16(answers)
  const { personality: rawPersonality, radarScores, code } = result
  const personality = resolvePersonality(rawPersonality, t)

  const compatNames = rawPersonality.compatible.map(c => {
    const p = PERSONALITIES[c]
    return p ? { emoji: p.emoji, title: t(`am16.${c}.title`), code: c } : null
  }).filter(Boolean)
  const clashNames = rawPersonality.clash.map(c => {
    const p = PERSONALITIES[c]
    return p ? { emoji: p.emoji, title: t(`am16.${c}.title`), code: c } : null
  }).filter(Boolean)

  // ── 分享面板操作 ──
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/am16?code=${code}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success(t("am16.copied"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t("am16.copyFailed"))
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t("am16.sharePreviewText"),
        text: `${personality.emoji} ${personality.title} — ${code}`,
        url: shareUrl,
      }).catch(() => {})
    }
  }

  const handleCopyReferral = async () => {
    if (!user) {
      toast(t("am16.loginRequired"))
      return
    }
    const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${user.referral_code || ""}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopiedReferral(true)
      toast.success(t("am16.shareSuccess"))
      setTimeout(() => setCopiedReferral(false), 2000)
    } catch {
      toast.error(t("am16.copyFailed"))
    }
  }

  // ── Canvas 海报生成（Web Worker 异步化）──
  const handleDownload = () => {
    setDownloading(true)

    const inviteCode = user?.referral_code || t("am16.poster.defaultInvite")
    const workerData = {
      code,
      emoji: personality.emoji,
      title: personality.title,
      quote: personality.quote,
      quoteExplain: personality.quoteExplain,
      diagnosis: personality.diagnosis,
      advice: personality.advice,
      inviteCode,
      poster: {
        title: t("am16.poster.title"),
        diagnosis: t("am16.poster.diagnosis"),
        guide: t("am16.poster.guide"),
        scan: t("am16.poster.scan"),
        stardust: t("am16.poster.stardust"),
        brand: t("am16.poster.brand"),
      },
    }

    try {
      const worker = new Worker("/workers/am16-poster.js")
      worker.onmessage = (e: MessageEvent) => {
        const { url, error } = e.data
        if (error || !url) {
          toast.error(t("am16.saveFailed"))
          setDownloading(false)
          worker.terminate()
          return
        }
        // iOS Safari: link.click() doesn't trigger download, use window.open as fallback
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        if (isIOS) {
          window.open(url, "_blank")
        } else {
          const link = document.createElement("a")
          link.download = `AM16-${code}-${Date.now()}.png`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        }
        toast.success(t("am16.saveImage"))
        setDownloading(false)
        worker.terminate()
      }
      worker.onerror = () => {
        toast.error(t("am16.saveFailed"))
        setDownloading(false)
        worker.terminate()
      }
      worker.postMessage(workerData)
    } catch {
      // Fallback: synchronous canvas generation
      try {
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
        ctx.fillStyle = "rgba(201,168,76,0.08)"
        ctx.beginPath()
        ctx.arc(375, 350, 280, 0, Math.PI * 2)
        ctx.fill()
        ctx.textAlign = "center"
        ctx.fillStyle = "#C9A84C"
        ctx.font = "bold 32px sans-serif"
        ctx.fillText(t("am16.poster.title"), 375, 100)
        ctx.font = "bold 120px sans-serif"
        ctx.shadowColor = "rgba(201,168,76,0.6)"
        ctx.shadowBlur = 30
        ctx.fillText(code, 375, 280)
        ctx.shadowBlur = 0
        ctx.font = "bold 36px sans-serif"
        ctx.fillStyle = "rgba(255,255,255,0.9)"
        ctx.fillText(personality.title, 375, 360)
        ctx.font = "80px serif"
        ctx.fillText(personality.emoji, 375, 470)
        ctx.fillStyle = "rgba(201,168,76,0.8)"
        ctx.font = "italic 28px serif"
        ctx.fillText(`"${personality.quote}"`, 375, 560)
        ctx.fillStyle = "rgba(255,255,255,0.5)"
        ctx.font = "22px sans-serif"
        ctx.fillText(personality.quoteExplain, 375, 600)
        ctx.strokeStyle = "rgba(201,168,76,0.2)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(150, 640)
        ctx.lineTo(600, 640)
        ctx.stroke()
        ctx.fillStyle = "rgba(255,255,255,0.7)"
        ctx.font = "bold 24px sans-serif"
        ctx.fillText(t("am16.poster.diagnosis"), 375, 700)
        ctx.font = "20px sans-serif"
        ctx.fillStyle = "rgba(255,255,255,0.5)"
        wrapText(ctx, personality.diagnosis, 375, 740, 580, 28)
        ctx.fillStyle = "rgba(255,255,255,0.7)"
        ctx.font = "bold 24px sans-serif"
        ctx.fillText(t("am16.poster.guide"), 375, 920)
        ctx.font = "20px sans-serif"
        ctx.fillStyle = "rgba(255,255,255,0.5)"
        wrapText(ctx, personality.advice, 375, 960, 580, 28)
        ctx.fillStyle = "#C9A84C"
        ctx.font = "bold 28px sans-serif"
        ctx.fillText(t("am16.poster.scan"), 375, 1130)
        ctx.fillStyle = "rgba(255,255,255,0.3)"
        ctx.font = "18px sans-serif"
        ctx.fillText(`${t("am16.poster.stardust")}${inviteCode}`, 375, 1180)
        ctx.font = "16px sans-serif"
        ctx.fillStyle = "rgba(255,255,255,0.2)"
        ctx.fillText(t("am16.poster.brand"), 375, 1300)
        const dataUrl = canvas.toDataURL("image/png")
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        if (isIOS) {
          window.open(dataUrl, "_blank")
        } else {
          const link = document.createElement("a")
          link.download = `AM16-${code}-${Date.now()}.png`
          link.href = dataUrl
          link.click()
        }
        toast.success(t("am16.saveImage"))
      } catch {
        toast.error(t("am16.saveFailed"))
      }
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 md:space-y-8">
      {/* ═══ 主卡片 ═══ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="card-glass-elevated p-6 text-center relative overflow-hidden"
        role="article"
        aria-label={`${code} — ${personality.title}`}
      >
        <div className={`absolute inset-0 bg-gradient-to-b ${personality.bgGlow} pointer-events-none`} />

        <div className="relative">
          <p className="text-gold/50 text-xs tracking-widest uppercase mb-3">{t("am16.yourCode")}</p>

          {/* 超大编码 + 金色粒子 */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", damping: 8 }}
            className="relative inline-block"
          >
            {/* 粒子效果 — 减少数量避免移动端卡顿 */}
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {[0, 1, 2, 3].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-gold"
                  initial={{ opacity: 0, y: 0, x: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    y: [-8, -25],
                    x: [(i - 1.5) * 8, (i - 1.5) * 12],
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.5 + i * 0.15,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeOut",
                  }}
                  style={{ left: "50%", top: "80%" }}
                />
              ))}
            </div>

            <h1 className={`text-6xl md:text-7xl font-serif font-bold ${personality.color} tracking-wider`}
              style={{ textShadow: "0 0 40px rgba(201,168,76,0.3)" }}
            >
              {code}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-lg font-serif mt-3"
          >
            {personality.emoji} {personality.title}
          </motion.p>
        </div>
      </motion.div>

      {/* ═══ 四维雷达图 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-glass p-5"
      >
        <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4 text-center">
          {t("am16.fourDimCoords")}
        </h3>
        <div className="flex justify-center">
          <SquareRadar scores={radarScores} size={240} t={t} />
        </div>
      </motion.div>

      {/* ═══ 心学金句 — 通栏无卡片 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative py-6 px-2 text-center"
      >
        {/* 装饰性大引号 — 背景层 */}
        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-gold/[0.06] text-[120px] font-serif leading-none select-none pointer-events-none">
          &ldquo;
        </span>
        <p className="relative text-gold text-xl md:text-2xl font-serif italic leading-relaxed mb-2">
          &ldquo;{personality.quote}&rdquo;
        </p>
        <p className="relative text-white/40 text-sm">
          —— {personality.quoteExplain}
        </p>
      </motion.div>

      {/* ═══ 精神状态诊断 + 改运指南 并排 ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-glass p-5"
        >
          <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
            🧠 {t("am16.diagnosis")}
          </h3>
          <p className="text-white/70 text-sm leading-relaxed">
            <HighlightCrazy text={personality.diagnosis} />
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card-glass p-5"
        >
          <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
            🧭 {t("am16.advice")}
          </h3>
          <p className="text-white/70 text-sm leading-relaxed">
            <HighlightCrazy text={personality.advice} />
          </p>
        </motion.div>
      </div>

      {/* ═══ 匹配雷达 — Match / Avoid 双栏 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="grid grid-cols-2 gap-3"
      >
        {/* Match 卡片 */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 hover:shadow-[0_0_20px_rgba(52,211,153,0.08)] transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Heart size={13} className="text-emerald-400" />
            </div>
            <span className="text-emerald-400/80 text-xs font-medium">{t("am16.compatibleWith")}</span>
          </div>
          <div className="space-y-2">
            {compatNames.map((item) => item && (
              <div key={item.code} className="flex items-center gap-2">
                <span className="text-sm">{item.emoji}</span>
                <span className="text-white/70 text-xs leading-tight">{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Avoid 卡片 */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4 hover:shadow-[0_0_20px_rgba(248,113,113,0.08)] transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center">
              <Skull size={13} className="text-red-400" />
            </div>
            <span className="text-red-400/80 text-xs font-medium">{t("am16.clashWith")}</span>
          </div>
          <div className="space-y-2">
            {clashNames.map((item) => item && (
              <div key={item.code} className="flex items-center gap-2">
                <span className="text-sm">{item.emoji}</span>
                <span className="text-white/70 text-xs leading-tight">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ AI 深度解读 CTA — 流光 + 脉冲 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="relative rounded-2xl overflow-hidden"
      >
        {/* 流光边框动画 */}
        <div className="absolute inset-0 rounded-2xl p-[1px]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/0 via-gold/40 to-gold/0 animate-[shimmer_3s_ease-in-out_infinite]" />
        </div>

        <div className="relative card-glass-elevated p-6 m-[1px] rounded-2xl">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 text-gold/70 text-xs mb-2">
              <Wand2 size={14} />
              <span>{t("am16.ctaTitle")}</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-3">
              {t("am16.ctaDesc")}
            </p>
            <p className="text-white/40 text-xs">
              {t("am16.ctaFull").replace("{cost}", t("am16.ctaCost"))}
            </p>
          </div>

          <Link href="/reading/new" className="block relative group">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full btn-gold text-sm flex items-center justify-center gap-2 relative z-10"
            >
              🔮 {t("am16.ctaAction")}
              <span className="text-xs opacity-70">· 100 ✨</span>
            </motion.button>
            {/* 按钮呼吸光环 */}
            <div className="absolute -inset-1 rounded-xl bg-gold/10 animate-[pulse_2s_ease-in-out_infinite] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </motion.div>

      {/* ═══ 操作按钮 — 保存长图提权 ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="flex gap-3"
      >
        {/* 保存长图 — 黑金渐变实体按钮 */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 relative group text-sm flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300
            bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 border border-gold/40 text-gold
            hover:from-gold/30 hover:via-gold/15 hover:to-gold/30 hover:border-gold/60 hover:shadow-[0_0_20px_rgba(201,168,76,0.15)]
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          {downloading ? t("am16.saving") : t("am16.saveImage")}
          {/* ✨ 动效提示 */}
          <span className="absolute -top-1 -right-1 text-[10px] animate-[sparkle_2s_ease-in-out_infinite]">✨</span>
        </button>

        {/* 分享按钮 */}
        <button
          onClick={() => setShareOpen(true)}
          className="flex-1 btn-gold-outline text-sm flex items-center justify-center gap-2"
        >
          <Share2 size={14} />
          {t("am16.share")}
        </button>
      </motion.div>

      {/* 邀请码 */}
      {user && (
        <div className="text-center">
          <p className="text-white/25 text-[11px]">
            {t("am16.inviteCode")}: <span className="text-gold/50">{user.referral_code}</span>
          </p>
          <p className="text-white/20 text-[10px] mt-1">
            {t("am16.inviteBonus")}
          </p>
        </div>
      )}

      {/* 重新测试 */}
      <div className="text-center pt-2 space-y-3">
        <button
          onClick={onRestart}
          className="text-white/30 text-xs hover:text-gold/60 transition-colors inline-flex items-center gap-1"
        >
          <RefreshCw size={12} />
          {t("am16.restart")}
        </button>
        <div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-white/20 text-[11px] hover:text-gold/40 transition-colors"
          >
            ↑ {t("am16.backToTop")}
          </button>
        </div>
      </div>

      {/* ═══ 分享底部面板 ═══ */}
      <AnimatePresence>
        {shareOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShareOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-ink border-t border-gold/20 rounded-t-3xl p-6 max-w-lg mx-auto"
              style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom, 2.5rem))" }}
              role="dialog"
              aria-label={t("am16.shareTitle")}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-lg text-gold">{t("am16.shareTitle")}</h3>
                <button onClick={() => setShareOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <button onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-white/60" />}
                  </div>
                  <span className="text-[10px] text-white/40">{copied ? t("am16.copied") : t("am16.copyLink")}</span>
                </button>

                {typeof navigator !== "undefined" && !!navigator.share && (
                  <button onClick={handleShare}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                      <Share2 size={18} className="text-white/60" />
                    </div>
                    <span className="text-[10px] text-white/40">{t("am16.moreShare")}</span>
                  </button>
                )}

                <button onClick={handleDownload}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <Download size={18} className="text-white/60" />
                  </div>
                  <span className="text-[10px] text-white/40">{t("am16.saveImage")}</span>
                </button>

                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 transition-all group opacity-60 cursor-not-allowed">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-sm">💚</span>
                  </div>
                  <span className="text-[10px] text-white/40">{t("am16.wechat")}</span>
                </div>
              </div>

              {/* 邀请码卡片 */}
              {user && (
                <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent rounded-xl p-4 border border-gold/20 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift size={16} className="text-gold" />
                    <span className="text-gold text-sm font-medium">{t("am16.inviteFriends")}</span>
                  </div>
                  <p className="text-white/40 text-xs mb-3">{t("am16.inviteDesc")}</p>
                  <button
                    onClick={handleCopyReferral}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gold/10 border border-gold/30 text-gold text-xs hover:bg-gold/20 transition-all"
                  >
                    {copiedReferral ? <><Check size={12} /> {t("am16.copied")}</> : <><Users size={12} /> {t("am16.copyInviteLink")}</>}
                  </button>
                </div>
              )}

              {/* 分享预览 */}
              <div className="bg-gradient-to-br from-gold/10 via-ink-light to-ink rounded-xl p-4 border border-gold/20">
                <p className="text-white/40 text-xs mb-1">{t("am16.sharePreview")}</p>
                <p className="text-gold text-sm font-medium">
                  {personality.emoji} {code} — {personality.title}
                </p>
                <p className="text-white/30 text-xs mt-1">
                  {t("am16.sharePreviewText")}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Canvas 文字自动换行 ──
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const chars = text.split("")
  let line = ""
  let currentY = y

  for (const char of chars) {
    const testLine = line + char
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY)
      line = char
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY)
  }
}

// ── 正方形四维雷达图（能量场展开动画 + 轴标百分比）──
function SquareRadar({
  scores,
  size = 240,
  t,
}: {
  scores: Record<string, number>
  size?: number
  t: (key: string) => string
}) {
  const [expanded, setExpanded] = useState(false)
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.38

  useEffect(() => {
    const timer = setTimeout(() => setExpanded(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const corners = [
    { x: cx, y: cy - radius },
    { x: cx + radius, y: cy },
    { x: cx, y: cy + radius },
    { x: cx - radius, y: cy },
  ]

  const dims = ["FD", "XS", "GI", "PE"]
  const radarLabels = ["radarDefiance", "radarXinxue", "radarGiver", "radarPatience"] as const
  const dimNamesA = ["dim.FD.nameA", "dim.XS.nameA", "dim.GI.nameA", "dim.PE.nameA"] as const
  const dimNamesB = ["dim.FD.nameB", "dim.XS.nameB", "dim.GI.nameB", "dim.PE.nameB"] as const

  const dataPoints = corners.map((c, i) => {
    const val = (scores[dims[i]] ?? 50) / 100
    const ratio = expanded ? 0.2 + val * 0.8 : 0
    return {
      x: cx + (c.x - cx) * ratio,
      y: cy + (c.y - cy) * ratio,
      val: Math.round((scores[dims[i]] ?? 50)),
    }
  })

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"

  const padding = 40
  const vb = `-${padding} -${padding} ${size + padding * 2} ${size + padding * 2}`

  return (
    <svg width={size + padding * 2} height={size + padding * 2} viewBox={vb} className="will-change-transform">
      {/* 呼吸光晕 — 静态版本，避免移动端持续重绘 */}
      <defs>
        <radialGradient id="radarGlow">
          <stop offset="0%" stopColor="rgba(201,168,76,0.12)" />
          <stop offset="100%" stopColor="rgba(201,168,76,0)" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={radius * 0.8} fill="url(#radarGlow)" opacity="0.5" />

      {/* 网格线 */}
      {[0.33, 0.66, 1].map((scale, i) => (
        <polygon
          key={i}
          points={corners.map(c =>
            `${cx + (c.x - cx) * scale},${cy + (c.y - cy) * scale}`
          ).join(" ")}
          fill="none"
          stroke="rgba(201,168,76,0.12)"
          strokeWidth="0.5"
        />
      ))}

      {/* 对角线 */}
      {corners.map((c, i) => (
        <line key={i} x1={cx} y1={cy} x2={c.x} y2={c.y}
          stroke="rgba(201,168,76,0.08)" strokeWidth="0.5" />
      ))}

      {/* 数据多边形 — 能量场展开 */}
      <path
        d={dataPath}
        fill="rgba(201,168,76,0.15)"
        stroke="#C9A84C"
        strokeWidth="1.5"
        style={{ transition: "opacity 0.6s ease" }}
      />

      {/* 数据点 — 使用 CSS 代替 SVG filter 避免 GPU 开销 */}
      {expanded && dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#C9A84C"
          className="am16-radar-dot" />
      ))}

      {/* 标签 + 轴标百分比 */}
      {corners.map((c, i) => {
        const labelOffset = 28
        const dx = c.x - cx
        const dy = c.y - cy
        const len = Math.sqrt(dx * dx + dy * dy)
        const nx = dx / len
        const ny = dy / len
        const val = dataPoints[i].val
        const dominantName = val > 50 ? t(`am16.${dimNamesB[i]}`) : t(`am16.${dimNamesA[i]}`)
        return (
          <g key={i}>
            <text
              x={c.x + nx * labelOffset}
              y={c.y + ny * labelOffset - 7}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.6)"
              fontSize="12"
              fontWeight="600"
            >
              {t(`am16.${radarLabels[i]}`)}
            </text>
            <text
              x={c.x + nx * labelOffset}
              y={c.y + ny * labelOffset + 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(201,168,76,0.7)"
              fontSize="10"
            >
              {dominantName} {val}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}
