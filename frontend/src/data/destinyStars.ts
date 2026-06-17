/* ═══════════════════════════════════════════════════════════════════
   Shared Destiny Stars data

   Used by LifeRouteGeneration.tsx (galaxy route map) and
   KeyLifeNodes.tsx (star card grid). Single source of truth.
   ═══════════════════════════════════════════════════════════════════ */

export interface DestinyStar {
  id: number
  year: string
  labelZh: string
  labelEn: string
  /** Position percentage within the star map (used by LifeRouteGeneration) */
  x: number
  y: number
  /** Visual magnitude — controls star size in the map */
  magnitude: number
  color: string
  growthZh: number
  growthEn: number
  opportunityZh: number
  opportunityEn: number
  challengeZh: number
  challengeEn: number
  keywords: { zh: string[]; en: string[] }
  aiZh: string
  aiEn: string
}

/* ── 命运窗口：机会区间 ── */

export interface OpportunityZone {
  id: string
  labelZh: string
  labelEn: string
  /** Center position percentage within the star map */
  x: number
  y: number
  /** Nebula dimensions (percentage) */
  width: number
  height: number
  color: string
  /** Year range text */
  yearRange: { zh: string; en: string }
  /** Description of this opportunity window */
  descZh: string
  descEn: string
}

export const OPPORTUNITY_ZONES: OpportunityZone[] = [
  {
    id: "growth",
    labelZh: "成长窗口",
    labelEn: "Growth Window",
    x: 17, y: 30,
    width: 22, height: 35,
    color: "#C5A880",
    yearRange: { zh: "2025–2027", en: "2025–2027" },
    descZh: "能力跃迁 → 事业突破",
    descEn: "Capability Leap → Career Breakthrough",
  },
  {
    id: "wealth",
    labelZh: "财富窗口",
    labelEn: "Wealth Window",
    x: 34, y: 18,
    width: 20, height: 30,
    color: "#D4AF37",
    yearRange: { zh: "2027–2029", en: "2027–2029" },
    descZh: "事业突破 → 财富积累",
    descEn: "Career Breakthrough → Wealth Accumulation",
  },
  {
    id: "transform",
    labelZh: "转型窗口",
    labelEn: "Transformation Window",
    x: 67, y: 46,
    width: 22, height: 32,
    color: "#A882FF",
    yearRange: { zh: "2031–2033", en: "2031–2033" },
    descZh: "关系深化 → 人生转型",
    descEn: "Bond Deepening → Life Transformation",
  },
]

export const DESTINY_STARS: DestinyStar[] = [
  {
    id: 1, year: "2025",
    labelZh: "能力跃迁期", labelEn: "Capability Leap",
    x: 8, y: 38, magnitude: 4, color: "#C5A880",
    growthZh: 5, growthEn: 5,
    opportunityZh: 4, opportunityEn: 4,
    challengeZh: 3, challengeEn: 3,
    keywords: { zh: ["学习", "创业", "转型", "领导力"], en: ["Learning", "Startup", "Transition", "Leadership"] },
    aiZh: "这一阶段更适合集中资源完成能力升级与职业突破。命盘显示开创力与直觉同步上升，是建立核心竞争力的最佳时机。",
    aiEn: "This phase favors consolidating resources for capability upgrades. Initiative and intuition rise in sync — the best time to build core competencies.",
  },
  {
    id: 2, year: "2027",
    labelZh: "事业突破阶段", labelEn: "Career Breakthrough",
    x: 25, y: 20, magnitude: 5, color: "#A882FF",
    growthZh: 4, growthEn: 4,
    opportunityZh: 5, opportunityEn: 5,
    challengeZh: 4, challengeEn: 4,
    keywords: { zh: ["决断", "破局", "整合", "升级"], en: ["Decisiveness", "Breakthrough", "Integration", "Upgrade"] },
    aiZh: "能力跃迁期积累的势能在此刻释放。事业能量场达到峰值，大胆决策将带来超额回报——但需要承受更高的不确定性。",
    aiEn: "Potential from the capability leap releases now. Career energy peaks — bold decisions yield outsized returns, but higher uncertainty comes with it.",
  },
  {
    id: 3, year: "2029",
    labelZh: "财富积累窗口", labelEn: "Wealth Accumulation",
    x: 42, y: 12, magnitude: 5, color: "#D4AF37",
    growthZh: 3, growthEn: 3,
    opportunityZh: 5, opportunityEn: 5,
    challengeZh: 2, challengeEn: 2,
    keywords: { zh: ["财富", "复利", "投资", "格局"], en: ["Wealth", "Compound", "Investment", "Vision"] },
    aiZh: "事业突破带来的资源在此阶段开始产生复利效应。财富窗口正式开启，资产配置能力将成为关键——守住比进攻更重要。",
    aiEn: "Resources from the career breakthrough begin compounding. The wealth window opens — preserving assets matters more than aggressive expansion.",
  },
  {
    id: 4, year: "2031",
    labelZh: "关系深化阶段", labelEn: "Bond Deepening",
    x: 58, y: 38, magnitude: 4, color: "#EC78A0",
    growthZh: 4, growthEn: 4,
    opportunityZh: 3, opportunityEn: 3,
    challengeZh: 5, challengeEn: 5,
    keywords: { zh: ["情感", "家庭", "和谐", "内在"], en: ["Bond", "Family", "Harmony", "Inner"] },
    aiZh: "外在成就趋于稳定后，命盘能量转向内在维度。关系深化是这一阶段的核心课题——家庭和谐与人际信任将决定后续的人生质量。",
    aiEn: "After external achievements stabilize, energy shifts inward. Bond deepening is the core theme — harmony and trust determine future quality of life.",
  },
  {
    id: 5, year: "2033",
    labelZh: "人生转型节点", labelEn: "Life Transformation",
    x: 75, y: 55, magnitude: 5, color: "#5B9BD5",
    growthZh: 5, growthEn: 5,
    opportunityZh: 4, opportunityEn: 4,
    challengeZh: 5, challengeEn: 5,
    keywords: { zh: ["蜕变", "重生", "新身份", "命运"], en: ["Transform", "Rebirth", "New Self", "Destiny"] },
    aiZh: "关系深化带来的内在觉醒触发人生重大转型。旧模式瓦解、新身份诞生——这是命运齿轮转动的关键时刻，风险与机遇并存。",
    aiEn: "Inner awakening triggers major transformation. Old patterns dissolve, new identity emerges — risk and opportunity coexist at destiny's turning point.",
  },
  {
    id: 6, year: "2035+",
    labelZh: "长期成果兑现期", labelEn: "Legacy Harvest",
    x: 90, y: 28, magnitude: 5, color: "#2D6A4F",
    growthZh: 4, growthEn: 4,
    opportunityZh: 5, opportunityEn: 5,
    challengeZh: 2, challengeEn: 2,
    keywords: { zh: ["传承", "收获", "进化", "永恒"], en: ["Legacy", "Harvest", "Evolve", "Eternal"] },
    aiZh: "所有前期积累在此刻汇聚。领导力全面觉醒，人生进入收获与传承的新阶段——你将成为自己命运的定义者。",
    aiEn: "All prior accumulation converges. Leadership fully awakens — life enters a new era of harvest and legacy.",
  },
]
