"use client"
import { Loader2 } from "lucide-react"

interface Props {
  phase: "loading" | "error" | "timeout"
}

const AGENTS = [
  { emoji: "☯", name: "周易八字", color: "border-l-[#2D6A4F]", glow: "rgba(45,106,79,0.15)", desc: "推算四柱八字…" },
  { emoji: "✦", name: "西方星盘", color: "border-l-[#C1121F]", glow: "rgba(193,18,31,0.15)", desc: "解析行星相位…" },
  { emoji: "🃏", name: "塔罗占卜", color: "border-l-[#C9A84C]", glow: "rgba(201,168,76,0.15)", desc: "抽取命运牌阵…" },
  { emoji: "👁", name: "AI 面相", color: "border-l-[#E8D5B7]", glow: "rgba(232,213,183,0.15)", desc: "识别面部宫位…" },
  { emoji: "🤚", name: "手相解读", color: "border-l-[#2980B9]", glow: "rgba(41,128,185,0.15)", desc: "分析掌纹走势…" },
]

export function ReadingSkeleton({ phase }: Props) {
  if (phase === "error") {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex flex-col items-center justify-center">
        <div className="text-6xl mb-6">😔</div>
        <h2 className="font-serif text-2xl text-white/80 mb-2">报告加载失败</h2>
        <p className="text-white/40 text-sm mb-6">
          可能是报告尚未生成完成，或会话已过期
        </p>
        <a href="/reading/new" className="btn-gold inline-block">
          重新推命
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Title shimmer */}
        <div className="text-center mb-12">
          <div className="h-6 w-48 bg-white/10 rounded-full mx-auto mb-4 shimmer-skeleton" />
          <div className="h-8 w-64 bg-white/10 rounded-lg mx-auto shimmer-skeleton" style={{ animationDelay: "0.2s" }} />
        </div>

        {/* 5 agent cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {AGENTS.map((agent, i) => (
            <div
              key={agent.name}
 className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 animate-pulse-slow"
              style={{
                borderLeftColor: agent.color.replace("border-l-", ""),
                borderLeftWidth: "3px",
                animationDelay: `${i * 0.3}s`,
                boxShadow: `0 0 30px ${agent.glow}`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{agent.emoji}</span>
                <div className="flex-1">
                  <div className="h-4 w-20 bg-white/10 rounded shimmer-skeleton mb-2" />
                  <div className="h-3 w-28 bg-white/5 rounded shimmer-skeleton" />
                </div>
                <Loader2 size={18} className="text-gold animate-spin" />
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full progress-animate"
                  style={{
                    background: `linear-gradient(90deg, ${agent.glow.replace("0.15", "0.6")}, ${agent.color.replace("border-l-", "")})`,
                    width: `${40 + Math.random() * 50}%`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Master synthesis */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-gold/60 text-sm mb-2">
            <Loader2 size={14} className="animate-spin" />
            <span>Master Agent 跨维度融合中…</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full progress-animate"
              style={{
                background: "linear-gradient(90deg, #C9A84C44, #C9A84C)",
                animationDuration: "3s",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
