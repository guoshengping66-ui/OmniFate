"use client"

import { Clock, Rocket } from "lucide-react"
import type { ActionCommandProps } from "@/types/report"

/**
 * 行动策略盒组件
 * 展示分阶段的行动指令
 */
export function ActionCommand({ commands }: ActionCommandProps) {
  const getIcon = (period: string) => {
    if (period.includes("短") || period.toLowerCase().includes("short")) {
      return <Clock size={14} className="text-amber-400/70" />
    }
    return <Rocket size={14} className="text-cyan-400/70" />
  }

  const getBorderColor = (period: string) => {
    if (period.includes("短") || period.toLowerCase().includes("short")) {
      return "border-l-amber-400/40"
    }
    return "border-l-cyan-400/40"
  }

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
        阶段行动策略盒
      </div>

      {/* 命令列表 */}
      <div className="space-y-2">
        {commands.map((cmd, i) => (
          <div
            key={i}
            className={`pl-3 border-l-2 ${getBorderColor(cmd.period)} bg-white/[0.02] rounded-r-lg py-2.5 pr-3`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {getIcon(cmd.period)}
              <span className="text-xs text-white/50 font-medium">{cmd.period}</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed pl-5">
              {cmd.command}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
