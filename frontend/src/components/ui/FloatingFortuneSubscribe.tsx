"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, ChevronRight, Check } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRouter } from "next/navigation"

// ── LocalStorage Key ──────────────────────────────────────────────────────
const FREQ_KEY = "destiny_mirror_fortune_freq"

type FreqChoice = "weekly" | "daily" | "off"

function loadFreq(): FreqChoice {
  try { return (localStorage.getItem(FREQ_KEY) as FreqChoice) || "weekly" } catch { return "weekly" }
}
function saveFreq(f: FreqChoice) { localStorage.setItem(FREQ_KEY, f) }

// ── Locale-aware data ────────────────────────────────────────────────────
const DAY_LABELS = { zh: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"], en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }

const THEMES = {
  zh: ["贵人相助，主动出击", "稳中求进，蓄势待发", "桃花运旺，感情升温", "财运亨通，把握时机", "注意健康，劳逸结合", "学习充电，厚积薄发"],
  en: ["Seek allies, take initiative", "Steady progress, build momentum", "Romance blooms, relationships deepen", "Financial flow, seize the moment", "Mind your health, balance rest", "Learn & grow, invest in yourself"],
}
const TAROT_NAMES = {
  zh: ["正位太阳", "正位皇后", "正位魔术师", "正位力量", "正位星辰", "正位世界"],
  en: ["Sun (Upright)", "Empress (Upright)", "Magician (Upright)", "Strength (Upright)", "Star (Upright)", "World (Upright)"],
}
const TAROT_DESCS = {
  zh: ["光明与活力的一周，保持积极心态将迎来好运", "丰盛与创造的一周，适合开展新计划", "灵活应变的一周，你的才华将被看见", "内在力量的一周，坚定信念克服困难", "希望与灵感的一周，跟随直觉前进", "圆满与成就的一周，收获即将到来"],
  en: ["A week of light and vitality — stay positive and好运 will follow", "A week of abundance and creation — ideal for launching new plans", "A week of adaptability — your talents will be recognized", "A week of inner strength — stay firm and overcome challenges", "A week of hope and inspiration — follow your intuition", "A week of fulfillment — rewards are on their way"],
}
const YI_ITEMS = {
  zh: ["出行", "签约", "求财", "会友", "学习", "祈福", "开工"],
  en: ["Travel", "Sign contracts", "Seek wealth", "Meet friends", "Study", "Pray", "Start work"],
}
const JI_ITEMS = {
  zh: ["动土", "远行", "争吵", "熬夜", "冒险", "搬迁", "借贷"],
  en: ["Groundbreaking", "Long travel", "Arguments", "Stay up late", "Take risks", "Move house", "Lend money"],
}
const LUCKY_COLORS = {
  zh: ["翠绿", "金色", "红色", "蓝色", "紫色", "粉色"],
  en: ["Emerald", "Gold", "Red", "Blue", "Purple", "Pink"],
}
const LUCKY_DIRECTIONS = {
  zh: ["正东方", "正南方", "正西方", "正北方", "东南方", "西北方"],
  en: ["East", "South", "West", "North", "Southeast", "Northwest"],
}
const AI_INSIGHTS = {
  zh: [
    "本周{yi}运势旺盛，结合你的八字日主分析，建议把握周中黄金时段推进重要事务。周末宜休整，为下周蓄力。",
    "本周{yi}运势平稳，五行调和，适合按部就班推进计划。注意周五可能有小波折。",
    "本周{ji}需谨慎，但{yi}运强劲，可主动出击。保持心态平和，好运自来。",
  ],
  en: [
    "This week's {yi} fortune is strong. Based on your BaZi chart, we recommend tackling important tasks mid-week. Rest on the weekend to recharge.",
    "This week's {yi} fortune is steady with balanced Five Elements. Stick to your plan. Watch out for minor setbacks on Friday.",
    "Be cautious with {ji} this week, but {yi} luck is strong — take initiative. Stay calm and好运 will come naturally.",
  ],
}

function pick<T>(arr: T[], hash: number): T { return arr[Math.floor(hash * arr.length)] }

function generateWeeklyPreview(locale: "zh" | "en") {
  const today = new Date()
  const seed = today.getFullYear() * 100 + today.getMonth() * 10 + today.getDate()
  const hash = (n: number) => { const x = Math.sin(seed * 9301 + n * 49297) * 49297; return x - Math.floor(x) }
  const score = Math.round(Math.max(4, Math.min(10, 6 + (hash(1) - 0.5) * 6)))

  const yi: string[] = [], ji: string[] = [], daily: { yi: string; ji: string }[] = []
  for (let i = 0; i < 3; i++) {
    yi.push(YI_ITEMS[locale][Math.floor(hash(10 + i) * YI_ITEMS[locale].length)])
    ji.push(JI_ITEMS[locale][Math.floor(hash(20 + i) * JI_ITEMS[locale].length)])
  }
  for (let d = 0; d < 7; d++) {
    daily.push({
      yi: YI_ITEMS[locale][Math.floor(hash(30 + d) * YI_ITEMS[locale].length)],
      ji: JI_ITEMS[locale][Math.floor(hash(40 + d) * JI_ITEMS[locale].length)],
    })
  }

  const insight = pick(AI_INSIGHTS[locale], hash(8))
    .replace("{yi}", yi[0])
    .replace("{ji}", ji[0])

  return {
    score,
    theme: pick(THEMES[locale], hash(5)),
    yi, ji, daily,
    tarot: pick(TAROT_NAMES[locale], hash(6)),
    tarotDesc: pick(TAROT_DESCS[locale], hash(7)),
    luckyColor: pick(LUCKY_COLORS[locale], hash(9)),
    luckyNumber: `${Math.floor(hash(100) * 9) + 1}, ${Math.floor(hash(101) * 9) + 1}`,
    luckyDirection: pick(LUCKY_DIRECTIONS[locale], hash(10)),
    aiInsight: insight,
  }
}

// ── Main Component ──────────────────────────────────────────────────────
export function FloatingFortuneSubscribe() {
  const [open, setOpen] = useState(false)
  const [freq, setFreq] = useState<FreqChoice>(loadFreq)
  const [saved, setSaved] = useState(false)
  const { user } = useAuth()
  const { t, locale, localeHref } = useLanguage()
  const router = useRouter()

  const isZH = locale === "zh"
  const preview = generateWeeklyPreview(isZH ? "zh" : "en")
  const dayLabels = isZH ? DAY_LABELS.zh : DAY_LABELS.en
  const scoreColor = preview.score >= 8 ? "#4ade80" : preview.score >= 6 ? "#C9A84C" : preview.score >= 4 ? "#fb923c" : "#f87171"
  const yiLabel = isZH ? "宜" : "Do"
  const jiLabel = isZH ? "忌" : "Don't"

  const handleSave = () => {
    saveFreq(freq)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="fixed bottom-6 right-6 z-40 hidden sm:block"
      >
        <button
          onClick={() => setOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full
                     bg-gradient-to-r from-gold/20 to-gold/5
                     border border-gold/25 hover:border-gold/50
                     hover:shadow-[0_0_24px_rgba(201,168,76,0.25)]
                     transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-full bg-gold/10 animate-[pulse_3s_ease-in-out_infinite] pointer-events-none" />
          <div className="relative flex items-center gap-2">
            <Sparkles size={14} className="text-gold group-hover:animate-spin" />
            <span className="text-gold text-xs font-medium">{t("fortuneSub.label")}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 text-[10px] font-bold">
              {t("fortuneSub.badge")}
            </span>
          </div>
        </button>
      </motion.div>

      {/* ── Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="card-glass w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl p-6 space-y-5"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-gold" />
                  <h3 className="font-serif text-lg text-gold font-bold">{t("fortuneSub.title")}</h3>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">{t("fortuneSub.desc")}</p>

              {/* Frequency Selector */}
              <div className="space-y-2">
                <p className="text-white/50 text-xs font-medium">{t("fortuneSub.frequency")}</p>
                <div className="flex gap-2">
                  {([
                    { key: "weekly" as const, label: t("fortuneSub.freqWeekly") },
                    { key: "daily" as const, label: t("fortuneSub.freqDaily") },
                    { key: "off" as const, label: t("fortuneSub.freqOff") },
                  ]).map(o => (
                    <button
                      key={o.key}
                      onClick={() => setFreq(o.key)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                        freq === o.key
                          ? o.key === "off"
                            ? "bg-white/5 text-white/40 border border-white/10"
                            : "bg-gold/10 text-gold border border-gold/30"
                          : "bg-white/[0.03] text-white/30 border border-white/[0.06] hover:text-white/50"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {freq !== "off" && (
                <>
                  {/* ── Preview Card ──────────────────────────────────── */}
                  <div className="bg-white/[0.03] rounded-2xl p-5 space-y-4 border border-white/[0.06]">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider">{t("fortuneSub.previewHint")}</p>

                    {/* Score + Theme */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                          <circle cx="32" cy="32" r="26" fill="none" stroke={scoreColor} strokeWidth="4"
                            strokeLinecap="round" strokeDasharray={`${(preview.score / 10) * 163.36} 163.36`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold font-serif" style={{ color: scoreColor }}>{preview.score}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/50 text-[10px] mb-0.5">{t("fortuneSub.overallScore")}</p>
                        <p className="text-gold text-sm font-medium">{preview.theme}</p>
                      </div>
                    </div>

                    {/* Lucky items */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-white/30">{t("fortuneSub.luckyColor")}:</span>
                        <span className="text-green-400/80 font-medium">{preview.luckyColor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/30">{t("fortuneSub.luckyNumber")}:</span>
                        <span className="text-gold font-medium">{preview.luckyNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/30">{t("fortuneSub.luckyDirection")}:</span>
                        <span className="text-blue-400/80 font-medium">{preview.luckyDirection}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/30">{t("fortuneSub.tarotCard")}:</span>
                        <span className="text-purple-400/80 font-medium">{preview.tarot}</span>
                      </div>
                    </div>

                    {/* Tarot description */}
                    <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-3">
                      <p className="text-purple-300/70 text-xs leading-relaxed">{preview.tarotDesc}</p>
                    </div>

                    {/* Daily Yi Ji preview (first 3 days) */}
                    <div>
                      <p className="text-white/30 text-[10px] mb-2">{t("fortuneSub.dailyYiJi")}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {preview.daily.slice(0, 3).map((d, i) => (
                          <div key={i} className="bg-white/[0.03] rounded-lg p-2 text-center">
                            <p className="text-white/40 text-[10px] mb-1">{dayLabels[i]}</p>
                            <p className="text-green-400/70 text-[10px]">{yiLabel} {d.yi}</p>
                            <p className="text-red-400/50 text-[10px]">{jiLabel} {d.ji}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Insight Preview */}
                  <div className="card-glass p-4 flex items-start gap-3">
                    <span className="text-base flex-shrink-0">🤖</span>
                    <p className="text-white/40 text-xs leading-relaxed">{preview.aiInsight}</p>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-1">
                {freq !== "off" ? (
                  <button
                    onClick={handleSave}
                    className="flex-1 btn-gold py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    {saved ? <><Check size={14} /> {t("fortuneSub.subscribed")} </> : <>{t("fortuneSub.subscribe")} <ChevronRight size={14} /></>}
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/50 text-sm hover:text-white/70 transition-colors"
                  >
                    {saved ? t("fortuneSub.subscribed") : t("fortuneSub.unsubscribe")}
                  </button>
                )}
                {!user && (
                  <button
                    onClick={() => { setOpen(false); router.push(localeHref("/divination")) }}
                    className="px-4 py-2.5 rounded-xl border border-gold/20 text-gold/70 text-sm hover:text-gold hover:border-gold/40 transition-colors flex items-center gap-1"
                  >
                    {t("fortuneSub.goReading")} <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
