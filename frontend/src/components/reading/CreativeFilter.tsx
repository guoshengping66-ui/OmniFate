"use client"

import type { CreativeFilterProps } from "@/types/report"

/**
 * 创造力审查漏斗组件
 * 展示创造力被抑制的机制
 */
export function CreativeFilter({ data }: CreativeFilterProps) {
  const { mechanism } = data

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400/60" />
        创造力审查阻尼
      </div>

      {/* 漏斗可视化 */}
      <div className="relative overflow-hidden rounded-xl border border-violet-500/10">
        {/* 背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/[0.04] to-transparent" />

        <div className="relative p-4">
          {/* 漏斗图形 */}
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-20">
              {/* 漏斗顶部（宽） */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-violet-500/30 via-purple-500/30 to-violet-500/30 rounded-t-lg" />
              {/* 漏斗中部 */}
              <div className="absolute top-3 left-2 right-2 h-3 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-violet-500/20" />
              {/* 漏斗底部（窄） */}
              <div className="absolute top-6 left-4 right-4 h-3 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/10" />
              {/* 漏斗出口 */}
              <div className="absolute top-9 left-1/2 -translate-x-1/2 w-8 h-3 bg-gradient-to-r from-violet-500/5 to-violet-500/5 rounded-b-lg" />

              {/* 标签 */}
              <div className="absolute -top-5 left-0 text-[10px] text-violet-400/50">奇思妙想</div>
              <div className="absolute top-11 left-1/2 -translate-x-1/2 text-[10px] text-white/30">▼</div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-rose-400/50">胎死腹中</div>
            </div>
          </div>

          {/* 机制描述 */}
          <div className="mt-8 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🔍</span>
              <span className="text-xs text-violet-400/70 font-medium">审查机制</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              "{mechanism}"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
