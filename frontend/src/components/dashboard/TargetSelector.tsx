"use client"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, User, Users, Plus, Check } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { useLanguage } from "@/contexts/LanguageContext"
import type { BirthProfile } from "@/lib/birth-profile-api"

export function TargetSelector() {
  const { userProfile, activeTestTarget, birthProfiles, setActiveTestTarget, resetToSelf } = useUserStore()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  if (!userProfile) return null

  const isSelf = activeTestTarget?.id === userProfile.id
  const targetLabel = activeTestTarget?.nickname || t("target.self")

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-white/50 hover:border-gold/30 hover:text-gold transition-all"
      >
        {isSelf ? <User size={12} /> : <Users size={12} />}
        <span className="max-w-[80px] truncate">{targetLabel}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-ink-light/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Self */}
          <button
            onClick={() => { resetToSelf(); setOpen(false) }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
          >
            <User size={14} className={isSelf ? "text-gold" : "text-white/30"} />
            <span className={isSelf ? "text-gold" : "text-white/60"}>{t("target.selfLabel")}{userProfile.nickname}</span>
            {isSelf && <Check size={12} className="text-gold ml-auto" />}
          </button>

          {/* Other profiles */}
          {birthProfiles.filter(p => p.id !== userProfile.id).map(p => (
            <button
              key={p.id}
              onClick={() => { setActiveTestTarget(p); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
            >
              <Users size={14} className={activeTestTarget?.id === p.id ? "text-gold" : "text-white/30"} />
              <span className={activeTestTarget?.id === p.id ? "text-gold" : "text-white/60"}>{p.nickname}</span>
              {activeTestTarget?.id === p.id && <Check size={12} className="text-gold ml-auto" />}
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Add new */}
          <button
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
          >
            <Plus size={14} />
            <span>{t("target.addFriend")}</span>
          </button>
        </div>
      )}
    </div>
  )
}
