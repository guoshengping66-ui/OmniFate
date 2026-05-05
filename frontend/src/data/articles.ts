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
  { key: "bazi", label_zh: "八字命理", label_en: "Bazi Destiny" },
  { key: "astrology", label_zh: "西方占星", label_en: "Western Astrology" },
  { key: "tarot", label_zh: "塔罗指南", label_en: "Tarot Guide" },
  { key: "face", label_zh: "面相手相", label_en: "Face & Palm" },
  { key: "lifestyle", label_zh: "改运生活", label_en: "Fortune Lifestyle" },
]

export const ARTICLES: Article[] = [
  // ────────────────────────────────────────────────────
  // 1. 五行入门
  // ────────────────────────────────────────────────────
  {
    id: "wuxing-basics",
    title_zh: "五行入门：金木水火土如何影响你的命运",
    title_en: "Five Elements Basics: How Metal, Wood, Water, Fire & Earth Shape Your Destiny",
    summary_zh: "五行是中国命理学的基础框架。了解五行的相生相克关系，是理解八字命盘的第一步。本文用最通俗的语言解释五行的本质。",
    summary_en: "The Five Elements form the foundation of Chinese destiny analysis. Understanding their generating and overcoming cycles is the first step to reading a Bazi chart. This article explains the essence of the Five Elements in plain language.",
    category: "wuxing",
    tags_zh: ["五行", "入门", "基础"],
    tags_en: ["Five Elements", "Beginner", "Fundamentals"],
    read_time: 5,
    cover_emoji: "🌿",
    created_at: "2025-01-15",
    content_zh: `五行——金、木、水、火、土——是中国古代哲学的核心概念，也是命理学的基础框架。它描述了宇宙万物相生相克的动态平衡关系。

五行相生

木生火：木材燃烧产生火焰。火生土：火焰燃烧后化为灰烬。土生金：金属矿藏蕴于大地之中。金生水：金属表面凝结水珠。水生木：水灌溉滋养树木生长。

五行相克

木克土：树根穿透土壤。土克水：堤坝阻挡水流。水克火：水能浇灭火焰。火克金：烈火能熔化金属。金克木：金属工具砍伐树木。

五行与你的命盘

在八字命盘中，每个人的出生时间对应着天干地支，每个天干地支都带有五行属性。通过计算八字中五行的分布，命理师可以判断你五行的强弱——这就是「五行得分」。

比如，如果你八字中木特别旺而金很弱，就叫「木旺缺金」。但这并不意味着你一定要补金——还需要看你命盘的「喜用神」。

常见误区

误区一：缺什么就补什么。这是最常见的误解。命理学讲究的是「喜用神」，即你命盘最需要的元素，而非简单地补充缺失的元素。有时缺的元素恰恰是你不需要的。

误区二：五行越均衡越好。均衡是理想状态，但大多数人的命盘都有偏旺或偏弱的元素。关键是找到对你最有利的平衡点。

小测试

你知道自己的日主天干是什么吗？日主天干是八字中代表你自己的那个字。如果你知道自己的出生年月日时，可以试试我们的 AI 推命工具，一键生成你的五行分析。点击「开始推命」获取你的五行分析报告。`,
    content_en: `The Five Elements — Metal, Wood, Water, Fire, and Earth — are core concepts in ancient Chinese philosophy and the foundation of destiny analysis. They describe the dynamic balance of mutual generation and overcoming among all things in the universe.

The Generating Cycle (Xiang Sheng)

Wood generates Fire: Wood burns to produce flame. Fire generates Earth: Fire leaves behind ash. Earth generates Metal: Metal ore is found within the earth. Metal generates Water: Moisture condenses on metal surfaces. Water generates Wood: Water nourishes trees and plants.

The Overcoming Cycle (Xiang Ke)

Wood overcomes Earth: Tree roots penetrate the soil. Earth overcomes Water: Dams block the flow of water. Water overcomes Fire: Water extinguishes flame. Fire overcomes Metal: Intense heat melts metal. Metal overcomes Wood: Metal tools fell trees.

The Five Elements in Your Chart

In a Bazi chart, each person's birth time corresponds to a set of Heavenly Stems and Earthly Branches, each carrying a Five Element attribute. By calculating the distribution of elements in the chart, a practitioner can determine your elemental strengths — this is called the 「Five Element Score.」

For example, if your chart has very strong Wood but weak Metal, it's described as 「Wood flourishing, Metal lacking.」 But this doesn't necessarily mean you need to add Metal — you also need to consider your chart's 「Favorable Element」 (Xi Yong Shen).

Common Misconceptions

Misconception 1: If you lack an element, you must supplement it. This is the most common misunderstanding. Destiny analysis focuses on the 「Favorable Element」 — what your chart most needs — not simply replenishing what's missing. Sometimes the missing element is precisely the one you don't need.

Misconception 2: The more balanced the Five Elements, the better. Balance is the ideal state, but most people's charts have elements that are stronger or weaker. The key is finding the balance point that is most beneficial to you.

Quick Quiz

Do you know your Day Master Heavenly Stem? The Day Master is the character in your Bazi chart that represents you. If you know your birth date and time, try our AI destiny tool to instantly generate your Five Element analysis. Click 「Start Reading」 to get your Five Element analysis report.`,
  },

  // ────────────────────────────────────────────────────
  // 2. 日主天干
  // ────────────────────────────────────────────────────
  {
    id: "bazi-daymaster",
    title_zh: "日主天干：你的命格核心密码",
    title_en: "The Day Master: Your Core Destiny Code",
    summary_zh: "日主天干（日元）是八字中最关键的一个字，它代表你自己。甲木人如参天大树，丙火人如太阳般温暖。看看你属于哪种类型？",
    summary_en: "The Day Master (Ri Yuan) is the most crucial character in your Bazi chart — it represents you. Jia Wood people are like towering trees, Bing Fire people shine like the sun. Find out which type you are.",
    category: "bazi",
    tags_zh: ["八字", "日主", "天干"],
    tags_en: ["Bazi", "Day Master", "Heavenly Stems"],
    read_time: 8,
    cover_emoji: "☯",
    created_at: "2025-02-10",
    content_zh: `
## 什么是日主天干？

在四柱八字中，日柱的天干被称为"日主"（也叫"日元"或"命主"），它代表你自己。日主是整个八字命盘的核心，所有其他元素都围绕日主展开分析。

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

通过 AI 推命工具，输入你的出生年月日时，系统会自动计算你的四柱八字，并标注你的日主天干。你还可以看到五行得分、十神关系等详细分析。
    `,
    content_en: `
## What Is the Day Master?

In the Four Pillars of Bazi, the Heavenly Stem of the Day Pillar is called the "Day Master" (also known as "Ri Yuan" or "Ming Zhu"). It represents you. The Day Master is the core of the entire Bazi chart — all other elements are analyzed in relation to it.

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

Use our AI destiny tool — enter your birth date and time, and the system will automatically calculate your Four Pillars and identify your Day Master. You'll also see your Five Element scores, Ten Gods relationships, and more detailed analysis.
    `,
  },

  // ────────────────────────────────────────────────────
  // 3. 八字缺什么
  // ────────────────────────────────────────────────────
  {
    id: "bazi-weakness",
    title_zh: "八字缺什么就一定要补什么吗？",
    title_en: "Must You Supplement Whatever Your Bazi Lacks?",
    summary_zh: "很多人一听「八字缺金」就急着戴金饰。但命理学的逻辑远比「缺啥补啥」复杂。本文解析五行喜忌的正确理解方式。",
    summary_en: "Many people rush to wear gold jewelry when told their Bazi lacks Metal. But destiny analysis is far more nuanced than 'supplement what's missing.' This article explains the correct approach to Five Element favorability.",
    category: "bazi",
    tags_zh: ["八字", "五行", "喜忌"],
    tags_en: ["Bazi", "Five Elements", "Favorability"],
    read_time: 6,
    cover_emoji: "⚖️",
    created_at: "2025-02-20",
    content_zh: `
## 「缺什么补什么」为什么是错的？

这是命理学中最广泛流传的误解。很多人在算命后听到「八字缺金」，就立刻去戴金项链、金戒指，以为这样就能弥补命盘的不足。但事实远没有这么简单。

## 喜用神才是关键

命理学的核心概念是"喜用神"——即你的命盘最需要、最受益的元素。喜用神的判断需要综合考虑日主强弱、格局配置、流年运势等多个因素。

举个例子：
- 一个日主为甲木的人，如果八字中木已经很旺，那他可能喜火（泄秀）或喜金（克制过旺的木）
- 即使他的八字中"缺水"，也不一定要补水——因为水会生木，让已经旺的木更旺

## 什么时候"缺"真的需要补？

只有当缺失的元素恰好是你的喜用神时，才需要补充。这需要专业命理师的判断，或者通过 AI 推命工具进行系统分析。

## 实用建议

1. **不要自行补五行**：盲目补充可能适得其反
2. **了解你的喜用神**：这是最关键的一步
3. **通过多种途径调和**：颜色、方位、职业选择等都可以调和五行
4. **动态看待**：流年运势会改变五行的需求
    `,
    content_en: `
## Why "Supplement What You Lack" Is Wrong

This is the most widespread misconception in destiny analysis. After a reading, many people hear "your Bazi lacks Metal" and immediately rush to wear gold necklaces or rings, thinking this will compensate for their chart's deficiency. But reality is far more complex.

## The Favorable Element Is What Matters

The core concept in destiny analysis is the "Favorable Element" (Xi Yong Shen) — the element your chart most needs and benefits from. Determining the Favorable Element requires considering multiple factors: Day Master strength, chart configuration, annual fortune cycles, and more.

For example:
- A person with a Jia Wood Day Master whose chart already has very strong Wood may favor Fire (to channel the excess) or Metal (to restrain the overabundant Wood)
- Even if their chart "lacks Water," they may not need to supplement it — because Water generates Wood, making already strong Wood even stronger

## When Is "Lacking" Actually a Problem?

Only when the missing element happens to be your Favorable Element does it need to be supplemented. This requires professional judgment from a destiny master, or systematic analysis through an AI destiny tool.

## Practical Advice

1. **Don't supplement elements on your own** — blind supplementation can backfire
2. **Understand your Favorable Element** — this is the most critical step
3. **Use multiple channels for harmony** — colors, directions, career choices can all balance your Five Elements
4. **Think dynamically** — annual fortune cycles change your elemental needs
    `,
  },

  // ────────────────────────────────────────────────────
  // 4. 十神体系
  // ────────────────────────────────────────────────────
  {
    id: "bazi-tengods",
    title_zh: "十神详解：正官、偏财、食神…它们在说什么？",
    title_en: "The Ten Gods Explained: What Do Direct Wealth, Seven Killings & Eating God Really Mean?",
    summary_zh: "十神是八字中描述人际关系和命运走向的核心系统。正官代表约束与责任，偏财代表意外之财。搞懂十神，就读懂了命盘的语言。",
    summary_en: "The Ten Gods system is the core framework in Bazi for describing relationships and destiny patterns. Direct Officer represents discipline, Indirect Wealth represents unexpected gains. Understanding the Ten Gods means speaking the language of your chart.",
    category: "bazi",
    tags_zh: ["八字", "十神", "进阶"],
    tags_en: ["Bazi", "Ten Gods", "Advanced"],
    read_time: 10,
    cover_emoji: "🔑",
    created_at: "2025-03-01",
    content_zh: `
## 什么是十神？

十神是八字命理中用来描述日主与其他天干之间关系的十个名称。它们基于五行生克关系，进一步细分为：生我者、我生者、克我者、我克者、同我者，每类又分阴阳，共十个。

## 十神一览

| 十神 | 五行关系 | 代表含义 |
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

## 如何解读十神？

**看旺衰**：某个十神在命盘中出现的次数和力量，决定了它的影响力。

**看位置**：十神出现在年柱、月柱、日柱还是时柱，代表不同的人生阶段和领域。

**看组合**：十神之间的组合（如食神生财、官印相生）会形成特定的命格格局。

## 举例说明

**食神生财格**：食神代表才华和创造力，财星代表财富。食神生财意味着用才华赚钱，适合从事创意、艺术、餐饮等行业。

**官印相生格**：正官代表权力和地位，正印代表学问和贵人。官印相生意味着因学识而获得权力，适合从政或从事管理。

→ 想了解你的十神格局？试试 AI 推命工具，一键生成完整分析
    `,
    content_en: `
## What Are the Ten Gods?

The Ten Gods are ten designations used in Bazi to describe the relationship between the Day Master and other Heavenly Stems. Based on the Five Element generating and overcoming cycles, they are further divided by Yin-Yang polarity into: those that generate me, those I generate, those that overcome me, those I overcome, and those same as me — five categories, each split into Yin and Yang, totaling ten.

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

**Eating God Generates Wealth pattern**: Eating God represents talent and creativity; Wealth stars represent fortune. This pattern means earning wealth through talent — ideal for creative arts, culinary, or entertainment careers.

**Officer-Resource Mutual Generation pattern**: Direct Officer represents authority; Direct Resource represents learning and benefactors. This pattern means gaining power through knowledge — suited for governance or management roles.

→ Want to see your Ten Gods chart? Try our AI destiny tool for a complete analysis
    `,
  },

  // ────────────────────────────────────────────────────
  // 5. 十二宫位
  // ────────────────────────────────────────────────────
  {
    id: "astrology-houses",
    title_zh: "十二宫位入门：你的星盘地图",
    title_en: "The Twelve Houses: Your Natal Chart Map",
    summary_zh: "星盘的十二宫位就像人生的十二个舞台。太阳落在第十宫的人天生就是事业狂，月亮在第四宫的人最重视家庭。来认识你的星盘地图。",
    summary_en: "The twelve houses of the natal chart are like twelve stages of life. Sun in the 10th House makes you career-driven; Moon in the 4th House values family above all. Discover your chart map.",
    category: "astrology",
    tags_zh: ["星盘", "宫位", "入门"],
    tags_en: ["Natal Chart", "Houses", "Beginner"],
    read_time: 7,
    cover_emoji: "✦",
    created_at: "2025-03-05",
    content_zh: `
## 什么是宫位？

在西方占星学中，星盘被分为十二个宫位，每个宫位代表人生的不同领域。宫位就像十二个舞台，行星在其中上演你的人生剧本。

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

你的出生时间决定了宫位的起始点（上升星座）。每个宫位的起始星座不同，行星落入的宫位也不同，这就形成了你独一无二的星盘地图。

→ 输入出生信息，AI 将为你绘制完整的星盘宫位分析
    `,
    content_en: `
## What Are the Houses?

In Western astrology, the natal chart is divided into twelve houses, each representing a different area of life. Houses are like twelve stages where planets act out your life's script.

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
| 12th House | Subconscious, hidden | Soul lessons, karma, solitude |

## How to Read Your Houses?

Your birth time determines the starting point of the houses (the Ascendant sign). Each house begins with a different zodiac sign, and planets fall into different houses — creating your unique natal chart map.

→ Enter your birth information and AI will generate your complete house analysis
    `,
  },

  // ────────────────────────────────────────────────────
  // 6. 星座相位
  // ────────────────────────────────────────────────────
  {
    id: "astrology-aspects",
    title_zh: "行星相位：合相、对冲、三分相…它们在说什么？",
    title_en: "Planetary Aspects: Conjunctions, Oppositions, Trines & What They Mean",
    summary_zh: "相位是行星之间的角度关系，决定了行星能量如何互动。合相是融合，对冲是张力，三分相是和谐。理解相位，就读懂了星盘的动力系统。",
    summary_en: "Aspects are angular relationships between planets that determine how their energies interact. Conjunctions merge, oppositions create tension, trines flow harmoniously. Understanding aspects unlocks your chart's dynamic engine.",
    category: "astrology",
    tags_zh: ["星盘", "相位", "进阶"],
    tags_en: ["Natal Chart", "Aspects", "Advanced"],
    read_time: 8,
    cover_emoji: "📐",
    created_at: "2025-03-10",
    content_zh: `
## 什么是相位？

相位是星盘中行星之间形成的角度。不同的角度代表不同的能量互动模式。主要相位有五种：

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

→ AI 星盘分析会自动解读你所有的重要相位
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
Two planets support each other with smooth energy flow. This is the easiest aspect, representing natural talent and good fortune.

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
    id: "tarot-major",
    title_zh: "大阿尔卡纳22张牌：灵魂成长的旅程",
    title_en: "The 22 Major Arcana: A Journey of Soul Growth",
    summary_zh: "从「0号愚者」的天真出发，到「21号世界」的圆满，大阿尔卡纳描绘了灵魂成长的完整弧线。每张牌都是你内在的一部分。",
    summary_en: "From the innocent Fool (0) to the complete World (21), the Major Arcana maps the full arc of soul evolution. Each card is a part of your inner self.",
    category: "tarot",
    tags_zh: ["塔罗", "大阿尔卡纳", "灵性"],
    tags_en: ["Tarot", "Major Arcana", "Spiritual"],
    read_time: 10,
    cover_emoji: "🃏",
    created_at: "2025-03-15",
    content_zh: `
## 大阿尔卡纳是什么？

大阿尔卡纳（Major Arcana）是塔罗牌中最重要的22张牌，编号从0到21。它们描绘了灵魂从无知到觉醒的完整旅程——被称为"愚者的旅程"。

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

→ 试试 AI 塔罗占卜，获取你的专属牌阵解读
    `,
    content_en: `
## What Is the Major Arcana?

The Major Arcana is the most important set of 22 cards in the Tarot, numbered 0 through 21. They map the soul's complete journey from ignorance to awakening — known as "The Fool's Journey."

## The 22 Cards at a Glance

### Part 1: Awakening in the Material World (0-7)
- **0 The Fool**: New beginnings, innocence, infinite possibility
- **1 The Magician**: Creativity, willpower, abundant resources
- **2 The High Priestess**: Intuition, inner wisdom, mystery
- **3 The Empress**: Abundance, motherhood, sensual pleasure
- **4 The Emperor**: Authority, structure, stability
- **5 The Hierophant**: Tradition, faith, spiritual guidance
- **6 The Lovers**: Love, choices, harmony
- **7 The Chariot**: Victory, willpower, determination

### Part 2: Exploring Inner Strength (8-14)
- **8 Strength**: Courage, patience, inner power
- **9 The Hermit**: Introspection, solitude, wisdom
- **10 Wheel of Fortune**: Change, destiny, cycles
- **11 Justice**: Fairness, karma, truth
- **12 The Hanged Man**: Sacrifice, new perspective, waiting
- **13 Death**: Endings, transformation, rebirth
- **14 Temperance**: Balance, moderation, patience

### Part 3: Spiritual Transformation (15-21)
- **15 The Devil**: Bondage, desire, materialism
- **16 The Tower**: Upheaval, awakening, breaking old structures
- **17 The Star**: Hope, inspiration, serenity
- **18 The Moon**: Illusion, the subconscious, fear
- **19 The Sun**: Success, joy, vitality
- **20 Judgement**: Awakening, rebirth, calling
- **21 The World**: Completion, fulfillment, new cycles

## How to Use the Major Arcana?

Each card has both upright and reversed interpretations. Upright represents the card's positive expression; reversed indicates blockages or inner lessons. Your intuitive response when drawing cards is often the most accurate guide.

→ Try our AI Tarot Reading for your personalized spread interpretation
    `,
  },

  // ────────────────────────────────────────────────────
  // 8. 面相入门
  // ────────────────────────────────────────────────────
  {
    id: "face-reading-basics",
    title_zh: "面相入门：五官看性格与运势",
    title_en: "Face Reading Basics: How Your Features Reveal Character & Fortune",
    summary_zh: "额头代表早年运，鼻子主管财运，下巴关乎晚年福。学会基础面相，你也能读懂一个人的命运轨迹。",
    summary_en: "The forehead reveals early fortune, the nose rules wealth luck, and the chin governs later-life blessings. Learn basic face reading and you too can decode someone's destiny path.",
    category: "face",
    tags_zh: ["面相", "五官", "入门"],
    tags_en: ["Face Reading", "Features", "Beginner"],
    read_time: 6,
    cover_emoji: "👁",
    created_at: "2025-04-01",
    content_zh: `
## 面相学基础

面相学（观相术）通过观察人的面部特征来推断性格和运势。中国传统面相学将面部分为多个宫位，每个宫位对应不同的人生领域。

## 五官与运势

### 额头 — 早年运（15-30岁）
额头饱满、宽阔、光滑的人，早年运势顺遂，学业有成。额头窄小或有纹路的人，少年时期可能较为辛苦。

### 眉毛 — 情志与兄弟
眉毛浓密有形的人，感情丰富、兄弟助力大。眉毛稀疏或断裂的人，人际交往需多注意。

### 眼睛 — 心性与智慧
眼睛是面相中最重要的部位。眼神清亮有神的人，心性善良、智慧过人。眼神浑浊或飘忽的人，内心可能较为迷茫。

### 鼻子 — 财运与事业（40-50岁）
鼻梁高挺、准头圆润的人，财运亨通、事业有成。鼻子扁平或有节的人，中年财运需注意理财。

### 嘴巴 — 食禄与言辞
嘴唇饱满、口角上扬的人，口福好、善于表达。嘴唇薄或下垂的人，说话需注意分寸。

### 下巴 — 晚年运（60岁以后）
下巴圆润、地阁丰满的人，晚年安乐、子孙孝顺。下巴尖削的人，晚年需提前规划。

## AI 面相分析

传统面相需要多年经验积累，而 AI 面相分析通过 468 个面部特征点的精确提取，可以快速、客观地给出面相解读。

→ 上传照片，获取你的 AI 面相分析报告
    `,
    content_en: `
## Fundamentals of Face Reading

Face reading (physiognomy) infers character and fortune by observing facial features. Traditional Chinese face reading divides the face into multiple palaces, each corresponding to different life domains.

## The Five Features and Fortune

### Forehead — Early Fortune (Ages 15-30)
A full, broad, smooth forehead indicates smooth early years and academic success. A narrow or lined forehead may suggest a more challenging youth.

### Eyebrows — Emotions & Brotherhood
Thick, well-shaped eyebrows indicate rich emotions and strong sibling support. Sparse or broken eyebrows suggest paying extra attention to interpersonal relationships.

### Eyes — Character & Wisdom
The eyes are the most important feature in face reading. Clear, bright, spirited eyes indicate a kind heart and sharp intellect. Dull or wandering eyes may suggest inner confusion.

### Nose — Wealth & Career (Ages 40-50)
A high-bridged nose with a rounded tip indicates abundant wealth luck and career success. A flat or knotted nose suggests paying attention to financial management in middle age.

### Mouth — Sustenance & Speech
Full, upturned lips indicate good fortune in food and drink and strong communication skills. Thin or downturned lips suggest being mindful of what you say.

### Chin — Later Fortune (After Age 60)
A rounded, full chin indicates a comfortable later life with filial children. A pointed chin suggests planning ahead for later years.

## AI Face Reading Analysis

Traditional face reading requires years of experience, while AI face reading precisely extracts 468 facial feature points to deliver a quick, objective interpretation.

→ Upload your photo for an AI face reading report
    `,
  },

  // ────────────────────────────────────────────────────
  // 9. 手相生命线
  // ────────────────────────────────────────────────────
  {
    id: "palm-life-line",
    title_zh: "手相生命线：不只是看寿命那么简单",
    title_en: "The Life Line in Palmistry: It's Not Just About Lifespan",
    summary_zh: "生命线其实代表的是生命力和健康状态，而非寿命长短。弧度大的人行动力强，断续的线可能暗示健康需要注意。",
    summary_en: "The life line actually represents vitality and health — not lifespan. A wide arc indicates strong drive; a broken line may suggest health awareness is needed.",
    category: "face",
    tags_zh: ["手相", "生命线", "健康"],
    tags_en: ["Palmistry", "Life Line", "Health"],
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

除了生命线，手相中还有两条重要主线：

- **智慧线**：代表思维方式和智力特点
- **感情线**：代表情感表达和恋爱模式

三条线的配合分析，才能全面了解一个人的性格和命运。

→ 上传手相照片，AI 将为你详细解读三大主线
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

Beyond the life line, palmistry has two other important lines:

- **Head Line**: Represents thinking style and intellectual traits
- **Heart Line**: Represents emotional expression and love patterns

Only by analyzing all three lines together can you fully understand a person's character and destiny.

→ Upload a palm photo for AI analysis of your three major lines
    `,
  },

  // ────────────────────────────────────────────────────
  // 10. 水晶改运指南
  // ────────────────────────────────────────────────────
  {
    id: "crystal-guide",
    title_zh: "水晶改运指南：不同水晶对应的五行能量",
    title_en: "Crystal Fortune Guide: Five Element Energy of Each Crystal",
    summary_zh: "黄水晶招财、粉水晶招桃花、紫水晶增强直觉…每种水晶都对应不同的五行属性和脉轮。选对水晶，改运效果翻倍。",
    summary_en: "Citrine attracts wealth, Rose Quartz draws love, Amethyst enhances intuition — each crystal corresponds to specific Five Elements and chakras. Choose the right crystal to double your fortune effects.",
    category: "lifestyle",
    tags_zh: ["水晶", "改运", "五行"],
    tags_en: ["Crystals", "Fortune", "Five Elements"],
    read_time: 5,
    cover_emoji: "💎",
    created_at: "2025-04-10",
    content_zh: `
## 水晶与五行

每种天然水晶都带有特定的五行属性，可以用来补充或调和你命盘中的五行能量。

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
- **琥珀**：安神、疗愈

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

## 招桃花特别推荐

- **粉水晶**：温和招桃花，增强人缘
- **草莓晶**：激发爱情能量，促进姻缘
- **红纹石**：增进感情，修复关系

→ 查看你的命盘弱点，AI 将推荐最适合你的水晶
    `,
    content_en: `
## Crystals and the Five Elements

Every natural crystal carries a specific Five Element attribute, which can be used to supplement or harmonize the elemental energy in your destiny chart.

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
- **Amber**: Calming, healing

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
  // 11. 办公桌风水
  // ────────────────────────────────────────────────────
  {
    id: "fengshui-desk",
    title_zh: "办公桌风水布局：提升事业运的小技巧",
    title_en: "Desk Feng Shui: Small Tweaks to Boost Your Career Luck",
    summary_zh: "桌面左侧放绿植旺贵人运，右侧放水晶球增决策力，背后有靠山…简单的办公桌调整就能改善你的事业能量场。",
    summary_en: "Place green plants on the left for benefactor luck, a crystal sphere on the right for decision-making, and ensure support behind you — simple desk adjustments can transform your career energy field.",
    category: "lifestyle",
    tags_zh: ["风水", "事业", "办公"],
    tags_en: ["Feng Shui", "Career", "Office"],
    read_time: 4,
    cover_emoji: "🏢",
    created_at: "2025-05-01",
    content_zh: `
## 为什么办公桌风水很重要？

你每天在办公桌前度过至少8小时，桌面的布局直接影响你的工作效率、人际关系和事业运势。好的办公桌风水能让你事半功倍。

## 五大关键布局

### 1. 背后有靠山
办公椅背后要有实墙或高柜，代表有靠山。背后无靠容易感到不安全，事业上缺少支持。

### 2. 左高右低（左青龙右白虎）
桌面左侧放较高的物品（如文件架、绿植），右侧放较低的物品。左高右低符合"青龙高于白虎"的风水原则，有利于事业和贵人运。

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

→ 查看你的五行喜忌，获取专属风水建议
    `,
    content_en: `
## Why Does Desk Feng Shui Matter?

You spend at least 8 hours a day at your desk. Its layout directly affects your work efficiency, relationships, and career fortune. Good desk Feng Shui helps you accomplish more with less effort.

## Five Key Layout Principles

### 1. Have a Solid Backing
Your chair should face a solid wall or tall cabinet, representing a "mountain" of support. Sitting with no backing behind you can create insecurity and lack of career support.

### 2. High on the Left, Low on the Right (Azure Dragon > White Tiger)
Place taller items on the left side of your desk (file organizers, plants) and shorter items on the right. This follows the Feng Shui principle of "the Azure Dragon should be higher than the White Tiger," benefiting career and benefactor luck.

### 3. Keep the Front Open
Keep the space in front of your desk clear of clutter. An open "bright hall" represents a bright future and clear thinking.

### 4. Add Green Plants
Place a green plant on the left side of your desk (like pothos or lucky bamboo) to boost benefactor and career luck. Avoid thorny plants (like cacti).

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
    id: "astrology-elements",
    title_zh: "火土风水：星座四元素的深层解读",
    title_en: "Fire, Earth, Air, Water: The Deeper Meaning of Zodiac Elements",
    summary_zh: "每个星座都归属一个元素：火象热情奔放，土象务实稳重，风象灵活多变，水象敏感细腻。了解元素，就掌握了星座的核心密码。",
    summary_en: "Every zodiac sign belongs to an element: Fire signs are passionate, Earth signs are grounded, Air signs are adaptable, Water signs are sensitive. Understanding elements unlocks the core code of astrology.",
    category: "astrology",
    tags_zh: ["星座", "元素", "入门"],
    tags_en: ["Zodiac", "Elements", "Beginner"],
    read_time: 5,
    cover_emoji: "🔥",
    created_at: "2025-04-15",
    content_zh: `
## 星座与四元素

西方占星学将十二星座分为四组，每组对应一个元素。元素决定了星座的基本性质和行为模式。

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
**事业方向**：心理、医疗、艺术、疗愈

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
## Zodiac Signs and the Four Elements

Western astrology divides the twelve zodiac signs into four groups, each associated with an element. Elements determine the fundamental nature and behavioral patterns of each sign.

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
**Career paths**: Psychology, healthcare, arts, healing

## Elements and the Five Elements Connection

Interestingly, the four Western elements have subtle correspondences with the Chinese Five Elements:
- Fire signs ≈ Fire
- Earth signs ≈ Earth
- Air signs ≈ Wood (growth, circulation)
- Water signs ≈ Water
- Metal has no direct counterpart in the Western system

→ Our AI 5-Dimension Analysis combines zodiac elements with Five Elements for more precise readings
    `,
  },
]
