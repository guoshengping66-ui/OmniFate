// ═══════════════════════════════════════════════════════════════════════════
// AM16 — 12 道爆笑行为分析情景题库
// ═══════════════════════════════════════════════════════════════════════════

export interface QuestionOption {
  text: string
  /** 该选项命中的维度极 */
  dimension: "F" | "D" | "X" | "S" | "G" | "I" | "P" | "E"
  /** 该选项的权重分值 */
  points: number
  /** 中间选项：同时给另一极加的分值 */
  altDimension?: "F" | "D" | "X" | "S" | "G" | "I" | "P" | "E"
}

export interface Question {
  id: number
  /** 情景描述 */
  scenario: string
  /** 题目 Emoji */
  emoji: string
  /** 三个选项：A / B / C */
  options: [QuestionOption, QuestionOption, QuestionOption]
}

/**
 * 12 道题目 — 每维度 3 题
 * FD 维度: 1-3（顺天躺平 vs 物理逆天）
 * XS 维度: 4-6（心觉玄测 vs 硬核格物）
 * GI 维度: 7-9（红尘渡人 vs 闭门修仙）
 * PE 维度: 10-12（稳如老狗 vs 知行合一）
 */
export const QUESTIONS: Question[] = [
  // ══════════════════════════════════════════════════════════════
  // FD 维度（顺天躺平 F vs 物理逆天 D）—— 3 题
  // ══════════════════════════════════════════════════════════════
  {
    id: 1,
    scenario: "早上出门一脚踩进水坑",
    emoji: "💦",
    options: [
      {
        text: "药丸！今天绝对冲煞！立刻打开 AlphaMirror 看看是哪个图表相位在整我",
        dimension: "F",
        points: 1,
      },
      {
        text: "纯属意外。迅速格物致知，掏出纸巾擦干，并给市政热线打个电话建议修路",
        dimension: "D",
        points: 1,
      },
      {
        text: "嗯，踩到了。擦干继续走，回头提醒自己看路",
        dimension: "F",
        points: 0.5,
        altDimension: "D",
      },
    ],
  },
  {
    id: 2,
    scenario: "分析 App 说你本月不宜出门",
    emoji: "📱",
    options: [
      {
        text: "好的好的，在家躺着，外卖就是我的归宿",
        dimension: "F",
        points: 1,
      },
      {
        text: "我偏要出门，而且要去三个地方，主打一个不信邪",
        dimension: "D",
        points: 1,
      },
      {
        text: "参考一下，重要的事照常办，鸡毛蒜皮的就算了",
        dimension: "F",
        points: 0.5,
        altDimension: "D",
      },
    ],
  },
  {
    id: 3,
    scenario: "本命年到了，红内裤销量暴涨",
    emoji: "🩲",
    options: [
      {
        text: "已经买了一打红色装备从头到脚武装自己，求个心安",
        dimension: "F",
        points: 1,
      },
      {
        text: "本命年？不就是 12 的倍数吗？数学而已，别搞得神神叨叨",
        dimension: "D",
        points: 1,
      },
      {
        text: "买了一条红内裤，信则有不信则无，图个乐",
        dimension: "F",
        points: 0.5,
        altDimension: "D",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // XS 维度（心觉玄测 X vs 硬核格物 S）—— 3 题
  // ══════════════════════════════════════════════════════════════
  {
    id: 4,
    scenario: "你的好朋友最近状态不好",
    emoji: "🫂",
    options: [
      {
        text: "把八字发我！我有强烈的直觉感应，量子层面我已经看到了问题",
        dimension: "X",
        points: 1,
      },
      {
        text: "先拉个 Excel 表对比周期数据，看看具体哪个维度出了问题",
        dimension: "S",
        points: 1,
      },
      {
        text: "先聊聊发生了什么，结合感觉和经验给点建议",
        dimension: "X",
        points: 0.5,
        altDimension: "S",
      },
    ],
  },
  {
    id: 5,
    scenario: "第一次见面的人想让你帮忙看盘",
    emoji: "👀",
    options: [
      {
        text: "盯着对方的脸三秒，我已经感应到了——你前世是条锦鲤",
        dimension: "X",
        points: 1,
      },
      {
        text: "请先报上准确的出生年月日时分，没数据我不开工",
        dimension: "S",
        points: 1,
      },
      {
        text: "简单看看面部聊几句，不必太较真",
        dimension: "X",
        points: 0.5,
        altDimension: "S",
      },
    ],
  },
  {
    id: 6,
    scenario: "有人质疑传统分析不科学",
    emoji: "🤔",
    options: [
      {
        text: "科学的尽头是传统分析，薛定谔的猫都没意见你急什么",
        dimension: "X",
        points: 1,
      },
      {
        text: "那我们来做个双盲实验，用数据证明行为分析的统计学显著性",
        dimension: "S",
        points: 1,
      },
      {
        text: "各有各的道理，信的人自然会懂",
        dimension: "X",
        points: 0.5,
        altDimension: "S",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // GI 维度（红尘渡人 G vs 闭门修仙 I）—— 3 题
  // ══════════════════════════════════════════════════════════════
  {
    id: 7,
    scenario: "听说闺蜜/兄弟找了个新对象",
    emoji: "💕",
    options: [
      {
        text: "把八字发我！我连夜用五维算法帮你们合一下，不合赶紧分！",
        dimension: "G",
        points: 1,
      },
      {
        text: "哦，挺好。（内心：管我屁事，别影响我今晚打坐冥想吸纳天地灵气）",
        dimension: "I",
        points: 1,
      },
      {
        text: "恭喜恭喜，有空一起吃个饭认识一下",
        dimension: "G",
        points: 0.5,
        altDimension: "I",
      },
    ],
  },
  {
    id: 8,
    scenario: "家族群里有人发了一条养生谣言",
    emoji: "👨‍👩‍👧",
    options: [
      {
        text: "立刻转发 300 字辟谣长文 + 图表系统论证 + 环境优化方案",
        dimension: "G",
        points: 1,
      },
      {
        text: "已读不回，专注闭关修炼，今日不宜与凡人交流",
        dimension: "I",
        points: 1,
      },
      {
        text: "私下发条消息提醒一下，群里就不撕了",
        dimension: "G",
        points: 0.5,
        altDimension: "I",
      },
    ],
  },
  {
    id: 9,
    scenario: "你的社交能量用完了",
    emoji: "🔋",
    options: [
      {
        text: "再撑一下！还有三个朋友等着我帮他们看周期呢，渡人即渡己",
        dimension: "G",
        points: 1,
      },
      {
        text: "手机关机，拉上窗帘，今天只跟天花板上的灰尘交流",
        dimension: "I",
        points: 1,
      },
      {
        text: "推掉大部分应酬，只留一两个最亲近的",
        dimension: "G",
        points: 0.5,
        altDimension: "I",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // PE 维度（稳如老狗 P vs 知行合一 E）—— 3 题
  // ══════════════════════════════════════════════════════════════
  {
    id: 10,
    scenario: "突然产生了一个超级天才的创业想法",
    emoji: "💡",
    options: [
      {
        text: "潜龙勿用。先在脑子里演练三遍，然后翻个身继续睡觉，等大运来了再说",
        dimension: "P",
        points: 1,
      },
      {
        text: "知行合一！现在是凌晨两点，我马上爬起来把 PPT 写完，明天就去拉投资",
        dimension: "E",
        points: 1,
      },
      {
        text: "先记在备忘录里，有空了再想想可行性",
        dimension: "P",
        points: 0.5,
        altDimension: "E",
      },
    ],
  },
  {
    id: 11,
    scenario: "你的周期状态显示下半年有大机遇",
    emoji: "📈",
    options: [
      {
        text: "好，我先冥想半年感受一下宇宙的能量频率，时机到了自然会动",
        dimension: "P",
        points: 1,
      },
      {
        text: "等不了！我现在就开始布局，先注册三个商标再说",
        dimension: "E",
        points: 1,
      },
      {
        text: "留意着，有机会就抓住，没机会也不强求",
        dimension: "P",
        points: 0.5,
        altDimension: "E",
      },
    ],
  },
  {
    id: 12,
    scenario: "符号分析告诉你：改变即将发生",
    emoji: "🃏",
    options: [
      {
        text: "好的，我做好准备了……准备继续等待下一个征兆",
        dimension: "P",
        points: 1,
      },
      {
        text: "改变？我自己就是改变！现在就去把简历改了、发型换了、房间重新布局",
        dimension: "E",
        points: 1,
      },
      {
        text: "该来的总会来，我先把手头的事做好",
        dimension: "P",
        points: 0.5,
        altDimension: "E",
      },
    ],
  },
]

// ── 维度定义 ──

export interface Dimension {
  code: string
  letterA: string
  letterB: string
}

export const DIMENSIONS: Dimension[] = [
  { code: "FD", letterA: "F", letterB: "D" },
  { code: "XS", letterA: "X", letterB: "S" },
  { code: "GI", letterA: "G", letterB: "I" },
  { code: "PE", letterA: "P", letterB: "E" },
]
