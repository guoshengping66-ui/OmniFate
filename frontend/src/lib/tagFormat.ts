/**
 * Format backend snake_case tags into polished, user-friendly badges.
 *
 * Tags like "ren_depleted" → "Ren Energy"
 *          "peach_blossom_risk" → "Peach Blossom Risk"
 */

/* ── Mapping: known tag patterns → display text + color scheme ─── */

interface TagStyle {
  label: string
  color: string       // Tailwind text color class
  bg: string          // Tailwind bg color class
  border: string      // Tailwind border color class
  icon: string        // Emoji prefix
}

const TAG_MAP: Record<string, TagStyle> = {
  // ── English snake_case tags (from old workers) ──
  ren_depleted:       { label: "Ren Energy Low",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "⚠️" },
  peach_blossom_risk: { label: "Romance Risk",      color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "🌸" },
  wealth_block:       { label: "Wealth Blocked",    color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "💰" },
  health_caution:     { label: "Health Attention",  color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "💚" },
  career_pressure:    { label: "Career Pressure",   color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "📊" },
  emotional_volatility:{ label: "Emotional Flux",   color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "🌊" },
  fire_weak:          { label: "Fire Weak",         color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "🔥" },
  water_excess:       { label: "Water Excess",      color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   icon: "💧" },
  wood_weak:          { label: "Wood Weak",         color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20",  icon: "🌿" },
  earth_weak:         { label: "Earth Weak",        color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "🌍" },
  metal_weak:         { label: "Metal Weak",        color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "⚔️" },

  // ── Strength tags (English) ──
  wealth_boost:       { label: "Wealth Flowing",    color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "✨" },
  career_boost:       { label: "Career Rising",     color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "🚀" },
  love_boost:         { label: "Love Harmony",      color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "💕" },
  health_boost:       { label: "Vitality High",     color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "💪" },
  spiritual_boost:    { label: "Spirit Rising",     color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "🔮" },

  // ── Chinese tags (from current workers) — 八字 ──
  "官杀混杂":         { label: "Officer-Killer Mix",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "⚠️" },
  "食神受伤":         { label: "Eating God Weakened",    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "🍽️" },
  "财星微弱":         { label: "Wealth Star Weak",       color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "💰" },
  "印星为忌":         { label: "Seal Star Unfavorable",  color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "📜" },
  "比劫争财":         { label: "Peer Competition",       color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "⚔️" },
  "伤官见官":         { label: "Hurting Officer Clash",  color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🔥" },
  "财多身弱":         { label: "Wealth Overwhelms Self", color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "💸" },
  "食神泄秀":         { label: "Eating God Expression",  color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "✨" },
  "杀旺攻身":         { label: "Killer Attacks Self",    color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "⚔️" },
  "桃花旺盛":         { label: "Peach Blossom Strong",   color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "🌸" },
  "驿马星动":         { label: "Travel Star Active",     color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   icon: "🐴" },
  "天乙贵人":         { label: "Noble Person Helper",    color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "🤝" },
  "华盖星":           { label: "Scholar Star",           color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "🎓" },
  "红鸾天喜":         { label: "Marriage Star",          color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "💒" },
  "羊刃":             { label: "Blade Star",             color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🗡️" },
  "空亡":             { label: "Void Emptiness",         color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "🌀" },

  // ── Chinese tags — 奇门遁甲 ──
  "杜门伏吟":         { label: "Hidden Door Stagnant",   color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "🚪" },
  "时干惊门":         { label: "Shock Door Activity",    color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "⚡" },
  "天芮寄宫":         { label: "Tian Rui Illness Star",  color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🏥" },
  "螣蛇缠绕":         { label: "Snake Entanglement",     color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "🐍" },
  "白虎凶兆":         { label: "White Tiger Omen",       color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🐯" },
  "玄武暗耗":         { label: "Dark Water Drain",       color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   icon: "🌑" },
  "九地保守":         { label: "Earth保守 Energy",       color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "🏔️" },
  "值符吉庆":         { label: "Master Star Auspicious", color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "🌟" },

  // ── Chinese tags — 紫微斗数 ──
  "命宫空亡":         { label: "Life Palace Void",       color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "🌀" },
  "天同化忌":         { label: "Tian Tong Restrained",   color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "❄️" },
  "武曲化忌":         { label: "Wu Qu Restricted",       color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "💰" },
  "巨门暗曜":         { label: "Ju Men Dark Star",       color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "🌑" },
  "廉贞囚星":         { label: "Lian Zhen Prison Star",  color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🔒" },
  "破军耗星":         { label: "Po Jun Drain Star",      color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "💥" },
  "七杀朝斗":         { label: "Seven Killings Rising",   color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "⚔️" },
  "紫微帝座":         { label: "Emperor Star",           color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "👑" },
  "太阳化权":         { label: "Sun Empowered",          color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "☀️" },
  "太阴化科":         { label: "Moon Scholarly",         color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "🌙" },

  // ── Chinese tags — 星盘 ──
  "水星逆行":         { label: "Mercury Retrograde",     color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "🔄" },
  "土星刑克":         { label: "Saturn Square",          color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "🪐" },
  "天王突变":         { label: "Uranus Disruption",      color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   icon: "⚡" },
  "海王迷惑":         { label: "Neptune Confusion",      color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "🌊" },
  "冥王转化":         { label: "Pluto Transform",        color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🔥" },
  "火星冲动":         { label: "Mars Impulsive",         color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "🔴" },
  "金星和谐":         { label: "Venus Harmonious",       color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "💕" },
  "木星扩展":         { label: "Jupiter Expansive",      color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "🌟" },

  // ── Chinese tags — 通用/塔罗/面相/手相 ──
  "脾胃虚弱":         { label: "Spleen Weak",            color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "🫁" },
  "肝胆不适":         { label: "Liver Attention",        color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20",  icon: "💚" },
  "心脏压力":         { label: "Heart Pressure",         color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "❤️" },
  "多噩梦":           { label: "Nightmare Prone",        color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "🌙" },
  "巨人心热":         { label: "Giant Heart Warm",       color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "🔥" },
  "挑衅事":           { label: "Provocation Risk",       color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "⚡" },
  "粗发展":           { label: "Rough Growth",           color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   icon: "📈" },
  "财官咸库":         { label: "Wealth-Career Treasury", color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "🏦" },
  "父母宫刑":         { label: "Parents Palace Clash",   color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "👨‍👩‍👧" },
  "夫妻宫逢冲":       { label: "Spouse Palace Clash",    color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "💔" },
}

/* ── Fallback: convert any snake_case to Title Case ─── */

function snakeToTitle(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
}

/* ── Public API ─── */

export function formatTag(raw: string): TagStyle {
  // Strip backend modifiers: "(待验证)", "严重⚠️"
  let clean = raw.trim()
  let badge = ""
  if (clean.startsWith("严重⚠️")) {
    clean = clean.replace("严重⚠️", "").trim()
    badge = " ⚠️"
  }
  if (clean.endsWith("(待验证)")) {
    clean = clean.replace("(待验证)", "").trim()
    badge = " (Unverified)"
  }

  // Try exact match first (Chinese tags are case-sensitive)
  if (TAG_MAP[clean]) {
    return { ...TAG_MAP[clean], label: TAG_MAP[clean].label + badge }
  }

  // Try lowercase match (English snake_case tags)
  const key = clean.toLowerCase()
  if (TAG_MAP[key]) {
    return { ...TAG_MAP[key], label: TAG_MAP[key].label + badge }
  }

  // Fallback: generate a neutral style
  return {
    label: snakeToTitle(clean) + badge,
    color: "text-white/50",
    bg: "bg-white/5",
    border: "border-white/10",
    icon: "◇",
  }
}
