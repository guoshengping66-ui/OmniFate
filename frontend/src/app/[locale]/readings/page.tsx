"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import {
  Loader2, ScrollText, Sparkles, Lock, Unlock, Clock,
  ArrowRight, Plus, AlertCircle, Star, Trash2,
} from "lucide-react"
import toast from "react-hot-toast"
import { listMyReadings, deleteReading, ReadingListItem } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { TagBadge } from "@/components/ui/TagBadge"
import { cleanVisibleReportText } from "@/lib/reportTextQuality"

function stripMarkdown(text: string): string {
  return cleanVisibleReportText(text)
}

export default function ReadingsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || "en"
  const { user, loading: authLoading } = useAuth()
  const { t, localeHref } = useLanguage()
  const [readings, setReadings] = useState<ReadingListItem[]>([])
  const [loading, setLoading] = useState(true)

  const DIM_LABELS: Record<string, string> = {
    wealth: t("readings.dim.wealth"), career: t("readings.dim.career"),
    relationship: t("readings.dim.relationship"), health: t("readings.dim.health"),
    mindfulness: t("readings.dim.mindfulness"),
  }

  const getWeakest = (scores: Record<string, number>): string => {
    if (!scores || Object.keys(scores).length === 0) return ""
    const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1])
    return DIM_LABELS[sorted[0]?.[0]] ?? ""
  }

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault() // prevent navigation
    e.stopPropagation()
    if (!confirm(t("readings.confirmDelete"))) return
    try {
      await deleteReading(sessionId)
      setReadings(prev => prev.filter(r => r.id !== sessionId))
      toast.success(t("readings.deleted"))
    } catch {
      toast.error(t("readings.deleteFail"))
    }
  }

  const formatDate = (iso: string): string => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60_000) return t("readings.justNow")
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} ${t("readings.minutesAgo")}`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} ${t("readings.hoursAgo")}`
    if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)} ${t("readings.daysAgo")}`
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" })
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      toast.error(t("readings.loginRequired"))
      router.push(localeHref("/login"))
      return
    }
    listMyReadings()
      .then(setReadings)
      .catch(() => toast.error(t("readings.loadFail")))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gold mb-1">{t("readings.title")}</h1>
            <p className="text-white/40 text-sm">{t("readings.subtitle")}</p>
            <p className="text-white/25 text-xs mt-1">{t("readings.retentionHint")}</p>
          </div>
          <Link
            href={localeHref("/reading/new")}
            className="btn-gold flex items-center gap-2 text-sm py-2.5 px-5"
          >
            <Plus size={16} /> {t("readings.newReading")}
          </Link>
        </div>

        {readings.length === 0 ? (
          <div className="card-glass p-16 text-center">
            <ScrollText size={48} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/40 text-sm mb-2">{t("readings.empty")}</p>
            <p className="text-white/20 text-xs mb-6">{t("readings.startFirst")}</p>
            <Link href="/reading/new" className="btn-gold inline-flex items-center gap-2 text-sm">
              {t("readings.startReading")} <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {readings.map((r) => {
              const weakest = getWeakest(r.dimension_scores)
              return (
                <Link
                  key={r.id}
                  href={localeHref(`/reading/${r.id}`)}
                  className="block card-glow p-5 hover:border-gold/30 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
 <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex-shrink-0 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                      🔮
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white text-sm truncate">
                          {t("readings.reportTitle")}
                        </h3>
                        {r.is_detail_unlocked ? (
                          <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400">
                            <Unlock size={8} /> {t("readings.unlocked")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/30">
                            <Lock size={8} /> {t("readings.freeVersion")}
                          </span>
                        )}
                      </div>

                      {r.master_summary && (
                        <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-2">
                          {stripMarkdown(r.master_summary)}
                        </p>
                      )}

                      {/* Tags */}
                      {r.computed_tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {r.computed_tags.slice(0, 4).map(tag => (
                            <TagBadge key={tag} tag={tag} />
                          ))}
                          {r.computed_tags?.length > 4 && (
                            <span className="text-[10px] text-white/20">+{r.computed_tags.length - 4}</span>
                          )}
                        </div>
                      )}

                      {/* Dimension mini scores */}
                      {Object.keys(r.dimension_scores || {}).length > 0 && (
                        <div className="flex items-center gap-3 text-[10px] text-white/30">
                          {Object.entries(DIM_LABELS).map(([key, label]) => {
                            const score = r.dimension_scores[key]
                            if (score == null) return null
                            return (
                              <span key={key} className="flex items-center gap-0.5">
                                {label} {score.toFixed(1)}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1 text-white/30 text-[11px]">
                        <Clock size={10} />
                        {formatDate(r.created_at)}
                      </div>
                      {weakest && (
                        <p className="text-white/20 text-[10px] mt-1">
                          {t("readings.weakest")}: {weakest}
                        </p>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, r.id)}
                        className="mt-2 flex items-center gap-1 text-[10px] text-white/20 hover:text-red-400 transition-colors"
                        title={t("readings.delete")}
                      >
                        <Trash2 size={10} />
                        {t("readings.delete")}
                      </button>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
