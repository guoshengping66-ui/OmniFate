"use client"
import { useEffect, useState, useCallback, useRef, useMemo, lazy, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Loader2, Sparkles, ShoppingBag, AlertCircle,
  CheckCircle, MessageSquare, Tags, Gift, Lock,
  Crown, ArrowRight, ArrowLeft, TrendingUp, Zap, Star, Shield,
  ChevronDown, Eye, Clock, Compass, ScrollText,
} from "lucide-react"
import toast from "react-hot-toast"
import { getSession, matchProducts, AnalysisResponse, Product, AGENT_LABELS } from "@/lib/api"

const AGENT_I18N: Record<string, string> = {
  astrology: "agent.astrology._label", tarot: "agent.tarot._label", bazi: "agent.bazi._label",
  qimen: "agent.qimen._label", ziwei: "agent.ziwei._label", face: "agent.face._label",
  palm: "agent.palm._label", partner_face: "agent.partner_face._label",
  partner_palm: "agent.partner_palm._label", master: "agent.master",
}
// Core imports (always needed)
import AnalysisSession from "@/components/reading/AnalysisSession"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { STARDUST_COST } from "@/lib/pricing.config"
import MembershipBadge, { getUserTier } from "@/components/ui/MembershipBadge"
import { ReportSection } from "@/components/reading/ReportSection"
import { ReadingSkeleton } from "@/components/reading/ReadingSkeleton"
import { TagBadge } from "@/components/ui/TagBadge"
import { useRegion } from "@/hooks/useRegion"
import { getProductPrice } from "@/lib/regionPrice"
import type { StructuredReport } from "@/types/report"

/**
 * 检测内容是否为结构化JSON格式
 */
function parseStructuredContent(content: string): StructuredReport | null {
  if (!content) return null
  let jsonStr = content
  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/)
  if (jsonMatch) jsonStr = jsonMatch[1]
  try {
    const parsed = JSON.parse(jsonStr)
    if (parsed.summary && parsed.dimensions && typeof parsed.dimensions === "object" &&
        (parsed.dimensions.wealth || parsed.dimensions.relationship || parsed.dimensions.health)) {
      return parsed as StructuredReport
    }
  } catch { /* not JSON */ }
  return null
}

// Lazy-loaded heavy/conditional components (reduces initial bundle ~150KB)
const ProductCard = lazy(() => import("@/components/reading/ProductCard").then(m => ({ default: m.ProductCard })))
const ChatBox = lazy(() => import("@/components/reading/ChatBox").then(m => ({ default: m.ChatBox })))
const EventAnalyzer = lazy(() => import("@/components/reading/EventAnalyzer"))
const DailyAlmanac = lazy(() => import("@/components/reading/DailyAlmanac"))
const DestinyRadar = lazy(() => import("@/components/reading/DestinyRadar").then(m => ({ default: m.DestinyRadar })))
const ShareSheet = lazy(() => import("@/components/reading/ShareSheet").then(m => ({ default: m.ShareSheet })))
const PaywallGate = lazy(() => import("@/components/monetization/PaywallGate").then(m => ({ default: m.PaywallGate })))
const QRPaymentModal = lazy(() => import("@/components/payment/QRPaymentModal").then(m => ({ default: m.QRPaymentModal })))
const PrescriptionCard = lazy(() => import("@/components/reading/PrescriptionCard").then(m => ({ default: m.PrescriptionCard })))
const EnergyIDCard = lazy(() => import("@/components/reading/EnergyIDCard").then(m => ({ default: m.EnergyIDCard })))
const FortunePrescription = lazy(() => import("@/components/reading/FortunePrescription").then(m => ({ default: m.FortunePrescription })))
const PostAnalysisModal = lazy(() => import("@/components/reading/PostAnalysisModal").then(m => ({ default: m.PostAnalysisModal })))
const StructuredReportComponent = lazy(() => import("@/components/reading/StructuredReport").then(m => ({ default: m.StructuredReport })))

const WORKER_ORDER = ["bazi", "qimen", "ziwei", "astrology", "tarot", "face", "palm"] as const

function stripMarkdown(text: string): string {
  return text
    // Remove JSON code blocks that may have leaked into report text
    .replace(/```json\s*[\s\S]*?```/g, "")
    .replace(/```\w*\s*[\s\S]*?```/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/#-+/g, "")
    .replace(/^#+\s*$/gm, "")
    .replace(/^\s*[-*+]\s+(?=[#-])/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

const DIM_LABELS: Record<string, string> = {
  wealth: "财富", career: "事业", relationship: "感情",
  health: "健康", mindfulness: "心智",
}

const DIM_EMOJI: Record<string, string> = {
  wealth: "💰", career: "💼", relationship: "💕", health: "🏥", mindfulness: "🧘",
}

const DIM_DESCRIPTIONS: Record<string, string> = {
  wealth: "财务分析指数",
  career: "事业腾飞力",
  relationship: "情感和谐度",
  health: "身心平衡值",
  mindfulness: "专注觉醒度",
}

const I18N_DIM_KEYS: Record<string, { label: string; desc: string }> = {
  wealth: { label: "reading.dim.wealth", desc: "reading.dimDesc.wealth" },
  career: { label: "reading.dim.career", desc: "reading.dimDesc.career" },
  relationship: { label: "reading.dim.relationship", desc: "reading.dimDesc.relationship" },
  health: { label: "reading.dim.health", desc: "reading.dimDesc.health" },
  mindfulness: { label: "reading.dim.mindfulness", desc: "reading.dimDesc.mindfulness" },
}

const I18N_NAV_CORE = [
  { id: "master",    icon: "🌟", labelKey: "reading.nav.overview",     descKey: "reading.nav.overviewDesc" },
  { id: "shop",      icon: "🎁", labelKey: "reading.nav.shop",        descKey: "reading.nav.shopDesc" },
  { id: "chat",      icon: "💬", labelKey: "reading.nav.chat",        descKey: "reading.nav.chatDesc" },
]

const I18N_NAV_DIMENSIONS = [
  { id: "bazi",      icon: "☯",  labelKey: "reading.nav.bazi",        descKey: "reading.nav.baziDesc" },
  { id: "qimen",     icon: "🎯", labelKey: "reading.nav.qimen",       descKey: "reading.nav.qimenDesc" },
  { id: "ziwei",     icon: "⭐", labelKey: "reading.nav.ziwei",       descKey: "reading.nav.ziweiDesc" },
  { id: "astrology", icon: "✦",  labelKey: "reading.nav.astrology",   descKey: "reading.nav.astrologyDesc" },
  { id: "tarot",     icon: "🃏", labelKey: "reading.nav.tarot",       descKey: "reading.nav.tarotDesc" },
  { id: "face",      icon: "👁",  labelKey: "reading.nav.face",        descKey: "reading.nav.faceDesc" },
  { id: "palm",      icon: "🤚", labelKey: "reading.nav.palm",        descKey: "reading.nav.palmDesc" },
]

const I18N_NAV_ITEMS = [...I18N_NAV_CORE, ...I18N_NAV_DIMENSIONS]

/** Parse free report sections from master_summary.
 *  Uses sequential marker parsing to avoid false matches when content
 *  contains text that looks like a section marker (e.g. "C·" inside Section D). */
function parseFreeReportSections(summary: string): {
  sectionA: string; sectionB: string; painPoints: string[]; sectionD: string;
} {
  if (!summary) return { sectionA: "", sectionB: "", painPoints: [], sectionD: "" }
  const result = { sectionA: "", sectionB: "", painPoints: [] as string[], sectionD: "" }

  // Match section markers: 【X·任意文本】 or [X·任意文本]
  // where X is a letter A-E, · may be surrounded by spaces
  // Also match legacy format without letter prefix: 【命盘底色】, 【核心发现】
  const markerRe = /[【\[]([A-E])\s*·[^】\]]*[】\]]/g
  const markers: { letter: string; idx: number; end: number }[] = []
  let m: RegExpExecArray | null
  while ((m = markerRe.exec(summary)) !== null) {
    markers.push({ letter: m[1], idx: m.index, end: m.index + m[0].length })
  }

  // Fallback: try legacy markers without letter prefix
  if (markers.length === 0) {
    const legacyRe = /[【\[]((?:命盘底色|核心发现|核心矛盾|置信度|五维诊断|年度转折|专项分析|发展轨迹|能量处方|处方笺))[^】\]]*[】\]]/g
    const legacyMap: Record<string, string> = {
      "命盘底色": "A", "核心发现": "B", "核心矛盾": "C",
      "置信度": "D", "五维诊断": "E"
    }
    let lm: RegExpExecArray | null
    while ((lm = legacyRe.exec(summary)) !== null) {
      const letter = legacyMap[lm[1]]
      if (letter) {
        markers.push({ letter, idx: lm.index, end: lm.index + lm[0].length })
      }
    }
  }

  if (markers.length === 0) {
    // No markers — treat entire text as Section A (legacy format)
    result.sectionA = summary
    return result
  }

  for (let i = 0; i < markers.length; i++) {
    const contentStart = markers[i].end
    const contentEnd = i + 1 < markers.length ? markers[i + 1].idx : summary.length
    const content = summary.slice(contentStart, contentEnd).trim()
    const letter = markers[i].letter

    if (letter === "A") result.sectionA = content
    else if (letter === "B") {
      result.sectionB = content
      // Extract painPoints: prefer emoji-prefixed lines, fallback to bullet/numbered items
      result.painPoints = content.split("\n").filter(l => /^[🔴🟡🟢]/.test(l.trim())).map(l => l.trim())
      if (result.painPoints.length === 0) {
        // Fallback: extract bullet points or numbered items
        result.painPoints = content.split("\n")
          .filter(l => /^[\-•·*\d+[.、)】]/.test(l.trim()))
          .map(l => l.trim().replace(/^[\-•·*\d+[.、)】]\s*/, ""))
          .filter(l => l.length > 5)
      }
    }
    else if (letter === "D") result.sectionD = content
  }

  return result
}

function getWeakestDimension(scores: Record<string, number>): string {
  return Object.entries(scores).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "wealth"
}

function getWeakestLabel(scores: Record<string, number>, t: (key: string) => string): string {
  const dim = getWeakestDimension(scores)
  return I18N_DIM_KEYS[dim] ? t(I18N_DIM_KEYS[dim].label) : (DIM_LABELS[dim] ?? dim)
}

function getStrongestDimension(scores: Record<string, number>): string {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "career"
}

function getStrongestLabel(scores: Record<string, number>, t: (key: string) => string): string {
  const dim = getStrongestDimension(scores)
  return I18N_DIM_KEYS[dim] ? t(I18N_DIM_KEYS[dim].label) : (DIM_LABELS[dim] ?? dim)
}

/** Extract a life theme from master_summary — first sentence or first 30 chars */
function extractLifeTheme(summary: string): string {
  if (!summary) return ""
  // Try to find a theme-like sentence (often the first meaningful sentence)
  const lines = summary.split("\n").filter(l => l.trim().length > 0)
  for (const line of lines) {
    const trimmed = line.trim()
    // Skip section markers and very short lines
    if (/^[【\[（(]/.test(trimmed) || trimmed.length < 5) continue
    // Skip lines that are just labels (Chinese numbered or English numbered)
    if (/^[一二三四五六七八九十]+[、．.]/.test(trimmed) || /^\d+[.、]/.test(trimmed)) continue
    // Return first meaningful sentence (max 40 chars)
    const sentence = trimmed.split(/[。！？.!?\n]/)[0]
    if (sentence.length > 5) return sentence.length > 40 ? sentence.slice(0, 38) + "…" : sentence
  }
  return ""
}

// Keyword patterns for matching insights (Chinese + English)
const PAIN_KEYWORDS = /受阻|压力|风险|不足|困扰|矛盾|消耗|瓶颈|失衡|反复|阻碍|挑战|隐患|波动|受制|problem|challenge|risk|weakness|imbalanc|stagnan|conflict|stress|struggle|vulnerab|fluctuat/
const STRENGTH_KEYWORDS = /优势|强项|擅长|天赋|出色|突出|能量强|充盈|充沛|潜力|敏锐|直觉|领导|创造|洞察|智慧|果断|坚韧|灵活|strength|talent|gift|exceptional|lead|creat|insight|wisdom|resilien|flexib|potential|intuit/
const TIMING_KEYWORDS = /建议|近期|适合|机会|注意|把握|调整|行动|时机|适合|可以|值得|应当|关键|重要|suggest|opportunity|timing|action|important|attention|adjust|seize|worth|key|recent|advice/

/** Extract 3 key insights from master_summary using section markers */
function extractQuickInsights(summary: string): string[] {
  if (!summary) return []
  const insights: string[] = []

  // Helper: extract first meaningful sentence from a text block
  function firstSentence(text: string): string {
    const lines = text.split("\n").filter(l => l.trim().length > 0)
    for (const line of lines) {
      const trimmed = line.trim()
      if (/^[【\[（(]/.test(trimmed) || trimmed.length < 8) continue
      if (/^[🔴🟡🟢⚠️✨🔥💎⏰💪❤️💚]/.test(trimmed)) {
        const stripped = trimmed.replace(/^[🔴🟡🟢⚠️✨🔥💎⏰💪❤️💚\s]+/, "").trim()
        if (stripped.length >= 8) return stripped.slice(0, 60)
        continue
      }
      const sentence = trimmed.split(/[。！？.!?\n]/)[0]
      if (sentence.length >= 8) return sentence.slice(0, 60)
    }
    return ""
  }

  // Extract section content by matching marker directly in original text.
  // Uses sequential parsing to avoid false matches (e.g. "C·" inside Section D content).
  // Works with both Chinese (【A·核心性格底色】) and English (【A · Core Personality Blueprint】)
  function findSectionContent(label: string, letter?: string): string {
    // Find all section markers in order (each entry has index = start of 【, end = position after 】)
    const allMarkers: { idx: number; end: number }[] = []
    // Match: 【X·任意文本】 or [X·任意文本] where X = A-E, · may have spaces around it
    const markerRe = /[【\[]([A-E])\s*·[^】\]]*[】\]]/g
    let m: RegExpExecArray | null
    while ((m = markerRe.exec(summary)) !== null) {
      allMarkers.push({ idx: m.index, end: m.index + m[0].length })
    }

    // Find the target marker
    const targetRe = letter
      ? new RegExp(`[【\\[]?${letter}\\s*·[^】\\]]*[】\\]]?`)
      : new RegExp(`【[A-E]·${label}】`)
    const target = summary.match(targetRe)
    if (!target) return ""

    const start = (target.index || 0) + target[0].length
    // Find next section marker AFTER start using the sequential list
    const nextM = allMarkers.find(mk => mk.idx >= start)
    const end = nextM ? nextM.idx : summary.length
    return summary.slice(start, end).trim()
  }

  // Helper: extract best matching sentence by keywords
  function bestSentence(text: string, keywords: RegExp): string {
    const lines = text.split("\n").filter(l => l.trim().length > 0)
    // First pass: find a line matching keywords
    for (const line of lines) {
      const trimmed = line.trim()
      if (keywords.test(trimmed) && trimmed.length >= 8) {
        const s = trimmed.replace(/^[🔴🟡🟢⚠️✨🔥💎⏰💪❤️💚\s●◆■]+/, "").split(/[。！？.!?\n]/)[0].trim()
        if (s.length >= 8) return s.slice(0, 60)
      }
    }
    return ""
  }

  // 1. Pain point from Section B — look for problem indicators (try CN then EN markers)
  const sectionB = findSectionContent("痛点诊断", "B") || findSectionContent("Key Challenges", "B")
  if (sectionB) {
    const s = bestSentence(sectionB, PAIN_KEYWORDS)
      || firstSentence(sectionB)
    if (s) insights.push(s)
  }

  // 2. Strength from Section A — look for positive traits (try CN then EN markers)
  if (insights.length < 2) {
    const sectionA = findSectionContent("核心性格底色", "A") || findSectionContent("Core Personality Blueprint", "A") || findSectionContent("综合总论")
    if (sectionA) {
      const s = bestSentence(sectionA, STRENGTH_KEYWORDS)
        || firstSentence(sectionA)
      if (s && !insights.includes(s)) insights.push(s)
    }
  }

  // 3. Timing from Section D — look for actionable timing advice (try CN then EN markers)
  if (insights.length < 3) {
    const sectionD = findSectionContent("近期关键提醒", "D") || findSectionContent("Near-Term Alert", "D")
    if (sectionD) {
      const s = bestSentence(sectionD, TIMING_KEYWORDS)
        || firstSentence(sectionD)
      if (s && !insights.includes(s)) insights.push(s)
    }
  }

  // Fallback: if still less than 3, grab from remaining non-section lines
  if (insights.length < 3) {
    const lines = summary.split("\n").filter(l => l.trim().length > 0)
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length >= 10 && !/^[【\[（(]/.test(trimmed) && !insights.some(i => trimmed.includes(i) || i.includes(trimmed))) {
        const s = trimmed.replace(/^[🔴🟡🟢⚠️✨🔥💎⏰💪❤️💚\s]+/, "").split(/[。！？.!?\n]/)[0].trim()
        if (s.length >= 8) insights.push(s.slice(0, 60))
        if (insights.length >= 3) break
      }
    }
  }

  return insights.slice(0, 3)
}

function getI18nDimLabel(key: string, t: (k: string) => string): string {
  const i18n = I18N_DIM_KEYS[key]
  return i18n ? t(i18n.label) : DIM_LABELS[key] ?? key
}

/** Get a time-of-day greeting */
function getGreeting(t: (key: string) => string): string {
  const h = new Date().getHours()
  if (h < 6) return t("reading.greeting.lateNight")
  if (h < 9) return t("reading.greeting.earlyMorning")
  if (h < 12) return t("reading.greeting.morning")
  if (h < 14) return t("reading.greeting.afternoon")
  if (h < 18) return t("reading.greeting.evening")
  if (h < 21) return t("reading.greeting.night")
  return t("reading.greeting.night")
}

export default function ReadingPage() {
  const { id } = useParams<{ id: string }>()
  const { user, refreshUser } = useAuth()
  const { locale, t, localeHref } = useLanguage()
  const { region } = useRegion()
  const router = useRouter()
  const [data, setData]         = useState<AnalysisResponse | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [shopLoading, setShopLoading] = useState(false)
  const [shopFetched, setShopFetched] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("master")

  const [showPayment, setShowPayment] = useState(false)
  const [showOneTimePayment, setShowOneTimePayment] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isDetailedUnlocked, setIsDetailedUnlocked] = useState(false)

  // Pre-compute star particle styles to avoid Math.random() in render
  const starParticles = useMemo(() =>
    Array.from({ length: 12 }, () => ({
      width: `${2 + Math.random() * 3}px`,
      height: `${2 + Math.random() * 3}px`,
      left: `${5 + Math.random() * 90}%`,
      top: `${5 + Math.random() * 80}%`,
      animation: `twinkle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
    })), [])

  // Scroll-driven progressive reveal
  const [heroVisible, setHeroVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const navScrollRef = useRef<HTMLDivElement>(null)

  // Guard against redundant setData calls from AnalysisSession onComplete.
  // getSession() returns new object refs each call, so without this guard
  // every poll/SSE completion triggers a re-render even when data is identical.
  // The stringified snapshot prevents re-render cascades that cause React error #310.
  const lastCompleteDataRef = useRef<AnalysisResponse | null>(null)
  const lastCompleteJsonRef = useRef<string>("")
  const handleAnalysisComplete = useCallback((fresh: AnalysisResponse) => {
    const json = JSON.stringify(fresh)
    if (json === lastCompleteJsonRef.current) return
    lastCompleteJsonRef.current = json
    lastCompleteDataRef.current = fresh
    setData(fresh)
    setIsUnlocked(fresh.is_detail_unlocked)
    setIsDetailedUnlocked(fresh.is_detailed_unlocked)
  }, [])

  // Fetch initial data — AnalysisSession handles all SSE/polling/streaming
  useEffect(() => {
    if (!id) return
    let cancelled = false

    setLoading(true)
    setProducts([])
    setShopFetched(false)
    setActiveTab("master")

    const LOAD_TIMEOUT_MS = 15_000
    const loadTimeout = setTimeout(() => {
      if (cancelled) return
      setLoading(false)
      toast.error(t("reading.error.loadTimeout") || "加载超时，请刷新重试")
    }, LOAD_TIMEOUT_MS)

    getSession(id, locale).then(d => {
      if (cancelled) return
      clearTimeout(loadTimeout)
      // Deduplicate: don't overwrite if AnalysisSession already set identical data
      const json = JSON.stringify(d)
      if (json !== lastCompleteJsonRef.current) {
        lastCompleteJsonRef.current = json
        lastCompleteDataRef.current = d
        setData(d)
      }
      setIsUnlocked(d.is_detail_unlocked)
      setIsDetailedUnlocked(d.is_detailed_unlocked)
      setLoading(false)
    }).catch(() => {
      if (!cancelled) {
        clearTimeout(loadTimeout)
        toast.error(t("reading.error.loadFailed"))
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      clearTimeout(loadTimeout)
    }
  }, [id])

  // Trigger hero animation
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 150)
    return () => clearTimeout(t)
  }, [])

  // Auto-fetch product recommendations when analysis completes.
  // Use `data?.status` (primitive string) as dependency — NOT the `data` object,
  // which is a new reference on every setData() call and would cause the effect
  // to re-run endlessly.
  const dataStatus = data?.status
  useEffect(() => {
    if (!data || (dataStatus !== "done" && dataStatus !== "completed" && dataStatus !== "chat")) return
    if (shopFetched || shopLoading) return
    if (!data.computed_tags || data.computed_tags.length === 0) return

    setShopLoading(true)
    // Strip backend modifiers (待验证, 严重⚠️) so tags match product keyword_tags exactly
    const cleanTags = data.computed_tags.map((tag: string) =>
      tag.replace(/^严重⚠️\s*/, "").replace(/\(待验证\)$/, "").trim()
    )
    matchProducts({
      weakness_tags: cleanTags,
      master_summary: data.master_summary,
      top_k: 6,
      include_explain: true,
    }, locale)
      .then(result => {
        setProducts(result)
        setShopFetched(true)
      })
      .catch(() => {})
      .finally(() => setShopLoading(false))
  }, [dataStatus, shopFetched, shopLoading, locale])

  const handleUnlock = useCallback(async (paymentMethod: string = "card") => {
    if (!id) return
    // 跳转到定价页面，用户选择会员方案
    router.push(localeHref("/pricing"))
  }, [id, router, locale])

  const handlePaymentSuccess = useCallback(async () => {
    setIsUnlocked(true)
    setShowPayment(false)
    toast.success(t("reading.error.unlocked"))
    refreshUser()
  }, [refreshUser])

  const handleStardustUnlock = useCallback(async () => {
    if (!id) return
    try {
      const { unlockReport } = await import("@/lib/api")
      const result = await unlockReport(id, "stardust", "full")
      if (result.unlocked) {
        setIsUnlocked(true)
        setIsDetailedUnlocked(true)
        // Re-fetch session data so master_detail / worker reports are populated
        const fresh = await getSession(id, locale)
        if (fresh) setData(fresh)
      }
      toast.success(t("reading.unlockedSuccess"))
      refreshUser()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t("reading.unlockedFailed"))
    }
  }, [id, refreshUser, locale])

  const handleOneTimeUnlock = useCallback(() => {
    setShowOneTimePayment(true)
  }, [])

  const handleOneTimePaymentSuccess = useCallback(async () => {
    setShowOneTimePayment(false)
    setIsUnlocked(true)
    setIsDetailedUnlocked(true)
    const fresh = await getSession(id!, locale)
    if (fresh) setData(fresh)
    toast.success(t("reading.unlockedSuccess"))
    refreshUser()
  }, [id, refreshUser, locale])

  const handleDetailedUnlock = useCallback(async () => {
    if (!id) return
    try {
      const { unlockReport } = await import("@/lib/api")
      const result = await unlockReport(id, "stardust", "detailed")
      if (result.unlocked) {
        setIsDetailedUnlocked(true)
        const fresh = await getSession(id, locale)
        if (fresh) setData(fresh)
      }
      toast.success(t("reading.detailedUnlocked") || "精读报告已解锁")
      refreshUser()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t("reading.unlockedFailed"))
    }
  }, [id, refreshUser, locale])

  // ── All hooks MUST be called before any early returns (React rules of hooks).
  //    Compute derived values used by hooks here, guard with null checks. ──
  const masterSummary = data?.master_summary || ""
  const quickInsights = useMemo(() => extractQuickInsights(masterSummary), [masterSummary])

  // Guard: show loading skeleton
  if (loading) return <ReadingSkeleton phase="loading" />
  if (!data) return <ReadingSkeleton phase="error" />

  // Show AnalysisSession when analysis is still running — all SSE/polling state is
  // isolated inside AnalysisSession so ReadingPage re-renders only on completion.
  const isTerminal = data.status === "done" || data.status === "completed" || data.status === "chat"
  if (!isTerminal) {
    return (
      <AnalysisSession
        sessionId={id}
        initialData={data}
        onComplete={handleAnalysisComplete}
      />
    )
  }

  // Dynamic worker order — include partner_face/palm only when data exists
  const WORKER_ORDER_ALL: readonly string[] = (() => {
    const base = ["bazi", "qimen", "ziwei", "astrology", "tarot", "face", "palm"]
    if (data.partner_face) base.push("partner_face")
    if (data.partner_palm) base.push("partner_palm")
    return base as readonly string[]
  })()

  // Dynamic navigation items — include partner tabs when available
  const NAV_ITEMS_DIMENSIONS = (() => {
    const items = [...I18N_NAV_DIMENSIONS]
    if (data.partner_face) {
      items.splice(items.findIndex(i => i.id === "face") + 1, 0,
        { id: "partner_face", icon: "👁", labelKey: "reading.nav.partnerFace", descKey: "reading.nav.partnerFaceDesc" })
    }
    if (data.partner_palm) {
      const palmIdx = items.findIndex(i => i.id === "palm")
      items.splice(palmIdx + 1, 0,
        { id: "partner_palm", icon: "🤚", labelKey: "reading.nav.partnerPalm", descKey: "reading.nav.partnerPalmDesc" })
    }
    return items
  })()

  const NAV_ITEMS_ALL = [...I18N_NAV_CORE, ...NAV_ITEMS_DIMENSIONS]

  const workerMap: Record<string, typeof data.bazi> = {
    astrology: data.astrology,
    tarot:     data.tarot,
    bazi:      data.bazi,
    qimen:     data.qimen,
    ziwei:     data.ziwei,
    face:      data.face,
    palm:      data.palm,
    ...(data.partner_face ? { partner_face: data.partner_face } : {}),
    ...(data.partner_palm ? { partner_palm: data.partner_palm } : {}),
  }

  const strongestDim = data.dimension_scores ? getStrongestDimension(data.dimension_scores) : "career"
  const strongestLabel = data.dimension_scores ? getI18nDimLabel(getStrongestDimension(data.dimension_scores), t) : t("reading.dim.career")
  const weakestDim = data.dimension_scores ? getWeakestDimension(data.dimension_scores) : "wealth"
  const weakestLabel = data.dimension_scores ? getI18nDimLabel(getWeakestDimension(data.dimension_scores), t) : t("reading.dim.wealth")

  return (
    <div className="min-h-screen pb-24">
      {/* ════════════════════════════════════════════════════════════
          HERO SECTION — Immersive above-the-fold experience
          ════════════════════════════════════════════════════════════ */}
      <div ref={heroRef} className="relative pt-8 pb-12 px-4 overflow-hidden">

        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[450px] md:w-[600px] h-[200px] sm:h-[300px] md:h-[400px] rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(201,168,76,0.3) 0%, rgba(157,100,180,0.15) 40%, transparent 70%)",
              transition: "opacity 1.5s ease-out",
              opacity: heroVisible ? 0.2 : 0,
            }}
          />
          <div
            className="absolute top-20 right-[10%] w-[150px] sm:w-[220px] md:w-[300px] h-[150px] sm:h-[220px] md:h-[300px] rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] opacity-10"
            style={{
              background: "radial-gradient(circle, rgba(82,183,136,0.25) 0%, transparent 70%)",
              animation: "float 8s ease-in-out infinite",
            }}
          />
          {/* Floating star particles */}
          {starParticles.map((style, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gold/30"
              style={style}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto relative" data-report-content>
          {/* ── Top bar: badge + share ── */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 mb-8"
            style={{
              transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-full px-4 py-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gold/80 text-xs font-medium tracking-wide">
                {t("reading.hero.badge")}
              </span>
            </div>
            {/* Intent channel badge */}
            {data?.intent && (
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium
                ${data.intent === "FULL_MULTIMODAL"
                  ? "bg-gold/10 border border-gold/25 text-gold/80"
                  : data.intent === "GENERAL_DAILY"
                    ? "bg-purple-500/10 border border-purple-500/25 text-purple-400"
                    : "bg-blue-500/10 border border-blue-500/25 text-blue-400"
                }`}
              >
                {data.intent === "FULL_MULTIMODAL"
                  ? t("reading.channel.full")
                  : data.intent === "GENERAL_DAILY"
                    ? t("reading.channel.quick")
                    : t("reading.channel.event")
                }
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <span className="text-white/30 text-[10px]">
                {t("reading.disclaimer")}
              </span>
            </div>
            <Suspense fallback={<div className="w-20 h-8" />}>
              <ShareSheet sessionId={id} />
            </Suspense>
          </div>

          {/* ── Main Hero Card ── */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.15s",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            {/* Animated border */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                padding: "1px",
                background: "conic-gradient(from var(--angle,0deg), transparent 25%, rgba(201,168,76,0.4) 50%, transparent 75%)",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                animation: "hero-border-spin 8s linear infinite",
              }}
            />
            <div className="relative bg-gradient-to-br from-[#1a1430]/90 via-[#1e1835]/90 to-[#140f24]/90 backdrop-blur-xl p-6 md:p-10">
              {/* Greeting */}
              <p
                className="text-gold/60 text-xs md:text-sm tracking-widest uppercase mb-4"
                style={{
                  transition: "all 0.6s ease-out 0.3s",
                  opacity: heroVisible ? 1 : 0,
                }}
              >
                {getGreeting(t)} · {t("reading.greeting.ready")}
              </p>

              {/* Main headline */}
              <h1
                className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-3"
                style={{
                  background: "linear-gradient(135deg, #E8CB7A 0%, #C9A84C 40%, #F0D68A 70%, #C9A84C 100%)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  transition: "all 0.6s ease-out 0.45s",
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(8px)",
                }}
              >
                {t("reading.title")}
              </h1>

              {/* Subtitle */}
              <p
                className="text-white/50 text-sm md:text-base max-w-2xl leading-relaxed mb-6"
                style={{
                  transition: "all 0.6s ease-out 0.6s",
                  opacity: heroVisible ? 1 : 0,
                }}
              >
                {t("reading.subtitle")}
              </p>

              {/* ── Life Theme Hook ── */}
              {(() => {
                const theme = extractLifeTheme(data.master_summary || "")
                if (!theme) return null
                return (
                  <div
                    className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-gold/[0.08] to-purple-500/[0.05] border border-gold/15"
                    style={{
                      transition: "all 0.6s ease-out 0.7s",
                      opacity: heroVisible ? 1 : 0,
                    }}
                  >
                    <p className="text-gold/90 text-sm md:text-base font-serif font-semibold leading-relaxed">
                      「{theme}」
                    </p>
                  </div>
                )
              })()}

              {/* ── Dimension Score Compact Row (hidden for RELATIONSHIP) ── */}
              {data.dimension_scores && data.intent !== "RELATIONSHIP" && (
                <div
                  className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3 mb-8"
                  style={{
                    transition: "all 0.8s ease-out 0.75s",
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? "translateY(0)" : "translateY(12px)",
                  }}
                >
                  {Object.entries(DIM_LABELS).map(([key, label]) => {
                    const score = data.dimension_scores![key] ?? 5
                    const isStrongest = key === strongestDim
                    const isWeakest = key === weakestDim
                    const i18nKey = I18N_DIM_KEYS[key]
                    // Simulated percentile based on score (score 1-10 maps to ~20-95 percentile)
                    const percentile = Math.min(95, Math.max(15, Math.round(score * 10 - 5)))
                    return (
                      <div
                        key={key}
                        className={`relative rounded-xl p-2 sm:p-2.5 md:p-3.5 text-center border transition-all duration-500
                          ${isStrongest
                            ? "bg-gold/10 border-gold/30"
                            : isWeakest
                              ? "bg-rose-500/5 border-rose-400/20"
                              : "bg-white/[0.03] border-white/10 hover:border-white/20"
                          }`}
                      >
                        <span className="text-sm md:text-lg">{DIM_EMOJI[key]}</span>
                        <p
                          className={`text-base sm:text-lg md:text-2xl font-bold font-serif mt-1
                            ${isStrongest ? "text-gold" : isWeakest ? "text-rose-400" : "text-white/60"}`}
                        >
                          {score.toFixed(1)}
                        </p>
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-white/30 mt-0.5">{i18nKey ? t(i18nKey.label) : label}</p>
                        {/* Percentile bar */}
                        <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              isStrongest ? "bg-gold/60" : isWeakest ? "bg-rose-400/50" : "bg-white/20"
                            }`}
                            style={{ width: `${percentile}%` }}
                          />
                        </div>
                        <p className="text-[9px] md:text-[10px] text-white/25 mt-0.5">
                          {score >= 7 ? "★★★" : score >= 4 ? "★★" : "★"}
                        </p>
                        {isWeakest && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── Insight Blurb (hidden for RELATIONSHIP) ── */}
              {data.intent !== "RELATIONSHIP" && (<div
                className="flex items-start gap-3 p-4 rounded-2xl bg-gold/[0.04] border border-gold/10"
                style={{
                  transition: "all 0.6s ease-out 0.9s",
                  opacity: heroVisible ? 1 : 0,
                }}
              >
                <Sparkles size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {t("reading.strongest")}：<span className="text-gold font-semibold">{strongestLabel}</span>，
                    {t("reading.weakest")}：<span className="text-rose-400/80 font-semibold">{weakestLabel}</span>。
                    {isUnlocked
                      ? t("reading.insight.unlocked")
                      : t("reading.insight.locked")}
                  </p>
                  {/* Energy balance summary */}
                  <p className="text-white/30 text-[11px] mt-1.5">
                    {(() => {
                      const scores = Object.values(data.dimension_scores || {})
                      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
                      const balance = Math.max(...scores) - Math.min(...scores)
                      if (balance <= 1.5) return t("reading.insight.balanced") || "五维数据均衡，整体状态稳定"
                      if (balance <= 3) return t("reading.insight.moderate") || "数据分布有侧重，注意补强短板"
                      return t("reading.insight.imbalanced") || "数据差异较大，建议重点关注弱势维度"
                    })()}
                  </p>
                </div>
              </div>)}

            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          NAVIGATION — Side-oriented nav system
          ════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 mb-8 sticky top-16 z-30">
        <div className="bg-[#1a1430]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 relative overflow-hidden">
          {/* Row 1: Core navigation */}
          <div className="flex justify-center gap-1 px-3 pt-2.5 pb-1.5">
            {I18N_NAV_CORE.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium
                            whitespace-nowrap transition-all duration-300 group
                  ${activeTab === item.id
                    ? "bg-gold/15 text-gold shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                    : "text-white/50 hover:text-white/70 hover:bg-white/[0.04]"}`}
              >
                <span className="text-sm sm:text-base transition-transform group-hover:scale-110 duration-200">{item.icon}</span>
                <span>{t(item.labelKey)}</span>
                {activeTab === item.id && (
                  <span className="hidden lg:inline text-[10px] text-gold/50 ml-0.5">{t(item.descKey)}</span>
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-white/[0.06]" />

          {/* Row 2: Dimension tabs (scrollable) */}
          <div className="relative">
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#1a1430]/90 to-transparent pointer-events-none z-10 md:hidden" />
            <div ref={navScrollRef} className="flex gap-0.5 px-2 py-2 overflow-x-auto scrollbar-none scroll-smooth">
              {NAV_ITEMS_DIMENSIONS.map((item) => {
                const isWorkerTab = WORKER_ORDER_ALL.includes(item.id)
                const isLocked = !isUnlocked && isWorkerTab
                const hasReport = isWorkerTab && workerMap[item.id]?.report
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium
                                whitespace-nowrap transition-all duration-300 flex-shrink-0 group relative
                      ${activeTab === item.id
                        ? "bg-gold/15 text-gold shadow-[0_0_12px_rgba(201,168,76,0.12)]"
                        : isLocked
                          ? "text-white/20 hover:text-white/40 hover:bg-white/[0.03]"
                          : "text-white/35 hover:text-white/60 hover:bg-white/[0.04]"}`}
                  >
                    <span className="text-xs sm:text-sm transition-transform group-hover:scale-110 duration-200">{item.icon}</span>
                    <span>{t(item.labelKey)}</span>
                    {hasReport && <span className="w-1.5 h-1.5 rounded-full bg-green-400/70 -ml-0.5" />}
                    {isLocked && !hasReport && <Lock size={9} className="text-white/15 -ml-0.5" />}
                    {activeTab === item.id && (
                      <span className="hidden lg:inline text-[10px] text-gold/50 ml-0.5">{t(item.descKey)}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          CONTENT AREA
          ════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4">
        <FadeInSection key={activeTab}>

        {/* ── Master Summary ──────────────────────────────────── */}
        {activeTab === "master" && (() => {
          // Parse master_summary into sections for free users
          const summary = data.master_summary || ""
          const parsed = parseFreeReportSections(summary)

          // 检测是否为结构化JSON格式
          const structuredData = parseStructuredContent(summary)
          const isStructured = structuredData !== null

          return (
          <div className="space-y-6">
            {/* ── 1. Core Summary (Section A) ── */}
            {isStructured && structuredData ? (
              // 结构化报告渲染
              <Suspense fallback={
                <div className="card-glass p-6 md:p-8 flex items-center justify-center">
                  <Loader2 size={24} className="text-gold animate-spin" />
                </div>
              }>
                <StructuredReportComponent data={structuredData} />
              </Suspense>
            ) : (parsed.sectionA || summary) && (
            // 传统文本渲染
            <div className="card-glass p-6 md:p-8 group hover:border-white/[0.15] transition-all duration-500">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-gold" />
                </div>
                <div>
                  <h2 className="font-serif text-lg md:text-xl font-bold text-gold">{t("reading.master.title")}</h2>
                  <p className="text-white/20 text-xs">{t("reading.master.subtitle")}</p>
                </div>
                <span className="ml-auto text-[10px] px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400">
                  {t("reading.master.free")}
                </span>
              </div>
              <div className="text-white/75 text-sm leading-relaxed whitespace-pre-line">
                {stripMarkdown(parsed.sectionA || summary || t("reading.progress.masterAgent"))}
              </div>
              <p className="mt-4 pt-3 border-t border-white/[0.06] text-white/25 text-[11px] leading-relaxed">
                {t("reading.master.disclaimer")}
              </p>
            </div>
            )}

            {/* ── 1b. Quick Insights (三句话速览) — 结构化模式下跳过 ── */}
            {!isStructured && (() => {
              const insights = quickInsights
              if (insights.length === 0) return null
              const icons = ["🔥", "💎", "⏰"]
              const labels = [
                t("reading.quickInsight.focus") || "最需关注",
                t("reading.quickInsight.strength") || "最大优势",
                t("reading.quickInsight.timing") || "近期时机",
              ]
              return (
                <div className="card-glass p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-gold" />
                    <h3 className="text-sm font-semibold text-white/70">{t("reading.quickInsight.title") || "三句话速览"}</h3>
                  </div>
                  <div className="space-y-2.5">
                    {insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-sm flex-shrink-0">{icons[i] || "•"}</span>
                        <div className="min-w-0">
                          <span className="text-[10px] text-white/30 uppercase tracking-wider">{labels[i]}</span>
                          <p className="text-white/65 text-sm leading-relaxed">{stripMarkdown(insight)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* ── 2. Radar Chart (hidden for RELATIONSHIP) ── */}
            {data.dimension_scores && data.intent !== "RELATIONSHIP" && (
              <div className="flex justify-center">
                <Suspense fallback={<div className="h-64" />}>
                  <DestinyRadar
                    scores={data.dimension_scores}
                    labels={["wealth", "relationship", "career", "health", "mindfulness"].map(k => t(I18N_DIM_KEYS[k]?.label || `reading.dim.${k}`))}
                  />
                </Suspense>
              </div>
            )}

            {/* ── 3. Pain Points (Section B) — 结构化模式下跳过 ── */}
            {!isStructured && parsed.sectionB && !isUnlocked && (
            <div className="card-glass p-6 md:p-8 border-l-2 border-l-amber-400/40 hover:border-l-amber-400/60 transition-all duration-500">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-amber-300">{t("reading.painPoints.title") || "痛点诊断"}</h2>
                  <p className="text-white/20 text-xs">{t("reading.painPoints.subtitle") || "当前最需要关注的3个问题"}</p>
                </div>
              </div>
              <div className="space-y-3">
                {parsed.painPoints.map((point, i) => {
                  const isRed = point.startsWith("🔴")
                  const isGreen = point.startsWith("🟢")
                  const cleanText = stripMarkdown(point.slice(2).trim())
                  // Generate consequence warning for red pain points
                  const consequence = isRed ? t("reading.painPoints.consequence") || "如不调整，可能影响下半年状态" : null
                  return (
                    <div key={i} className={`p-3 rounded-xl transition-all duration-300
                      ${isRed ? "bg-red-500/[0.06] border border-red-400/15" :
                        isGreen ? "bg-green-500/[0.06] border border-green-400/15" :
                        "bg-amber-500/[0.06] border border-amber-400/15"}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-sm mt-0.5 flex-shrink-0">{point.slice(0, 2)}</span>
                        <span className="text-white/70 text-sm leading-relaxed">{cleanText}</span>
                      </div>
                      {consequence && (
                        <p className="mt-2 ml-6 text-[11px] text-red-400/60 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {consequence}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            )}

            {/* ── 4. Key Reminders (Section D) — 结构化模式下跳过 ── */}
            {!isStructured && parsed.sectionD && !isUnlocked && (
            <div className="card-glass p-5 md:p-6 border-l-2 border-l-cyan-400/40 bg-gradient-to-r from-cyan-500/[0.04] to-transparent">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">⏰</span>
                <div className="flex-1">
                  <h3 className="text-cyan-300 font-semibold text-sm mb-1">{t("reading.reminder.title") || "近期关键提醒"}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{stripMarkdown(parsed.sectionD)}</p>
                </div>
              </div>
              {/* Time urgency badge */}
              <div className="mt-3 ml-8 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20">
                  <Clock size={10} className="text-cyan-400" />
                  <span className="text-[10px] text-cyan-300/70">{t("reading.reminder.validity") || "有效期至"}</span>
                  <span className="text-[10px] text-cyan-300 font-medium">
                    {(() => {
                      const now = new Date()
                      const end = new Date(now.getFullYear(), now.getMonth() + 2, 0)
                      return `${end.getFullYear()}.${String(end.getMonth() + 1).padStart(2, "0")}`
                    })()}
                  </span>
                </div>
              </div>
            </div>
            )}

            {/* ── 5. Tags ── */}
            {data.computed_tags?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {data.computed_tags.slice(0, 10).map((tag, i) => (
                  <span key={tag} style={{ transitionDelay: `${i * 30}ms` }}>
                    <TagBadge tag={tag} size="md" />
                  </span>
                ))}
              </div>
            )}

            {/* ── 5b. Profile Type ── */}
            {data.computed_tags?.length > 0 && (
              <div className="card-glass p-5 md:p-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gold/10 to-purple-500/10 border border-gold/20">
                  <Sparkles size={14} className="text-gold" />
                  <span className="text-xs text-white/50">{t("reading.destinyType.label") || "你的行为类型"}</span>
                  <span className="text-sm font-serif font-bold text-gold">
                    {data.computed_tags[0].replace(/^严重⚠️\s*/, "").replace(/\(待验证\)$/, "").trim()}
                  </span>
                </div>
                <p className="mt-2 text-white/30 text-[11px]">{t("reading.destinyType.hint") || "基于五维数据综合分析"}</p>
              </div>
            )}

            {/* ── 6. Energy ID Card (hidden for RELATIONSHIP) ── */}
            {data.dimension_scores && data.intent !== "RELATIONSHIP" && (
              <Suspense fallback={<div className="h-32" />}>
                <EnergyIDCard
                  sessionId={id}
                  userId={user?.id}
                  dimensionScores={data.dimension_scores}
                />
              </Suspense>
            )}

            {/* ── 6b. Growth Path (成长路径) ── */}
            {data.dimension_scores && data.intent !== "RELATIONSHIP" && (
              <div className="card-glass p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-green-400/70" />
                  <h3 className="text-sm font-semibold text-white/60">{t("reading.growthPath.title") || "从当前到理想"}</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(DIM_LABELS).slice(0, 3).map(([key, label]) => {
                    const score = data.dimension_scores![key] ?? 5
                    const target = Math.min(10, score + 2)
                    const gap = target - score
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xs text-white/40 w-12">{label}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden relative">
                          <div
                            className="absolute h-full rounded-full bg-white/20"
                            style={{ width: `${score * 10}%` }}
                          />
                          <div
                            className="absolute h-full rounded-full bg-gradient-to-r from-gold/40 to-green-400/40"
                            style={{ width: `${target * 10}%`, opacity: 0.5 }}
                          />
                        </div>
                        <span className="text-[10px] text-white/30 w-16 text-right">
                          {score.toFixed(1)} → {target.toFixed(1)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-3 text-center text-[11px] text-white/30">
                  {t("reading.growthPath.hint") || "解锁完整报告获取详细提升方案"}
                </p>
              </div>
            )}

            {/* ── 7. Detailed Report (PaywallGate) ── */}
            <Suspense fallback={<div className="card-glass p-6 h-48" />}>
              <PaywallGate
                isUnlocked={isUnlocked || isDetailedUnlocked}
                title={t("reading.master.detailTitle")}
                description={t("reading.insight.locked")}
                onUnlock={() => router.push(localeHref("/pricing"))}
                loading={false}
                previewLines={8}
                stardustBalance={user?.stardust_balance || 0}
                onDetailedUnlock={handleDetailedUnlock}
                onStardustUnlock={handleStardustUnlock}
                showDualTier={!isUnlocked && !isDetailedUnlocked}
                onOneTimeUnlock={handleOneTimeUnlock}
                isPremium={user?.is_premium}
              >
                <div className="card-glass p-6 md:p-8 border-gold/20 bg-gradient-to-br from-gold/[0.03] to-transparent">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                      <Crown size={20} className="text-gold" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg md:text-xl font-bold text-gold">{t("reading.master.detailTitle")}</h2>
                      <p className="text-white/20 text-xs">{t("reading.master.detailSubtitle")}</p>
                    </div>
                    <span className="ml-auto text-[10px] px-2 py-0.5 bg-gold/10 border border-gold/20 rounded-full text-gold/70">
                      {t("reading.master.unlocked")}
                    </span>
                  </div>
                  <div className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                    {stripMarkdown(data.master_detail || t("reading.master.loading"))}
                  </div>
                </div>
              </PaywallGate>
            </Suspense>

            {/* ── 7b. User Testimonials (social proof) ── */}
            {!isUnlocked && !isDetailedUnlocked && (
              <div className="card-glass p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className="text-gold/60" />
                  <h3 className="text-sm font-semibold text-white/60">{t("reading.testimonials.title") || "用户真实反馈"}</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {(Array.isArray(t("reading.testimonials.list", { returnObjects: true }))
                    ? t("reading.testimonials.list", { returnObjects: true }) as Array<{name: string; text: string; score: string}>
                    : [
                      { name: "用户A", text: "分析非常准确，帮我理解了自己的优势和不足", score: "9.2" },
                      { name: "用户B", text: "优化建议很实用，按照建议调整后状态明显好转", score: "8.8" },
                      { name: "用户C", text: "比其他平台的分析更深入，值得解锁完整报告", score: "9.5" },
                    ]
                  ).map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-[10px] text-gold/70">
                          {item.name[0]}
                        </div>
                        <span className="text-[10px] text-white/30">{item.name}</span>
                        <span className="ml-auto text-[10px] text-gold/50">★ {item.score}</span>
                      </div>
                      <p className="text-white/50 text-[11px] leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 8. Profile Prescription ── */}
            {data.recommended_products && data.recommended_products.length > 0 && (
              <Suspense fallback={<div className="card-glass p-4 h-32 animate-pulse" />}>
                <FortunePrescription
                  products={data.recommended_products}
                  weakestLabel={data.dimension_scores ? getWeakestLabel(data.dimension_scores, t) : undefined}
                  strongestLabel={data.dimension_scores ? getStrongestLabel(data.dimension_scores, t) : undefined}
                />
              </Suspense>
            )}

            {/* ── 9. Worker Dimension Previews ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Compass size={16} className="text-white/30" />
                <h3 className="text-sm font-medium text-white/40">{t("reading.summary")}</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {WORKER_ORDER_ALL.map((k: string) => {
                  const w = workerMap[k]
                  const meta = AGENT_LABELS[k]
                  const hasReport = !!w.report
                  // Estimate insight count from report length
                  const insightCount = hasReport ? Math.max(2, Math.min(8, Math.floor(w.report.length / 150))) : 0
                  return (
                    <button
                      key={k}
                      onClick={() => setActiveTab(k)}
                      className={`p-4 text-left group cursor-pointer transition-all duration-300 ${
                        hasReport
                          ? "card-glow hover:border-white/[0.15]"
                          : "card-glass border-dashed border-white/[0.08] hover:border-white/[0.12]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{meta.icon}</span>
                        <span className={`font-medium text-sm ${meta.color}`}>{t(AGENT_I18N[k] || `agent.${k}`)}</span>
                        {!isUnlocked && !hasReport && (
                          <Lock size={11} className="text-white/20 ml-auto" />
                        )}
                        {hasReport && w.tags.length > 0 && (
                          <Tags size={11} className="text-white/20 ml-auto" />
                        )}
                      </div>
                      {hasReport ? (
                        <>
                          <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                            {stripMarkdown(w.report.slice(0, 100))}…
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-gold/40 text-[11px] group-hover:text-gold/80 transition-colors">
                              {t("reading.clickToView")} →
                            </p>
                            {!isUnlocked && (
                              <span className="text-[10px] text-white/20 bg-white/[0.04] px-1.5 py-0.5 rounded">
                                {t("reading.worker.insightCount", { count: String(insightCount) }) || `${insightCount} 条洞察`}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div>
                          <p className="text-white/25 text-xs leading-relaxed">
                            {t("reading.worker.lockedPreview")}
                          </p>
                          <p className="text-[10px] text-white/15 mt-1">
                            {t("reading.worker.unlockHint") || "解锁后可获得详细分析"}
                          </p>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )})()}

        {/* ── Individual Worker Reports ───────────────────── */}
        {WORKER_ORDER_ALL.map((k: string) => activeTab === k && (
          <div key={k}>
            {/* Back to overview button */}
            <button
              onClick={() => setActiveTab("master")}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs mb-4 transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              {t("reading.nav.overview")}
            </button>

            {workerMap[k].error ? (
              <div className="card-glass p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-400/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={28} className="text-red-400" />
                </div>
                <p className="text-white/50 text-sm">{t(AGENT_I18N[k] || `agent.${k}`)} {t("reading.error.analysis")}</p>
                <p className="text-white/25 text-xs mt-2 font-mono">{workerMap[k].error}</p>
              </div>
            ) : workerMap[k].report ? (
              <div className="space-y-4">
                <Suspense fallback={<div className="card-glass p-6 h-48" />}>
                  <PaywallGate
                    isUnlocked={isUnlocked}
                    title={`${t(AGENT_I18N[k] || `agent.${k}`)} ${t("reading.worker.unlockTitle")}`}
                    description={t("reading.worker.unlockDesc")}
                    onUnlock={() => router.push(localeHref("/pricing"))}
                    loading={false}
                    previewLines={5}
                    stardustBalance={user?.stardust_balance || 0}
                    onStardustUnlock={handleStardustUnlock}
                  >
                    <ReportSection
                      icon={AGENT_LABELS[k].icon}
                      title={`${t(AGENT_I18N[k] || `agent.${k}`)} ${t("reading.worker.unlockTitle")}`}
                      color={AGENT_LABELS[k].color}
                      content={workerMap[k].report}
                    />
                  </PaywallGate>
                </Suspense>
                {workerMap[k].tags.length > 0 && (
                  <div className="card-glass p-5">
                    <p className="text-white/30 text-xs mb-3">{t("reading.tags.title")}</p>
                    <div className="flex flex-wrap gap-2">
                      {workerMap[k].tags.map(tag => (
                        <span key={tag} className="text-xs px-2.5 py-1 bg-white/[0.06] rounded-full text-white/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline product recommendations for this worker */}
                {products.length > 0 && (
                  <div className="card-glass p-4 border-gold/10">
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingBag size={12} className="text-gold/50" />
                      <p className="text-gold/60 text-xs font-medium">{t("reading.worker.relatedGoods")}</p>
                    </div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-none">
                      {products.slice(0, 2).map(p => (
                        <a
                          key={p.id}
                          href={localeHref(`/shop/${p.id}`)}
                          className="flex items-center gap-3 min-w-[200px] p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-gold/20 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag size={14} className="text-gold/40" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white/70 text-[11px] font-medium truncate group-hover:text-gold transition-colors">{p.name}</p>
                            <p className="text-gold text-xs font-bold">{getProductPrice(p, region).symbol}{getProductPrice(p, region).price.toFixed(0)}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : !isUnlocked ? (
              /* ── Locked worker: show upgrade prompt ── */
              <div className="card-glass p-10 md:p-14 text-center">
                <div className="w-20 h-20 rounded-full bg-gold/5 border border-gold/15 flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-4xl">{AGENT_LABELS[k].icon}</span>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-ink border border-white/10 flex items-center justify-center">
                    <Lock size={12} className="text-white/40" />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-gold mb-2">
                  {t(AGENT_I18N[k] || `agent.${k}`)}
                </h3>
                <p className="text-white/40 text-sm mb-2">
                  {t("reading.worker.lockedTitle")}
                </p>
                <p className="text-white/25 text-xs mb-6 max-w-sm mx-auto leading-relaxed">
                  {t("reading.worker.lockedDesc")}
                </p>
                {(user?.stardust_balance || 0) >= STARDUST_COST.FULL_REPORT ? (
                  <button
                    onClick={handleStardustUnlock}
                    className="flex items-center gap-2 mx-auto text-sm px-8 py-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-blue-500/20 border border-violet-400/30 hover:border-violet-400/50 text-violet-300 hover:text-violet-200 transition-all"
                  >
                    <Sparkles size={16} />
                    {t("paywall.useStardust")}（{STARDUST_COST.FULL_REPORT} ✦）
                    <span className="text-violet-400/60 ml-1">· {user?.stardust_balance || 0} ✦</span>
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(localeHref("/pricing"))}
                    className="btn-gold flex items-center gap-2 mx-auto text-sm px-8 py-3"
                  >
                    <Crown size={16} />
                    {t("reading.worker.unlockFull")}
                  </button>
                )}
              </div>
            ) : (k === "face" || k === "palm" || k === "partner_face" || k === "partner_palm") ? (
              /* ── Skipped worker (no image/provided) ── */
              <div className="card-glass p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <Eye size={28} className="text-white/20" />
                </div>
                <p className="text-white/30 text-sm">
                  {t(AGENT_I18N[k] || `agent.${k}`)}
                </p>
                <p className="text-white/20 text-xs mt-1">
                  {t("reading.worker.noImageHint") || "未上传对应图片，分析已跳过"}
                </p>
              </div>
            ) : (
              <div className="card-glass p-12 text-center">
                <Eye size={32} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/25 text-sm">{t("reading.error.noData")}</p>
              </div>
            )}
          </div>
        ))}

        {/* ── Product Shop ──────────────────────────────── */}
        {activeTab === "shop" && (
          <div>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-4">
                <ShoppingBag size={24} className="text-gold" />
              </div>
              <h2 className="font-serif text-xl md:text-2xl font-bold text-gold mb-2">{t("reading.shop.title")}</h2>
              <p className="text-white/35 text-sm max-w-md">
                {t("reading.shop.desc")}
              </p>
              {/* Personalized match indicator */}
              {products.length > 0 && (
                <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-400/20">
                  <CheckCircle size={12} className="text-green-400" />
                  <span className="text-[11px] text-green-300/70">
                    {t("reading.shop.matched", { count: String(products.length) }) || `已为你匹配 ${products.length} 件专属好物`}
                  </span>
                </div>
              )}
            </div>

            {shopLoading ? (
              <div className="flex justify-center py-12">
                <div className="flex items-center gap-3 text-gold/60">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">{t("reading.shop.matching")}</span>
                </div>
              </div>
            ) : products.length > 0 ? (
              <Suspense fallback={<div className="grid sm:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card-glass h-48 animate-pulse" />
                ))}
              </div>}>
                <div className="grid sm:grid-cols-2 gap-5">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </Suspense>
            ) : (
              <div className="card-glass p-12 text-center">
                <ShoppingBag size={36} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-sm">{t("reading.shop.noMatch")}</p>
                <p className="text-white/15 text-xs mt-1">{t("reading.shop.tryLater")}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Event Analyzer ─────────────────────────────── */}
        {activeTab === "event" && (
          <Suspense fallback={<div className="card-glass p-10 text-center"><Loader2 size={24} className="animate-spin text-gold/40 mx-auto" /></div>}>
            <EventAnalyzer sessionId={id} />
          </Suspense>
        )}

        {/* ── Daily Almanac ──────────────────────────────── */}
        {activeTab === "almanac" && (
          <Suspense fallback={<div className="card-glass p-10 text-center"><Loader2 size={24} className="animate-spin text-gold/40 mx-auto" /></div>}>
            <DailyAlmanac sessionId={id} />
          </Suspense>
        )}

        {/* ── Chat Loop ──────────────────────────────────── */}
        {activeTab === "chat" && (
          <div>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-gold" />
              </div>
              <h2 className="font-serif text-xl font-bold text-gold mb-1">{t("reading.chat.title")}</h2>
              <p className="text-white/30 text-xs">{t("reading.chat.desc")}</p>
            </div>
            <Suspense fallback={<div className="card-glass p-10 text-center"><Loader2 size={24} className="animate-spin text-gold/40 mx-auto" /></div>}>
              <ChatBox
                sessionId={id}
                availableAgents={WORKER_ORDER_ALL.filter((k: string) => workerMap[k]?.report && !workerMap[k]?.error)}
              />
            </Suspense>
          </div>
        )}

        </FadeInSection>
      </div>

      {/* ── QR Payment Modal (Report Unlock) ──────────────────── */}
      {id && (
        <Suspense fallback={null}>
          <QRPaymentModal
            open={showPayment}
            onClose={() => setShowPayment(false)}
            readingId={id}
            postAction="unlock"
            region={region}
            onSuccess={handlePaymentSuccess}
          />
        </Suspense>
      )}

      {/* ── QR Payment Modal (One-Time Unlock) ──────────────── */}
      {id && (
        <Suspense fallback={null}>
          <QRPaymentModal
            open={showOneTimePayment}
            onClose={() => setShowOneTimePayment(false)}
            tier="onetime_unlock"
            readingId={id}
            postAction="onetime_unlock"
            region={region}
            onSuccess={handleOneTimePaymentSuccess}
          />
        </Suspense>
      )}

      {/* ── Post-Analysis Modal (auto-shows with products) ──────── */}
      {products.length > 0 && (
        <Suspense fallback={null}>
          <PostAnalysisModal
            products={products}
            onViewPrescription={() => {
              setActiveTab("master")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          />
        </Suspense>
      )}

      {/* ════════════════════════════════════════════════════════════
          KEYFRAMES (injected via style tag)
          ════════════════════════════════════════════════════════════ */}
      <style jsx global>{`
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes hero-border-spin {
          to { --angle: 360deg; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

/** Simple fade-in wrapper for tab transitions — pure CSS, no state */
function FadeInSection({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="animate-[fadeInUp_0.35s_ease-out_both]"
      style={{
        opacity: 1,
        transform: "translateY(0)",
      }}
    >
      {children}
    </div>
  )
}
