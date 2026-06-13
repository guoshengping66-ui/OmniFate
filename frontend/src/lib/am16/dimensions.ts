// ═══════════════════════════════════════════════════════════════════════════
// 双层标签映射系统 — 传统分析内核 + 当代青年精神状态大白话
// 与 miniprogram/src/constants/dimensions.ts 保持一致
// ═══════════════════════════════════════════════════════════════════════════

export interface PoleDetail {
  nameCn: string
  nameEn: string
  tagCn: string
  tagEn: string
  descCn: string
  descEn: string
}

export interface DimensionConfig {
  id: 'FD' | 'XS' | 'GI' | 'PE'
  axisNameCn: string
  axisNameEn: string
  icon: string
  poleA: PoleDetail
  poleB: PoleDetail
}

export const DIMENSIONS_MAP: Record<string, DimensionConfig> = {
  FD: {
    id: 'FD',
    axisNameCn: '反骨破局力',
    axisNameEn: 'Matrix Defiance',
    icon: '🔥',
    poleA: {
      nameCn: '顺天应命',
      nameEn: 'Vibe Align',
      tagCn: '借势躺平流',
      tagEn: 'Cosmic Flow Rider',
      descCn: '不跟命运硬刚，风往哪吹我往哪倒，主打一个顺应天时。',
      descEn: 'Never fight the tide. Go with the cosmic flow and vibe with the transits.',
    },
    poleB: {
      nameCn: '逆天优化',
      nameEn: 'Fate Defiance',
      tagCn: '反骨破局手',
      tagEn: 'Matrix Overrider',
      descCn: '不信邪不认命，浑身长满反骨，坚信人定胜天、强行破局。',
      descEn: 'Zero tolerance for fixed paths. Born to hack the simulation and rewrite the code.',
    },
  },
  XS: {
    id: 'XS',
    axisNameCn: '硬核理性脑',
    axisNameEn: 'Analytical Reality',
    icon: '📊',
    poleA: {
      nameCn: '心觉感应',
      nameEn: 'Third Eye Vibe',
      tagCn: '高维直觉王',
      tagEn: 'Quantum Hit Intuitive',
      descCn: '不看现实证据，全凭强烈的量子直觉和磁场感应做决策。',
      descEn: 'Skips raw data. Relies purely on instant quantum vibes and cosmic guidance.',
    },
    poleB: {
      nameCn: '数据格物',
      nameEn: 'Spreadsheet Logic',
      tagCn: '硬核理性派',
      tagEn: 'Spreadsheet Occultist',
      descCn: '莫得感情，不听忽悠，只相信大样本统计、Excel 表格与实体证据。',
      descEn: 'Emotionless investigator. Trusts nothing but large-sample data and concrete physics.',
    },
  },
  GI: {
    id: 'GI',
    axisNameCn: '孤狼闭关度',
    axisNameEn: 'Hermit Hermitage',
    icon: '🧘',
    poleA: {
      nameCn: '红尘渡人',
      nameEn: 'Social Shaman',
      tagCn: '热血渡人狂',
      tagEn: 'Karma Carrier',
      descCn: '社交能量爆棚，朋友有难强行开机，燃烧自己普度众生。',
      descEn: 'Social battery endless. Always ready to intervene and carry the group karma.',
    },
    poleB: {
      nameCn: '闭门修仙',
      nameEn: 'Ghost Hermit',
      tagCn: '莫挨老子流',
      tagEn: 'Isolation Cultivator',
      descCn: '极度抗拒无效社交，到点必须物理失联，独自闭关恢复 SAN 值。',
      descEn: 'Severe aversion to NPCs. Initiates ghost protocol to recharge inner battery.',
    },
  },
  PE: {
    id: 'PE',
    axisNameCn: '肉身执行力',
    axisNameEn: 'Action Execution',
    icon: '⚡',
    poleA: {
      nameCn: '潜龙勿用',
      nameEn: 'Strategic Stasis',
      tagCn: '深谋长线党',
      tagEn: 'Strategic Delayer',
      descCn: '战略性蹲坑，大运未到绝不盲动，在脑子里把计划演练一万遍。',
      descEn: 'Strategic patience. Mentally simulates the move 10,000 times before acting.',
    },
    poleB: {
      nameCn: '知行合一',
      nameEn: 'Action Unity',
      tagCn: '肉身开团手',
      tagEn: 'Instant Aggro Executor',
      descCn: '想到立马就干，拒绝拖延，凌晨两点产生想法两点半已经开写代码。',
      descEn: 'Zero lag between thought and execution. Ready to deployment within minutes.',
    },
  },
}

export const DIMENSION_ORDER: ('FD' | 'XS' | 'GI' | 'PE')[] = ['FD', 'XS', 'GI', 'PE']

export function getPoleLabel(code: string, val: number): { tag: string; pole: PoleDetail } {
  const dim = DIMENSIONS_MAP[code]
  if (!dim) return { tag: code, pole: { nameCn: code, nameEn: code, tagCn: code, tagEn: code, descCn: '', descEn: '' } }
  const pole = val > 50 ? dim.poleB : dim.poleA
  return { tag: pole.tagCn, pole }
}
