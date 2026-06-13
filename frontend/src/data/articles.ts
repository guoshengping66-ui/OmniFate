export interface Article {
  id: string
  title_zh: string
  title_en: string
  summary_zh: string
  summary_en: string
  category: string
  tags_zh: string[]
  tags_en: string[]
  read_time: number
  cover_emoji: string
  created_at: string
  content_zh: string
  content_en: string
}

export const CATEGORIES = [
  { key: "", label_zh: "全部", label_en: "All" },
  { key: "wuxing", label_zh: "五行入门", label_en: "Five Elements" },
  { key: "bazi", label_zh: "四柱分析", label_en: "Bazi Analysis" },
  { key: "chart analysis", label_zh: "西方图表", label_en: "Western Chart" },
  { key: "symbol", label_zh: "符号指南", label_en: "Symbol Guide" },
  { key: "face", label_zh: "面部手部特征", label_en: "Face & Hand" },
  { key: "lifestyle", label_zh: "优化生活", label_en: "Lifestyle Optimization" },
  { key: "faq", label_zh: "常见问答", label_en: "FAQ" },
]

export const ARTICLES: Article[] = [
  // ────────────────────────────────────────────────────
  // 1. 五行入门
  // ────────────────────────────────────────────────────
  {
    id: "wuxing-basics",
    title_zh: "五行入门：金木水火土如何影响你的命运",
    title_en: "Five Elements Basics: How Metal, Wood, Water, Fire & Earth Shape Your Profile",
    summary_zh: "五行是中国行为分析学的基础框架。了解五行的相生相克关系，是理解四柱档案的第一步。本文用最通俗的语言解释五行的本质。",
    summary_en: "The Five Elements form the foundation of Chinese behavioral analysis. Understanding their generating and overcoming cycles is the first step to reading a Bazi chart. This article explains the essence of the Five Elements in plain language.",
    category: "wuxing",
    tags_zh: ["五行", "入门", "基础"],
    tags_en: ["Five Elements", "Beginner", "Fundamentals"],
    read_time: 5,
    cover_emoji: "🌿",
    created_at: "2025-01-15",
    content_zh: `五行——金、木、水、火、土——是中国古代哲学的核心概念，也是行为分析学的基础框架。它描述了宇宙万物相生相克的动态平衡关系。

五行相生

木生火：木材燃烧产生火焰。火生土：火焰燃烧后化为灰烬。土生金：金属矿藏蕴于大地之中。金生水：金属表面凝结水珠。水生木：水灌溉滋养树木生长。

五行相克

木克土：树根穿透土壤。土克水：堤坝阻挡水流。水克火：水能浇灭火焰。火克金：烈火能熔化金属。金克木：金属工具砍伐树木。

五行与你的档案

在四柱档案中，每个人的出生时间对应着天干地支，每个天干地支都带有五行属性。通过计算四柱中五行的分布，分析师可以判断你五行的强弱——这就是「五行得分」。

比如，如果你四柱中木特别旺而金很弱，就叫「木旺缺金」。但这并不意味着你一定要补金——还需要看你档案的「喜用神」。

常见误区

误区一：缺什么就补什么。这是最常见的误解。行为分析学讲究的是「喜用神」，即你档案最需要的元素，而非简单地补充缺失的元素。有时缺的元素恰恰是你不需要的。

误区二：五行越均衡越好。均衡是理想状态，但大多数人的档案都有偏旺或偏弱的元素。关键是找到对你最有利的平衡点。

小测试

你知道自己的日主天干是什么吗？日主天干是四柱中代表你自己的那个字。如果你知道自己的出生年月日时，可以试试我们的 AI 分析工具，一键生成你的五行分析。点击「开始分析」获取你的五行分析报告。`,
    content_en: `The Five Elements — Metal, Wood, Water, Fire, and Earth — are core concepts in ancient Chinese philosophy and the foundation of behavioral analysis. They describe the dynamic balance of mutual generation and overcoming among all things in the universe.

The Generating Cycle (Xiang Sheng)

Wood generates Fire: Wood burns to produce flame. Fire generates Earth: Fire leaves behind ash. Earth generates Metal: Metal ore is found within the earth. Metal generates Water: Moisture condenses on metal surfaces. Water generates Wood: Water nourishes trees and plants.

The Overcoming Cycle (Xiang Ke)

Wood overcomes Earth: Tree roots penetrate the soil. Earth overcomes Water: Dams block the flow of water. Water overcomes Fire: Water extinguishes flame. Fire overcomes Metal: Intense heat melts metal. Metal overcomes Wood: Metal tools fell trees.

The Five Elements in Your Chart

In a Bazi chart, each person's birth time corresponds to a set of Stems and Earthly Branches, each carrying a Five Element attribute. By calculating the distribution of elements in the chart, a practitioner can determine your elemental strengths — this is called the 「Five Element Score.」

For example, if your chart has very strong Wood but weak Metal, it's described as 「Wood flourishing, Metal lacking.」 But this doesn't necessarily mean you need to add Metal — you also need to consider your chart's 「Favorable Element」 (Xi Yong Shen).

Common Misconceptions

Misconception 1: If you lack an element, you must supplement it. This is the most common misunderstanding. Behavioral analysis focuses on the 「Favorable Element」 — what your chart most needs — not simply replenishing what's missing. Sometimes the missing element is precisely the one you don't need.

Misconception 2: The more balanced the Five Elements, the better. Balance is the ideal state, but most people's charts have elements that are stronger or weaker. The key is finding the balance point that is most beneficial to you.

Quick Quiz

Do you know your Day Master Stem? The Day Master is the character in your Bazi chart that represents you. If you know your birth date and time, try our AI analysis tool to instantly generate your Five Element analysis. Click 「Start Reading」 to get your Five Element analysis report.`,
  },

  // ────────────────────────────────────────────────────
  // 2. 日主天干
  // ────────────────────────────────────────────────────
  {
    id: "bazi-daymaster",
    title_zh: "日主天干：你的命格核心密码",
    title_en: "The Day Master: Your Core Profile Code",
    summary_zh: "日主天干（日元）是四柱中最关键的一个字，它代表你自己。甲木人如参天大树，丙火人如太阳般温暖。看看你属于哪种类型？",
    summary_en: "The Day Master (Ri Yuan) is the most crucial character in your Bazi chart — it represents you. Jia Wood people are like towering trees, Bing Fire people shine like the sun. Find out which type you are.",
    category: "bazi",
    tags_zh: ["四柱", "日主", "天干"],
    tags_en: ["Bazi", "Day Master", "Stems"],
    read_time: 8,
    cover_emoji: "☯",
    created_at: "2025-02-10",
    content_zh: `
## 什么是日主天干？

在四柱四柱中，日柱的天干被称为"日主"（也叫"日元"或"命主"），它代表你自己。日主是整个四柱档案的核心，所有其他元素都围绕日主展开分析。

## 十种日主类型

### 甲木 — 参天大树
甲木之人如同参天大树，性格正直、有担当、追求成长。他们往往有领导气质，但有时过于固执。甲木最需要阳光（丙火）来温暖，需要雨露（癸水）来滋养。

### 乙木 — 花草藤蔓
乙木之人如花草藤蔓，柔韧灵活、善于适应。他们通常外表温和，内心却很有韧性。乙木善于借助外力（如攀附大树）来实现目标。

### 丙火 — 太阳烈火
丙火之人如太阳般光明磊落、热情洋溢。他们是天生的焦点，具有感染力和号召力。丙火人最忌讳的是被遮蔽（壬水过旺）。

### 丁火 — 烛光灯火
丁火之人如烛光般内敛温暖、心思细腻。他们往往有艺术天赋，善于在暗处发光。丁火需要稳定的燃料（甲木）来持续燃烧。

### 戊土 — 高山大地
戊土之人如高山般稳重可靠、包容大度。他们是天生的守护者，值得信赖。戊土最怕被过度挖掘（甲木过旺）。

### 己土 — 田园沃土
己土之人如田园般温和滋养、务实勤恳。他们善于照顾他人，有极强的亲和力。己土需要阳光和雨露的配合才能孕育万物。

### 庚金 — 刀剑钢铁
庚金之人如刀剑般果断刚毅、义气为先。他们有很强的执行力和决断力，但有时过于直接。庚金需要火来锻炼才能成器。

### 辛金 — 珠宝首饰
辛金之人如珠宝般精致优雅、追求完美。他们通常有很好的审美品味，但也比较敏感。辛金需要水来洗涤才能展现光华。

### 壬水 — 大江大河
壬水之人如江河般智慧通达、胸怀宽广。他们思维活跃、善于变通，但有时过于奔放。壬水需要土来引导方向。

### 癸水 — 雨露溪流
癸水之人如雨露般温柔细腻、直觉敏锐。他们往往有很强的洞察力和同理心。癸水需要金来生扶才能汇聚成流。

## 如何找到你的日主？

通过 AI 分析工具，输入你的出生年月日时，系统会自动计算你的四柱四柱，并标注你的日主天干。你还可以看到五行得分、十维关系等详细分析。
    `,
    content_en: `
## What Is the Day Master?

In the Four Pillars of Bazi, the Stem of the Day Pillar is called the "Day Master" (also known as "Ri Yuan" or "Ming Zhu"). It represents you. The Day Master is the core of the entire Bazi chart — all other elements are analyzed in relation to it.

## The Ten Day Master Types

### Jia Wood (甲) — The Towering Tree
Jia Wood people are like tall, upright trees — principled, responsible, and growth-oriented. They often have natural leadership qualities but can be stubborn. Jia Wood most needs sunlight (Bing Fire) for warmth and rain (Gui Water) for nourishment.

### Yi Wood (乙) — The Vine and Flower
Yi Wood people are like vines and flowers — flexible, adaptive, and resilient. They often appear gentle on the outside but possess great inner tenacity. Yi Wood excels at leveraging external support (like climbing a larger tree) to achieve goals.

### Bing Fire (丙) — The Radiant Sun
Bing Fire people shine like the sun — radiant, passionate, and naturally commanding attention. They are born focal points with infectious energy. Bing Fire people suffer most when overshadowed (excess Ren Water).

### Ding Fire (丁) — The Candlelight
Ding Fire people glow like candlelight — warm, refined, and detail-oriented. They often have artistic talent and excel at shining in subtle ways. Ding Fire needs a steady fuel source (Jia Wood) to keep burning.

### Wu Earth (戊) — The Mountain
Wu Earth people are like mountains — stable, reliable, and magnanimous. They are natural guardians whom others trust. Wu Earth fears being over-excavated (excess Jia Wood).

### Ji Earth (己) — The Fertile Field
Ji Earth people are like fertile farmland — nurturing, practical, and hardworking. They excel at caring for others and have strong magnetic personalities. Ji Earth needs both sunlight and rain to bring forth abundance.

### Geng Metal (庚) — The Sword
Geng Metal people are like swords — decisive, resolute, and justice-driven. They have strong execution and decision-making abilities but can be too blunt. Geng Metal needs fire to be forged into something useful.

### Xin Metal (辛) — The Precious Gem
Xin Metal people are like gemstones — refined, elegant, and perfectionist. They usually have excellent aesthetic taste but can be sensitive. Xin Metal needs water to be polished and reveal its brilliance.

### Ren Water (壬) — The Mighty River
Ren Water people are like great rivers — wise, open-minded, and far-reaching. They think actively and adapt easily but can be too unconstrained. Ren Water needs earth to give it direction.

### Gui Water (癸) — The Morning Dew
Gui Water people are like morning dew — gentle, perceptive, and highly intuitive. They often have strong insight and empathy. Gui Water needs metal to gather and form a steady stream.

## How to Find Your Day Master?

Use our AI analysis tool — enter your birth date and time, and the system will automatically calculate your Four Pillars and identify your Day Master. You'll also see your Five Element scores, Ten Gods relationships, and more detailed analysis.
    `,
  },

  // ────────────────────────────────────────────────────
  // 3. 四柱缺什么
  // ────────────────────────────────────────────────────
  {
    id: "bazi-weakness",
    title_zh: "四柱缺什么就一定要补什么吗？",
    title_en: "Must You Supplement Whatever Your Bazi Lacks?",
    summary_zh: "很多人一听「四柱缺金」就急着戴金饰。但行为分析学的逻辑远比「缺啥补啥」复杂。本文解析五行喜忌的正确理解方式。",
    summary_en: "Many people rush to wear gold jewelry when told their Bazi lacks Metal. But behavioral analysis is far more nuanced than 'supplement what's missing.' This article explains the correct approach to Five Element favorability.",
    category: "bazi",
    tags_zh: ["四柱", "五行", "喜忌"],
    tags_en: ["Bazi", "Five Elements", "Favorability"],
    read_time: 6,
    cover_emoji: "⚖️",
    created_at: "2025-02-20",
    content_zh: `
## 「缺什么补什么」为什么是错的？

这是行为分析学中最广泛流传的误解。很多人在行为分析后听到「四柱缺金」，就立刻去戴金项链、金戒指，以为这样就能弥补档案的不足。但事实远没有这么简单。

## 喜用神才是关键

行为分析学的核心概念是"喜用神"——即你的档案最需要、最受益的元素。喜用神的判断需要综合考虑日主强弱、格局配置、周期状态等多个因素。

举个例子：
- 一个日主为甲木的人，如果四柱中木已经很旺，那他可能喜火（泄秀）或喜金（克制过旺的木）
- 即使他的四柱中"缺水"，也不一定要补水——因为水会生木，让已经旺的木更旺

## 什么时候"缺"真的需要补？

只有当缺失的元素恰好是你的喜用神时，才需要补充。这需要专业分析师的判断，或者通过 AI 分析工具进行系统分析。

## 实用建议

1. **不要自行补五行**：盲目补充可能适得其反
2. **了解你的喜用神**：这是最关键的一步
3. **通过多种途径调和**：颜色、方位、职业选择等都可以调和五行
4. **动态看待**：周期状态会改变五行的需求
    `,
    content_en: `
## Why "Supplement What You Lack" Is Wrong

This is the most widespread misconception in behavioral analysis. After a reading, many people hear "your Bazi lacks Metal" and immediately rush to wear gold necklaces or rings, thinking this will compensate for their chart's deficiency. But reality is far more complex.

## The Favorable Element Is What Matters

The core concept in behavioral analysis is the "Favorable Element" (Xi Yong Shen) — the element your chart most needs and benefits from. Determining the Favorable Element requires considering multiple factors: Day Master strength, chart configuration, annual cycle cycles, and more.

For example:
- A person with a Jia Wood Day Master whose chart already has very strong Wood may favor Fire (to channel the excess) or Metal (to restrain the overabundant Wood)
- Even if their chart "lacks Water," they may not need to supplement it — because Water generates Wood, making already strong Wood even stronger

## When Is "Lacking" Actually a Problem?

Only when the missing element happens to be your Favorable Element does it need to be supplemented. This requires professional judgment from a analyst, or systematic analysis through an AI analysis tool.

## Practical Advice

1. **Don't supplement elements on your own** — blind supplementation can backfire
2. **Understand your Favorable Element** — this is the most critical step
3. **Use multiple channels for harmony** — colors, directions, career choices can all balance your Five Elements
4. **Think dynamically** — annual cycle cycles change your elemental needs
    `,
  },

  // ────────────────────────────────────────────────────
  // 4. 十维体系
  // ────────────────────────────────────────────────────
  {
    id: "bazi-tengods",
    title_zh: "十维详解：正官、偏财、食神…它们在说什么？",
    title_en: "The Ten Gods Explained: What Do Direct Wealth, Seven Killings & Eating God Really Mean?",
    summary_zh: "十维是四柱中描述人际关系和命运走向的核心系统。正官代表约束与责任，偏财代表意外之财。搞懂十维，就读懂了档案的语言。",
    summary_en: "The Ten Gods system is the core framework in Bazi for describing relationships and behavioral patterns. Direct Officer represents discipline, Indirect Wealth represents unexpected gains. Understanding the Ten Gods means speaking the language of your chart.",
    category: "bazi",
    tags_zh: ["四柱", "十维", "进阶"],
    tags_en: ["Bazi", "Ten Gods", "Advanced"],
    read_time: 10,
    cover_emoji: "🔑",
    created_at: "2025-03-01",
    content_zh: `
## 什么是十维？

十维是四柱分析中用来描述日主与其他天干之间关系的十个名称。它们基于五行生克关系，进一步细分为：生我者、我生者、克我者、我克者、同我者，每类又分阴阳，共十个。

## 十维一览

| 十维 | 五行关系 | 代表含义 |
|------|---------|---------|
| 比肩 | 同我、同阴阳 | 兄弟、竞争、自我意识 |
| 劫财 | 同我、异阴阳 | 争夺、合作、财运波动 |
| 食神 | 我生、同阴阳 | 才华、口福、子女（女命） |
| 伤官 | 我生、异阴阳 | 叛逆、创新、艺术天赋 |
| 偏财 | 我克、同阴阳 | 意外之财、父亲、人缘 |
| 正财 | 我克、异阴阳 | 正当收入、妻子（男命）、稳定 |
| 七杀 | 克我、同阴阳 | 压力、权力、魄力 |
| 正官 | 克我、异阴阳 | 约束、责任、地位 |
| 偏印 | 生我、同阴阳 | 偏门学问、继母、灵感 |
| 正印 | 生我、异阴阳 | 学问、母亲、贵人 |

## 如何解读十维？

**看旺衰**：某个十维在档案中出现的次数和力量，决定了它的影响力。

**看位置**：十维出现在年柱、月柱、日柱还是时柱，代表不同的人生阶段和领域。

**看组合**：十维之间的组合（如食神生财、官印相生）会形成特定的命格格局。

## 举例说明

**食神生财格**：食神代表才华和创造力，财星代表财富。食神生财意味着用才华赚钱，适合从事创意、艺术、餐饮等行业。

**官印相生格**：正官代表权力和地位，正印代表学问和贵人。官印相生意味着因学识而获得权力，适合从政或从事管理。

→ 想了解你的十维格局？试试 AI 分析工具，一键生成完整分析
    `,
    content_en: `
## What Are the Ten Gods?

The Ten Gods are ten designations used in Bazi to describe the relationship between the Day Master and other Stems. Based on the Five Element generating and overcoming cycles, they are further divided by Yin-Yang polarity into: those that generate me, those I generate, those that overcome me, those I overcome, and those same as me — five categories, each split into Yin and Yang, totaling ten.

## The Ten Gods at a Glance

| Ten God | Element Relation | Meaning |
|---------|-----------------|---------|
| Companion (Bi Jian) | Same element, same polarity | Siblings, competition, self-identity |
| Rob Wealth (Jie Cai) | Same element, different polarity | Rivalry, collaboration, wealth fluctuation |
| Eating God (Shi Shen) | I generate, same polarity | Talent, enjoyment, children (female chart) |
| Hurting Officer (Shang Guan) | I generate, different polarity | Rebellion, innovation, artistic talent |
| Indirect Wealth (Pian Cai) | I overcome, same polarity | Windfall, father, social charm |
| Direct Wealth (Zheng Cai) | I overcome, different polarity | Earned income, wife (male chart), stability |
| Seven Killings (Qi Sha) | Overcomes me, same polarity | Pressure, authority, boldness |
| Direct Officer (Zheng Guan) | Overcomes me, different polarity | Discipline, responsibility, status |
| Indirect Resource (Pian Yin) | Generates me, same polarity | Unorthodox knowledge, stepmother, inspiration |
| Direct Resource (Zheng Yin) | Generates me, different polarity | Education, mother, benefactors |

## How to Interpret the Ten Gods?

**Check strength**: The frequency and power of a Ten God in the chart determine its influence.

**Check position**: Whether a Ten God appears in the Year, Month, Day, or Hour Pillar represents different life stages and domains.

**Check combinations**: Interactions between Ten Gods (such as Eating God generating Wealth, or Officer and Resource supporting each other) form specific chart patterns.

## Example Interpretations

**Eating God Generates Wealth pattern**: Eating God represents talent and creativity; Wealth stars represent status. This pattern means earning wealth through talent — ideal for creative arts, culinary, or entertainment careers.

**Officer-Resource Mutual Generation pattern**: Direct Officer represents authority; Direct Resource represents learning and benefactors. This pattern means gaining power through knowledge — suited for governance or management roles.

→ Want to see your Ten Gods chart? Try our AI analysis tool for a complete analysis
    `,
  },

  // ────────────────────────────────────────────────────
  // 5. 十二宫位
  // ────────────────────────────────────────────────────
  {
    id: "chart analysis-houses",
    title_zh: "十二宫位入门：你的图表地图",
    title_en: "The Twelve Houses: Your Natal Chart Map",
    summary_zh: "图表的十二宫位就像人生的十二个舞台。太阳落在第十宫的人天生就是事业狂，月亮在第四宫的人最重视家庭。来认识你的图表地图。",
    summary_en: "The twelve houses of the natal chart are like twelve stages of life. Sun in the 10th House makes you career-driven; Moon in the 4th House values family above all. Discover your chart map.",
    category: "chart analysis",
    tags_zh: ["图表", "宫位", "入门"],
    tags_en: ["Natal Chart", "Houses", "Beginner"],
    read_time: 7,
    cover_emoji: "✦",
    created_at: "2025-03-05",
    content_zh: `
## 什么是宫位？

在西方图表学中，图表被分为十二个宫位，每个宫位代表人生的不同领域。宫位就像十二个舞台，行星在其中上演你的人生剧本。

## 十二宫位速览

| 宫位 | 领域 | 关键词 |
|------|------|-------|
| 第一宫（命宫） | 自我、外在形象 | 性格、气质、第一印象 |
| 第二宫（财帛宫） | 财富、价值观 | 收入、理财、物质安全感 |
| 第三宫（兄弟宫） | 沟通、学习 | 兄弟姐妹、短途旅行、思维 |
| 第四宫（田宅宫） | 家庭、根基 | 父母、房产、内心安全感 |
| 第五宫（子女宫） | 创造力、恋爱 | 子女、娱乐、浪漫 |
| 第六宫（奴仆宫） | 工作、健康 | 日常事务、养生、服务 |
| 第七宫（夫妻宫） | 合作、婚姻 | 伴侣、合伙人、公开关系 |
| 第八宫（疾厄宫） | 转化、共享 | 遗产、亲密关系、深度心理 |
| 第九宫（迁移宫） | 远方、哲学 | 长途旅行、高等教育、信仰 |
| 第十宫（官禄宫） | 事业、社会地位 | 职业、名声、公共形象 |
| 第十一宫（交友宫） | 群体、理想 | 朋友、社团、人生目标 |
| 第十二宫（玄秘宫） | 潜意识、隐藏 | 灵魂课题、业力、隐居 |

## 如何看自己的宫位？

你的出生时间决定了宫位的起始点（上升星座）。每个宫位的起始星座不同，行星落入的宫位也不同，这就形成了你独一无二的图表地图。

→ 输入出生信息，AI 将为你绘制完整的图表宫位分析
    `,
    content_en: `
## What Are the Houses?

In Western chart analysis, the natal chart is divided into twelve houses, each representing a different area of life. Houses are like twelve stages where planets act out your life's script.

## The Twelve Houses at a Glance

| House | Domain | Keywords |
|-------|--------|----------|
| 1st House (Ascendant) | Self, outward image | Personality, demeanor, first impressions |
| 2nd House | Wealth, values | Income, finances, material security |
| 3rd House | Communication, learning | Siblings, short trips, thinking |
| 4th House (IC) | Home, roots | Parents, property, inner security |
| 5th House | Creativity, romance | Children, entertainment, love affairs |
| 6th House | Work, health | Daily routines, wellness, service |
| 7th House (Descendant) | Partnerships, marriage | Spouse, business partners, public relations |
| 8th House | Transformation, shared resources | Inheritance, intimacy, deep psychology |
| 9th House | Higher mind, travel | Long-distance travel, higher education, beliefs |
| 10th House (MC) | Career, public status | Profession, reputation, public image |
| 11th House | Groups, aspirations | Friends, communities, life goals |
| 12th House | Subconscious, hidden | Soul lessons, data, solitude |

## How to Read Your Houses?

Your birth time determines the starting point of the houses (the Ascendant sign). Each house begins with a different star sign sign, and planets fall into different houses — creating your unique natal chart map.

→ Enter your birth information and AI will generate your complete house analysis
    `,
  },

  // ────────────────────────────────────────────────────
  // 6. 星座相位
  // ────────────────────────────────────────────────────
  {
    id: "chart analysis-aspects",
    title_zh: "行星相位：合相、对冲、三分相…它们在说什么？",
    title_en: "Planetary Aspects: Conjunctions, Oppositions, Trines & What They Mean",
    summary_zh: "相位是行星之间的角度关系，决定了行星能量如何互动。合相是融合，对冲是张力，三分相是和谐。理解相位，就读懂了图表的动力系统。",
    summary_en: "Aspects are angular relationships between planets that determine how their energies interact. Conjunctions merge, oppositions create tension, trines flow harmoniously. Understanding aspects unlocks your chart's dynamic engine.",
    category: "chart analysis",
    tags_zh: ["图表", "相位", "进阶"],
    tags_en: ["Natal Chart", "Aspects", "Advanced"],
    read_time: 8,
    cover_emoji: "📐",
    created_at: "2025-03-10",
    content_zh: `
## 什么是相位？

相位是图表中行星之间形成的角度。不同的角度代表不同的能量互动模式。主要相位有五种：

## 五大主要相位

### 合相（0°）— 融合
两颗行星紧密结合，能量叠加。如同两个人合为一体，力量倍增但也可能失衡。

### 对冲（180°）— 张力
两颗行星遥遥相对，形成拉扯。这是最具挑战性的相位，但也带来最大的成长动力。

### 三分相（120°）— 和谐
两颗行星互相支持，能量流通顺畅。这是最轻松的相位，代表天赋和好运。

### 四分相（90°）— 摩擦
两颗行星互相阻碍，需要努力调和。虽然带来压力，但也催生行动力和突破。

### 六分相（60°）— 机会
两颗行星互相协助，提供温和的支持。代表机遇和人际和谐。

## 如何解读相位？

1. **看行星**：哪两颗行星形成相位？太阳与土星的对冲远比月亮与金星的四分相沉重
2. **看宫位**：相位涉及的宫位决定了影响的人生领域
3. **看容许度**：相位的精确度影响力量大小，容许度越小越强

→ AI 图表分析会自动解读你所有的重要相位
    `,
    content_en: `
## What Are Aspects?

Aspects are angular relationships between planets in the natal chart. Different angles represent different patterns of energy interaction. There are five major aspects:

## The Five Major Aspects

### Conjunction (0°) — Fusion
Two planets bind closely together, their energies merging and amplifying. Like two people becoming one — power multiplies, but imbalance can follow.

### Opposition (180°) — Tension
Two planets face each other across the chart, creating a tug-of-war. This is the most challenging aspect, but it also drives the greatest personal growth.

### Trine (120°) — Harmony
Two planets support each other with smooth energy flow. This is the easiest aspect, representing natural talent and good status.

### Square (90°) — Friction
Two planets obstruct each other, requiring effort to harmonize. Though it creates pressure, it also fuels action and breakthroughs.

### Sextile (60°) — Opportunity
Two planets assist each other gently, offering mild support. It represents opportunities and interpersonal harmony.

## How to Interpret Aspects?

1. **Check the planets**: Which two planets form the aspect? An opposition between the Sun and Saturn is far heavier than a square between the Moon and Venus.
2. **Check the houses**: The houses involved determine which life domains are affected.
3. **Check the orb**: The tighter the aspect, the stronger its influence.

→ Our AI natal chart analysis automatically interprets all your major aspects
    `,
  },

  // ────────────────────────────────────────────────────
  // 7. 大阿尔卡纳
  // ────────────────────────────────────────────────────
  {
    id: "symbol-major",
    title_zh: "大阿尔卡纳22张牌：灵魂成长的旅程",
    title_en: "The 22 Major Arcana: A Journey of Soul Growth",
    summary_zh: "从「0号愚者」的天真出发，到「21号世界」的圆满，大阿尔卡纳描绘了灵魂成长的完整弧线。每张牌都是你内在的一部分。",
    summary_en: "From the innocent Fool (0) to the complete World (21), the Major Arcana maps the full arc of soul evolution. Each card is a part of your inner self.",
    category: "symbol",
    tags_zh: ["符号", "大阿尔卡纳", "专注"],
    tags_en: ["Symbol", "Major Arcana", "Focused"],
    read_time: 10,
    cover_emoji: "🃏",
    created_at: "2025-03-15",
    content_zh: `
## 大阿尔卡纳是什么？

大阿尔卡纳（Major Arcana）是符号牌中最重要的22张牌，编号从0到21。它们描绘了灵魂从无知到觉醒的完整旅程——被称为"愚者的旅程"。

## 22张牌速览

### 第一段：物质世界的觉醒（0-7）
- **0 愚者**：新的开始，纯真，无限可能
- **1 魔术师**：创造力，意志力，资源充足
- **2 女祭司**：直觉，内在智慧，神秘
- **3 皇后**：丰收，母性，感官享受
- **4 皇帝**：权威，结构，稳定
- **5 教皇**：传统，信仰，精神指引
- **6 恋人**：爱情，选择，和谐
- **7 战车**：胜利，意志力，决心

### 第二段：内在力量的探索（8-14）
- **8 力量**：勇气，耐心，内在力量
- **9 隐士**：内省，独处，智慧
- **10 命运之轮**：转变，命运，循环
- **11 正义**：公平，因果，真相
- **12 倒吊人**：牺牲，新视角，等待
- **13 死神**：结束，转化，新生
- **14 节制**：平衡，中庸，耐心

### 第三段：精神的蜕变（15-21）
- **15 恶魔**：束缚，欲望，物质主义
- **16 塔**：突变，觉醒，打破旧有
- **17 星星**：希望，灵感，宁静
- **18 月亮**：幻觉，潜意识，恐惧
- **19 太阳**：成功，快乐，活力
- **20 审判**：觉醒，重生，召唤
- **21 世界**：完成，圆满，新的循环

## 如何使用大阿尔卡纳？

每张牌都有正位和逆位两种解读。正位代表牌面能量的正面表达，逆位则代表阻碍或内在课题。抽牌时的直觉反应往往是最准确的指引。

→ 试试 AI 符号解析，获取你的专属牌阵解读
    `,
    content_en: `
## What Is the Major Arcana?

The Major Arcana is the most important set of 22 cards in the Symbol, numbered 0 through 21. They map the soul's complete journey from ignorance to awakening — known as "The Fool's Journey."

## The 22 Cards at a Glance

### Part 1: Awakening in the Material World (0-7)
- **0 The Fool**: New beginnings, innocence, infinite possibility
- **1 The Analyst**: Creativity, willpower, abundant resources
- **2 The Inner Guide**: Intuition, inner wisdom, mystery
- **3 The Empress**: Abundance, motherhood, sensual pleasure
- **4 The Emperor**: Authority, structure, stability
- **5 The Hierophant**: Tradition, faith, focused guidance
- **6 The Lovers**: Love, choices, harmony
- **7 The Chariot**: Victory, willpower, determination

### Part 2: Exploring Inner Strength (8-14)
- **8 Strength**: Courage, patience, inner power
- **9 The Hermit**: Introspection, solitude, wisdom
- **10 Wheel of Change**: Change, cycles, transformation
- **11 Justice**: Fairness, data, truth
- **12 The Hanged Man**: Sacrifice, new perspective, waiting
- **13 Death**: Endings, transformation, rebirth
- **14 Temperance**: Balance, moderation, patience

### Part 3: Focused Transformation (15-21)
- **15 The Devil**: Bondage, desire, materialism
- **16 The Tower**: Upheaval, awakening, breaking old structures
- **17 The Star**: Hope, inspiration, serenity
- **18 The Moon**: Illusion, the subconscious, fear
- **19 The Sun**: Success, joy, vitality
- **20 Judgement**: Awakening, rebirth, calling
- **21 The World**: Completion, fulfillment, new cycles

## How to Use the Major Arcana?

Each card has both upright and reversed interpretations. Upright represents the card's positive expression; reversed indicates blockages or inner lessons. Your intuitive response when drawing cards is often the most accurate guide.

→ Try our AI Symbol Reading for your personalized spread interpretation
    `,
  },

  // ────────────────────────────────────────────────────
  // 8. 面部特征入门
  // ────────────────────────────────────────────────────
  {
    id: "face-reading-basics",
    title_zh: "面部特征入门：五官看性格与状态",
    title_en: "Face Reading Basics: How Your Features Reveal Character & Status",
    summary_zh: "额头代表早年运，鼻子主管财运，下巴关乎晚年福。学会基础面部特征，你也能读懂一个人的命运轨迹。",
    summary_en: "The forehead reveals early status, the nose rules wealth luck, and the chin governs later-life wellbeing. Learn basic face reading and you too can decode someone's behavioral path.",
    category: "face",
    tags_zh: ["面部特征", "五官", "入门"],
    tags_en: ["Face Reading", "Features", "Beginner"],
    read_time: 6,
    cover_emoji: "👁",
    created_at: "2025-04-01",
    content_zh: `
## 面部特征学基础

面部特征学（观相术）通过观察人的面部特征来推断性格和状态。中国传统面部特征学将面部分为多个宫位，每个宫位对应不同的人生领域。

## 五官与状态

### 额头 — 早年运（15-30岁）
额头饱满、宽阔、光滑的人，早年状态顺遂，学业有成。额头窄小或有纹路的人，少年时期可能较为辛苦。

### 眉毛 — 情志与兄弟
眉毛浓密有形的人，感情丰富、兄弟助力大。眉毛稀疏或断裂的人，人际交往需多注意。

### 眼睛 — 心性与智慧
眼睛是面部特征中最重要的部位。眼神清亮有神的人，心性善良、智慧过人。眼神浑浊或飘忽的人，内心可能较为迷茫。

### 鼻子 — 财运与事业（40-50岁）
鼻梁高挺、准头圆润的人，财运亨通、事业有成。鼻子扁平或有节的人，中年财运需注意理财。

### 嘴巴 — 食禄与言辞
嘴唇饱满、口角上扬的人，口福好、善于表达。嘴唇薄或下垂的人，说话需注意分寸。

### 下巴 — 晚年运（60岁以后）
下巴圆润、地阁丰满的人，晚年安乐、子孙孝顺。下巴尖削的人，晚年需提前规划。

## AI 面部特征分析

传统面部特征需要多年经验积累，而 AI 面部特征分析通过 468 个面部特征点的精确提取，可以快速、客观地给出面部特征解读。

→ 上传照片，获取你的 AI 面部特征分析报告
    `,
    content_en: `
## Fundamentals of Face Reading

Face reading (physiognomy) infers character and status by observing facial features. Traditional Chinese face reading divides the face into multiple palaces, each corresponding to different life domains.

## The Five Features and Status

### Forehead — Early Status (Ages 15-30)
A full, broad, smooth forehead indicates smooth early years and academic success. A narrow or lined forehead may suggest a more challenging youth.

### Eyebrows — Emotions & Brotherhood
Thick, well-shaped eyebrows indicate rich emotions and strong sibling support. Sparse or broken eyebrows suggest paying extra attention to interpersonal relationships.

### Eyes — Character & Wisdom
The eyes are the most important feature in face reading. Clear, bright, spirited eyes indicate a kind heart and sharp intellect. Dull or wandering eyes may suggest inner confusion.

### Nose — Wealth & Career (Ages 40-50)
A high-bridged nose with a rounded tip indicates abundant wealth luck and career success. A flat or knotted nose suggests paying attention to financial management in middle age.

### Mouth — Sustenance & Speech
Full, upturned lips indicate good status in food and drink and strong communication skills. Thin or downturned lips suggest being mindful of what you say.

### Chin — Later Status (After Age 60)
A rounded, full chin indicates a comfortable later life with filial children. A pointed chin suggests planning ahead for later years.

## AI Face Reading Analysis

Traditional face reading requires years of experience, while AI face reading precisely extracts 468 facial feature points to deliver a quick, objective interpretation.

→ Upload your photo for an AI face reading report
    `,
  },

  // ────────────────────────────────────────────────────
  // 9. 手部特征生命线
  // ────────────────────────────────────────────────────
  {
    id: "palm-life-line",
    title_zh: "手部特征生命线：不只是看寿命那么简单",
    title_en: "The Life Line in Hand Analysis: It's Not Just About Lifespan",
    summary_zh: "生命线其实代表的是生命力和健康状态，而非寿命长短。弧度大的人行动力强，断续的线可能暗示健康需要注意。",
    summary_en: "The life line actually represents vitality and health — not lifespan. A wide arc indicates strong drive; a broken line may suggest health awareness is needed.",
    category: "face",
    tags_zh: ["手部特征", "生命线", "健康"],
    tags_en: ["Hand Analysis", "Life Line", "Health"],
    read_time: 4,
    cover_emoji: "🤚",
    created_at: "2025-04-20",
    content_zh: `
## 生命线的真正含义

很多人误以为生命线越长寿命越长，这其实是最大的误解。生命线反映的是一个人的生命力强弱、健康状态和生活活力，而非寿命的长短。

## 如何看生命线？

### 弧度
生命线弧度大的人，通常行动力强、精力充沛、性格开朗。弧度小或贴近拇指的人，可能较为内敛、体力一般。

### 深浅
生命线深而清晰的人，生命力旺盛、抗压能力强。生命线浅淡的人，可能需要注意休息和保养。

### 长度
生命线的长度与寿命无关。短生命线的人同样可以健康长寿。

### 特殊纹路
- **链状纹**：健康状况波动，需要特别注意养生
- **中断**：可能暗示某个时期有健康挑战，但不代表严重问题
- **分支**：向上分支代表积极变化，向下分支需要留意

## 三大主线

除了生命线，手部特征中还有两条重要主线：

- **智慧线**：代表思维方式和智力特点
- **感情线**：代表情感表达和恋爱模式

三条线的配合分析，才能全面了解一个人的性格和命运。

→ 上传手部特征照片，AI 将为你详细解读三大主线
    `,
    content_en: `
## The True Meaning of the Life Line

Many people mistakenly believe a longer life line means a longer lifespan. This is the biggest misconception. The life line actually reflects your vitality, health condition, and life energy — not how long you'll live.

## How to Read the Life Line?

### Arc Width
A wide-arc life line typically indicates strong drive, abundant energy, and an outgoing personality. A narrow arc close to the thumb may suggest a more reserved nature with moderate physical stamina.

### Depth
A deep, clear life line indicates robust vitality and strong stress resistance. A faint life line suggests paying attention to rest and self-care.

### Length
The length of the life line is unrelated to lifespan. People with short life lines can equally enjoy long, healthy lives.

### Special Markings
- **Chain-like pattern**: Fluctuating health; pay special attention to wellness
- **Breaks**: May indicate a period of health challenge, but doesn't imply serious issues
- **Branches**: Upward branches indicate positive changes; downward branches warrant attention

## The Three Major Lines

Beyond the life line, hand analysis has two other important lines:

- **Head Line**: Represents thinking style and intellectual traits
- **Heart Line**: Represents emotional expression and love patterns

Only by analyzing all three lines together can you fully understand a person's character and profile.

→ Upload a palm photo for AI analysis of your three major lines
    `,
  },

  // ────────────────────────────────────────────────────
  // 10. 水晶优化指南
  // ────────────────────────────────────────────────────
  {
    id: "crystal-guide",
    title_zh: "水晶优化指南：不同水晶对应的五行能量",
    title_en: "Crystal Status Guide: Five Element Energy of Each Crystal",
    summary_zh: "黄水晶招财、粉水晶招感情、紫水晶增强直觉…每种水晶都对应不同的五行属性和脉轮。选对水晶，优化效果翻倍。",
    summary_en: "Citrine attracts wealth, Rose Quartz draws love, Amethyst enhances intuition — each crystal corresponds to specific Five Elements and data points. Choose the right crystal to double your status effects.",
    category: "lifestyle",
    tags_zh: ["水晶", "优化", "五行"],
    tags_en: ["Crystals", "Status", "Five Elements"],
    read_time: 5,
    cover_emoji: "💎",
    created_at: "2025-04-10",
    content_zh: `
## 水晶与五行

每种天然水晶都带有特定的五行属性，可以用来补充或调和你档案中的五行能量。

## 常见水晶五行对照

### 木属性水晶
- **绿幽灵**：事业运、贵人运
- **绿发晶**：正财运、增长
- **东陵玉**：健康、活力

### 火属性水晶
- **红玛瑙**：勇气、行动力
- **红发晶**：热情、动力
- **石榴石**：生命力、女性能量

### 土属性水晶
- **黄水晶**：偏财运、投资运
- **虎眼石**：自信、决断力
- **琥珀**：安神、优化

### 金属性水晶
- **白水晶**：净化、清晰思维
- **银发晶**：果断、执行力
- **月光石**：直觉、情感平衡

### 水属性水晶
- **黑曜石**：辟邪、吸收负能量
- **海蓝宝**：沟通、表达
- **蓝纹玛瑙**：平静、冥想

## 如何选择适合自己的水晶？

1. **先了解你的喜用神**：喜用神是五行中你最需要的元素
2. **选择对应五行的水晶**：比如喜用神是火，就选火属性水晶
3. **佩戴位置有讲究**：左手吸收能量，右手释放能量
4. **定期净化**：水晶需要定期消磁净化，保持能量纯净

## 招感情特别推荐

- **粉水晶**：温和招感情，增强人缘
- **草莓晶**：激发爱情能量，促进姻缘
- **红纹石**：增进感情，修复关系

→ 查看你的档案弱点，AI 将推荐最适合你的水晶
    `,
    content_en: `
## Crystals and the Five Elements

Every natural crystal carries a specific Five Element attribute, which can be used to supplement or harmonize the elemental energy in your profile chart.

## Common Crystals by Five Element

### Wood Element Crystals
- **Green Phantom**: Career luck, benefactor luck
- **Green Rutilated Quartz**: Earned wealth, growth
- **Aventurine**: Health, vitality

### Fire Element Crystals
- **Red Agate**: Courage, action drive
- **Red Rutilated Quartz**: Passion, motivation
- **Garnet**: Life force, feminine energy

### Earth Element Crystals
- **Citrine**: Windfall wealth, investment luck
- **Tiger's Eye**: Confidence, decisiveness
- **Amber**: Calming, optimization

### Metal Element Crystals
- **Clear Quartz**: Purification, mental clarity
- **Silver Rutilated Quartz**: Decisiveness, execution
- **Moonstone**: Intuition, emotional balance

### Water Element Crystals
- **Obsidian**: Protection, absorbing negative energy
- **Aquamarine**: Communication, expression
- **Blue Lace Agate**: Calm, meditation

## How to Choose the Right Crystal for You?

1. **First understand your Favorable Element**: This is the element your chart most needs
2. **Select crystals matching that element**: If your Favorable Element is Fire, choose Fire attribute crystals
3. **Wearing position matters**: Left hand absorbs energy, right hand releases energy
4. **Regular cleansing**: Crystals need periodic clearing to maintain pure energy

## Special Recommendations for Attracting Love

- **Rose Quartz**: Gentle love attraction, enhances charm
- **Strawberry Quartz**: Activates love energy, promotes romance
- **Rhodochrosite**: Deepens affection, repairs relationships

→ View your chart weaknesses and let AI recommend the perfect crystals for you
    `,
  },

  // ────────────────────────────────────────────────────
  // 11. 办公桌环境优化
  // ────────────────────────────────────────────────────
  {
    id: "fengshui-desk",
    title_zh: "办公桌环境优化布局：提升事业运的小技巧",
    title_en: "Desk Feng Shui: Small Tweaks to Boost Your Career Luck",
    summary_zh: "桌面左侧放绿植旺贵人运，右侧放水晶球增决策力，背后有靠山…简单的办公桌调整就能改善你的事业能量场。",
    summary_en: "Place green plants on the left for benefactor luck, a crystal sphere on the right for decision-making, and ensure support behind you — simple desk adjustments can transform your career energy field.",
    category: "lifestyle",
    tags_zh: ["环境优化", "事业", "办公"],
    tags_en: ["Feng Shui", "Career", "Office"],
    read_time: 4,
    cover_emoji: "🏢",
    created_at: "2025-05-01",
    content_zh: `
## 为什么办公桌环境优化很重要？

你每天在办公桌前度过至少8小时，桌面的布局直接影响你的工作效率、人际关系和事业状态。好的办公桌环境优化能让你事半功倍。

## 五大关键布局

### 1. 背后有靠山
办公椅背后要有实墙或高柜，代表有靠山。背后无靠容易感到不安全，事业上缺少支持。

### 2. 左高右低（左青龙右白虎）
桌面左侧放较高的物品（如文件架、绿植），右侧放较低的物品。左高右低符合"青龙高于白虎"的环境优化原则，有利于事业和贵人运。

### 3. 明堂开阔
办公桌前方要保持开阔，不要堆放杂物。明堂开阔代表前途光明，思维清晰。

### 4. 摆放绿植
桌面左侧放一盆绿植（如绿萝、富贵竹），可以旺贵人运和事业运。避免带刺植物（如仙人掌）。

### 5. 水晶助力
- **黄水晶球**：放右侧，增强决策力和财运
- **紫水晶**：放文昌位，提升思维和创造力
- **白水晶**：净化磁场，保持头脑清晰

## 颜色搭配

- **五行缺木**：多用绿色
- **五行缺火**：适当用红色点缀
- **五行缺土**：用黄色、棕色
- **五行缺金**：用白色、银色
- **五行缺水**：用黑色、深蓝色

→ 查看你的五行喜忌，获取专属环境优化建议
    `,
    content_en: `
## Why Does Desk Feng Shui Matter?

You spend at least 8 hours a day at your desk. Its layout directly affects your work efficiency, relationships, and career status. Good desk Feng Shui helps you accomplish more with less effort.

## Five Key Layout Principles

### 1. Have a Solid Backing
Your chair should face a solid wall or tall cabinet, representing a "mountain" of support. Sitting with no backing behind you can create insecurity and lack of career support.

### 2. High on the Left, Low on the Right (Azure Dragon > White Tiger)
Place taller items on the left side of your desk (file organizers, plants) and shorter items on the right. This follows the Feng Shui principle of "the Azure Dragon should be higher than the White Tiger," benefiting career and benefactor luck.

### 3. Keep the Front Open
Keep the space in front of your desk clear of clutter. An open "bright hall" represents a bright future and clear thinking.

### 4. Add Green Plants
Place a green plant on the left side of your desk (like pothos or favorable bamboo) to boost benefactor and career luck. Avoid thorny plants (like cacti).

### 5. Crystal Enhancement
- **Citrine sphere**: Place on the right for decision-making and wealth luck
- **Amethyst**: Place in the Wen Chang position (study/creativity corner) to boost thinking and creativity
- **Clear Quartz**: Cleanses the energy field and maintains mental clarity

## Color Coordination

- **Lacking Wood**: Use more green
- **Lacking Fire**: Add touches of red
- **Lacking Earth**: Use yellow and brown
- **Lacking Metal**: Use white and silver
- **Lacking Water**: Use black and dark blue

→ Check your Five Element favorability for personalized Feng Shui advice
    `,
  },

  // ────────────────────────────────────────────────────
  // 12. 星座四元素
  // ────────────────────────────────────────────────────
  {
    id: "chart analysis-elements",
    title_zh: "火土环境优化：星座四元素的深层解读",
    title_en: "Fire, Earth, Air, Water: The Deeper Meaning of Star Sign Elements",
    summary_zh: "每个星座都归属一个元素：火象热情奔放，土象务实稳重，风象灵活多变，水象敏感细腻。了解元素，就掌握了星座的核心密码。",
    summary_en: "Every star sign sign belongs to an element: Fire signs are passionate, Earth signs are grounded, Air signs are adaptable, Water signs are sensitive. Understanding elements unlocks the core code of chart analysis.",
    category: "chart analysis",
    tags_zh: ["星座", "元素", "入门"],
    tags_en: ["Star Sign", "Elements", "Beginner"],
    read_time: 5,
    cover_emoji: "🔥",
    created_at: "2025-04-15",
    content_zh: `
## 星座与四元素

西方图表学将十二星座分为四组，每组对应一个元素。元素决定了星座的基本性质和行为模式。

## 火象星座：白羊、狮子、射手

火象星座充满热情和行动力。他们天生乐观、自信、有感染力。

**优点**：勇气、创造力、领导力
**挑战**：冲动、急躁、自我中心
**事业方向**：创业、表演、体育、领导岗位

## 土象星座：金牛、处女、摩羯

土象星座务实、稳重、有耐心。他们注重实际成果，是可靠的执行者。

**优点**：勤奋、可靠、组织力强
**挑战**：固执、保守、过度物质化
**事业方向**：金融、工程、农业、管理

## 风象星座：双子、天秤、水瓶

风象星座灵活、善于社交、思维敏捷。他们是天生的沟通者和思想家。

**优点**：沟通力、适应力、创新思维
**挑战**：犹豫不决、表面化、疏离
**事业方向**：传媒、教育、外交、科技

## 水象星座：巨蟹、天蝎、双鱼

水象星座敏感、直觉强、富有同理心。他们最能感知他人的情绪。

**优点**：同理心、直觉、创造力
**挑战**：情绪化、敏感、逃避现实
**事业方向**：心理、医疗、艺术、优化

## 元素与五行的关系

有趣的是，星座四元素与中国五行有着微妙的对应：
- 火象 ≈ 火
- 土象 ≈ 土
- 风象 ≈ 木（生长、流通）
- 水象 ≈ 水
- 金属在西方体系中没有直接对应

→ AI 五维合参将星座元素与五行结合分析，给出更精准的解读
    `,
    content_en: `
## Star Sign Signs and the Four Elements

Western chart analysis divides the twelve star sign signs into four groups, each associated with an element. Elements determine the fundamental nature and behavioral patterns of each sign.

## Fire Signs: Aries, Leo, Sagittarius

Fire signs are filled with passion and drive. They are naturally optimistic, confident, and infectious.

**Strengths**: Courage, creativity, leadership
**Challenges**: Impulsiveness, impatience, self-centeredness
**Career paths**: Entrepreneurship, performance, sports, leadership roles

## Earth Signs: Taurus, Virgo, Capricorn

Earth signs are practical, grounded, and patient. They focus on tangible results and are reliable executors.

**Strengths**: Diligence, dependability, strong organizational skills
**Challenges**: Stubbornness, conservatism, over-materialism
**Career paths**: Finance, engineering, agriculture, management

## Air Signs: Gemini, Libra, Aquarius

Air signs are adaptable, socially skilled, and quick-thinking. They are natural communicators and thinkers.

**Strengths**: Communication, adaptability, innovative thinking
**Challenges**: Indecisiveness, superficiality, detachment
**Career paths**: Media, education, diplomacy, technology

## Water Signs: Cancer, Scorpio, Pisces

Water signs are sensitive, highly intuitive, and deeply empathetic. They are most attuned to others' emotions.

**Strengths**: Empathy, intuition, creativity
**Challenges**: Emotional volatility, oversensitivity, escapism
**Career paths**: Psychology, healthcare, arts, optimization

## Elements and the Five Elements Connection

Interestingly, the four Western elements have subtle correspondences with the Chinese Five Elements:
- Fire signs ≈ Fire
- Earth signs ≈ Earth
- Air signs ≈ Wood (growth, circulation)
- Water signs ≈ Water
- Metal has no direct counterpart in the Western system

→ Our AI 5-Dimension Analysis combines star sign elements with Five Elements for more precise readings
    `,
  },

  // ────────────────────────────────────────────────────
  // 13. 四柱合婚
  // ────────────────────────────────────────────────────
  {
    id: "bazi-marriage",
    title_zh: "四柱合婚：五行配对与婚姻缘分",
    title_en: "Bazi Marriage Compatibility: Five Element Pairing & Relationship Profile",
    summary_zh: "你和另一半的五行是相生还是相克？四柱合婚不只是看属相，更要看日主配合、十维互补。本文教你用行为分析的视角理解婚恋关系。",
    summary_en: "Are you and your partner in a generating or overcoming cycle? Bazi marriage compatibility goes beyond star sign animals — it examines Day Master harmony and Ten God complementarity. Learn to understand relationships through behavioral analysis.",
    category: "bazi",
    tags_zh: ["四柱", "合婚", "感情", "婚姻"],
    tags_en: ["Bazi", "Compatibility", "Relationship", "Marriage"],
    read_time: 8,
    cover_emoji: "💕",
    created_at: "2025-05-20",
    content_zh: `
## 四柱合婚的核心逻辑

四柱合婚不是简单地看「属相配不配」。真正有效的合婚分析需要从三个层面入手：

### 第一层：日主五行关系

日主代表你自己，配偶日柱的地支代表你的配偶宫。看两人的日主五行关系是相生还是相克：

| 日主配对 | 关系 | 解读 |
|---------|------|------|
| 甲木 + 己土 | 甲己合化土 | 天干五合，缘分深厚 |
| 丙火 + 辛金 | 丙辛合化水 | 相互吸引，感情浓烈 |
| 戊土 + 癸水 | 戊癸合化火 | 心灵相通，默契十足 |
| 同类五行 | 比肩/劫财 | 朋友式婚姻，平等互助 |
| 相克五行 | 官杀/财星 | 有压力但能互相成就 |

### 第二层：十维互补

理想的婚配是十维互补——你缺的刚好是他多的：

- **财旺配印旺**：一方事业心强，一方顾家有方
- **食神配正官**：一方有才华创意，一方有责任感
- **比肩配食神**：双方都独立自主，互相欣赏

### 第三层：喜用神是否冲突

最关键的一点：如果两人的喜用神是同一五行，则高度契合；如果喜用神相克，则容易产生矛盾。

## 属相合婚只是入门

民间常说「龙配鸡」「虎配猪」，这只是最表层的参考。属相只占四柱的八分之一（年柱地支），忽略了最重要的日柱。两个人属相「不合」但日柱天合地合的比比皆是。

## 实用建议

1. **不要因为属相不合就放弃**：四柱是八个字的整体配合，不是一两个字说了算
2. **看相处感受**：分析是参考，真实相处的感觉更重要
3. **AI 合婚分析**：输入双方出生信息，系统会从五行、十维、喜用神三个维度综合判断

→ 输入双方出生信息，获取 AI 四柱合婚分析
    `,
    content_en: `
## The Core Logic of Bazi Marriage Compatibility

Bazi marriage compatibility is not simply about checking star sign animal signs. True compatibility analysis works on three levels:

### Level 1: Day Master Five Element Relationship

The Day Master represents you; your spouse's Day Pillar Earthly Branch represents your spouse palace. Examine whether both Day Masters are in a generating or overcoming relationship:

| Day Master Pair | Relationship | Interpretation |
|----------------|-------------|----------------|
| Jia Wood + Ji Earth | Jia-Ji combine into Earth | Stem combination — deep bond |
| Bing Fire + Xin Metal | Bing-Xin combine into Water | Strong attraction, passionate connection |
| Wu Earth + Gui Water | Wu-Gui combine into Fire | Soul-level connection, deep rapport |
| Same element | Companion/Rob Wealth | Friendship-style marriage, equal partnership |
| Overcoming elements | Officer/Wealth star | Pressure exists but mutual growth possible |

### Level 2: Ten God Complementarity

The ideal marriage pairing features complementary Ten Gods — what one lacks, the other provides:

- **Strong Wealth + Strong Resource**: One is career-driven, the other is home-oriented
- **Eating God + Direct Officer**: One is creative, the other is responsible
- **Companion + Eating God**: Both are independent and mutually admiring

### Level 3: Favorable Element Compatibility

The most critical factor: if both partners share the same Favorable Element, they are highly compatible. If their Favorable Elements clash, conflicts are likely.

## Star Sign Animal Compatibility Is Just the Surface

The民间 pairing of "Dragon + Rooster" or "Tiger + Pig" is the most superficial reference. The star sign animal represents only one-eighth of the chart (Year Pillar's Earthly Branch), ignoring the all-important Day Pillar. Many couples with "incompatible" star sign animals have Day Pillars that perfectly harmonize.

## Practical Advice

1. **Don't give up over star sign incompatibility** — the full chart consists of eight characters, not just one or two
2. **Trust your feelings** — behavioral analysis is a reference; real connection matters more
3. **Try AI compatibility analysis** — input both birth details for a comprehensive multi-dimensional reading

→ Enter both birth details for AI Bazi marriage compatibility analysis
    `,
  },

  // ────────────────────────────────────────────────────
  // 14. 出生时间不确定
  // ────────────────────────────────────────────────────
  {
    id: "faq-birthtime",
    title_zh: "出生时间不确定怎么办？影响有多大？",
    title_en: "Unsure of Your Exact Birth Time? How Much Does It Really Matter?",
    summary_zh: "很多人只知道出生日期不知道具体时辰。四柱差一个时辰就是完全不同的档案。本文教你如何处理出生时间不确定的情况，以及如何通过面部特征等维度弥补。",
    summary_en: "Many people know their birth date but not the exact hour. In Bazi, one two-hour difference creates an entirely different chart. Learn how to handle uncertain birth times and how other dimensions like face reading can compensate.",
    category: "faq",
    tags_zh: ["四柱", "入门", "出生时间", "FAQ"],
    tags_en: ["Bazi", "Beginner", "Birth Time", "FAQ"],
    read_time: 5,
    cover_emoji: "🕐",
    created_at: "2025-05-22",
    content_zh: `
## 出生时间为什么重要？

四柱由年、月、日、时四柱组成。每一柱由天干和地支两个字构成，共八个字。其中「时柱」（出生时辰）占了四柱的四分之一。

时辰是两个小时为一个单位：
- 子时：23:00-01:00
- 丑时：01:00-03:00
- 寅时：03:00-05:00
- 卯时：05:00-07:00
- 辰时：07:00-09:00
- 巳时：09:00-11:00
- 午时：11:00-13:00
- 未时：13:00-15:00
- 申时：15:00-17:00
- 酉时：17:00-19:00
- 戌时：19:00-21:00
- 亥时：21:00-23:00

时柱的不同会影响时柱天干（时干）和时柱地支（时支），进而影响十维格局和整体五行分布。

## 不确定出生时间怎么办？

### 方法一：回忆关键线索
- 出生证、户口本上可能有记录
- 问父母或家中老人
- 回忆出生时的天色（天亮了？还是天黑了？）
- 母亲的分娩过程（顺产还是剖腹产？大致时间？）

### 方法二：用面部特征和手部特征辅助
AI 五维合参的优势在于：即使出生时间不精确，还可以通过面部特征和手部特征来补充。面部特征反映的是你当下的状态状态，不依赖出生时间。

### 方法三：多时辰对比
如果实在不确定，可以用两个不同时辰分别分析，对比哪个更符合你的实际情况（性格、经历、外貌特征）。

## AI 分析的灵活性

我们的五维合参系统允许你：
1. 用已知信息（日期 + 大致时辰）生成初步报告
2. 上传面部特征和手部特征照片，AI 会结合视觉信息进行修正
3. 五维数据交叉验证，即使某一维度信息不完整，其他维度也能补足

→ 不确定出生时间？先试试 AI 分析，看看能给你什么洞察
    `,
    content_en: `
## Why Does Birth Time Matter?

Bazi consists of four pillars — Year, Month, Day, and Hour. Each pillar has a Stem and Earthly Branch (two characters), totaling eight characters. The "Hour Pillar" accounts for one-quarter of the entire chart.

Time is divided into two-hour units:
- Zi Hour: 23:00-01:00
- Chou Hour: 01:00-03:00
- Yin Hour: 03:00-05:00
- Mao Hour: 05:00-07:00
- Chen Hour: 07:00-09:00
- Si Hour: 09:00-11:00
- Wu Hour: 11:00-13:00
- Wei Hour: 13:00-15:00
- Shen Hour: 15:00-17:00
- You Hour: 17:00-19:00
- Xu Hour: 19:00-21:00
- Hai Hour: 21:00-23:00

Different hour pillars affect the Hour Stem and Branch, which influence the Ten Gods pattern and overall Five Element distribution.

## What to Do If You're Unsure?

### Method 1: Recall Key Clues
- Birth certificates or household registration may have records
- Ask parents or elderly family members
- Remember the sky conditions at birth (was it dawn? dark?)
- Mother's delivery experience (natural or C-section? approximate time?)

### Method 2: Use Face & Palm Reading as Backup
The advantage of AI 5-Dimension Analysis: even if birth time is imprecise, face and palm readings can supplement. Face reading reflects your current status state, independent of birth time.

### Method 3: Compare Multiple Charts
If truly uncertain, generate charts with two different hour assumptions and compare which one better matches your actual experiences (personality, life events, physical features).

## The Flexibility of AI Profile Reading

Our 5-Dimension system lets you:
1. Generate a preliminary report with available information (date + approximate time)
2. Upload face and palm photos — AI cross-references visual data to refine the analysis
3. Five-dimension cross-validation: even with incomplete data in one dimension, others compensate

→ Unsure of your birth time? Try our AI reading to see what insights it can offer
    `,
  },

  // ────────────────────────────────────────────────────
  // 15. 符号反复测
  // ────────────────────────────────────────────────────
  {
    id: "symbol-repetition",
    title_zh: "符号牌可以反复测同一件事吗？",
    title_en: "Can You Ask Symbol the Same Question Repeatedly?",
    summary_zh: "很多人抽到不满意的牌就想再抽一次。但符号牌真的能「重考」吗？反复解读会带来什么影响？本文解答符号解析中「重复提问」的核心原则。",
    summary_en: "Many people want to re-draw when they get an unsatisfying card. But can symbol really be 'retaken'? What impact does repeated analysis have? This article addresses the core principles of repeated questioning in symbol.",
    category: "symbol",
    tags_zh: ["符号", "能量解读", "FAQ", "入门"],
    tags_en: ["Symbol", "Analysis", "FAQ", "Beginner"],
    read_time: 4,
    cover_emoji: "🃏",
    created_at: "2025-05-23",
    content_zh: `
## 核心原则：一个问题只问一次

符号牌的核心原则是：**同一个问题，在同一段时间内，只应该问一次。**

这就像考试——你不能因为成绩不满意就要求重考。符号牌反映的是「此时此刻」的能量状态，而你的提问心态会影响抽牌结果。

## 为什么不应该反复测？

### 1. 能量被稀释
每次解读都在读取你当下的能量场。反复提问意味着你处于焦虑、不安的状态，这种心态会干扰牌面信息的准确性。

### 2. 牌面会「矛盾」
同一件事多次抽牌，牌面常常互相矛盾——这不是符号不准，而是因为每次解读都在读取不同角度的能量信息，混在一起反而更混乱。

### 3. 你在寻找「想要的答案」
当第一次结果不满意时再抽一次，你的潜意识已经在「寻找」某个特定答案，而非「接收」真实信息。这时抽到的牌往往反映的是你的执念，而非客观趋势。

## 什么情况下可以重新解读？

以下情况是可以的：

- **时间过了**：如果事情已经过去一段时间（通常建议至少一个月），情况发生了变化，可以重新问
- **换了角度**：第一次问「他喜不喜欢我」，过了一段时间可以问「我应该如何处理这段关系」
- **新的事件**：发生了新的重大变化，原来的解读结果已经不适用

## 正确的做法

1. **提问前想清楚**：想好一个明确的问题
2. **一次解读就够了**：相信第一次的结果
3. **记录下来**：事后回顾，看看第一次的牌面是否应验
4. **行动比解读重要**：符号给你的是方向，不是答案

→ AI 符号解析：专注地问一个问题，获取深层指引
    `,
    content_en: `
## Core Principle: Ask Once Per Question

The core principle of symbol is: **The same question should only be asked once within the same timeframe.**

It's like an exam — you can't demand a retake because you're unhappy with the score. Symbol reads the energy state of "this very moment," and your questioning mindset affects the card outcome.

## Why Shouldn't You Repeat?

### 1. Energy Gets Diluted
Each reading taps into your current energy field. Repeated questioning means you're in an anxious, unsettled state — this mindset interferes with the accuracy of the cards.

### 2. Cards Will "Contradict"
Multiple draws on the same topic often produce contradictory cards — not because symbol is inaccurate, but because each reading captures different angles of energy. Mixing them together creates more confusion.

### 3. You're Seeking a "Desired Answer"
When you re-draw after an unsatisfying first result, your subconscious is already "searching" for a specific answer rather than "receiving" honest information. The cards you then draw often reflect your attachment rather than objective trends.

## When Is It Okay to Re-Draw?

These situations are acceptable:

- **Time has passed**: If significant time has passed (at least one month is recommended) and circumstances have changed, you can ask again
- **Different angle**: Instead of "Does he like me?", you could later ask "How should I handle this relationship?"
- **New events**: Major new developments have occurred that make the original reading obsolete

## The Right Approach

1. **Think clearly before asking**: Formulate a specific question
2. **One reading is enough**: Trust the first result
3. **Record it**: Review later to see how the initial cards manifested
4. **Action matters more than analysis**: Symbol gives direction, not answers

→ AI Symbol Reading: ask one focused question for deep guidance
    `,
  },

  // ────────────────────────────────────────────────────
  // 16. AI分析 vs 传统分析师
  // ────────────────────────────────────────────────────
  {
    id: "faq-ai-vs-traditional",
    title_zh: "AI 分析 vs 传统分析师：有什么区别？",
    title_en: "AI Profile Reading vs Traditional Masters: What's the Difference?",
    summary_zh: "AI 五维合参和找分析师进行行为分析有什么不同？AI 更快更客观，但传统分析师有经验加持。本文从准确性、深度、价格、隐私等维度对比两种方式。",
    summary_en: "How does AI 5-Dimension Analysis compare to visiting a traditional analyst? AI is faster and more objective, while traditional masters bring years of experience. This article compares both approaches across accuracy, depth, price, and privacy.",
    category: "faq",
    tags_zh: ["AI", "行为分析", "FAQ", "对比"],
    tags_en: ["AI", "Profile", "FAQ", "Comparison"],
    read_time: 5,
    cover_emoji: "🤖",
    created_at: "2025-05-24",
    content_zh: `
## 两种方式的核心区别

| 维度 | AI 五维合参 | 传统分析师 |
|------|-----------|-----------|
| **速度** | 40秒出报告 | 需要预约，30-60分钟面谈 |
| **维度** | 五维同时分析（四柱+图表+符号+面部特征+手部特征） | 通常只擅长一两个体系 |
| **客观性** | 基于算法和数据，不受情绪影响 | 依赖个人经验和直觉 |
| **价格** | 免费基础版，会员制高级版 | 通常 200-2000 元/次 |
| **隐私** | 面部图片不存储，数据加密 | 面对面交流，隐私风险 |
| **深度** | 结构化分析，逻辑清晰 | 可能有专注层面的洞察 |
| **反复使用** | 随时可重新分析 | 需要再次预约 |
| **文化传承** | 融合现代技术 | 数千年传统传承 |

## AI 的优势

1. **五维交叉验证**：同时分析五个体系，减少单一维度的偏差
2. **标准化输出**：每次分析的标准一致，不会因为分析师状态好坏而波动
3. **即时可得**：不需要排队等待，随时随地可以分析
4. **价格亲民**：远低于传统分析师的收费

## 传统分析师的优势

1. **经验判断**：几十年经验带来的直觉和洞察，有时能捕捉到AI忽略的细节
2. **互动式解读**：可以实时追问，根据你的反馈深入解读
3. **文化仪式感**：面对面的仪式感本身就是一种优化

## 我们的建议

**两种方式并不矛盾，可以互补使用：**

- 用 AI 做初步诊断——快速了解五行分布、命格格局
- 用 AI 的五维合参做全面体检——多角度交叉验证
- 如果遇到重大人生决策，可以再找传统分析师做深度咨询

AI 不是要取代传统行为分析，而是让更多人以更低的门槛接触分析智慧。

→ 体验 AI 五维合参，40秒获取你的专属档案分析
    `,
    content_en: `
## Core Differences

| Dimension | AI 5-Dimension Analysis | Traditional Master |
|-----------|------------------------|-------------------|
| **Speed** | 40-second report | Appointment needed, 30-60 min consultation |
| **Scope** | 5 dimensions simultaneously (Bazi + Chart Analysis + Symbol + Face + Palm) | Typically skilled in 1-2 systems only |
| **Objectivity** | Algorithm-based, unaffected by emotions | Depends on individual experience and intuition |
| **Price** | Free basic, membership for premium | Usually ¥200-2000 per session |
| **Privacy** | Face images not stored, data encrypted | In-person interaction, privacy risks |
| **Depth** | Structured analysis, logical clarity | May offer focused-level insights |
| **Repeat use** | Re-analyze anytime | Requires re-booking |
| **Cultural heritage** | Modern technology fusion | Thousands of years of tradition |

## AI Advantages

1. **Five-dimension cross-validation**: Analyzing five systems simultaneously reduces single-dimension bias
2. **Standardized output**: Consistent analysis every time, regardless of the master's mood or state
3. **Instant access**: No queuing required, available anytime, anywhere
4. **Affordable**: Far less expensive than traditional masters

## Traditional Master Advantages

1. **Experienced judgment**: Intuition and insights from decades of practice that may catch details AI misses
2. **Interactive reading**: Real-time follow-up questions, deepening the interpretation based on your feedback
3. **Ceremonial significance**: The in-person experience itself can be optimization

## Our Recommendation

**These two approaches complement each other:**

- Use AI for an initial diagnosis — quickly understand your Five Element distribution and chart pattern
- Use AI's 5-Dimension Analysis for a comprehensive reading — cross-validated from multiple angles
- For major life decisions, consult a traditional master for deeper guidance

AI doesn't replace traditional behavioral analysis — it makes behavioral wisdom accessible to more people at a lower barrier.

→ Experience AI 5-Dimension Analysis — get your personalized chart in 40 seconds
    `,
  },

  // ────────────────────────────────────────────────────
  // 17. 周期状态入门
  // ────────────────────────────────────────────────────
  {
    id: "bazi-annual",
    title_zh: "周期状态入门：怎么看今年运气好不好？",
    title_en: "Annual Cycle Basics: How to Read Your Yearly Luck",
    summary_zh: "四柱档案是固定的，但周期状态每年都在变。2025年乙巳蛇年，你该注意什么？本文教你理解周期天干地支如何影响你的状态。",
    summary_en: "Your Bazi chart is fixed, but annual cycle cycles change every year. What should you watch for in 2025 (Yi Si Snake Year)? Learn how the yearly Stem-Branch combination influences your status.",
    category: "bazi",
    tags_zh: ["四柱", "周期", "状态", "2025"],
    tags_en: ["Bazi", "Annual Cycle", "Luck Cycle", "2025"],
    read_time: 7,
    cover_emoji: "📅",
    created_at: "2025-05-25",
    content_zh: `
## 什么是周期？

周期就是「流动的年份」。每个人的四柱档案是出生时就固定的，但每一年都有一个新的天干地支组合（比如2025年是乙巳年），这个组合会与你的档案产生互动，形成那一年的状态。

## 周期如何影响你？

周期的天干地支会与你档案中的元素发生生克关系：

### 周期天干的作用
- **克你档案的元素**：带来压力和挑战，但也可能催生成长
- **生你档案的元素**：带来助力和机会
- **与你档案相同的元素**：增强你的力量，但也可能过旺

### 周期地支的作用
- **合**：与档案地支相合，代表好的变化、合作、缘分
- **冲**：与档案地支相冲，代表变动、冲突、突破
- **刑**：与档案地支相刑，代表矛盾、纠纷、健康问题
- **害**：与档案地支相害，代表阻碍、小人、暗损

## 2025年乙巳蛇年要点

2025年天干为乙木，地支为巳火：
- **乙木年**：木气当令，适合生长、发展、创新
- **巳火年**：火气旺盛，热情高涨但也要防急躁
- 与属猪（亥）的人相冲，与属猴（申）的人相合

## 如何判断自己的周期好坏？

关键看周期与你档案的关系：

1. **周期生助你的喜用神**：大吉，把握机会
2. **周期克制你的喜用神**：不利，注意防范
3. **周期与档案形成三合/六合**：有贵人相助
4. **周期与档案形成六冲**：变动大，可能有搬家/换工作

## 实用建议

- 每年年初做一次周期分析，了解该年的重点和注意事项
- 周期不利时不必恐慌，提前准备可以化解大部分风险
- 周期好时要抓住机会，不要犹豫

→ 输入出生信息，AI 将为你分析 2025 周期状态
    `,
    content_en: `
## What Is Annual Cycle (Liu Nian)?

"Liu Nian" means "flowing year." Your Bazi chart is fixed at birth, but each year brings a new Stem-Branch combination (2025 is the Yi Si / Wood Snake year). This combination interacts with your chart to form that year's status.

## How Does Annual Cycle Affect You?

The yearly Stem-Branch creates generating and overcoming relationships with your chart elements:

### Yearly Stem Effects
- **Overcomes chart elements**: Brings pressure and challenges, but may catalyze growth
- **Generates chart elements**: Brings support and opportunities
- **Same as chart elements**: Amplifies your strength, but risks excess

### Yearly Earthly Branch Effects
- **Combine (He)**: Good changes, cooperation, new connections
- **Clash (Chong)**: Major changes, conflict, breakthroughs
- **Punishment (Xing)**: Contradictions, disputes, health issues
- **Harm (Hai)**: Obstacles, hidden enemies, subtle losses

## 2025 Yi Si Snake Year Highlights

2025's Stem is Yi Wood, Earthly Branch is Si Fire:
- **Yi Wood year**: Wood energy leads — good for growth, development, innovation
- **Si Fire year**: Fire energy is strong — enthusiasm runs high but watch for impulsiveness
- Clashes with Pig (Hai) signs, combines with Monkey (Shen) signs

## How to Judge Your Annual Cycle?

The key is the relationship between the year and your chart:

1. **Year supports your Favorable Element**: Very favorable — seize opportunities
2. **Year weakens your Favorable Element**: Challenging — take precautions
3. **Year forms San He / Liu He with chart**: Benefactors will help
4. **Year forms Liu Chong with chart**: Big changes — possible relocation or job change

## Practical Advice

- Do an annual status analysis at the start of each year to understand priorities and precautions
- Unfavorable years aren't cause for panic — advance preparation resolves most risks
- Favorable years demand action — don't hesitate

→ Enter your birth details for AI 2025 annual status analysis
    `,
  },

  // ────────────────────────────────────────────────────
  // 18. 星座配对指南
  // ────────────────────────────────────────────────────
  {
    id: "chart analysis-compatibility",
    title_zh: "十二星座配对指南：谁和谁最合拍？",
    title_en: "Star Sign Compatibility Guide: Which Signs Are Most Compatible?",
    summary_zh: "白羊配天秤是最佳拍档？天蝎和水瓶真的不合？星座配对不只是看太阳星座，上升星座和月亮星座的影响更大。本文从元素、模式、相位三个维度解析星座关系。",
    summary_en: "Aries-Libra is the perfect pair? Scorpio and Aquarius really don't work? Star Sign compatibility goes beyond Sun signs — Rising and Moon signs matter even more. This article analyzes relationships through elements, modalities, and aspects.",
    category: "chart analysis",
    tags_zh: ["星座", "配对", "感情", "入门"],
    tags_en: ["Star Sign", "Compatibility", "Relationship", "Beginner"],
    read_time: 8,
    cover_emoji: "💑",
    created_at: "2025-05-26",
    content_zh: `
## 配对的三个层次

### 第一层：太阳星座（最基础）

太阳星座是最广为人知的配对方式，但也是最粗略的。它只考虑你出生时太阳所在的星座。

传统配对参考：
- **同元素最和谐**：火象配火象（白羊+狮子+射手）、土象配土象等
- **对宫最吸引**：白羊-天秤、金牛-天蝎、双子-射手、巨蟹-摩羯、狮子-水瓶、处女-双鱼
- **三合最舒适**：白羊+狮子+射手（火象三合）、金牛+处女+摩羯（土象三合）等

### 第二层：上升星座（外在互动）

上升星座代表你给世界的第一印象，也代表你「需要」什么样的伴侣。两个人上升星座的配合度，往往比太阳星座更能决定日常相处是否舒服。

### 第三层：月亮星座（内心需求）

月亮星座代表你内心深处的情感需求。两个人月亮星座的配合度，决定了「能不能交心」——这是长期关系中最重要的因素。

## 元素配对详解

### 火象 + 火象
热情爆棚，恋爱轰轰烈烈，但也容易互相消耗。需要学会给彼此空间。

### 火象 + 风象
最佳拍档！风助火势，两人能互相激发灵感。沟通顺畅，充满活力。

### 土象 + 土象
稳定踏实，像两棵并肩生长的大树。但可能缺少浪漫和惊喜。

### 土象 + 水象
互补型配对。土给水安全感，水给土情感滋养。需要学会表达感受。

### 水象 + 风象
需要磨合。水的情绪化和风的理性可能产生冲突，但如果学会理解，会是深度成长的配对。

### 风象 + 水象
精神层面非常合拍，但在实际生活中可能需要更多耐心。

## 比星座配对更重要的是

1. **了解完整的图表**：太阳只是其中一个因素
2. **尊重个体差异**：同星座的人千差万别
3. **沟通和包容**：没有任何配对是完美的，经营比选择更重要

→ AI 图表分析：超越太阳星座，看你的完整情感地图
    `,
    content_en: `
## Three Levels of Compatibility

### Level 1: Sun Sign (Most Basic)

Sun sign compatibility is the most well-known but also the most superficial. It only considers where the Sun was at your birth.

Traditional pairing references:
- **Same element harmonizes best**: Fire + Fire (Aries+Leo+Sagittarius), Earth + Earth, etc.
- **Opposite signs attract**: Aries-Libra, Taurus-Scorpio, Gemini-Sagittarius, Cancer-Capricorn, Leo-Aquarius, Virgo-Pisces
- **Trine signs are comfortable**: Aries+Leo+Sagittarius (Fire trine), Taurus+Virgo+Capricorn (Earth trine), etc.

### Level 2: Rising Sign (External Interaction)

The Rising Sign represents your outward image and what kind of partner you "need." Compatibility between two Rising Signs often determines daily comfort better than Sun signs.

### Level 3: Moon Sign (Inner Needs)

The Moon Sign represents your deepest emotional needs. Moon sign compatibility determines whether you can truly "connect hearts" — the most important factor in long-term relationships.

## Element Pairing Guide

### Fire + Fire
Explosive passion, dramatic romance, but容易 burn each other out. Need to learn to give each other space.

### Fire + Air
Best partners! Air fans the flame — you inspire each other effortlessly. Communication flows, energy stays high.

### Earth + Earth
Stable and grounded, like two trees growing side by side. But may lack romance and surprises.

### Earth + Water
Complementary pairing. Earth gives Water security; Water nourishes Earth emotionally. Need to learn to express feelings.

### Water + Air
Requires adjustment. Water's emotional nature and Air's rationality can clash, but if understood, this becomes a pairing of deep growth.

### Air + Water
Mentally very compatible, but may need extra patience in practical daily life.

## What Matters More Than Sun Sign Compatibility

1. **Understand the full chart**: The Sun is just one factor
2. **Respect individual differences**: Two people of the same sign can be vastly different
3. **Communication and acceptance**: No pairing is perfect — nurturing matters more than choosing

→ AI Natal Chart Analysis: go beyond Sun signs to map your complete emotional landscape
    `,
  },

  // ────────────────────────────────────────────────────
  // 19. 五维合参报告解读
  // ────────────────────────────────────────────────────
  {
    id: "faq-reading-guide",
    title_zh: "五维合参报告怎么解读？新手必读指南",
    title_en: "How to Read Your 5-Dimension Analysis: A Beginner's Guide",
    summary_zh: "拿到报告后不知道怎么看？五行得分是什么意思？十维格局怎么理解？本文手把手教你读懂 AI 五维合参报告的每个部分。",
    summary_en: "Got your report but not sure how to read it? What do Five Element scores mean? How to interpret Ten Gods patterns? This guide walks you through every section of your AI 5-Dimension Analysis report.",
    category: "faq",
    tags_zh: ["报告", "解读", "入门", "五维合参"],
    tags_en: ["Report", "Reading Guide", "Beginner", "5-Dimension"],
    read_time: 6,
    cover_emoji: "📖",
    created_at: "2025-05-27",
    content_zh: `
## 报告结构总览

一份完整的五维合参报告包含以下部分：

### 1. 基本信息
- 出生时间对应的四柱四柱
- 西方图表的上升星座和太阳星座
- 日主天干（代表你自己的那个字）

### 2. 五行得分图
柱状图显示金、木、水、火、土的分布比例：
- **得分最高的元素**：你档案中最强的力量
- **得分最低的元素**：你档案中最弱的力量
- **注意**：最弱的不一定要补——关键看「喜用神」

### 3. 喜用神分析
告诉你档案最需要什么元素：
- 喜用神是你状态的「导航方向」
- 所有优化方法（颜色、方位、水晶、职业）都围绕喜用神

### 4. 十维格局
描述你的命格特征：
- **正官旺**：适合体制内、管理层
- **食神旺**：适合创意、艺术、自由职业
- **偏财旺**：适合经商、投资
- **正印旺**：适合学术、教育、研究

### 5. 五维交叉验证
AI 将四柱、图表、符号、面部特征、手部特征五个维度的结果进行交叉对比：
- 如果多个维度指向同一个结论 → 置信度高
- 如果维度之间有矛盾 → 报告会标注差异并给出解释

## 如何使用报告？

1. **先看五行和喜用神**：这是最基础的
2. **看十维格局**：了解自己的天赋方向
3. **看五维验证**：确认分析的可靠程度
4. **关注建议部分**：具体的优化行动指南

## 常见问题

**Q：报告说的准吗？**
AI 分析基于精确的天文学计算和传统行为分析逻辑，但行为分析只是参考。最好的验证方式是看报告描述是否符合你的实际情况。

**Q：可以反复生成吗？**
可以。同一天多次生成的结果是一致的。不同日期生成可能因为周期变化而有细微差异。

**Q：报告会过时吗？**
基础命格（四柱、图表）不会变，但状态分析（周期、月运）会随时间更新。

→ 还没获取过报告？现在就试试 AI 五维合参
    `,
    content_en: `
## Report Structure Overview

A complete 5-Dimension Analysis report includes the following sections:

### 1. Basic Information
- Four Pillars Bazi derived from birth time
- Rising Sign and Sun Sign from Western chart analysis
- Day Master Stem (the character representing you)

### 2. Five Element Score Chart
A bar chart showing the distribution of Metal, Wood, Water, Fire, and Earth:
- **Highest scoring element**: The strongest force in your chart
- **Lowest scoring element**: The weakest force in your chart
- **Note**: Weakest doesn't always need supplementing — the key is the "Favorable Element"

### 3. Favorable Element Analysis
Tells you which element your chart most needs:
- Your Favorable Element is the "navigation direction" for your status
- All status-enhancing methods (colors, directions, crystals, careers) revolve around this

### 4. Ten Gods Pattern
Describes your chart personality:
- **Strong Direct Officer**: Suited for government, management roles
- **Strong Eating God**: Suited for creative arts, freelancing
- **Strong Indirect Wealth**: Suited for business, investing
- **Strong Direct Resource**: Suited for academia, education, research

### 5. Five-Dimension Cross-Validation
AI compares results across all five systems (Bazi, Chart Analysis, Symbol, Face, Palm):
- If multiple dimensions point to the same conclusion → high confidence
- If dimensions conflict → the report flags differences and provides explanation

## How to Use Your Report?

1. **Start with Five Elements and Favorable Element**: This is the foundation
2. **Review Ten Gods patterns**: Understand your natural talents
3. **Check five-dimension validation**: Confirm the reliability of the analysis
4. **Focus on the recommendations section**: Practical action guide for status enhancement

## Frequently Asked Questions

**Q: Is the report accurate?**
AI analysis is based on precise astronomical calculations and traditional behavioral logic, but behavioral analysis is a reference. The best validation is whether the report matches your actual experiences.

**Q: Can I regenerate it?**
Yes. Multiple generations on the same day produce consistent results. Different dates may show subtle differences due to changing annual/monthly status cycles.

**Q: Does the report expire?**
Your basic chart (Bazi, Natal Chart) doesn't change, but status analysis (annual, monthly cycles) updates over time.

→ Haven't received a report yet? Try AI 5-Dimension Analysis now
    `,
  },

  // ────────────────────────────────────────────────────
  // 20. 面部特征看痣
  // ────────────────────────────────────────────────────
  {
    id: "face-moles",
    title_zh: "面部特征看痣：脸上的痣代表什么？",
    title_en: "Face Moles & Freckles: What Do They Mean in Face Reading?",
    summary_zh: "脸上不同位置的痣有不同的含义。额头正中有痣代表什么？嘴角有痣好不好？本文系统梳理面部痣相学的基本知识，帮你读懂脸上的「命运密码」。",
    summary_en: "Moles on different parts of the face carry different meanings. What does a mole between the eyebrows signify? Is a mole near the mouth auspicious? This article systematically covers facial mole reading basics to help you decode the 'profile code' on your face.",
    category: "face",
    tags_zh: ["面部特征", "痣相", "入门"],
    tags_en: ["Face Reading", "Moles", "Beginner"],
    read_time: 5,
    cover_emoji: "✨",
    created_at: "2025-05-28",
    content_zh: `
## 痣相学基础

痣相学是面部特征学的一个分支，通过痣的位置、大小、颜色来推断状态。但需要注意：痣相只是面部特征的一个辅助参考，不能单独下结论。

## 面部主要痣位解读

### 额头区域（早年运 15-30岁）

- **印堂有痣（两眉之间）**：传统认为此处有痣的人感情路较曲折，但也代表有专注天赋
- **天庭正中有痣**：少年时期可能有波折，但中年后状态转好
- **发际线内有痣**：性格内敛，适合幕后工作

### 眉眼区域（中年运 31-50岁）

- **眉中有痣**：「草里藏珠」，代表有隐藏的才华或意外之财
- **眼角有痣**：感情运旺，感情生活丰富
- **眼尾有痣**：需要留意感情中的第三者问题
- **眼袋有痣**：子女缘分较深

### 鼻子区域（财运 40-55岁）

- **鼻头有痣**：传统认为影响财运，但现代面部特征学认为只是提醒注意理财
- **鼻梁有痣**：健康方面需要留意脊椎和呼吸系统
- **鼻翼有痣**：漏财迹象，建议做好储蓄规划

### 嘴巴区域（食禄运）

- **嘴角有痣**：「美人痣」，口福好、善于表达
- **嘴唇上有痣**：感情丰富，食禄运佳
- **下巴有痣**：晚年状态好，有不动产运

### 耳朵区域（智慧与寿命）

- **耳垂有痣**：有福气、长寿
- **耳背有痣**：性格独立，有自己的想法

## 关于痣的几个常见误区

### 误区一：痣越黑越不好
实际上，痣的吉凶取决于位置和整体面部特征的配合，而非颜色深浅。光滑、圆润的黑痣反而可能是好痣。

### 误区二：点了痣就能优化
痣相只是面部特征的一个参考点，点掉一颗痣不会根本改变你的状态。真正的优化需要从五行调和、行为习惯等多方面入手。

### 误区三：所有痣都要去掉
医学上建议去除的是突然变大、边缘不规则、颜色不均匀的痣（可能是恶变信号）。其他痣可以保留。

## 现代面部特征学的态度

痣相学作为传统文化的一部分有其参考价值，但不宜过度迷信。面部特征是整体分析的一部分，需要结合五官、脸型、气色等综合判断。

→ AI 面部特征分析：468个特征点精确解读，不只是看痣
    `,
    content_en: `
## Fundamentals of Mole Reading

Mole reading is a branch of face reading that interprets status through mole position, size, and color. However, note that mole reading is just one supplementary reference within face reading — conclusions shouldn't be drawn from moles alone.

## Key Facial Mole Positions

### Forehead Area (Early Status, Ages 15-30)

- **Mole between the eyebrows (Yin Tang)**: Traditionally indicates a complex love life, but also focused talent
- **Center of forehead**: Possible turbulence in youth, but status improves after middle age
- **Within the hairline**: Reserved personality, suited for behind-the-scenes work

### Eye & Eyebrow Area (Mid-Life Status, Ages 31-50)

- **Mole within the eyebrow**: "Hidden pearl in grass" — represents concealed talent or unexpected wealth
- **Corner of the eye**: Strong romantic luck, rich love life
- **Outer eye corner**: Watch for third-party complications in relationships
- **Under-eye mole**: Deep connection with children

### Nose Area (Wealth Status, Ages 40-55)

- **Mole on nose tip**: Traditionally considered to affect wealth luck; modern interpretation: a reminder to manage finances carefully
- **Mole on nose bridge**: Pay attention to spinal and respiratory health
- **Mole on nose wing**: Sign of wealth leakage — consider savings planning

### Mouth Area (Sustenance Status)

- **Mole near mouth corner**: "Beauty mole" — good food luck, eloquent speaker
- **Mole on lips**: Rich emotions, good sustenance status
- **Mole on chin**: Good later status, property status

### Ear Area (Wisdom & Longevity)

- **Mole on earlobe**: Fortunate, long-lived
- **Mole behind ear**: Independent thinker with own ideas

## Common Mole Reading Myths

### Myth 1: Darker moles are worse
Actually, a mole's status depends on position and overall facial harmony, not color depth. Smooth, round dark moles can actually be auspicious.

### Myth 2: Removing moles changes your status
Moles are just one reference point — removing one won't fundamentally alter your profile. True status enhancement requires multi-dimensional approaches including Five Element harmony and behavioral habits.

### Myth 3: All moles should be removed
Medically, moles that suddenly enlarge, have irregular borders, or uneven coloring should be examined (potential malignancy signal). Other moles can be safely kept.

## Modern Face Reading Perspective

Mole reading as part of traditional culture has reference value, but shouldn't be taken too literally. Facial features are one part of a comprehensive analysis that must consider all features, face shape, and complexion together.

→ AI Face Reading: 468 feature points for precise analysis — not just moles
    `,
  },

  // ────────────────────────────────────────────────────
  // 21. 图表系统入门
  // ────────────────────────────────────────────────────
  {
    id: "ziwei-intro",
    title_zh: "图表系统入门：你的十二宫命运地图",
    title_en: "Zi Wei Dou Shu: Your Twelve-Palace Profile Map",
    summary_zh: "图表系统是中国行为分析学的另一大体系，与四柱并称「行为分析双璧」。它用十四颗主星分布在十二宫中，描绘你人生的全景地图。",
    summary_en: "Zi Wei Dou Shu is another major Chinese behavioral system, often called the 'twin star' alongside Bazi. It uses fourteen major stars distributed across twelve palaces to map your complete life blueprint.",
    category: "bazi",
    tags_zh: ["图表系统", "入门", "档案"],
    tags_en: ["Zi Wei Dou Shu", "Beginner", "Chart"],
    read_time: 7,
    cover_emoji: "⭐",
    created_at: "2025-05-30",
    content_zh: `
## 什么是图表系统？

图表系统起源于唐代，由道家发展完善，是中国传统行为分析学中精度最高的体系之一。它与四柱的最大区别在于：四柱用出生时间推算五行，而图表系统用出生时间排出「档案」，将十四颗主星分布在十二个宫位中。

## 档案结构

图表档案是一个方形盘，分为十二个宫位，每个宫位代表人生的一个领域：

| 宫位 | 代表领域 | 通俗理解 |
|------|---------|---------|
| 命宫 | 自我、性格 | 你是谁 |
| 兄弟宫 | 兄弟姐妹、同辈关系 | 你的朋友圈 |
| 夫妻宫 | 婚姻、感情 | 你的另一半 |
| 子女宫 | 子女、下属 | 你的传承 |
| 财帛宫 | 财运、理财 | 你的钱包 |
| 疾厄宫 | 健康、疾病 | 你的身体 |
| 迁移宫 | 外出、社交 | 你的社交圈 |
| 交友宫 | 朋友、贵人 | 你的助力 |
| 官禄宫 | 事业、工作 | 你的职场 |
| 田宅宫 | 不动产、家庭 | 你的根基 |
| 福德宫 | 精神、享受 | 你的内心 |
| 父母宫 | 父母、长辈 | 你的靠山 |

## 十四颗主星

图表系统的核心是十四颗主星，每颗星都有独特的能量：

### 帝星组
- **图表星**：帝王之星，领导力强，自尊心高
- **天府星**：财库之星，稳重务实，善于守财

### 天象组
- **太阳星**：光明之星，热情大方，博爱
- **太阴星**：月亮之星，细腻敏感，内敛

### 天同组
- **天同星**：福星，温和善良，知足常乐
- **天梁星**：荫星，正义感强，乐于助人

### 天机组
- **天机星**：智慧之星，思维敏捷，善变
- **巨门星**：口才之星，能言善辩，是非多

### 天府系
- **武曲星**：财星，果断刚毅，适合经商
- **天相星**：印星，正直稳重，适合辅佐
- **七杀星**：将星，冲劲十足，敢闯敢拼
- **破军星**：变动之星，开创力强，不安于现状

### 天府对星
- **贪狼星**：感情之星，多才多艺，欲望强
- **廉贞星**：次感情，复杂多变，情绪起伏

## 四柱 vs 图表系统

| 维度 | 四柱 | 图表系统 |
|------|------|---------|
| 起源 | 宋代 | 唐代 |
| 核心 | 五行生克 | 星曜组合 |
| 精度 | 年月日时 | 年月日时+性别 |
| 优势 | 简洁快速 | 细节丰富 |
| 周期 | 看大运周期 | 看大限周期 |

两者并不矛盾，而是互补。很多专业分析师会同时参考四柱和图表系统。

→ AI 分析工具融合四柱与图表逻辑，为你生成多维分析
    `,
    content_en: `
## What Is Zi Wei Dou Shu?

Zi Wei Dou Shu (Purple Star Chart Analysis) originated in the Tang Dynasty and was refined by Taoist practitioners. It is one of the most precise systems in Chinese behavioral analysis. Its key difference from Bazi: while Bazi uses birth time to calculate Five Elements, Zi Wei Dou Shu uses it to plot a "chart" distributing fourteen major stars across twelve palaces.

## Chart Structure

The Zi Wei chart is a square divided into twelve palaces, each representing a life domain:

| Palace | Domain | Plain Meaning |
|--------|--------|---------------|
| Ming (Life) | Self, personality | Who you are |
| Siblings | Siblings, peers | Your peer group |
| Spouse | Marriage, romance | Your partner |
| Children | Children, subordinates | Your legacy |
| Wealth | Status, finances | Your wallet |
| Health | Health, illness | Your body |
| Travel | Travel, socializing | Your social circle |
| Friends | Friends, benefactors | Your support |
| Career | Career, work | Your professional life |
| Property | Real estate, family | Your foundation |
| Status | Energy, enjoyment | Your inner self |
| Parents | Parents, elders | Your backing |

## The Fourteen Major Stars

The core of Zi Wei Dou Shu is fourteen major stars, each with unique energy:

### Imperial Stars
- **Zi Wei (Emperor Star)**: Leadership, strong self-esteem
- **Tian Fu (Treasury Star)**: Financial wisdom, stability, wealth preservation

### Celestial Image Group
- **Tai Yang (Sun Star)**: Radiance, generosity, broad-mindedness
- **Tai Yin (Moon Star)**: Sensitivity, introspection, gentleness

### Harmony Group
- **Tian Tong (Harmony Star)**: Wellbeing, contentment, kindness
- **Tian Liang (Shade Star)**: Justice, helpfulness, protective energy

### Mechanism Group
- **Tian Ji (Wisdom Star)**: Quick thinking, adaptability
- **Ju Men (Giant Gate)**: Eloquence, communication, controversy

### Tian Fu System
- **Wu Qu (Martial Arts Star)**: Financial acumen, decisiveness, business talent
- **Tian Xiang (Seal Star)**: Integrity, stability, supportive roles
- **Qi Sha (Seven Killings)**: Boldness, drive, pioneering energy
- **Po Jun (Army Breaker)**: Innovation, restlessness, transformation

### Tian Fu Counterpart Stars
- **Tan Lang (Greedy Wolf)**: Talent, versatility, desire
- **Lian Zhen (Pure Integrity)**: Complexity, emotional depth

## Bazi vs Zi Wei Dou Shu

| Dimension | Bazi | Zi Wei Dou Shu |
|-----------|------|----------------|
| Origin | Song Dynasty | Tang Dynasty |
| Core | Five Element cycles | Star combinations |
| Precision | Year-Month-Day-Hour | + Gender |
| Strength | Concise, quick | Rich in detail |
| Annual Cycle | Da Yun flow year | Da Xian flow year |

The two systems don't contradict — they complement each other. Many professional analysts reference both.

→ Our AI tool integrates Bazi and Zi Wei logic for multi-dimensional analysis
    `,
  },

  // ────────────────────────────────────────────────────
  // 22. 手部特征智慧线与感情线
  // ────────────────────────────────────────────────────
  {
    id: "palm-head-heart",
    title_zh: "手部特征智慧线与感情线：读懂你的思维与情感",
    title_en: "Head Line & Heart Line: Understanding Your Mind and Emotions",
    summary_zh: "智慧线代表思维方式，感情线代表情感模式。一条清晰的智慧线意味着什么？感情线分叉好不好？本文详解手部特征中最重要的两条主线。",
    summary_en: "The Head Line reveals your thinking style; the Heart Line shows your emotional patterns. What does a clear Head Line mean? Is a forked Heart Line good? This article details the two most important lines in hand analysis.",
    category: "face",
    tags_zh: ["手部特征", "智慧线", "感情线"],
    tags_en: ["Hand Analysis", "Head Line", "Heart Line"],
    read_time: 6,
    cover_emoji: "🤚",
    created_at: "2025-06-01",
    content_zh: `
## 手部特征三大主线

手部特征学中有三条最重要的主线：生命线、智慧线、感情线。上一篇我们讲了生命线，本文详解智慧线和感情线。

## 智慧线（人纹）

智慧线从拇指与食指之间出发，横贯手掌中部，代表一个人的思维方式、智力特点和判断力。

### 智慧线的形态

**长而清晰**
思维缜密、逻辑性强，适合从事需要精密思考的工作（如科研、法律、编程）。

**短而有力**
行动力强、直觉敏锐，适合从事需要快速决策的工作（如创业、销售、管理）。

**向下弯曲**
想象力丰富、富有艺术天赋，适合从事创意类工作（如设计、写作、音乐）。

**笔直横贯**
务实理性、注重细节，适合从事精确性工作（如会计、工程、医学）。

### 智慧线的特殊纹路

- **链状纹**：思维容易分心，注意力需要训练
- **岛纹**：某个时期可能有思维困惑或判断失误
- **分叉**：多才多艺，但可能过于分散精力
- **末端向上**：乐观积极，善于发现机会

## 感情线（天纹）

感情线从小指下方出发，横贯手掌上方，代表一个人的情感表达方式、恋爱模式和情绪管理能力。

### 感情线的形态

**长而上扬**
感情丰富、热情主动，在恋爱中积极表达，善于经营关系。

**平直而短**
理性克制、慢热型，不轻易表露感情，但一旦认定就很专一。

**深入食指下方**
重感情、重承诺，在婚姻中忠诚度高，但也可能过于理想化。

**末端分叉**
感情经历丰富，可能有多段重要感情，但也代表情感细腻、善于理解他人。

### 感情线的特殊纹路

- **链状纹**：感情上容易纠结，需要学会放下
- **岛纹**：感情中可能有隐瞒或不坦诚的时期
- **断裂**：感情中可能有重大变化（不一定是坏事，也可能是蜕变）
- **向上支线**：感情状态积极，容易获得幸福
- **向下支线**：感情中需要注意沟通和信任

## 三线配合分析

单独看一条线只能了解一个方面。真正的手部特征分析需要三条线配合：

- **生命线深 + 智慧线长 + 感情线上扬**：行动力强、思维缜密、感情丰富——全面型人才
- **生命线浅 + 智慧线短 + 感情线平直**：需要加强锻炼、培养思维、主动表达感情
- **智慧线分叉 + 感情线分叉**：多才多艺但需要专注，感情丰富但需要稳定

→ 上传手部特征照片，AI 将为你分析三大主线的综合含义
    `,
    content_en: `
## The Three Major Lines in Hand Analysis

Hand Analysis has three most important lines: the Life Line, Head Line, and Heart Line. Our previous article covered the Life Line. This one details the Head Line and Heart Line.

## The Head Line (Ren Wen / Human Pattern)

The Head Line starts between the thumb and index finger, crossing the middle of the palm. It represents thinking style, intellectual traits, and judgment ability.

### Head Line Shapes

**Long and Clear**
Meticulous thinking, strong logic — suited for precision work (research, law, programming).

**Short and Strong**
Strong action drive, sharp intuition — suited for quick-decision roles (entrepreneurship, sales, management).

**Curves Downward**
Rich imagination, artistic talent — suited for creative work (design, writing, music).

**Straight Across**
Practical, detail-oriented — suited for precise work (accounting, engineering, medicine).

### Special Markings

- **Chain pattern**: Mind tends to wander; attention needs training
- **Island**: Period of mental confusion or misjudgment
- **Fork**: Multi-talented but may spread too thin
- **Upturned end**: Optimistic, good at spotting opportunities

## The Heart Line (Tian Wen / Heaven Pattern)

The Heart Line starts below the little finger, crossing the upper palm. It represents emotional expression, love patterns, and emotional management.

### Heart Line Shapes

**Long and Upturned**
Rich emotions, passionate and proactive in love, skilled at maintaining relationships.

**Straight and Short**
Rational and reserved, slow to warm up, but once committed, very loyal.

**Extends Under Index Finger**
Values deep feelings and commitment, high marital loyalty, but may idealize relationships.

**Forks at the End**
Rich emotional experiences, may have multiple significant relationships, but also represents emotional sensitivity and empathy.

### Special Markings

- **Chain pattern**: Tendency to overthink emotions; needs to learn letting go
- **Island**: Period of emotional dishonesty or hidden feelings
- **Break**: Major emotional shift (not necessarily bad — can be transformation)
- **Upward branches**: Positive love status, easy to find happiness
- **Downward branches**: Pay attention to communication and trust in relationships

## Three-Line Combined Analysis

Analyzing one line alone only reveals one aspect. True hand analysis analysis requires combining all three:

- **Deep Life + Long Head + Upturned Heart**: Strong drive, sharp mind, rich emotions — a well-rounded person
- **Shallow Life + Short Head + Flat Heart**: Needs exercise, mental development, and proactive emotional expression
- **Forked Head + Forked Heart**: Multi-talented but needs focus; emotionally rich but needs stability

→ Upload a palm photo for AI analysis of your three major lines
    `,
  },

  // ────────────────────────────────────────────────────
  // 23. 符号逆位解读
  // ────────────────────────────────────────────────────
  {
    id: "symbol-reversed",
    title_zh: "符号逆位解读：当牌倒过来时意味着什么？",
    title_en: "Reversed Symbol Cards: What Does It Mean When a Card Is Upside Down?",
    summary_zh: "抽到逆位牌是不是坏事？其实逆位只是能量的另一种表达方式。本文教你正确理解符号逆位牌，不再被「倒牌」吓到。",
    summary_en: "Does a reversed card mean bad luck? Actually, reversals are just another expression of card energy. Learn to correctly interpret reversed symbol cards without fear.",
    category: "symbol",
    tags_zh: ["符号", "逆位", "解读"],
    tags_en: ["Symbol", "Reversed", "Interpretation"],
    read_time: 6,
    cover_emoji: "🔄",
    created_at: "2025-06-02",
    content_zh: `
## 逆位不等于坏事

很多人抽到逆位牌就紧张，觉得是坏兆头。这是最大的误解。逆位只是牌面能量的另一种表达方式——它可能代表：

1. **内在化的能量**：能量向内而非向外，需要自我反省
2. **被阻碍的能量**：能量想表达但受到阻碍
3. **过度或不足**：正位的能量太多或太少
4. **需要成长的领域**：提醒你在某个方面需要提升

## 逆位的三种解读方法

### 方法一：减弱法（最常用）
逆位 = 正位能量减弱。

例：正位「力量」代表勇气和自信，逆位则代表勇气不足、缺乏自信。

### 方法二：相反法
逆位 = 正位的反面。

例：正位「恋人」代表和谐的选择，逆位则代表选择困难、关系不和。

### 方法三：内在法（进阶）
逆位 = 正位能量向内发展，尚未外显。

例：正位「太阳」代表外在的成功和快乐，逆位可能代表内心有快乐但尚未展现给外界。

## 常见大阿尔卡纳逆位速查

| 牌 | 正位含义 | 逆位含义 |
|----|---------|---------|
| 0 愚者 | 新的开始、冒险 | 冲动、犹豫不决 |
| 1 魔术师 | 创造力、行动力 | 缺乏方向、欺骗 |
| 2 女祭司 | 直觉、内在智慧 | 忽视直觉、表面化 |
| 3 皇后 | 丰收、享受 | 过度依赖、缺乏安全感 |
| 4 皇帝 | 权威、稳定 | 控制欲强、固执 |
| 6 恋人 | 爱情、和谐 | 关系不和、选择困难 |
| 7 战车 | 胜利、决心 | 失控、方向迷失 |
| 10 命运之轮 | 转变、好运 | 坏运、抗拒改变 |
| 13 死神 | 结束、新生 | 抗拒结束、停滞不前 |
| 17 星星 | 希望、灵感 | 失望、缺乏信心 |
| 19 太阳 | 成功、快乐 | 暂时的挫折、内在快乐 |

## 如何正确看待逆位？

1. **不要恐慌**：逆位不是惩罚，而是提醒
2. **结合问题理解**：逆位的含义取决于你问的问题
3. **注意正逆位比例**：如果大部分牌是逆位，可能说明当前能量场较混乱
4. **行动建议**：逆位牌通常暗示「需要在某个方面做出调整」

→ AI 符号解析：自动解读正位与逆位，给你完整的能量地图
    `,
    content_en: `
## Reversed ≠ Bad

Many people panic when they draw a reversed card, thinking it's a bad omen. This is the biggest misconception. Reversed cards are simply another expression of card energy — they may represent:

1. **Internalized energy**: Energy directed inward rather than outward, requiring self-reflection
2. **Blocked energy**: Energy wanting to express but facing obstacles
3. **Excess or deficiency**: Too much or too little of the upright energy
4. **Growth area**: A reminder that you need development in a certain aspect

## Three Methods for Reading Reversals

### Method 1: Weakening (Most Common)
Reversed = Upright energy is weakened.

Example: Upright "Strength" represents courage and confidence; reversed represents lack of courage or low self-confidence.

### Method 2: Opposition
Reversed = Opposite of the upright meaning.

Example: Upright "The Lovers" represents harmonious choice; reversed represents difficulty choosing or relationship discord.

### Method 3: Internalization (Advanced)
Reversed = Upright energy developing internally, not yet manifesting outwardly.

Example: Upright "The Sun" represents external success and joy; reversed may mean inner happiness that hasn't been shared with the world yet.

## Major Arcana Reversal Quick Reference

| Card | Upright | Reversed |
|------|---------|----------|
| 0 The Fool | New beginnings, adventure | Impulsiveness, indecision |
| 1 The Analyst | Creativity, action | Lack of direction, deception |
| 2 The Inner Guide | Intuition, inner wisdom | Ignoring intuition, superficiality |
| 3 The Empress | Abundance, enjoyment | Over-dependence, insecurity |
| 4 The Emperor | Authority, stability | Controlling, stubbornness |
| 6 The Lovers | Love, harmony | Relationship discord, indecision |
| 7 The Chariot | Victory, determination | Loss of control, confusion |
| 10 Wheel of Change | Change, good luck | Bad luck, resisting change |
| 13 Death | Endings, rebirth | Resisting endings, stagnation |
| 17 The Star | Hope, inspiration | Disappointment, loss of faith |
| 19 The Sun | Success, joy | Temporary setbacks, inner joy |

## How to Properly View Reversals?

1. **Don't panic**: Reversals aren't punishment — they're reminders
2. **Context matters**: Reversed meaning depends on your question
3. **Check the ratio**: If most cards are reversed, the current energy may be chaotic
4. **Action guidance**: Reversed cards usually suggest "an adjustment is needed in some area"

→ AI Symbol Reading: automatically interprets upright and reversed cards for your complete energy map
    `,
  },

  // ────────────────────────────────────────────────────
  // 24. 平台使用指南
  // ────────────────────────────────────────────────────
  {
    id: "platform-guide",
    title_zh: "档案智镜使用指南：从注册到获取报告",
    title_en: "Profile Mirror User Guide: From Registration to Your Report",
    summary_zh: "第一次使用档案智镜？本指南手把手教你如何注册、填写信息、上传面部特征手部特征、获取五维合参报告，以及如何使用星尘和代金券。",
    summary_en: "First time using Profile Mirror? This guide walks you through registration, filling in birth details, uploading face & palm photos, getting your 5-Dimension report, and using Stardust and coupons.",
    category: "faq",
    tags_zh: ["指南", "入门", "平台", "教程"],
    tags_en: ["Guide", "Beginner", "Platform", "Tutorial"],
    read_time: 5,
    cover_emoji: "📱",
    created_at: "2025-06-03",
    content_zh: `
## 第一步：注册账号

1. 点击右上角「注册」按钮
2. 输入邮箱和密码
3. 验证邮箱后即可登录

也可以使用微信快捷登录（小程序端）。

## 第二步：填写出生信息

进入「开始分析」页面，填写以下信息：

- **出生年月日**：选择公历日期
- **出生时辰**：尽量精确到时辰（如不确定可选「不确定」）
- **性别**：男/女
- **出生城市**：选择省市区

> 提示：出生时间越精确，分析结果越准确。如果不确定时辰，AI 会用面部特征和手部特征来弥补。

## 第三步：上传面部特征和手部特征（可选但推荐）

这一步是五维合参的特色——通过上传照片，AI 可以分析你的面部特征和手部特征，与四柱、图表交叉验证。

**面部特征照片要求：**
- 正面免冠照
- 光线充足，面部清晰
- 不要戴墨镜或帽子

**手部特征照片要求：**
- 左右手掌各一张
- 手指自然张开
- 掌纹清晰可见

## 第四步：获取五维合参报告

提交后，AI 将在约 40 秒内生成你的专属报告。报告包含：

1. **五行得分图**：金木水火土的分布比例
2. **日主分析**：你的命格核心
3. **喜用神**：你最需要的五行元素
4. **十维格局**：你的天赋方向
5. **五维交叉验证**：多个维度的一致性分析
6. **优化建议**：颜色、方位、职业等具体建议

## 星尘（Stardust）是什么？

星尘是平台内的虚拟货币，用于：
- 解锁详细报告内容
- 追问 AI 命师
- 使用事件复盘功能

**获取星尘的方式：**
- 注册赠送 100 星尘
- 每日签到获取
- 购买会员每月注入
- 邀请好友获得奖励

## 代金券（Coupon）是什么？

代金券是商城购物的抵扣券：
- 解锁报告时自动赠送 60 元代金券
- 会员每月额外获得
- 可在优化商城购买水晶、书籍等商品时使用

## 会员等级

| 等级 | 权益 |
|------|------|
| 免费用户 | 基础报告 + 每日签到 |
| 月度会员 | 全维报告无限次 + 每月 100 星尘 |
| 年度会员 | 月度全部权益 + 每月 150 星尘 + 8.8 折 |
| 创始席位 | 永久全功能 + 每月 500 星尘 + 投票权 |

→ 现在就注册，开始你的五维命运探索之旅
    `,
    content_en: `
## Step 1: Create an Account

1. Click the "Sign Up" button in the top right
2. Enter your email and password
3. Verify your email to log in

WeChat Quick Login is also available on the miniprogram.

## Step 2: Fill in Birth Details

Go to the "Start Reading" page and fill in:

- **Birth Date**: Select the Gregorian calendar date
- **Birth Hour**: As precise as possible (select "Uncertain" if unsure)
- **Gender**: Male / Female
- **Birth City**: Select province, city, district

> Tip: The more precise your birth time, the more accurate the analysis. If unsure, AI compensates with face and palm readings.

## Step 3: Upload Face & Palm Photos (Optional but Recommended)

This is the unique feature of 5-Dimension Analysis — uploading photos lets AI analyze your face and palm, cross-validating with Bazi and chart analysis.

**Face photo requirements:**
- Front-facing, no headwear
- Well-lit, face clearly visible
- No sunglasses or hats

**Palm photo requirements:**
- One photo each for left and right hand
- Fingers naturally spread
- Palm lines clearly visible

## Step 4: Get Your 5-Dimension Report

After submission, AI generates your personalized report in about 40 seconds. The report includes:

1. **Five Element Score Chart**: Metal, Wood, Water, Fire, Earth distribution
2. **Day Master Analysis**: Your chart's core identity
3. **Favorable Element**: The element your chart most needs
4. **Ten Gods Pattern**: Your natural talent direction
5. **Five-Dimension Cross-Validation**: Consistency analysis across systems
6. **Status Enhancement Guide**: Specific advice on colors, directions, careers

## What Is Stardust?

Stardust is the platform's virtual currency, used for:
- Unlocking detailed report content
- Follow-up questions to AI masters
- Event Retrospective feature

**Ways to earn Stardust:**
- 100 free on registration
- Daily check-ins
- Monthly infusion with membership
- Referral rewards

## What Are Coupons?

Coupons are marketplace discount vouchers:
- 60 yuan coupon automatically granted when unlocking reports
- Extra coupons for members each month
- Usable in the Status Shop for crystals, books, etc.

## Membership Tiers

| Tier | Benefits |
|------|----------|
| Free User | Basic report + daily check-ins |
| Monthly | Unlimited full reports + 100 Stardust/month |
| Yearly | All monthly benefits + 150 Stardust/month + 12% off |
| Founder Seat | Lifetime access + 500 Stardust/month + voting rights |

→ Register now and start your 5-Dimension behavioral exploration
    `,
  },
]
