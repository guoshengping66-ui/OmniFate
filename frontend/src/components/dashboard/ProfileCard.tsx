"use client"

import { Calendar, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { useLanguage } from "@/contexts/LanguageContext"
import { TargetSelector } from "./TargetSelector"
import { BirthProfileSetup } from "./BirthProfileSetup"

const ZODIAC_ZH = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"]
const ZODIAC_EN = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"]
const CONSTELLATION_ZH = ["水瓶座", "双鱼座", "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座"]
const CONSTELLATION_EN = ["Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn"]

function getZodiac(year: number, locale: string): string {
  const arr = locale === "zh" ? ZODIAC_ZH : ZODIAC_EN
  return arr[((year - 4) % 12 + 12) % 12]
}

function getConstellation(month: number, day: number, locale: string): string {
  const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 22, 22]
  const signs = locale === "zh" ? CONSTELLATION_ZH : CONSTELLATION_EN
  const idx = (month - 2 + (day >= dates[month - 1] ? 1 : 0) + 12) % 12
  return signs[idx]
}

export function ProfileCard() {
  const { userProfile, activeTestTarget } = useUserStore()
  const { t, locale } = useLanguage()
  const isZh = locale === "zh"
  const profile = activeTestTarget || userProfile

  if (!profile) {
    return (
      <div className="border border-gold/15 bg-[#08120f]/85 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-gold/25 bg-gold/[0.08] text-gold">
            <Star size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold/55">
              {isZh ? "Destiny Identity" : "Destiny Identity"}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">{t("dash.profile.title")}</h2>
          </div>
        </div>
        <BirthProfileSetup />
      </div>
    )
  }

  const constellation = getConstellation(profile.birth_month, profile.birth_day, locale)
  const zodiac = getZodiac(profile.birth_year, locale)
  const completeness = profile.birth_city ? 100 : 82

  return (
    <div className="relative overflow-hidden border border-gold/15 bg-[#08120f]/85 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/[0.06] blur-3xl" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold/55">
            {isZh ? "Destiny Identity" : "Destiny Identity"}
          </p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-white">{profile.nickname}</h2>
          <p className="mt-2 text-sm text-parchment-400">
            {activeTestTarget ? (isZh ? "当前查看对象" : "Active target") : (isZh ? "你的个人命盘档案" : "Your personal chart profile")}
          </p>
        </div>
        <TargetSelector />
      </div>

      <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-2">
        <div className="border border-white/[0.07] bg-white/[0.035] p-4">
          <div className="mb-2 flex items-center gap-2 text-parchment-400">
            <Calendar size={14} />
            <span className="text-xs uppercase tracking-[0.16em]">{isZh ? "出生时间" : "Birth Time"}</span>
          </div>
          <p className="text-sm text-parchment-200">
            {t("dash.profile.dateFormat")
              .replace("{y}", String(profile.birth_year))
              .replace("{M}", String(profile.birth_month))
              .replace("{d}", String(profile.birth_day))
              .replace("{h}", String(profile.birth_hour))
              .replace("{m}", String(profile.birth_minute))}
          </p>
        </div>

        <div className="border border-white/[0.07] bg-white/[0.035] p-4">
          <div className="mb-2 flex items-center gap-2 text-parchment-400">
            <MapPin size={14} />
            <span className="text-xs uppercase tracking-[0.16em]">{isZh ? "出生地点" : "Birth Place"}</span>
          </div>
          <p className="text-sm text-parchment-200">{profile.birth_city || t("dash.profile.notSet")}</p>
        </div>
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap gap-2">
        <span className="border border-gold/20 bg-gold/[0.08] px-3 py-1.5 text-xs text-gold">
          {zodiac}{isZh ? "年" : ""}
        </span>
        <span className="border border-jade/20 bg-jade/[0.08] px-3 py-1.5 text-xs text-jade-light">
          {constellation}
        </span>
        <span className="border border-white/[0.06] bg-white/[0.035] px-3 py-1.5 text-xs text-parchment-300">
          {isZh ? "命盘完整度" : "Profile"} {completeness}%
        </span>
      </div>

      <div className="relative z-10 mt-5 border-t border-white/[0.06] pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-parchment-300">
            <ShieldCheck size={16} className="text-gold/75" />
            {isZh ? "已用于五维合参和每日指挥台" : "Used for 5D synthesis and daily command"}
          </div>
          <Sparkles size={16} className="text-gold/55" />
        </div>
      </div>
    </div>
  )
}
