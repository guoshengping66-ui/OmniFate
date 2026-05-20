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
  // Weakness / risk tags
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

  // Strength tags
  wealth_boost:       { label: "Wealth Flowing",    color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "✨" },
  career_boost:       { label: "Career Rising",     color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "🚀" },
  love_boost:         { label: "Love Harmony",      color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "💕" },
  health_boost:       { label: "Vitality High",     color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "💪" },
  spiritual_boost:    { label: "Spirit Rising",     color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "🔮" },
}

/* ── Fallback: convert any snake_case to Title Case ─── */

function snakeToTitle(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
}

/* ── Public API ─── */

export function formatTag(raw: string): TagStyle {
  const key = raw.toLowerCase().trim()
  if (TAG_MAP[key]) return TAG_MAP[key]

  // Fallback: generate a neutral style
  return {
    label: snakeToTitle(raw),
    color: "text-white/50",
    bg: "bg-white/5",
    border: "border-white/10",
    icon: "◇",
  }
}
