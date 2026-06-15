"use client"

import type { InteractionMirrorProps } from "@/types/report"

export function InteractionMirror({ data }: InteractionMirrorProps) {
  const { behaviorPattern, painReflection } = data

  return (
    <div className="space-y-2.5">
      {/* Section header */}
      <div className="flex items-center gap-2 text-[11px] text-white/40">
        <span className="w-1 h-1 rounded-full bg-indigo-400/60" />
        <span>深度互动镜像模型</span>
      </div>

      {/* Mirror card */}
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {/* Behavior pattern */}
        <div className="px-3.5 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1 h-1 rounded-full bg-indigo-400/50" />
            <span className="text-[11px] text-indigo-400/60 font-medium">隐性行为模式</span>
          </div>
          <p className="text-white/55 text-xs leading-relaxed pl-2.5 border-l border-indigo-500/15">
            {behaviorPattern}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.04]" />

        {/* Pain reflection */}
        <div className="px-3.5 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1 h-1 rounded-full bg-rose-400/50" />
            <span className="text-[11px] text-rose-400/60 font-medium">痛点折射</span>
          </div>
          <p className="text-white/55 text-xs leading-relaxed pl-2.5 border-l border-rose-500/15">
            {painReflection}
          </p>
        </div>
      </div>
    </div>
  )
}
