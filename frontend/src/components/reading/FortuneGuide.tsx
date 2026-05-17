"use client"
import { motion, AnimatePresence } from "framer-motion"
import type { Intent } from "@/stores/useWizardStore"

const TIPS: Record<number, { avatar: string; name: string; text: string }> = {
  0: {
    avatar: "🧙",
    name: "玄机子",
    text: "出生时辰是命盘的根基，请尽量准确。若不确定时辰，可选择「子时」作为参考。",
  },
  1: {
    avatar: "🔮",
    name: "塔罗灵",
    text: "提问越具体，塔罗给出的指引越清晰。不妨想想最近最困扰你的一件事。",
  },
  2: {
    avatar: "👁",
    name: "相真人",
    text: "面相和手相传得越清晰，AI 分析越精准。建议在自然光下拍摄，不要使用美颜滤镜。",
  },
  3: {
    avatar: "🌟",
    name: "命盘",
    text: "五大命师已准备就绪，点击确认后他们将同步为你推演！",
  },
}

// Intent-specific overrides
const INTENT_TIPS: Record<Intent, Partial<Record<number, { avatar: string; name: string; text: string }>>> = {
  FULL_MULTIMODAL: {
    1: {
      avatar: "🔮",
      name: "塔罗灵",
      text: "完整推命模式：塔罗、面相、手相将同步分析。请先选择塔罗牌并输入你的问题。",
    },
  },
  GENERAL_DAILY: {
    1: {
      avatar: "⚡",
      name: "日常灵",
      text: "日常问事模式：输入你当下的疑惑，塔罗将为你指引方向。",
    },
    3: {
      avatar: "🌟",
      name: "命盘",
      text: "日常问事将结合你的命理底座和塔罗牌，快速给出今日指引。",
    },
  },
  SPECIFIC_EVENT: {
    3: {
      avatar: "🎯",
      name: "格物子",
      text: "事件复盘模式：AI 将结合你的命理底座，为你进行深度的心学命理分析。",
    },
  },
}

interface Props {
  step: number
  intent?: Intent | null
}

export function FortuneGuide({ step, intent }: Props) {
  // Merge default tips with intent-specific overrides
  const base = TIPS[step]
  const override = intent ? INTENT_TIPS[intent]?.[step] : undefined
  const tip = override ? { ...base, ...override } : base

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${step}-${intent}`}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="flex items-start gap-3 mb-6 bg-white/[0.03] border border-white/10 rounded-xl p-4"
      >
        <div className="text-2xl flex-shrink-0">{tip.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gold">{tip.name}</span>
            <span className="text-[10px] text-white/20">· 指引</span>
          </div>
          <p className="text-white/50 text-xs leading-relaxed">{tip.text}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
