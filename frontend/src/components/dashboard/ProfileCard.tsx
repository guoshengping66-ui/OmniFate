"use client"
import { Star, Calendar, MapPin } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { useLanguage } from "@/contexts/LanguageContext"
import { TargetSelector } from "./TargetSelector"
import { BirthProfileSetup } from "./BirthProfileSetup"

// Chinese zodiac animals
const ZODIAC_ZH = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"]
const ZODIAC_EN = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"]
const SHENGXIAO = ["🐀","🐂","🐅","🐇","🐉","🐍","🐴","🐑","🐒","🐔","🐕","🐖"]

function getZodiac(year: number, locale: string): string {
  const arr = locale === "zh" ? ZODIAC_ZH : ZODIAC_EN
  return arr[(year - 4) % 12]
}

function getShengxiao(year: number): string {
  return SHENGXIAO[(year - 4) % 12]
}

const CONSTELLATION_ZH = ["水瓶座","双鱼座","白羊座","金牛座","双子座","巨蟹座","狮子座","处女座","天秤座","天蝎座","射手座","摩羯座"]
const CONSTELLATION_EN = ["Aquarius","Pisces","Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn"]

function getConstellation(month: number, day: number, locale: string): string {
  const dates = [20,19,21,20,21,22,23,23,23,24,22,22]
  const signs = locale === "zh" ? CONSTELLATION_ZH : CONSTELLATION_EN
  const idx = (month - 2 + (day >= dates[month - 1] ? 1 : 0) + 12) % 12
  return signs[idx]
}

export function ProfileCard() {
  const { userProfile, activeTestTarget } = useUserStore()
  const { t, locale } = useLanguage()

  // Show activeTestTarget (friend) if set, otherwise show own profile
  const profile = activeTestTarget || userProfile

  const constellation = profile ? getConstellation(profile.birth_month, profile.birth_day, locale) : ""
  const zodiac = profile ? getZodiac(profile.birth_year, locale) : ""
  const shengxiao = profile ? getShengxiao(profile.birth_year) : ""

  return (
    <div className="card-glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg text-gold flex items-center gap-2">
          <Star size={18} /> {t("dash.profile.title")}
        </h2>
        <TargetSelector />
      </div>

      {profile ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/30 w-16">{t("dash.profile.nickname")}</span>
            <span className="text-white/70">{profile.nickname}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar size={14} className="text-white/30" />
            <span className="text-white/70">
              {t("dash.profile.dateFormat")
                .replace("{y}", String(profile.birth_year))
                .replace("{M}", String(profile.birth_month))
                .replace("{d}", String(profile.birth_day))
                .replace("{h}", String(profile.birth_hour))
                .replace("{m}", String(profile.birth_minute))
              }
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={14} className="text-white/30" />
            <span className="text-white/70">{profile.birth_city || t("dash.profile.notSet")}</span>
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {constellation && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {constellation}
              </span>
            )}
            {zodiac && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
                {zodiac}{t("dash.profile.zodiacYear")}
              </span>
            )}
            {shengxiao && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-jade/10 text-jade-light border border-jade/20">
                {shengxiao}
              </span>
            )}
          </div>
        </div>
      ) : (
        <BirthProfileSetup />
      )}
    </div>
  )
}
