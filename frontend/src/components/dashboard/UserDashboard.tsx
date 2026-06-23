"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import { useUserStore } from "@/stores/useUserStore"
import { listMyReadings, type ReadingListItem } from "@/lib/api"
import { ProfileCard } from "./ProfileCard"
import { IntentButtons } from "./IntentButtons"
import { GeworkDrawer } from "./GeworkDrawer"
import { TagBadge } from "@/components/ui/TagBadge"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"

export function UserDashboard() {
  const { t, locale, localeHref } = useLanguage()
  const { user } = useAuth()
  const [recentReadings, setRecentReadings] = useState<ReadingListItem[]>([])
  const [loadingReadings, setLoadingReadings] = useState(true)
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoadingReadings(false)
      return
    }
    const timer = setTimeout(() => {
      listMyReadings()
        .then(r => setRecentReadings(r.slice(0, 3)))
        .catch(() => {})
        .finally(() => setLoadingReadings(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [user])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 anim-slide-up anim-delay-1">
        <ProfileCard />
      </div>

      <div className="mb-10 anim-slide-up anim-delay-2">
        <IntentButtons onGework={() => setEventDrawerOpen(true)} />
      </div>

      <div className="anim-slide-up anim-delay-3">
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
                      <TagBadge key={tag} tag={tag} />
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
      </div>

      <GeworkDrawer open={eventDrawerOpen} onClose={() => setEventDrawerOpen(false)} />
    </div>
  )
}
