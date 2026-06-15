"use client"

import { CheckCircle } from "lucide-react"
import type { ResetActionProps } from "@/types/report"

/**
 * 精神减压阀动作组件
 * 展示可执行的减压行动清单
 */
export function ResetAction({ actions }: ResetActionProps) {
  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400/60" />
        精神减压阀动作
      </div>

      {/* 动作列表 */}
      <div className="space-y-2">
        {actions.map((action, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-teal-500/10 hover:border-teal-500/20 transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircle size={16} className="text-teal-400/60" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400/70 font-medium">
                  执行动作 {i + 1}
                </span>
              </div>
              <p className="text-white/65 text-sm leading-relaxed">
                {action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
