"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { listMyReadings, type ReadingListItem } from "@/lib/api"
import { motion } from "framer-motion"
import { ProfileCard } from "./ProfileCard"
import { IntentButtons } from "./IntentButtons"
import { GeworkDrawer } from "./GeworkDrawer"
import { useLanguage } from "@/contexts/LanguageContext"

export function UserDashboard() {
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

      {/* Recent readings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
