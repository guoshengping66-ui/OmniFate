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
    emoji: "💧",
    titleCn: "早上出门一脚踩进深水坑，你的第一反应是？",
    titleEn: "You step right into a deep puddle first thing in the morning. Immediate reaction?",
    options: [
      { textCn: "水逆！今天绝对冲煞，磁场不对。", textEn: "Retrograde! Massive energy clash today, my aura is off.", type: "A" },
      { textCn: "晦气！纯粹是这破路没修好，想投诉。", textEn: "Trash road! Purely an engineering failure, I want to complain.", type: "B" },
      { textCn: "自认倒霉，擦干继续走，啥也没想。", textEn: "Bad luck. Wipe it off and keep walking without overthinking.", type: "C" },
    ],
  },
  {
    id: 2,
    dimension: "FD",
    emoji: "📱",
    titleCn: "算命说你本月不宜出门，你会怎么做？",
    titleEn: 'A fortune app says you shouldn\'t leave the house this month. You:',
    options: [
      { textCn: "听劝，在家躺着，外卖就是我的天命。", textEn: "Fair enough. Staying inside, delivery is my true destiny.", type: "A" },
      { textCn: "偏要出门，我命由我不由 App。", textEn: "Going out anyway. I control my own matrix, not some app.", type: "B" },
      { textCn: "瞅一眼就行，大局照常，小事稍微避避。", textEn: "Take it as a reference. Proceed as planned, avoid minor risks.", type: "C" },
    ],
  },
  {
    id: 3,
    dimension: "FD",
    emoji: "🩲",
    titleCn: "本命年/水逆到了，大家都买红内裤防灾，你的态度是？",
    titleEn: "Mercury retrograde is here, and lucky red underwear sales spike. Your move?",
    options: [
      { textCn: "赶紧安排一打，主打一个玄学防身。", textEn: "Buying a dozen ASAP. Spiritual armor is mandatory.", type: "A" },
      { textCn: "毫无波动，这纯属商家的营销智商税。", textEn: "Zero impact. Just another marketing trap for the naive.", type: "B" },
      { textCn: "随大流买一条，信则有不信则无，图个乐。", textEn: "Buy one just for the memes and a little peace of mind.", type: "C" },
    ],
  },

  // ── XS 维度 ──
  {
    id: 4,
    dimension: "XS",
    emoji: "🫂",
    titleCn: "好朋友最近运势极其低迷，你打算怎么帮他？",
    titleEn: "Your best friend's luck has been absolute trash lately. How do you help?",
    options: [
      { textCn: "凭强烈直觉和量子感应帮他抓内核问题。", textEn: "Use pure intuition and quantum vibes to spot their core issue.", type: "A" },
      { textCn: "帮他理性拉表、一条条分析现实原因。", textEn: "Analyze concrete data flow and map out their realistic bottlenecks.", type: "B" },
      { textCn: "陪他喝一杯，结合情绪和现实给点折中建议。", textEn: "Grab a drink, offer a balanced perspective based on experience.", type: "C" },
    ],
  },
  {
    id: 5,
    dimension: "XS",
    emoji: "👀",
    titleCn: "第一次见面的人，突然想让你帮他看盘/看面相：",
    titleEn: "Someone you just met asks you to read their chart on the spot. You:",
    options: [
      { textCn: "扫一眼他的气场和眼神，直接盲推盲测。", textEn: "Scan their aura and eyes, give an instant intuitive reading.", type: "A" },
      { textCn: "「别急，先报一下准确的出生年月日时。」", textEn: '"Hold on, give me your exact birth metrics first."', type: "B" },
      { textCn: "随便客套瞎聊两句，看破不说破。", textEn: "Keep it casual as a standard, polite social icebreaker.", type: "C" },
    ],
  },
  {
    id: 6,
    dimension: "XS",
    emoji: "🤔",
    titleCn: "有人公开质疑玄学完全是骗人的，你通常怎么反驳？",
    titleEn: "Someone claims metaphysics is absolute nonsense. How do you counter?",
    options: [
      { textCn: "觉得对方维度太低，量子纠缠懒得解释。", textEn: "They are in a lower dimension. Too lazy to explain quantum rules.", type: "A" },
      { textCn: "试图用统计学、大数据逻辑去和对方辩证。", textEn: "Argue using statistical probability and analytical data models.", type: "B" },
      { textCn: "笑一笑，信者自信，不与傻瓜论长短。", textEn: "Just smile. To each their own world, no need to argue.", type: "C" },
    ],
  },

  // ── GI 维度 ──
  {
    id: 7,
    dimension: "GI",
    emoji: "💕",
    titleCn: "听说好朋友找了个新对象，你的第一反应是？",
    titleEn: "You find out your close friend just started dating someone. Initial reaction?",
    options: [
      { textCn: "极度兴奋，恨不得立马帮他们合个盘。", textEn: "So hyped! Instantly want to run a compatibility check.", type: "A" },
      { textCn: "知道了，内心毫无波澜甚至觉得吵。", textEn: "Acknowledged. None of my business, protecting my quiet space.", type: "B" },
      { textCn: "挺替他高兴的，顺其自然送上祝福。", textEn: "Happy for them. Send a standard, genuine congratulation.", type: "C" },
    ],
  },
  {
    id: 8,
    dimension: "GI",
    emoji: "👨‍👩‍👧",
    titleCn: "家族群里长辈又发了一条伪科学养生谣言，你会？",
    titleEn: "A relative drops a blatant piece of fake health news in the family chat. You:",
    options: [
      { textCn: "忍不住长篇大论、引经据典去死磕科普。", textEn: "Must interject. Drop hard facts and essays to correct them.", type: "A" },
      { textCn: "已读不回，多说一句都浪费我的磁场。", textEn: "Left on read. Interacting wastes my cognitive energy field.", type: "B" },
      { textCn: "发个糊弄学表情包，维持表面和谐。", textEn: "Drop a generic meme to keep the superficial peace.", type: "C" },
    ],
  },
  {
    id: 9,
    dimension: "GI",
    emoji: "🔋",
    titleCn: "周末到了，你的社交能量（Battery）彻底耗尽，此时：",
    titleEn: "It's the weekend but your social battery is completely dead. However:",
    options: [
      { textCn: "只要朋友有难/需要看盘，我强行开机。", textEn: "If a friend needs guidance, I can force-restart my brain.", type: "A" },
      { textCn: "彻底断网失联，莫挨老子，闭门修仙。", textEn: "Total ghost mode. Do not disrupt my sacred isolation.", type: "B" },
      { textCn: "拒绝无效聚会，只和一两个极熟的人待着。", textEn: "Cancel loud events, hang out with 1 or 2 inner-circle folks.", type: "C" },
    ],
  },

  // ── PE 维度 ──
  {
    id: 10,
    dimension: "PE",
    emoji: "💡",
    titleCn: "深夜你突然产生了一个绝对能赚钱的创业点子，你会？",
    titleEn: "At 2 AM, you suddenly hit upon a brilliant business idea. You:",
    options: [
      { textCn: "潜龙勿用，先记着，等大运来了再说。", textEn: "Hidden Dragon. Note it down, wait for my major luck cycle.", type: "A" },
      { textCn: "瞬间亢奋，马上爬起来查资料、写方案。", textEn: "Adrenaline rush! Jump out of bed to build the prototype now.", type: "B" },
      { textCn: "发个备忘录，翻个身继续睡，明天随缘。", textEn: "Save it to Notes, roll over, and see how I feel tomorrow.", type: "C" },
    ],
  },
  {
    id: 11,
    dimension: "PE",
    emoji: "📈",
    titleCn: "推演显示你下半年会迎来一个巨大的翻盘机遇：",
    titleEn: "Your annual chart shows a massive window of opportunity in H2:",
    options: [
      { textCn: "保持静守，等宇宙的风吹过来再动。", textEn: "Stay calm and still. Act only when the cosmic wind blows.", type: "A" },
      { textCn: "等不了一点！我现在就要提前主动布局。", textEn: "Can't wait! Initiating aggressive offensive setup today.", type: "B" },
      { textCn: "留意着，机会来了就狠狠抓住，没来拉倒。", textEn: "Keep an eye out, strike if it manifests, chill if it doesn't.", type: "C" },
    ],
  },
  {
    id: 12,
    dimension: "PE",
    emoji: "🃏",
    titleCn: "占卜告诉你：「你人生的剧烈改变即将发生」，你的选择是？",
    titleEn: 'A reading states: "A massive life shift is coming." You choose to:',
    options: [
      { textCn: "保持静止，默默观察命运抛给我的征兆。", textEn: "Stay put. Quietly observe the next ripple in the matrix.", type: "A" },
      { textCn: "主动求变！自己先去换个发型/重新布局房间。", textEn: "Take charge! Changing my haircut and room layout immediately.", type: "B" },
      { textCn: "知道了，该干嘛干嘛，不影响手头的工作。", textEn: "Acknowledged. Keep my head down and continue my daily grind.", type: "C" },
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

// ═══════════════════════════════════════════════════════════════════════════
// 计分算法 — 与 Web 端 calculator.ts 同步
// 支持两种答案格式：
//   1. 新格式: Record<number, number> (题号→选项索引)
//   2. 旧格式: Record<number, "A"|"B"|"C"> (兼容历史数据)
// ═══════════════════════════════════════════════════════════════════════════

export interface DimensionScores {
  F: number; D: number; X: number; S: number
  G: number; I: number; P: number; E: number
}

function getOptionIndex(answer: number | string): number {
  if (typeof answer === "number") return answer
  if (answer === "A") return 0
  if (answer === "B") return 1
  return 2
}

/**
 * 核心计分函数 — 返回 4 位字母编码
 * 兼容新旧两种答案存储格式
 */
export function calculateArchetype(answers: Record<number, number | string>): string {
  const raw: DimensionScores = { F: 0, D: 0, X: 0, S: 0, G: 0, I: 0, P: 0, E: 0 }

  for (const q of AM16_QUESTIONS) {
    const answer = answers[q.id]
    if (answer === undefined) continue
    const idx = getOptionIndex(answer)
    const option = q.options[idx]
    if (!option) continue

    const letterA = q.dimension[0] as keyof DimensionScores
    const letterB = q.dimension[1] as keyof DimensionScores

    if (option.type === "A") raw[letterA] += 1
    else if (option.type === "B") raw[letterB] += 1
    else { raw[letterA] += 0.5; raw[letterB] += 0.5 }
  }

  return DIMENSIONS.map(d => {
    const aScore = raw[d.letterA as keyof DimensionScores]
    const bScore = raw[d.letterB as keyof DimensionScores]
    return aScore > bScore ? d.letterA : d.letterB
  }).join("")
}

/**
 * 计算雷达图分数（0-100），与 Web 端一致
 */
export function calculateRadarScores(answers: Record<number, number | string>): Record<string, number> {
  const raw: DimensionScores = { F: 0, D: 0, X: 0, S: 0, G: 0, I: 0, P: 0, E: 0 }

  for (const q of AM16_QUESTIONS) {
    const answer = answers[q.id]
    if (answer === undefined) continue
    const idx = getOptionIndex(answer)
    const option = q.options[idx]
    if (!option) continue

    const letterA = q.dimension[0] as keyof DimensionScores
    const letterB = q.dimension[1] as keyof DimensionScores

    if (option.type === "A") raw[letterA] += 1
    else if (option.type === "B") raw[letterB] += 1
    else { raw[letterA] += 0.5; raw[letterB] += 0.5 }
  }

  const radar: Record<string, number> = {}
  DIMENSIONS.forEach(d => {
    const aScore = raw[d.letterA as keyof DimensionScores]
    const bScore = raw[d.letterB as keyof DimensionScores]
    const total = aScore + bScore
    radar[d.code] = total > 0 ? Math.round((bScore / total) * 100) : 50
  })
  return radar
}
