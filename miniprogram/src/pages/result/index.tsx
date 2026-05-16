import { useState, useRef, useEffect } from "react"
import { View, Text, Canvas, Button } from "@tarojs/components"
import Taro, { useDidShow } from "@tarojs/taro"
import {
  PERSONALITIES,
  DIMENSIONS,
  calculateArchetype,
  calculateRadarScores,
  type Personality,
} from "../../constants/am16"

// ── 内联样式常量 ──
const S = {
  bg: { backgroundColor: "#0A0A0A" },
  gold: { color: "#D4AF37" },
  goldBg: { backgroundColor: "#D4AF37" },
  white30: { color: "rgba(255,255,255,0.3)" },
  white40: { color: "rgba(255,255,255,0.4)" },
  white50: { color: "rgba(255,255,255,0.5)" },
  white60: { color: "rgba(255,255,255,0.6)" },
  white70: { color: "rgba(255,255,255,0.7)" },
  white80: { color: "rgba(255,255,255,0.8)" },
  white25: { color: "rgba(255,255,255,0.25)" },
  gold50: { color: "rgba(212,175,55,0.5)" },
  gold60: { color: "rgba(212,175,55,0.6)" },
  gold70: { color: "rgba(212,175,55,0.7)" },
  cardBg: { backgroundColor: "rgba(255,255,255,0.04)" },
  cardBorder: { borderColor: "rgba(255,255,255,0.08)" },
  emeraldBorder: { borderColor: "rgba(16,185,129,0.2)" },
  emeraldBg3: { backgroundColor: "rgba(16,185,129,0.03)" },
  emeraldBg10: { backgroundColor: "rgba(16,185,129,0.1)" },
  emeraldText80: { color: "rgba(16,185,129,0.8)" },
  redBorder: { borderColor: "rgba(239,68,68,0.2)" },
  redBg3: { backgroundColor: "rgba(239,68,68,0.03)" },
  redBg10: { backgroundColor: "rgba(239,68,68,0.1)" },
  redText80: { color: "rgba(239,68,68,0.8)" },
}

function HighlightText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <Text key={i} className="font-semibold" style={S.gold}>{part.slice(2, -2)}</Text>
        }
        return <Text key={i}>{part}</Text>
      })}
    </>
  )
}

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
      if (!raw) { Taro.navigateTo({ url: "/pages/quiz/index" }); return }
      const answers = JSON.parse(raw)
      const code = calculateArchetype(answers)
      const radar = calculateRadarScores(answers)
      setArchetype(code)
      setPersonality(PERSONALITIES[code] ?? PERSONALITIES["DXIE"])
      setRadarScores(radar)
      setTimeout(() => setShowDetail(true), 600)
    } catch { Taro.navigateTo({ url: "/pages/quiz/index" }) }
  })

  // 雷达图 Canvas 初始化
  useEffect(() => {
    if (radarScores.FD === undefined) return
    const timer = setTimeout(() => {
      const query = Taro.createSelectorQuery()
      query.select("#radarCanvas").fields({ node: true, size: true }, (res) => {
        if (res && res.node) {
          radarNodeRef.current = res.node
          drawRadar(res.node, radarScores, 280)
        }
      }).exec()
    }, 300)
    return () => clearTimeout(timer)
  }, [radarScores])

  // 分享海报 Canvas 初始化
  useEffect(() => {
    if (!showDetail || !archetype || !personality) return
    const timer = setTimeout(() => {
      const query = Taro.createSelectorQuery()
      query.select("#shareCanvas").fields({ node: true, size: true }, (res) => {
        if (res && res.node) {
          posterNodeRef.current = res.node
          drawSharePoster(res.node, archetype, personality)
        }
      }).exec()
    }, 500)
    return () => clearTimeout(timer)
  }, [showDetail, archetype, personality])

  if (!personality) {
    return (
      <View className="min-h-screen flex items-center justify-center" style={S.bg}>
        <Text className="text-sm" style={S.white30}>加载中…</Text>
      </View>
    )
  }

  const compatNames = personality.compatible.map(c => PERSONALITIES[c]).filter(Boolean)
  const clashNames = personality.clash.map(c => PERSONALITIES[c]).filter(Boolean)

  useEffect(() => {
    try { Taro.showShareMenu({ withShareTicket: true }) } catch (_) {}
  }, [])

  const handleSavePoster = () => {
    const node = posterNodeRef.current
    if (!node) { Taro.showToast({ title: "海报生成中，请稍候", icon: "none" }); return }
    try {
      Taro.canvasToTempFilePath({
        canvas: node, width: 750, height: 1334, destWidth: 1500, destHeight: 2668,
        success(res) {
          try {
            Taro.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success() { Taro.showToast({ title: "已保存到相册", icon: "success" }) },
              fail() { Taro.showToast({ title: "保存失败，请授权相册权限", icon: "none" }) },
            })
          } catch (_) { Taro.showToast({ title: "请长按图片保存", icon: "none" }) }
        },
        fail() { Taro.showToast({ title: "生成海报失败", icon: "none" }) },
      })
    } catch (_) { Taro.showToast({ title: "当前环境不支持保存海报", icon: "none" }) }
  }

  return (
    <View className="min-h-screen pb-32" style={S.bg}>
      {/* ═══ Header ═══ */}
      <View className="relative pt-16 pb-8 text-center overflow-hidden">
        <View className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(212,175,55,0.06), transparent)" }} />
        <Text className="relative uppercase block mb-3" style={{ ...S.white30, fontSize: "20rpx", letterSpacing: "0.3em" }}>
          Your Destiny Code
        </Text>
        <View className="relative inline-block">
          <View className="absolute rounded-full pointer-events-none" style={{ top: "-64rpx", right: "-64rpx", bottom: "-64rpx", left: "-64rpx", backgroundColor: "rgba(212,175,55,0.08)", animation: "pulse 2s ease-in-out infinite" }} />
          <Text className="relative text-7xl font-bold tracking-wider block" style={{ ...S.gold, textShadow: "0 0 40px rgba(212,175,55,0.4), 0 0 80px rgba(212,175,55,0.15)" }}>
            {archetype}
          </Text>
        </View>
        <Text className="relative text-lg font-serif mt-3 block" style={S.white80}>
          {personality.emoji} {personality.title}
        </Text>
      </View>

      {showDetail && (
        <View className="px-5">
          {/* ═══ 心学金句 ═══ */}
          <View className="relative py-6 text-center mb-5">
            <Text className="absolute top-0 left-1/2 font-serif leading-none select-none pointer-events-none" style={{ color: "rgba(212,175,55,0.06)", fontSize: "240rpx", transform: "translateX(-50%)" }}>
              &ldquo;
            </Text>
            <Text className="relative text-xl font-serif italic leading-relaxed block px-4" style={S.gold}>
              &ldquo;{personality.quote}&rdquo;
            </Text>
            <Text className="relative text-sm mt-2 block" style={S.white40}>
              —— {personality.quoteExplain}
            </Text>
          </View>

          {/* ═══ 雷达图 ═══ */}
          <View className="rounded-2xl border p-5 mb-5" style={{ ...S.cardBg, ...S.cardBorder }}>
            <Text className="tracking-wider uppercase block text-center mb-4" style={{ ...S.white50, fontSize: "20rpx" }}>
              四维能量坐标
            </Text>
            <Canvas
              type="2d"
              id="radarCanvas"
              style={{ width: "280px", height: "280px", margin: "0 auto" }}
            />
            <View className="grid grid-cols-4 gap-2 mt-4 text-center">
              {DIMENSIONS.map(d => {
                const val = radarScores[d.code] ?? 50
                const label = getDimLabel(d.code, val)
                return (
                  <View key={d.code}>
                    <Text className="font-medium block" style={{ ...S.white50, fontSize: "20rpx" }}>{d.code}</Text>
                    <Text className="block mt-1" style={{ ...S.gold60, fontSize: "18rpx" }}>
                      {label} {val}%
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>

          {/* ═══ 精神状态诊断 ═══ */}
          <View className="rounded-2xl border p-5 mb-5" style={{ ...S.cardBg, ...S.cardBorder }}>
            <Text className="tracking-wider uppercase block mb-3" style={{ ...S.white50, fontSize: "20rpx" }}>
              🧠 精神状态诊断
            </Text>
            <Text className="text-sm leading-relaxed" style={S.white70}>
              <HighlightText text={personality.diagnosis} />
            </Text>
          </View>

          {/* ═══ 改运指南 ═══ */}
          <View className="rounded-2xl border p-5 mb-5" style={{ ...S.cardBg, ...S.cardBorder }}>
            <Text className="tracking-wider uppercase block mb-3" style={{ ...S.white50, fontSize: "20rpx" }}>
              🧭 改运指南
            </Text>
            <Text className="text-sm leading-relaxed" style={S.white70}>
              <HighlightText text={personality.advice} />
            </Text>
          </View>

          {/* ═══ 社交匹配 ═══ */}
          <View className="grid grid-cols-2 gap-3 mb-5">
            <View className="rounded-xl border p-4" style={{ ...S.emeraldBorder, ...S.emeraldBg3 }}>
              <View className="flex items-center gap-2 mb-3">
                <View className="w-6 h-6 rounded-full flex items-center justify-center" style={S.emeraldBg10}>
                  <Text className="text-xs">💕</Text>
                </View>
                <Text className="font-medium" style={{ ...S.emeraldText80, fontSize: "22rpx" }}>天作之合</Text>
              </View>
              {compatNames.map((p) => p && (
                <View key={p.code} className="flex items-center gap-2 mb-2">
                  <Text className="text-sm">{p.emoji}</Text>
                  <Text className="leading-tight" style={{ ...S.white70, fontSize: "22rpx" }}>{p.title}</Text>
                </View>
              ))}
            </View>

            <View className="rounded-xl border p-4" style={{ ...S.redBorder, ...S.redBg3 }}>
              <View className="flex items-center gap-2 mb-3">
                <View className="w-6 h-6 rounded-full flex items-center justify-center" style={S.redBg10}>
                  <Text className="text-xs">⚠️</Text>
                </View>
                <Text className="font-medium" style={{ ...S.redText80, fontSize: "22rpx" }}>离远点保命</Text>
              </View>
              {clashNames.map((p) => p && (
                <View key={p.code} className="flex items-center gap-2 mb-2">
                  <Text className="text-sm">{p.emoji}</Text>
                  <Text className="leading-tight" style={{ ...S.white70, fontSize: "22rpx" }}>{p.title}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ═══ AI 深度解读 CTA ═══ */}
          <View className="relative rounded-2xl overflow-hidden mb-5">
            <View className="absolute inset-0 rounded-2xl border pointer-events-none" style={{ ...S.goldBorder30, animation: "pulse 2s ease-in-out infinite" }} />
            <View className="relative rounded-2xl p-5" style={{ ...S.cardBg, margin: "2rpx" }}>
              <View className="text-center mb-4">
                <Text className="text-xs block mb-2" style={S.gold70}>💡 星轨预警</Text>
                <Text className="text-sm leading-relaxed block mb-2" style={S.white60}>
                  诊断显示你当前的人格气场在 2026 流年中正遭遇微弱的能量对冲。
                </Text>
                <Text className="text-xs block" style={S.white40}>
                  消耗 100 星尘，解锁五大 AI 导师定制的流年改运全维大报告
                </Text>
              </View>
              <View
                className="w-full py-3 rounded-xl text-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #D4AF37 0%, #B8960C 50%, #D4AF37 100%)" }}
                onClick={() => Taro.showToast({ title: "跳转中…", icon: "loading" })}
              >
                <View className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(255,255,255,0.1)", animation: "pulse 2s ease-in-out infinite" }} />
                <Text className="relative text-sm font-bold" style={{ color: "#0A0A0A" }}>
                  🔮 开启命运解读 · 100 ✨
                </Text>
              </View>
            </View>
          </View>

          {/* ═══ 操作按钮 ═══ */}
          <View className="grid grid-cols-2 gap-3 mb-5">
            <View
              className="py-3 rounded-xl text-center border"
              style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 50%, rgba(212,175,55,0.15) 100%)", borderColor: "rgba(212,175,55,0.4)" }}
              onClick={handleSavePoster}
            >
              <Text className="text-sm" style={S.gold}>✨ 保存海报</Text>
            </View>
            <Button
              openType="share"
              className="py-3 rounded-xl text-center border leading-none"
              style={{ margin: 0, padding: "12px 0", lineHeight: "normal", ...S.whiteBorder10, ...S.cardBg }}
            >
              <Text className="text-sm" style={S.white70}>📤 分享结果</Text>
            </Button>
          </View>

          {/* 重新测试 */}
          <View className="text-center pt-2 pb-8">
            <Text
              className="text-xs"
              style={S.white25}
              onClick={() => { Taro.removeStorageSync("am16_answers"); Taro.navigateTo({ url: "/pages/quiz/index" }) }}
            >
              🔄 重新测试
            </Text>
          </View>
        </View>
      )}

      <Canvas
        type="2d"
        id="shareCanvas"
        style={{ position: "fixed", left: "-9999px", top: "-9999px", width: "750px", height: "1334px" }}
      />
    </View>
  )
}

export function onShareAppMessage() {
  return { title: "测测你的天命格局 — AlphaMirror 命盘智镜", path: "/pages/quiz/index" }
}

// ═══ Canvas 绘制 ═══

function getDPR(): number {
  try {
    const info = Taro.getSystemInfoSync()
    return info.pixelRatio || 1
  } catch (_) { return 2 }
}

function drawRadar(canvasNode: any, scores: Record<string, number>, size: number) {
  const ctx = canvasNode.getContext("2d")
  const dpr = getDPR()
  canvasNode.width = size * dpr
  canvasNode.height = size * dpr
  ctx.scale(dpr, dpr)
  const cx = size / 2, cy = size / 2, r = size * 0.36
  const dims = ["FD", "XS", "GI", "PE"]
  const corners = [{ x: cx, y: cy - r }, { x: cx + r, y: cy }, { x: cx, y: cy + r }, { x: cx - r, y: cy }]

  ctx.strokeStyle = "rgba(212,175,55,0.1)"; ctx.lineWidth = 0.5
  for (const scale of [0.33, 0.66, 1]) {
    ctx.beginPath()
    corners.forEach((c, i) => {
      const x = cx + (c.x - cx) * scale, y = cy + (c.y - cy) * scale
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.closePath(); ctx.stroke()
  }

  ctx.strokeStyle = "rgba(212,175,55,0.06)"
  corners.forEach(c => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(c.x, c.y); ctx.stroke() })

  ctx.beginPath()
  corners.forEach((c, i) => {
    const val = (scores[dims[i]] ?? 50) / 100, ratio = 0.2 + val * 0.8
    const x = cx + (c.x - cx) * ratio, y = cy + (c.y - cy) * ratio
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  ctx.closePath(); ctx.fillStyle = "rgba(212,175,55,0.12)"; ctx.fill()
  ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 1.5; ctx.stroke()

  corners.forEach((c, i) => {
    const val = (scores[dims[i]] ?? 50) / 100, ratio = 0.2 + val * 0.8
    const x = cx + (c.x - cx) * ratio, y = cy + (c.y - cy) * ratio
    ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fillStyle = "#D4AF37"; ctx.fill()
  })
}

function drawSharePoster(canvasNode: any, code: string, p: Personality) {
  const ctx = canvasNode.getContext("2d")
  const dpr = getDPR()
  canvasNode.width = 750 * dpr; canvasNode.height = 1334 * dpr
  ctx.scale(dpr, dpr)
  const W = 750, H = 1334

  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, "#0A0A0A"); grad.addColorStop(0.5, "#111111"); grad.addColorStop(1, "#0A0A0A")
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = "rgba(212,175,55,0.06)"; ctx.lineWidth = 1
  for (const rad of [260, 200, 140]) { ctx.beginPath(); ctx.arc(W / 2, 350, rad, 0, Math.PI * 2); ctx.stroke() }

  ctx.textAlign = "center"
  ctx.fillStyle = "rgba(212,175,55,0.5)"; ctx.font = "14px sans-serif"; ctx.fillText("AlphaMirror 命盘智镜", W / 2, 60)
  ctx.fillStyle = "#D4AF37"; ctx.font = "bold 120px sans-serif"; ctx.shadowColor = "rgba(212,175,55,0.5)"; ctx.shadowBlur = 30
  ctx.fillText(code, W / 2, 300); ctx.shadowBlur = 0
  ctx.font = "60px serif"; ctx.fillText(p.emoji, W / 2, 420)
  ctx.font = "bold 28px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillText(p.title, W / 2, 470)
  ctx.fillStyle = "rgba(212,175,55,0.7)"; ctx.font = "italic 24px serif"; ctx.fillText(`"${p.quote}"`, W / 2, 550)
  ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "18px sans-serif"; ctx.fillText(p.quoteExplain, W / 2, 585)

  ctx.strokeStyle = "rgba(212,175,55,0.15)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(150, 630); ctx.lineTo(600, 630); ctx.stroke()

  ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "bold 20px sans-serif"; ctx.fillText("精神状态诊断", W / 2, 680)
  ctx.font = "16px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.45)"; wrapText(ctx, p.diagnosis, W / 2, 720, 600, 24)
  ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "bold 20px sans-serif"; ctx.fillText("改运指南", W / 2, 920)
  ctx.font = "16px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.45)"; wrapText(ctx, p.advice, W / 2, 960, 600, 24)

  ctx.fillStyle = "#D4AF37"; ctx.font = "bold 22px sans-serif"; ctx.fillText("扫码测测你的天命格局", W / 2, 1140)
  ctx.beginPath(); ctx.arc(W / 2, 1220, 40, 0, Math.PI * 2); ctx.fillStyle = "rgba(212,175,55,0.1)"; ctx.fill()
  ctx.strokeStyle = "rgba(212,175,55,0.3)"; ctx.lineWidth = 1; ctx.stroke()
  ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "12px sans-serif"; ctx.fillText("小程序码", W / 2, 1225)
  ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillText("新用户立赠 20 星尘能量 · 官网同步登录", W / 2, 1300)
  ctx.fillText("AlphaMirror · 命盘智镜", W / 2, 1320)
}

function wrapText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  let line = "", currentY = y
  for (const char of text) {
    if (ctx.measureText(line + char).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY); line = char; currentY += lineHeight
    } else { line += char }
  }
  if (line) ctx.fillText(line, x, currentY)
}
