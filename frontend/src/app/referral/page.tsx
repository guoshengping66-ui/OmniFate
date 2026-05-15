"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Copy, Check, Users, Gift, Share2, MessageCircle, ExternalLink, X } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
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
      await api.post("/api/referrals/apply", { code: applyCode.trim().toUpperCase() })
      toast.success("邀请码使用成功！获得 20 星尘奖励")
      setApplyCode("")
      const statsData = await api.get("/api/referrals/stats").then(r => r.data)
      setStats(statsData)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "邀请码无效")
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
        <Breadcrumbs items={[{ label: "星盟邀请" }]} />

        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-gold mb-3">星盟邀请</h1>
          <p className="text-white/50 max-w-md mx-auto">
            邀请好友加入命盘智镜，双方各获得 20 星尘奖励
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card-glass p-4 text-center">
            <Users size={20} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.invited_count}</p>
            <p className="text-white/30 text-xs">已邀请人数</p>
          </div>
          <div className="card-glass p-4 text-center">
            <Gift size={20} className="text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-gold">{stats.rewards_earned}</p>
            <p className="text-white/30 text-xs">累计获得星尘</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* My Referral Code + Share */}
          <div className="card-glass p-6">
            <h2 className="font-serif text-lg text-gold mb-4">我的邀请码</h2>
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
              {copied ? "已复制邀请链接" : "复制邀请链接"}
            </button>

            {/* Share Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {/* WeChat Share */}
              <button
                onClick={() => {
                  // 生成微信分享用的链接（微信内打开会自动识别）
                  handleCopy(code.link)
                  toast.success("链接已复制，打开微信粘贴发送给好友", { duration: 4000 })
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 transition-all"
              >
                <MessageCircle size={20} className="text-green-400" />
                <span className="text-green-300 text-[10px]">微信好友</span>
              </button>

              {/* WeChat Moments */}
              <button
                onClick={() => {
                  handleCopy(code.link)
                  toast.success("链接已复制，打开微信朋友圈粘贴分享", { duration: 4000 })
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 transition-all"
              >
                <Share2 size={20} className="text-green-400" />
                <span className="text-green-300 text-[10px]">朋友圈</span>
              </button>

              {/* General Share / More */}
              <button
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: "命盘智镜 - AI 命理分析",
                        text: "我发现了一个很准的 AI 命理分析平台，用我的邀请码注册可以免费获得 20 星尘！",
                        url: code.link,
                      })
                    } catch { /* user cancelled */ }
                  } else {
                    handleCopy(code.link)
                    toast.success("链接已复制，可粘贴到任意社交平台分享")
                  }
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gold/8 border border-gold/15 hover:bg-gold/12 transition-all"
              >
                <ExternalLink size={20} className="text-gold" />
                <span className="text-gold/70 text-[10px]">更多分享</span>
              </button>
            </div>
          </div>

          {/* Apply Referral Code */}
          <div className="card-glass p-6">
            <h2 className="font-serif text-lg text-gold mb-4">使用邀请码</h2>
            <p className="text-white/40 text-sm mb-4">
              如果你有朋友的邀请码，在这里输入即可获得 20 星尘奖励
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={applyCode}
                onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                placeholder="输入邀请码"
                maxLength={8}
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
                      成功邀请好友 +{r.reward_amount} 星尘
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
