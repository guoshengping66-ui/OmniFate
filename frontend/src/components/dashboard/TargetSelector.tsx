"use client"

import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Check, ChevronDown, Loader2, Plus, User, Users, X } from "lucide-react"
import toast from "react-hot-toast"
import { useUserStore } from "@/stores/useUserStore"
import type { BirthProfile } from "@/lib/birth-profile-api"

const DateSelector = lazy(() => import("@/components/reading/DateSelector").then((m) => ({ default: m.DateSelector })))
const ShichenSelector = lazy(() => import("@/components/reading/ShichenSelector").then((m) => ({ default: m.ShichenSelector })))
const LocationSelector = lazy(() => import("@/components/reading/LocationSelector").then((m) => ({ default: m.LocationSelector })))

function displayName(profile?: BirthProfile | null) {
  if (!profile?.nickname || profile.nickname === "Self" || profile.nickname === "Myself" || /[\u4e00-\u9fff]/.test(profile.nickname)) {
    return "My Profile"
  }
  return profile.nickname
}

export function TargetSelector() {
  const { userProfile, activeTestTarget, birthProfiles, setActiveTestTarget, resetToSelf, createBirthProfile } = useUserStore()
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/50 transition-all hover:border-gold/30 hover:text-gold"
      >
        {isSelf ? <User size={12} /> : <Users size={12} />}
        <span className="max-w-[96px] truncate">{displayName(activeTestTarget || userProfile)}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[2000] mt-2 w-64 rounded-2xl border border-gold/15 bg-[#07110F]/95 p-1 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <button
            onClick={() => {
              resetToSelf()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
          >
            <User size={14} className={isSelf ? "text-gold" : "text-white/30"} />
            <span className={isSelf ? "text-gold" : "text-white/60"}>{displayName(userProfile)}</span>
            {isSelf && <Check size={12} className="ml-auto text-gold" />}
          </button>

          {birthProfiles.filter((p) => p.id !== userProfile.id).map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActiveTestTarget(p)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
            >
              <Users size={14} className={activeTestTarget?.id === p.id ? "text-gold" : "text-white/30"} />
              <span className={activeTestTarget?.id === p.id ? "text-gold" : "text-white/60"}>{displayName(p)}</span>
              {activeTestTarget?.id === p.id && <Check size={12} className="ml-auto text-gold" />}
            </button>
          ))}

          <div className="border-t border-white/10" />

          <button
            onClick={() => {
              setOpen(false)
              setShowAddDialog(true)
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/48 transition-colors hover:bg-white/5 hover:text-white/72"
          >
            <Plus size={14} />
            <span>Add comparison profile</span>
          </button>
        </div>
      )}

      {showAddDialog && createPortal(
        <AddProfileDialog
          onClose={() => setShowAddDialog(false)}
          onSave={createBirthProfile}
        />,
        document.body,
      )}
    </div>
  )
}

function AddProfileDialog({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (data: {
    nickname: string
    gender: "male" | "female" | "other"
    birth_year: number
    birth_month: number
    birth_day: number
    birth_hour: number
    birth_minute: number
    birth_city: string
  }) => Promise<BirthProfile>
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

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const handleSave = async () => {
    if (!nickname.trim()) {
      toast.error("Name is required")
      return
    }
    if (!birthYear || !birthMonth || !birthDay) {
      toast.error("Birth date is required")
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
      toast.success("Profile saved")
      onClose()
    } catch {
      toast.error("Save failed. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 p-4" style={{ zIndex: 2147483647 }}>
      <button aria-label="Close" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#07110F] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#07110F] p-5">
          <div>
            <h3 className="font-serif text-lg text-gold">Add comparison profile</h3>
            <p className="mt-0.5 text-xs text-white/40">Use it for relationship and comparison analysis.</p>
          </div>
          <button onClick={onClose} className="text-white/30 transition-colors hover:text-white/60">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Name"
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="label">Gender</label>
            <div className="flex gap-3">
              {([
                ["female", "Female"],
                ["male", "Male"],
                ["other", "Other"],
              ] as [string, string][]).map(([v, l]) => (
                <label key={v} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    value={v}
                    checked={gender === v}
                    onChange={() => setGender(v as "male" | "female" | "other")}
                    className="peer sr-only"
                  />
                  <div className="rounded-xl border border-white/20 py-2.5 text-center text-sm text-white/60 transition-all hover:border-white/40 peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-gold">{l}</div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Birth date</label>
            <Suspense fallback={<div className="h-10 animate-pulse rounded bg-white/5" />}>
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

          <div>
            <label className="label">Birth time</label>
            <Suspense fallback={<div className="h-10 animate-pulse rounded bg-white/5" />}>
              <ShichenSelector
                value={birthHour}
                onChange={(h) => {
                  setBirthHour(h)
                  setBirthMinute(0)
                }}
              />
            </Suspense>
          </div>

          <div>
            <Suspense fallback={<div className="h-10 animate-pulse rounded bg-white/5" />}>
              <LocationSelector
                value={birthCity}
                onChange={setBirthCity}
                placeholder="Enter city, e.g. Singapore"
              />
            </Suspense>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-white/10 bg-[#07110F] p-5">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-white/20 py-2.5 text-sm text-white/60 transition-all hover:border-white/40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
