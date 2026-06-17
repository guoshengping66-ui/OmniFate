"use client"
import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

/* ═══════════════════════════════════════════════════════════════════
   关键人生节点 — Key Life Nodes (命运恒星卡片)

   与 LifeRouteGeneration 配合：
   - 航线组件展示星图全景 + 成长逻辑链
   - 本组件展示每颗恒星的详细卡片（三维指数 + AI 推演）
   ═══════════════════════════════════════════════════════════════════ */

const NODES = [
  {
    id: 1,
    year: 2025,
    labelZh: "能力跃迁期",
    labelEn: "Capability Leap",
    color: "#C5A880",
    growthZh: 5, growthEn: 5,
    opportunityZh: 4, opportunityEn: 4,
    challengeZh: 3, challengeEn: 3,
    keywords: { zh: ["学习", "创业", "转型", "领导力"], en: ["Learning", "Startup", "Transition", "Leadership"] },
    aiZh: "这一阶段更适合集中资源完成能力升级与职业突破。命盘显示开创力与直觉同步上升，是建立核心竞争力的最佳时机。",
    aiEn: "This phase favors consolidating resources for capability upgrades and career breakthroughs. Initiative and intuition rise in sync — the best time to build core competencies.",
  },
  {
    id: 2,
    year: 2027,
    labelZh: "事业突破阶段",
    labelEn: "Career Breakthrough",
    color: "#A882FF",
    growthZh: 4, growthEn: 4,
    opportunityZh: 5, opportunityEn: 5,
    challengeZh: 4, challengeEn: 4,
    keywords: { zh: ["决断", "破局", "整合", "升级"], en: ["Decisiveness", "Breakthrough", "Integration", "Upgrade"] },
    aiZh: "能力跃迁期积累的势能在此刻释放。事业能量场达到峰值，大胆决策将带来超额回报——但需要承受更高的不确定性。",
    aiEn: "Potential from the capability leap releases now. Career energy peaks — bold decisions yield outsized returns, but higher uncertainty comes with it.",
  },
  {
    id: 3,
    year: 2029,
    labelZh: "财富积累窗口",
    labelEn: "Wealth Accumulation",
    color: "#D4AF37",
    growthZh: 3, growthEn: 3,
    opportunityZh: 5, opportunityEn: 5,
    challengeZh: 2, challengeEn: 2,
    keywords: { zh: ["财富", "复利", "投资", "格局"], en: ["Wealth", "Compound", "Investment", "Vision"] },
    aiZh: "事业突破带来的资源在此阶段开始产生复利效应。财富窗口正式开启，资产配置能力将成为关键——守住比进攻更重要。",
    aiEn: "Resources from the career breakthrough begin compounding. The wealth window opens — preserving assets matters more than aggressive expansion.",
  },
  {
    id: 4,
    year: 2031,
    labelZh: "关系深化阶段",
    labelEn: "Bond Deepening",
    color: "#EC78A0",
    growthZh: 4, growthEn: 4,
    opportunityZh: 3, opportunityEn: 3,
    challengeZh: 5, challengeEn: 5,
    keywords: { zh: ["情感", "家庭", "和谐", "内在"], en: ["Bond", "Family", "Harmony", "Inner"] },
    aiZh: "外在成就趋于稳定后，命盘能量转向内在维度。关系深化是这一阶段的核心课题——家庭和谐与人际信任将决定后续的人生质量。",
    aiEn: "After external achievements stabilize, energy shifts inward. Bond deepening is the core theme — family harmony and trust determine future quality of life.",
  },
  {
    id: 5,
    year: 2033,
    labelZh: "人生转型节点",
    labelEn: "Life Transformation",
    color: "#5B9BD5",
    growthZh: 5, growthEn: 5,
    opportunityZh: 4, opportunityEn: 4,
    challengeZh: 5, challengeEn: 5,
    keywords: { zh: ["蜕变", "重生", "新身份", "命运"], en: ["Transform", "Rebirth", "New Self", "Destiny"] },
    aiZh: "关系深化带来的内在觉醒触发人生重大转型。旧模式瓦解、新身份诞生——这是命运齿轮转动的关键时刻，风险与机遇并存。",
    aiEn: "Inner awakening from bond deepening triggers a major transformation. Old patterns dissolve, new identity emerges — risk and opportunity coexist.",
  },
]

/* ── 恒星指数条 ── */

function StarRating({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-white/30 text-[10px] w-14 sm:w-16 flex-shrink-0">{label}</span>
      <span className="text-[11px] tracking-[1px]" style={{ color }}>
        {"★".repeat(value)}<span style={{ opacity: 0.15 }}>{"★".repeat(5 - value)}</span>
      </span>
    </div>
  )
}

/* ── 命运恒星图标（三层结构，小型版） ── */

function StarIcon({ color, isHovered }: { color: string; isHovered: boolean }) {
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      {/* 外层光晕 */}
      <div
        className="absolute rounded-full transition-all duration-500"
        style={{
          inset: "-20%",
          background: `radial-gradient(circle, ${color}20, transparent 70%)`,
          opacity: isHovered ? 0.8 : 0.4,
          filter: "blur(4px)",
        }}
      />
      {/* 脉冲环 */}
      <div
        className="absolute rounded-full transition-all duration-500"
        style={{
          inset: "15%",
          border: `1px solid ${color}35`,
          opacity: isHovered ? 0.7 : 0.3,
          transform: isHovered ? "scale(1.2)" : "scale(1)",
        }}
      />
      {/* 星核 */}
      <div
        className="absolute rounded-full transition-all duration-500"
        style={{
          inset: "28%",
          background: `radial-gradient(circle at 40% 40%, ${color}, ${color}80 60%, transparent 90%)`,
          boxShadow: `0 0 ${isHovered ? "16px" : "8px"} ${color}40`,
        }}
      />
      {/* 亮点 */}
      <div
        className="absolute rounded-full bg-white"
        style={{ inset: "42%", opacity: isHovered ? 0.9 : 0.5 }}
      />
    </div>
  )
}

/* ── 恒星卡片 ── */

function StarCard({ node, index, isVisible, locale }: {
  node: typeof NODES[0]
  index: number
  isVisible: boolean
  locale: string
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative group"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + index * 0.12}s`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative rounded-3xl p-5 sm:p-6 transition-all duration-500 h-full"
        style={{
          background: isHovered
            ? `linear-gradient(135deg, ${node.color}10, ${node.color}03)`
            : "rgba(255,255,255,0.02)",
          border: isHovered
            ? `1px solid ${node.color}30`
            : "1px solid rgba(255,255,255,0.05)",
          boxShadow: isHovered
            ? `0 0 50px ${node.color}12, 0 20px 40px rgba(0,0,0,0.3)`
            : "none",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        }}
      >
        {/* 年份 + 恒星图标 */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider"
            style={{
              background: `${node.color}15`,
              border: `1px solid ${node.color}25`,
              color: node.color,
            }}
          >
            {node.year}
          </div>
          <StarIcon color={node.color} isHovered={isHovered} />
        </div>

        {/* 标题 */}
        <h3
          className="font-serif font-bold text-base sm:text-lg mb-3 transition-colors duration-500"
          style={{ color: isHovered ? node.color : `${node.color}cc` }}
        >
          {locale === "zh" ? node.labelZh : node.labelEn}
        </h3>

        {/* 三维指数 */}
        <div className="mb-4 p-3 rounded-xl" style={{ background: `${node.color}06`, border: `1px solid ${node.color}10` }}>
          <StarRating
            label={locale === "zh" ? "成长指数" : "Growth"}
            value={locale === "zh" ? node.growthZh : node.growthEn}
            color={node.color}
          />
          <StarRating
            label={locale === "zh" ? "机会指数" : "Opportunity"}
            value={locale === "zh" ? node.opportunityZh : node.opportunityEn}
            color={node.color}
          />
          <StarRating
            label={locale === "zh" ? "挑战指数" : "Challenge"}
            value={locale === "zh" ? node.challengeZh : node.challengeEn}
            color={node.color}
          />
        </div>

        {/* 关键词 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(locale === "zh" ? node.keywords.zh : node.keywords.en).map((kw, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium"
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

        {/* AI 推演 */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: `${node.color}80` }}>
              {locale === "zh" ? "AI 推演" : "AI Projection"}
            </span>
            <div className="flex-1 h-[1px]" style={{ background: `${node.color}15` }} />
          </div>
          <p className="text-white/30 text-[11px] leading-relaxed">
            {locale === "zh" ? node.aiZh : node.aiEn}
          </p>
        </div>

        {/* 底部光线 */}
        <div
          className="absolute bottom-0 left-6 right-6 h-[1px] transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${node.color}30, transparent)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
      </div>
    </div>
  )
}

export default function KeyLifeNodes() {
  const { locale } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-36 overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#C5A880]/[0.015] blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 区块标题 */}
        <div
          className="text-center mb-14 sm:mb-20 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(40px)" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/[0.05] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
            <span className="text-[#C5A880]/70 text-xs tracking-[0.15em] uppercase">
              {locale === "zh" ? "命运恒星" : "Destiny Stars"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-wide mb-5">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C5A880] via-[#E8D5B7] to-[#C5A880]">
              {locale === "zh" ? "航线上的人生关键节点" : "Key Waypoints on Your Route"}
            </span>
          </h2>

          <p className="text-white/30 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {locale === "zh"
              ? "每一个节点都是基于命盘数据推演而来，蕴含三维能量指数与 AI 深度解读"
              : "Each star is projected from chart data — carrying three-dimensional energy indices and deep AI interpretation"}
          </p>
        </div>

        {/* 恒星卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {NODES.map((node, i) => (
            <StarCard
              key={node.id}
              node={node}
              index={i}
              isVisible={isVisible}
              locale={locale}
            />
          ))}
        </div>

        {/* 底部说明 */}
        <div
          className="text-center mt-12 sm:mt-16 transition-all duration-1000 delay-700"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          <p className="text-white/20 text-xs tracking-wider">
            {locale === "zh"
              ? "以上节点基于五维合参推演，实际人生轨迹受个人选择与环境影响"
              : "Waypoints derived from 5D synthesis — actual life trajectory influenced by personal choices and environment"}
          </p>
        </div>
      </div>
    </section>
  )
}
