"use client"

import { Calendar, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { TargetSelector } from "./TargetSelector"
import { BirthProfileSetup } from "./BirthProfileSetup"

const ZODIAC_EN = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"]
const SIGNS_EN = ["Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn"]

function isSelfName(name?: string) {
  return !name || name === "Myself" || name === "Self" || /[\u4e00-\u9fff]/.test(name)
}

function getZodiac(year: number): string {
  return ZODIAC_EN[((year - 4) % 12 + 12) % 12]
}

function getSign(month: number, day: number): string {
  const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 22, 22]
  return SIGNS_EN[(month - 2 + (day >= dates[month - 1] ? 1 : 0) + 12) % 12]
}

function formatBirthDate(year: number, month: number, day: number, hour: number, minute: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function ProfileCard() {
  const { userProfile, activeTestTarget } = useUserStore()
  const profile = activeTestTarget || userProfile

  if (!profile) {
    return (
      <div className="rounded-[28px] border border-gold/15 bg-[#08120f]/88 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.28)] md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/[0.08] text-gold">
            <Star size={18} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/55">Personal Atlas</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Create your birth profile</h2>
          </div>
        </div>
        <BirthProfileSetup />
      </div>
    )
  }

  const displayName = isSelfName(profile.nickname) ? "My Profile" : profile.nickname
  const completeness = profile.birth_city ? 100 : 82

  return (
    <div className="relative rounded-[28px] border border-gold/15 bg-[#08120f]/88 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.28)] md:p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/65 to-transparent" />
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/[0.07] blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-emerald-500/[0.05] blur-3xl" />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/55">Personal Pattern Atlas</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{displayName}</h2>
          <p className="mt-2 text-sm text-white/45">
            {activeTestTarget && activeTestTarget.id !== userProfile?.id
              ? "Active comparison profile"
              : "Used for reports, daily action, and relationship analysis"}
          </p>
        </div>
        <div className="relative z-20">
          <TargetSelector />
        </div>
      </div>

      <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.07] bg-[#060E24] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/35">
            <Calendar size={14} />
            <span className="text-[10px] uppercase tracking-[0.16em]">Birth time</span>
          </div>
          <p className="text-sm text-white/78">
            {formatBirthDate(profile.birth_year, profile.birth_month, profile.birth_day, profile.birth_hour, profile.birth_minute)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#060E24] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/35">
            <MapPin size={14} />
            <span className="text-[10px] uppercase tracking-[0.16em]">Birth place</span>
          </div>
          <p className="text-sm text-white/78">{profile.birth_city || "Not set"}</p>
        </div>
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-gold/20 bg-gold/[0.08] px-3 py-1.5 text-xs text-gold">
          {getZodiac(profile.birth_year)}
        </span>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5 text-xs text-emerald-100/75">
          {getSign(profile.birth_month, profile.birth_day)}
        </span>
        <span className="rounded-full border border-white/[0.08] bg-[#060E24] px-3 py-1.5 text-xs text-white/55">
          Profile {completeness}%
        </span>
      </div>

      <div className="relative z-10 mt-5 border-t border-white/[0.06] pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-white/55">
            <ShieldCheck size={16} className="text-gold/75" />
            Ready for synthesis and daily action
          </div>
          <Sparkles size={16} className="text-gold/55" />
        </div>
      </div>
    </div>
  )
}
