"use client"
import { useState, useRef, useEffect, Suspense, lazy } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, User, Users, Plus, Check, X, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { useUserStore } from "@/stores/useUserStore"
import { useLanguage } from "@/contexts/LanguageContext"
import type { BirthProfile } from "@/lib/birth-profile-api"

const DateSelector = lazy(() => import("@/components/reading/DateSelector").then(m => ({ default: m.DateSelector })))
const ShichenSelector = lazy(() => import("@/components/reading/ShichenSelector").then(m => ({ default: m.ShichenSelector })))
const LocationSelector = lazy(() => import("@/components/reading/LocationSelector").then(m => ({ default: m.LocationSelector })))

export function TargetSelector() {
  const { userProfile, activeTestTarget, birthProfiles, setActiveTestTarget, resetToSelf, createBirthProfile } = useUserStore()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
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
        <div className="absolute right-0 top-full mt-1 w-48 bg-ink-light/95  border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
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

          {/* Add new — uses portal to escape parent stacking context */}
          <button
            onClick={() => { setOpen(false); setShowAddDialog(true) }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
          >
            <Plus size={14} />
            <span>{t("target.addFriend")}</span>
          </button>
        </div>
      )}

      {/* Add Friend Dialog — rendered via portal to document.body */}
      {showAddDialog && createPortal(
        <AddFriendDialog
          onClose={() => setShowAddDialog(false)}
          onSave={createBirthProfile}
          t={t}
        />,
        document.body,
      )}
    </div>
  )
}

function AddFriendDialog({
  onClose,
  onSave,
  t,
}: {
  onClose: () => void
  onSave: (data: any) => Promise<BirthProfile>
  t: (key: string) => string
}) {
  const [nickname, setNickname] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "other">("female")
  const [birthYear, setBirthYear] = useState(0)
  const [birthMonth, setBirthMonth] = useState(0)
  const [birthDay, setBirthDay] = useState(0)
  const [birthHour, setBirthHour] = useState(0)
  const [birthMinute, setBirthMinute] = useState(0)
  const [birthCity, setBirthCity] = useState("")
  const [saving, setSaving] = useState(false)

  // Lock body scroll while dialog is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [])

  const handleSave = async () => {
    if (!nickname.trim()) {
      toast.error(t("target.nickname") + " required")
      return
    }
    if (!birthYear || !birthMonth || !birthDay) {
      toast.error(t("new.dateRequired"))
      return
    }
    setSaving(true)
    try {
      await onSave({
        nickname: nickname.trim(),
        gender,
        birth_year: birthYear,
        birth_month: birthMonth,
        birth_day: birthDay,
        birth_hour: birthHour,
        birth_minute: birthMinute,
        birth_city: birthCity,
      })
      toast.success(t("target.saved"))
      onClose()
    } catch {
      toast.error(t("target.saveFail"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80  p-4"
      style={{ zIndex: 2147483647 }}>
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-[#1a1430] border border-white/10 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[#1a1430] z-10">
          <div>
            <h3 className="font-serif text-lg text-gold">{t("target.addFriendTitle")}</h3>
            <p className="text-white/40 text-xs mt-0.5">{t("target.addFriendDesc")}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-5">
          {/* Nickname */}
          <div>
            <label className="label">{t("target.nickname")}</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t("target.nicknamePlaceholder")}
              className="input-field"
              autoFocus
            />
          </div>

          {/* Gender */}
          <div>
            <label className="label">{t("new.genderLabel")}</label>
            <div className="flex gap-3">
              {([["female", t("new.genderFemale")], ["male", t("new.genderMale")], ["other", t("new.genderOther")]] as [string, string][]).map(([v, l]) => (
                <label key={v} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    value={v}
                    checked={gender === v}
                    onChange={() => setGender(v as "male" | "female" | "other")}
                    className="sr-only peer"
                  />
                  <div className="text-center py-2.5 rounded-xl border border-white/20 text-white/60 peer-checked:border-gold peer-checked:text-gold peer-checked:bg-gold/10 hover:border-white/40 transition-all text-sm">{l}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Birth Date */}
          <div>
            <label className="label">{t("new.partnerBirthDate")}</label>
            <Suspense fallback={<div className="h-10 bg-white/5 rounded animate-pulse" />}>
              <DateSelector
                year={birthYear}
                month={birthMonth}
                day={birthDay}
                onYearChange={setBirthYear}
                onMonthChange={setBirthMonth}
                onDayChange={setBirthDay}
              />
            </Suspense>
          </div>

          {/* Birth Hour */}
          <div>
            <label className="label">{t("new.partnerBirthHour")}</label>
            <Suspense fallback={<div className="h-10 bg-white/5 rounded animate-pulse" />}>
              <ShichenSelector
                value={birthHour}
                onChange={(h) => setBirthHour(h)}
              />
            </Suspense>
          </div>

          {/* Birth City */}
          <div>
            <label className="label">{t("new.partnerBirthCity")}</label>
            <Suspense fallback={<div className="h-10 bg-white/5 rounded animate-pulse" />}>
              <LocationSelector
                value={birthCity}
                onChange={setBirthCity}
                placeholder={t("new.partnerCityPlaceholder")}
              />
            </Suspense>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-white/10 sticky bottom-0 bg-[#1a1430]">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 hover:border-white/40 transition-all text-sm"
          >
            {t("target.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl btn-gold text-sm flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> {t("target.saving")}</>
            ) : (
              t("target.save")
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
