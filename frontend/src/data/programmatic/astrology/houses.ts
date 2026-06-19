export interface AstrologyHouse {
  id: string
  name_en: string
  name_zh: string
  number: number
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
  keywords_list_en: string[]
  keywords_list_zh: string[]
  planets_in_house_en: string
  planets_in_house_zh: string

  // FAQ
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>

  // Internal Linking
  related_houses: string[]

  // Canonical
  canonical_path: string
}

export const AstrologyHouses: AstrologyHouse[] = [
  {
    id: "first",
    name_en: "First House (Ascendant)",
    name_zh: "第一宫（上升星座）",
    number: 1,
    emoji: "🌅",

    title_en: "First House (Ascendant) Meaning in Astrology | House Guide",
    title_zh: "第一宫（上升星座）在占星学中的含义 | 宫位完整指南",
    meta_description_en: "Discover the First House (Ascendant) in astrology. Learn what the First House reveals about self-image, appearance, and first impressions in Western astrology.",
    meta_description_zh: "探索占星学中的第一宫（上升星座）。了解第一宫揭示的自我形象、外表和第一印象特征。",
    keywords_en: ["first house astrology", "ascendant meaning", "first house personality", "astrology self image", "rising sign meaning"],
    keywords_zh: ["第一宫占星", "上升星座含义", "第一宫性格", "占星学自我形象", "上升星座"],

    overview_en: "The First House, also known as the Ascendant or Rising Sign, represents the self, physical appearance, and first impressions. It is the mask you show the world and how others perceive you at first glance.",
    overview_zh: "第一宫，也称为上升星座或升度，代表自我、外表和第一印象。它是你向世界展示的面具，也是他人对你的第一印象。",
    keywords_list_en: ["Self-image", "Physical appearance", "First impressions", "Personality", "How others see you", "Life approach", "Beginnings"],
    keywords_list_zh: ["自我形象", "外表", "第一印象", "性格", "他人如何看待你", "生活态度", "开始"],
    planets_in_house_en: "Planets in the First House strongly influence personality, appearance, and self-expression. The Sun here gives confidence and leadership, the Moon gives sensitivity, and Mars gives assertiveness.",
    planets_in_house_zh: "第一宫中的行星强烈影响性格、外表和自我表达。太阳在此给予自信和领导力，月亮给予敏感性，火星给予自信。",

    faq_en: [
      { question: "What is the First House in astrology?", answer: "The First House (Ascendant/Rising Sign) represents the self, physical appearance, and first impressions. It's the mask you show the world and how others perceive you initially." },
      { question: "How does the First House affect personality?", answer: "The First House defines your basic personality, how you present yourself, and the impression you make on others. It's the starting point of the birth chart." },
      { question: "What does the Ascendant mean?", answer: "The Ascendant is the zodiac sign rising on the eastern horizon at birth. It represents your outward personality, physical appearance, and how you approach new situations." },
      { question: "How does the First House differ from the Sun sign?", answer: "The Sun sign represents your core identity, while the Ascendant represents your outward personality and first impressions. The Ascendant is the mask; the Sun is the true self." }
    ],
    faq_zh: [
      { question: "什么是占星学中的第一宫？", answer: "第一宫（上升星座）代表自我、外表和第一印象。它是你向世界展示的面具，也是他人对你的初始印象。" },
      { question: "第一宫如何影响性格？", answer: "第一宫定义你的基本性格、你如何展现自己以及你给他人留下的印象。它是出生星盘的起点。" },
      { question: "上升星座是什么意思？", answer: "上升星座是出生时东方地平线上升起的星座。它代表你的外在性格、外表以及你如何应对新情况。" },
      { question: "第一宫与太阳星座有什么区别？", answer: "太阳星座代表你的核心身份，而上升星座代表你的外在性格和第一印象。上升星座是面具；太阳是真实的自我。" }
    ],

    related_houses: ["second", "twelfth", "seventh"],

    canonical_path: "/astrology/houses/first"
  },
  {
    id: "second",
    name_en: "Second House",
    name_zh: "第二宫",
    number: 2,
    emoji: "💰",

    title_en: "Second House Meaning in Astrology | House Guide",
    title_zh: "第二宫在占星学中的含义 | 宫位完整指南",
    meta_description_en: "Discover the Second House in astrology. Learn what the Second House reveals about money, values, and material possessions in Western astrology.",
    meta_description_zh: "探索占星学中的第二宫。了解第二宫揭示的金钱、价值观和物质财产特征。",
    keywords_en: ["second house astrology", "second house money", "second house values", "astrology wealth", "material possessions astrology"],
    keywords_zh: ["第二宫占星", "第二宫金钱", "第二宫价值观", "占星学财富", "物质财产占星"],

    overview_en: "The Second House represents money, values, and material possessions. It governs how you earn, spend, and manage money, as well as your personal values and what you consider important in life.",
    overview_zh: "第二宫代表金钱、价值观和物质财产。它掌管你如何赚取、花费和管理金钱，以及你的个人价值观和你认为生活中重要的东西。",
    keywords_list_en: ["Money", "Income", "Values", "Self-worth", "Possessions", "Material security", "Spending habits"],
    keywords_list_zh: ["金钱", "收入", "价值观", "自我价值", "财产", "物质安全", "消费习惯"],
    planets_in_house_en: "Planets in the Second House influence financial matters and values. Venus here brings financial comfort, Saturn brings discipline with money, and Jupiter brings abundance.",
    planets_in_house_zh: "第二宫中的行星影响财务事务和价值观。金星在此带来财务舒适，土星带来金钱纪律，木星带来丰盛。",

    faq_en: [
      { question: "What is the Second House in astrology?", answer: "The Second House represents money, values, and material possessions. It governs how you earn, spend, and manage money, as well as your personal values and self-worth." },
      { question: "How does the Second House affect finances?", answer: "The Second House defines your financial potential, earning capacity, and money management style. It shows how you approach wealth and material security." },
      { question: "What do planets in the Second House mean?", answer: "Planets here influence your financial life. Venus brings comfort, Saturn brings discipline, Jupiter brings abundance, and Mars brings aggressive earning." },
      { question: "How does the Second House relate to values?", answer: "Beyond money, the Second House represents what you value most — whether material possessions, personal talents, or emotional security. It shows your self-worth." }
    ],
    faq_zh: [
      { question: "什么是占星学中的第二宫？", answer: "第二宫代表金钱、价值观和物质财产。它掌管你如何赚取、花费和管理金钱，以及你的个人价值观和自我价值。" },
      { question: "第二宫如何影响财务？", answer: "第二宫定义你的财务潜力、收入能力和资金管理风格。它显示你如何对待财富和物质安全。" },
      { question: "第二宫中的行星意味着什么？", answer: "这里的行星影响你的财务生活。金星带来舒适，土星带来纪律，木星带来丰盛，火星带来积极的赚钱方式。" },
      { question: "第二宫与价值观有什么关系？", answer: "除了金钱，第二宫代表你最重视的东西——无论是物质财产、个人才能还是情感安全。它显示你的自我价值。" }
    ],

    related_houses: ["first", "third", "eighth"],

    canonical_path: "/astrology/houses/second"
  },
  {
    id: "third",
    name_en: "Third House",
    name_zh: "第三宫",
    number: 3,
    emoji: "💬",

    title_en: "Third House Meaning in Astrology | House Guide",
    title_zh: "第三宫在占星学中的含义 | 宫位完整指南",
    meta_description_en: "Discover the Third House in astrology. Learn what the Third House reveals about communication, siblings, and daily interactions in Western astrology.",
    meta_description_zh: "探索占星学中的第三宫。了解第三宫揭示的沟通、兄弟姐妹和日常互动特征。",
    keywords_en: ["third house astrology", "third house communication", "third house siblings", "astrology daily interactions", "third house learning"],
    keywords_zh: ["第三宫占星", "第三宫沟通", "第三宫兄弟姐妹", "占星学日常互动", "第三宫学习"],

    overview_en: "The Third House represents communication, siblings, short trips, and daily interactions. It governs how you think, learn, communicate, and interact with your immediate environment and neighbors.",
    overview_zh: "第三宫代表沟通、兄弟姐妹、短途旅行和日常互动。它掌管你如何思考、学习、沟通以及与周围环境和邻居互动。",
    keywords_list_en: ["Communication", "Siblings", "Short trips", "Daily interactions", "Learning", "Writing", "Neighbors"],
    keywords_list_zh: ["沟通", "兄弟姐妹", "短途旅行", "日常互动", "学习", "写作", "邻居"],
    planets_in_house_en: "Planets in the Third House influence communication and learning. Mercury here enhances mental agility, Moon gives emotional communication, and Saturn brings disciplined thinking.",
    planets_in_house_zh: "第三宫中的行星影响沟通和学习。水星在此增强心智灵活，月亮给予情感沟通，土星带来有纪律的思维。",

    faq_en: [
      { question: "What is the Third House in astrology?", answer: "The Third House represents communication, siblings, short trips, and daily interactions. It governs how you think, learn, and communicate with your immediate environment." },
      { question: "How does the Third House affect communication?", answer: "The Third House defines your communication style, learning ability, and how you process and share information with others." },
      { question: "What do planets in the Third House mean?", answer: "Planets here influence your communication and mental processes. Mercury enhances quick thinking, Moon adds emotional depth, and Saturn brings structured communication." },
      { question: "How does the Third House relate to siblings?", answer: "The Third House governs relationships with siblings, neighbors, and extended family. It shows the nature of these relationships and how they influence your life." }
    ],
    faq_zh: [
      { question: "什么是占星学中的第三宫？", answer: "第三宫代表沟通、兄弟姐妹、短途旅行和日常互动。它掌管你如何思考、学习以及与周围环境沟通。" },
      { question: "第三宫如何影响沟通？", answer: "第三宫定义你的沟通风格、学习能力以及你如何处理和与他人分享信息。" },
      { question: "第三宫中的行星意味着什么？", answer: "这里的行星影响你的沟通和思维过程。水星增强快速思考，月亮增加情感深度，土星带来结构化沟通。" },
      { question: "第三宫与兄弟姐妹有什么关系？", answer: "第三宫掌管与兄弟姐妹、邻居和大家庭的关系。它显示这些关系的本质以及它们如何影响你的生活。" }
    ],

    related_houses: ["second", "fourth", "ninth"],

    canonical_path: "/astrology/houses/third"
  },
  {
    id: "fourth",
    name_en: "Fourth House (IC)",
    name_zh: "第四宫（天底）",
    number: 4,
    emoji: "🏠",

    title_en: "Fourth House (IC) Meaning in Astrology | House Guide",
    title_zh: "第四宫（天底）在占星学中的含义 | 宫位完整指南",
    meta_description_en: "Discover the Fourth House (IC) in astrology. Learn what the Fourth House reveals about home, family, roots, and emotional foundation in Western astrology.",
    meta_description_zh: "探索占星学中的第四宫（天底）。了解第四宫揭示的家庭、根基和情感基础特征。",
    keywords_en: ["fourth house astrology", "ic meaning", "fourth house home", "astrology family roots", "emotional foundation astrology"],
    keywords_zh: ["第四宫占星", "天底含义", "第四宫家庭", "占星学家庭根基", "情感基础占星"],

    overview_en: "The Fourth House (IC - Imum Coeli) represents home, family, roots, and emotional foundation. It governs your private life, ancestry, and the deepest part of your emotional security.",
    overview_zh: "第四宫（天底）代表家庭、根基和情感基础。它掌管你的私生活、祖先以及情感安全的最深层部分。",
    keywords_list_en: ["Home", "Family", "Roots", "Ancestry", "Emotional security", "Private life", "Endings"],
    keywords_list_zh: ["家庭", "根基", "祖先", "情感安全", "私生活", "结束"],
    planets_in_house_en: "Planets in the Fourth House influence home and family life. Moon here creates strong emotional bonds, Saturn brings structure to home life, and Neptune adds spiritual atmosphere.",
    planets_in_house_zh: "第四宫中的行星影响家庭生活。月亮在此创造强烈的情感联系，土星为家庭生活带来结构，海王星增加灵性氛围。",

    faq_en: [
      { question: "What is the Fourth House in astrology?", answer: "The Fourth House (IC) represents home, family, roots, and emotional foundation. It governs your private life, ancestry, and deepest emotional security." },
      { question: "How does the Fourth House affect home life?", answer: "The Fourth House defines your relationship with home, family dynamics, and the emotional environment you create. It shows your need for security and belonging." },
      { question: "What do planets in the Fourth House mean?", answer: "Planets here influence your home and family life. Moon creates emotional bonds, Saturn brings structure, Neptune adds spirituality, and Pluto brings transformation." },
      { question: "How does the Fourth House relate to ancestry?", answer: "The Fourth House governs your roots, heritage, and connection to ancestors. It shows how your family history influences your present life and emotional patterns." }
    ],
    faq_zh: [
      { question: "什么是占星学中的第四宫？", answer: "第四宫（天底）代表家庭、根基和情感基础。它掌管你的私生活、祖先以及最深层的情感安全。" },
      { question: "第四宫如何影响家庭生活？", answer: "第四宫定义你与家庭的关系、家庭动态以及你创造的情感环境。它显示你对安全和归属感的需求。" },
      { question: "第四宫中的行星意味着什么？", answer: "这里的行星影响你的家庭生活。月亮创造情感联系，土星带来结构，海王星增加灵性，冥王星带来转变。" },
      { question: "第四宫与祖先有什么关系？", answer: "第四宫掌管你的根源、传统和与祖先的联系。它显示你的家族历史如何影响你的现在生活和情感模式。" }
    ],

    related_houses: ["third", "fifth", "tenth"],

    canonical_path: "/astrology/houses/fourth"
  },
  {
    id: "fifth",
    name_en: "Fifth House",
    name_zh: "第五宫",
    number: 5,
    emoji: "🎭",

    title_en: "Fifth House Meaning in Astrology | House Guide",
    title_zh: "第五宫在占星学中的含义 | 宫位完整指南",
    meta_description_en: "Discover the Fifth House in astrology. Learn what the Fifth House reveals about creativity, romance, children, and joy in Western astrology.",
    meta_description_zh: "探索占星学中的第五宫。了解第五宫揭示的创造力、浪漫、子女和快乐特征。",
    keywords_en: ["fifth house astrology", "fifth house creativity", "fifth house romance", "astrology children", "fifth house joy"],
    keywords_zh: ["第五宫占星", "第五宫创造力", "第五宫浪漫", "占星学子女", "第五宫快乐"],

    overview_en: "The Fifth House represents creativity, romance, children, and joy. It governs self-expression, artistic pursuits, romantic affairs, and the things that bring you pleasure and happiness.",
    overview_zh: "第五宫代表创造力、浪漫、子女和快乐。它掌管自我表达、艺术追求、浪漫恋情以及给你带来快乐和幸福的事情。",
    keywords_list_en: ["Creativity", "Romance", "Children", "Joy", "Self-expression", "Entertainment", "Risk-taking"],
    keywords_list_zh: ["创造力", "浪漫", "子女", "快乐", "自我表达", "娱乐", "冒险"],
    planets_in_house_en: "Planets in the Fifth House influence creativity and romance. Sun here amplifies creative expression, Venus brings romantic fulfillment, and Jupiter expands joy and abundance.",
    planets_in_house_zh: "第五宫中的行星影响创造力和浪漫。太阳在此增强创造性表达，金星带来浪漫满足，木星扩展快乐和丰盛。",

    faq_en: [
      { question: "What is the Fifth House in astrology?", answer: "The Fifth House represents creativity, romance, children, and joy. It governs self-expression, artistic pursuits, romantic affairs, and sources of pleasure." },
      { question: "How does the Fifth House affect creativity?", answer: "The Fifth House defines your creative expression, artistic talents, and the activities that bring you joy. It shows how you play and have fun." },
      { question: "What do planets in the Fifth House mean?", answer: "Planets here influence your creative and romantic life. Sun amplifies expression, Venus brings romance, Jupiter expands joy, and Saturn brings disciplined creativity." },
      { question: "How does the Fifth House relate to children?", answer: "The Fifth House governs your relationship with children, both your own and your inner child. It shows your approach to parenting and creative offspring." }
    ],
    faq_zh: [
      { question: "什么是占星学中的第五宫？", answer: "第五宫代表创造力、浪漫、子女和快乐。它掌管自我表达、艺术追求、浪漫恋情和快乐来源。" },
      { question: "第五宫如何影响创造力？", answer: "第五宫定义你的创造性表达、艺术才能以及给你带来快乐的活动。它显示你如何玩耍和享受乐趣。" },
      { question: "第五宫中的行星意味着什么？", answer: "这里的行星影响你的创造性和浪漫生活。太阳增强表达，金星带来浪漫，木星扩展快乐，土星带来有纪律的创造力。" },
      { question: "第五宫与子女有什么关系？", answer: "第五宫掌管你与子女的关系，包括你自己的孩子和你内心的孩子。它显示你的育儿方式和创造性后代。" }
    ],

    related_houses: ["fourth", "sixth", "eleventh"],

    canonical_path: "/astrology/houses/fifth"
  }
]

export const AstrologyHouseMap: Record<string, AstrologyHouse> = Object.fromEntries(
  AstrologyHouses.map(house => [house.id, house])
)
