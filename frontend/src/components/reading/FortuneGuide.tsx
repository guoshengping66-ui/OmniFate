"use client"
import { motion, AnimatePresence } from "framer-motion"

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

interface Props {
  step: number
}

export function FortuneGuide({ step }: Props) {
  const tip = TIPS[step]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
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
