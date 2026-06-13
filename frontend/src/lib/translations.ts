/**
 * Cultural Terminology Translation Dictionaries
 * 五素 (Wu Xing) & 八卦 (Ba Gua)
 *
 * Convention: Pinyin as proper noun + English translation (clarity)
 */

// ── 五素 (The Five Elements / Wu Xing) ──────────────────────────
export const WUXING_TRANSLATION: Record<string, { en: string; pinyin: string; desc: string; descEn: string }> = {
  '金': { en: 'Metal', pinyin: 'Jin', desc: '代表专注、收敛、肃杀', descEn: 'Represents focus, rigor, and precision.' },
  '木': { en: 'Wood', pinyin: 'Mu', desc: '代表生长、扩展、生机', descEn: 'Represents growth, flexibility, and expansion.' },
  '水': { en: 'Water', pinyin: 'Shui', desc: '代表智慧、流动、深沉', descEn: 'Represents intuition, flow, and deep intelligence.' },
  '火': { en: 'Fire', pinyin: 'Huo', desc: '代表热情、变革、光明', descEn: 'Represents passion, dynamism, and transformation.' },
  '土': { en: 'Earth', pinyin: 'Tu', desc: '代表稳定、承载、中正', descEn: 'Represents stability, grounding, and balance.' },
}

// ── 八卦 (The Eight Trigrams / Ba Gua) ──────────────────────────
export const BAGUA_TRANSLATION: Record<string, {
  en: string; pinyin: string; symbol: string; core: string; coreEn: string
}> = {
  '乾': { en: 'Heaven', pinyin: 'Qian', symbol: '☰', core: '刚健', coreEn: 'Creative / Strong' },
  '兑': { en: 'Lake', pinyin: 'Dui', symbol: '☱', core: '喜悦', coreEn: 'Joyful / Expressive' },
  '离': { en: 'Fire', pinyin: 'Li', symbol: '☲', core: '光明', coreEn: 'Clarity / Radiance' },
  '震': { en: 'Thunder', pinyin: 'Zhen', symbol: '☳', core: '动', coreEn: 'Initiative / Awakening' },
  '巽': { en: 'Wind', pinyin: 'Xun', symbol: '☴', core: '入', coreEn: 'Gentle / Penetrating' },
  '坎': { en: 'Water', pinyin: 'Kan', symbol: '☵', core: '陷', coreEn: 'Deep Abyss / Risk' },
  '艮': { en: 'Mountain', pinyin: 'Gen', symbol: '☶', core: '止', coreEn: 'Stillness / Boundary' },
  '坤': { en: 'Earth', pinyin: 'Kun', symbol: '☷', core: '顺', coreEn: 'Receptive / Nurturing' },
}

// ── 天干 (Stems) ───────────────────────────────────────
export const TIANGAN_TRANSLATION: Record<string, string> = {
  '甲': 'Jia (Yang Wood)',
  '乙': 'Yi (Yin Wood)',
  '丙': 'Bing (Yang Fire)',
  '丁': 'Ding (Yin Fire)',
  '戊': 'Wu (Yang Earth)',
  '己': 'Ji (Yin Earth)',
  '庚': 'Geng (Yang Metal)',
  '辛': 'Xin (Yin Metal)',
  '壬': 'Ren (Yang Water)',
  '癸': 'Gui (Yin Water)',
}

// ── 地支 (Earthly Branches / Zodiac) ────────────────────────────
export const DIZHI_TRANSLATION: Record<string, string> = {
  '子': 'Zi (Rat)',
  '丑': 'Chou (Ox)',
  '寅': 'Yin (Tiger)',
  '卯': 'Mao (Rabbit)',
  '辰': 'Chen (Dragon)',
  '巳': 'Si (Snake)',
  '午': 'Wu (Horse)',
  '未': 'Wei (Goat)',
  '申': 'Shen (Monkey)',
  '酉': 'You (Rooster)',
  '戌': 'Xu (Dog)',
  '亥': 'Hai (Pig)',
}

// ── 宜 (Auspicious Actions) ─────────────────────────────────────
export const YI_TRANSLATION: Record<string, string> = {
  '诸事皆宜': 'All Actions Auspicious',
  '出行': 'Travel / Departure',
  '祈福': 'Energy Realignment',
  '安床': 'Settling & Grounding',
  '嫁娶': 'Union & Celebration',
  '开市': 'Opening Positions / Business Launch',
  '交易': 'Trading / Transactions',
  '签约': 'Signing Contracts',
  '搬迁': 'Relocation & Movement',
  '修造': 'Renovation & Building',
  '动土': 'Initiating New Projects',
  '栽种': 'Planting & Cultivation',
  '纳采': 'Proposals & Courtship',
  '会友': 'Networking & Socializing',
  '求医': 'Health & Optimization',
  '学习': 'Study & Learning',
  '开工': 'Starting Work',
  '开仓': 'Opening Positions',
  '祭祀': 'Mindful Practice',
  '解除': 'Clearing & Release',
  '沐浴': 'Cleansing & Purification',
  '扫舍': 'Decluttering & Fresh Start',
  '裁衣': 'Personal Grooming',
  '造屋': 'Construction',
  '纳财': 'Wealth Collection',
  '求嗣': 'Seeking Offspring',
  '破土': 'Ground Breaking',
  '安葬': 'Final Settlement',
  '启钻': 'Excavation',
  '造车器': 'Crafting Tools',
}

// ── 忌 (Inauspicious Actions) ───────────────────────────────────
export const JI_TRANSLATION: Record<string, string> = {
  '诸事不宜': 'Caution: Avoid Major Actions',
  '动土': 'Disrupting Established Strategy',
  '开仓': 'Aggressive Trading / Over-leveraging',
  '破土': 'Breaking Ground Inadvisable',
  '安葬': 'Avoid Final Commitments',
  '诉讼': 'Avoid Legal Disputes',
  '远行': 'Avoid Long Journeys',
  '搬迁': 'Avoid Relocation',
  '嫁娶': 'Avoid Major Unions',
  '开市': 'Avoid New Business Launches',
  '交易': 'Avoid Large Transactions',
  '签约': 'Avoid Signing Contracts',
  '修造': 'Avoid Construction',
  '栽种': 'Avoid Planting',
  '纳采': 'Avoid Proposals',
  '会友': 'Avoid Social Gatherings',
  '求医': 'Avoid Medical Procedures',
  '学习': 'Avoid Starting Studies',
  '开工': 'Avoid Starting Work',
  '出行': 'Avoid Travel',
  '祈福': 'Avoid Mindful Practices',
  '安床': 'Avoid Bed Setup',
  '解除': 'Avoid Clearing',
  '沐浴': 'Avoid Cleansing',
  '伐木': 'Avoid Woodcutting',
  '掘井': 'Avoid Digging Wells',
  '置产': 'Avoid Property Acquisition',
  '造屋': 'Avoid Construction',
  '纳畜': 'Avoid Animal Husbandry',
}

// ── 农历月份 (Lunar Months) ──────────────────────────────────────
export const LUNAR_MONTHS_EN = [
  'First Moon', 'Second Moon', 'Third Moon', 'Fourth Moon',
  'Fifth Moon', 'Sixth Moon', 'Seventh Moon', 'Eighth Moon',
  'Ninth Moon', 'Tenth Moon', 'Eleventh Moon', 'Twelfth Moon',
]

// ── 农历日期 (Lunar Days) ────────────────────────────────────────
export const LUNAR_DAYS_EN = [
  '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th',
  '11th', '12th', '13th', '14th', '15th', '16th', '17th', '18th', '19th', '20th',
  '21st', '22nd', '23rd', '24th', '25th', '26th', '27th', '28th', '29th', '30th',
]

// ── 农历日期中文 → 英文映射 ──────────────────────────────────────
export const LUNAR_DAY_MAP: Record<string, string> = {
  '初一': '1st', '初二': '2nd', '初三': '3rd', '初四': '4th', '初五': '5th',
  '初六': '6th', '初七': '7th', '初八': '8th', '初九': '9th', '初十': '10th',
  '十一': '11th', '十二': '12th', '十三': '13th', '十四': '14th', '十五': '15th',
  '十六': '16th', '十七': '17th', '十八': '18th', '十九': '19th', '二十': '20th',
  '廿一': '21st', '廿二': '22nd', '廿三': '23rd', '廿四': '24th', '廿五': '25th',
  '廿六': '26th', '廿七': '27th', '廿八': '28th', '廿九': '29th', '三十': '30th',
}

// ── 农历月份中文 → 英文映射 ──────────────────────────────────────
export const LUNAR_MONTH_MAP: Record<string, string> = {
  '正月': 'First Moon', '二月': 'Second Moon', '三月': 'Third Moon',
  '四月': 'Fourth Moon', '五月': 'Fifth Moon', '六月': 'Sixth Moon',
  '七月': 'Seventh Moon', '八月': 'Eighth Moon', '九月': 'Ninth Moon',
  '十月': 'Tenth Moon', '冬月': 'Eleventh Moon', '腊月': 'Twelfth Moon',
}

// ── Helper: Translate a full gan-zhi day pillar ──────────────────
export function translateGanZhi(ganZhi: string): string {
  if (ganZhi.length !== 2) return ganZhi
  const gan = ganZhi[0]
  const zhi = ganZhi[1]
  const ganEn = TIANGAN_TRANSLATION[gan]
  const zhiEn = DIZHI_TRANSLATION[zhi]
  if (ganEn && zhiEn) return `${ganEn} · ${zhiEn}`
  return ganZhi
}

// ── Helper: Translate lunar date string ──────────────────────────
export function translateLunarDate(lunarDate: string): string {
  // Try to match patterns like "正月初一" or "冬月十五"
  let result = lunarDate
  for (const [zh, en] of Object.entries(LUNAR_MONTH_MAP)) {
    result = result.replace(zh, en)
  }
  for (const [zh, en] of Object.entries(LUNAR_DAY_MAP)) {
    result = result.replace(zh, en)
  }
  return result
}

// ── Helper: Clean lunar date for display ─────────────────────────
// Backend may return mixed format like "二〇二六年Fourth Moon6th"
// This strips English parts for zh, or translates Chinese parts for en
export function cleanLunarDate(lunarDate: string, isZh: boolean): string {
  if (!lunarDate) return ""
  if (isZh) {
    let result = lunarDate
    // Strip "Lunar: " prefix
    result = result.replace(/^Lunar:\s*/i, "")
    // Strip English month patterns: "First Moon", "Fourth Moon", etc.
    result = result.replace(/\b(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth)\s*Moon\b/gi, "")
    // Strip ordinal day suffixes: "6th", "1st", "22nd", etc.
    result = result.replace(/\b\d+(st|nd|rd|th)\b/gi, "")
    // Strip standalone English words (Month, Day, Year, Hour, Mon-Sun)
    result = result.replace(/\b(Month|Day|Year|Hour|Mon|Tue|Wed|Thu|Fri|Sat|Sun|January|February|March|April|May|June|July|August|September|October|November|December)\b/gi, "")
    // Strip pipe separators and extra whitespace
    result = result.replace(/\|/g, " ").replace(/\s+/g, " ").trim()
    // If result is empty after stripping, extract Chinese parts
    if (!result) {
      const chineseParts = lunarDate.match(/[一-鿿〇]+/g)
      result = chineseParts ? chineseParts.join("") : lunarDate
    }
    return result
  }
  // English: translate Chinese parts
  return translateLunarDate(lunarDate)
}

// ── Helper: Translate yi/ji item ─────────────────────────────────
export function translateYiJi(label: string): string {
  return YI_TRANSLATION[label] || JI_TRANSLATION[label] || label
}

// ── Helper: Translate wuxing name ────────────────────────────────
export function translateWuXing(name: string): string {
  return WUXING_TRANSLATION[name]?.en || name
}

// ── Helper: Translate bagua name ─────────────────────────────────
export function translateBaGua(name: string): string {
  return BAGUA_TRANSLATION[name]?.en || name
}
