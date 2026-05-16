// ═══════════════════════════════════════════════════════════════════════════
// AM16 — 天命能级与精神状态测验 数据定义
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
    descB: "盘出准确天宫度数，拿 Excel 表格算命",
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
    descB: "心中一动，凌晨三点爬起来改命",
  },
]

// ── 12 道情景题库（每维度 3 题）──

export interface AM16Option {
  text: string
  dimension: string   // "F" | "D" | "X" | "S" | "G" | "I" | "P" | "E"
  points: number
  altDimension?: string  // 中间选项：同时给另一极加分
}

export interface AM16Question {
  id: number
  scenario: string
  emoji: string
  options: AM16Option[]  // 至少 2 个选项
}

export const AM16_QUESTIONS: AM16Question[] = [
  // ── FD 维度（3题）──
  {
    id: 1,
    scenario: "早上出门一脚踩进水坑",
    emoji: "💦",
    options: [
      { text: "药丸！今天绝对冲煞！立刻打开 AlphaMirror 看看是哪个星盘相位在整我", dimension: "F", points: 1 },
      { text: "纯属意外。迅速格物致知，掏出纸巾擦干，并给市政热线打个电话建议修路", dimension: "D", points: 1 },
      { text: "嗯，踩到了。擦干继续走，回头提醒自己看路", dimension: "F", points: 0.5, altDimension: "D" },
    ],
  },
  {
    id: 2,
    scenario: "算命 App 说你本月不宜出门",
    emoji: "📱",
    options: [
      { text: "好的好的，在家躺着，外卖就是我的天命", dimension: "F", points: 1 },
      { text: "我偏要出门，而且要去三个地方，主打一个不信邪", dimension: "D", points: 1 },
      { text: "参考一下，重要的事照常办，鸡毛蒜皮的就算了", dimension: "F", points: 0.5, altDimension: "D" },
    ],
  },
  {
    id: 3,
    scenario: "本命年到了，红内裤销量暴涨",
    emoji: "🩲",
    options: [
      { text: "已经买了一打红色装备从头到脚武装自己，求个心安", dimension: "F", points: 1 },
      { text: "本命年？不就是 12 的倍数吗？数学而已，别搞得神神叨叨", dimension: "D", points: 1 },
      { text: "买了一条红内裤，信则有不信则无，图个乐", dimension: "F", points: 0.5, altDimension: "D" },
    ],
  },

  // ── XS 维度（3题）──
  {
    id: 4,
    scenario: "你的好朋友最近运势不好",
    emoji: "🫂",
    options: [
      { text: "把八字发我！我有强烈的直觉感应，量子层面我已经看到了问题", dimension: "X", points: 1 },
      { text: "先拉个 Excel 表对比流年大运，看看具体哪个五行出了问题", dimension: "S", points: 1 },
      { text: "先聊聊发生了什么，结合感觉和经验给点建议", dimension: "X", points: 0.5, altDimension: "S" },
    ],
  },
  {
    id: 5,
    scenario: "第一次见面的人想让你帮忙看盘",
    emoji: "👀",
    options: [
      { text: "盯着对方的脸三秒，我已经感应到了——你前世是条锦鲤", dimension: "X", points: 1 },
      { text: "请先报上准确的出生年月日时分，没数据我不开工", dimension: "S", points: 1 },
      { text: "简单看看面相聊几句，不必太较真", dimension: "X", points: 0.5, altDimension: "S" },
    ],
  },
  {
    id: 6,
    scenario: "有人质疑玄学不科学",
    emoji: "🤔",
    options: [
      { text: "科学的尽头是玄学，薛定谔的猫都没意见你急什么", dimension: "X", points: 1 },
      { text: "那我们来做个双盲实验，用数据证明命理的统计学显著性", dimension: "S", points: 1 },
      { text: "各有各的道理，信的人自然会懂", dimension: "X", points: 0.5, altDimension: "S" },
    ],
  },

  // ── GI 维度（3题）──
  {
    id: 7,
    scenario: "听说闺蜜/兄弟找了个新对象",
    emoji: "💕",
    options: [
      { text: "把八字发我！我连夜用五维算法帮你们合一下，不合赶紧分！", dimension: "G", points: 1 },
      { text: "哦，挺好。（内心：管我屁事，别影响我今晚打坐冥想吸纳天地灵气）", dimension: "I", points: 1 },
      { text: "恭喜恭喜，有空一起吃个饭认识一下", dimension: "G", points: 0.5, altDimension: "I" },
    ],
  },
  {
    id: 8,
    scenario: "家族群里有人发了一条养生谣言",
    emoji: "👨‍👩‍👧",
    options: [
      { text: "立刻转发 300 字辟谣长文 + 紫微斗数论证 + 风水化解方案", dimension: "G", points: 1 },
      { text: "已读不回，专注闭关修炼，今日不宜与凡人交流", dimension: "I", points: 1 },
      { text: "私下发条消息提醒一下，群里就不撕了", dimension: "G", points: 0.5, altDimension: "I" },
    ],
  },
  {
    id: 9,
    scenario: "你的社交能量用完了",
    emoji: "🔋",
    options: [
      { text: "再撑一下！还有三个朋友等着我帮他们看流年呢，渡人即渡己", dimension: "G", points: 1 },
      { text: "手机关机，拉上窗帘，今天只跟天花板上的灰尘交流", dimension: "I", points: 1 },
      { text: "推掉大部分应酬，只留一两个最亲近的", dimension: "G", points: 0.5, altDimension: "I" },
    ],
  },

  // ── PE 维度（3题）──
  {
    id: 10,
    scenario: "突然产生了一个超级天才的创业想法",
    emoji: "💡",
    options: [
      { text: "潜龙勿用。先在脑子里演练三遍，然后翻个身继续睡觉，等大运来了再说", dimension: "P", points: 1 },
      { text: "知行合一！现在是凌晨两点，我马上爬起来把 PPT 写完，明天就去拉投资", dimension: "E", points: 1 },
      { text: "先记在备忘录里，有空了再想想可行性", dimension: "P", points: 0.5, altDimension: "E" },
    ],
  },
  {
    id: 11,
    scenario: "你的流年运势显示下半年有大机遇",
    emoji: "📈",
    options: [
      { text: "好，我先冥想半年感受一下宇宙的能量频率，时机到了自然会动", dimension: "P", points: 1 },
      { text: "等不了！我现在就开始布局，先注册三个商标再说", dimension: "E", points: 1 },
      { text: "留意着，有机会就抓住，没机会也不强求", dimension: "P", points: 0.5, altDimension: "E" },
    ],
  },
  {
    id: 12,
    scenario: "塔罗牌告诉你：改变即将发生",
    emoji: "🃏",
    options: [
      { text: "好的，我做好准备了……准备继续等待下一个征兆", dimension: "P", points: 1 },
      { text: "改变？我自己就是改变！现在就去把简历改了、发型换了、房间重新布局", dimension: "E", points: 1 },
      { text: "该来的总会来，我先把手头的事做好", dimension: "P", points: 0.5, altDimension: "E" },
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
    title: "玄学界佛系社交蝴蝶",
    emoji: "🦋",
    quote: "知行合一，方为真知",
    quoteExplain: "躺着也要社交，这就是知行合一的最高境界",
    diagnosis: "能在床上用意念帮朋友算命的奇才。躺着回消息、躺着发朋友圈、躺着给人看八字。社交能量全靠平躺传导，人缘好到爆炸但实际出门次数为零。",
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
    diagnosis: "社交为零、行动为零、但灵性拉满。活在自己的量子场里，偶尔给宇宙发个信号确认自己还存在。人间最纯粹的旁观者，精神世界的隐居者。",
    advice: "建议偶尔给外卖小哥说声谢谢，这是最低能耗的红尘修炼。如果实在不想说话，至少点个头。",
    color: "text-slate-400",
    bgGlow: "from-slate-500/15 to-gray-500/5",
    compatible: ["DXGP", "FSGP"],
    clash: ["FXGE", "DXGE"],
  },
  // ═══ FXIE ═══
  FXIE: {
    code: "FXIE",
    title: "靠直觉蹦迪的玄学交际花",
    emoji: "💫",
    quote: "良知即是独知时",
    quoteExplain: "我的直觉告诉我，躺着也能把社交搞好",
    diagnosis: "直觉力惊人但执行力为负数。灵感来了能写出改命天书，然后倒头就睡。社交靠意念维持，朋友都觉得他很神秘——其实他就是懒得动。",
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
    diagnosis: "给每个朋友都建了运势追踪表，定期推送个性化改运建议。服务意识满分但自己永远不动手。像一个超智能但需要充电的机器人——而他永远找不到充电线。",
    advice: "你已经帮助了那么多人，是时候也帮帮自己了。把你给别人出的改运方案，自己先执行一遍。",
    color: "text-lime-400",
    bgGlow: "from-lime-500/15 to-green-500/5",
    compatible: ["DXIE", "FXGP"],
    clash: ["DXGE", "FXGE"],
  },
  // ═══ FSIP ═══
  FSIP: {
    code: "FSIP",
    title: "Excel 表格算命隐士",
    emoji: "📊",
    quote: "人心之得其正者即道",
    quoteExplain: "别跟我谈玄学虚无，把数据拉出来看看",
    diagnosis: "冷酷的无情格物机器。把八字流年过往事件做成复盘漏斗模型，极其理智，但极度社交恐惧。用 Python 写了个算命脚本，运行结果是自己孤独终老的概率为 73%。",
    advice: "偶尔走出房间见见太阳，阳光里的正离子不要钱。Excel 里的数据是死的，外面的风景是活的。",
    color: "text-cyan-400",
    bgGlow: "from-cyan-500/15 to-sky-500/5",
    compatible: ["DXGE", "FXGP"],
    clash: ["FXGE", "DXGE"],
  },
  // ═══ FSIE ═══
  FSIE: {
    code: "FSIE",
    title: "孤独的量子纠缠改命极客",
    emoji: "🧑‍🔬",
    quote: "知是行之始，行是知之成",
    quoteExplain: "我的改命方案经过了同行评审",
    diagnosis: "把改命当科研项目来做的人。有严谨的方法论、完整的数据模型、精确的时间规划——但一个人默默执行，从不分享。像一个隐藏在民间的诺贝尔玄学奖得主。",
    advice: "你已经有了最好的方法论，缺的只是和世界的连接。试着把你的改命经验分享出来，也许能帮助更多人。",
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
    diagnosis: "理论上的逆天改命大师，行动上的终极拖延症患者。收藏了 300 篇改命攻略，实际执行率为 0%。每天都在「明天开始改变」，永远活在明天。",
    advice: "先把收藏夹里的文章删一半，然后选一篇看完。这就是你的第一步改命行动。别等到明天，就现在。",
    color: "text-teal-400",
    bgGlow: "from-teal-500/15 to-emerald-500/5",
    compatible: ["FXGP", "FSIE"],
    clash: ["DXIE", "FXIE"],
  },
  // ═══ DXGE ═══
  DXGE: {
    code: "DXGE",
    title: "红尘蹦迪的改运队长",
    emoji: "🎉",
    quote: "人须在事上磨",
    quoteExplain: "大家都别哭，我带你们把这届天劫渡了！",
    diagnosis: "极度热血。不仅自己要逆天改命，还要拉着身边所有人一起改。每天的日常是给朋友灌输正能量和心学执行力。群发改命指南的那种人，朋友圈永远在刷屏。",
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
    advice: "反骨可以有，但别忘了偶尔找个人分享你的逆天计划。一个人改命太累了，两个人可以互相加油打气。",
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
    diagnosis: "浑身反骨。星盘说他今年破财，他偏要一天打三份工，主打一个「肉身逆天」。凌晨三点灵感爆发改命方案，五点开始执行，社交圈人人都怕他又崇拜他。",
    advice: "老天爷有时候不是针对你，他只是路过，别太亢奋。多喝热水，少跟天对线，保命要紧。",
    color: "text-orange-400",
    bgGlow: "from-orange-500/15 to-red-500/5",
    compatible: ["FXGP", "FSIP"],
    clash: ["FXGE", "FSIE"],
  },
  // ═══ DSIE ═══
  DSIE: {
    code: "DSIE",
    title: "逆天改命硬核特种兵",
    emoji: "⚡",
    quote: "知行并进，不可分作两事",
    quoteExplain: "数据分析完的下一秒，我已经在改命的路上了",
    diagnosis: "全 AM16 系统中行动力最强的类型。用数据分析出最优改命路径后立刻执行，还拉着朋友一起干。是那种凌晨三点写完计划书、四点开始打电话拉人的狠人。",
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
    diagnosis: "拥有最强的分析能力和最强的逆天心，但行动力永远差那么一点点。改命计划改了 17 版，每一版都比上一版更完美，但永远停在「待执行」状态。",
    advice: "接受不完美的开始。60 分的方案现在行动，比 100 分的方案永远放在待办清单里要强一万倍。",
    color: "text-emerald-400",
    bgGlow: "from-emerald-500/15 to-green-500/5",
    compatible: ["DXIE", "FXGP"],
    clash: ["FXGE", "DXGE"],
  },
  // ═══ DSGE ═══
  DSGE: {
    code: "DSGE",
    title: "全栈型改命运维工程师",
    emoji: "🛠️",
    quote: "知行并进，功夫不离本体",
    quoteExplain: "改命要从底层架构开始重构",
    diagnosis: "把人生当代码来重构的狠人。用敏捷开发的方式管理改命进程，每天 standup 汇报自己的运势进展。既有数据分析的理性，又有社交的温暖，还有逆天的决心和行动力。全能但偶尔过载。",
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
    diagnosis: "极度理性且极度独立。一个人默默收集数据、分析趋势、制定改命计划。不社交、不等待、不冲动。像一台精密的改命机器，但只接受自己编写的程序。",
    advice: "你的数据分析能力是顶级的，但人生不是所有事情都能量化。偶尔跟着感觉走一次，看看会怎样。",
    color: "text-indigo-400",
    bgGlow: "from-indigo-500/15 to-blue-500/5",
    compatible: ["DXGE", "FXGP"],
    clash: ["FXGE", "DXGE"],
  },
}
