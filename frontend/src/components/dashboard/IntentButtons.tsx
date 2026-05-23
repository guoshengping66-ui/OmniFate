"use client"
import { useRouter } from "next/navigation"
import { useWizardStore } from "@/stores/useWizardStore"
import { useLanguage } from "@/contexts/LanguageContext"
import { useState } from "react"

interface Props {
  onGework?: () => void
}

/* ── Futuristic geometric SVG icons ──────────────────────────────────── */

function IconDeepResonance({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      {/* Outer gyroscope ring */}
      <ellipse cx="24" cy="24" rx="22" ry="8" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <ellipse cx="24" cy="24" rx="22" ry="8" stroke="currentColor" strokeWidth="1.2" opacity="0.4"
        transform="rotate(60 24 24)" />
      <ellipse cx="24" cy="24" rx="22" ry="8" stroke="currentColor" strokeWidth="1.2" opacity="0.4"
        transform="rotate(-60 24 24)" />
      {/* Core nucleus */}
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="2.5" fill="currentColor" opacity="0.6" />
      {/* Orbital dots */}
      <circle cx="24" cy="16" r="1.5" fill="currentColor" opacity="0.8" />
      <circle cx="31" cy="28" r="1.5" fill="currentColor" opacity="0.8" />
      <circle cx="17" cy="28" r="1.5" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

function IconInstantInsight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      {/* Radar sweep arcs */}
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <circle cx="24" cy="24" r="13" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      {/* Sweep line */}
      <line x1="24" y1="24" x2="24" y2="6" stroke="currentColor" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      {/* Center pulse */}
      <circle cx="24" cy="24" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      {/* Data blips */}
      <circle cx="30" cy="14" r="1.2" fill="currentColor" opacity="0.5" />
      <circle cx="16" cy="20" r="1.2" fill="currentColor" opacity="0.5" />
      <circle cx="28" cy="30" r="1.2" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function IconFlowAnalytics({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      {/* Neural node network */}
      <circle cx="24" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="28" r="3" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="36" cy="28" r="3" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="24" cy="38" r="3" stroke="currentColor" strokeWidth="1.2" />
      {/* Connection lines */}
      <line x1="24" y1="15" x2="12" y2="25" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="24" y1="15" x2="36" y2="25" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="12" y1="31" x2="24" y2="35" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="36" y1="31" x2="24" y2="35" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="15" y1="28" x2="33" y2="28" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      {/* Center hub */}
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="1.5" fill="currentColor" opacity="0.6" />
      {/* Hub connections */}
      <line x1="24" y1="20" x2="24" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="20" y1="26" x2="15" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="28" y1="26" x2="33" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="24" y1="28" x2="24" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

function IconCollectiveVibe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      {/* Quantum knot / interlocking rings */}
      <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <circle cx="28" cy="20" r="10" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <circle cx="24" cy="28" r="10" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      {/* Center overlap glow */}
      <circle cx="24" cy="22" r="3" fill="currentColor" opacity="0.3" />
      {/* Node points */}
      <circle cx="24" cy="12" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="14" cy="26" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="34" cy="26" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

/* ── Animated scan line for hero card ────────────────────────────────── */

function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
        style={{
          animation: "scan-line 4s ease-in-out infinite",
          top: "0%",
        }}
      />
    </div>
  )
}

/* ── Pulse ring animation for hero ───────────────────────────────────── */

function PulseRing() {
  return (
    <div className="absolute -inset-1 rounded-2xl pointer-events-none">
      <div className="absolute inset-0 rounded-2xl border border-gold/20 animate-ping opacity-20" />
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────────────── */

export function IntentButtons({ onGework }: Props) {
  const router = useRouter()
  const { reset: resetWizard } = useWizardStore()
  const { t } = useLanguage()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const handleQuick = () => { resetWizard(); router.push("/reading/new?intent=quick") }
  const handleFull = () => { resetWizard(); router.push("/reading/new?intent=full") }
  const handleFriend = () => { resetWizard(); router.push("/reading/new?intent=friend") }

  return (
    <div className="space-y-4">
      {/* ═══ HERO CARD — DEEP RESONANCE ═══ */}
      <button
        onClick={handleFull}
        onMouseEnter={() => setHoveredCard("full")}
        onMouseLeave={() => setHoveredCard(null)}
        className="relative w-full text-left group rounded-2xl overflow-hidden transition-all duration-500"
      >
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f2e]/80 via-[#0D0B18]/90 to-[#0a0618]/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-purple-500/5 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Animated border glow */}
        <div className={`absolute -inset-px rounded-2xl transition-all duration-700 ${
          hoveredCard === "full"
            ? "bg-gradient-to-br from-gold/40 via-purple-400/30 to-gold/40 shadow-[0_0_40px_rgba(201,168,76,0.15)]"
            : "bg-gradient-to-br from-gold/15 via-purple-500/10 to-gold/15"
        }`} />

        {/* Inner content area */}
        <div className="relative m-px rounded-2xl bg-[#0D0B18]/90 backdrop-blur-xl p-6 md:p-8">
          <ScanLine />
          {hoveredCard === "full" && <PulseRing />}

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
            {/* Icon — large */}
            <div className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              hoveredCard === "full"
                ? "bg-gold/15 shadow-[0_0_30px_rgba(201,168,76,0.2)]"
                : "bg-gold/8"
            }`}>
              <IconDeepResonance className={`w-10 h-10 md:w-12 md:h-12 text-gold transition-all duration-500 ${
                hoveredCard === "full" ? "scale-110" : ""
              }`} />
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold/40 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gold/40 rounded-br-2xl" />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-gold/50 tracking-[0.2em] uppercase">PRIMARY</span>
                <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gold mb-1 tracking-wider" style={{ textShadow: "0 0 20px rgba(201,168,76,0.4)" }}>
                {t("dash.intent.full")}
              </h3>
              <p className="text-xs md:text-sm text-gold/60 font-medium tracking-[0.15em] uppercase">
                {t("dash.intent.fullEn")}
              </p>
              <p className="text-white/50 text-xs md:text-sm mt-2 leading-relaxed max-w-md">
                {t("dash.intent.fullDesc")}
              </p>
            </div>

            {/* Arrow / CTA */}
            <div className={`hidden md:flex items-center gap-2 text-gold/40 group-hover:text-gold transition-all duration-300 ${
              hoveredCard === "full" ? "translate-x-1" : ""
            }`}>
              <span className="text-[10px] font-mono tracking-widest uppercase">{t("dash.intent.activate")}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Bottom data strip */}
          <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex items-center gap-4 text-[10px] text-white/20 font-mono">
            <span>MODULE::DEEP_RESONANCE</span>
            <span className="text-gold/30">|</span>
            <span>MULTI_MODAL::ACTIVE</span>
            <span className="text-gold/30">|</span>
            <span className="text-gold/30">BIOMETRIC+ASTROLOGY</span>
          </div>
        </div>
      </button>

      {/* ═══ SECONDARY ROW — 3 COLUMNS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* INSTANT INSIGHT */}
        <button
          onClick={handleQuick}
          onMouseEnter={() => setHoveredCard("quick")}
          onMouseLeave={() => setHoveredCard(null)}
          className="relative text-left group rounded-xl overflow-hidden transition-all duration-500"
        >
          <div className="absolute inset-0 bg-[#0D0B18]/80" />
          <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${
            hoveredCard === "quick"
              ? "bg-gradient-to-br from-cyan-400/30 to-blue-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
              : "bg-gradient-to-br from-white/8 to-white/5"
          }`} />
          <div className="relative m-px rounded-xl bg-[#0D0B18]/90 backdrop-blur-xl p-4 md:p-5 h-full flex flex-col">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-500 ${
              hoveredCard === "quick" ? "bg-cyan-500/15" : "bg-white/5"
            }`}>
              <IconInstantInsight className={`w-6 h-6 transition-all duration-500 ${
                hoveredCard === "quick" ? "text-cyan-400 scale-110" : "text-white/40"
              }`} />
            </div>
            <div className="text-[9px] font-mono text-cyan-400/40 tracking-[0.15em] uppercase mb-1">QUICK</div>
            <h4 className={`text-base md:text-lg font-bold mb-1 transition-colors duration-300 tracking-wide ${
              hoveredCard === "quick" ? "text-cyan-300" : "text-white/80"
            }`} style={{ textShadow: hoveredCard === "quick" ? "0 0 15px rgba(34,211,238,0.3)" : "none" }}>
              {t("dash.intent.quick")}
            </h4>
            <p className="text-[10px] text-cyan-400/50 font-medium tracking-[0.15em] uppercase mb-1.5">{t("dash.intent.quickEn")}</p>
            <p className="text-white/40 text-[11px] md:text-xs leading-relaxed flex-1">{t("dash.intent.quickDesc")}</p>
            <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-mono tracking-wider transition-all duration-300 ${
              hoveredCard === "quick" ? "text-cyan-400" : "text-cyan-400/40"
            }`}>
              <span>{t("dash.intent.activate")}</span>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>

        {/* FLOW ANALYTICS */}
        <button
          onClick={onGework}
          onMouseEnter={() => setHoveredCard("event")}
          onMouseLeave={() => setHoveredCard(null)}
          className="relative text-left group rounded-xl overflow-hidden transition-all duration-500"
        >
          <div className="absolute inset-0 bg-[#0D0B18]/80" />
          <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${
            hoveredCard === "event"
              ? "bg-gradient-to-br from-purple-400/30 to-violet-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
              : "bg-gradient-to-br from-white/8 to-white/5"
          }`} />
          <div className="relative m-px rounded-xl bg-[#0D0B18]/90 backdrop-blur-xl p-4 md:p-5 h-full flex flex-col">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-500 ${
              hoveredCard === "event" ? "bg-purple-500/15" : "bg-white/5"
            }`}>
              <IconFlowAnalytics className={`w-6 h-6 transition-all duration-500 ${
                hoveredCard === "event" ? "text-purple-400 scale-110" : "text-white/40"
              }`} />
            </div>
            <div className="text-[9px] font-mono text-purple-400/40 tracking-[0.15em] uppercase mb-1">ANALYTICS</div>
            <h4 className={`text-base md:text-lg font-bold mb-1 transition-colors duration-300 tracking-wide ${
              hoveredCard === "event" ? "text-purple-300" : "text-white/80"
            }`} style={{ textShadow: hoveredCard === "event" ? "0 0 15px rgba(168,85,247,0.3)" : "none" }}>
              {t("dash.intent.event")}
            </h4>
            <p className="text-[10px] text-purple-400/50 font-medium tracking-[0.15em] uppercase mb-1.5">{t("dash.intent.eventEn")}</p>
            <p className="text-white/40 text-[11px] md:text-xs leading-relaxed flex-1">{t("dash.intent.eventDesc")}</p>
            <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-mono tracking-wider transition-all duration-300 ${
              hoveredCard === "event" ? "text-purple-400" : "text-purple-400/40"
            }`}>
              <span>{t("dash.intent.activate")}</span>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>

        {/* COLLECTIVE VIBE */}
        <button
          onClick={handleFriend}
          onMouseEnter={() => setHoveredCard("friend")}
          onMouseLeave={() => setHoveredCard(null)}
          className="relative text-left group rounded-xl overflow-hidden transition-all duration-500"
        >
          <div className="absolute inset-0 bg-[#0D0B18]/80" />
          <div className={`absolute -inset-px rounded-xl transition-all duration-500 ${
            hoveredCard === "friend"
              ? "bg-gradient-to-br from-amber-400/30 to-orange-500/20 shadow-[0_0_20px_rgba(251,191,36,0.1)]"
              : "bg-gradient-to-br from-white/8 to-white/5"
          }`} />
          <div className="relative m-px rounded-xl bg-[#0D0B18]/90 backdrop-blur-xl p-4 md:p-5 h-full flex flex-col">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-500 ${
              hoveredCard === "friend" ? "bg-amber-500/15" : "bg-white/5"
            }`}>
              <IconCollectiveVibe className={`w-6 h-6 transition-all duration-500 ${
                hoveredCard === "friend" ? "text-amber-400 scale-110" : "text-white/40"
              }`} />
            </div>
            <div className="text-[9px] font-mono text-amber-400/40 tracking-[0.15em] uppercase mb-1">COLLECTIVE</div>
            <h4 className={`text-base md:text-lg font-bold mb-1 transition-colors duration-300 tracking-wide ${
              hoveredCard === "friend" ? "text-amber-300" : "text-white/80"
            }`} style={{ textShadow: hoveredCard === "friend" ? "0 0 15px rgba(251,191,36,0.3)" : "none" }}>
              {t("dash.intent.friend")}
            </h4>
            <p className="text-[10px] text-amber-400/50 font-medium tracking-[0.15em] uppercase mb-1.5">{t("dash.intent.friendEn")}</p>
            <p className="text-white/40 text-[11px] md:text-xs leading-relaxed flex-1">{t("dash.intent.friendDesc")}</p>
            <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-mono tracking-wider transition-all duration-300 ${
              hoveredCard === "friend" ? "text-amber-400" : "text-amber-400/40"
            }`}>
              <span>{t("dash.intent.activate")}</span>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
