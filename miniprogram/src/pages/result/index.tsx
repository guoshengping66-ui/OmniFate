import { useState, useRef, useEffect } from "react"
import { View, Text, Canvas, Button } from "@tarojs/components"
import Taro from "@tarojs/taro"
import {
  PERSONALITIES,
  DIMENSIONS,
  calculateArchetype,
  calculateRadarScores,
  type AM16Personality,
} from "../../constants/am16"
import { DIMENSION_ORDER, DIMENSIONS_MAP, getPoleLabel } from "../../constants/dimensions"
import StarBackground from "../../components/StarBackground"
import { cardGlass, cardElevated, gold, goldRgb } from "../../styles/theme"

// ── 人格色彩 bgGlow 映射（匹配 Web personality.bgGlow）──
const GLOW_COLORS: Record<string, [string, string]> = {
  FXGP: ["rgba(59,130,246,0.15)", "rgba(99,102,241,0.05)"],
  FXGE: ["rgba(168,85,247,0.15)", "rgba(139,92,246,0.05)"],
  FXIP: ["rgba(100,116,139,0.15)", "rgba(156,163,175,0.05)"],
  FXIE: ["rgba(236,72,153,0.15)", "rgba(244,63,94,0.05)"],
  FSGP: ["rgba(20,184,166,0.15)", "rgba(16,185,129,0.05)"],
  FSGE: ["rgba(132,204,22,0.15)", "rgba(34,197,94,0.05)"],
  FSIP: ["rgba(6,182,212,0.15)", "rgba(14,165,233,0.05)"],
  FSIE: ["rgba(139,92,246,0.15)", "rgba(168,85,247,0.05)"],
  DXGP: ["rgba(20,184,166,0.15)", "rgba(16,185,129,0.05)"],
  DXGE: ["rgba(245,158,11,0.15)", "rgba(234,179,8,0.05)"],
  DXIP: ["rgba(239,68,68,0.15)", "rgba(244,63,94,0.05)"],
  DXIE: ["rgba(249,115,22,0.15)", "rgba(239,68,68,0.05)"],
  DSIE: ["rgba(234,179,8,0.15)", "rgba(245,158,11,0.05)"],
  DSGP: ["rgba(16,185,129,0.15)", "rgba(34,197,94,0.05)"],
  DSGE: ["rgba(217,119,6,0.15)", "rgba(245,158,11,0.05)"],
  DSIP: ["rgba(99,102,241,0.15)", "rgba(59,130,246,0.05)"],
}

function getGlowStyle(code: string) {
  const pair = GLOW_COLORS[code]
  if (!pair) return {}
  return { background: `linear-gradient(to bottom, ${pair[0]}, ${pair[1]}, transparent)` }
}

function GoldSeparator() {
  return (
    <View className="my-5" style={{
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

export default function ResultPage() {
  const [archetype, setArchetype] = useState("")
  const [personality, setPersonality] = useState<AM16Personality | null>(null)
  const [radarScores, setRadarScores] = useState<Record<string, number>>({})
  const [showDetail, setShowDetail] = useState(false)
  const radarNodeRef = useRef<any>(null)
  const posterNodeRef = useRef<any>(null)
  const pageRef = useRef<any>(null)
  const radarScoresRef = useRef<Record<string, number>>({})
  const fetchedRef = useRef(false)

  // Phase 1: 从 Storage 读取数据（只执行一次）
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    try {
      const raw = Taro.getStorageSync("am16_answers")
      if (!raw) { Taro.navigateTo({ url: "/pages/quiz/index" }); return }
      const answers = JSON.parse(raw)
      const code = calculateArchetype(answers)
      const radar = calculateRadarScores(answers)
      setArchetype(code)
      setPersonality(PERSONALITIES[code] ?? PERSONALITIES["DXIE"])
      setRadarScores(radar)
      radarScoresRef.current = radar
      setTimeout(() => setShowDetail(true), 600)
    } catch { Taro.navigateTo({ url: "/pages/quiz/index" }) }
  }, [])

  // Phase 2: 轮询查询雷达 Canvas 原生节点并绘制
  // Canvas 始终在 DOM 中（不再条件渲染），解决 Taro selectorQuery 时序问题
  useEffect(() => {
    const timers: any[] = []
    const tryDraw = () => {
      if (radarNodeRef.current) return
      const query = Taro.createSelectorQuery()
      query.select("#radarCanvas").fields({ node: true, size: true }, (res) => {
        if (res && res.node && !radarNodeRef.current) {
          radarNodeRef.current = res.node
          const scores = radarScoresRef.current
          try { drawRadar(res.node, scores, 300) } catch (e) { console.error("[radar]", e) }
        }
      }).exec()
    }
    ;[200, 500, 1000, 2000].forEach(delay => {
      timers.push(setTimeout(tryDraw, delay))
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  // Phase 3: 轮询查询分享海报 Canvas 并绘制（依赖 personality 数据）
  useEffect(() => {
    if (!archetype || !personality) return
    const timers: any[] = []
    const tryDraw = () => {
      if (posterNodeRef.current) return
      const query = Taro.createSelectorQuery()
      query.select("#shareCanvas").fields({ node: true, size: true }, (res) => {
        if (res && res.node && !posterNodeRef.current) {
          posterNodeRef.current = res.node
          const scores = radarScoresRef.current
          try { drawSharePoster(res.node, archetype, personality, scores) } catch (e) { console.error("[share]", e) }
        }
      }).exec()
    }
    ;[500, 1200, 2500].forEach(delay => {
      timers.push(setTimeout(tryDraw, delay))
    })
    return () => timers.forEach(clearTimeout)
  }, [archetype, personality])

  useEffect(() => {
    try { Taro.showShareMenu({ withShareTicket: true }) } catch (_) {}
  }, [])

  if (!personality) {
    return (
      <View className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1A0F2E" }}>
        <StarBackground />
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
        canvas: node, width: 750, height: 1480, destWidth: 1500, destHeight: 2960,
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
    <View ref={pageRef} className="min-h-screen pb-32" style={{ backgroundColor: "#1A0F2E" }}>
      <StarBackground />
      {/* ═══ 主卡片 — Web 级 card-glass-elevated ═══ */}
      <View className="mx-3 mt-3 relative overflow-hidden" style={{
        ...cardElevated,
        animation: "fadeInUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        {/* 人格专属 bgGlow — 匹配 Web */}
        <View className="absolute inset-0 pointer-events-none" style={getGlowStyle(archetype)} />
        {/* 金色粒子 */}
        {[0,1,2,3,4,5].map(i => (
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
          <Text className="text-xs tracking-widest uppercase block mb-3" style={{ color: `rgba(${goldRgb},0.55)`, letterSpacing: "4rpx" }}>
            Your Destiny Code
          </Text>
          {/* 超大编码 — 多层发光 */}
          <View className="relative inline-block">
            <View className="absolute rounded-full pointer-events-none" style={{
              top: "-100rpx", right: "-100rpx", bottom: "-100rpx", left: "-100rpx",
              background: `radial-gradient(circle, rgba(${goldRgb},0.12) 0%, rgba(${goldRgb},0.04) 40%, transparent 70%)`,
              animation: "glowPulse 3s ease-in-out infinite",
            }} />
            <Text className="relative text-7xl font-bold tracking-wider block" style={{
              color: gold,
              textShadow: `0 0 20rpx rgba(${goldRgb},0.6), 0 0 40rpx rgba(${goldRgb},0.35), 0 0 80rpx rgba(${goldRgb},0.2), 0 0 120rpx rgba(${goldRgb},0.1), 0 2rpx 4rpx rgba(0,0,0,0.5)`,
            }}>
              {archetype}
            </Text>
          </View>
          <Text className="relative text-lg font-serif mt-3 block" style={{ color: "rgba(255,255,255,0.88)" }}>
            {personality.emoji} {personality.title}
          </Text>
          {/* 装饰性小星 */}
          <View className="flex items-center justify-center gap-2 mt-4">
            {[0,1,2].map(i => (
              <View key={i} style={{ width: "6rpx", height: "6rpx", borderRadius: "50%", backgroundColor: `rgba(${goldRgb},${0.3 + i * 0.15})`, animation: `glowPulse ${2 + i * 0.5}s ease-in-out infinite ${i * 0.3}s` }} />
            ))}
          </View>
        </View>
      </View>

      {/* ═══ 雷达图 Canvas — 始终在 DOM 中，确保 selectorQuery 能命中 ═══ */}
      <View className="px-3 mt-3" style={{
        opacity: showDetail ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}>
        {/* 心学金句 */}
        {showDetail && (
          <>
            <View className="relative py-6 px-2 text-center" style={{ animation: "fadeInUp 0.5s ease-out 0.1s both" }}>
              <Text className="absolute top-0 left-1/2 font-serif leading-none select-none pointer-events-none" style={{
                color: `rgba(${goldRgb},0.06)`, fontSize: "240rpx", transform: "translateX(-50%)",
              }}>&ldquo;</Text>
              <Text className="relative text-xl font-serif italic leading-relaxed block mb-2" style={{
                color: gold,
              }}>
                &ldquo;{personality.quote}&rdquo;
              </Text>
              <Text className="relative text-sm block" style={{ color: "rgba(255,255,255,0.4)" }}>
                —— {personality.quoteExplain}
              </Text>
            </View>
            <GoldSeparator />
          </>
        )}
        {/* ═══ 四维雷达图 ═══ */}
        <View className="p-5 relative" style={cardGlass}>
          {/* 顶部装饰线 */}
          <View className="absolute top-0 left-8 right-8" style={{ height: "1rpx", background: `linear-gradient(to right, transparent, rgba(${goldRgb},0.2), transparent)` }} />
          <Text className="tracking-wider uppercase block text-center mb-4" style={{
            color: "rgba(255,255,255,0.65)", fontSize: "24rpx", letterSpacing: "3rpx",
          }}>四维能量坐标</Text>
          <Canvas type="2d" id="radarCanvas" canvas-id="radarCanvas" style={{ width: "300px", height: "300px", margin: "0 auto" }} />
          <View className="flex flex-wrap gap-2 mt-4 text-center">
            {DIMENSIONS.map(dim => {
              const val = radarScores[dim.code] ?? 50
              const poleName = val > 50 ? dim.nameB : dim.nameA
              const dimCfg = DIMENSIONS_MAP[dim.code]
              return (
                <View key={dim.code} className="rounded-xl py-2 px-1" style={{ backgroundColor: "rgba(255,255,255,0.03)", flex: "1 0 46%" }}>
                  <Text className="block" style={{ fontSize: "20rpx" }}>{dimCfg?.icon ?? "✦"}</Text>
                  <Text className="font-medium block mt-1" style={{ color: "rgba(255,255,255,0.55)", fontSize: "18rpx" }}>{dimCfg?.axisNameCn ?? dim.code}</Text>
                  <Text className="block mt-1 leading-tight" style={{ color: `rgba(${goldRgb},0.85)`, fontSize: "18rpx" }}>
                    {poleName}
                  </Text>
                  <Text className="block mt-0.5" style={{ color: `rgba(${goldRgb},0.6)`, fontSize: "18rpx" }}>
                    {val}%
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      </View>

      {showDetail && (
        <>
          <GoldSeparator />

          {/* ═══ 能级细节解析 — 四维度深度解读 ═══ */}
          <View className="mb-2" style={{ animation: "fadeInUp 0.5s ease-out 0.15s both" }}>
            <View className="flex items-center gap-2 mb-4 px-1">
              <View style={{ width: "4rpx", height: "28rpx", borderRadius: "2rpx", backgroundColor: gold }} />
              <Text className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>
                能级细节解析
              </Text>
            </View>
            <View className="space-y-3">
              {DIMENSION_ORDER.map(code => {
                const dim = DIMENSIONS_MAP[code]
                const val = radarScores[code] ?? 50
                const { pole } = getPoleLabel(code, val)
                return (
                  <View key={code} className="rounded-2xl p-4 relative overflow-hidden" style={{
                    ...cardGlass,
                    animation: `fadeInUp 0.4s ease-out ${0.2 + DIMENSION_ORDER.indexOf(code) * 0.08}s both`,
                  }}>
                    {/* 左侧金色竖线 */}
                    <View className="absolute top-3 bottom-3" style={{ left: 0, width: "3rpx", background: `linear-gradient(to bottom, rgba(${goldRgb},0.5), rgba(${goldRgb},0.1))` }} />
                    <View className="pl-3">
                      {/* 标题行：icon + 轴标名 + 百分比 */}
                      <View className="flex items-center justify-between mb-2">
                        <View className="flex items-center gap-2">
                          <Text className="text-base">{dim.icon}</Text>
                          <Text className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                            {dim.axisNameCn}
                          </Text>
                        </View>
                        <Text className="text-sm font-bold" style={{ color: gold }}>
                          {val}%
                        </Text>
                      </View>
                      {/* 倾向标签 */}
                      <View className="flex items-center gap-2 mb-2">
                        <View className="px-2.5 py-0.5 rounded-full" style={{
                          backgroundColor: `rgba(${goldRgb},0.12)`,
                          border: `1rpx solid rgba(${goldRgb},0.25)`,
                          boxShadow: `0 0 8rpx rgba(${goldRgb},0.1)`,
                        }}>
                          <Text className="text-xs font-medium" style={{ color: `rgba(${goldRgb},0.9)`, fontSize: "22rpx" }}>
                            {pole.tagCn}
                          </Text>
                        </View>
                        <Text className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {pole.nameCn}
                        </Text>
                      </View>
                      {/* 描述 */}
                      <Text className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                        {pole.descCn}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>

          <GoldSeparator />

          {/* ═══ 精神状态诊断 + 改运指南 — 并排双栏（匹配 Web 布局） ═══ */}
          <View className="flex gap-3" style={{ animation: "fadeInUp 0.5s ease-out 0.2s both" }}>
            {/* 精神状态诊断 */}
            <View className="flex-1 p-4 relative overflow-hidden" style={cardGlass}>
              <Text className="tracking-wider uppercase block mb-3" style={{
                color: "rgba(255,255,255,0.6)", fontSize: "20rpx",
              }}>
                🧠 精神状态诊断
              </Text>
              <Text className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                <HighlightText text={personality.diagnosis} />
              </Text>
            </View>

            {/* 改运指南 */}
            <View className="flex-1 p-4 relative overflow-hidden" style={{
              ...cardGlass,
              animation: "fadeInUp 0.5s ease-out 0.25s both",
            }}>
              <Text className="tracking-wider uppercase block mb-3" style={{
                color: "rgba(255,255,255,0.6)", fontSize: "20rpx",
              }}>
                🧭 改运指南
              </Text>
              <Text className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                <HighlightText text={personality.advice} />
              </Text>
            </View>
          </View>

          <GoldSeparator />

          {/* ═══ 社交匹配 — Web 级 hover 发光卡片 ═══ */}
          <View className="flex gap-2.5" style={{ animation: "fadeInUp 0.5s ease-out 0.3s both" }}>
            {/* 天作之合 */}
            <View className="flex-1 rounded-2xl p-4 relative" style={{
              backgroundColor: "rgba(16,185,129,0.04)",
              border: "1rpx solid rgba(16,185,129,0.25)",
              boxShadow: "0 0 30rpx rgba(16,185,129,0.08), 0 4rpx 16rpx rgba(0,0,0,0.15)",
            }}>
              {/* 顶部微光条 */}
              <View className="absolute top-0 left-4 right-4" style={{ height: "1rpx", background: "linear-gradient(to right, transparent, rgba(16,185,129,0.4), transparent)" }} />
              <View className="flex items-center gap-2 mb-3">
                <View className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.15)", boxShadow: "0 0 12rpx rgba(16,185,129,0.2)" }}>
                  <Text className="text-xs">💕</Text>
                </View>
                <Text className="font-medium" style={{ color: "rgba(16,185,129,0.9)", fontSize: "22rpx" }}>天作之合</Text>
              </View>
              {compatNames.map((p) => p && (
                <View key={p.code} className="flex items-center gap-2 mb-2 rounded-xl px-2 py-1.5" style={{ animation: "fadeInUp 0.3s ease-out 0.4s both", backgroundColor: "rgba(16,185,129,0.04)" }}>
                  <Text className="text-sm">{p.emoji}</Text>
                  <Text className="leading-tight" style={{ color: "rgba(255,255,255,0.8)", fontSize: "22rpx" }}>{p.title}</Text>
                </View>
              ))}
            </View>

            {/* 离远点保命 */}
            <View className="flex-1 rounded-2xl p-4 relative" style={{
              backgroundColor: "rgba(239,68,68,0.04)",
              border: "1rpx solid rgba(239,68,68,0.25)",
              boxShadow: "0 0 30rpx rgba(239,68,68,0.08), 0 4rpx 16rpx rgba(0,0,0,0.15)",
            }}>
              {/* 顶部微光条 */}
              <View className="absolute top-0 left-4 right-4" style={{ height: "1rpx", background: "linear-gradient(to right, transparent, rgba(239,68,68,0.4), transparent)" }} />
              <View className="flex items-center gap-2 mb-3">
                <View className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.15)", boxShadow: "0 0 12rpx rgba(239,68,68,0.2)" }}>
                  <Text className="text-xs">⚠️</Text>
                </View>
                <Text className="font-medium" style={{ color: "rgba(239,68,68,0.9)", fontSize: "22rpx" }}>离远点保命</Text>
              </View>
              {clashNames.map((p) => p && (
                <View key={p.code} className="flex items-center gap-2 mb-2 rounded-xl px-2 py-1.5" style={{ animation: "fadeInUp 0.3s ease-out 0.4s both", backgroundColor: "rgba(239,68,68,0.04)" }}>
                  <Text className="text-sm">{p.emoji}</Text>
                  <Text className="leading-tight" style={{ color: "rgba(255,255,255,0.8)", fontSize: "22rpx" }}>{p.title}</Text>
                </View>
              ))}
            </View>
          </View>

          <GoldSeparator />

          {/* ═══ AI 深度解读 CTA — 匹配 Web 流光边框 ═══ */}
          <View className="relative rounded-2xl overflow-hidden mb-5" style={{
            animation: "fadeInUp 0.5s ease-out 0.35s both",
          }}>
            {/* 流光边框动画 — 匹配 Web shimmer border */}
            <View className="absolute rounded-2xl pointer-events-none" style={{
              top: 0, left: 0, right: 0, bottom: 0,
              padding: "1rpx",
              background: `linear-gradient(to right, rgba(${goldRgb},0), rgba(${goldRgb},0.4), rgba(${goldRgb},0))`,
              backgroundSize: "200% 100%",
              animation: "shimmer 3s ease-in-out infinite",
            }} />
            <View className="relative rounded-2xl p-5" style={{
              ...cardElevated,
              margin: "1rpx",
            }}>
              <View className="text-center mb-4">
                <View className="flex items-center justify-center gap-2 mb-2">
                  <Text className="text-xs" style={{ color: `rgba(${goldRgb},0.75)` }}>🔮</Text>
                  <Text className="text-xs" style={{ color: `rgba(${goldRgb},0.75)`, textShadow: `0 0 8rpx rgba(${goldRgb},0.3)` }}>星轨预警</Text>
                </View>
                <Text className="text-sm leading-relaxed block mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
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
                  backgroundSize: "200% 100%",
                  boxShadow: `0 4rpx 20rpx rgba(${goldRgb},0.35), 0 0 40rpx rgba(${goldRgb},0.12)`,
                }}
                onClick={() => Taro.showToast({ title: "跳转中…", icon: "loading" })}
              >
                {/* 光泽扫过 */}
                <View className="absolute inset-0 pointer-events-none" style={{
                  background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.3) 55%, transparent 60%)`,
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2.5s ease-in-out infinite",
                }} />
                <Text className="relative font-bold" style={{ color: "#1A0F2E", fontSize: "30rpx", textShadow: "0 1rpx 2rpx rgba(0,0,0,0.15)" }}>
                  🔮 开启命运解读 · 100 ✨
                </Text>
              </View>
            </View>
          </View>

          {/* ═══ 操作按钮 — 匹配 Web 风格 ═══ */}
          <View className="flex gap-3 mb-5" style={{ animation: "fadeInUp 0.5s ease-out 0.4s both" }}>
            {/* 保存海报 — Web 黑金渐变实体按钮 */}
            <View
              className="flex-1 py-3 rounded-xl text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(to right, rgba(${goldRgb},0.2), rgba(${goldRgb},0.1), rgba(${goldRgb},0.2))`,
                border: `1rpx solid rgba(${goldRgb},0.4)`,
              }}
              onClick={handleSavePoster}
            >
              <Text className="text-sm font-medium" style={{ color: gold }}>✨ 保存海报</Text>
            </View>
            {/* 分享结果 — Web btn-gold-outline */}
            <Button
              openType="share"
              className="flex-1 py-3 rounded-xl text-center leading-none relative overflow-hidden"
              style={{
                margin: 0, padding: "12px 0", lineHeight: "normal",
                backgroundColor: "transparent",
                border: `1rpx solid rgba(${goldRgb},0.4)`,
              }}
            >
              <Text className="text-sm font-medium" style={{ color: gold }}>📤 分享结果</Text>
            </Button>
          </View>

          {/* 重新测试 */}
          <View className="text-center pt-2 pb-8">
            <Text className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}
              onClick={() => { Taro.removeStorageSync("am16_answers"); Taro.navigateTo({ url: "/pages/quiz/index" }) }}
            >🔄 重新测试</Text>
          </View>
        </>
      )}

      <Canvas type="2d" id="shareCanvas" style={{ position: "fixed", left: "-9999px", top: "-9999px", width: "750px", height: "1480px" }} />
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
  const cx = size / 2, cy = size / 2, r = size * 0.34
  const dims = DIMENSIONS
  const corners = [{ x: cx, y: cy - r }, { x: cx + r, y: cy }, { x: cx, y: cy + r }, { x: cx - r, y: cy }]

  // 外圈装饰 — 弱发光
  ctx.strokeStyle = `rgba(${goldRgb},0.06)`; ctx.lineWidth = 0.5
  ctx.beginPath(); ctx.arc(cx, cy, r + 20, 0, Math.PI * 2); ctx.stroke()

  // 网格 — 4 层，中心亮→边缘暗
  for (const scale of [0.25, 0.5, 0.75, 1]) {
    const alpha = 0.03 + (1 - scale) * 0.07
    ctx.strokeStyle = `rgba(${goldRgb},${alpha})`
    ctx.lineWidth = scale === 1 ? 0.8 : 0.4
    ctx.beginPath()
    corners.forEach((c, i) => {
      const x = cx + (c.x - cx) * scale, y = cy + (c.y - cy) * scale
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.closePath(); ctx.stroke()
  }

  // 轴线 + 轴端发光点 + 双层标签
  corners.forEach((c, i) => {
    ctx.strokeStyle = `rgba(${goldRgb},0.08)`; ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(c.x, c.y); ctx.stroke()
    // 轴端小圆点
    ctx.beginPath(); ctx.arc(c.x, c.y, 2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${goldRgb},0.3)`; ctx.fill()
    // 双层标签 — icon + 轴标名 + 倾向标签
    const dim = dims[i]
    const val = scores[dim.code] ?? 50
    const poleName = val > 50 ? dim.nameB : dim.nameA
    const lx = cx + (c.x - cx) * 1.25, ly = cy + (c.y - cy) * 1.25
    ctx.textAlign = "center"
    // 第一行：icon + 轴标名
    ctx.fillStyle = `rgba(${goldRgb},0.7)`; ctx.font = "bold 11px sans-serif"
    const dimCfg = DIMENSIONS_MAP[dim.code]
    ctx.fillText((dimCfg?.icon ?? "✦") + " " + (dimCfg?.axisNameCn ?? dim.code), lx, ly - 4)
    // 第二行：倾向标签
    ctx.fillStyle = `rgba(${goldRgb},0.45)`; ctx.font = "9px sans-serif"
    ctx.fillText(poleName, lx, ly + 10)
  })

  // 数据区域 — 渐变填充 + 发光描边
  ctx.beginPath()
  corners.forEach((c, i) => {
    const val = (scores[dims[i].code] ?? 50) / 100, ratio = 0.15 + val * 0.85
    const x = cx + (c.x - cx) * ratio, y = cy + (c.y - cy) * ratio
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  ctx.closePath()
  // 渐变填充
  const fillGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  fillGrad.addColorStop(0, `rgba(${goldRgb},0.18)`)
  fillGrad.addColorStop(1, `rgba(${goldRgb},0.04)`)
  ctx.fillStyle = fillGrad; ctx.fill()
  // 发光描边
  ctx.shadowColor = `rgba(${goldRgb},0.6)`; ctx.shadowBlur = 14
  ctx.strokeStyle = gold; ctx.lineWidth = 2.5; ctx.stroke()
  ctx.shadowBlur = 0

  // 数据点 — 加大发光
  corners.forEach((c, i) => {
    const val = (scores[dims[i].code] ?? 50) / 100, ratio = 0.15 + val * 0.85
    const x = cx + (c.x - cx) * ratio, y = cy + (c.y - cy) * ratio
    // 外圈光晕
    ctx.shadowColor = `rgba(${goldRgb},0.7)`; ctx.shadowBlur = 12
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fillStyle = gold; ctx.fill()
    // 内圈白芯
    ctx.shadowBlur = 0
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fill()
  })
}

function drawSharePoster(canvasNode: any, code: string, p: AM16Personality, scores: Record<string, number>) {
  const ctx = canvasNode.getContext("2d")
  const dpr = getDPR()
  canvasNode.width = 750 * dpr; canvasNode.height = 1480 * dpr
  ctx.scale(dpr, dpr)
  const W = 750, H = 1480

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

  // 四维能量坐标 — 双层标签
  ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "bold 18px sans-serif"; ctx.fillText("四维能量坐标", W / 2, 670)
  const dimY = 700
  DIMENSIONS.forEach((dim, i) => {
    const val = scores[dim.code] ?? 50
    const poleName = val > 50 ? dim.nameB : dim.nameA
    const dimCfg = DIMENSIONS_MAP[dim.code]
    const x = 112 + i * 155
    ctx.font = "20px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fillText(dimCfg?.icon ?? "✦", x, dimY)
    ctx.font = "bold 13px sans-serif"; ctx.fillStyle = `rgba(${goldRgb},0.7)`; ctx.fillText(dimCfg?.axisNameCn ?? dim.code, x, dimY + 22)
    ctx.font = "12px sans-serif"; ctx.fillStyle = `rgba(${goldRgb},0.5)`; ctx.fillText(poleName, x, dimY + 40)
    ctx.font = "bold 16px sans-serif"; ctx.fillStyle = gold; ctx.fillText(val + "%", x, dimY + 60)
  })

  // 渐变分割线 2
  ctx.strokeStyle = lineGrad; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(150, 775); ctx.lineTo(600, 775); ctx.stroke()

  ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "bold 20px sans-serif"; ctx.fillText("精神状态诊断", W / 2, 820)
  ctx.font = "16px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.45)"; wrapText(ctx, p.diagnosis, W / 2, 855, 600, 24)
  ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "bold 20px sans-serif"; ctx.fillText("改运指南", W / 2, 1020)
  ctx.font = "16px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.45)"; wrapText(ctx, p.advice, W / 2, 1055, 600, 24)

  ctx.fillStyle = gold; ctx.font = "bold 22px sans-serif"; ctx.fillText("扫码测测你的天命格局", W / 2, 1220)
  ctx.beginPath(); ctx.arc(W / 2, 1300, 40, 0, Math.PI * 2); ctx.fillStyle = `rgba(${goldRgb},0.1)`; ctx.fill()
  ctx.strokeStyle = `rgba(${goldRgb},0.3)`; ctx.lineWidth = 1; ctx.stroke()
  ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "12px sans-serif"; ctx.fillText("小程序码", W / 2, 1305)
  ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillText("新用户立赠 20 星尘能量 · 官网同步登录", W / 2, 1400)
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
