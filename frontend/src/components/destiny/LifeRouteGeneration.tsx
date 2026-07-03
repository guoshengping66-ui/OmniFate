"use client"
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { DESTINY_STARS as STARS, OPPORTUNITY_ZONES } from "@/data/destinyStars"

/* ── Animation timing constants (ms) ── */
const ANIM_STEP0_DELAY = 50   // Initial layout
const ANIM_STEP1_DELAY = 350  // Stars light up
const ANIM_STEP2_DELAY = 700  // Full reveal

/* ═══════════════════════════════════════════════════════════════════
   银河航线 — Galaxy Route

   设计原则：
   - 轨迹不是主角，节点才是主角
   - 命运窗口 = 机会区间（金色星云，非单一年份）
   - 三步入场动画：航线绘制 → 节点点亮 → 金色流光
   - 航线向宇宙深处无限延伸
   ═══════════════════════════════════════════════════════════════════ */

/* ── 路径工具 ── */

function getSegmentPath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const cp1x = a.x + (b.x - a.x) * 0.3
  const cp1y = a.y + (b.y - a.y) * 0.1 - 5
  const cp2x = a.x + (b.x - a.x) * 0.7
  const cp2y = a.y + (b.y - a.y) * 0.9 + 5
  return `M ${a.x} ${a.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${b.x} ${b.y}`
}

function getFullRoutePath() {
  const parts: string[] = []
  for (let i = 0; i < STARS.length - 1; i++) {
    parts.push(getSegmentPath(STARS[i], STARS[i + 1]))
  }
  return parts.join(" ")
}

/* ── 绘制航线 SVG（带路径动画） ── */

function RoutePath({ animStep, idPrefix }: { animStep: number; idPrefix: string }) {
  const routePath = useMemo(() => getFullRoutePath(), [])

  // 延伸段：最后一个节点向右延伸并消失
  const last = STARS[STARS.length - 1]
  const extendEnd = { x: Math.min(last.x + 12, 100), y: last.y - 8 }
  const extendPath = getSegmentPath(last, extendEnd)

  // 各段近似长度用于 dashoffset 动画
  const totalLength = 120 // 估算

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${idPrefix}-routeGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(197,168,128,0.05)" />
          <stop offset="30%" stopColor="rgba(197,168,128,0.25)" />
          <stop offset="60%" stopColor="rgba(212,175,55,0.3)" />
          <stop offset="100%" stopColor="rgba(197,168,128,0.15)" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-routeGlowGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(197,168,128,0.02)" />
          <stop offset="40%" stopColor="rgba(212,175,55,0.1)" />
          <stop offset="80%" stopColor="rgba(212,175,55,0.06)" />
          <stop offset="100%" stopColor="rgba(45,106,79,0.03)" />
        </linearGradient>
        <filter id={`${idPrefix}-routeGlow`}>
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* 金色流光渐变 */}
        <linearGradient id={`${idPrefix}-shimmerGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(212,175,55,0)" />
          <stop offset="40%" stopColor="rgba(212,175,55,0.4)" />
          <stop offset="60%" stopColor="rgba(212,175,55,0.4)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </linearGradient>
        <clipPath id={`${idPrefix}-routeClip`}>
          <path d={routePath} />
        </clipPath>
      </defs>

      {/* 航线光晕层 */}
      <path
        d={routePath}
        fill="none"
        stroke="rgba(212,175,55,0.06)"
        strokeWidth="1.5"
        strokeLinecap="round"
        filter={`url(#${idPrefix}-routeGlow)`}
        strokeDasharray={totalLength}
        strokeDashoffset={animStep >= 0 ? 0 : totalLength}
        style={{ transition: "stroke-dashoffset 0.4s ease-out" }}
      />

      {/* 主航线 */}
      <path
        d={routePath}
        fill="none"
        stroke={`url(#${idPrefix}-routeGrad)`}
        strokeWidth="0.4"
        strokeLinecap="round"
        strokeDasharray={totalLength}
        strokeDashoffset={animStep >= 0 ? 0 : totalLength}
        style={{ transition: "stroke-dashoffset 0.4s ease-out" }}
      />

      {/* 星尘虚线 */}
      <path
        d={routePath}
        fill="none"
        stroke="rgba(197,168,128,0.1)"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeDasharray="1.5 2"
        opacity={animStep >= 0 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease 0.15s" }}
      />

      {/* ── 延伸段：向宇宙深处 ── */}
      <path
        d={extendPath}
        fill="none"
        stroke="rgba(197,168,128,0.08)"
        strokeWidth="0.3"
        strokeLinecap="round"
        strokeDasharray="1 3"
        opacity={animStep >= 1 ? 0.6 : 0}
        style={{ transition: "opacity 0.6s ease 0.6s" }}
      />
      <path
        d={extendPath}
        fill="none"
        stroke="rgba(45,106,79,0.04)"
        strokeWidth="0.8"
        strokeLinecap="round"
        filter={`url(#${idPrefix}-routeGlow)`}
        opacity={animStep >= 1 ? 0.4 : 0}
        style={{ transition: "opacity 0.8s ease 0.7s" }}
      />

      {/* ── 金色流光（Step 3） ── */}
      {animStep >= 2 && (
        <rect
          x="0" y="0" width="100%" height="100%"
          fill={`url(#${idPrefix}-shimmerGrad)`}
          clipPath={`url(#${idPrefix}-routeClip)`}
          opacity="0"
          style={{
            animation: "goldenSweep 0.4s ease-out forwards",
          }}
        />
      )}
    </svg>
  )
}

/* ── 星尘粒子 ── */

function DustParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      key: `dust-${i}`,
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: 0.3 + Math.random() * 1,
      opacity: 0.03 + Math.random() * 0.06,
      delay: Math.random() * 8,
      duration: 4 + Math.random() * 5,
    }))
  }, [])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {particles.map((p) => (
        <circle
          key={p.key}
          cx={p.x}
          cy={p.y}
          r={p.size * 0.12}
          fill="#C5A880"
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values={`0;${p.opacity};0`}
            dur={`${p.duration}s`}
            begin={`${p.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  )
}

/* ── 命运恒星节点 ── */

/* ── 命运窗口（机会区间星云） ── */

function OpportunityZones({ animStep, locale }: { animStep: number; locale: string }) {
  const isVisible = animStep >= 1
  return (
    <>
      {OPPORTUNITY_ZONES.map((zone, i) => (
        <div
          key={zone.id}
          className="absolute transition-all duration-[1.5s]"
          style={{
            left: `${zone.x - zone.width / 2}%`,
            top: `${zone.y - zone.height / 2}%`,
            width: `${zone.width}%`,
            height: `${zone.height}%`,
            opacity: isVisible ? 1 : 0,
            transitionDelay: `${0.8 + i * 0.12}s`,
          }}
        >
          {/* 星云渐变 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(ellipse at center, ${zone.color}12 0%, ${zone.color}06 40%, transparent 70%)`,
              filter: "blur(20px)",
            }}
          />
          {/* 内层光核 */}
          <div
            className="absolute rounded-full"
            style={{
              left: "30%",
              top: "30%",
              width: "40%",
              height: "40%",
              background: `radial-gradient(circle, ${zone.color}18 0%, ${zone.color}08 50%, transparent 80%)`,
              filter: "blur(12px)",
            }}
          />
          {/* 窗口标签 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap">
            <div
              className="text-[11px] sm:text-xs font-serif font-bold tracking-[0.08em]"
              style={{ color: `${zone.color}80` }}
            >
              {locale === "zh" ? zone.labelZh : zone.labelEn}
            </div>
            <div
              className="text-[9px] sm:text-[10px] tracking-[0.06em] mt-0.5"
              style={{ color: `${zone.color}50` }}
            >
              {locale === "zh" ? zone.yearRange.zh : zone.yearRange.en}
            </div>
            <div
              className="text-[8px] sm:text-[9px] mt-0.5"
              style={{ color: `${zone.color}40` }}
            >
              {locale === "zh" ? zone.descZh : zone.descEn}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

function DestinyStar({
  star,
  isActive,
  onClick,
  locale,
  animStep,
  index,
}: {
  star: typeof STARS[0]
  isActive: boolean
  onClick: () => void
  locale: string
  animStep: number
  index: number
}) {
  const baseSize = 64 + star.magnitude * 10
  const hoverScale = isActive ? 1.35 : 1

  // 节点在 Step 1 时逐个点亮
  const litDelay = 0.3 + index * 0.06 // 0.3s 开始，每个间隔 0.06s
  const isLit = animStep >= 1

  return (
    <div
      className="absolute cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`${locale === "zh" ? star.labelZh : star.labelEn} ${star.year}`}
      aria-expanded={isActive}
      style={{
        left: `${star.x}%`,
        top: `${star.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isActive ? 50 : 20,
        opacity: isLit ? 1 : 0,
        transition: `opacity 0.5s ease ${litDelay}s`,
      }}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick() } }}
    >
      {/* ── Hover 展开卡片 ── */}
      {isActive && (
        <div
          className="absolute left-1/2 bottom-full mb-8 w-[290px] sm:w-[320px] p-6 rounded-3xl z-50 pointer-events-auto"
          style={{
            transform: "translateX(-50%)",
            background: "rgba(5,8,22,0.94)",
            backdropFilter: "blur(24px)",
            border: `1px solid ${star.color}35`,
            boxShadow: `0 0 60px ${star.color}18, 0 24px 48px rgba(0,0,0,0.6)`,
            animation: "starCardIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          {/* 标题 + 年份 */}
          <div className="mb-4">
            <div className="font-serif font-bold text-base sm:text-lg" style={{ color: star.color }}>
              {locale === "zh" ? star.labelZh : star.labelEn}
            </div>
            <div className="text-white/25 text-[11px] tracking-wider mt-1">{star.year}</div>
          </div>

          {/* 三维指数 */}
          <div className="mb-4 p-3 rounded-xl" style={{ background: `${star.color}08`, border: `1px solid ${star.color}12` }}>
            <StarRating label={locale === "zh" ? "成长指数" : "Growth"} value={locale === "zh" ? star.growthZh : star.growthEn} color={star.color} />
            <StarRating label={locale === "zh" ? "机会指数" : "Opportunity"} value={locale === "zh" ? star.opportunityZh : star.opportunityEn} color={star.color} />
            <StarRating label={locale === "zh" ? "挑战指数" : "Challenge"} value={locale === "zh" ? star.challengeZh : star.challengeEn} color={star.color} />
          </div>

          {/* 关键词 */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(locale === "zh" ? star.keywords.zh : star.keywords.en).map((kw, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-medium"
                style={{ background: `${star.color}10`, border: `1px solid ${star.color}18`, color: `${star.color}bb` }}>
                {kw}
              </span>
            ))}
          </div>

          {/* AI 推演 */}
          <div className="pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: `${star.color}80` }}>
                {locale === "zh" ? "AI 推演" : "AI Projection"}
              </span>
              <div className="flex-1 h-[1px]" style={{ background: `${star.color}15` }} />
            </div>
            <p className="text-white/30 text-[11px] leading-relaxed">
              {locale === "zh" ? star.aiZh : star.aiEn}
            </p>
          </div>
        </div>
      )}

      {/* ── 命运恒星：三层结构 ── */}
      <div
        className="relative"
        style={{
          width: baseSize,
          height: baseSize,
          transform: `scale(${hoverScale})`,
          transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* 外层光晕 */}
        <div className="absolute rounded-full"
          style={{
            inset: "-30%",
            background: `radial-gradient(circle, ${star.color}15 0%, ${star.color}06 40%, transparent 70%)`,
            opacity: isActive ? 0.9 : 0.5,
            transition: "opacity 0.6s ease",
            filter: "blur(8px)",
          }} />
        {/* 脉冲环 */}
        <div className="absolute rounded-full"
          style={{
            inset: "10%",
            border: `1px solid ${star.color}30`,
            animation: `pulseRing 4s ease-in-out infinite ${index * 0.7}s`,
          }} />
        <div className="absolute rounded-full"
          style={{
            inset: "22%",
            border: `1px solid ${star.color}18`,
            animation: `pulseRing 5s ease-in-out infinite ${index * 0.7 + 0.8}s`,
          }} />
        {/* 星核 */}
        <div className="absolute rounded-full"
          style={{
            inset: "25%",
            background: `radial-gradient(circle at 40% 40%, ${star.color} 0%, ${star.color}90 30%, ${star.color}40 60%, transparent 85%)`,
            boxShadow: `0 0 ${isActive ? "28px" : "14px"} ${star.color}50, 0 0 ${isActive ? "56px" : "28px"} ${star.color}20`,
            transition: "box-shadow 0.6s ease",
          }} />
        {/* 亮点 */}
        <div className="absolute rounded-full bg-white"
          style={{
            inset: "38%",
            opacity: isActive ? 0.95 : 0.6,
            transition: "opacity 0.4s ease",
          }} />
      </div>

      {/* 星名标签 */}
      <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
        <div className="text-xs sm:text-sm font-serif font-semibold tracking-[0.02em] transition-colors duration-500"
          style={{ color: isActive ? star.color : `${star.color}90` }}>
          {locale === "zh" ? star.labelZh : star.labelEn}
        </div>
        <div className="text-white/25 text-[10px] sm:text-[11px] tracking-[0.06em] mt-0.5">{star.year}</div>
      </div>
    </div>
  )
}

/* ── 恒星指数条 ── */

function StarRating({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-white/30 text-[10px] w-16 flex-shrink-0">{label}</span>
      <span className="text-[11px] tracking-[1px]" style={{ color }}>
        {"★".repeat(value)}<span style={{ opacity: 0.15 }}>{"★".repeat(5 - value)}</span>
      </span>
    </div>
  )
}

/* ── 成长逻辑链 ── */

const LOGIC_CHAIN = [
  { zh: "学习积累", en: "Knowledge Accumulation" },
  { zh: "能力跃迁", en: "Capability Leap" },
  { zh: "事业突破", en: "Career Breakthrough" },
  { zh: "财富增长", en: "Wealth Growth" },
  { zh: "关系深化", en: "Bond Deepening" },
  { zh: "人生转型", en: "Life Transformation" },
  { zh: "成果兑现", en: "Legacy Harvest" },
]

function GrowthLogicChain({ animStep, locale }: { animStep: number; locale: string }) {
  const isLit = animStep >= 1
  return (
    <div className="mt-12 sm:mt-16 transition-all duration-1000"
      style={{ opacity: isLit ? 1 : 0, transform: isLit ? "translateY(0)" : "translateY(30px)", transitionDelay: "0.6s" }}>
      <div className="text-center mb-6">
        <span className="text-white/20 text-[10px] tracking-[0.15em] uppercase">
          {locale === "zh" ? "成长逻辑链 · 因果推演" : "Growth Logic Chain · Causal Projection"}
        </span>
      </div>
      <div className="flex flex-col items-center gap-0">
        {LOGIC_CHAIN.map((step, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-serif font-medium transition-all duration-700"
              style={{
                background: `linear-gradient(135deg, ${STARS[Math.min(i, STARS.length - 1)].color}12, ${STARS[Math.min(i, STARS.length - 1)].color}04)`,
                border: `1px solid ${STARS[Math.min(i, STARS.length - 1)].color}25`,
                color: `${STARS[Math.min(i, STARS.length - 1)].color}cc`,
                opacity: isLit ? 1 : 0,
                transform: isLit ? "translateY(0)" : "translateY(10px)",
                transitionDelay: `${0.7 + i * 0.06}s`,
              }}>
              {locale === "zh" ? step.zh : step.en}
            </div>
            {i < LOGIC_CHAIN.length - 1 && (
              <div className="flex flex-col items-center my-1 transition-all duration-500"
                style={{ opacity: isLit ? 1 : 0, transitionDelay: `${0.75 + i * 0.06}s` }}>
                <div className="w-[1px] h-4" style={{ background: `${STARS[Math.min(i, STARS.length - 1)].color}20` }} />
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 1L4 4.5L7 1" stroke={STARS[Math.min(i, STARS.length - 1)].color} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-5">
        <p className="text-white/15 text-[10px] tracking-wider leading-relaxed max-w-md mx-auto">
          {locale === "zh"
            ? "以上逻辑链基于命盘五维合参推演，每一阶段都是前一阶段的因果延伸"
            : "Logic chain derived from 5D chart synthesis — each stage is a causal extension of the previous one"}
        </p>
      </div>
    </div>
  )
}

/* ── 主组件 ──────────────────────────────────────────── */

export default function LifeRouteGeneration() {
  const { locale } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)
  const idPrefix = React.useId()

  // 动画步骤：0 = 未开始，1 = 航线绘制完成+节点点亮，2 = 金色流光
  const [animStep, setAnimStep] = useState(-1)
  const animStepRef = useRef(animStep)
  animStepRef.current = animStep

  // 背景星点（memoized to avoid re-randomization on re-render）
  const bgStars = useMemo(() => (
    Array.from({ length: 40 }, (_, i) => ({
      key: `bg-star-${i}`,
      left: 5 + Math.random() * 90,
      top: 5 + Math.random() * 90,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.04 + Math.random() * 0.08,
      twinkleDur: 2 + Math.random() * 4,
      twinkleDelay: Math.random() * 5,
    }))
  ), [])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && animStepRef.current === -1) {
          setIsVisible(true)
          // 三步动画序列 (总计 ~0.7s)
          timers.push(setTimeout(() => setAnimStep(0), ANIM_STEP0_DELAY))
          timers.push(setTimeout(() => setAnimStep(1), ANIM_STEP1_DELAY))
          timers.push(setTimeout(() => setAnimStep(2), ANIM_STEP2_DELAY))
        }
      },
      { threshold: 0.15 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => {
      observer.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [])

  const handleStarClick = useCallback((id: number) => {
    setActiveId((prev) => (prev === id ? null : id))
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-36 overflow-hidden">
      {/* 背景星云 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-[600px] h-[600px] rounded-full bg-[#C5A880]/[0.015] blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/5 w-[500px] h-[500px] rounded-full bg-[#A882FF]/[0.012] blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#D4AF37]/[0.008] blur-[200px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 区块标题 */}
        <div className="max-w-[700px] mb-14 sm:mb-20 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(40px)" }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/[0.05] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
            <span className="text-[#C5A880]/70 text-xs tracking-[0.15em] uppercase">
              {locale === "zh" ? "人生路线图" : "Life Roadmap"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-wide mb-5">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C5A880] via-[#E8D5B7] to-[#C5A880]">
              {locale === "zh" ? "你的人生转折点，全部预测出来了" : "Your Life's Turning Points, All Predicted"}
            </span>
          </h2>
          <p className="text-white/30 text-sm sm:text-base leading-relaxed">
            {locale === "zh"
              ? "基于八字、星盘、塔罗、面相、手相五大系统交叉验证，AI 标出你人生中的关键年份和机会窗口"
              : "Cross-validated by Bazi, Astrology, Tarot, Face & Palm Reading — AI marks key years and opportunity windows in your life"}
          </p>
        </div>

        {/* ── 星图 ── */}
        <div className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] transition-all duration-1000 delay-300"
          style={{ opacity: isVisible ? 1 : 0 }}>

          {/* 背景微小星点 */}
          {isVisible && bgStars.map((s) => (
            <div key={s.key} className="absolute rounded-full bg-white"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity,
                animation: `twinkle ${s.twinkleDur}s ease-in-out infinite ${s.twinkleDelay}s`,
              }} />
          ))}

          {/* 星尘粒子 */}
          <DustParticles />

          {/* 命运窗口（机会区间星云） */}
          <OpportunityZones animStep={animStep} locale={locale} />

          {/* 航线（带路径动画） */}
          <RoutePath animStep={animStep} idPrefix={idPrefix} />

          {/* 命运恒星节点 */}
          {STARS.map((star, i) => (
            <DestinyStar
              key={star.id}
              star={star}
              isActive={activeId === star.id}
              onClick={() => handleStarClick(star.id)}
              locale={locale}
              animStep={animStep}
              index={i}
            />
          ))}

          {/* ── 未来仍在书写（航线延伸 + 结尾文字） ── */}
          <div
            className="absolute transition-all duration-1000"
            style={{
              right: "3%",
              top: "15%",
              opacity: animStep >= 1 ? 1 : 0,
              transitionDelay: "1.0s",
            }}
          >
            <div className="text-right">
              <div className="font-serif text-lg sm:text-xl text-white/15 tracking-wider mb-1" style={{ fontStyle: "italic" }}>
                {locale === "zh" ? "未来仍在书写" : "The Journey Continues"}
              </div>
              <div className="text-[10px] text-white/8 tracking-[0.12em] uppercase">
                {locale === "zh" ? "航线向宇宙深处延伸" : "Route extends into the cosmos"}
              </div>
            </div>
          </div>
        </div>

        {/* ── 成长逻辑链 ── */}
        <GrowthLogicChain animStep={animStep} locale={locale} />

        {/* ── 航线参数标签 ── */}
        <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-3 sm:gap-4 transition-all duration-1000 delay-500"
          style={{ opacity: isVisible ? 1 : 0 }}>
          <span className="text-white/20 text-xs mr-1">
            {locale === "zh" ? "航线参数：" : "Route Parameters:"}
          </span>
          {[
            { zh: "八字", en: "Bazi", icon: "☯" },
            { zh: "星盘", en: "Astrology", icon: "✧" },
            { zh: "塔罗牌", en: "Tarot", icon: "◉" },
            { zh: "面相·手相", en: "Face & Palm", icon: "◈" },
          ].map((tag) => (
            <div key={tag.zh} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#030918] border border-white/[0.06]">
              <span className="text-[10px]">{tag.icon}</span>
              <span className="text-white/35 text-[11px]">{locale === "zh" ? tag.zh : tag.en}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.08; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.12; }
        }
        @keyframes starCardIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(12px) scale(0.95); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes goldenSweep {
          0% { opacity: 0; transform: translateX(-100%); }
          30% { opacity: 0.5; }
          70% { opacity: 0.5; }
          100% { opacity: 0; transform: translateX(100%); }
        }
      `}</style>
    </section>
  )
}
