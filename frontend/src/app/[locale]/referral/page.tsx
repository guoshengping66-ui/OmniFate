"use client"
export const dynamic = "force-dynamic"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Copy, Check, Users, Gift, Share2, MessageCircle, ExternalLink, X } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

interface ReferralCode {
  code: string
  link: string
}

interface ReferralStats {
  invited_count: number
  rewards_earned: number
}

interface ReferralReward {
  id: string
  referred_user_id: string
  reward_amount: number
  created_at: string
}

export default function ReferralPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { t, localeHref } = useLanguage()
  const [code, setCode] = useState<ReferralCode | null>(null)
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [rewards, setRewards] = useState<ReferralReward[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [applyCode, setApplyCode] = useState("")
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push(localeHref("/login"))
      return
    }

    Promise.all([
      api.get("/api/referrals/my-code").then(r => r.data).catch(() => null),
      api.get("/api/referrals/stats").then(r => r.data).catch(() => null),
      api.get("/api/referrals/rewards").then(r => r.data?.items || []).catch(() => []),
    ]).then(([codeData, statsData, rewardsData]) => {
      setCode(codeData)
      setStats(statsData)
      setRewards(rewardsData)
    }).finally(() => setLoading(false))
  }, [user, authLoading, router])

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(t("referral.copied"))
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApplyCode = async () => {
    if (!applyCode.trim()) {
      toast.error(t("referral.applyEmpty"))
      return
    }
    setApplying(true)
    try {
      await api.post("/api/referrals/apply", { code: applyCode.trim().toUpperCase() })
      toast.success(t("referral.applySuccess"))
      setApplyCode("")
      const statsData = await api.get("/api/referrals/stats").then(r => r.data)
      setStats(statsData)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("referral.applyFail"))
    } finally {
      setApplying(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!user || !code || !stats) return null

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t("referral.breadcrumb") }]} />

        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-gold mb-3">{t("referral.title")}</h1>
          <p className="text-white/50 max-w-md mx-auto">
            {t("referral.desc")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card-glass p-4 text-center">
            <Users size={20} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.invited_count}</p>
            <p className="text-white/30 text-xs">{t("referral.invitedCount")}</p>
          </div>
          <div className="card-glass p-4 text-center">
            <Gift size={20} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-gold">{stats.rewards_earned}</p>
            <p className="text-white/30 text-xs">{t("referral.totalStardust")}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* My Referral Code + Share */}
          <div className="card-glass p-6">
            <h2 className="font-serif text-lg text-gold mb-4">{t("referral.myCode")}</h2>
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <p className="text-3xl font-mono font-bold text-center text-gold tracking-widest">
                {code.code}
              </p>
            </div>

            {/* Copy Link */}
            <button
              onClick={() => handleCopy(code.link)}
              className="w-full btn-gold flex items-center justify-center gap-2 mb-3"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? t("referral.copiedLink") : t("referral.copyLink")}
            </button>

            {/* Share Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {/* WeChat Share */}
              <button
                onClick={() => {
                  handleCopy(code.link)
                  toast.success(t("referral.wechatToast"), { duration: 4000 })
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 transition-all"
              >
                <MessageCircle size={20} className="text-green-400" />
                <span className="text-green-300 text-[10px]">{t("referral.wechatFriends")}</span>
              </button>

              {/* WeChat Moments */}
              <button
                onClick={() => {
                  handleCopy(code.link)
                  toast.success(t("referral.momentsToast"), { duration: 4000 })
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 transition-all"
              >
                <Share2 size={20} className="text-green-400" />
                <span className="text-green-300 text-[10px]">{t("referral.moments")}</span>
              </button>

              {/* General Share / More */}
              <button
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: t("referral.shareTitle"),
                        text: t("referral.shareText"),
                        url: code.link,
                      })
                    } catch { /* user cancelled */ }
                  } else {
                    handleCopy(code.link)
                    toast.success(t("referral.shareToast"))
                  }
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gold/8 border border-gold/15 hover:bg-gold/12 transition-all"
              >
                <ExternalLink size={20} className="text-gold" />
                <span className="text-gold/70 text-[10px]">{t("referral.moreShare")}</span>
              </button>
            </div>
          </div>

          {/* Apply Referral Code */}
          <div className="card-glass p-6">
            <h2 className="font-serif text-lg text-gold mb-4">{t("referral.applyTitle")}</h2>
            <p className="text-white/40 text-sm mb-4">
              {t("referral.applyDesc")}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={applyCode}
                onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                placeholder={t("referral.applyPlaceholder")}
                maxLength={8}
                className="flex-1 input-field font-mono text-center tracking-widest"
              />
              <button
                onClick={handleApplyCode}
                disabled={applying || !applyCode.trim()}
                className="btn-gold-outline px-6"
              >
                {applying ? <Loader2 size={16} className="animate-spin" /> : t("referral.apply")}
              </button>
            </div>
          </div>
        </div>

        {/* Rewards History */}
        {rewards.length > 0 && (
          <div className="card-glass p-6 mt-6">
            <h2 className="font-serif text-lg text-gold mb-4">{t("referral.rewards")}</h2>
            <div className="space-y-3">
              {rewards.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white/60 text-sm">
                      {t("referral.rewardItem").replace("{amount}", String(r.reward_amount))}
                    </p>
                    <p className="text-white/20 text-xs mt-0.5">
                      {new Date(r.created_at).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <span className="text-gold text-sm font-bold">+{r.reward_amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
