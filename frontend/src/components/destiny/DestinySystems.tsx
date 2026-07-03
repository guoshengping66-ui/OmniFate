"use client"
import { useLanguage } from "@/contexts/LanguageContext"

const systems = [
  {
    id: "bazi",
    icon: "☰",
    titleZh: "八字",
    titleEn: "Bazi",
    descZh: "出生时刻隐藏的人生底层代码",
    descEn: "The hidden life code at your birth moment",
    gradient: "from-amber-900/20 to-amber-800/10",
  },
  {
    id: "astrology",
    icon: "✧",
    titleZh: "星盘",
    titleEn: "Astrology",
    descZh: "灵魂倾向与成长路径",
    descEn: "Soul tendencies and growth paths",
    gradient: "from-indigo-900/20 to-purple-800/10",
  },
  {
    id: "face",
    icon: "◉",
    titleZh: "面相",
    titleEn: "Face Reading",
    descZh: "行为模式的外在映射",
    descEn: "External mapping of behavioral patterns",
    gradient: "from-rose-900/20 to-pink-800/10",
  },
  {
    id: "palm",
    icon: "☯",
    titleZh: "手相",
    titleEn: "Palmistry",
    descZh: "潜在天赋与人生节奏",
    descEn: "Latent talents and life rhythm",
    gradient: "from-emerald-900/20 to-teal-800/10",
  },
  {
    id: "tarot",
    icon: "★",
    titleZh: "塔罗",
    titleEn: "Tarot",
    descZh: "阶段性趋势参考",
    descEn: "Periodic trend reference",
    gradient: "from-violet-900/20 to-purple-800/10",
  },
]

export default function DestinySystems() {
  const { locale } = useLanguage()

  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/[0.05] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
            <span className="text-[#C5A880]/70 text-xs tracking-[0.3em] uppercase">
              {locale === "zh" ? "五大系统" : "Five Systems"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-wide mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C5A880] via-[#E8D5B7] to-[#C5A880]">
              {locale === "zh" ? "命运探索体系" : "Destiny Exploration System"}
            </span>
          </h2>

          <p className="text-parchment-400 text-sm sm:text-base max-w-xl mx-auto">
            {locale === "zh"
              ? "五大命理体系交叉验证，从不同维度解读你的人生密码"
              : "Five destiny systems cross-validated to decode your life pattern"}
          </p>
        </div>

        {/* Horizontal scroll cards */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#050816] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#0A1235] to-transparent z-10 pointer-events-none" />

          {/* Scrollable container */}
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide min-w-0"
          >
            {systems.map((system) => (
              <div
                key={system.id}
                className="flex-shrink-0 w-[280px] sm:w-[320px] snap-center group"
              >
                <div className={`relative h-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${system.gradient} border border-[#C5A880]/10 backdrop-blur-sm transition-all duration-500 hover:border-[#C5A880]/30 hover:shadow-[0_0_40px_rgba(197,168,128,0.1)] hover:-translate-y-2`}>
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-[#C5A880]/10 border border-[#C5A880]/20 flex items-center justify-center mb-6 group-hover:bg-[#C5A880]/20 transition-colors duration-500">
                    <span className="text-2xl text-[#C5A880]">{system.icon}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#C5A880] mb-3">
                    {locale === "zh" ? system.titleZh : system.titleEn}
                  </h3>

                  {/* Description */}
                  <p className="text-parchment-400 text-sm leading-relaxed">
                    {locale === "zh" ? system.descZh : system.descEn}
                  </p>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C5A880]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 text-parchment-400 text-xs">
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{locale === "zh" ? "滑动探索更多" : "Swipe to explore"}</span>
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
