"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2, Sparkles, Zap } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

interface DivinationData {
  id: string
  fortune: string
  fortune_level: number
  wisdom_quote: string
  author: string
  theme: string
  user_name: string
  seat_no: number | null
  referral_code: string | null
}

const FORTUNE_COLORS: Record<string, string> = {
  "大吉": "from-gold to-[#E8CB7A]",
  "中吉": "from-green-400 to-emerald-300",
  "小吉": "from-blue-400 to-cyan-300",
  "吉": "from-teal-400 to-cyan-400",
  "末吉": "from-yellow-500 to-amber-400",
  "凶": "from-orange-500 to-red-400",
  "大凶": "from-red-500 to-rose-400",
}

export default function DivinationSharePage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<DivinationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/divination/share/${id}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <p className="text-white/40">签文不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4 py-12">
      {/* Black-gold card */}
      <div className="w-full max-w-sm">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1510] via-[#0d0b08] to-[#1a1510]" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

          <div className="relative p-8 text-center">
            {/* App branding */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles size={16} className="text-gold" />
              <span className="font-serif text-gold text-sm">命盘智镜 · 星际抽签</span>
            </div>

            {/* Fortune badge */}
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-8 py-4 rounded-full
                            bg-gradient-to-r ${FORTUNE_COLORS[data.fortune] || "from-gold to-[#E8CB7A]"}
                            text-ink font-bold text-3xl`}>
                {data.fortune}
              </div>
            </div>

            {/* Theme */}
            {data.theme && (
              <p className="text-gold/60 text-sm mb-6">今日主题：{data.theme}</p>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              <Sparkles size={12} className="text-gold/40" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </div>

            {/* Wisdom quote */}
            <div className="mb-6">
              <p className="text-white/70 text-sm leading-relaxed italic">
                "{data.wisdom_quote}"
              </p>
              <p className="text-gold/50 text-xs mt-3">—— {data.author}</p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              <Zap size={12} className="text-gold/40" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </div>

            {/* User info / Founder badge */}
            <div className="mb-6">
              {data.seat_no && (
                <div className="inline-flex items-center gap-1.5 text-gold/60 text-xs mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  创始席位 #{data.seat_no}
                </div>
              )}
              {data.user_name && (
                <p className="text-white/30 text-xs">{data.user_name} 的签文</p>
              )}
            </div>

            {/* Referral CTA */}
            {data.referral_code && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white/40 text-xs mb-2">输入邀请码，双方各得 20 星尘</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-gold text-lg tracking-widest">{data.referral_code}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full
                       bg-gold/10 border border-gold/30 text-gold text-sm
                       hover:bg-gold/20 transition-all"
            >
              <Sparkles size={14} />
              探索我的命盘
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
