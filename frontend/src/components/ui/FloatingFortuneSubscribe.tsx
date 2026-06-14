"use client"
import { useState, useEffect } from "react"
import { Sparkles, X, ChevronRight, Check, Calendar, Clock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
  subscribeFortune,
  getFortuneSubscription,
  getWeeklyFortune,
  getFortuneDaily,
  type WeeklyFortuneResponse,
  type FortuneDailyResponse,
} from "@/lib/api"

// ── Locale-aware data ────────────────────────────────────────────────────
const DAY_LABELS = { zh: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"], en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }

// ── ZH→EN translation maps (fallback when backend returns Chinese) ──────
const ZH_EN: Record<string, string> = {
  // Themes (daily)
  "宜静不宜动": "Stay calm, act less", "行动力满满": "Day of action",
  "灵感涌现日": "Inspiration day", "稳扎稳打": "Steady and solid",
  "贵人临门": "Helpful people arrive", "桃花悄然至": "Romance sneaks in",
  "财运小高峰": "Financial peak", "适合独处充电": "Great day to recharge",
  "社交好日子": "Good social day", "事业突破口": "Career breakthrough",
  "学习黄金期": "Learning day", "家庭和睦": "Family harmony",
  // Themes (weekly)
  "贵人相助，主动出击": "Seek allies, take initiative",
  "稳中求进，蓄势待发": "Steady progress, build momentum",
  "感情升温，关系深化": "Romance blooms, relationships deepen",
  "财运亨通，把握时机": "Financial flow, seize the moment",
  "注意健康，劳逸结合": "Mind your health, balance rest",
  "学习充电，厚积薄发": "Learn & grow, invest in yourself",
  "创新突破，勇往直前": "Innovate and break through",
  "人际关系和谐，合作顺利": "Harmonious relationships, smooth cooperation",
  // Colors
  "翠绿": "Emerald", "金色": "Gold", "红色": "Red", "蓝色": "Blue",
  "紫色": "Purple", "粉色": "Pink", "橙色": "Orange", "银色": "Silver",
  // Directions
  "正东方": "East", "正南方": "South", "正西方": "West", "正北方": "North",
  "东南方": "Southeast", "西北方": "Northwest", "东北方": "Northeast", "西南方": "Southwest",
  // Daily tarot names
  "正位愚者": "Fool (Upright)", "正位魔术师": "Magician (Upright)",
  "正位女祭司": "High Priestess (Upright)", "正位皇后": "Empress (Upright)",
  "正位皇帝": "Emperor (Upright)", "正位教皇": "Hierophant (Upright)",
  "正位恋人": "Lovers (Upright)", "正位战车": "Chariot (Upright)",
  "正位力量": "Strength (Upright)", "正位隐者": "Hermit (Upright)",
  "正位命运之轮": "Wheel of Fortune (Upright)", "正位正义": "Justice (Upright)",
  // Weekly tarot names
  "正位太阳": "Sun (Upright)", "正位星辰": "Star (Upright)",
  "正位世界": "World (Upright)",
  // Daily tarot descs
  "新的开始，勇敢迈出第一步": "A fresh start — take the first brave step",
  "创造力爆棚，今天适合展示才华": "Creativity peaks — show your talents today",
  "直觉敏锐，倾听内心的声音": "Sharp intuition — listen to your inner voice",
  "温柔而有力量的一天，适合照顾他人": "Gentle strength — a day for caring for others",
  "权威与掌控，今天适合做重要决定": "Authority and control — make important decisions",
  "智慧指引方向，跟随经验前行": "Wisdom guides — follow your experience",
  "心与心的连接，今天适合表达感情": "Heart-to-heart connection — express your feelings",
  "意志力强大，克服障碍的最佳时机": "Strong willpower — perfect time to overcome obstacles",
  "内在力量充沛，相信自己能做到": "Inner strength overflows — believe in yourself",
  "独处思考，今天适合沉淀和复盘": "Solitude for reflection — review and recalibrate",
  "命运之轮转动，变化即将到来": "The wheel turns — change is coming",
  "公平与公正，今天适合处理法律事务": "Fairness and justice — handle legal matters today",
  // Weekly tarot descs
  "光明与活力的一周，保持积极心态将迎来好运": "A week of light and vitality — stay positive and good fortune will follow",
  "丰盛与创造的一周，适合开展新计划": "A week of abundance and creation — ideal for launching new plans",
  "灵活应变的一周，你的才华将被看见": "A week of adaptability — your talents will be recognized",
  "内在力量的一周，坚定信念克服困难": "A week of inner strength — stay firm and overcome challenges",
  "希望与灵感的一周，跟随直觉前进": "A week of hope and inspiration — follow your intuition",
  "圆满与成就的一周，收获即将到来": "A week of fulfillment — rewards are on their way",
  "爱情与选择的一周，听从内心": "A week of love and choices — listen to your heart",
  "勇往直前的一周，行动力是关键": "A week of bold action — momentum is your ally",
  // Yi items
  "出行": "Travel", "签约": "Sign contracts", "求财": "Seek wealth",
  "会友": "Meet friends", "学习": "Study", "祈福": "Pray",
  "开工": "Start work", "面试": "Interview",
  // Ji items
  "动土": "Groundbreaking", "远行": "Long travel", "争吵": "Arguments",
  "熬夜": "Stay up late", "冒险": "Take risks", "搬迁": "Move house",
  "借贷": "Lend money", "高风险投资": "High-risk investment",
  // Insight sentence fragments (daily)
  "今日": "Today ", "运势旺盛": "fortune is strong",
  "方面需谨慎": " area needs caution", "之事暂缓": " matters — wait",
  "方面要留心": " area needs attention", "避免冲动": "avoid impulsiveness",
  "方面按计划进行即可": " area — proceed as planned",
  "保持内心平静": "stay calm",
  "把握上午黄金时段": "seize the morning prime time",
  "午后稍作休息": "Rest in the afternoon",
  "晚间宜与家人相聚": "gather with family in the evening",
  "注意控制情绪": "Control emotions",
  "适合推进搁置已久的计划": "ideal for reviving stalled plans",
  "方向有意外惊喜": " direction holds surprises",
  "保持谦虚态度": "Stay humble",
  "整体运势平稳": "overall fortune is steady",
  "今日整体运势平稳": "Steady day overall",
  "相关事务进展顺利": "matters progress smoothly",
  "今日贵人运强": "Strong ally luck",
  "今日五行木气旺盛": "Wood element dominates today",
  "今日{yi}运势旺盛": "Today's {yi} fortune is strong",
  "今日{yi}运极佳": "Excellent {yi} luck today",
  "今日贵人运强，{yi}方向有意外惊喜。保持谦虚态度，{ji}之事暂缓。":
    "Strong ally luck — the {yi} direction holds surprises. Stay humble, postpone {ji} matters.",
  // Insight sentence fragments (weekly)
  "本周": "This week's ",
  "运势平稳": "outlook is steady", "整体协调": "overall balanced",
  "适合按部就班推进计划": "ideal for sticking to your plan",
  "注意周五可能有小波折": "Watch out for minor setbacks on Friday",
  "周末宜休整，为下周蓄力": "Rest on the weekend to recharge for next week",
  "需谨慎": "needs caution", "运强劲": "energy is strong",
  "可主动出击": "take initiative",
  "保持心态平和，好运自来": "Stay calm and good things will come naturally",
  "整体流向对你有利": "The overall flow favors you",
  "方向有贵人出现": "direction holds allies",
  "建议多社交，拓展人脉": "Expand your network",
  "需注意": "Watch out for",
  "整体运势向好": "overall outlook is positive",
  "保持耐心，好事多磨": "Patience is key — good things take time",
  "周五": "Friday", "小波折": "minor setbacks",
}
/** Translate a value or, for long insight sentences, do phrase-level replacement */
const tr = (val: string, toEn: boolean) => {
  if (!val || !toEn) return val
  // Full sentence match first
  if (ZH_EN[val]) return ZH_EN[val]
  // For insight sentences: replace known Chinese words/phrases left-to-right
  let out = val
  // Sort keys longest-first so "高风险投资" matches before "投资"
  const sortedKeys = Object.keys(ZH_EN).sort((a, b) => b.length - a.length)
  for (const zh of sortedKeys) {
    if (out.includes(zh)) out = out.replaceAll(zh, ZH_EN[zh])
  }
  return out
}

// ── Main Component ──────────────────────────────────────────────────────
export function FloatingFortuneSubscribe() {
  const [open, setOpen] = useState(false)
  const [freq, setFreq] = useState<string>("weekly")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fortune, setFortune] = useState<WeeklyFortuneResponse | null>(null)
  const [dailyFortune, setDailyFortune] = useState<FortuneDailyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { t, locale, localeHref } = useLanguage()
  const router = useRouter()

  const isZH = locale === "zh"
  const dayLabels = isZH ? DAY_LABELS.zh : DAY_LABELS.en
  const currentScore = freq === "daily" ? (dailyFortune?.score ?? 6) : (fortune?.score ?? 6)
  const scoreColor = currentScore >= 8 ? "#4ade80" : currentScore >= 6 ? "#C9A84C" : currentScore >= 4 ? "#fb923c" : "#f87171"
  const yiLabel = isZH ? "宜" : "Do"
  const jiLabel = isZH ? "忌" : "Don't"

  // Load subscription status and daily profile on mount; re-fetch when locale changes
  useEffect(() => {
    if (!open) return
    loadData()
  }, [open, locale])

  async function loadData() {
    setLoading(true)
    try {
      if (user) {
        const sub = await getFortuneSubscription()
        setFreq(sub.frequency)
        setIsSubscribed(sub.is_active && sub.frequency !== "off")
      }
      // Load both weekly and daily profile so preview switches instantly on frequency change
      const [w, d] = await Promise.all([
        getWeeklyFortune(locale).catch(() => null),
        getFortuneDaily(locale).catch(() => null),
      ])
      setFortune(w)
      setDailyFortune(d)
    } catch (err) {
      console.error("Failed to load profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast.error(t("auth.loginRequired"))
      return
    }
    setSaving(true)
    try {
      await subscribeFortune(freq)
      setIsSubscribed(freq !== "off")
      toast.success(freq === "off" ? t("fortuneSub.unsubscribed") : t("fortuneSub.success"))
    } catch (err) {
      toast.error(t("account.profileSaveFail"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────── */}
      <div
        className="fixed bottom-6 right-6 z-40 hidden sm:block"
        style={{
          animation: "fortuneBtnIn 0.5s ease-out 2s both",
        }}
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
      </div>

      {/* ── Modal ───────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          style={{
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            className="card-glass w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl p-6 space-y-5"
            style={{
              animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
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
                  { key: "weekly", label: t("fortuneSub.freqWeekly") },
                  { key: "daily", label: t("fortuneSub.freqDaily") },
                  { key: "off", label: t("fortuneSub.freqOff") },
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

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            )}

            {/* Profile Preview */}
            {!loading && (fortune || dailyFortune) && freq !== "off" && (
              <>
                <div className="bg-white/[0.03] rounded-2xl p-5 space-y-4 border border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    {freq === "daily" ? <Calendar size={12} className="text-gold/50" /> : <Clock size={12} className="text-gold/50" />}
                    <p className="text-white/30 text-[10px] uppercase tracking-wider">
                      {freq === "daily" ? t("fortuneSub.dailyPreview") : t("fortuneSub.weeklyPreview")}
                    </p>
                  </div>

                  {/* Score + Theme */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                        <circle cx="32" cy="32" r="26" fill="none" stroke={scoreColor} strokeWidth="4"
                          strokeLinecap="round" strokeDasharray={`${(currentScore / 10) * 163.36} 163.36`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold font-serif" style={{ color: scoreColor }}>{freq === "daily" ? dailyFortune?.score : fortune?.score}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/50 text-[10px] mb-0.5">{t("fortuneSub.overallScore")}</p>
                      <p className="text-gold text-sm font-medium">{freq === "daily" ? tr(dailyFortune?.theme ?? "", !isZH) : tr(fortune?.theme ?? "", !isZH)}</p>
                    </div>
                  </div>

                  {/* Lucky items */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{t("fortuneSub.luckyColor")}:</span>
                      <span className="text-green-400/80 font-medium">{freq === "daily" ? tr(dailyFortune?.lucky_color ?? "", !isZH) : tr(fortune?.lucky_color ?? "", !isZH)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{t("fortuneSub.luckyNumber")}:</span>
                      <span className="text-gold font-medium">{freq === "daily" ? dailyFortune?.lucky_number : fortune?.lucky_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{t("fortuneSub.luckyDirection")}:</span>
                      <span className="text-blue-400/80 font-medium">{freq === "daily" ? tr(dailyFortune?.lucky_direction ?? "", !isZH) : tr(fortune?.lucky_direction ?? "", !isZH)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{t("fortuneSub.tarotCard")}:</span>
                      <span className="text-purple-400/80 font-medium">{freq === "daily" ? tr(dailyFortune?.tarot_card ?? "", !isZH) : tr(fortune?.tarot_card ?? "", !isZH)}</span>
                    </div>
                  </div>

                  {/* Tarot description */}
                  <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-3">
                    <p className="text-purple-300/70 text-xs leading-relaxed">{freq === "daily" ? tr(dailyFortune?.tarot_desc ?? "", !isZH) : tr(fortune?.tarot_desc ?? "", !isZH)}</p>
                  </div>

                  {/* Daily Yi Ji - weekly shows 3-day preview, daily shows today's yi/ji */}
                  <div>
                    <p className="text-white/30 text-[10px] mb-2">{t("fortuneSub.dailyYiJi")}</p>
                    {freq === "daily" && dailyFortune ? (
                      <div className="flex gap-3">
                        <div className="flex-1 bg-green-500/5 border border-green-500/15 rounded-lg p-2 text-center">
                          <p className="text-green-400/70 text-[10px] mb-1">{yiLabel}</p>
                          <p className="text-white/60 text-xs">{dailyFortune.yi.map(v => tr(v, !isZH)).join(" · ")}</p>
                        </div>
                        <div className="flex-1 bg-red-500/5 border border-red-500/15 rounded-lg p-2 text-center">
                          <p className="text-red-400/50 text-[10px] mb-1">{jiLabel}</p>
                          <p className="text-white/60 text-xs">{dailyFortune.ji.map(v => tr(v, !isZH)).join(" · ")}</p>
                        </div>
                      </div>
                    ) : fortune?.daily_yi_ji ? (
                      <div className="grid grid-cols-3 gap-2">
                        {fortune.daily_yi_ji.slice(0, 3).map((d, i) => (
                          <div key={i} className="bg-white/[0.03] rounded-lg p-2 text-center">
                            <p className="text-white/40 text-[10px] mb-1">{dayLabels[i]}</p>
                            <p className="text-green-400/70 text-[10px]">{yiLabel} {tr(d.yi, !isZH)}</p>
                            <p className="text-red-400/50 text-[10px]">{jiLabel} {tr(d.ji, !isZH)}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* AI Insight */}
                <div className="card-glass p-4 flex items-start gap-3">
                  <span className="text-base flex-shrink-0">🤖</span>
                  <p className="text-white/40 text-xs leading-relaxed">{freq === "daily" ? tr(dailyFortune?.ai_insight ?? "", !isZH) : tr(fortune?.ai_insight ?? "", !isZH)}</p>
                </div>
              </>
            )}

            {/* No data state - show generic profile or prompt to set birth info */}
            {!loading && !fortune && !dailyFortune && (
              <div className="text-center py-6">
                <p className="text-white/30 text-sm mb-3">
                  {user ? t("fortuneSub.generating") : t("fortuneSub.loginRequired")}
                </p>
                {!user && (
                  <button
                    onClick={() => { setOpen(false); router.push(localeHref("/login")) }}
                    className="btn-gold px-6 py-2 text-sm"
                  >
                    {t("nav.login")}
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              {user ? (
                freq !== "off" ? (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex-1 py-2.5 text-sm flex items-center justify-center gap-2 rounded-xl transition-all ${
                      isSubscribed && freq !== "off"
                        ? "bg-green-500/10 text-green-400 border border-green-500/30"
                        : "btn-gold"
                    }`}
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isSubscribed && freq !== "off" ? (
                      <><Check size={14} /> {t("fortuneSub.subscribed")} </>
                    ) : (
                      <>{t("fortuneSub.subscribe")} <ChevronRight size={14} /></>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/50 text-sm hover:text-white/70 transition-colors"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : t("fortuneSub.unsubscribe")}
                  </button>
                )
              ) : (
                <button
                  onClick={() => { setOpen(false); router.push(localeHref("/login")) }}
                  className="flex-1 btn-gold py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  {t("nav.login")} <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  )
}
