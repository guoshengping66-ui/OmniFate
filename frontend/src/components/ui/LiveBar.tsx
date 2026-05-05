"use client"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"

const NAMES_ZH = [
  "北京的小美", "上海的阿杰", "广州的莉莉",
  "深圳的浩然", "杭州的梓涵", "成都的思远",
  "南京的雨萱", "武汉的天佑", "重庆的欣怡",
  "长沙的俊豪", "西安的语桐", "苏州的明远",
  "天津的小雪", "郑州的子轩", "青岛的雅琪",
  "厦门的晨曦", "合肥的博文", "昆明的诗涵",
]

const NAMES_EN = [
  "Mei from Beijing", "Jack from Shanghai", "Lily from Guangzhou",
  "Hao from Shenzhen", "Zihan from Hangzhou", "Siyuan from Chengdu",
  "Yuxuan from Nanjing", "Tianyou from Wuhan", "Xinyi from Chongqing",
  "Junhao from Changsha", "Yutong from Xi'an", "Mingyuan from Suzhou",
  "Xiaoxue from Tianjin", "Zixuan from Zhengzhou", "Yaqi from Qingdao",
  "Chenxi from Xiamen", "Bowen from Hefei", "Shihan from Kunming",
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateMessage(isEn: boolean) {
  const names = isEn ? NAMES_EN : NAMES_ZH
  return {
    id: Math.random().toString(36).slice(2, 9),
    name: randomItem(names),
    activityKey: [
      "live.activity1", "live.activity2", "live.activity3", "live.activity4", "live.activity5",
      "live.activity6", "live.activity7", "live.activity8", "live.activity9", "live.activity10",
    ][Math.floor(Math.random() * 10)] as string,
  }
}

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(target - 8 + Math.floor(Math.random() * 16))

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const delta = Math.floor(Math.random() * 5) - 2
        const next = prev + delta
        return Math.max(80, Math.min(200, next))
      })
    }, 2000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])

  return <span className="font-mono tabular-nums">{count}</span>
}

export function LiveBar() {
  const { t, locale } = useLanguage()
  const isEn = locale === "en"
  const [messages, setMessages] = useState(() => [
    generateMessage(isEn),
    generateMessage(isEn),
    generateMessage(isEn),
  ])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 3000)

    const interval = setInterval(() => {
      setMessages(prev => {
        const next = [...prev]
        const replaceIdx = Math.floor(Math.random() * 3)
        next[replaceIdx] = generateMessage(isEn)
        return next
      })
    }, 3500)

    const hideTimer = setTimeout(() => setVisible(false), 180000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
      clearInterval(interval)
    }
  }, [isEn])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden sm:block w-[90vw] max-w-2xl"
        >
          <div className="relative overflow-hidden rounded-2xl bg-ink/80 backdrop-blur-xl border border-gold/20 shadow-[0_0_40px_rgba(201,168,76,0.08)]">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.8) 50%, transparent 100%)",
                  animation: "shimmer-slide 4s ease-in-out infinite",
                }}
              />
            </div>

            <div className="relative flex items-stretch">
              {/* Left: activity messages */}
              <div className="flex-1 px-5 py-3 space-y-1">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-2.5"
                    >
                      <span className="relative flex h-2 w-2 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                      </span>
                      <span className="text-white/50 text-xs whitespace-nowrap">
                        <span className="text-gold font-medium">{msg.name}</span>
                        {" "}{t(msg.activityKey as any)}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Right: concurrent counter */}
              <div className="flex items-center gap-2 px-4 border-l border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-ink bg-gradient-to-br from-gold/60 to-gold/30"
                        style={{ zIndex: 3 - i }}
                      />
                    ))}
                  </div>
                  <div className="text-xs">
                    <span className="text-gold font-semibold">
                      <AnimatedCounter target={127} />
                    </span>
                    <span className="text-white/30 ml-0.5">{t("live.people")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
