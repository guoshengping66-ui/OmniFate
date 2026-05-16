"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Share2, Download, Check, Sparkles, Heart, Skull, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { PERSONALITIES, DIMENSIONS } from "@/lib/am16/constants"
import { calculateAM16 } from "@/lib/am16/calculator"
import Link from "next/link"

interface Props {
  answers: number[]
  onRestart: () => void
}

export function AM16ResultCard({ answers, onRestart }: Props) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const result = calculateAM16(answers)
  const { personality, radarScores, code } = result

  // 相容 / 冲突人格名称
  const compatNames = personality.compatible.map(c => PERSONALITIES[c]?.emoji + " " + c).join(" · ")
  const clashNames = personality.clash.map(c => PERSONALITIES[c]?.emoji + " " + c).join(" · ")

  const handleCopyInvite = async () => {
    if (!user) {
      toast("登录后可获取专属邀请码")
      return
    }
    const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${user.referral_code || ""}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success("邀请链接已复制！好友注册后双方各得 20 星尘")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("复制失败")
    }
  }

  // ── Canvas 海报生成 ──
  const handleDownload = () => {
    setDownloading(true)
    try {
      const canvas = document.createElement("canvas")
      canvas.width = 750
      canvas.height = 1334
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // 背景渐变
      const grad = ctx.createLinearGradient(0, 0, 750, 1334)
      grad.addColorStop(0, "#1a1030")
      grad.addColorStop(0.5, "#2D1B4E")
      grad.addColorStop(1, "#140f24")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 750, 1334)

      // 星盘底纹光晕
      ctx.fillStyle = "rgba(201,168,76,0.08)"
      ctx.beginPath()
      ctx.arc(375, 350, 280, 0, Math.PI * 2)
      ctx.fill()

      // 顶部标题
      ctx.fillStyle = "#C9A84C"
      ctx.font = "bold 32px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("✦ AM16 天命编码 ✦", 375, 100)

      // 4字母编码（超大霓虹）
      ctx.font = "bold 120px sans-serif"
      ctx.fillStyle = "#C9A84C"
      ctx.shadowColor = "rgba(201,168,76,0.6)"
      ctx.shadowBlur = 30
      ctx.fillText(code, 375, 280)
      ctx.shadowBlur = 0

      // 称号
      ctx.font = "bold 36px sans-serif"
      ctx.fillStyle = "rgba(255,255,255,0.9)"
      ctx.fillText(personality.title, 375, 360)

      // Emoji
      ctx.font = "80px serif"
      ctx.fillText(personality.emoji, 375, 470)

      // 王阳明金句
      ctx.fillStyle = "rgba(201,168,76,0.8)"
      ctx.font = "italic 28px serif"
      ctx.fillText(`"${personality.quote}"`, 375, 560)

      ctx.fillStyle = "rgba(255,255,255,0.5)"
      ctx.font = "22px sans-serif"
      ctx.fillText(personality.quoteExplain, 375, 600)

      // 分隔线
      ctx.strokeStyle = "rgba(201,168,76,0.2)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(150, 640)
      ctx.lineTo(600, 640)
      ctx.stroke()

      // 精神状态
      ctx.fillStyle = "rgba(255,255,255,0.7)"
      ctx.font = "bold 24px sans-serif"
      ctx.fillText("🧠 精神状态诊断", 375, 700)

      // 诊断文字（自动换行）
      ctx.font = "20px sans-serif"
      ctx.fillStyle = "rgba(255,255,255,0.5)"
      wrapText(ctx, personality.diagnosis, 375, 740, 580, 28)

      // 改运建议
      ctx.fillStyle = "rgba(255,255,255,0.7)"
      ctx.font = "bold 24px sans-serif"
      ctx.fillText("🧭 改运指南", 375, 920)

      ctx.font = "20px sans-serif"
      ctx.fillStyle = "rgba(255,255,255,0.5)"
      wrapText(ctx, personality.advice, 375, 960, 580, 28)

      // 底部 CTA
      ctx.fillStyle = "#C9A84C"
      ctx.font = "bold 28px sans-serif"
      ctx.fillText("🔮 扫码测测你的天命", 375, 1130)

      // 邀请码
      ctx.fillStyle = "rgba(255,255,255,0.3)"
      ctx.font = "18px sans-serif"
      const inviteCode = user?.referral_code || "DESTINY"
      ctx.fillText(`新用户立赠 20 星尘能量 · 邀请码: ${inviteCode}`, 375, 1180)

      // 品牌
      ctx.font = "16px sans-serif"
      ctx.fillStyle = "rgba(255,255,255,0.2)"
      ctx.fillText("命盘智镜 AlphaMirror · AI 赋能千年玄学", 375, 1300)

      // 下载
      const link = document.createElement("a")
      link.download = `AM16-${code}-${Date.now()}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("海报已保存")
    } catch {
      toast.error("保存失败")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* ═══ 主卡片 ═══ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="card-glass-elevated p-6 text-center relative overflow-hidden"
      >
        {/* 背景光晕 */}
        <div className={`absolute inset-0 bg-gradient-to-b ${personality.bgGlow} pointer-events-none`} />

        {/* 标题 */}
        <div className="relative">
          <p className="text-gold/50 text-xs tracking-widest uppercase mb-3">✦ AM16 天命编码 ✦</p>

          {/* 超大编码 */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", damping: 8 }}
            className="relative inline-block"
          >
            <h1 className={`text-6xl md:text-7xl font-serif font-bold ${personality.color} tracking-wider`}
              style={{ textShadow: "0 0 40px rgba(201,168,76,0.3)" }}
            >
              {code}
            </h1>
          </motion.div>

          {/* 称号 */}
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
        <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4 text-center">
          四维能量坐标
        </h3>
        <div className="flex justify-center">
          <SquareRadar scores={radarScores} size={220} />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          {DIMENSIONS.map(d => (
            <div key={d.code}>
              <div className={`text-xs font-medium ${d.letterA in radarScores ? "text-white/60" : "text-white/40"}`}>
                {d.code}
              </div>
              <div className="text-[10px] text-white/30 mt-0.5">
                {radarScores[d.code] > 50 ? d.nameB : d.nameA}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ 王阳明金句 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-glow p-5 relative overflow-hidden"
      >
        <div className="absolute top-3 right-3 text-gold/10 text-5xl font-serif select-none">"</div>
        <h3 className="text-gold/60 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles size={12} /> 心学金句
        </h3>
        <p className="text-gold text-lg font-serif italic mb-1">"{personality.quote}"</p>
        <p className="text-white/50 text-sm">—— {personality.quoteExplain}</p>
      </motion.div>

      {/* ═══ 精神状态诊断 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-glass p-5"
      >
        <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
          🧠 精神状态诊断
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">{personality.diagnosis}</p>
      </motion.div>

      {/* ═══ 改运指南 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card-glass p-5"
      >
        <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
          🧭 改运指南
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">{personality.advice}</p>
      </motion.div>

      {/* ═══ 匹配雷达 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card-glass p-5"
      >
        <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4 text-center">
          ─── 匹配雷达 ───
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0">
              <Heart size={14} className="text-pink-400" />
            </div>
            <div>
              <p className="text-white/60 text-xs mb-0.5">今日天作之合</p>
              <p className="text-white/80 text-sm font-medium">{compatNames || "暂无数据"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Skull size={14} className="text-red-400" />
            </div>
            <div>
              <p className="text-white/60 text-xs mb-0.5">今日离远点保命</p>
              <p className="text-white/80 text-sm font-medium">{clashNames || "暂无数据"}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ CTA 变现 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="card-glass-elevated p-6 border-gold/20"
      >
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 text-gold/60 text-xs mb-2">
            <Sparkles size={12} />
            <span>AI 深度解读</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-3">
            诊断显示：你当前的人格气场在 2026 流年中正遭遇微弱的能量对冲。
          </p>
          <p className="text-white/40 text-xs">
            点击下方按钮，消耗 <span className="text-gold font-medium">100 星尘</span>，直接调取五大 AI 导师为你定制完整的
            <span className="text-gold">【流年改运通关报告】</span>！
          </p>
        </div>
        <Link href="/reading/new" className="block">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full btn-gold text-sm flex items-center justify-center gap-2"
          >
            🔮 开启命运解读
            <span className="text-xs opacity-70">· 100 ✨</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* ═══ 操作按钮 ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="flex gap-3"
      >
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 btn-gold-outline text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Download size={14} />
          {downloading ? "保存中..." : "保存长图"}
        </button>
        <button
          onClick={handleCopyInvite}
          className="flex-1 btn-gold-outline text-sm flex items-center justify-center gap-2"
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          {copied ? "已复制" : "分享"}
        </button>
      </motion.div>

      {/* 邀请码 */}
      {user && (
        <div className="text-center">
          <p className="text-white/25 text-[11px]">
            你的专属邀请码: <span className="text-gold/50">{user.referral_code}</span>
          </p>
          <p className="text-white/20 text-[10px] mt-1">
            新用户立赠 20 星尘能量
          </p>
        </div>
      )}

      {/* 重新测试 */}
      <div className="text-center pt-2">
        <button
          onClick={onRestart}
          className="text-white/30 text-xs hover:text-gold/60 transition-colors inline-flex items-center gap-1"
        >
          <RefreshCw size={12} />
          重新测试
        </button>
      </div>
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

// ── 正方形四维雷达图 ──
function SquareRadar({
  scores,
  size = 220,
}: {
  scores: Record<string, number>
  size?: number
}) {
  const [animated, setAnimated] = useState(false)
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.38

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(t)
  }, [])

  // 四个角：上(FD) 右(XS) 下(GI) 左(PE)
  const corners = [
    { x: cx, y: cy - radius },           // 上: FD
    { x: cx + radius, y: cy },           // 右: XS
    { x: cx, y: cy + radius },           // 下: GI
    { x: cx - radius, y: cy },           // 左: PE
  ]

  const dims = ["FD", "XS", "GI", "PE"]
  const labels = ["逆天 ↑", "格物 →", "修仙 ↓", "躺平 ←"]

  // 数据点（根据分数偏移）
  const dataPoints = corners.map((c, i) => {
    const val = (scores[dims[i]] ?? 50) / 100
    const ratio = 0.2 + val * 0.8 // 最小 20%
    const midCx = cx
    const midCy = cy
    return {
      x: midCx + (c.x - midCx) * ratio,
      y: midCy + (c.y - midCy) * ratio,
    }
  })

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* 网格线（3层正方形） */}
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

      {/* 数据多边形 */}
      <path
        d={animated ? dataPath : `M ${cx} ${cy} L ${cx} ${cy} L ${cx} ${cy} L ${cx} ${cy} Z`}
        fill="rgba(201,168,76,0.15)"
        stroke="#C9A84C"
        strokeWidth="1.5"
        style={{ transition: "all 0.8s ease-out" }}
      />

      {/* 数据点 */}
      {animated && dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#C9A84C"
          style={{ filter: "drop-shadow(0 0 4px rgba(201,168,76,0.5))" }} />
      ))}

      {/* 标签 */}
      {corners.map((c, i) => {
        const labelOffset = 18
        const dx = c.x - cx
        const dy = c.y - cy
        const len = Math.sqrt(dx * dx + dy * dy)
        const nx = dx / len
        const ny = dy / len
        return (
          <text key={i}
            x={c.x + nx * labelOffset}
            y={c.y + ny * labelOffset}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
          >
            {labels[i]}
          </text>
        )
      })}
    </svg>
  )
}
