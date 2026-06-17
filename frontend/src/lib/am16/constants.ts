// ═══════════════════════════════════════════════════════════════════════════
// AM16 — 行为能级与精神状态测验 数据定义
// ═══════════════════════════════════════════════════════════════════════════

// ── 四维坐标定义 ──

export interface DimensionDef {
  code: string
  letterA: string
  letterB: string
  nameA: string
  nameB: string
  descA: string
  descB: string
}

export const DIMENSIONS: DimensionDef[] = [
  {
    code: "FD",
    letterA: "F", letterB: "D",
    nameA: "顺天躺平", nameB: "物理逆天",
    descA: "命里有时终须有，没有我就去睡觉",
    descB: "老天爷你针对我？那我必须跟你对线",
  },
  {
    code: "XS",
    letterA: "X", letterB: "S",
    nameA: "心觉玄测", nameB: "硬核格物",
    descA: "直觉无敌，量子纠缠",
    descB: "盘出准确天宫度数，拿 Excel 表格分析行为分析",
  },
  {
    code: "GI",
    letterA: "G", letterB: "I",
    nameA: "红尘渡人", nameB: "闭门修仙",
    descA: "热衷于给全网免费看盘的圣母",
    descB: "莫挨老子，你影响到我的磁场干净了",
  },
  {
    code: "PE",
    letterA: "P", letterB: "E",
    nameA: "稳如老狗", nameB: "知行合一",
    descA: "潜龙勿用，拖延症晚期",
    descB: "心中一动，凌晨三点爬起来优化",
  },
]

// ── 12 道情景题库（每维度 3 题，中英双语）──

export interface AM16Option {
  textCn: string
  textEn: string
  type: "A" | "B" | "C"   // A = F/X/G/P 极, B = D/S/I/E 极, C = 中间态
}

export interface AM16Question {
  id: number
  dimension: "FD" | "XS" | "GI" | "PE"
  titleCn: string
  titleEn: string
  emoji: string
  options: AM16Option[]  // 至少 2 个选项
}

export const AM16_QUESTIONS: AM16Question[] = [
  // ── FD 维度 ──
  {
    id: 1,
    dimension: "FD",
    emoji: "🌙",
    titleCn: "凌晨三点你还没睡，一般在干嘛？",
    titleEn: "It's 3 AM and you're still awake. What are you usually doing?",
    options: [
      { textCn: "思考人生并开始自我攻击", textEn: "Overthinking life and spiraling into self-criticism", type: "A" },
      { textCn: "突然决定从明天开始逆天优化", textEn: "Suddenly deciding to defy fate starting tomorrow", type: "B" },
      { textCn: "刷抽象视频越刷越清醒", textEn: "Doomscrolling abstract videos and getting more wired", type: "C" },
      { textCn: "打开 Excel 规划未来到 2077 年", textEn: "Opening Excel to plan your future all the way to 2077", type: "C" },
    ],
  },
  {
    id: 2,
    dimension: "FD",
    emoji: "💔",
    titleCn: "当生活开始崩的时候：",
    titleEn: "When life starts falling apart:",
    options: [
      { textCn: "原地摆烂进入省电模式", textEn: "Give up on the spot and enter power-saving mode", type: "A" },
      { textCn: "开始疯狂搜自救方法", textEn: "Start frantically searching for self-rescue methods", type: "B" },
      { textCn: "假装没事继续硬撑", textEn: "Pretend everything's fine and keep pushing through", type: "C" },
      { textCn: "突然开始研究传统分析", textEn: "Suddenly start studying metaphysics", type: "C" },
    ],
  },
  {
    id: 3,
    dimension: "FD",
    emoji: "👥",
    titleCn: "别人对你最常见的评价：",
    titleEn: "The most common thing people say about you:",
    options: [
      { textCn: "「你想得真的很多。」", textEn: "\"You really think too much.\"", type: "A" },
      { textCn: "「你看起来挺冷静的。」", textEn: "\"You seem pretty calm.\"", type: "B" },
      { textCn: "「你有时候很难懂。」", textEn: "\"You're hard to figure out sometimes.\"", type: "C" },
      { textCn: "「你平时正常，但偶尔状态很吓人。」", textEn: "\"You're usually normal, but sometimes your vibe is terrifying.\"", type: "C" },
    ],
  },

  // ── XS 维度 ──
  {
    id: 4,
    dimension: "XS",
    emoji: "🔍",
    titleCn: "当你进入一个陌生环境时：",
    titleEn: "When you enter a new environment:",
    options: [
      { textCn: "会先观察周围再行动", textEn: "Observe everything around you before making a move", type: "A" },
      { textCn: "会很快找到自己的节奏", textEn: "Quickly find your own rhythm", type: "B" },
      { textCn: "会下意识感知别人的情绪", textEn: "Subconsciously sense other people's emotions", type: "C" },
      { textCn: "会表现得正常但脑子已经跑很远了", textEn: "Act normal on the surface but your mind is already miles ahead", type: "C" },
    ],
  },
  {
    id: 5,
    dimension: "XS",
    emoji: "🌊",
    titleCn: "你的人生更像：",
    titleEn: "Your life is more like:",
    options: [
      { textCn: "表面平静但后台一直在运行", textEn: "Calm on the surface but constantly running in the background", type: "A" },
      { textCn: "总觉得真正剧情还没开始", textEn: "Feeling like the real story hasn't started yet", type: "B" },
      { textCn: "一边崩溃一边继续加载", textEn: "Collapsing while still loading", type: "C" },
      { textCn: "经常想重启但舍不得存档", textEn: "Often want to restart but can't bear to lose your save file", type: "C" },
    ],
  },
  {
    id: 6,
    dimension: "XS",
    emoji: "🎯",
    titleCn: "如果人生真的可以重新调整一次：",
    titleEn: "If you could truly rearrange your life once:",
    options: [
      { textCn: "我想拥有更稳定的内心", textEn: "I'd want a more stable inner world", type: "A" },
      { textCn: "我想活得更自由一点", textEn: "I'd want to live a bit more freely", type: "B" },
      { textCn: "我想找到真正热爱的东西", textEn: "I'd want to find something I truly love", type: "C" },
      { textCn: "我想摆脱一直重复的人生状态", textEn: "I'd want to break free from the cycle of repetition", type: "C" },
    ],
  },

  // ── GI 维度 ──
  {
    id: 7,
    dimension: "GI",
    emoji: "💬",
    titleCn: "当别人说「你想太多了」：",
    titleEn: 'When someone says "You think too much":',
    options: [
      { textCn: "我会试着分析自己为什么会这样", textEn: "I'd try to analyze why I'm like this", type: "A" },
      { textCn: "我会觉得没人真正理解我", textEn: "I'd feel like nobody truly understands me", type: "B" },
      { textCn: "我会假装没事然后转移话题", textEn: "I'd pretend it's fine and change the subject", type: "C" },
      { textCn: "我会沉默，但脑子根本停不下来", textEn: "I'd go silent, but my mind would keep racing", type: "C" },
    ],
  },
  {
    id: 8,
    dimension: "GI",
    emoji: "🤝",
    titleCn: "你最容易被别人依赖的一点：",
    titleEn: "The thing people rely on you for most:",
    options: [
      { textCn: "总能理解别人的情绪", textEn: "You always understand other people's emotions", type: "A" },
      { textCn: "遇到问题时很能撑", textEn: "You can hold it together when problems arise", type: "B" },
      { textCn: "能想到别人想不到的东西", textEn: "You think of things nobody else does", type: "C" },
      { textCn: "即使混乱也能继续生活", textEn: "You keep going even when everything's chaotic", type: "C" },
    ],
  },
  {
    id: 9,
    dimension: "GI",
    emoji: "🌃",
    titleCn: "深夜的时候，你通常会：",
    titleEn: "Late at night, you usually:",
    options: [
      { textCn: "开始想很多平时不会想的事", textEn: "Start thinking about things you never think about during the day", type: "A" },
      { textCn: "感觉终于有属于自己的时间", textEn: "Feel like you finally have time that's truly yours", type: "B" },
      { textCn: "情绪会突然变得很明显", textEn: "Emotions suddenly become very intense", type: "C" },
      { textCn: "明知道该睡了但睡不着", textEn: "Know you should sleep but can't", type: "C" },
    ],
  },

  // ── PE 维度 ──
  {
    id: 10,
    dimension: "PE",
    emoji: "⏸️",
    titleCn: "当生活开始失控时：",
    titleEn: "When life starts spiraling out of control:",
    options: [
      { textCn: "我会先暂停消耗自己", textEn: "I'd pause first to stop draining myself", type: "A" },
      { textCn: "我会拼命想办法改变现状", textEn: "I'd desperately try to change the situation", type: "B" },
      { textCn: "我会开始寻找某种解释", textEn: "I'd start looking for some kind of explanation", type: "C" },
      { textCn: "我会试图重新建立秩序", textEn: "I'd try to rebuild order from scratch", type: "C" },
    ],
  },
  {
    id: 11,
    dimension: "PE",
    emoji: "🔄",
    titleCn: "你最容易陷入的一种状态：",
    titleEn: "The state you fall into most easily:",
    options: [
      { textCn: "反复幻想未来的自己", textEn: "Repeatedly fantasizing about your future self", type: "A" },
      { textCn: "怀疑现在的生活是不是自己真正想要的", textEn: "Doubting whether your current life is what you truly want", type: "B" },
      { textCn: "大脑不停思考停不下来", textEn: "Your brain keeps thinking and won't stop", type: "C" },
      { textCn: "明明很累却始终无法彻底休息", textEn: "Exhausted but unable to truly rest", type: "C" },
    ],
  },
  {
    id: 12,
    dimension: "PE",
    emoji: "⏳",
    titleCn: "你有没有一种感觉：",
    titleEn: "Do you ever get this feeling:",
    options: [
      { textCn: "自己迟早会迎来某种改变", textEn: "That some kind of change is coming for you sooner or later", type: "A" },
      { textCn: "自己始终没有真正安定下来", textEn: "That you've never truly settled down", type: "B" },
      { textCn: "自己的大脑总比现实更活跃", textEn: "That your mind is always more active than reality", type: "C" },
      { textCn: "自己一直在等某个「真正开始」的时刻", textEn: "That you've been waiting for some moment when it all 'truly begins'", type: "C" },
    ],
  },
]

// ── 16 种人格定义 ──
// 编码格式：[F/D][X/S][G/I][P/E]
// 4 维 × 2 极 = 16 种组合

export interface AM16Personality {
  code: string
  title: string
  emoji: string
  quote: string
  quoteExplain: string
  diagnosis: string
  advice: string
  color: string
  bgGlow: string
  compatible: string[]
  clash: string[]
}

export const PERSONALITIES: Record<string, AM16Personality> = {
  // ═══ FXGP ═══
  FXGP: {
    code: "FXGP",
    title: "心学派顶级躺平咸鱼",
    emoji: "🐟",
    quote: "此心光明，亦复何言",
    quoteExplain: "只要我躺得够平，命运的镰刀就割不到我",
    diagnosis: "常年处于「无为而治」的最高境界。相信一切都是最好的安排。水逆来了他睡觉，大运来了他还在睡觉。偶尔翻个身只是为了换个姿势继续躺。",
    advice: "建议偶尔翻个身，免得单侧气血不循环。偶尔起来看看窗外，你会发现——外面也在下雨。",
    color: "text-blue-400",
    bgGlow: "from-blue-500/15 to-indigo-500/5",
    compatible: ["DXIE", "FSGP"],
    clash: ["DXGE", "FXGE"],
  },
  // ═══ FXGE ═══
  FXGE: {
    code: "FXGE",
    title: "传统分析界佛系社交蝴蝶",
    emoji: "🦋",
    quote: "知行合一，方为真知",
    quoteExplain: "躺着也要社交，这就是知行合一的最高境界",
    diagnosis: "能在床上用意念帮朋友分析行为分析的奇才。躺着回消息、躺着发朋友圈、躺着给人看八字。社交能量全靠平躺传导，人缘好到爆炸但实际出门次数为零。",
    advice: "建议买一张够大的床，方便开展线上看盘业务。记得设置自动回复：正在冥想中，有事请烧纸。",
    color: "text-purple-400",
    bgGlow: "from-purple-500/15 to-violet-500/5",
    compatible: ["DXIE", "FSGP"],
    clash: ["DXGE", "FSIE"],
  },
  // ═══ FXIP ═══
  FXIP: {
    code: "FXIP",
    title: "断网修仙派高维咸鱼",
    emoji: "🧘",
    quote: "无善无恶心之体",
    quoteExplain: "没有善恶，没有行动，没有社交，只有躺",
    diagnosis: "社交为零、行动为零、但专注拉满。活在自己的量子场里，偶尔给宇宙发个信号确认自己还存在。人间最纯粹的旁观者，精神世界的隐居者。",
    advice: "建议偶尔给外卖小哥说声谢谢，这是最低能耗的红尘修炼。如果实在不想说话，至少点个头。",
    color: "text-slate-400",
    bgGlow: "from-slate-500/15 to-gray-500/5",
    compatible: ["DXGP", "FSGP"],
    clash: ["FXGE", "DXGE"],
  },
  // ═══ FXIE ═══
  FXIE: {
    code: "FXIE",
    title: "靠直觉蹦迪的传统分析交际花",
    emoji: "💫",
    quote: "良知即是独知时",
    quoteExplain: "我的直觉告诉我，躺着也能把社交搞好",
    diagnosis: "直觉力惊人但执行力为负数。灵感来了能写出优化天书，然后倒头就睡。社交靠意念维持，朋友都觉得他很神秘——其实他就是懒得动。",
    advice: "把你的灵感录音下来，哪怕语音转文字也好。不然这些天机都会随着你的呼噜声消散在宇宙中。",
    color: "text-pink-400",
    bgGlow: "from-pink-500/15 to-rose-500/5",
    compatible: ["DXGE", "FSGP"],
    clash: ["FSIE", "DXIP"],
  },
  // ═══ FSGP ═══
  FSGP: {
    code: "FSGP",
    title: "看盘等死的数字居士",
    emoji: "📈",
    quote: "去人欲，存天理",
    quoteExplain: "用 Excel 分析完了，结论是：躺着最好",
    diagnosis: "用最理性的数据分析得出最佛系的结论。做了 200 页 PPT 论证躺平的合理性，数据详实、图表精美、结论感人——人生苦短不如睡觉。",
    advice: "你的分析能力很强，但别把「分析完再行动」当成永远不行动的借口。先迈出第一步，数据会告诉你下一步。",
    color: "text-teal-400",
    bgGlow: "from-teal-500/15 to-emerald-500/5",
    compatible: ["DXIE", "DXGE"],
    clash: ["DXGP", "FXIE"],
  },
  // ═══ FSGE ═══
  FSGE: {
    code: "FSGE",
    title: "赛博功德箱固定传声筒",
    emoji: "📱",
    quote: "致良知于事事物物",
    quoteExplain: "用科学方法论来服务每一个人，但自己不想动",
    diagnosis: "给每个朋友都建了状态追踪表，定期推送个性化优化建议。服务意识满分但自己永远不动手。像一个超智能但需要充电的机器人——而他永远找不到充电线。",
    advice: "你已经帮助了那么多人，是时候也帮帮自己了。把你给别人出的优化方案，自己先执行一遍。",
    color: "text-lime-400",
    bgGlow: "from-lime-500/15 to-green-500/5",
    compatible: ["DXIE", "FXGP"],
    clash: ["DXGE", "FXGE"],
  },
  // ═══ FSIP ═══
  FSIP: {
    code: "FSIP",
    title: "Excel 表格行为分析隐士",
    emoji: "📊",
    quote: "人心之得其正者即道",
    quoteExplain: "别跟我谈传统分析虚无，把数据拉出来看看",
    diagnosis: "冷酷的无情格物机器。把八字周期过往事件做成复盘漏斗模型，极其理智，但极度社交恐惧。用 Python 写了个行为分析脚本，运行结果是自己孤独终老的概率为 73%。",
    advice: "偶尔走出房间见见太阳，阳光里的正离子不要钱。Excel 里的数据是死的，外面的风景是活的。",
    color: "text-cyan-400",
    bgGlow: "from-cyan-500/15 to-sky-500/5",
    compatible: ["DXGE", "FXGP"],
    clash: ["FXGE", "DXGE"],
  },
  // ═══ FSIE ═══
  FSIE: {
    code: "FSIE",
    title: "孤独的量子纠缠优化极客",
    emoji: "🧑‍🔬",
    quote: "知是行之始，行是知之成",
    quoteExplain: "我的优化方案经过了同行评审",
    diagnosis: "把优化当科研项目来做的人。有严谨的方法论、完整的数据模型、精确的时间规划——但一个人默默执行，从不分享。像一个隐藏在民间的诺贝尔传统分析奖得主。",
    advice: "你已经有了最好的方法论，缺的只是和世界的连接。试着把你的优化经验分享出来，也许能帮助更多人。",
    color: "text-violet-400",
    bgGlow: "from-violet-500/15 to-purple-500/5",
    compatible: ["FXGP", "DXIE"],
    clash: ["FXGE", "DXGE"],
  },
  // ═══ DXGP ═══
  DXGP: {
    code: "DXGP",
    title: "网络逆天口嗨/肉身躺平侠",
    emoji: "🎭",
    quote: "知是行之始，行是知之成",
    quoteExplain: "我知道了，但我不做，这叫「知而不行即为不知」",
    diagnosis: "理论上的逆天优化大师，行动上的终极拖延症患者。收藏了 300 篇优化攻略，实际执行率为 0%。每天都在「明天开始改变」，永远活在明天。",
    advice: "先把收藏夹里的文章删一半，然后选一篇看完。这就是你的第一步优化行动。别等到明天，就现在。",
    color: "text-teal-400",
    bgGlow: "from-teal-500/15 to-emerald-500/5",
    compatible: ["FXGP", "FSIE"],
    clash: ["DXIE", "FXIE"],
  },
  // ═══ DXGE ═══
  DXGE: {
    code: "DXGE",
    title: "红尘蹦迪的优化队长",
    emoji: "🎉",
    quote: "人须在事上磨",
    quoteExplain: "大家都别哭，我带你们把这届天劫渡了！",
    diagnosis: "极度热血。不仅自己要逆天优化，还要拉着身边所有人一起改。每天的日常是给朋友灌输正能量和心学执行力。群发优化指南的那种人，朋友圈永远在刷屏。",
    advice: "救人先救己，先看看自己干瘪的钱包和星尘余额。渡人之前，先渡自己的花呗。",
    color: "text-amber-400",
    bgGlow: "from-amber-500/15 to-yellow-500/5",
    compatible: ["FXGP", "FSIP"],
    clash: ["FXGE", "FSIE"],
  },
  // ═══ DXIP ═══
  DXIP: {
    code: "DXIP",
    title: "反骨入命的直觉独狼",
    emoji: "⚔️",
    quote: "立志而圣则圣矣，立志而贤则贤矣",
    quoteExplain: "我要逆天，但我要一个人静静逆",
    diagnosis: "社恐和反骨的完美融合体。内心翻涌着「我命由我不由天」的热血，表面上谁也不搭理。半夜独自修改人生规划，天亮了继续独来独往。像一把藏在鞘里的宝剑。",
    advice: "反骨可以有，但别忘了偶尔找个人分享你的逆天计划。一个人优化太累了，两个人可以互相加油打气。",
    color: "text-red-400",
    bgGlow: "from-red-500/15 to-rose-500/5",
    compatible: ["FXIP", "FSIE"],
    clash: ["FXGE", "FSIP"],
  },
  // ═══ DXIE ═══
  DXIE: {
    code: "DXIE",
    title: "凌晨三点与天对线狂人",
    emoji: "🔥",
    quote: "破山中贼易，破心中贼难",
    quoteExplain: "别跟老子谈命，老子就是命！",
    diagnosis: "浑身反骨。图表说他今年破财，他偏要一天打三份工，主打一个「肉身逆天」。凌晨三点灵感爆发优化方案，五点开始执行，社交圈人人都怕他又崇拜他。",
    advice: "老天爷有时候不是针对你，他只是路过，别太亢奋。多喝热水，少跟天对线，保命要紧。",
    color: "text-orange-400",
    bgGlow: "from-orange-500/15 to-red-500/5",
    compatible: ["FXGP", "FSIP"],
    clash: ["FXGE", "FSIE"],
  },
  // ═══ DSIE ═══
  DSIE: {
    code: "DSIE",
    title: "逆天优化硬核特种兵",
    emoji: "⚡",
    quote: "知行并进，不可分作两事",
    quoteExplain: "数据分析完的下一秒，我已经在优化的路上了",
    diagnosis: "全 AM16 系统中行动力最强的类型。用数据分析出最优优化路径后立刻执行，还拉着朋友一起干。是那种凌晨三点写完计划书、四点开始打电话拉人的狠人。",
    advice: "你的执行力是顶级的，但别忘了停下来复盘。不是所有仗都值得打，学会战略性休息。",
    color: "text-yellow-400",
    bgGlow: "from-yellow-500/15 to-amber-500/5",
    compatible: ["FXGP", "FXIP"],
    clash: ["FXGE", "FSIE"],
  },
  // ═══ DSGP ═══
  DSGP: {
    code: "DSGP",
    title: "满脑子反骨的数据拖延症",
    emoji: "📋",
    quote: "静处体悟，事上磨练",
    quoteExplain: "我已经分析完了所有可能性，现在我在等一个更好的时机",
    diagnosis: "拥有最强的分析能力和最强的逆天心，但行动力永远差那么一点点。优化计划改了 17 版，每一版都比上一版更完美，但永远停在「待执行」状态。",
    advice: "接受不完美的开始。60 分的方案现在行动，比 100 分的方案永远放在待办清单里要强一万倍。",
    color: "text-emerald-400",
    bgGlow: "from-emerald-500/15 to-green-500/5",
    compatible: ["DXIE", "FXGP"],
    clash: ["FXGE", "DXGE"],
  },
  // ═══ DSGE ═══
  DSGE: {
    code: "DSGE",
    title: "全栈型优化运维工程师",
    emoji: "🛠️",
    quote: "知行并进，功夫不离本体",
    quoteExplain: "优化要从底层架构开始重构",
    diagnosis: "把人生当代码来重构的狠人。用敏捷开发的方式管理优化进程，每天 standup 汇报自己的状态进展。既有数据分析的理性，又有社交的温暖，还有逆天的决心和行动力。全能但偶尔过载。",
    advice: "你是完美的六边形战士，但别忘了人生不是代码，不能总是 debug。偶尔允许一些 bug 存在，那是生活的惊喜。",
    color: "text-gold",
    bgGlow: "from-gold/15 to-amber-500/5",
    compatible: ["FXGP", "FXIP"],
    clash: ["FXGE", "FSIE"],
  },
  // ═══ DSIP ═══
  DSIP: {
    code: "DSIP",
    title: "莫得感情的格物修仙独狼",
    emoji: "🐺",
    quote: "此心不动，随机而动",
    quoteExplain: "数据说动我才动，你谁啊别催我",
    diagnosis: "极度理性且极度独立。一个人默默收集数据、分析趋势、制定优化计划。不社交、不等待、不冲动。像一台精密的优化机器，但只接受自己编写的程序。",
    advice: "你的数据分析能力是顶级的，但人生不是所有事情都能量化。偶尔跟着感觉走一次，看看会怎样。",
    color: "text-indigo-400",
    bgGlow: "from-indigo-500/15 to-blue-500/5",
    compatible: ["DXGE", "FXGP"],
    clash: ["FXGE", "DXGE"],
  },
}
