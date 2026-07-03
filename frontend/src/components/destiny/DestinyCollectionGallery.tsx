"use client"
import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

const ARTIFACTS = [
  {
    id: "chart",
    icon: "☯",
    color: "#C5A880",
    titleZh: "命盘报告",
    titleEn: "Destiny Chart",
    descZh: "五维合参 × AI 深度解读，生成你的专属人生蓝图",
    descEn: "5D synthesis × AI deep reading, generating your exclusive life blueprint",
    tag: "CORE",
  },
  {
    id: "route",
    icon: "✧",
    color: "#A882FF",
    titleZh: "人生航线",
    titleEn: "Life Route",
    descZh: "AI 推演的人生关键转折点与航行路线",
    descEn: "AI-projected key turning points and navigation route",
    tag: "AI",
  },
  {
    id: "am16",
    icon: "★",
    color: "#D4AF37",
    titleZh: "AM16 行为人格",
    titleEn: "AM16 Personality",
    descZh: "16 型行为分类系统，揭示你的行为底层逻辑",
    descEn: "16-type behavioral classification revealing your behavioral logic",
    tag: "UNIQUE",
  },
]

const TESTIMONIALS = [
  {
    name: "林小姐",
    nameEn: "Ms. Lin",
    source: "小红书",
    text: "AI 解读太准了！八字和星盘的交叉验证让我第一次真正理解了自己的性格模式。",
    textEn: "The AI reading was spot-on! Cross-validation of Bazi and Astrology helped me truly understand my behavioral patterns for the first time.",
    score: "98",
  },
  {
    name: "陈先生",
    nameEn: "Mr. Chen",
    source: "知乎",
    text: "人生航线的推演让我提前布局了职业转型，结果比预期提前了一年。",
    textEn: "The life route projection helped me plan my career transition ahead of time — it happened a year earlier than expected.",
    score: "96",
  },
  {
    name: "王女士",
    nameEn: "Ms. Wang",
    source: "微信",
    text: "五维合参的维度分析非常全面，比我之前看过的所有命理分析都要深入。",
    textEn: "The 5D synthesis analysis is incredibly comprehensive — deeper than any destiny reading I've had before.",
    score: "97",
  },
]

function ArtifactCard({ artifact, index, isVisible, locale }: {
  artifact: typeof ARTIFACTS[0]
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
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + index * 0.12}s`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative rounded-3xl p-6 sm:p-8 transition-all duration-500 h-full"
        style={{
          background: isHovered
            ? `linear-gradient(135deg, ${artifact.color}10, ${artifact.color}04)`
            : "rgba(255,255,255,0.02)",
          border: isHovered
            ? `1px solid ${artifact.color}30`
            : "1px solid rgba(255,255,255,0.05)",
          boxShadow: isHovered ? `0 0 40px ${artifact.color}10` : "none",
          transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        }}
      >
        {/* Tag */}
        <div className="flex items-center justify-between mb-5">
          <div
            className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase"
            style={{
              background: `${artifact.color}12`,
              border: `1px solid ${artifact.color}20`,
              color: `${artifact.color}aa`,
            }}
          >
            {artifact.tag}
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500"
            style={{
              background: `${artifact.color}10`,
              border: `1px solid ${artifact.color}20`,
              transform: isHovered ? "scale(1.1) rotate(-5deg)" : "scale(1)",
            }}
          >
            <span className="text-2xl" style={{ color: artifact.color }}>{artifact.icon}</span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="font-serif font-bold text-lg sm:text-xl mb-3 transition-colors duration-500"
          style={{ color: isHovered ? artifact.color : `${artifact.color}cc` }}
        >
          {locale === "zh" ? artifact.titleZh : artifact.titleEn}
        </h3>

        {/* Description */}
        <p className="text-parchment-400 text-xs sm:text-sm leading-relaxed">
          {locale === "zh" ? artifact.descZh : artifact.descEn}
        </p>

        {/* Bottom accent */}
        <div
          className="absolute bottom-0 left-6 right-6 h-[1px] transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${artifact.color}25, transparent)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
      </div>
    </div>
  )
}

function TestimonialCard({ item, index, isVisible }: {
  item: typeof TESTIMONIALS[0]
  index: number
  isVisible: boolean
}) {
  return (
    <div
      className="rounded-3xl p-5 sm:p-6 transition-all duration-500 group hover:border-[#C5A880]/20"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.4 + index * 0.1}s`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, rgba(197,168,128,0.15), rgba(197,168,128,0.05))",
              border: "1px solid rgba(197,168,128,0.2)",
              color: "#C5A880",
            }}
          >
            {item.name.charAt(0)}
          </div>
          <div>
            <div className="text-parchment-300 text-xs font-medium">{item.name}</div>
            <div className="text-parchment-400 text-xs">{item.source}</div>
          </div>
        </div>
        <div
          className="px-2 py-0.5 rounded-full text-xs font-bold"
          style={{
            background: "linear-gradient(135deg, rgba(197,168,128,0.12), rgba(197,168,128,0.04))",
            border: "1px solid rgba(197,168,128,0.15)",
            color: "#C5A880",
          }}
        >
          {item.score}
        </div>
      </div>

      {/* Text */}
      <p className="text-parchment-400 text-xs leading-relaxed">
        &ldquo;{item.text}&rdquo;
      </p>
    </div>
  )
}

export default function DestinyCollectionGallery() {
  const { locale, localeHref } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-36 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[#C5A880]/[0.015] blur-[180px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          className="text-center mb-14 sm:mb-20 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(40px)" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/[0.05] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
            <span className="text-[#C5A880]/70 text-xs tracking-[0.15em] uppercase">
              {locale === "zh" ? "命运藏品阁" : "Destiny Gallery"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-wide mb-5">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C5A880] via-[#E8D5B7] to-[#C5A880]">
              {locale === "zh" ? "命运藏品阁" : "Destiny Collection Gallery"}
            </span>
          </h2>

          <p className="text-parchment-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {locale === "zh"
              ? "每一份报告都是一件藏品，记录着你独一无二的命运密码"
              : "Every report is an artifact, encoding your unique destiny cipher"}
          </p>
        </div>

        {/* Artifacts grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mb-20 sm:mb-28">
          {ARTIFACTS.map((artifact, i) => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              index={i}
              isVisible={isVisible}
              locale={locale}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-16 sm:mb-20">
          <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#C5A880]/15" />
          <span className="text-[#C5A880]/20 text-xs tracking-[0.15em] uppercase">
            {locale === "zh" ? "真实反馈" : "Reviews"}
          </span>
          <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#C5A880]/15" />
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-16 sm:mb-20">
          {TESTIMONIALS.map((item, i) => (
            <TestimonialCard
              key={i}
              item={item}
              index={i}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Trust indicators */}
        <div
          className="flex items-center justify-center gap-6 text-parchment-400 text-xs tracking-widest transition-all duration-1000 delay-700"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          <span>128,000+</span>
          <span className="w-px h-3 bg-white/10" />
          <span>4.9 ★</span>
          <span className="w-px h-3 bg-white/10" />
          <span>{locale === "zh" ? "已服务用户" : "Users Served"}</span>
        </div>

        {/* Final CTA */}
        <div
          className="text-center mt-12 sm:mt-16 transition-all duration-1000 delay-500"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          <Link
            href={localeHref("/reading/new")}
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-medium text-sm tracking-wider transition-all duration-500"
            style={{
              background: "linear-gradient(135deg, rgba(197,168,128,0.12), rgba(197,168,128,0.04))",
              border: "1px solid rgba(197,168,128,0.25)",
              color: "#C5A880",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(197,168,128,0.2), rgba(197,168,128,0.08))"
              e.currentTarget.style.borderColor = "rgba(197,168,128,0.45)"
              e.currentTarget.style.boxShadow = "0 0 40px rgba(197,168,128,0.12)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(197,168,128,0.12), rgba(197,168,128,0.04))"
              e.currentTarget.style.borderColor = "rgba(197,168,128,0.25)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            {locale === "zh" ? "生成你的藏品" : "Generate Your Artifact"}
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
