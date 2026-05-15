"use client"
import { CelestialOracle } from "@/components/divination/CelestialOracle"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { motion } from "framer-motion"
import { Sparkles, Clock, Gift, Crown } from "lucide-react"

export default function DivinationPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <Breadcrumbs items={[{ label: "星际抽签" }]} />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gold mb-2">星际抽签</h1>
          <p className="text-white/40 text-sm">
            每日首次免费，感受星辰之力为你指引方向
          </p>
        </div>

        <CelestialOracle />

        {/* Phase 2: 抽签规则说明 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-4"
        >
          {/* 规则卡片 */}
          <div className="card-glass p-5">
            <h3 className="text-gold/70 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={12} />
              星际抽签规则
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={12} className="text-gold/60" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">每日首次免费</p>
                  <p className="text-white/30 text-[11px]">每天 0:00 刷新，同一用户当天结果一致</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-gold/60" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">后续每次消耗 1 颗星尘</p>
                  <p className="text-white/30 text-[11px]">星尘不足时可邀请好友获取 20 颗</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Gift size={12} className="text-gold/60" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">分享签文得星尘</p>
                  <p className="text-white/30 text-[11px]">每日最多分享 2 次，每次获得 5 颗星尘</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Crown size={12} className="text-gold/60" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">创始人会员无限抽签</p>
                  <p className="text-white/30 text-[11px]">创始席位享有无限免费抽签特权</p>
                </div>
              </div>
            </div>
          </div>

          {/* 免责声明 */}
          <div className="text-center">
            <p className="text-white/15 text-[11px] leading-relaxed max-w-md mx-auto">
              抽签结果基于王阳明心学智慧与星象能量随机生成，仅供娱乐和自我反思。
              AI 行动指引由算法生成，不构成任何决策建议。命由己造，福自我求。
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
