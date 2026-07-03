"use client"
import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { DESTINY_STARS as NODES } from "@/data/destinyStars"

/* ═══════════════════════════════════════════════════════════════════
   关键节点深度解读 — Key Node Deep Dive

   替代原来的卡片网格，改为纵向叙事时间轴：
   - 左右交替卡片
   - 中央金色时间线贯穿
   - 每张卡片：年份 + 标题 + 故事段落 + 横向条形图 + AI 引言
   - 滚动触发入场动画
   ═══════════════════════════════════════════════════════════════════ */

/* ── 横向条形图 ── */

function IndexBar({ label, value, maxVal, color }: { label: string; value: number; maxVal: number; color: string }) {
  const pct = (value / maxVal) * 100
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-parchment-400 text-xs w-14 sm:w-16 flex-shrink-0 text-right">{label}</span>
      <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-[1.5s] ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}90, ${color}dd)`,
          }}
        />
      </div>
      <span className="text-xs font-mono w-6 text-right" style={{ color: `${color}aa` }}>
        {value}
      </span>
    </div>
  )
}

/* ── 单张深度解读卡片 ── */

function NodeCard({
  node,
  index,
  locale,
}: {
  node: typeof NODES[0]
  index: number
  locale: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const isLeft = index % 2 === 0

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={cardRef}
      className={`relative flex items-start gap-6 sm:gap-8 transition-all duration-[1.2s] ${
        isLeft ? "flex-row" : "flex-row-reverse"
      }`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translateY(0)"
          : `translateY(40px) translateX(${isLeft ? "-20px" : "20px"})`,
      }}
    >
      {/* ── 卡片内容 ── */}
      <div className="flex-1 max-w-lg">
        <div
          className="rounded-3xl p-6 sm:p-8 transition-all duration-700 hover:translate-y-[-2px]"
          style={{
            background: `linear-gradient(135deg, ${node.color}06, rgba(255,255,255,0.02))`,
            border: `1px solid ${node.color}18`,
            boxShadow: isVisible ? `0 0 40px ${node.color}08, 0 16px 40px rgba(0,0,0,0.3)` : "none",
          }}
        >
          {/* 年份徽章 */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4"
            style={{
              background: `${node.color}12`,
              border: `1px solid ${node.color}22`,
              color: node.color,
            }}
          >
            {node.year}
          </div>

          {/* 标题 */}
          <h3
            className="font-serif font-bold text-xl sm:text-2xl mb-4 transition-colors duration-500"
            style={{ color: node.color }}
          >
            {locale === "zh" ? node.labelZh : node.labelEn}
          </h3>

          {/* 故事段落 */}
          <p className="text-parchment-400 text-sm sm:text-[15px] leading-relaxed mb-5">
            {locale === "zh" ? node.aiZh : node.aiEn}
          </p>

          {/* 三维指数条形图 */}
          <div
            className="mb-5 p-4 rounded-xl"
            style={{ background: `${node.color}04`, border: `1px solid ${node.color}0a` }}
          >
            <div className="text-[9px] font-bold tracking-wider uppercase mb-3" style={{ color: `${node.color}60` }}>
              {locale === "zh" ? "三维能量指数" : "3D Energy Index"}
            </div>
            <IndexBar
              label={locale === "zh" ? "成长" : "Growth"}
              value={locale === "zh" ? node.growthZh : node.growthEn}
              maxVal={5}
              color={node.color}
            />
            <IndexBar
              label={locale === "zh" ? "机会" : "Opportunity"}
              value={locale === "zh" ? node.opportunityZh : node.opportunityEn}
              maxVal={5}
              color={node.color}
            />
            <IndexBar
              label={locale === "zh" ? "挑战" : "Challenge"}
              value={locale === "zh" ? node.challengeZh : node.challengeEn}
              maxVal={5}
              color={node.color}
            />
          </div>

          {/* 关键词 */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {(locale === "zh" ? node.keywords.zh : node.keywords.en).map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: `${node.color}10`,
                  border: `1px solid ${node.color}18`,
                  color: `${node.color}bb`,
                }}
              >
                {kw}
              </span>
            ))}
          </div>

          {/* AI 引言 */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none mt-[-2px]" style={{ color: `${node.color}30` }}>"</span>
              <p className="text-parchment-400 text-xs sm:text-[13px] leading-relaxed italic">
                {locale === "zh"
                  ? `${node.labelZh}意味着命运齿轮的关键转向。三维指数显示此阶段${node.growthZh >= 4 ? "成长动能强劲" : "挑战与机遇并存"}，${node.opportunityZh >= 4 ? "机会窗口大开" : "需要耐心布局"}。`
                  : `${node.labelEn} marks a critical turn. Energy indices show ${node.growthEn >= 4 ? "strong growth momentum" : "balanced challenge and opportunity"} with ${node.opportunityEn >= 4 ? "wide-open opportunity windows" : "room for strategic planning"}.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 时间线节点（中间圆点） ── */}
      <div className="hidden sm:flex flex-col items-center flex-shrink-0 pt-8" style={{ width: "40px" }}>
        {/* 星核圆点 */}
        <div
          className="relative w-5 h-5 rounded-full z-10 transition-all duration-700"
          style={{
            background: `radial-gradient(circle at 40% 40%, ${node.color}, ${node.color}90 50%, ${node.color}40 80%, transparent)`,
            boxShadow: isVisible ? `0 0 16px ${node.color}50, 0 0 32px ${node.color}25` : "none",
          }}
        />
        {/* 脉冲环 */}
        <div
          className="absolute w-5 h-5 rounded-full transition-all duration-1000"
          style={{
            border: `1px solid ${node.color}25`,
            opacity: isVisible ? 0.4 : 0,
            animation: isVisible ? "deepPulse 3s ease-in-out infinite" : "none",
            animationDelay: `${index * 0.5}s`,
          }}
        />
      </div>

      {/* 空白占位（另一侧） */}
      <div className="hidden sm:block flex-1" />
    </div>
  )
}

/* ── 主组件 ── */

export default function KeyLifeNodes() {
  const { locale } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // 只展示前5个节点（第6个由 FutureStillWriting 覆盖）
  const displayNodes = NODES.slice(0, 5)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.05 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-36 overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[600px] rounded-full bg-[#C5A880]/[0.015] blur-[180px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 区块标题 */}
        <div
          className="text-center mb-16 sm:mb-24 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(40px)" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/[0.05] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
            <span className="text-[#C5A880]/70 text-xs tracking-[0.15em] uppercase">
              {locale === "zh" ? "深度解读" : "Deep Dive"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-wide mb-5">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C5A880] via-[#E8D5B7] to-[#C5A880]">
              {locale === "zh" ? "关键节点深度解读" : "Key Node Deep Dive"}
            </span>
          </h2>

          <p className="text-parchment-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {locale === "zh"
              ? "每一个命运节点背后都有深层逻辑，以下是 AI 基于五维合参为你推演的关键转折"
              : "Each destiny node carries deep logic — below are AI-projected key turning points based on 5D synthesis"}
          </p>
        </div>

        {/* ── 时间轴 ── */}
        <div className="relative">
          {/* 中央时间线 */}
          <div
            className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] transition-all duration-[2s]"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, rgba(197,168,128,0.2) 10%, rgba(197,168,128,0.15) 80%, transparent 100%)",
              opacity: isVisible ? 1 : 0,
              transitionDelay: "0.3s",
            }}
          />

          {/* 卡片列表 */}
          <div className="space-y-12 sm:space-y-16">
            {displayNodes.map((node, i) => (
              <NodeCard
                key={node.id}
                node={node}
                index={i}
                locale={locale}
              />
            ))}
          </div>
        </div>

        {/* 底部说明 */}
        <div
          className="text-center mt-16 sm:mt-20 transition-all duration-1000 delay-500"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          <p className="text-parchment-400 text-xs tracking-wider max-w-md mx-auto leading-relaxed">
            {locale === "zh"
              ? "以上节点基于五维合参推演，实际人生轨迹受个人选择与环境影响"
              : "Waypoints derived from 5D synthesis — actual life trajectory influenced by personal choices and environment"}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes deepPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </section>
  )
}
