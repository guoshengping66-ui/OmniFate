import { useState, useRef, useEffect } from "react"
import { View, Text, Canvas, Button } from "@tarojs/components"
import Taro, { useDidShow } from "@tarojs/taro"
// StarField inlined
import {
  PERSONALITIES,
  DIMENSIONS,
  calculateArchetype,
  calculateRadarScores,
  type Personality,
} from "../../constants/am16"

// ── Web 级设计系统 ──
const cardGlass = {
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "1rpx solid rgba(255,255,255,0.1)",
  borderRadius: "24rpx",
  boxShadow: "0 8rpx 32rpx rgba(0,0,0,0.3), 0 0 80rpx rgba(201,168,76,0.04)",
}

const cardElevated = {
  backgroundColor: "rgba(255,255,255,0.07)",
  border: "1rpx solid rgba(255,255,255,0.15)",
  borderRadius: "24rpx",
  boxShadow: "0 0 0 1rpx rgba(255,255,255,0.05), 0 8rpx 32rpx rgba(0,0,0,0.3), 0 0 80rpx rgba(201,168,76,0.06)",
}

const gold = "#C9A84C"
const goldRgb = "201,168,76"

function GoldSeparator() {
  return (
    <View className="my-6" style={{
      height: "1rpx",
      background: `linear-gradient(to right, transparent, rgba(${goldRgb},0.3), transparent)`,
    }} />
  )
}

function HighlightText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <Text key={i} className="font-semibold" style={{ color: gold }}>{part.slice(2, -2)}</Text>
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

  useEffect(() => {
    try { Taro.showShareMenu({ withShareTicket: true }) } catch (_) {}
  }, [])

  if (!personality) {
    return (
      <View className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1A0F2E" }}>
        {/* 星空背景 */}
        <View style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" as const }}>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(201,168,76,0.04) 0%, transparent 50%)", animation: "glowPulse 8s ease-in-out infinite" }} />
          {[{x:8,y:12,s:3,d:3,a:"twinkle"},{x:85,y:8,s:2,d:4,a:"twinkle"},{x:22,y:35,s:4,d:3.5,a:"drift"},{x:70,y:25,s:2,d:5,a:"twinkle"},{x:45,y:55,s:3,d:4.5,a:"drift"},{x:15,y:70,s:2,d:3,a:"twinkle"},{x:90,y:60,s:3,d:4,a:"drift"},{x:55,y:80,s:2,d:3.5,a:"twinkle"},{x:35,y:15,s:2,d:5,a:"twinkle"},{x:75,y:45,s:3,d:4,a:"drift"}].map((s,i) => (
            <View key={i} style={{ position: "absolute", left: s.x+"%", top: s.y+"%", width: s.s+"rpx", height: s.s+"rpx", borderRadius: "50%", backgroundColor: i%3===0 ? "rgba(201,168,76,0.6)" : "rgba(255,255,255,0.5)", animation: s.a+" "+s.d+"s ease-in-out infinite" }} />
          ))}
        </View>
        <Text className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>加载中…</Text>
      </View>
    )
  }

  const compatNames = personality.compatible.map(c => PERSONALITIES[c]).filter(Boolean)
  const clashNames = personality.clash.map(c => PERSONALITIES[c]).filter(Boolean)

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
    <View className="min-h-screen pb-32" style={{ backgroundColor: "#1A0F2E" }}>
      {/* 星空背景 */}
      <View style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" as const }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(201,168,76,0.04) 0%, transparent 50%)", animation: "glowPulse 8s ease-in-out infinite" }} />
        {[{x:8,y:12,s:3,d:3,a:"twinkle"},{x:85,y:8,s:2,d:4,a:"twinkle"},{x:22,y:35,s:4,d:3.5,a:"drift"},{x:70,y:25,s:2,d:5,a:"twinkle"},{x:45,y:55,s:3,d:4.5,a:"drift"},{x:15,y:70,s:2,d:3,a:"twinkle"},{x:90,y:60,s:3,d:4,a:"drift"},{x:55,y:80,s:2,d:3.5,a:"twinkle"},{x:35,y:15,s:2,d:5,a:"twinkle"},{x:75,y:45,s:3,d:4,a:"drift"}].map((s,i) => (
          <View key={i} style={{ position: "absolute", left: s.x+"%", top: s.y+"%", width: s.s+"rpx", height: s.s+"rpx", borderRadius: "50%", backgroundColor: i%3===0 ? "rgba(201,168,76,0.6)" : "rgba(255,255,255,0.5)", animation: s.a+" "+s.d+"s ease-in-out infinite" }} />
        ))}
      </View>
      {/* ═══ 主卡片 — Web 级 card-glass-elevated ═══ */}
      <View className="mx-4 mt-4 relative overflow-hidden" style={{
        ...cardElevated,
        animation: "fadeInUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        {/* 背景渐变光晕 */}
        <View className="absolute inset-0 pointer-events-none" style={{
          background: `linear-gradient(to bottom, rgba(${goldRgb},0.08), rgba(${goldRgb},0.02), transparent)`,
        }} />
        {/* 金色粒子 */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <View key={i} className="absolute pointer-events-none" style={{
            left: `${15 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
            width: `${2 + (i % 3)}rpx`,
            height: `${2 + (i % 3)}rpx`,
            borderRadius: "50%",
            backgroundColor: `rgba(${goldRgb},${0.3 + (i % 4) * 0.1})`,
            animation: `float ${2 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`,
          }} />
        ))}

        <View className="relative py-10 text-center">
          <Text className="text-xs tracking-widest uppercase block mb-3" style={{ color: `rgba(${goldRgb},0.5)` }}>
            Your Destiny Code
          </Text>
          {/* 超大编码 — Web 级发光 */}
          <View className="relative inline-block">
            <View className="absolute rounded-full pointer-events-none" style={{
              top: "-80rpx", right: "-80rpx", bottom: "-80rpx", left: "-80rpx",
              background: `radial-gradient(circle, rgba(${goldRgb},0.1) 0%, transparent 70%)`,
              animation: "glowPulse 3s ease-in-out infinite",
            }} />
            <Text className="relative text-7xl font-bold tracking-wider block" style={{
              color: gold,
              textShadow: `0 0 20rpx rgba(${goldRgb},0.5), 0 0 40rpx rgba(${goldRgb},0.3), 0 0 80rpx rgba(${goldRgb},0.15), 0 2rpx 4rpx rgba(0,0,0,0.5)`,
            }}>
              {archetype}
            </Text>
          </View>
          <Text className="relative text-lg font-serif mt-3 block" style={{ color: "rgba(255,255,255,0.85)" }}>
            {personality.emoji} {personality.title}
          </Text>
        </View>
      </View>

      {showDetail && (
        <View className="px-4">
          {/* ═══ 心学金句 ═══ */}
          <View className="relative py-8 text-center mt-2" style={{ animation: "fadeInUp 0.5s ease-out 0.1s both" }}>
            <Text className="absolute top-0 left-1/2 font-serif leading-none select-none pointer-events-none" style={{
              color: `rgba(${goldRgb},0.06)`, fontSize: "200rpx", transform: "translateX(-50%)",
            }}>&ldquo;</Text>
            <Text className="relative text-xl font-serif italic leading-relaxed block px-6" style={{
              color: gold, textShadow: `0 0 16rpx rgba(${goldRgb},0.2)`,
            }}>
              &ldquo;{personality.quote}&rdquo;
            </Text>
            <Text className="relative text-sm mt-3 block" style={{ color: "rgba(255,255,255,0.4)" }}>
              —— {personality.quoteExplain}
            </Text>
          </View>

          <GoldSeparator />

          {/* ═══ 四维雷达图 ═══ */}
          <View className="p-5 relative overflow-hidden" style={{
            ...cardGlass,
            animation: "fadeInUp 0.5s ease-out 0.15s both",
          }}>
            <Text className="tracking-wider uppercase block text-center mb-4" style={{
              color: "rgba(255,255,255,0.6)", fontSize: "20rpx",
            }}>四维能量坐标</Text>
            <Canvas type="2d" id="radarCanvas" style={{ width: "280px", height: "280px", margin: "0 auto" }} />
            <View className="grid grid-cols-4 gap-2 mt-4 text-center">
              {DIMENSIONS.map(d => {
                const val = radarScores[d.code] ?? 50
                const label = getDimLabel(d.code, val)
                return (
                  <View key={d.code}>
                    <Text className="font-medium block" style={{ color: "rgba(255,255,255,0.5)", fontSize: "20rpx" }}>{d.code}</Text>
                    <Text className="block mt-1" style={{ color: `rgba(${goldRgb},0.7)`, fontSize: "18rpx" }}>
                      {label} {val}%
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>

          <GoldSeparator />

          {/* ═══ 精神状态诊断 ═══ */}
          <View className="p-5 relative overflow-hidden mb-4" style={{
            ...cardGlass,
            animation: "fadeInUp 0.5s ease-out 0.2s both",
          }}>
            {/* 左侧金色竖线 */}
            <View className="absolute left-0 top-4 bottom-4" style={{
              width: "4rpx", borderRadius: "2rpx",
              background: `linear-gradient(to bottom, rgba(${goldRgb},0.5), rgba(${goldRgb},0.1))`,
            }} />
            <Text className="tracking-wider uppercase block mb-3 pl-3" style={{
              color: "rgba(255,255,255,0.6)", fontSize: "20rpx",
            }}>
              <Text style={{ color: gold, marginRight: "8rpx" }}>◆</Text>精神状态诊断
            </Text>
            <Text className="text-sm leading-relaxed pl-3" style={{ color: "rgba(255,255,255,0.7)" }}>
              <HighlightText text={personality.diagnosis} />
            </Text>
          </View>

          {/* ═══ 改运指南 ═══ */}
          <View className="p-5 relative overflow-hidden" style={{
            ...cardGlass,
            animation: "fadeInUp 0.5s ease-out 0.25s both",
          }}>
            <View className="absolute left-0 top-4 bottom-4" style={{
              width: "4rpx", borderRadius: "2rpx",
              background: `linear-gradient(to bottom, rgba(${goldRgb},0.5), rgba(${goldRgb},0.1))`,
            }} />
            <Text className="tracking-wider uppercase block mb-3 pl-3" style={{
              color: "rgba(255,255,255,0.6)", fontSize: "20rpx",
            }}>
              <Text style={{ color: gold, marginRight: "8rpx" }}>◆</Text>改运指南
            </Text>
            <Text className="text-sm leading-relaxed pl-3" style={{ color: "rgba(255,255,255,0.7)" }}>
              <HighlightText text={personality.advice} />
            </Text>
          </View>

          <GoldSeparator />

          {/* ═══ 社交匹配 — Web 级 hover 发光卡片 ═══ */}
          <View className="grid grid-cols-2 gap-3" style={{ animation: "fadeInUp 0.5s ease-out 0.3s both" }}>
            {/* 天作之合 */}
            <View className="rounded-2xl p-4" style={{
              backgroundColor: "rgba(16,185,129,0.04)",
              border: "1rpx solid rgba(16,185,129,0.2)",
              boxShadow: "0 0 24rpx rgba(16,185,129,0.06), 0 4rpx 16rpx rgba(0,0,0,0.15)",
            }}>
              <View className="flex items-center gap-2 mb-3">
                <View className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.12)" }}>
                  <Text className="text-xs">💕</Text>
                </View>
                <Text className="font-medium" style={{ color: "rgba(16,185,129,0.85)", fontSize: "22rpx" }}>天作之合</Text>
              </View>
              {compatNames.map((p) => p && (
                <View key={p.code} className="flex items-center gap-2 mb-2" style={{ animation: "fadeInUp 0.3s ease-out 0.4s both" }}>
                  <Text className="text-sm">{p.emoji}</Text>
                  <Text className="leading-tight" style={{ color: "rgba(255,255,255,0.75)", fontSize: "22rpx" }}>{p.title}</Text>
                </View>
              ))}
            </View>

            {/* 离远点保命 */}
            <View className="rounded-2xl p-4" style={{
              backgroundColor: "rgba(239,68,68,0.04)",
              border: "1rpx solid rgba(239,68,68,0.2)",
              boxShadow: "0 0 24rpx rgba(239,68,68,0.06), 0 4rpx 16rpx rgba(0,0,0,0.15)",
            }}>
              <View className="flex items-center gap-2 mb-3">
                <View className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.12)" }}>
                  <Text className="text-xs">⚠️</Text>
                </View>
                <Text className="font-medium" style={{ color: "rgba(239,68,68,0.85)", fontSize: "22rpx" }}>离远点保命</Text>
              </View>
              {clashNames.map((p) => p && (
                <View key={p.code} className="flex items-center gap-2 mb-2" style={{ animation: "fadeInUp 0.3s ease-out 0.4s both" }}>
                  <Text className="text-sm">{p.emoji}</Text>
                  <Text className="leading-tight" style={{ color: "rgba(255,255,255,0.75)", fontSize: "22rpx" }}>{p.title}</Text>
                </View>
              ))}
            </View>
          </View>

          <GoldSeparator />

          {/* ═══ AI 深度解读 CTA — Web 级 btn-gold ═══ */}
          <View className="relative rounded-2xl overflow-hidden mb-5" style={{
            ...cardElevated,
            animation: "fadeInUp 0.5s ease-out 0.35s both",
          }}>
            {/* 脉冲发光外框 */}
            <View className="absolute inset-0 rounded-2xl pointer-events-none" style={{
              border: `1rpx solid rgba(${goldRgb},0.3)`,
              boxShadow: `0 0 24rpx rgba(${goldRgb},0.08), inset 0 0 24rpx rgba(${goldRgb},0.03)`,
              animation: "glowPulse 3s ease-in-out infinite",
            }} />
            <View className="relative p-5" style={{ margin: "2rpx" }}>
              <View className="text-center mb-4">
                <Text className="text-xs block mb-2" style={{
                  color: `rgba(${goldRgb},0.75)`,
                  textShadow: `0 0 8rpx rgba(${goldRgb},0.3)`,
                }}>💡 星轨预警</Text>
                <Text className="text-sm leading-relaxed block mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                  诊断显示你当前的人格气场在 2026 流年中正遭遇微弱的能量对冲。
                </Text>
                <Text className="text-xs block" style={{ color: "rgba(255,255,255,0.4)" }}>
                  消耗 100 星尘，解锁五大 AI 导师定制的流年改运全维大报告
                </Text>
              </View>
              {/* Web 级 btn-gold */}
              <View
                className="w-full py-3.5 rounded-full text-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, #C9A84C 0%, #E8CB7A 40%, #C9A84C 80%)`,
                  boxShadow: `0 4rpx 20rpx rgba(${goldRgb},0.35), 0 0 40rpx rgba(${goldRgb},0.12)`,
                }}
                onClick={() => Taro.showToast({ title: "跳转中…", icon: "loading" })}
              >
                {/* 光泽扫过 */}
                <View className="absolute inset-0 pointer-events-none" style={{
                  background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.3) 55%, transparent 60%)`,
                  backgroundSize: "200% 100%",
                  animation: "shimmer 3s ease-in-out infinite",
                }} />
                <Text className="relative text-sm font-bold" style={{ color: "#1A0F2E", textShadow: "0 1rpx 2rpx rgba(0,0,0,0.15)" }}>
                  🔮 开启命运解读 · 100 ✨
                </Text>
              </View>
            </View>
          </View>

          {/* ═══ 操作按钮 ═══ */}
          <View className="grid grid-cols-2 gap-3 mb-5" style={{ animation: "fadeInUp 0.5s ease-out 0.4s both" }}>
            {/* 保存海报 — btn-gold-outline */}
            <View
              className="py-3 rounded-full text-center relative overflow-hidden"
              style={{
                border: `1rpx solid rgba(${goldRgb},0.45)`,
                boxShadow: `0 0 16rpx rgba(${goldRgb},0.06)`,
              }}
              onClick={handleSavePoster}
            >
              <View className="absolute inset-0 pointer-events-none" style={{
                background: `linear-gradient(90deg, transparent, rgba(${goldRgb},0.08), transparent)`,
                animation: "shimmer 3.5s ease-in-out infinite 0.5s",
              }} />
              <Text className="relative text-sm font-medium" style={{ color: gold }}>✨ 保存海报</Text>
            </View>
            {/* 分享结果 */}
            <Button
              openType="share"
              className="py-3 rounded-full text-center leading-none relative overflow-hidden"
              style={{
                margin: 0, padding: "12px 0", lineHeight: "normal",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1rpx solid rgba(255,255,255,0.1)",
                boxShadow: "0 4rpx 16rpx rgba(0,0,0,0.15)",
              }}
            >
              <Text className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>📤 分享结果</Text>
            </Button>
          </View>

          {/* 重新测试 */}
          <View className="text-center pt-2 pb-8">
            <Text className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}
              onClick={() => { Taro.removeStorageSync("am16_answers"); Taro.navigateTo({ url: "/pages/quiz/index" }) }}
            >🔄 重新测试</Text>
          </View>
        </View>
      )}

      <Canvas type="2d" id="shareCanvas" style={{ position: "fixed", left: "-9999px", top: "-9999px", width: "750px", height: "1334px" }} />
    </View>
  )
}

export function onShareAppMessage() {
  return { title: "测测你的天命格局 — AlphaMirror 命盘智镜", path: "/pages/quiz/index" }
}

// ═══ Canvas 绘制 ═══

function getDPR(): number {
  try { return Taro.getSystemInfoSync().pixelRatio || 1 } catch (_) { return 2 }
}

function drawRadar(canvasNode: any, scores: Record<string, number>, size: number) {
  const ctx = canvasNode.getContext("2d")
  const dpr = getDPR()
  canvasNode.width = size * dpr; canvasNode.height = size * dpr
  ctx.scale(dpr, dpr)
  const cx = size / 2, cy = size / 2, r = size * 0.36
  const dims = ["FD", "XS", "GI", "PE"]
  const corners = [{ x: cx, y: cy - r }, { x: cx + r, y: cy }, { x: cx, y: cy + r }, { x: cx - r, y: cy }]

  // 网格 — 中心亮→边缘暗
  for (const scale of [0.33, 0.66, 1]) {
    ctx.strokeStyle = `rgba(${goldRgb},${0.04 + (1 - scale) * 0.08})`
    ctx.lineWidth = 0.5
    ctx.beginPath()
    corners.forEach((c, i) => {
      const x = cx + (c.x - cx) * scale, y = cy + (c.y - cy) * scale
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.closePath(); ctx.stroke()
  }

  // 轴线
  ctx.strokeStyle = `rgba(${goldRgb},0.06)`
  corners.forEach(c => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(c.x, c.y); ctx.stroke() })

  // 数据区域
  ctx.beginPath()
  corners.forEach((c, i) => {
    const val = (scores[dims[i]] ?? 50) / 100, ratio = 0.2 + val * 0.8
    const x = cx + (c.x - cx) * ratio, y = cy + (c.y - cy) * ratio
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  ctx.closePath()
  ctx.fillStyle = `rgba(${goldRgb},0.1)`; ctx.fill()
  ctx.shadowColor = `rgba(${goldRgb},0.5)`; ctx.shadowBlur = 10
  ctx.strokeStyle = gold; ctx.lineWidth = 2; ctx.stroke()
  ctx.shadowBlur = 0

  // 数据点
  corners.forEach((c, i) => {
    const val = (scores[dims[i]] ?? 50) / 100, ratio = 0.2 + val * 0.8
    const x = cx + (c.x - cx) * ratio, y = cy + (c.y - cy) * ratio
    ctx.shadowColor = `rgba(${goldRgb},0.6)`; ctx.shadowBlur = 8
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = gold; ctx.fill()
    ctx.shadowBlur = 0
  })
}

function drawSharePoster(canvasNode: any, code: string, p: Personality) {
  const ctx = canvasNode.getContext("2d")
  const dpr = getDPR()
  canvasNode.width = 750 * dpr; canvasNode.height = 1334 * dpr
  ctx.scale(dpr, dpr)
  const W = 750, H = 1334

  // 背景
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, "#1A0F2E"); grad.addColorStop(0.3, "#1E1240")
  grad.addColorStop(0.7, "#221545"); grad.addColorStop(1, "#1A0F2E")
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

  // 星空粒子
  const seed = code.charCodeAt(0) * 137
  for (let i = 0; i < 80; i++) {
    const x = (seed * (i + 1) * 7919) % W
    const y = (seed * (i + 1) * 104729) % H
    const size = 0.3 + (i % 4) * 0.4
    const alpha = 0.08 + (i % 6) * 0.04
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${goldRgb},${alpha})`; ctx.fill()
  }

  // 装饰圆环
  ctx.strokeStyle = `rgba(${goldRgb},0.05)`; ctx.lineWidth = 1
  for (const rad of [280, 220, 160]) { ctx.beginPath(); ctx.arc(W / 2, 350, rad, 0, Math.PI * 2); ctx.stroke() }

  // 星轨线
  ctx.strokeStyle = `rgba(${goldRgb},0.03)`; ctx.lineWidth = 0.5
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4
    ctx.beginPath()
    ctx.moveTo(W / 2 + Math.cos(angle) * 100, 350 + Math.sin(angle) * 100)
    ctx.lineTo(W / 2 + Math.cos(angle) * 300, 350 + Math.sin(angle) * 300)
    ctx.stroke()
  }

  ctx.textAlign = "center"
  ctx.fillStyle = `rgba(${goldRgb},0.5)`; ctx.font = "14px sans-serif"; ctx.fillText("AlphaMirror 命盘智镜", W / 2, 60)
  // Archetype 强发光
  ctx.shadowColor = `rgba(${goldRgb},0.7)`; ctx.shadowBlur = 50
  ctx.fillStyle = gold; ctx.font = "bold 120px sans-serif"; ctx.fillText(code, W / 2, 300)
  ctx.shadowBlur = 0
  ctx.font = "60px serif"; ctx.fillText(p.emoji, W / 2, 420)
  ctx.font = "bold 28px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillText(p.title, W / 2, 470)
  ctx.fillStyle = `rgba(${goldRgb},0.75)`; ctx.font = "italic 24px serif"; ctx.fillText(`"${p.quote}"`, W / 2, 550)
  ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "18px sans-serif"; ctx.fillText(p.quoteExplain, W / 2, 585)

  // 渐变分割线
  const lineGrad = ctx.createLinearGradient(150, 0, 600, 0)
  lineGrad.addColorStop(0, `rgba(${goldRgb},0)`)
  lineGrad.addColorStop(0.5, `rgba(${goldRgb},0.25)`)
  lineGrad.addColorStop(1, `rgba(${goldRgb},0)`)
  ctx.strokeStyle = lineGrad; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(150, 630); ctx.lineTo(600, 630); ctx.stroke()

  ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "bold 20px sans-serif"; ctx.fillText("精神状态诊断", W / 2, 680)
  ctx.font = "16px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.45)"; wrapText(ctx, p.diagnosis, W / 2, 720, 600, 24)
  ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "bold 20px sans-serif"; ctx.fillText("改运指南", W / 2, 920)
  ctx.font = "16px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.45)"; wrapText(ctx, p.advice, W / 2, 960, 600, 24)

  ctx.fillStyle = gold; ctx.font = "bold 22px sans-serif"; ctx.fillText("扫码测测你的天命格局", W / 2, 1140)
  ctx.beginPath(); ctx.arc(W / 2, 1220, 40, 0, Math.PI * 2); ctx.fillStyle = `rgba(${goldRgb},0.1)`; ctx.fill()
  ctx.strokeStyle = `rgba(${goldRgb},0.3)`; ctx.lineWidth = 1; ctx.stroke()
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
