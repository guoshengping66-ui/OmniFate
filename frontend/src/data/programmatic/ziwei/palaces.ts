export interface ZiweiPalace {
  id: string
  name_en: string
  name_zh: string
  emoji: string

  // SEO Fields
  title_en: string
  title_zh: string
  meta_description_en: string
  meta_description_zh: string
  keywords_en: string[]
  keywords_zh: string[]

  // Content Sections
  overview_en: string
  overview_zh: string
  personality_en: string
  personality_zh: string
  career_en: string
  career_zh: string
  relationships_en: string
  relationships_zh: string
  fortune_en: string
  fortune_zh: string

  // FAQ
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>

  // Internal Linking
  related_palaces: string[]

  // Canonical
  canonical_path: string
}

export const ZiweiPalaces: ZiweiPalace[] = [
  {
    id: "ming",
    name_en: "Life Palace (Ming Gong)",
    name_zh: "命宫",
    emoji: "🌟",

    title_en: "Life Palace (Ming Gong) Meaning | Ziwei Doushu Guide",
    title_zh: "命宫含义 | 紫微斗数完整指南",
    meta_description_en: "Discover the Life Palace (Ming Gong) in Ziwei Doushu astrology. Learn what the Life Palace reveals about personality, destiny, and life path in Chinese Purple Star Astrology.",
    meta_description_zh: "探索紫微斗数中的命宫。了解命宫揭示的性格、命运和人生道路特征。",
    keywords_en: ["life palace ming gong", "ziwei doushu life palace", "ming gong meaning", "ziwei personality palace", "life path ziwei"],
    keywords_zh: ["命宫紫微斗数", "紫微斗数命宫", "命宫含义", "紫微性格宫", "人生道路紫微"],

    overview_en: "The Life Palace (Ming Gong) is the most important palace in Ziwei Doushu. It represents the core self, personality, and overall destiny. The stars in this palace define the fundamental nature and life trajectory of the individual.",
    overview_zh: "命宫是紫微斗数中最重要的宫位。它代表核心自我、性格和整体命运。此宫中的星辰定义了个人的基本性质和人生轨迹。",
    personality_en: "The Life Palace defines the core personality traits, natural tendencies, and fundamental character. It reveals how a person approaches life, their basic temperament, and their innate strengths and weaknesses.",
    personality_zh: "命宫定义核心性格特征、自然倾向和基本品格。它揭示一个人如何面对生活、基本气质以及天生的优势和劣势。",
    career_en: "The Life Palace indicates the overall career potential and life direction. Stars in this palace suggest the types of roles and environments where the individual will naturally thrive.",
    career_zh: "命宫表示整体事业潜力和人生方向。此宫中的星辰暗示个人自然茁壮成长的角色和环境类型。",
    relationships_en: "The Life Palace influences how a person approaches relationships, their basic relational style, and what they seek in partnerships. It forms the foundation for understanding relationship dynamics.",
    relationships_zh: "命宫影响一个人如何处理关系、基本的关系风格以及在伴侣关系中寻求什么。它构成了理解关系动态的基础。",
    fortune_en: "The Life Palace is the primary indicator of overall fortune and life path. A well-placed Life Palace with auspicious stars suggests a fortunate life with natural advantages and opportunities.",
    fortune_zh: "命宫是整体运势和人生道路的主要指标。位置良好、有吉星的命宫表示一生幸运，有天然优势和机会。",

    faq_en: [
      { question: "What is the Life Palace in Ziwei Doushu?", answer: "The Life Palace (Ming Gong) is the most important palace in Ziwei Doushu. It represents the core self, personality, and overall destiny. Stars in this palace define the fundamental nature and life trajectory." },
      { question: "How does the Life Palace affect personality?", answer: "The Life Palace defines core personality traits, natural tendencies, and fundamental character. It reveals how a person approaches life, their basic temperament, and innate strengths and weaknesses." },
      { question: "What does the Life Palace indicate about career?", answer: "The Life Palace indicates overall career potential and life direction. Stars in this palace suggest the types of roles and environments where the individual will naturally thrive." },
      { question: "How is the Life Palace calculated?", answer: "The Life Palace is calculated based on the birth month and birth hour using the Chinese lunar calendar. Its position in the chart is determined by these two factors." }
    ],
    faq_zh: [
      { question: "什么是紫微斗数中的命宫？", answer: "命宫是紫微斗数中最重要的宫位。它代表核心自我、性格和整体命运。此宫中的星辰定义了基本性质和人生轨迹。" },
      { question: "命宫如何影响性格？", answer: "命宫定义核心性格特征、自然倾向和基本品格。它揭示一个人如何面对生活、基本气质以及天生的优势和劣势。" },
      { question: "命宫对事业有什么暗示？", answer: "命宫表示整体事业潜力和人生方向。此宫中的星辰暗示个人自然茁壮成长的角色和环境类型。" },
      { question: "命宫是如何计算的？", answer: "命宫是根据农历的出生月份和出生时辰计算的。它在命盘中的位置由这两个因素决定。" }
    ],

    related_palaces: ["shen-fen", "cai-bo", "guan-lu"],

    canonical_path: "/ziwei/palaces/ming"
  },
  {
    id: "shen-fen",
    name_en: "Identity Palace (Shen Fen Gong)",
    name_zh: "身宫",
    emoji: "🪞",

    title_en: "Identity Palace (Shen Fen Gong) Meaning | Ziwei Doushu Guide",
    title_zh: "身宫含义 | 紫微斗数完整指南",
    meta_description_en: "Discover the Identity Palace (Shen Fen Gong) in Ziwei Doushu astrology. Learn what the Identity Palace reveals about later life direction and self-development in Chinese Purple Star Astrology.",
    meta_description_zh: "探索紫微斗数中的身宫。了解身宫揭示的后半生方向和自我发展特征。",
    keywords_en: ["identity palace shen fen", "ziwei doushu identity palace", "shen fen gong meaning", "later life ziwei", "self development ziwei"],
    keywords_zh: ["身宫紫微斗数", "紫微斗数身宫", "身宫含义", "后半生紫微", "自我发展紫微"],

    overview_en: "The Identity Palace (Shen Fen Gong) represents the self after middle age, personal development, and the direction of later life. It shows how a person evolves and what they become through life experience and personal growth.",
    overview_zh: "身宫代表中年后的自我、个人发展和后半生方向。它显示一个人如何通过生活经验和自我成长而演变和成为什么样的人。",
    personality_en: "The Identity Palace reveals the evolved self — who a person becomes through life experience. It shows personal growth patterns, areas of development, and the direction of self-improvement.",
    personality_zh: "身宫揭示了演变后的自我——一个人通过生活经验成为什么样的人。它显示个人成长模式、发展领域和自我提升的方向。",
    career_en: "The Identity Palace indicates career direction in later life, second career possibilities, and areas where personal development leads to professional growth.",
    career_zh: "身宫表示后半生的职业方向、第二职业可能性以及个人发展带来职业成长的领域。",
    relationships_en: "The Identity Palace shows how relationship patterns evolve over time, what a person seeks in later partnerships, and how they grow through relationship experiences.",
    relationships_zh: "身宫显示关系模式如何随时间演变、一个人在后半段关系中寻求什么以及他们如何通过关系经验成长。",
    fortune_en: "The Identity Palace indicates fortune in later life, personal development opportunities, and the rewards of accumulated life experience and wisdom.",
    fortune_zh: "身宫表示后半生的运势、个人发展机会以及积累生活经验和智慧的回报。",

    faq_en: [
      { question: "What is the Identity Palace in Ziwei Doushu?", answer: "The Identity Palace (Shen Fen Gong) represents the self after middle age, personal development, and later life direction. It shows how a person evolves through life experience and growth." },
      { question: "How does the Identity Palace differ from the Life Palace?", answer: "The Life Palace represents the core self from birth, while the Identity Palace represents the evolved self through life experience. Life Palace is innate; Identity Palace is developed." },
      { question: "What does the Identity Palace indicate about later life?", answer: "The Identity Palace indicates career direction in later life, personal development opportunities, and the rewards of accumulated wisdom and experience." },
      { question: "How is the Identity Palace calculated?", answer: "The Identity Palace is calculated based on the birth month and birth hour, similar to the Life Palace but in a different position. It represents the self that develops over time." }
    ],
    faq_zh: [
      { question: "什么是紫微斗数中的身宫？", answer: "身宫代表中年后的自我、个人发展和后半生方向。它显示一个人如何通过生活经验和成长而演变。" },
      { question: "身宫与命宫有什么区别？", answer: "命宫代表从出生开始的核心自我，而身宫代表通过生活经验演变后的自我。命宫是天生的；身宫是发展的。" },
      { question: "身宫对后半生有什么暗示？", answer: "身宫表示后半生的职业方向、个人发展机会以及积累智慧和经验的回报。" },
      { question: "身宫是如何计算的？", answer: "身宫是根据农历的出生月份和出生时辰计算的，类似于命宫但位置不同。它代表随时间发展的自我。" }
    ],

    related_palaces: ["ming", "fu-de", "tian-zhai"],

    canonical_path: "/ziwei/palaces/shen-fen"
  },
  {
    id: "cai-bo",
    name_en: "Wealth Palace (Cai Bo Gong)",
    name_zh: "财帛宫",
    emoji: "💰",

    title_en: "Wealth Palace (Cai Bo Gong) Meaning | Ziwei Doushu Guide",
    title_zh: "财帛宫含义 | 紫微斗数完整指南",
    meta_description_en: "Discover the Wealth Palace (Cai Bo Gong) in Ziwei Doushu astrology. Learn what the Wealth Palace reveals about financial fortune, money management, and earning potential.",
    meta_description_zh: "探索紫微斗数中的财帛宫。了解财帛宫揭示的财运、金钱管理和收入潜力特征。",
    keywords_en: ["wealth palace cai bo", "ziwei doushu wealth palace", "cai bo gong meaning", "financial fortune ziwei", "money management ziwei"],
    keywords_zh: ["财帛宫紫微斗数", "紫微斗数财帛宫", "财帛宫含义", "财运紫微", "金钱管理紫微"],

    overview_en: "The Wealth Palace (Cai Bo Gong) represents financial fortune, money management, and earning potential. It governs how a person acquires, manages, and spends wealth throughout their life.",
    overview_zh: "财帛宫代表财运、金钱管理和收入潜力。它掌管一个人一生中如何获取、管理和花费财富。",
    personality_en: "The Wealth Palace reveals a person's attitude toward money, their financial habits, and their natural approach to wealth creation. It shows whether they are savers or spenders, risk-takers or conservatives.",
    personality_zh: "财帛宫揭示一个人对金钱的态度、财务习惯和创造财富的自然方式。它显示他们是储蓄者还是消费者，冒险者还是保守者。",
    career_en: "The Wealth Palace indicates earning potential, financial success in career, and the types of work that bring the greatest financial rewards.",
    career_zh: "财帛宫表示收入潜力、事业中的财务成功以及带来最大财务回报的工作类型。",
    relationships_en: "The Wealth Palace can indicate financial dynamics within relationships, including how money is managed between partners and the financial aspects of partnerships.",
    relationships_zh: "财帛宫可以表示关系中的财务动态，包括伴侣之间如何管理金钱以及伙伴关系的财务方面。",
    fortune_en: "The Wealth Palace is the primary indicator of financial fortune. Auspicious stars in this palace indicate strong earning potential, good money management, and financial security.",
    fortune_zh: "财帛宫是财运的主要指标。此宫中的吉星表示强大的收入潜力、良好的资金管理和财务安全。",

    faq_en: [
      { question: "What is the Wealth Palace in Ziwei Doushu?", answer: "The Wealth Palace (Cai Bo Gong) represents financial fortune, money management, and earning potential. It governs how a person acquires, manages, and spends wealth throughout life." },
      { question: "How does the Wealth Palace affect finances?", answer: "The Wealth Palace indicates earning potential, financial habits, and the types of work that bring the greatest financial rewards. It's the primary indicator of financial fortune." },
      { question: "What stars are good in the Wealth Palace?", answer: "Auspicious stars like WUQU, TIANFU, and TAIYANG in the Wealth Palace indicate strong earning potential and good financial fortune. The specific interpretation depends on the overall chart." },
      { question: "Can the Wealth Palace change over time?", answer: "While the natal Wealth Palace remains fixed, annual and decadal chart movements can activate different aspects of financial fortune, creating periods of greater or lesser financial opportunity." }
    ],
    faq_zh: [
      { question: "什么是紫微斗数中的财帛宫？", answer: "财帛宫代表财运、金钱管理和收入潜力。它掌管一个人一生中如何获取、管理和花费财富。" },
      { question: "财帛宫如何影响财务？", answer: "财帛宫表示收入潜力、财务习惯以及带来最大财务回报的工作类型。它是财运的主要指标。" },
      { question: "财帛宫中哪些星是好的？", answer: "财帛宫中的吉星如武曲、天府和太阳表示强大的收入潜力和良好的财运。具体解读取决于整体命盘。" },
      { question: "财帛宫会随时间变化吗？", answer: "虽然本命财帛宫保持固定，但大运和流年命盘的移动可以激活财务运势的不同方面，创造财务机会较多或较少的时期。" }
    ],

    related_palaces: ["ming", "guan-lu", "tian-zhai"],

    canonical_path: "/ziwei/palaces/cai-bo"
  },
  {
    id: "guan-lu",
    name_en: "Career Palace (Guan Lu Gong)",
    name_zh: "官禄宫",
    emoji: "💼",

    title_en: "Career Palace (Guan Lu Gong) Meaning | Ziwei Doushu Guide",
    title_zh: "官禄宫含义 | 紫微斗数完整指南",
    meta_description_en: "Discover the Career Palace (Guan Lu Gong) in Ziwei Doushu astrology. Learn what the Career Palace reveals about career path, professional success, and work environment.",
    meta_description_zh: "探索紫微斗数中的官禄宫。了解官禄宫揭示的职业道路、事业成功和工作环境特征。",
    keywords_en: ["career palace guan lu", "ziwei doushu career palace", "guan lu gong meaning", "professional success ziwei", "work environment ziwei"],
    keywords_zh: ["官禄宫紫微斗数", "紫微斗数官禄宫", "官禄宫含义", "事业成功紫微", "工作环境紫微"],

    overview_en: "The Career Palace (Guan Lu Gong) represents career path, professional success, and work environment. It governs the type of work a person is suited for, their career trajectory, and their relationship with authority and colleagues.",
    overview_zh: "官禄宫代表职业道路、事业成功和工作环境。它掌管一个人适合的工作类型、职业轨迹以及与权威和同事的关系。",
    personality_en: "The Career Palace reveals a person's professional nature, work style, and the environments where they thrive. It shows whether they prefer leadership roles, team collaboration, or independent work.",
    personality_zh: "官禄宫揭示一个人的职业本质、工作风格以及他们茁壮成长的环境。他们显示是偏好领导角色、团队合作还是独立工作。",
    career_en: "The Career Palace is the primary indicator of career success, professional achievements, and the types of roles and industries where a person will excel.",
    career_zh: "官禄宫是事业成功、专业成就以及一个人将表现出色的角色和行业类型的主要指标。",
    relationships_en: "The Career Palace can indicate workplace relationships, including dynamics with colleagues, supervisors, and subordinates. It also shows how a person balances work and personal life.",
    relationships_zh: "官禄宫可以表示工作场所关系，包括与同事、上司和下属的动态。它还显示一个人如何平衡工作和个人生活。",
    fortune_en: "The Career Palace indicates professional fortune, opportunities for advancement, and the potential for achieving career goals and recognition.",
    fortune_zh: "官禄宫表示职业运势、晋升机会以及实现职业目标和获得认可的潜力。",

    faq_en: [
      { question: "What is the Career Palace in Ziwei Doushu?", answer: "The Career Palace (Guan Lu Gong) represents career path, professional success, and work environment. It governs the type of work suited for, career trajectory, and relationship with authority." },
      { question: "How does the Career Palace affect career success?", answer: "The Career Palace is the primary indicator of career success, professional achievements, and the types of roles and industries where a person will excel." },
      { question: "What stars indicate career success?", answer: "Stars like ZIWEI, WUQU, and TIANFU in the Career Palace indicate strong career potential. The specific interpretation depends on the star combinations and overall chart." },
      { question: "Can the Career Palace indicate career changes?", answer: "Yes, annual and decadal chart movements affecting the Career Palace can indicate periods of career change, promotion, or new professional opportunities." }
    ],
    faq_zh: [
      { question: "什么是紫微斗数中的官禄宫？", answer: "官禄宫代表职业道路、事业成功和工作环境。它掌管适合的工作类型、职业轨迹以及与权威的关系。" },
      { question: "官禄宫如何影响事业成功？", answer: "官禄宫是事业成功、专业成就以及一个人将表现出色的角色和行业类型的主要指标。" },
      { question: "哪些星表示事业成功？", answer: "官禄宫中的紫微、武曲和天府等星表示强大的事业潜力。具体解读取决于星曜组合和整体命盘。" },
      { question: "官禄宫能表示职业变化吗？", answer: "是的，影响官禄宫的大运和流年命盘移动可以表示职业变化、晋升或新职业机会的时期。" }
    ],

    related_palaces: ["ming", "cai-bo", "qian-yi"],

    canonical_path: "/ziwei/palaces/guan-lu"
  },
  {
    id: "fu-de",
    name_en: "Fortune Palace (Fu De Gong)",
    name_zh: "福德宫",
    emoji: "🎯",

    title_en: "Fortune Palace (Fu De Gong) Meaning | Ziwei Doushu Guide",
    title_zh: "福德宫含义 | 紫微斗数完整指南",
    meta_description_en: "Discover the Fortune Palace (Fu De Gong) in Ziwei Doushu astrology. Learn what the Fortune Palace reveals about spiritual fortune, inner happiness, and life satisfaction.",
    meta_description_zh: "探索紫微斗数中的福德宫。了解福德宫揭示的精神运势、内心幸福和生活满意度特征。",
    keywords_en: ["fortune palace fu de", "ziwei doushu fortune palace", "fu de gong meaning", "spiritual fortune ziwei", "inner happiness ziwei"],
    keywords_zh: ["福德宫紫微斗数", "紫微斗数福德宫", "福德宫含义", "精神运势紫微", "内心幸福紫微"],

    overview_en: "The Fortune Palace (Fu De Gong) represents spiritual fortune, inner happiness, and life satisfaction. It governs a person's mental state, emotional well-being, and the quality of their inner life.",
    overview_zh: "福德宫代表精神运势、内心幸福和生活满意度。它掌管一个人的精神状态、情感健康和内心生活的质量。",
    personality_en: "The Fortune Palace reveals a person's inner world, emotional nature, and sources of happiness. It shows whether they find joy in material pursuits, spiritual practices, relationships, or creative expression.",
    personality_zh: "福德宫揭示一个人的内心世界、情感本质和快乐来源。它显示他们是在物质追求、灵性实践、关系还是创造性表达中找到快乐。",
    career_en: "The Fortune Palace can indicate job satisfaction, the types of work that bring fulfillment, and the balance between career success and personal happiness.",
    career_zh: "福德宫可以表示工作满意度、带来满足感的工作类型以及事业成功与个人幸福之间的平衡。",
    relationships_en: "The Fortune Palace shows the emotional quality of relationships, the ability to find happiness in partnerships, and the spiritual connection between partners.",
    relationships_zh: "福德宫显示关系的情感质量、在伴侣关系中找到幸福的能力以及伴侣之间的精神联系。",
    fortune_en: "The Fortune Palace indicates spiritual fortune, inner peace, and overall life satisfaction. A well-placed Fortune Palace suggests a happy, fulfilled life regardless of material circumstances.",
    fortune_zh: "福德宫表示精神运势、内心平静和整体生活满意度。位置良好的福德宫表示无论物质环境如何，都能过上幸福、满足的生活。",

    faq_en: [
      { question: "What is the Fortune Palace in Ziwei Doushu?", answer: "The Fortune Palace (Fu De Gong) represents spiritual fortune, inner happiness, and life satisfaction. It governs mental state, emotional well-being, and the quality of inner life." },
      { question: "How does the Fortune Palace affect happiness?", answer: "The Fortune Palace reveals sources of happiness, emotional nature, and the ability to find joy. A well-placed Fortune Palace suggests inner peace and life satisfaction." },
      { question: "What stars indicate good fortune?", answer: "Auspicious stars like TIANFU, TIANXIANG, and TAIYIN in the Fortune Palace indicate spiritual fortune and inner happiness. The interpretation depends on star combinations." },
      { question: "How is the Fortune Palace different from the Wealth Palace?", answer: "The Wealth Palace governs material fortune and financial success, while the Fortune Palace governs spiritual fortune and inner happiness. A person can be wealthy but unhappy, or modest but deeply fulfilled." }
    ],
    faq_zh: [
      { question: "什么是紫微斗数中的福德宫？", answer: "福德宫代表精神运势、内心幸福和生活满意度。它掌管精神状态、情感健康和内心生活的质量。" },
      { question: "福德宫如何影响幸福？", answer: "福德宫揭示快乐来源、情感本质和找到快乐的能力。位置良好的福德宫表示内心平静和生活满意度。" },
      { question: "哪些星表示好运？", answer: "福德宫中的天府、天相和太阴等星表示精神运势和内心幸福。解读取决于星曜组合。" },
      { question: "福德宫与财帛宫有什么区别？", answer: "财帛宫掌管物质运势和财务成功，而福德宫掌管精神运势和内心幸福。一个人可以富有但不快乐，也可以清贫但深感满足。" }
    ],

    related_palaces: ["ming", "tian-zhai", "qi-po"],

    canonical_path: "/ziwei/palaces/fu-de"
  }
]

export const ZiweiPalaceMap: Record<string, ZiweiPalace> = Object.fromEntries(
  ZiweiPalaces.map(palace => [palace.id, palace])
)
