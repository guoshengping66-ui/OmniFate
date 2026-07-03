"use client"

import type { ReactNode } from "react"
import { ArrowRight, CircleDot, Compass, Sparkles } from "lucide-react"

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
    <main className={`ow-page relative min-h-screen overflow-hidden text-white ${className}`}>
      <div className="ow-mountain-layer" aria-hidden="true" />
      <div className="ow-star-field" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </main>
  )
}

export function EasternSection({ eyebrow, title, description, children, align = "center", className = "" }: SectionProps) {
  const centered = align === "center"
  return (
    <section className={`ow-section ${className}`}>
      <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
        {eyebrow && (
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-gold-soft)] bg-[rgba(200,168,74,0.08)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
            <Sparkles size={13} />
            {eyebrow}
          </p>
        )}
        <h2 className="ow-section-title">{title}</h2>
        {description && <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)] md:text-lg">{description}</p>}
      </div>
      {children && <div className="mt-10">{children}</div>}
    </section>
  )
}

export function EasternCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`ow-card ${className}`}>{children}</div>
}

export function GoldButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="ow-gold-button">
      {children}
      <ArrowRight size={17} />
    </a>
  )
}

export function GhostButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="ow-ghost-button">
      {children}
      <ArrowRight size={16} />
    </a>
  )
}

export function FiveDimensionOrbit({ labels, center }: { labels: string[]; center: string }) {
  return (
    <div className="ow-orbit" aria-label={center}>
      <div className="ow-orbit-ring ow-orbit-ring-a" />
      <div className="ow-orbit-ring ow-orbit-ring-b" />
      <div className="ow-orbit-core">
        <Compass size={28} />
        <span>{center}</span>
      </div>
      {labels.slice(0, 5).map((label, index) => (
        <div key={label} className={`ow-orbit-node ow-orbit-node-${index + 1}`}>
          <CircleDot size={14} />
          <span>{label}</span>
        </div>
      ))}
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
    <EasternCard className="ow-report-preview">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-gold)]">{isZh ? "观我档案预览" : "Guanwo dossier"}</p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">{isZh ? "五维合参报告" : "Five-source report"}</h3>
        </div>
        <div className="rounded-full border border-[var(--color-gold-soft)] px-3 py-1 text-xs text-[var(--color-gold)]">100%</div>
      </div>
      <div className="mt-6 grid gap-3">
        {rows.map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-white/[0.07] bg-[#060E24] p-4">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 h-28 rounded-3xl border border-[var(--color-gold-soft)] bg-[radial-gradient(circle_at_20%_50%,rgba(200,168,74,0.22),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
        <div className="flex h-full items-end gap-2">
          {[32, 54, 43, 72, 58, 86, 64].map((height, index) => (
            <div key={index} className="flex-1 rounded-t-full bg-[linear-gradient(180deg,var(--color-gold),rgba(200,168,74,0.15))]" style={{ height: `${height}%` }} />
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
    <div className="ow-timeline" aria-label={isZh ? "未来十年行动地图" : "Ten-year action map"}>
      {items.map(([year, title, body]) => (
        <div key={year} className="ow-timeline-item">
          <span className="ow-timeline-dot" />
          <p className="text-sm font-semibold text-[var(--color-gold)]">{year}</p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{body}</p>
        </div>
      ))}
    </div>
  )
}
