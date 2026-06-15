"use client"

import type { InteractionMirrorProps } from "@/types/report"

/**
 * 行为镜像模型组件
 * 展示隐性行为模式和痛点折射
 */
export function InteractionMirror({ data }: InteractionMirrorProps) {
  const { behaviorPattern, painReflection } = data

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
        深度互动镜像模型
      </div>

      {/* 镜像卡片 */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06]">
        {/* 背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-purple-500/[0.04]" />

        <div className="relative p-4 space-y-4">
          {/* 行为模式 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <span className="text-xs">🪞</span>
              </div>
              <span className="text-xs text-indigo-400/70 font-medium">隐性行为模式</span>
            </div>
            <p className="text-white/65 text-sm leading-relaxed pl-8">
              "{behaviorPattern}"
            </p>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-white/[0.04]" />

          {/* 痛点折射 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">
                <span className="text-xs">💔</span>
              </div>
              <span className="text-xs text-rose-400/70 font-medium">痛点折射</span>
            </div>
            <p className="text-white/65 text-sm leading-relaxed pl-8">
              "{painReflection}"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
