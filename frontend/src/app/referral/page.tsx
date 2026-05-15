"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Copy, Check, Users, Gift, Share2, Star } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

interface ReferralStats {
  invited_count: number
  max_referrals: number
  rewards_claimed: number
  pending_rewards: number
  can_invite: boolean
}

interface ReferralCode {
  referral_code: string
  referral_link: string
}

interface ReferralReward {
  id: string
  referred_user_id: string
  reward_type: string
  reward_value: number
  is_claimed: boolean
  created_at: string
}

export default function ReferralPage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()
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
      router.push("/login")
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
    toast.success("已复制到剪贴板")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApplyCode = async () => {
    if (!applyCode.trim()) {
      toast.error("请输入邀请码")
      return
    }
    setApplying(true)
    try {
      await api.post("/api/referrals/apply", { referral_code: applyCode.trim().toUpperCase() })
      toast.success("邀请码使用成功！")
      setApplyCode("")
      // Refresh stats
      const statsData = await api.get("/api/referrals/stats").then(r => r.data)
      setStats(statsData)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "邀请码无效")
    } finally {
      setApplying(false)
    }
  }

  const handleClaimReward = async (rewardId: string) => {
    try {
      await api.post(`/api/referrals/claim-reward/${rewardId}`)
      toast.success("奖励已领取！")
      // Refresh rewards
      const rewardsData = await api.get("/api/referrals/rewards").then(r => r.data?.items || [])
      setRewards(rewardsData)
      await refreshUser()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "领取失败")
    }
  }

  const handleShare = (platform: string) => {
    if (!code) return
    const text = "我在用命盘智镜做命理分析，邀请你一起来体验！"
    const url = code.referral_link

    switch (platform) {
      case "wechat":
        // 复制链接，让用户去微信分享
        handleCopy(url)
        toast.success("链接已复制，请打开微信分享")
        break
      case "weibo":
        window.open(`https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`, "_blank")
        break
      case "copy":
        handleCopy(url)
        break
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
        <Breadcrumbs items={[{ label: "星盟邀请" }]} />

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gold mb-3">
            星盟邀请
          </h1>
          <p className="text-white/50 max-w-md mx-auto">
            邀请好友加入命盘智镜，双方均可获得丰厚奖励
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-glass p-4 text-center">
            <Users size={20} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.invited_count}</p>
            <p className="text-white/30 text-xs">已邀请人数</p>
          </div>
          <div className="card-glass p-4 text-center">
            <Gift size={20} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.rewards_claimed}</p>
            <p className="text-white/30 text-xs">已领取奖励</p>
          </div>
          <div className="card-glass p-4 text-center">
            <Star size={20} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-gold">{stats.pending_rewards}</p>
            <p className="text-white/30 text-xs">待领取奖励</p>
          </div>
          <div className="card-glass p-4 text-center">
            <Share2 size={20} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.max_referrals - stats.invited_count}</p>
            <p className="text-white/30 text-xs">剩余邀请名额</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* My Referral Code */}
          <div className="card-glass p-6">
            <h2 className="font-serif text-lg text-gold mb-4">我的邀请码</h2>
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <p className="text-3xl font-mono font-bold text-center text-gold tracking-widest">
                {code.referral_code}
              </p>
            </div>
            <button
              onClick={() => handleCopy(code.referral_link)}
              className="w-full btn-gold flex items-center justify-center gap-2"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "已复制" : "复制邀请链接"}
            </button>

            {/* Share buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleShare("wechat")}
                className="flex-1 py-2 px-3 rounded-xl bg-green-600/20 text-green-400 text-sm hover:bg-green-600/30 transition-colors"
              >
                微信分享
              </button>
              <button
                onClick={() => handleShare("weibo")}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600/20 text-red-400 text-sm hover:bg-red-600/30 transition-colors"
              >
                微博分享
              </button>
              <button
                onClick={() => handleShare("copy")}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 text-white/60 text-sm hover:bg-white/20 transition-colors"
              >
                复制链接
              </button>
            </div>
          </div>

          {/* Apply Referral Code */}
          <div className="card-glass p-6">
            <h2 className="font-serif text-lg text-gold mb-4">使用邀请码</h2>
            <p className="text-white/40 text-sm mb-4">
              如果你有朋友的邀请码，在这里输入即可建立邀请关系
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={applyCode}
                onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                placeholder="输入邀请码"
                maxLength={6}
                className="flex-1 input-field font-mono text-center tracking-widest"
              />
              <button
                onClick={handleApplyCode}
                disabled={applying || !applyCode.trim()}
                className="btn-gold-outline px-6"
              >
                {applying ? <Loader2 size={16} className="animate-spin" /> : "使用"}
              </button>
            </div>

            {/* Reward Rules */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-white/60 mb-3">邀请奖励规则</h3>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="flex items-start gap-2">
                  <span className="text-gold mt-0.5">•</span>
                  <span>被邀请人首次付费 → 你获得 <strong className="text-gold">3天会员试用</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold mt-0.5">•</span>
                  <span>被邀请人订阅会员 → 你获得 <strong className="text-gold">10%精准度提升</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold mt-0.5">•</span>
                  <span>每人最多邀请 <strong className="text-gold">50</strong> 人</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Rewards History */}
        {rewards.length > 0 && (
          <div className="card-glass p-6 mt-6">
            <h2 className="font-serif text-lg text-gold mb-4">奖励记录</h2>
            <div className="space-y-3">
              {rewards.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white/60 text-sm">
                      {r.reward_type === "trial_days" ? "会员试用" : "精准度提升"}
                      <span className="text-gold ml-1">
                        {r.reward_type === "trial_days" ? `${r.reward_value}天` : `+${r.reward_value}%`}
                      </span>
                    </p>
                    <p className="text-white/20 text-xs mt-0.5">
                      {new Date(r.created_at).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  {r.is_claimed ? (
                    <span className="text-green-400 text-xs">已领取</span>
                  ) : (
                    <button
                      onClick={() => handleClaimReward(r.id)}
                      className="text-gold text-xs hover:underline"
                    >
                      领取
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
