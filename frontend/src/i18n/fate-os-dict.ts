/**
 * Fate OS Internationalization Dictionary
 * ========================================
 * Premium cyberpunk-style translations for Traditional Chinese Metaphysics.
 * Target audience: Global Web3 traders, hackers, and tech-savvy users.
 *
 * Style: Technical, gamified, geek-culture vibe.
 * NO archaic fortune-telling words. Use system/energy/tactical jargon.
 */

// ─── Five Elements (五行) ───────────────────────────────────────────────────
export const ELEMENTS = {
  木: { en: "Wood", tag: "Vitality / Growth", icon: "🌿" },
  火: { en: "Fire", tag: "Entropy / Acceleration", icon: "🔥" },
  土: { en: "Earth", tag: "Stability / Matrix", icon: "🪨" },
  金: { en: "Metal", tag: "Resolution / Execution", icon: "⚔️" },
  水: { en: "Water", tag: "Flow / Intelligence", icon: "💧" },
} as const

// ─── Eight Trigrams (八卦) ──────────────────────────────────────────────────
export const BAGUA = {
  乾: { en: "Qian", dynamic: "The Creative", node: "Sky Node [Dominance]", symbol: "☰" },
  兑: { en: "Dui", dynamic: "The Joyous", node: "Lake Node [Resonance]", symbol: "☱" },
  离: { en: "Li", dynamic: "The Clinging", node: "Fire Node [Illumination]", symbol: "☲" },
  震: { en: "Zhen", dynamic: "The Arousing", node: "Thunder Node [Disruption]", symbol: "☳" },
  巽: { en: "Xun", dynamic: "The Gentle", node: "Wind Node [Penetration]", symbol: "☴" },
  坎: { en: "Kan", dynamic: "The Abysmal", node: "Water Node [Vulnerability]", symbol: "☵" },
  艮: { en: "Gen", dynamic: "The Keeping Still", node: "Mountain Node [Resistance]", symbol: "☶" },
  坤: { en: "Kun", dynamic: "The Receptive", node: "Earth Node [Absorption]", symbol: "☷" },
} as const

// ─── Auspicious / Inauspicious Actions (宜 / 忌) ──────────────────────────
export const YI_JI = {
  // 宜 (Auspicious Vectors)
  宜沟通: { en: "Strategic Communication", tactical: "Initiate high-bandwidth dialogue" },
  宜签约: { en: "Protocol Execution", tactical: "Sign binding agreements" },
  宜合作: { en: "Alliance Formation", tactical: "Establish cooperative protocols" },
  宜行动: { en: "Action Deployment", tactical: "Execute pending operations" },
  宜决策: { en: "Decision Matrix", tactical: "Commit to critical choices" },
  宜复盘: { en: "System Audit", tactical: "Review and analyze past cycles" },
  宜整理: { en: "Resource Organization", tactical: "Consolidate scattered assets" },
  宜社交: { en: "Network Expansion", tactical: "Build strategic connections" },
  宜外出: { en: "Field Operations", tactical: "Leave base for external missions" },
  宜休息: { en: "Recovery Protocol", tactical: "Enter low-power recharge mode" },
  宜冥想: { en: "Deep Scan Mode", tactical: "Run internal diagnostics" },
  宜静心: { en: "Signal Stabilization", tactical: "Reduce cognitive noise" },
  宜规划: { en: "Blueprint Design", tactical: "Draft multi-phase strategy" },
  宜学习: { en: "Skill Ingestion", tactical: "Download new competencies" },
  宜投资: { en: "Capital Injection", tactical: "Deploy funds to growth vectors" },
  宜守成: { en: "Fortress Mode", tactical: "Maintain current positions" },
  宜静养: { en: "System Hibernation", tactical: "Minimize energy expenditure" },
  宜反思: { en: "Retrospective Analysis", tactical: "Process accumulated data" },
  宜热情行动: { en: "Enthusiastic Deployment", tactical: "Channel high energy into execution" },
  宜冷静思考: { en: "Cool-Headed Processing", tactical: "Engage analytical subsystems" },
  宜决断: { en: "Decisive Strike", tactical: "Commit to irreversible actions" },
  宜学习成长: { en: "Evolution Protocol", tactical: "Accelerate personal development" },
  宜稳健积累: { en: "Steady Accumulation", tactical: "Build compound advantages" },
  诸事皆宜: { en: "All Vectors Green", tactical: "System-wide optimal alignment" },
  安床: { en: "Grounding Ritual", tactical: "Establish stable foundation" },
  祈福: { en: "Energy Realignment", tactical: "Recalibrate spiritual frequencies" },
  嫁娶: { en: "Union Protocol", tactical: "Form permanent bond alliance" },
  开市: { en: "Market Launch", tactical: "Activate commerce operations" },
  交易: { en: "Exchange Execution", tactical: "Process transaction sequences" },
  搬迁: { en: "Relocation Matrix", tactical: "Shift operational base" },
  修造: { en: "Construction Phase", tactical: "Build and upgrade infrastructure" },
  动土: { en: "Project Initiation", tactical: "Break ground on new ventures" },
  栽种: { en: "Cultivation Sequence", tactical: "Plant seeds for future harvest" },
  出行: { en: "Departure Vector", tactical: "Embark on external missions" },
  会友: { en: "Networking Protocol", tactical: "Connect with allies" },
  求医: { en: "Health Diagnostics", tactical: "Seek system repairs" },
  开工: { en: "Workstation Boot", tactical: "Initialize productivity mode" },
  纳财: { en: "Wealth Collection", tactical: "Gather scattered resources" },

  // 忌 (Risk Warnings)
  忌争执: { en: "Conflict Avoidance", tactical: "Suppress adversarial protocols" },
  忌投资: { en: "Capital Preservation", tactical: "Halt all investment activities" },
  忌冲动: { en: "Impulse Suppression", tactical: "Override emotional triggers" },
  忌冒进: { en: "Recklessness Guard", tactical: "Engage caution subsystems" },
  忌重大决定: { en: "Decision Freeze", tactical: "Postpone critical commitments" },
  忌急躁: { en: "Patience Protocol", tactical: "Decelerate response cycles" },
  忌犹豫: { en: "Indecision Alert", tactical: "Force decisive action" },
  忌固执: { en: "Rigidity Warning", tactical: "Enable adaptive flexibility" },
  忌过度扩张: { en: "Overextension Alert", tactical: "Consolidate current territories" },
  忌僵化: { en: "Stagnation Detection", tactical: "Break routine patterns" },
  诸事不宜: { en: "System Standby", tactical: "All operations on hold" },
  开仓: { en: "Aggressive Trading Alert", tactical: "Avoid high-risk market entry" },
  诉讼: { en: "Legal Conflict Zone", tactical: "Steer clear of disputes" },
} as const

// ─── Fortune Levels (运势等级) ──────────────────────────────────────────────
export const FORTUNE_LEVELS = {
  大吉: { en: "Supreme Alignment", level: 7, color: "gold" },
  中吉: { en: "Strong Resonance", level: 6, color: "green" },
  小吉: { en: "Positive Signal", level: 5, color: "blue" },
  吉: { en: "Favorable Vector", level: 4, color: "teal" },
  末吉: { en: "Marginal Gain", level: 3, color: "yellow" },
  凶: { en: "System Warning", level: 2, color: "orange" },
  大凶: { en: "Critical Alert", level: 1, color: "red" },
} as const

// ─── Dimension Names (维度名称) ─────────────────────────────────────────────
export const DIMENSIONS = {
  事业: { en: "Career", icon: "⚔️", tactical: "Professional Operations" },
  感情: { en: "Relationship", icon: "♥️", tactical: "Bond Dynamics" },
  财运: { en: "Wealth", icon: "◎", tactical: "Capital Flow" },
  健康: { en: "Health", icon: "☯️", tactical: "System Integrity" },
  学业: { en: "Knowledge", icon: "☰", tactical: "Skill Acquisition" },
  人际: { en: "Network", icon: "⬡", tactical: "Alliance Matrix" },
  出行: { en: "Travel", icon: "✈️", tactical: "Field Operations" },
} as const

// ─── Heavenly Stems & Earthly Branches (天干地支) ───────────────────────────
export const TIANGAN = {
  甲: { en: "Jia", element: "Wood", attribute: "Pioneer / Initiator" },
  乙: { en: "Yi", element: "Wood", attribute: "Adaptability / Growth" },
  丙: { en: "Bing", element: "Fire", attribute: "Radiance / Passion" },
  丁: { en: "Ding", element: "Fire", attribute: "Precision / Focus" },
  戊: { en: "Wu", element: "Earth", attribute: "Foundation / Reliability" },
  己: { en: "Ji", element: "Earth", attribute: "Nurturing / Integration" },
  庚: { en: "Geng", element: "Metal", attribute: "Discipline / Justice" },
  辛: { en: "Xin", element: "Metal", attribute: "Refinement / Elegance" },
  壬: { en: "Ren", element: "Water", attribute: "Wisdom / Flow" },
  癸: { en: "Gui", element: "Water", attribute: "Intuition / Mystery" },
} as const

export const DIZHI = {
  子: { en: "Zi", animal: "Rat", element: "Water", time: "23:00-01:00" },
  丑: { en: "Chou", animal: "Ox", element: "Earth", time: "01:00-03:00" },
  寅: { en: "Yin", animal: "Tiger", element: "Wood", time: "03:00-05:00" },
  卯: { en: "Mao", animal: "Rabbit", element: "Wood", time: "05:00-07:00" },
  辰: { en: "Chen", animal: "Dragon", element: "Earth", time: "07:00-09:00" },
  巳: { en: "Si", animal: "Snake", element: "Fire", time: "09:00-11:00" },
  午: { en: "Wu", animal: "Horse", element: "Fire", time: "11:00-13:00" },
  未: { en: "Wei", animal: "Goat", element: "Earth", time: "13:00-15:00" },
  申: { en: "Shen", animal: "Monkey", element: "Metal", time: "15:00-17:00" },
  酉: { en: "You", animal: "Rooster", element: "Metal", time: "17:00-19:00" },
  戌: { en: "Xu", animal: "Dog", element: "Earth", time: "19:00-21:00" },
  亥: { en: "Hai", animal: "Pig", element: "Water", time: "21:00-23:00" },
} as const

// ─── Special Concepts (特殊概念) ────────────────────────────────────────────
export const SPECIAL_CONCEPTS = {
  // 纳音五行
  天河水: { en: "Celestial River Current", attribute: "Flowing Wisdom / Infinite Depth" },
  路旁土: { en: "Roadside Earth", attribute: "Grounded Stability / Steady Path" },
  壁上土: { en: "Wall Earth", attribute: "Protective Foundation / Structural Integrity" },
  金箔金: { en: "Gold Leaf Metal", attribute: "Refined Elegance / Delicate Power" },
  覆灯火: { en: "Lantern Fire", attribute: "Guiding Light / Inner Illumination" },
  天上火: { en: "Celestial Fire", attribute: "Radiant Authority / Universal Heat" },
  松柏木: { en: "Pine Wood", attribute: "Enduring Vitality / Unyielding Growth" },
  长流水: { en: "Flowing Water", attribute: "Persistent Momentum / Adaptive Flow" },
  沙中金: { en: "Sand Metal", attribute: "Hidden Value / Latent Power" },
  山下火: { en: "Mountain Fire", attribute: "Controlled Burn / Strategic Release" },
  平地木: { en: "Plain Wood", attribute: "Grounded Growth / Practical Expansion" },
  钗钏金: { en: "Hairpin Metal", attribute: "Ornamental Strength / Functional Beauty" },
  桑柘木: { en: "Mulberry Wood", attribute: "Resilient Productivity / Quiet Strength" },
  大溪水: { en: "Great Stream Water", attribute: "Mighty Current / Expansive Flow" },
  沙中土: { en: "Sand Earth", attribute: "Dispersed Foundation / Adaptive Ground" },
  山头火: { en: "Hilltop Fire", attribute: "Visible Impact / Prominent Influence" },
  泉中水: { en: "Spring Water", attribute: "Pure Source / Regenerative Power" },
  屋上土: { en: "Roof Earth", attribute: "Sheltering Coverage / Protective Layer" },
  霹雳火: { en: "Thunder Fire", attribute: "Sudden Impact / Explosive Energy" },

  // 特殊时间概念
  子时: { en: "Midnight Hour", attribute: "Renewal Phase / Zero Point" },
  丑时: { en: "Ox Hour", attribute: "Deep Processing / Silent Work" },
  寅时: { en: "Tiger Hour", attribute: "Dawn Activation / Energy Surge" },
  卯时: { en: "Rabbit Hour", attribute: "Morning Clarity / Fresh Start" },
  辰时: { en: "Dragon Hour", attribute: "Peak Momentum / Maximum Output" },
  巳时: { en: "Snake Hour", attribute: "Strategic Pause / Contemplation" },
  午时: { en: "Horse Hour", attribute: "Midday Zenith / Full Power" },
  未时: { en: "Goat Hour", attribute: "Afternoon Integration / Reflection" },
  申时: { en: "Monkey Hour", attribute: "Late Activity / Quick Decisions" },
  酉时: { en: "Rooster Hour", attribute: "Evening Transition / Wind Down" },
  戌时: { en: "Dog Hour", attribute: "Dusk Guard / Protective Mode" },
  亥时: { en: "Pig Hour", attribute: "Night Rest / System Sleep" },
} as const

// ─── Body Features (面相手相特征) ──────────────────────────────────────────
export const BODY_FEATURES = {
  // 面型
  方脸: { en: "Square Face", attribute: "Determined / Methodical" },
  圆脸: { en: "Round Face", attribute: "Adaptable / Social" },
  长脸: { en: "Oval Face", attribute: "Analytical / Strategic" },
  瓜子脸: { en: "Heart-Shaped Face", attribute: "Creative / Intuitive" },

  // 五行面型
  金形面: { en: "Metal Face", attribute: "Structured / Disciplined" },
  木形面: { en: "Wood Face", attribute: "Growth-Oriented / Ambitious" },
  水形面: { en: "Water Face", attribute: "Fluid / Communicative" },
  火形面: { en: "Fire Face", attribute: "Passionate / Dynamic" },
  土形面: { en: "Earth Face", attribute: "Stable / Reliable" },
} as const

// ─── Helper Functions ──────────────────────────────────────────────────────

/**
 * Get English translation for a Chinese yi/ji item
 */
export function translateYiJi(chinese: string): string {
  // Try exact match first
  if (YI_JI[chinese as keyof typeof YI_JI]) {
    return YI_JI[chinese as keyof typeof YI_JI].en
  }

  // Try partial match
  for (const [key, value] of Object.entries(YI_JI)) {
    if (chinese.includes(key.replace("宜", "").replace("忌", ""))) {
      return value.en
    }
  }

  // Fallback: return original
  return chinese
}

/**
 * Get tactical description for a yi/ji item
 */
export function getTacticalAction(chinese: string): string {
  if (YI_JI[chinese as keyof typeof YI_JI]) {
    return YI_JI[chinese as keyof typeof YI_JI].tactical
  }
  return ""
}

/**
 * Get fortune level info
 */
export function getFortuneLevel(chinese: string) {
  return FORTUNE_LEVELS[chinese as keyof typeof FORTUNE_LEVELS] || {
    en: chinese,
    level: 3,
    color: "gray",
  }
}

/**
 * Get element info
 */
export function getElementInfo(chinese: string) {
  return ELEMENTS[chinese as keyof typeof ELEMENTS] || {
    en: chinese,
    tag: "Unknown Element",
    icon: "❓",
  }
}

/**
 * Get bagua info
 */
export function getBaguaInfo(chinese: string) {
  return BAGUA[chinese as keyof typeof BAGUA] || {
    en: chinese,
    dynamic: "Unknown",
    node: "Unknown Node",
    symbol: "❓",
  }
}

/**
 * Get dimension info
 */
export function getDimensionInfo(chinese: string) {
  return DIMENSIONS[chinese as keyof typeof DIMENSIONS] || {
    en: chinese,
    icon: "❓",
    tactical: "Unknown Dimension",
  }
}
