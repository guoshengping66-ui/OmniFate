export interface ZiweiStar {
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
  related_stars: string[]

  // Canonical
  canonical_path: string
}

export const ZiweiStars: ZiweiStar[] = [
  {
    id: "ziwei",
    name_en: "Ziwei (Emperor Star)",
    name_zh: "紫微星",
    emoji: "👑",

    title_en: "Ziwei Star (Emperor Star) Meaning | Ziwei Doushu Guide",
    title_zh: "紫微星（帝王星）含义 | 紫微斗数完整指南",
    meta_description_en: "Discover the Ziwei Star (Emperor Star) in Ziwei Doushu astrology. Learn what Ziwei reveals about leadership, authority, and destiny in Chinese Purple Star Astrology.",
    meta_description_zh: "探索紫微斗数中的紫微星（帝王星）。了解紫微揭示的领导力、权威和命运特征。",
    keywords_en: ["ziwei star meaning", "emperor star ziwei doushu", "purple star astrology ziwei", "ziwei star personality", "ziwei doushu leadership"],
    keywords_zh: ["紫微星含义", "帝王星紫微斗数", "紫微星性格", "紫微斗数紫微", "紫微斗数领导力"],

    overview_en: "Ziwei (紫微) is the Emperor Star and the ruler of all stars in Ziwei Doushu. It represents leadership, authority, and the central governing force in one's destiny. People with Ziwei in their Life Palace are often destined for positions of power and influence.",
    overview_zh: "紫微是帝王星，是紫微斗数中所有星辰的主宰。它代表领导力、权威和命运中的核心统治力量。命宫有紫微的人通常注定会拥有权力和影响力。",
    personality_en: "People with Ziwei star influence are typically authoritative, dignified, and natural leaders. They have a commanding presence, high self-esteem, and a natural ability to organize and lead others.",
    personality_zh: "紫微星影响的人通常有权威、有尊严、是天生的领导者。他们有威严的气质、高度的自尊，有组织和领导他人的天赋。",
    career_en: "Ziwei individuals excel in leadership positions, government, management, and executive roles. Their natural authority and organizational skills make them effective in positions of power and responsibility.",
    career_zh: "紫微人在领导岗位、政府、管理和执行职位方面表现出色。他们天生的权威和组织能力使他们在权力和责任职位中非常有效。",
    relationships_en: "In relationships, Ziwei individuals are protective, generous, and expect respect. They need partners who appreciate their status and can match their dignity, while also providing emotional warmth.",
    relationships_zh: "在感情关系中，紫微人有保护性、慷慨、期望被尊重。他们需要欣赏他们地位、能匹配他们尊严的伴侣，同时提供情感温暖。",
    fortune_en: "Ziwei star brings good fortune, especially in career and social status. When well-placed in the chart, it indicates success through leadership, recognition from authority figures, and a life of significance.",
    fortune_zh: "紫微星带来好运，特别是在事业和社会地位方面。当在命盘中位置良好时，它表示通过领导力获得成功、得到权威人士的认可和有意义的人生。",

    faq_en: [
      { question: "What is the Ziwei Star in Ziwei Doushu?", answer: "Ziwei (紫微) is the Emperor Star and ruler of all stars in Ziwei Doushu. It represents leadership, authority, and the central governing force in one's destiny. It's the most important star in the system." },
      { question: "What does Ziwei star indicate about personality?", answer: "Ziwei star influence indicates an authoritative, dignified personality with natural leadership abilities. These individuals have commanding presence and excel in positions of power and responsibility." },
      { question: "What careers suit Ziwei star people?", answer: "Ziwei individuals excel in leadership positions, government, management, and executive roles. Their natural authority and organizational skills make them effective in positions of power." },
      { question: "How does Ziwei star affect fortune?", answer: "Ziwei star brings good fortune, especially in career and social status. When well-placed, it indicates success through leadership, recognition from authority figures, and a life of significance." }
    ],
    faq_zh: [
      { question: "什么是紫微斗数中的紫微星？", answer: "紫微是帝王星，是紫微斗数中所有星辰的主宰。它代表领导力、权威和命运中的核心统治力量。它是该系统中最重要的星。" },
      { question: "紫微星对性格有什么暗示？", answer: "紫微星影响表示有权威、有尊严的性格，有天生的领导能力。这些人有威严的气质，在权力和责任职位中表现出色。" },
      { question: "紫微星人适合什么职业？", answer: "紫微人在领导岗位、政府、管理和执行职位方面表现出色。他们天生的权威和组织能力使他们在权力职位中非常有效。" },
      { question: "紫微星如何影响运势？", answer: "紫微星带来好运，特别是在事业和社会地位方面。当位置良好时，它表示通过领导力获得成功、得到权威人士的认可和有意义的人生。" }
    ],

    related_stars: ["tianji", "tianfu", "wuqu"],

    canonical_path: "/ziwei/stars/ziwei"
  },
  {
    id: "tianji",
    name_en: "Tianji (Heavenly Secret Star)",
    name_zh: "天机星",
    emoji: "🧠",

    title_en: "Tianji Star (Heavenly Secret) Meaning | Ziwei Doushu Guide",
    title_zh: "天机星含义 | 紫微斗数完整指南",
    meta_description_en: "Discover the Tianji Star in Ziwei Doushu astrology. Learn what Tianji reveals about intelligence, strategy, and analytical abilities in Chinese Purple Star Astrology.",
    meta_description_zh: "探索紫微斗数中的天机星。了解天机揭示的智慧、策略和分析能力特征。",
    keywords_en: ["tianji star meaning", "heavenly secret star", "tianji ziwei doushu", "tianji star personality", "tianji intelligence"],
    keywords_zh: ["天机星含义", "天机星紫微斗数", "天机星性格", "紫微斗数天机", "天机智慧"],

    overview_en: "Tianji (天机) is the Heavenly Secret Star, representing intelligence, strategy, and analytical ability. It is the star of wisdom and planning, governing mental acuity, strategic thinking, and the ability to see hidden patterns.",
    overview_zh: "天机是天机星，代表智慧、策略和分析能力。它是智慧和规划的星辰，掌管心智敏锐度、战略思维和发现隐藏模式的能力。",
    personality_en: "People with Tianji star influence are typically intelligent, analytical, and strategic thinkers. They have quick minds, excellent problem-solving abilities, and a natural talent for planning and strategy.",
    personality_zh: "天机星影响的人通常聪明、善于分析、有战略思维。他们思维敏捷，有出色的问题解决能力，有规划和策略的天赋。",
    career_en: "Tianji individuals excel in strategy, consulting, technology, research, and planning roles. Their analytical nature and strategic thinking make them effective in roles requiring intellectual prowess.",
    career_zh: "天机人在战略、咨询、技术、研究和规划岗位方面表现出色。他们善于分析的性格和战略思维使他们在需要智力优势的角色中非常有效。",
    relationships_en: "In relationships, Tianji individuals are thoughtful, communicative, and intellectually engaging. They value mental connection and stimulating conversations, but may need to develop more emotional depth.",
    relationships_zh: "在感情关系中，天机人善于思考、沟通、智力上有吸引力。他们重视智力联系和激发性的对话，但可能需要发展更多情感深度。",
    fortune_en: "Tianji star brings fortune through intelligence and strategic planning. It indicates success in academic pursuits, career advancement through clever maneuvering, and the ability to navigate complex situations.",
    fortune_zh: "天机星通过智慧和战略规划带来好运。它表示在学术追求中成功、通过巧妙手段获得职业发展以及驾驭复杂情况的能力。",

    faq_en: [
      { question: "What is the Tianji Star in Ziwei Doushu?", answer: "Tianji (天机) is the Heavenly Secret Star, representing intelligence, strategy, and analytical ability. It's the star of wisdom and planning, governing mental acuity and strategic thinking." },
      { question: "What does Tianji star indicate about personality?", answer: "Tianji star influence indicates an intelligent, analytical personality with strategic thinking abilities. These individuals have quick minds and excellent problem-solving skills." },
      { question: "What careers suit Tianji star people?", answer: "Tianji individuals excel in strategy, consulting, technology, research, and planning roles. Their analytical nature makes them effective in roles requiring intellectual prowess." },
      { question: "How does Tianji star affect fortune?", answer: "Tianji star brings fortune through intelligence and strategic planning. It indicates success in academic pursuits and career advancement through clever maneuvering." }
    ],
    faq_zh: [
      { question: "什么是紫微斗数中的天机星？", answer: "天机是天机星，代表智慧、策略和分析能力。它是智慧和规划的星辰，掌管心智敏锐度和战略思维。" },
      { question: "天机星对性格有什么暗示？", answer: "天机星影响表示聪明、善于分析的性格，有战略思维能力。这些人思维敏捷，有出色的问题解决能力。" },
      { question: "天机星人适合什么职业？", answer: "天机人在战略、咨询、技术、研究和规划岗位方面表现出色。他们善于分析的性格使他们在需要智力优势的角色中非常有效。" },
      { question: "天机星如何影响运势？", answer: "天机星通过智慧和战略规划带来好运。它表示在学术追求中成功和通过巧妙手段获得职业发展。" }
    ],

    related_stars: ["ziwei", "tianliang", "taiyang"],

    canonical_path: "/ziwei/stars/tianji"
  },
  {
    id: "taiyang",
    name_en: "Taiyang (Sun Star)",
    name_zh: "太阳星",
    emoji: "☀️",

    title_en: "Taiyang Star (Sun Star) Meaning | Ziwei Doushu Guide",
    title_zh: "太阳星含义 | 紫微斗数完整指南",
    meta_description_en: "Discover the Taiyang Star in Ziwei Doushu astrology. Learn what Taiyang reveals about generosity, public service, and radiant personality in Chinese Purple Star Astrology.",
    meta_description_zh: "探索紫微斗数中的太阳星。了解太阳揭示的慷慨、公共服务和光芒四射的性格特征。",
    keywords_en: ["taiyang star meaning", "sun star ziwei doushu", "taiyang personality", "taiyang generosity", "ziwei doushu sun"],
    keywords_zh: ["太阳星含义", "太阳星紫微斗数", "太阳星性格", "太阳星慷慨", "紫微斗数太阳"],

    overview_en: "Taiyang (太阳) is the Sun Star, representing radiance, generosity, and public service. It is the star of illumination and outreach, governing the ability to shine brightly and serve others with warmth and enthusiasm.",
    overview_zh: "太阳是太阳星，代表光芒、慷慨和公共服务。它是照亮和传播的星辰，掌管以温暖和热情闪耀和为他人服务的能力。",
    personality_en: "People with Taiyang star influence are typically warm, generous, and publicly spirited. They have a radiant personality, natural charisma, and a strong desire to help others and contribute to society.",
    personality_zh: "太阳星影响的人通常温暖、慷慨、有公共精神。他们有光芒四射的性格、天生的魅力，有强烈的帮助他人和贡献社会的愿望。",
    career_en: "Taiyang individuals excel in public service, politics, education, social work, and leadership roles that benefit the community. Their generous nature and public spirit make them effective in service-oriented careers.",
    career_zh: "太阳人在公共服务、政治、教育、社会工作和有益社区的领导岗位方面表现出色。他们慷慨的天性和公共精神使他们在服务型职业中非常有效。",
    relationships_en: "In relationships, Taiyang individuals are warm, generous, and publicly engaged. They may be busy with community activities but bring light and warmth to their partnerships.",
    relationships_zh: "在感情关系中，太阳人温暖、慷慨、公共参与度高。他们可能忙于社区活动，但为伴侣带来光明和温暖。",
    fortune_en: "Taiyang star brings fortune through public recognition, social influence, and community contributions. It indicates success in public-facing roles and the ability to make a positive impact on society.",
    fortune_zh: "太阳星通过公众认可、社会影响力和社区贡献带来好运。它表示在公共角色中成功和对社会产生积极影响的能力。",

    faq_en: [
      { question: "What is the Taiyang Star in Ziwei Doushu?", answer: "Taiyang (太阳) is the Sun Star, representing radiance, generosity, and public service. It's the star of illumination and outreach, governing the ability to shine brightly and serve others." },
      { question: "What does Taiyang star indicate about personality?", answer: "Taiyang star influence indicates a warm, generous personality with natural charisma and a strong desire to help others. These individuals are publicly spirited and radiate positive energy." },
      { question: "What careers suit Taiyang star people?", answer: "Taiyang individuals excel in public service, politics, education, and social work. Their generous nature makes them effective in service-oriented careers that benefit the community." },
      { question: "How does Taiyang star affect fortune?", answer: "Taiyang star brings fortune through public recognition, social influence, and community contributions. It indicates success in public-facing roles and making positive societal impact." }
    ],
    faq_zh: [
      { question: "什么是紫微斗数中的太阳星？", answer: "太阳是太阳星，代表光芒、慷慨和公共服务。它是照亮和 outreach 的星辰，掌管闪耀和为他人服务的能力。" },
      { question: "太阳星对性格有什么暗示？", answer: "太阳星影响表示温暖、慷慨的性格，有天生的魅力和强烈的帮助他人的愿望。这些人有公共精神，散发积极能量。" },
      { question: "太阳星人适合什么职业？", answer: "太阳人在公共服务、政治、教育和社会工作方面表现出色。他们慷慨的天性使他们在服务型职业中非常有效。" },
      { question: "太阳星如何影响运势？", answer: "太阳星通过公众认可、社会影响力和社区贡献带来好运。它表示在公共角色中成功和对社会产生积极影响的能力。" }
    ],

    related_stars: ["taiyin", "tianli", "jummen"],

    canonical_path: "/ziwei/stars/taiyang"
  },
  {
    id: "wuqu",
    name_en: "Wuqu (Military Star)",
    name_zh: "武曲星",
    emoji: "⚔️",

    title_en: "Wuqu Star (Military Star) Meaning | Ziwei Doushu Guide",
    title_zh: "武曲星含义 | 紫微斗数完整指南",
    meta_description_en: "Discover the Wuqu Star in Ziwei Doushu astrology. Learn what Wuqu reveals about courage, determination, and financial success in Chinese Purple Star Astrology.",
    meta_description_zh: "探索紫微斗数中的武曲星。了解武曲揭示的勇气、决心和财务成功特征。",
    keywords_en: ["wuqu star meaning", "military star ziwei doushu", "wuqu personality", "wuqu financial success", "ziwei doushu military"],
    keywords_zh: ["武曲星含义", "武曲星紫微斗数", "武曲星性格", "武曲星财务成功", "紫微斗数武曲"],

    overview_en: "Wuqu (武曲) is the Military Star, representing courage, determination, and financial acumen. It is the star of action and wealth, governing the ability to take decisive action and accumulate material success.",
    overview_zh: "武曲是武曲星，代表勇气、决心和财务敏锐度。它是行动和财富的星辰，掌管采取果断行动和积累物质成功的能力。",
    personality_en: "People with Wuqu star influence are typically courageous, determined, and financially savvy. They have a strong work ethic, natural business sense, and the ability to take decisive action under pressure.",
    personality_zh: "武曲星影响的人通常勇敢、坚定、有财务头脑。他们有强烈的职业道德、天生的商业意识，有在压力下采取果断行动的能力。",
    career_en: "Wuqu individuals excel in business, finance, military, law enforcement, and entrepreneurial ventures. Their courage and financial acumen make them effective in roles requiring decisive action and money management.",
    career_zh: "武曲人在商业、金融、军事、执法和创业方面表现出色。他们勇敢和财务敏锐度使他们在需要果断行动和资金管理的角色中非常有效。",
    relationships_en: "In relationships, Wuqu individuals are direct, honest, and action-oriented. They may prioritize work over romance but show love through providing material security and protection.",
    relationships_zh: "在感情关系中，武曲人直接、诚实、注重行动。他们可能优先考虑工作而非浪漫，但通过提供物质安全和保护来表达爱。",
    fortune_en: "Wuqu star brings fortune through financial success, business acumen, and decisive action. It indicates the ability to accumulate wealth through hard work and strategic financial decisions.",
    fortune_zh: "武曲星通过财务成功、商业敏锐度和果断行动带来好运。它表示通过努力工作和战略性财务决策积累财富的能力。",

    faq_en: [
      { question: "What is the Wuqu Star in Ziwei Doushu?", answer: "Wuqu (武曲) is the Military Star, representing courage, determination, and financial acumen. It's the star of action and wealth, governing decisive action and material success." },
      { question: "What does Wuqu star indicate about personality?", answer: "Wuqu star influence indicates a courageous, determined personality with financial savvy. These individuals have strong work ethic and natural business sense." },
      { question: "What careers suit Wuqu star people?", answer: "Wuqu individuals excel in business, finance, military, law enforcement, and entrepreneurship. Their courage and financial acumen make them effective in action-oriented roles." },
      { question: "How does Wuqu star affect fortune?", answer: "Wuqu star brings fortune through financial success and business acumen. It indicates the ability to accumulate wealth through hard work and strategic financial decisions." }
    ],
    faq_zh: [
      { question: "什么是紫微斗数中的武曲星？", answer: "武曲是武曲星，代表勇气、决心和财务敏锐度。它是行动和财富的星辰，掌管果断行动和物质成功。" },
      { question: "武曲星对性格有什么暗示？", answer: "武曲星影响表示勇敢、坚定的性格，有财务头脑。这些人有强烈的职业道德和天生的商业意识。" },
      { question: "武曲星人适合什么职业？", answer: "武曲人在商业、金融、军事、执法和创业方面表现出色。他们勇敢和财务敏锐度使他们在行动导向的角色中非常有效。" },
      { question: "武曲星如何影响运势？", answer: "武曲星通过财务成功和商业敏锐度带来好运。它表示通过努力工作和战略性财务决策积累财富的能力。" }
    ],

    related_stars: ["ziwei", "tiansha", "jummen"],

    canonical_path: "/ziwei/stars/wuqu"
  },
  {
    id: "tianfu",
    name_en: "Tianfu (Heavenly Treasury Star)",
    name_zh: "天府星",
    emoji: "🏦",

    title_en: "Tianfu Star (Heavenly Treasury) Meaning | Ziwei Doushu Guide",
    title_zh: "天府星含义 | 紫微斗数完整指南",
    meta_description_en: "Discover the Tianfu Star in Ziwei Doushu astrology. Learn what Tianfu reveals about stability, wealth preservation, and conservative nature in Chinese Purple Star Astrology.",
    meta_description_zh: "探索紫微斗数中的天府星。了解天府揭示的稳定、财富保值和保守性格特征。",
    keywords_en: ["tianfu star meaning", "heavenly treasury star", "tianfu ziwei doushu", "tianfu stability", "ziwei doushu wealth"],
    keywords_zh: ["天府星含义", "天府星紫微斗数", "天府星稳定", "紫微斗数天府", "天府星财富"],

    overview_en: "Tianfu (天府) is the Heavenly Treasury Star, representing stability, wealth preservation, and conservative management. It is the star of abundance and security, governing the ability to accumulate and protect resources.",
    overview_zh: "天府是天府星，代表稳定、财富保值和保守管理。它是丰裕和安全的星辰，掌管积累和保护资源的能力。",
    personality_en: "People with Tianfu star influence are typically stable, conservative, and financially prudent. They have a natural ability to preserve wealth, value security, and prefer steady, reliable approaches to life.",
    personality_zh: "天府星影响的人通常稳定、保守、财务谨慎。他们有保值财富的天赋，重视安全，偏好稳定、可靠的生活方式。",
    career_en: "Tianfu individuals excel in banking, finance, management, and stable corporate roles. Their conservative nature and financial prudence make them effective in roles requiring wealth preservation and steady growth.",
    career_zh: "天府人在银行、金融、管理和稳定的企业职位方面表现出色。他们保守的性格和财务谨慎使他们在需要财富保值和稳定增长的角色中非常有效。",
    relationships_en: "In relationships, Tianfu individuals are stable, reliable, and security-focused. They provide material comfort and stability but may need to develop more emotional expressiveness and spontaneity.",
    relationships_zh: "在感情关系中，天府人稳定、可靠、注重安全。他们提供物质舒适和稳定，但可能需要发展更多情感表达和自发性。",
    fortune_en: "Tianfu star brings fortune through wealth preservation, stable investments, and conservative management. It indicates the ability to accumulate and protect resources over the long term.",
    fortune_zh: "天府星通过财富保值、稳定投资和保守管理带来好运。它表示长期积累和保护资源的能力。",

    faq_en: [
      { question: "What is the Tianfu Star in Ziwei Doushu?", answer: "Tianfu (天府) is the Heavenly Treasury Star, representing stability, wealth preservation, and conservative management. It's the star of abundance and security, governing resource accumulation." },
      { question: "What does Tianfu star indicate about personality?", answer: "Tianfu star influence indicates a stable, conservative personality with financial prudence. These individuals value security and prefer steady, reliable approaches to life." },
      { question: "What careers suit Tianfu star people?", answer: "Tianfu individuals excel in banking, finance, management, and stable corporate roles. Their conservative nature makes them effective in roles requiring wealth preservation." },
      { question: "How does Tianfu star affect fortune?", answer: "Tianfu star brings fortune through wealth preservation and stable investments. It indicates the ability to accumulate and protect resources over the long term." }
    ],
    faq_zh: [
      { question: "什么是紫微斗数中的天府星？", answer: "天府是天府星，代表稳定、财富保值和保守管理。它是丰裕和安全的星辰，掌管资源积累。" },
      { question: "天府星对性格有什么暗示？", answer: "天府星影响表示稳定、保守的性格，有财务谨慎。这些人重视安全，偏好稳定、可靠的生活方式。" },
      { question: "天府星人适合什么职业？", answer: "天府人在银行、金融、管理和稳定的企业职位方面表现出色。他们保守的性格使他们在需要财富保值的角色中非常有效。" },
      { question: "天府星如何影响运势？", answer: "天府星通过财富保值和稳定投资带来好运。它表示长期积累和保护资源的能力。" }
    ],

    related_stars: ["ziwei", "wuqu", "tianxiang"],

    canonical_path: "/ziwei/stars/tianfu"
  }
]

export const ZiweiStarMap: Record<string, ZiweiStar> = Object.fromEntries(
  ZiweiStars.map(star => [star.id, star])
)
