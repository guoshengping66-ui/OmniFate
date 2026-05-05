"use client"
import { Sparkles, ArrowRight } from "lucide-react"

interface FreeReportBannerProps {
  /** 最低分维度的中文标签 */
  weakestLabel: string
  /** 点击 CTA 回调 */
  onCtaClick?: () => void
}

const DIM_EMOJI: Record<string, string> = {
  wealth: "💰",
  career: "💼",
  relationship: "💕",
  health: "🏥",
  spiritual: "🧘",
}

export function FreeReportBanner({ weakestLabel, onCtaClick }: FreeReportBannerProps) {
  return (
    <div className="card-glass p-5 md:p-6 border-l-2 border-l-gold/30 hover:border-l-gold/50 transition-all duration-500 group">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Sparkles size={20} className="text-gold" />
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-sm md:text-base leading-relaxed mb-1">
            你的<span className="text-gold font-semibold">{weakestLabel}</span>能量待激活
          </p>
          <p className="text-white/30 text-xs leading-relaxed">
            命盘精算 · 为你匹配专属能量守护物
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onCtaClick}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border border-gold/40 text-gold/80 text-sm
                     hover:bg-gold/10 hover:text-gold hover:border-gold/60 transition-all duration-300 group/btn"
        >
          <span className="hidden sm:inline">查看改运好物</span>
          <span className="sm:hidden">去看看</span>
          <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>

      {/* Subtle hint text */}
      <p className="text-[10px] text-white/15 mt-3 ml-14">
        AI 根据你的五维命盘评分，自动匹配最适合你当前能量状态的改运物品
      </p>
    </div>
  )
}
