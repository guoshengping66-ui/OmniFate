"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, CalendarDays, Compass, Sparkles } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { ProfileCard } from "./ProfileCard"
import { IntentButtons } from "./IntentButtons"
import { GeworkDrawer } from "./GeworkDrawer"
import { useLanguage } from "@/contexts/LanguageContext"
import { generateDailyActionSummary } from "@/lib/dailySignals"

const signalColors = ["#5A9E8E", "#7B9EC7", "#C77B8B", "#C9A84C", "#8B7EC7"]

function isSelfName(name?: string) {
  return !name || name === "Myself" || name === "Self" || /[\u4e00-\u9fff]/.test(name)
}

export function UserDashboard() {
  const { localeHref } = useLanguage()
  const { userProfile, activeTestTarget, fetchBirthProfiles } = useUserStore()
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false)

  useEffect(() => {
    fetchBirthProfiles()
  }, [fetchBirthProfiles])

  const profile = activeTestTarget || userProfile
  const displayName = isSelfName(profile?.nickname) ? "You" : profile?.nickname || "You"

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", weekday: "long" }),
    [],
  )

  const daily = useMemo(() => {
    if (profile?.birth_year && profile.birth_month && profile.birth_day) {
      return generateDailyActionSummary(profile.birth_year, profile.birth_month, profile.birth_day, false)
    }
    return null
  }, [profile?.birth_year, profile?.birth_month, profile?.birth_day])

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-6">
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-white/[0.06] bg-[#060E24] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.30)] md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/[0.15] bg-gold/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
            <Sparkles size={13} /> Daily Action Center
          </p>
          <h1 className="mt-5 max-w-xl text-2xl font-semibold leading-tight text-white/88 md:text-3xl">
            {displayName}, start with one clear move today
          </h1>
          <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-white/45">
            {daily
              ? daily.source
              : "Complete your birth profile to generate daily action from your real pattern and today's signal."}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[12px] text-white/35">
            <span>{today}</span>
            <span className="text-white/12">/</span>
            <span>Updates daily from your profile</span>
          </div>
        </div>

        <ProfileCard />
      </section>

      <section className="rounded-[32px] border border-gold/15 bg-[#07110F]/90 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.32)] md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/70">
              <Compass size={14} /> Today&apos;s Command
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white/85">
              {daily?.theme || "Create your profile to unlock today's command"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/48">
              {daily?.reminder || "This is not a fixed template. Once your profile is ready, the system recalculates it from your birth pattern and the current day."}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-[#030918] px-4 py-3 text-sm text-white/55">
            <div className="flex items-center gap-2 text-gold/75">
              <CalendarDays size={15} />
              <span>Best window</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-white/80">{daily?.window || "14:00 - 17:00"}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.045] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">Best</p>
            <p className="mt-2 text-sm leading-relaxed text-white/68">{daily?.best || "Save your birth profile first."}</p>
          </div>
          <div className="rounded-2xl border border-rose-300/15 bg-rose-300/[0.04] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-100/70">Avoid</p>
            <p className="mt-2 text-sm leading-relaxed text-white/68">{daily?.avoid || "Do not rely on static templates for today."}</p>
          </div>
        </div>

        {daily && (
          <div className="mt-5 grid gap-2.5 lg:grid-cols-5">
            {daily.signals.map((signal, index) => (
              <div key={signal.n} className="rounded-2xl border border-white/[0.055] bg-white/[0.025] p-3">
                <span className="mb-3 block h-1 w-8 rounded-full" style={{ background: signalColors[index] }} />
                <p className="text-[12px] font-medium text-white/66">{signal.n}</p>
                <p className="mt-1 text-sm font-semibold text-gold/85">{signal.v}</p>
                <p className="mt-2 text-[11px] leading-5 text-white/38">{signal.t}</p>
              </div>
            ))}
          </div>
        )}

        <Link
          href={localeHref("/reading/new?intent=full")}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-[#07110F] transition hover:shadow-[0_0_26px_rgba(201,168,76,0.28)]"
        >
          Generate full report <ArrowRight size={15} />
        </Link>
      </section>

      <IntentButtons onGework={() => setEventDrawerOpen(true)} />
      <GeworkDrawer open={eventDrawerOpen} onClose={() => setEventDrawerOpen(false)} />
    </div>
  )
}
