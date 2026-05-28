"use client"
import { useState, useEffect } from "react"
import { Crown, Vote, Star, MapPin, Calendar, Users, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

interface FounderInfo {
  seat_no: number
  region: string
  activated_at: string
  is_founder: boolean
}

interface VoteItem {
  id: string
  title: string
  description: string
  votes_for: number
  votes_against: number
  user_voted: "for" | "against" | null
}

export default function FounderLoungePage() {
  const { user } = useAuth()
  const { t, localeHref } = useLanguage()
  const [founderInfo, setFounderInfo] = useState<FounderInfo | null>(null)
  const [votes, setVotes] = useState<VoteItem[]>([])
  const [loading, setLoading] = useState(true)

  const ROADMAP_ITEMS = [
    { id: "v1", titleKey: "founder.roadmap.v1.title", descKey: "founder.roadmap.v1.desc" },
    { id: "v2", titleKey: "founder.roadmap.v2.title", descKey: "founder.roadmap.v2.desc" },
    { id: "v3", titleKey: "founder.roadmap.v3.title", descKey: "founder.roadmap.v3.desc" },
    { id: "v4", titleKey: "founder.roadmap.v4.title", descKey: "founder.roadmap.v4.desc" },
  ]

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get("/api/users/me").then(r => setFounderInfo(r.data)),
      api.get("/api/referrals/stats").catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [user])

  const handleVote = async (itemId: string, voteType: "for" | "against") => {
    try {
      await api.post("/api/founder/vote", { item_id: itemId, vote: voteType })
      toast.success(t("founder.lounge.voteSuccess"))
      const res = await api.get("/api/founder/votes")
      setVotes(res.data.items || [])
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("founder.lounge.voteFail"))
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="text-white/40">{t("founder.loginRequired")}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (!founderInfo?.is_founder) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <Crown size={48} className="text-gold/30 mx-auto mb-4" />
          <p className="text-white/40 text-lg">{t("founder.lounge.notFounder")}</p>
          <a href={localeHref("/pricing/founder")} className="text-gold text-sm mt-2 inline-block hover:underline">
            {t("founder.lounge.learnMore")}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: t("founder.lounge.breadcrumb") }]} />

        <div className="relative mb-8 rounded-2xl overflow-hidden mt-6 anim-slide-up">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-[#1a1507] to-[#0d0b04] opacity-90" />
          <div className="absolute inset-0 border border-gold/20 rounded-2xl" />

          <div className="absolute inset-0 opacity-30">
            <div className="absolute w-64 h-64 bg-gold/10 rounded-full blur-[80px] -top-20 -right-20 animate-[nebula-pulse_4s_ease-in-out_infinite]" />
            <div className="absolute w-48 h-48 bg-gold/5 rounded-full blur-[60px] bottom-10 -left-10 animate-[nebula-pulse_4s_ease-in-out_infinite_2s]" />
          </div>

          <div className="relative z-10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-[#C4A44A] flex items-center justify-center">
                <Crown size={24} className="text-ink" />
              </div>
              <div>
                <h1 className="text-gold font-serif text-2xl font-bold">{t("founder.lounge.title")}</h1>
                <p className="text-gold/50 text-sm">Founder #{founderInfo.seat_no}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-gold/10">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-gold/60" />
                  <span className="text-white/40 text-xs">{t("founder.lounge.region")}</span>
                </div>
                <span className="text-gold font-medium text-sm">
                  {founderInfo.region === "domestic" ? t("founder.lounge.domestic") : t("founder.lounge.overseas")}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-gold/10">
                <div className="flex items-center gap-2 mb-1">
                  <Star size={14} className="text-gold/60" />
                  <span className="text-white/40 text-xs">{t("founder.lounge.stardust")}</span>
                </div>
                <span className="text-gold font-medium text-sm">{t("founder.lounge.monthly500")}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-gold/10">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-gold/60" />
                  <span className="text-white/40 text-xs">{t("founder.lounge.activated")}</span>
                </div>
                <span className="text-gold font-medium text-sm">
                  {founderInfo.activated_at
                    ? new Date(founderInfo.activated_at).toLocaleDateString()
                    : t("founder.lounge.notActivated")}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-gold/40 text-xs">
              <Users size={12} />
              <span>{t("founder.lounge.unlockAll")}</span>
            </div>
          </div>
        </div>

        <div className="anim-slide-up anim-delay-2">
          <div className="flex items-center gap-2 mb-4">
            <Vote size={18} className="text-gold" />
            <h2 className="text-gold font-serif text-lg font-bold">{t("founder.lounge.roadmapTitle")}</h2>
          </div>
          <p className="text-white/30 text-sm mb-5">{t("founder.lounge.roadmapDesc")}</p>

          <div className="space-y-3">
            {ROADMAP_ITEMS.map((item, i) => {
              const vote = votes.find(v => v.id === item.id)
              return (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-gold/20 transition-all anim-slide-up"
                  style={{ animationDelay: `${0.15 + i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white/90 font-medium text-sm">{t(item.titleKey)}</h3>
                      <p className="text-white/40 text-xs mt-1">{t(item.descKey)}</p>
                    </div>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button
                        onClick={() => handleVote(item.id, "for")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          vote?.user_voted === "for"
                            ? "bg-gold/20 text-gold border border-gold/30"
                            : "bg-white/5 text-white/40 border border-white/10 hover:text-gold hover:border-gold/20"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Star size={12} />
                          {vote?.votes_for || 0}
                        </span>
                      </button>
                      <button
                        onClick={() => handleVote(item.id, "against")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          vote?.user_voted === "against"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-white/5 text-white/40 border border-white/10 hover:text-red-400 hover:border-red-500/20"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <ChevronRight size={12} className="rotate-90" />
                          {vote?.votes_against || 0}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all duration-500"
                      style={{
                        width: `${vote ? ((vote.votes_for / (vote.votes_for + vote.votes_against || 1)) * 100) : 50}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8 bg-white/5 border border-gold/10 rounded-xl p-6 anim-slide-up anim-delay-3">
          <h3 className="text-gold font-medium text-sm mb-3">{t("founder.lounge.perksTitle")}</h3>
          <div className="space-y-2">
            {[
              "founder.lounge.perk1",
              "founder.lounge.perk2",
              "founder.lounge.perk3",
              "founder.lounge.perk4",
              "founder.lounge.perk5",
              "founder.lounge.perk6",
            ].map((key, i) => (
              <div key={i} className="flex items-center gap-2 text-white/50 text-xs">
                <div className="w-1 h-1 rounded-full bg-gold/60" />
                {t(key)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
