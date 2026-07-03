"use client"

import type { ReactNode } from "react"
import { ArrowRight, CircleDot, Compass, Sparkles, Star } from "lucide-react"

type SectionProps = {
  eyebrow?: string
  title: string
  description?: string
  children?: ReactNode
  align?: "left" | "center"
  className?: string
}

export function EasternPageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <main className={`section-cosmos-deep relative min-h-screen overflow-hidden ${className}`}>
      {/* Constellation star grid background */}
      <div className="star-grid" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </main>
  )
}

export function EasternSection({ eyebrow, title, description, children, align = "center", className = "" }: SectionProps) {
  const centered = align === "center"
  return (
    <section className={`section-cosmos ${className}`}>
      <div
        className="mx-auto px-4"
        style={{
          width: "min(var(--content-max-width), calc(100vw - 32px))",
          paddingTop: "var(--section-padding-mobile)",
          paddingBottom: "var(--section-padding-mobile)",
        }}
      >
        <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
          {eyebrow && (
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/15 bg-gold/[0.06] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold">
              <Star size={12} />
              {eyebrow}
            </p>
          )}
          <h2 className="heading-section">{title}</h2>
          {description && <p className="mt-4 text-body">{description}</p>}
        </div>
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  )
}

export function EasternCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card-solid ${className}`}>{children}</div>
}

export function GoldButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="btn-primary">
      {children}
      <ArrowRight size={16} />
    </a>
  )
}

export function GhostButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="btn-secondary">
      {children}
      <ArrowRight size={15} />
    </a>
  )
}

/** Simplified constellation chart — replaces the heavy 7-layer FiveDimensionOrbit */
export function FiveDimensionOrbit({ labels, center }: { labels: string[]; center: string }) {
  return (
    <div className="relative flex min-h-[360px] items-center justify-center rounded-[28px] border border-white/[0.05] bg-cosmos-900 md:min-h-[400px]" aria-label={center}>
      {/* Orbit ring 1 */}
      <div className="absolute inset-[18%] rounded-full border border-stellar-blue/[0.12]" style={{ animation: "astrolabeSpin 50s linear infinite" }} />
      {/* Orbit ring 2 */}
      <div className="absolute inset-[28%] rounded-full border border-stellar-violet/[0.08]" style={{ animation: "astrolabeSpinReverse 65s linear infinite" }} />

      {/* Core */}
      <div className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-gold/20 bg-cosmos-950 text-center shadow-[0_0_40px_rgba(201,168,76,0.1)] md:h-36 md:w-36">
        <Compass size={22} className="text-gold/70 md:size-7" />
        <span className="mt-1 max-w-[76px] text-xs font-bold text-parchment-200 md:max-w-[96px] md:text-sm">{center}</span>
      </div>

      {/* Constellation nodes */}
      {labels.slice(0, 5).map((label, i) => {
        const positions = [
          { top: "8%", left: "46%" },
          { top: "28%", right: "10%" },
          { right: "16%", bottom: "14%" },
          { left: "12%", bottom: "18%" },
          { left: "8%", top: "28%" },
        ]
        return (
          <div
            key={label}
            className="absolute flex items-center gap-2 rounded-full border border-white/[0.06] bg-cosmos-900/90 px-3 py-2 text-xs text-parchment-300 shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
            style={positions[i] as React.CSSProperties}
          >
            <CircleDot size={12} className="text-stellar-blue/60" />
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function ReportPreviewPanel({ locale = "zh" }: { locale?: "zh" | "en" }) {
  const isZh = locale === "zh"
  const rows = isZh
    ? [
        ["性格结构", "外在稳定，内在高敏，适合在复杂问题中建立秩序。"],
        ["事业方向", "适合需要判断力、表达力和系统构建能力的项目。"],
        ["关系模式", "容易被强烈情绪吸引，长期关系更需要稳定反馈。"],
        ["今日行动", "先完成一个确定性任务，再处理复杂决策。"],
      ]
    : [
        ["Inner structure", "Steady outside, sensitive inside, strongest when creating order."],
        ["Career direction", "Best in work that needs judgment, expression, and systems."],
        ["Relationship mode", "Attracted by intensity, sustained by steady feedback."],
        ["Daily action", "Finish one certain task before complex decisions."],
      ]

  return (
    <EasternCard className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-label">{isZh ? "观我档案预览" : "Guanwo dossier"}</p>
          <h3 className="heading-card mt-2">{isZh ? "五维合参报告" : "Five-source report"}</h3>
        </div>
        <div className="rounded-full border border-gold/20 bg-gold/[0.08] px-3 py-1 text-xs text-gold">100%</div>
      </div>
      <div className="mt-6 grid gap-3">
        {rows.map(([title, body]) => (
          <div key={title} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
            <p className="text-sm font-semibold text-parchment-200">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-parchment-400">{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 h-28 rounded-2xl border border-gold/[0.08] bg-cosmos-900 p-4">
        <div className="flex h-full items-end gap-2">
          {[32, 54, 43, 72, 58, 86, 64].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-gradient-to-t from-stellar-blue/30 to-stellar-blue/70"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </EasternCard>
  )
}

export function TenYearPath({ locale = "zh" }: { locale?: "zh" | "en" }) {
  const isZh = locale === "zh"
  const items = isZh
    ? [
        ["2026", "积累期", "稳住节奏，减少无效消耗。"],
        ["2027", "能力重组", "重新整理表达、判断和协作方式。"],
        ["2028", "事业推进窗口", "适合推出更清晰的作品或项目。"],
        ["2030", "财富机会窗口", "在稳定积累后寻找阶段性突破。"],
        ["2032", "身份转型", "关系、事业角色进入新的定义期。"],
      ]
    : [
        ["2026", "Foundation", "Stabilize rhythm and reduce waste."],
        ["2027", "Rebuild", "Reframe judgment, expression, and collaboration."],
        ["2028", "Career window", "Launch clearer projects or public work."],
        ["2030", "Wealth window", "Look for focused breakthroughs after accumulation."],
        ["2032", "Identity shift", "Relationships and work roles ask for a new definition."],
      ]

  return (
    <div className="flex gap-4 overflow-x-auto pb-2" aria-label={isZh ? "未来十年行动地图" : "Ten-year action map"}>
      {items.map(([year, title, body]) => (
        <div key={year} className="min-h-[180px] min-w-[220px] rounded-2xl border border-white/[0.06] bg-parchment-900 p-6">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-stellar-blue/60 shadow-[0_0_12px_rgba(123,158,199,0.5)]" />
          <p className="mt-3 text-sm font-semibold text-gold">{year}</p>
          <h3 className="mt-2 text-lg font-semibold text-parchment-200">{title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-parchment-400">{body}</p>
        </div>
      ))}
    </div>
  )
}
