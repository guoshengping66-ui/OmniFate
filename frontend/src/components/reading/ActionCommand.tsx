"use client"

import type { ActionCommandProps } from "@/types/report"

export function ActionCommand({ commands }: ActionCommandProps) {
  const getPeriodStyle = (period: string) => {
    if (period.includes("短") || period.toLowerCase().includes("short")) {
      return { dot: "bg-amber-400", border: "border-l-amber-400/30", text: "text-amber-400/70" }
    }
    return { dot: "bg-cyan-400", border: "border-l-cyan-400/30", text: "text-cyan-400/70" }
  }

  return (
    <div className="space-y-2.5">
      {/* Section header */}
      <div className="flex items-center gap-2 text-[11px] text-white/40">
        <span className="w-1 h-1 rounded-full bg-cyan-400/60" />
        <span>阶段行动策略盒</span>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {commands.map((cmd, i) => {
          const style = getPeriodStyle(cmd.period)
          return (
            <div
              key={i}
              className={`pl-3 border-l-2 ${style.border} py-2 pr-3`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                <span className={`text-[11px] font-medium ${style.text}`}>{cmd.period}</span>
              </div>
              <p className="text-white/60 text-xs leading-relaxed pl-3.5">
                {cmd.command}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
