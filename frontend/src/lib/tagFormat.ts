/**
 * Format backend snake_case tags into polished, user-friendly badges.
 *
 * Tags like "ren_depleted" → "Ren Energy"
 *          "peach_blossom_risk" → "Social Pattern Alert"
 */

/* ── Mapping: known tag patterns → display text + color scheme ─── */

interface TagStyle {
  label: string
  labelCn: string     // Chinese label
  color: string       // Tailwind text color class
  bg: string          // Tailwind bg color class
  border: string      // Tailwind border color class
  icon: string        // Emoji prefix
}

const TAG_MAP: Record<string, TagStyle> = {
  // ── English snake_case tags (from old workers) ──
  ren_depleted:       { label: "Ren Energy Low",    labelCn: "壬水不足",      color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "⚠️" },
  peach_blossom_risk: { label: "Social Pattern Alert",      labelCn: "感情风险",      color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "🌸" },
  wealth_block:       { label: "Wealth Blocked",    labelCn: "财运受阻",      color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "💰" },
  health_caution:     { label: "Health Attention",  labelCn: "健康关注",      color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "💚" },
  career_pressure:    { label: "Career Pressure",   labelCn: "事业压力",      color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "📊" },
  emotional_volatility:{ label: "Emotional Flux",   labelCn: "情绪波动",      color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "🌊" },
  fire_weak:          { label: "Fire Weak",         labelCn: "火弱",          color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "🔥" },
  water_excess:       { label: "Water Excess",      labelCn: "水旺",          color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   icon: "💧" },
  wood_weak:          { label: "Wood Weak",         labelCn: "木弱",          color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20",  icon: "🌿" },
  earth_weak:         { label: "Earth Weak",        labelCn: "土弱",          color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "🌍" },
  metal_weak:         { label: "Metal Weak",        labelCn: "金弱",          color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "⚔️" },

  // ── Strength tags (English) ──
  wealth_boost:       { label: "Wealth Flowing",    labelCn: "财运亨通",      color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "✨" },
  career_boost:       { label: "Career Rising",     labelCn: "事业上升",      color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "🚀" },
  love_boost:         { label: "Love Harmony",      labelCn: "感情和谐",      color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "💕" },
  health_boost:       { label: "Vitality High",     labelCn: "精力充沛",      color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "💪" },
  spiritual_boost:    { label: "Focus Rising",     labelCn: "专注提升",      color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "🔮" },

  // ── Chinese tags (from current workers) — 八字 ──
  "官杀混杂":         { label: "Mixed Challenge Pattern",    labelCn: "官杀混杂",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "⚠️" },
  "食神受伤":         { label: "Creative Flow Reduced",  labelCn: "食神受伤",    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "🍽️" },
  "财星微弱":         { label: "Financial Flow Reduced", labelCn: "财星微弱",    color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "💰" },
  "印星为忌":         { label: "Resource Pattern Conflict",  labelCn: "印星为忌",    color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "📜" },
  "比劫争财":         { label: "Peer Competition",       labelCn: "比劫争财",    color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "⚔️" },
  "伤官见官":         { label: "Independence Tension",    labelCn: "伤官见官",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🔥" },
  "财多身弱":         { label: "Financial Pressure",     labelCn: "财多身弱",    color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "💸" },
  "食神泄秀":         { label: "Creative Expression Active",  labelCn: "食神泄秀",    color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "✨" },
  "杀旺攻身":         { label: "Challenge Pattern Intensity",    labelCn: "杀旺攻身",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "⚔️" },
  "桃花旺盛":         { label: "Romance Strong",   labelCn: "感情活跃",    color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "🌸" },
  "驿马星动":         { label: "Mobility Pattern Active",     labelCn: "驿马星动",    color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   icon: "🐴" },
  "天乙贵人":         { label: "Support Pattern",    labelCn: "天乙贵人",    color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "🤝" },
  "华盖星":           { label: "Focus Pattern Active",           labelCn: "华盖星",      color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "🎓" },
  "红鸾天喜":         { label: "Partnership Pattern",          labelCn: "红鸾天喜",    color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "💒" },
  "羊刃":             { label: "Edge Pattern",             labelCn: "羊刃",        color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🗡️" },
  "空亡":             { label: "Not Applicable",         labelCn: "空亡",        color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "🌀" },

  // ── Chinese tags — 策略分析 ──
  "杜门伏吟":         { label: "Hidden Pattern Stagnant",   labelCn: "杜门伏吟",    color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "🚪" },
  "时干惊门":         { label: "Alert Pattern Active",    labelCn: "时干惊门",    color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "⚡" },
  "天芮寄宫":         { label: "Health Attention Point",  labelCn: "天芮寄宫",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🏥" },
  "螣蛇缠绕":         { label: "Complex Pattern Active",     labelCn: "螣蛇缠绕",    color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "🐍" },
  "白虎凶兆":         { label: "Challenge Alert",         labelCn: "白虎凶兆",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🐯" },
  "玄武暗耗":         { label: "Hidden Drain Pattern",       labelCn: "玄武暗耗",    color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   icon: "🌑" },
  "九地保守":         { label: "Grounded Pattern",           labelCn: "九地保守",    color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "🏔️" },
  "值符吉庆":         { label: "Core Pattern Positive",  labelCn: "值符吉庆",    color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "🌟" },

  // ── Chinese tags — 星盘系统 ──
  "命宫空亡":         { label: "Foundation Profile Gap",  labelCn: "命宫空亡",    color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "🌀" },
  "天同化忌":         { label: "Harmony Pattern Restrained",   labelCn: "天同化忌",    color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "❄️" },
  "武曲化忌":         { label: "Financial Pattern Restricted",       labelCn: "武曲化忌",    color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "💰" },
  "巨门暗曜":         { label: "Communication Pattern Shadow",       labelCn: "巨门暗曜",    color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "🌑" },
  "廉贞囚星":         { label: "Authority Pattern Tension",  labelCn: "廉贞囚星",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🔒" },
  "破军耗星":         { label: "Transformation Pattern Drain",      labelCn: "破军耗星",    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "💥" },
  "七杀朝斗":         { label: "Challenge Pattern Rising",   labelCn: "七杀朝斗",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "⚔️" },
  "帝座":         { label: "Emperor Star",           labelCn: "帝座",    color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "👑" },
  "太阳化权":         { label: "Sun Empowered",          labelCn: "太阳化权",    color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "☀️" },
  "太阴化科":         { label: "Moon Scholarly",         labelCn: "太阴化科",    color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "🌙" },

  // ── Chinese tags — 星盘分析 ──
  "水星逆行":         { label: "Mercury Retrograde",     labelCn: "水星逆行",    color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "🔄" },
  "土星刑克":         { label: "Saturn Square",          labelCn: "土星刑克",    color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "🪐" },
  "天王突变":         { label: "Uranus Disruption",      labelCn: "天王突变",    color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   icon: "⚡" },
  "海王迷惑":         { label: "Neptune Confusion",      labelCn: "海王迷惑",    color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "🌊" },
  "冥王转化":         { label: "Pluto Transform",        labelCn: "冥王转化",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🔥" },
  "火星冲动":         { label: "Mars Impulsive",         labelCn: "火星冲动",    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "🔴" },
  "金星和谐":         { label: "Venus Harmonious",       labelCn: "金星和谐",    color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "💕" },
  "木星扩展":         { label: "Jupiter Expansive",      labelCn: "木星扩展",    color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "🌟" },

  // ── Chinese tags — 通用/塔罗/面相/手相 ──
  "脾胃虚弱":         { label: "Spleen Weak",            labelCn: "脾胃虚弱",    color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "🫁" },
  "肝胆不适":         { label: "Liver Attention",        labelCn: "肝胆不适",    color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20",  icon: "💚" },
  "心脏压力":         { label: "Heart Pressure",         labelCn: "心脏压力",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "❤️" },
  "多噩梦":           { label: "Nightmare Prone",        labelCn: "多噩梦",      color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "🌙" },
  "巨人心热":         { label: "Empathy Pattern",        labelCn: "巨人心热",    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "🔥" },
  "挑衅事":           { label: "Provocation Risk",       labelCn: "挑衅事",      color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "⚡" },
  "粗发展":           { label: "Early Development",       labelCn: "粗发展",      color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "📈" },
  "财官咸库":         { label: "Prosperity Pattern",      labelCn: "财官咸库",    color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "🏦" },
  "父母宫刑":         { label: "Family Pattern Tension",   labelCn: "父母宫刑",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "👨‍👩‍👧" },
  "夫妻宫逢冲":       { label: "Partnership Pattern Tension",  labelCn: "夫妻宫逢冲",  color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "💔" },
}

/* ── Fallback: convert any snake_case to Title Case ─── */

function snakeToTitle(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
}

/* ── Public API ─── */

export function formatTag(raw: string, lang: string = "en"): TagStyle {
  // Strip backend modifiers: "(待验证)", "严重⚠️" — do not display to users
  let clean = raw.trim()
  let badge = ""
  if (clean.startsWith("严重⚠️")) {
    clean = clean.replace("严重⚠️", "").trim()
  }
  if (clean.endsWith("(待验证)")) {
    clean = clean.replace("(待验证)", "").trim()
  }

  const isZh = lang === "zh"

  // 1. Try exact match (Chinese tags are case-sensitive)
  if (TAG_MAP[clean]) {
    const t = TAG_MAP[clean]
    return { ...t, label: (isZh ? t.labelCn : t.label) + badge }
  }

  // 2. Try lowercase match (English snake_case tags)
  const key = clean.toLowerCase()
  if (TAG_MAP[key]) {
    const t = TAG_MAP[key]
    return { ...t, label: (isZh ? t.labelCn : t.label) + badge }
  }

  // 3. For compound Chinese tags (e.g. "天芮寄宫脾胃弱"), find the longest matching substring
  let bestMatch: TagStyle | null = null
  let bestLen = 0
  for (const [tagKey, style] of Object.entries(TAG_MAP)) {
    if (tagKey.length >= 2 && clean.includes(tagKey) && tagKey.length > bestLen) {
      bestMatch = style
      bestLen = tagKey.length
    }
  }
  if (bestMatch) {
    return { ...bestMatch, label: (isZh ? bestMatch.labelCn : bestMatch.label) + badge }
  }

  // 4. Fallback: use raw tag as-is for Chinese, Title Case for English
  return {
    label: (isZh ? clean : snakeToTitle(clean)) + badge,
    labelCn: clean,
    color: "text-white/50",
    bg: "bg-white/5",
    border: "border-white/10",
    icon: "◇",
  }
}
