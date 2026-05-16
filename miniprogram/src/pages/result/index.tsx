import { useState, useRef, useCallback } from "react"
import { View, Text, Canvas, Button } from "@tarojs/components"
import Taro, { useDidShow } from "@tarojs/taro"
import {
  PERSONALITIES,
  DIMENSIONS,
  calculateArchetype,
  calculateRadarScores,
  type Personality,
} from "../../constants/am16"

// ── 高亮发疯文案：**关键词** → 金色 ──
function HighlightText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={i} className="text-[#D4AF37] font-semibold">
              {part.slice(2, -2)}
            </Text>
          )
        }
        return <Text key={i}>{part}</Text>
      })}
    </>
  )
}

// ── 维度名称映射 ──
function getDimLabel(code: string, val: number): string {
  const dim = DIMENSIONS.find(d => d.code === code)
  if (!dim) return code
  return val > 50 ? dim.nameB : dim.nameA
}

export default function ResultPage() {
  const [archetype, setArchetype] = useState("")
  const [personality, setPersonality] = useState<Personality | null>(null)
  const [radarScores, setRadarScores] = useState<Record<string, number>>({})
  const [showDetail, setShowDetail] = useState(false)
  const radarNodeRef = useRef<any>(null)
  const posterNodeRef = useRef<any>(null)

  useDidShow(() => {
    try {
      const raw = Taro.getStorageSync("am16_answers")
      if (!raw) {
        Taro.navigateTo({ url: "/pages/quiz/index" })
        return
      }
      const answers = JSON.parse(raw)
      const code = calculateArchetype(answers)
      const radar = calculateRadarScores(answers)
      setArchetype(code)
      setPersonality(PERSONALITIES[code] ?? PERSONALITIES["DXIE"])
      setRadarScores(radar)
      setTimeout(() => setShowDetail(true), 600)
    } catch {
      Taro.navigateTo({ url: "/pages/quiz/index" })
    }
  })

  // ── 雷达图：节点就绪 + 数据就绪时绘制 ──
  const onRadarCanvasReady = useCallback((node: any) => {
    if (node) {
      radarNodeRef.current = node
      if (radarScores.FD !== undefined) {
        drawRadar(node, radarScores, 280)
      }
    }
  }, [radarScores])

  // ── 海报：showDetail 后绘制 ──
  const onPosterCanvasReady = useCallback((node: any) => {
    if (node && showDetail && archetype && personality) {
      posterNodeRef.current = node
      drawSharePoster(node, archetype, personality)
    }
  }, [showDetail, archetype, personality])

  if (!personality) {
    return (
      <View className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Text className="text-white/30 text-sm">加载中…</Text>
      </View>
    )
  }

  const compatNames = personality.compatible.map(c => PERSONALITIES[c]).filter(Boolean)
  const clashNames = personality.clash.map(c => PERSONALITIES[c]).filter(Boolean)

  // ── 保存海报到相册 ──
  const handleSavePoster = () => {
    const node = posterNodeRef.current
    if (!node) {
      Taro.showToast({ title: "海报生成中，请稍候", icon: "none" })
      return
    }
    Taro.canvasToTempFilePath({
      canvas: node,
      width: 750,
      height: 1334,
      destWidth: 750 * 2,
      destHeight: 1334 * 2,
      success(res) {
        Taro.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success() { Taro.showToast({ title: "已保存到相册", icon: "success" }) },
          fail() { Taro.showToast({ title: "保存失败，请授权相册权限", icon: "none" }) },
        })
      },
      fail() { Taro.showToast({ title: "生成海报失败", icon: "none" }) },
    })
  }

  // ── 分享给朋友 ──
  Taro.showShareMenu({ withShareTicket: true })

  return (
    <View className="min-h-screen bg-[#0A0A0A] pb-32">
      {/* ═══ 人格 Header — 脉动流光 ═══ */}
      <View className="relative pt-16 pb-8 text-center overflow-hidden">
        {/* 背景光晕 */}
        <View className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/[0.06] to-transparent pointer-events-none" />

        <Text className="relative text-white/30 text-[10px] tracking-[0.3em] uppercase block mb-3">
          Your Destiny Code
        </Text>

        {/* 巨型编码 + 粒子 */}
        <View className="relative inline-block">
          {/* 脉动光环 */}
          <View className="absolute -inset-8 bg-[#D4AF37]/[0.08] rounded-full animate-pulse pointer-events-none" />
          <Text
            className="relative text-7xl font-bold tracking-wider block"
            style={{
              color: "#D4AF37",
              textShadow: "0 0 40px rgba(212,175,55,0.4), 0 0 80px rgba(212,175,55,0.15)",
            }}
          >
            {archetype}
          </Text>
        </View>

        <Text className="relative text-white/80 text-lg font-serif mt-3 block">
          {personality.emoji} {personality.title}
        </Text>
      </View>

      {showDetail && (
        <View className="px-5 space-y-5">
          {/* ═══ 心学金句 — 通栏无卡片 ═══ */}
          <View className="relative py-6 text-center">
            {/* 装饰性大引号 */}
            <Text className="absolute top-0 left-1/2 -translate-x-1/2 text-[#D4AF37]/[0.06] text-[120px] font-serif leading-none select-none pointer-events-none">
              &ldquo;
            </Text>
            <Text className="relative text-[#D4AF37] text-xl font-serif italic leading-relaxed block px-4">
              &ldquo;{personality.quote}&rdquo;
            </Text>
            <Text className="relative text-white/40 text-sm mt-2 block">
              —— {personality.quoteExplain}
            </Text>
          </View>

          {/* ═══ 雷达图 ═══ */}
          <View className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-5">
            <Text className="text-white/50 text-[10px] tracking-wider uppercase block text-center mb-4">
              四维能量坐标
            </Text>
            <Canvas
              type="2d"
              id="radarCanvas"
              style={{ width: "280px", height: "280px", margin: "0 auto" }}
              ref={(ref) => {
                if (ref && radarScores.FD !== undefined) {
                  // Taro Canvas 2d ref 是组件实例，需要通过 query 获取 node
                  const query = Taro.createSelectorQuery()
                  query.select("#radarCanvas").fields({ node: true, size: true }, (res) => {
                    if (res && res.node) {
                      onRadarCanvasReady(res.node)
                    }
                  }).exec()
                }
              }}
            />
            {/* 轴标 + 百分比 */}
            <View className="grid grid-cols-4 gap-2 mt-4 text-center">
              {DIMENSIONS.map(d => {
                const val = radarScores[d.code] ?? 50
                const label = getDimLabel(d.code, val)
                return (
                  <View key={d.code}>
                    <Text className="text-white/50 text-[10px] font-medium block">{d.code}</Text>
                    <Text className="text-[#D4AF37]/60 text-[9px] block mt-0.5">
                      {label} {val}%
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>

          {/* ═══ 精神状态诊断 ═══ */}
          <View className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-5">
            <Text className="text-white/50 text-[10px] tracking-wider uppercase block mb-3">
              🧠 精神状态诊断
            </Text>
            <Text className="text-white/70 text-sm leading-relaxed">
              <HighlightText text={personality.diagnosis} />
            </Text>
          </View>

          {/* ═══ 改运指南 ═══ */}
          <View className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-5">
            <Text className="text-white/50 text-[10px] tracking-wider uppercase block mb-3">
              🧭 改运指南
            </Text>
            <Text className="text-white/70 text-sm leading-relaxed">
              <HighlightText text={personality.advice} />
            </Text>
          </View>

          {/* ═══ 社交匹配双栏 ═══ */}
          <View className="grid grid-cols-2 gap-3">
            {/* 天作之合 */}
            <View className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4">
              <View className="flex items-center gap-2 mb-3">
                <View className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Text className="text-emerald-400 text-xs">💕</Text>
                </View>
                <Text className="text-emerald-400/80 text-[11px] font-medium">天作之合</Text>
              </View>
              <View className="space-y-2">
                {compatNames.map((p) => p && (
                  <View key={p.code} className="flex items-center gap-2">
                    <Text className="text-sm">{p.emoji}</Text>
                    <Text className="text-white/70 text-[11px] leading-tight">{p.title}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 离远点保命 */}
            <View className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4">
              <View className="flex items-center gap-2 mb-3">
                <View className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Text className="text-red-400 text-xs">⚠️</Text>
                </View>
                <Text className="text-red-400/80 text-[11px] font-medium">离远点保命</Text>
              </View>
              <View className="space-y-2">
                {clashNames.map((p) => p && (
                  <View key={p.code} className="flex items-center gap-2">
                    <Text className="text-sm">{p.emoji}</Text>
                    <Text className="text-white/70 text-[11px] leading-tight">{p.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ═══ AI 深度解读 CTA — 流光边框 ═══ */}
          <View className="relative rounded-2xl overflow-hidden">
            <View className="absolute inset-0 rounded-2xl border border-[#D4AF37]/30 animate-pulse pointer-events-none" />
            <View className="relative bg-white/[0.04] rounded-2xl p-5 m-[1px]">
              <View className="text-center mb-4">
                <Text className="text-[#D4AF37]/70 text-xs block mb-2">💡 星轨预警</Text>
                <Text className="text-white/60 text-sm leading-relaxed block mb-2">
                  诊断显示你当前的人格气场在 2026 流年中正遭遇微弱的能量对冲。
                </Text>
                <Text className="text-white/40 text-xs block">
                  消耗 100 星尘，解锁五大 AI 导师定制的流年改运全维大报告
                </Text>
              </View>

              {/* 金色呼吸按钮 */}
              <View
                className="w-full py-3 rounded-xl text-center relative overflow-hidden active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #D4AF37 0%, #B8960C 50%, #D4AF37 100%)",
                }}
                onClick={() => {
                  Taro.showToast({ title: "跳转中…", icon: "loading" })
                  // TODO: 跳转到 AI 解读页面
                }}
              >
                <View className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                <Text className="relative text-[#0A0A0A] text-sm font-bold">
                  🔮 开启命运解读 · 100 ✨
                </Text>
              </View>
            </View>
          </View>

          {/* ═══ 操作按钮 ═══ */}
          <View className="grid grid-cols-2 gap-3">
            {/* 保存海报 — 黑金渐变 */}
            <View
              className="py-3 rounded-xl text-center border border-[#D4AF37]/40 active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 50%, rgba(212,175,55,0.15) 100%)",
              }}
              onClick={handleSavePoster}
            >
              <Text className="text-[#D4AF37] text-sm">✨ 保存海报</Text>
            </View>

            {/* 分享 — 使用 Button openType="share" 触发转发 */}
            <Button
              openType="share"
              className="py-3 rounded-xl text-center border border-white/10 bg-white/[0.04] active:scale-[0.97] leading-none min-h-0"
              style={{ margin: 0, padding: "12px 0", lineHeight: "normal" }}
            >
              <Text className="text-white/70 text-sm">📤 分享结果</Text>
            </Button>
          </View>

          {/* 重新测试 */}
          <View className="text-center pt-2 pb-8">
            <Text
              className="text-white/25 text-xs active:text-[#D4AF37]/60"
              onClick={() => {
                Taro.removeStorageSync("am16_answers")
                Taro.navigateTo({ url: "/pages/quiz/index" })
              }}
            >
              🔄 重新测试
            </Text>
          </View>
        </View>
      )}

      {/* ═══ 隐藏 Canvas — 海报生成 ═══ */}
      <Canvas
        type="2d"
        id="shareCanvas"
        style={{ position: "fixed", left: "-9999px", top: "-9999px", width: "750px", height: "1334px" }}
        ref={(ref) => {
          if (ref && showDetail) {
            const query = Taro.createSelectorQuery()
            query.select("#shareCanvas").fields({ node: true, size: true }, (res) => {
              if (res && res.node) {
                onPosterCanvasReady(res.node)
              }
            }).exec()
          }
        }}
      />
    </View>
  )
}

// ── 页面级分享回调 ──
export function onShareAppMessage() {
  return {
    title: "测测你的天命格局 — AlphaMirror 命盘智镜",
    path: "/pages/quiz/index",
  }
}

// ═══════════════════════════════════════════════════════════════
// Canvas 绘制：雷达图
// ═══════════════════════════════════════════════════════════════

function drawRadar(canvasNode: any, scores: Record<string, number>, size: number) {
  const ctx = canvasNode.getContext("2d")
  const dpr = Taro.getSystemInfoSync().pixelRatio
  canvasNode.width = size * dpr
  canvasNode.height = size * dpr
  ctx.scale(dpr, dpr)

  const cx = size / 2
  const cy = size / 2
  const r = size * 0.36
  const dims = ["FD", "XS", "GI", "PE"]
  const corners = [
    { x: cx, y: cy - r },
    { x: cx + r, y: cy },
    { x: cx, y: cy + r },
    { x: cx - r, y: cy },
  ]

  // 网格
  ctx.strokeStyle = "rgba(212,175,55,0.1)"
  ctx.lineWidth = 0.5
  for (const scale of [0.33, 0.66, 1]) {
    ctx.beginPath()
    corners.forEach((c, i) => {
      const x = cx + (c.x - cx) * scale
      const y = cy + (c.y - cy) * scale
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.stroke()
  }

  // 对角线
  ctx.strokeStyle = "rgba(212,175,55,0.06)"
  corners.forEach(c => {
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(c.x, c.y)
    ctx.stroke()
  })

  // 数据多边形
  ctx.beginPath()
  corners.forEach((c, i) => {
    const val = (scores[dims[i]] ?? 50) / 100
    const ratio = 0.2 + val * 0.8
    const x = cx + (c.x - cx) * ratio
    const y = cy + (c.y - cy) * ratio
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  ctx.closePath()
  ctx.fillStyle = "rgba(212,175,55,0.12)"
  ctx.fill()
  ctx.strokeStyle = "#D4AF37"
  ctx.lineWidth = 1.5
  ctx.stroke()

  // 数据点
  corners.forEach((c, i) => {
    const val = (scores[dims[i]] ?? 50) / 100
    const ratio = 0.2 + val * 0.8
    const x = cx + (c.x - cx) * ratio
    const y = cy + (c.y - cy) * ratio
    ctx.beginPath()
    ctx.arc(x, y, 3.5, 0, Math.PI * 2)
    ctx.fillStyle = "#D4AF37"
    ctx.fill()
  })
}

// ═══════════════════════════════════════════════════════════════
// Canvas 绘制：分享海报（750×1334）
// ═══════════════════════════════════════════════════════════════

function drawSharePoster(canvasNode: any, code: string, p: Personality) {
  const ctx = canvasNode.getContext("2d")
  const dpr = Taro.getSystemInfoSync().pixelRatio
  canvasNode.width = 750 * dpr
  canvasNode.height = 1334 * dpr
  ctx.scale(dpr, dpr)
  const W = 750, H = 1334

  // 背景渐变
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, "#0A0A0A")
  grad.addColorStop(0.5, "#111111")
  grad.addColorStop(1, "#0A0A0A")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // 星盘圆形装饰
  ctx.strokeStyle = "rgba(212,175,55,0.06)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(W / 2, 350, 260, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(W / 2, 350, 200, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(W / 2, 350, 140, 0, Math.PI * 2)
  ctx.stroke()

  // 品牌标题
  ctx.textAlign = "center"
  ctx.fillStyle = "rgba(212,175,55,0.5)"
  ctx.font = "14px sans-serif"
  ctx.fillText("AlphaMirror 命盘智镜", W / 2, 60)

  // 巨型编码
  ctx.fillStyle = "#D4AF37"
  ctx.font = "bold 120px sans-serif"
  ctx.shadowColor = "rgba(212,175,55,0.5)"
  ctx.shadowBlur = 30
  ctx.fillText(code, W / 2, 300)
  ctx.shadowBlur = 0

  // Emoji + 人格名
  ctx.font = "60px serif"
  ctx.fillText(p.emoji, W / 2, 420)
  ctx.font = "bold 28px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.9)"
  ctx.fillText(p.title, W / 2, 470)

  // 心学金句
  ctx.fillStyle = "rgba(212,175,55,0.7)"
  ctx.font = "italic 24px serif"
  ctx.fillText(`"${p.quote}"`, W / 2, 550)
  ctx.fillStyle = "rgba(255,255,255,0.4)"
  ctx.font = "18px sans-serif"
  ctx.fillText(p.quoteExplain, W / 2, 585)

  // 分隔线
  ctx.strokeStyle = "rgba(212,175,55,0.15)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(150, 630)
  ctx.lineTo(600, 630)
  ctx.stroke()

  // 诊断
  ctx.fillStyle = "rgba(255,255,255,0.6)"
  ctx.font = "bold 20px sans-serif"
  ctx.fillText("精神状态诊断", W / 2, 680)
  ctx.font = "16px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.45)"
  wrapText(ctx, p.diagnosis, W / 2, 720, 600, 24)

  // 改运指南
  ctx.fillStyle = "rgba(255,255,255,0.6)"
  ctx.font = "bold 20px sans-serif"
  ctx.fillText("改运指南", W / 2, 920)
  ctx.font = "16px sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.45)"
  wrapText(ctx, p.advice, W / 2, 960, 600, 24)

  // CTA
  ctx.fillStyle = "#D4AF37"
  ctx.font = "bold 22px sans-serif"
  ctx.fillText("扫码测测你的天命格局", W / 2, 1140)

  // 小程序码占位
  ctx.beginPath()
  ctx.arc(W / 2, 1220, 40, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(212,175,55,0.1)"
  ctx.fill()
  ctx.strokeStyle = "rgba(212,175,55,0.3)"
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = "rgba(255,255,255,0.3)"
  ctx.font = "12px sans-serif"
  ctx.fillText("小程序码", W / 2, 1225)

  // 底部文案
  ctx.fillStyle = "rgba(255,255,255,0.25)"
  ctx.font = "12px sans-serif"
  ctx.fillText("新用户立赠 20 星尘能量 · 官网同步登录", W / 2, 1300)
  ctx.fillText("AlphaMirror · 命盘智镜", W / 2, 1320)
}

function wrapText(
  ctx: any,
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
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY)
      line = char
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) ctx.fillText(line, x, currentY)
}
