"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Loader2, Sparkles, Crown, Calendar, BookOpen, ShoppingBag } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { listMyReadings, type ReadingListItem } from "@/lib/api"
import { motion } from "framer-motion"
import { ProfileCard } from "./ProfileCard"
import { IntentButtons } from "./IntentButtons"
import { GeworkDrawer } from "./GeworkDrawer"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

export function UserDashboard() {
  const { user } = useAuth()
  const { userProfile, fetchBirthProfiles } = useUserStore()
  const { t, locale } = useLanguage()
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

  const isEn = locale === "en"

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile + Intent grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <ProfileCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <IntentButtons onGework={() => setEventDrawerOpen(true)} />
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
      >
        {/* Stardust Balance */}
        <div className="card-glass p-4 text-center">
          <Sparkles size={18} className="text-gold mx-auto mb-2" />
          <p className="text-xl font-bold text-gold">{user?.stardust_balance ?? 0}</p>
          <p className="text-white/30 text-[10px] mt-0.5">{isEn ? "Stardust" : "星尘余额"}</p>
        </div>

        {/* Reading Count */}
        <div className="card-glass p-4 text-center">
          <BookOpen size={18} className="text-blue-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-blue-400">{recentReadings.length}</p>
          <p className="text-white/30 text-[10px] mt-0.5">{isEn ? "Readings" : "推命次数"}</p>
        </div>

        {/* Membership */}
        <div className="card-glass p-4 text-center">
          <Crown size={18} className="text-amber-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-amber-400">
            {user?.is_premium
              ? user.subscription_tier === "premium_yearly" ? (isEn ? "Yearly" : "年度") : (isEn ? "Monthly" : "月度")
              : (isEn ? "Free" : "免费")}
          </p>
          <p className="text-white/30 text-[10px] mt-0.5">{isEn ? "Plan" : "当前套餐"}</p>
        </div>

        {/* Coupon Balance */}
        <div className="card-glass p-4 text-center">
          <ShoppingBag size={18} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-emerald-400">¥{user?.shop_coupon_balance ?? 0}</p>
          <p className="text-white/30 text-[10px] mt-0.5">{isEn ? "Coupon" : "商城代金券"}</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3 mb-10"
      >
        <Link href="/reading/new" className="card-glass p-4 text-center hover:border-gold/30 transition-all group">
          <Calendar size={20} className="text-gold mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-white/60 text-xs">{isEn ? "New Reading" : "开始推命"}</p>
        </Link>
        <Link href="/divination" className="card-glass p-4 text-center hover:border-gold/30 transition-all group">
          <Sparkles size={20} className="text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-white/60 text-xs">{isEn ? "Daily Divination" : "每日占卜"}</p>
        </Link>
        <Link href="/shop" className="card-glass p-4 text-center hover:border-gold/30 transition-all group">
          <ShoppingBag size={20} className="text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-white/60 text-xs">{isEn ? "Shop" : "改运商城"}</p>
        </Link>
      </motion.div>

      {/* Recent readings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-white/70">{t("dash.recent.title")}</h2>
          {recentReadings.length > 0 && (
            <Link href="/readings" className="text-gold/60 hover:text-gold text-xs">{t("dash.recent.viewAll")}</Link>
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
                    <p className="text-white/70 text-sm truncate">{r.master_summary || t("dash.recent.analyzing")}</p>
                    <p className="text-white/30 text-xs mt-1">
                      {new Date(r.created_at).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
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
            <p className="text-white/30 text-sm">{t("dash.recent.empty")}</p>
            <p className="text-white/20 text-xs mt-1">{t("dash.recent.emptyDesc")}</p>
          </div>
        )}
      </motion.div>

      <GeworkDrawer open={eventDrawerOpen} onClose={() => setEventDrawerOpen(false)} />
    </div>
  )
}
