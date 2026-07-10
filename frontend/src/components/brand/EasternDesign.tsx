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

export function ReportPreviewPanel({ locale: _locale = "en" }: { locale?: "zh" | "en" }) {
  const rows = [
    ["Core pattern", "Calm on the outside, sensitive inside, strongest when turning complexity into order."],
    ["Career direction", "Best in work that needs judgment, expression, and system-building."],
    ["Relationship style", "Attracted by intensity, sustained by clear feedback and stable rhythm."],
    ["Daily action", "Finish one certain task before handling complex decisions."],
  ]

  return (
    <EasternCard className="ow-report-preview">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-gold)]">Personal archive preview</p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">Five-layer report</h3>
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

export function TenYearPath({ locale: _locale = "en" }: { locale?: "zh" | "en" }) {
  const items = [
    ["2026", "Foundation", "Stabilize rhythm and reduce wasted motion."],
    ["2027", "Rebuild", "Reframe judgment, expression, and collaboration."],
    ["2028", "Career window", "Launch clearer projects or public work."],
    ["2030", "Wealth window", "Look for focused breakthroughs after accumulation."],
    ["2032", "Identity shift", "Relationships and work roles ask for a new definition."],
  ]

  return (
    <div className="ow-timeline" aria-label="Ten-year action map">
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
