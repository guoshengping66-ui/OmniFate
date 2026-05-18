"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Sparkles, ArrowRight, Users, Loader2, Star, Calendar, MapPin,
  Target, Zap,
} from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { useWizardStore, type Intent } from "@/stores/useWizardStore"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { listMyReadings, type ReadingListItem } from "@/lib/api"
import { motion } from "framer-motion"
import { TargetSelector } from "./TargetSelector"
import { BirthProfileSetup } from "./BirthProfileSetup"
import { GeworkDrawer } from "./GeworkDrawer"

// Chinese zodiac animals
const ZODIAC = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"]

function getZodiac(year: number): string {
  return ZODIAC[(year - 4) % 12]
}

function getShengxiao(year: number): string {
  const animals = ["🐀","🐂","🐅","🐇","🐉","🐍","🐴","🐑","🐒","🐔","🐕","🐖"]
  return animals[(year - 4) % 12]
}

function getConstellation(month: number, day: number): string {
  const dates = [20,19,21,20,21,22,23,23,23,24,22,22]
  const signs = ["水瓶座","双鱼座","白羊座","金牛座","双子座","巨蟹座","狮子座","处女座","天秤座","天蝎座","射手座","摩羯座"]
  const idx = (month - 1 + (day >= dates[month - 1] ? 1 : 0)) % 12
  return signs[idx]
}

export function UserDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { userProfile, activeTestTarget, fetchBirthProfiles, loading } = useUserStore()
  const { setIntent, prefillFromProfile } = useWizardStore()
  const [recentReadings, setRecentReadings] = useState<ReadingListItem[]>([])
  const [loadingReadings, setLoadingReadings] = useState(true)
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false)

  useEffect(() => {
    fetchBirthProfiles()
    listMyReadings()
      .then(r => setRecentReadings(r.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoadingReadings(false))
  }, [])

  const handleIntent = (intent: Intent) => {
    const profile = activeTestTarget || userProfile

    if (!profile && intent !== "GENERAL_DAILY") {
      // No profile → redirect to wizard which will show empty form
      setIntent(intent)
      router.push("/reading/new")
      return
    }

    setIntent(intent)
    if (profile) {
      prefillFromProfile(profile)
    }
    router.push("/reading/new")
  }

  const constellation = userProfile ? getConstellation(userProfile.birth_month, userProfile.birth_day) : ""
  const zodiac = userProfile ? getZodiac(userProfile.birth_year) : ""
  const shengxiao = userProfile ? getShengxiao(userProfile.birth_year) : ""

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gold mb-2">
          {t("hero.title1")}，{user?.display_name || ""} ✨
        </h1>
        <p className="text-white/40 text-sm">你的命理底座已就绪，随时可以开始探索</p>
      </motion.div>

      {/* Profile card + Intent actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {/* Profile summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 card-glass p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-gold flex items-center gap-2">
              <Star size={18} /> 命理底座
            </h2>
            <TargetSelector />
          </div>

          {userProfile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-white/30 w-16">昵称</span>
                <span className="text-white/70">{userProfile.nickname}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={14} className="text-white/30" />
                <span className="text-white/70">
                  {userProfile.birth_year}年{userProfile.birth_month}月{userProfile.birth_day}日
                  {userProfile.birth_hour}时{userProfile.birth_minute}分
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={14} className="text-white/30" />
                <span className="text-white/70">{userProfile.birth_city || "未填写"}</span>
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
                    {zodiac}年
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
        </motion.div>

        {/* Intent selector — 3 个推演入口 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* 完整推命 */}
          <button
            onClick={() => handleIntent("FULL_MULTIMODAL")}
            disabled={loading}
            className="w-full card-glass p-4 text-left group hover:border-gold/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} className="text-gold" />
              </div>
              <div>
                <div className="text-white/80 text-sm font-medium">完整推命</div>
                <div className="text-white/30 text-xs">塔罗 + 面相 + 手相</div>
              </div>
            </div>
          </button>

          {/* 日常问事 */}
          <button
            onClick={() => handleIntent("GENERAL_DAILY")}
            disabled={loading}
            className="w-full card-glass p-4 text-left group hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <Zap size={20} className="text-white/50" />
              </div>
              <div>
                <div className="text-white/80 text-sm font-medium">日常问事</div>
                <div className="text-white/30 text-xs">一键提问 · 塔罗指引</div>
              </div>
            </div>
          </button>

          {/* 格物致知 — 事件分析 */}
          <button
            onClick={() => setEventDrawerOpen(true)}
            className="w-full card-glass p-4 text-left group hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <Target size={20} className="text-white/50" />
              </div>
              <div>
                <div className="text-white/80 text-sm font-medium">格物致知</div>
                <div className="text-white/30 text-xs">特定事件 · AI 复盘</div>
              </div>
            </div>
          </button>

          {/* 帮朋友测 */}
          <Link
            href="/reading/new"
            className="block card-glass p-4 text-left group hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-white/50" />
              </div>
              <div>
                <div className="text-white/80 text-sm font-medium">帮朋友测</div>
                <div className="text-white/30 text-xs">使用不同的出生信息</div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Recent readings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-white/70">最近分析</h2>
          {recentReadings.length > 0 && (
            <Link href="/readings" className="text-gold/60 hover:text-gold text-xs">查看全部 →</Link>
          )}
        </div>

        {loadingReadings ? (
          <div className="card-glass p-8 text-center">
            <Loader2 size={20} className="text-white/30 animate-spin mx-auto" />
          </div>
        ) : recentReadings.length > 0 ? (
          <div className="space-y-3">
            {recentReadings.map(r => (
              <Link
                key={r.id}
                href={`/reading/${r.id}`}
                className="block card-glass p-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm truncate">{r.master_summary || "分析中..."}</p>
                    <p className="text-white/30 text-xs mt-1">
                      {new Date(r.created_at).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {r.computed_tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{tag}</span>
                    ))}
                    <ArrowRight size={14} className="text-white/20" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-glass p-8 text-center">
            <p className="text-white/30 text-sm">还没有分析记录</p>
            <p className="text-white/20 text-xs mt-1">选择上方推演方式开始你的第一次分析</p>
          </div>
        )}
      </motion.div>

      {/* 格物致知 Drawer */}
      <GeworkDrawer open={eventDrawerOpen} onClose={() => setEventDrawerOpen(false)} />
    </div>
  )
}
