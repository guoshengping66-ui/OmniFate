export interface AstrologyPlanet {
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
  strengths_en: string
  strengths_zh: string
  weaknesses_en: string
  weaknesses_zh: string
  career_en: string
  career_zh: string
  relationships_en: string
  relationships_zh: string

  // Associations
  rules_sign: string
  exaltation: string
  detriment: string
  fall: string

  // FAQ
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>

  // Internal Linking
  related_planets: string[]

  // Canonical
  canonical_path: string
}

export const AstrologyPlanets: AstrologyPlanet[] = [
  {
    id: "sun",
    name_en: "Sun",
    name_zh: "太阳",
    emoji: "☀️",

    title_en: "Sun in Astrology Meaning | Planet Guide",
    title_zh: "太阳在占星学中的含义 | 行星完整指南",
    meta_description_en: "Discover the Sun in astrology. Learn what the Sun reveals about core identity, ego, and life purpose in Western astrology.",
    meta_description_zh: "探索占星学中的太阳。了解太阳揭示的核心身份、自我和人生目的。",
    keywords_en: ["sun astrology meaning", "sun planet personality", "sun sign identity", "astrology sun ego", "sun life purpose"],
    keywords_zh: ["太阳占星含义", "太阳行星性格", "太阳星座身份", "占星学太阳自我", "太阳人生目的"],

    overview_en: "The Sun is the most important planet in astrology, representing core identity, ego, and life purpose. It governs the fundamental sense of self, creativity, vitality, and the drive to express one's unique individuality.",
    overview_zh: "太阳是占星学中最重要的行星，代表核心身份、自我和人生目的。它掌管基本的自我意识、创造力、活力和表达独特个性的驱动力。",
    personality_en: "The Sun represents the core self — who you are at the deepest level. It governs your fundamental nature, creative expression, and the drive to shine and be recognized for your unique gifts.",
    personality_zh: "太阳代表核心自我——你在最深层次上是谁。它掌管你的基本本质、创造性表达以及闪耀和因独特天赋而被认可的驱动力。",
    strengths_en: "Creativity, vitality, leadership, confidence, and the ability to inspire others. The Sun gives warmth, generosity, and a natural magnetism that draws people together.",
    strengths_zh: "创造力、活力、领导力、自信和激励他人的能力。太阳给予温暖、慷慨和自然的磁性，将人们聚集在一起。",
    weaknesses_en: "Ego, arrogance, need for attention, and difficulty accepting criticism. An afflicted Sun can lead to self-centeredness, pride, and a tendency to dominate others.",
    weaknesses_zh: "自我、傲慢、需要关注和难以接受批评。受克的太阳可能导致以自我为中心、骄傲和支配他人的倾向。",
    career_en: "The Sun governs creative fields, leadership roles, entertainment, and any position that requires self-expression and recognition. It favors careers where you can shine and be in the spotlight.",
    career_zh: "太阳掌管创意领域、领导岗位、娱乐以及任何需要自我表达和认可的职位。它有利于你能闪耀和成为焦点的职业。",
    relationships_en: "In relationships, the Sun represents the need for recognition, admiration, and being seen for who you truly are. It governs romantic expression and the desire to be appreciated.",
    relationships_zh: "在感情关系中，太阳代表对认可、欣赏和被看到真实自我的需求。它掌管浪漫表达和被欣赏的欲望。",

    rules_sign: "Leo",
    exaltation: "Aries",
    detriment: "Aquarius",
    fall: "Libra",

    faq_en: [
      { question: "What does the Sun represent in astrology?", answer: "The Sun represents core identity, ego, life purpose, and creative expression. It is the most important planet in astrology, governing your fundamental sense of self and vitality." },
      { question: "How does the Sun affect personality?", answer: "The Sun defines your core personality, natural leadership abilities, creative expression, and the drive to be recognized. It's who you are at the deepest level." },
      { question: "What does a strong Sun indicate?", answer: "A strong Sun indicates confidence, vitality, natural leadership, and the ability to inspire others. It suggests a person who shines brightly and achieves recognition." },
      { question: "How does the Sun affect career?", answer: "The Sun favors creative fields, leadership roles, entertainment, and any position requiring self-expression. It's strongest in careers where you can be in the spotlight." }
    ],
    faq_zh: [
      { question: "太阳在占星学中代表什么？", answer: "太阳代表核心身份、自我、人生目的和创造性表达。它是占星学中最重要的行星，掌管基本的自我意识和活力。" },
      { question: "太阳如何影响性格？", answer: "太阳定义你的核心性格、天生的领导能力、创造性表达以及被认可的驱动力。它是你在最深层次上的本质。" },
      { question: "太阳强表示什么？", answer: "太阳强表示自信、活力、天生的领导力和激励他人的能力。它暗示一个闪耀和获得认可的人。" },
      { question: "太阳如何影响事业？", answer: "太阳有利于创意领域、领导岗位、娱乐以及任何需要自我表达的职位。它在你能成为焦点的职业中最强。" }
    ],

    related_planets: ["moon", "mercury", "venus"],

    canonical_path: "/astrology/planets/sun"
  },
  {
    id: "moon",
    name_en: "Moon",
    name_zh: "月亮",
    emoji: "🌙",

    title_en: "Moon in Astrology Meaning | Planet Guide",
    title_zh: "月亮在占星学中的含义 | 行星完整指南",
    meta_description_en: "Discover the Moon in astrology. Learn what the Moon reveals about emotions, instincts, and inner world in Western astrology.",
    meta_description_zh: "探索占星学中的月亮。了解月亮揭示的情感、本能和内心世界特征。",
    keywords_en: ["moon astrology meaning", "moon planet emotions", "moon sign personality", "astrology moon instincts", "moon inner world"],
    keywords_zh: ["月亮占星含义", "月亮行星情感", "月亮星座性格", "占星学月亮本能", "月亮内心世界"],

    overview_en: "The Moon represents emotions, instincts, and the inner world. It governs how you feel, react, and nurture yourself and others. The Moon is the most personal and sensitive point in the birth chart.",
    overview_zh: "月亮代表情感、本能和内心世界。它掌管你如何感受、反应以及照顾自己和他人。月亮是出生星盘中最个人化和最敏感的点。",
    personality_en: "The Moon represents your emotional nature, subconscious reactions, and instinctive responses. It shows how you nurture, what makes you feel safe, and your deepest emotional needs.",
    personality_zh: "月亮代表你的情感本质、潜意识反应和本能反应。它显示你如何照顾他人、什么让你感到安全以及你最深层的情感需求。",
    strengths_en: "Emotional intelligence, empathy, intuition, nurturing ability, and deep emotional connection. The Moon gives sensitivity, compassion, and the ability to understand others' feelings.",
    strengths_zh: "情商、同理心、直觉、养育能力和深层情感联系。月亮给予敏感性、同情心和理解他人感受的能力。",
    weaknesses_en: "Moodiness, emotional instability, dependency, and hypersensitivity. An afflicted Moon can lead to emotional turbulence, insecurity, and difficulty setting boundaries.",
    weaknesses_zh: "情绪化、情绪不稳定、依赖性和过度敏感。受克的月亮可能导致情绪波动、不安全感和设定界限的困难。",
    career_en: "The Moon governs nurturing roles, healthcare, hospitality, real estate, and any work involving emotional connection. It favors careers where you can care for others and create emotional security.",
    career_zh: "月亮掌管养育角色、医疗保健、酒店业、房地产以及任何涉及情感联系的工作。它有利于你能照顾他人和创造情感安全的职业。",
    relationships_en: "In relationships, the Moon represents emotional needs, nurturing style, and the desire for emotional security. It governs how you bond and what makes you feel loved and protected.",
    relationships_zh: "在感情关系中，月亮代表情感需求、养育风格和对情感安全的渴望。它掌管你如何建立联系以及什么让你感到被爱和保护。",

    rules_sign: "Cancer",
    exaltation: "Taurus",
    detriment: "Capricorn",
    fall: "Scorpio",

    faq_en: [
      { question: "What does the Moon represent in astrology?", answer: "The Moon represents emotions, instincts, the inner world, and nurturing. It governs how you feel, react, and care for yourself and others. It's the most personal point in the birth chart." },
      { question: "How does the Moon affect emotions?", answer: "The Moon defines your emotional nature, subconscious reactions, and instinctive responses. It shows what makes you feel safe and your deepest emotional needs." },
      { question: "What does a strong Moon indicate?", answer: "A strong Moon indicates emotional intelligence, empathy, intuition, and strong nurturing abilities. It suggests a person with deep emotional connection and sensitivity." },
      { question: "How does the Moon affect relationships?", answer: "The Moon governs emotional needs, bonding style, and the desire for security in relationships. It shows how you nurture and what makes you feel loved and protected." }
    ],
    faq_zh: [
      { question: "月亮在占星学中代表什么？", answer: "月亮代表情感、本能、内心世界和养育。它掌管你如何感受、反应以及照顾自己和他人。它是出生星盘中最个人化的点。" },
      { question: "月亮如何影响情感？", answer: "月亮定义你的情感本质、潜意识反应和本能反应。它显示什么让你感到安全以及你最深层的情感需求。" },
      { question: "月亮强表示什么？", answer: "月亮强表示情商、同理心、直觉和强大的养育能力。它暗示一个有深层情感联系和敏感性的人。" },
      { question: "月亮如何影响感情关系？", answer: "月亮掌管情感需求、建立联系的方式以及对关系安全的渴望。它显示你如何照顾他人以及什么让你感到被爱和保护。" }
    ],

    related_planets: ["sun", "venus", "neptune"],

    canonical_path: "/astrology/planets/moon"
  },
  {
    id: "mercury",
    name_en: "Mercury",
    name_zh: "水星",
    emoji: "☿️",

    title_en: "Mercury in Astrology Meaning | Planet Guide",
    title_zh: "水星在占星学中的含义 | 行星完整指南",
    meta_description_en: "Discover Mercury in astrology. Learn what Mercury reveals about communication, intellect, and thinking style in Western astrology.",
    meta_description_zh: "探索占星学中的水星。了解水星揭示的沟通、智力和思维风格特征。",
    keywords_en: ["mercury astrology meaning", "mercury planet communication", "mercury sign intellect", "astrology mercury thinking", "mercury communication style"],
    keywords_zh: ["水星占星含义", "水星行星沟通", "水星星座智力", "占星学水星思维", "水星沟通风格"],

    overview_en: "Mercury represents communication, intellect, and thinking style. It governs how you process information, express ideas, and interact with your immediate environment. Mercury is the messenger of the gods.",
    overview_zh: "水星代表沟通、智力和思维风格。它掌管你如何处理信息、表达想法以及与周围环境互动。水星是众神的信使。",
    personality_en: "Mercury represents your mental process, communication style, and learning ability. It shows how you think, speak, write, and process the world around you.",
    personality_zh: "水星代表你的思维过程、沟通风格和学习能力。它显示你如何思考、说话、写作以及处理周围的世界。",
    strengths_en: "Quick thinking, eloquence, adaptability, learning ability, and mental agility. Mercury gives wit, cleverness, and the ability to communicate effectively.",
    strengths_zh: "思维敏捷、口才、适应力、学习能力和心智灵活。水星给予机智、聪明和有效沟通的能力。",
    weaknesses_en: "Nervousness, restlessness, scattered thinking, and superficiality. An afflicted Mercury can lead to anxiety, difficulty concentrating, and unreliable communication.",
    weaknesses_zh: "紧张、不安、思维分散和肤浅。受克的水星可能导致焦虑、难以集中注意力和不可靠的沟通。",
    career_en: "Mercury governs communication, writing, teaching, commerce, and technology. It favors careers requiring quick thinking, clear expression, and mental agility.",
    career_zh: "水星掌管沟通、写作、教学、商业和技术。它有利于需要快速思考、清晰表达和心智灵活的职业。",
    relationships_en: "In relationships, Mercury represents intellectual connection, communication, and the exchange of ideas. It governs how you talk to your partner and the mental stimulation you seek.",
    relationships_zh: "在感情关系中，水星代表智力联系、沟通和思想交流。它掌管你如何与伴侣交谈以及你寻求的智力刺激。",

    rules_sign: "Gemini, Virgo",
    exaltation: "Virgo",
    detriment: "Sagittarius, Pisces",
    fall: "Pisces",

    faq_en: [
      { question: "What does Mercury represent in astrology?", answer: "Mercury represents communication, intellect, and thinking style. It governs how you process information, express ideas, and interact with your environment." },
      { question: "How does Mercury affect communication?", answer: "Mercury defines your communication style, eloquence, and mental agility. It shows how you think, speak, and write, and how effectively you express your ideas." },
      { question: "What does a strong Mercury indicate?", answer: "A strong Mercury indicates quick thinking, eloquence, adaptability, and strong learning ability. It suggests a person with mental agility and effective communication skills." },
      { question: "How does Mercury affect career?", answer: "Mercury favors communication, writing, teaching, commerce, and technology careers. It's strongest in roles requiring quick thinking, clear expression, and mental agility." }
    ],
    faq_zh: [
      { question: "水星在占星学中代表什么？", answer: "水星代表沟通、智力和思维风格。它掌管你如何处理信息、表达想法以及与环境互动。" },
      { question: "水星如何影响沟通？", answer: "水星定义你的沟通风格、口才和心智灵活。它显示你如何思考、说话和写作，以及你表达想法的有效性。" },
      { question: "水星强表示什么？", answer: "水星强表示思维敏捷、口才、适应力和强大的学习能力。它暗示一个有心智灵活和有效沟通技巧的人。" },
      { question: "水星如何影响事业？", answer: "水星有利于沟通、写作、教学、商业和技术职业。它在需要快速思考、清晰表达和心智灵活的角色中最强。" }
    ],

    related_planets: ["sun", "venus", "jupiter"],

    canonical_path: "/astrology/planets/mercury"
  },
  {
    id: "venus",
    name_en: "Venus",
    name_zh: "金星",
    emoji: "♀️",

    title_en: "Venus in Astrology Meaning | Planet Guide",
    title_zh: "金星在占星学中的含义 | 行星完整指南",
    meta_description_en: "Discover Venus in astrology. Learn what Venus reveals about love, beauty, values, and relationships in Western astrology.",
    meta_description_zh: "探索占星学中的金星。了解金星揭示的爱情、美丽、价值观和关系特征。",
    keywords_en: ["venus astrology meaning", "venus planet love", "venus sign beauty", "astrology venus relationships", "venus values"],
    keywords_zh: ["金星占星含义", "金星行星爱情", "金星星座美丽", "占星学金星关系", "金星价值观"],

    overview_en: "Venus represents love, beauty, values, and pleasure. It governs how you attract love, appreciate beauty, and find pleasure in life. Venus is the planet of harmony and attraction.",
    overview_zh: "金星代表爱情、美丽、价值观和快乐。它掌管你如何吸引爱情、欣赏美以及在生活中找到快乐。金星是和谐与吸引的行星。",
    personality_en: "Venus represents your approach to love, your aesthetic sensibility, and your personal values. It shows what you find beautiful, what you value, and how you express affection.",
    personality_zh: "金星代表你对待爱情的方式、你的美学感和个人价值观。它显示你认为什么是美的、你重视什么以及你如何表达爱意。",
    strengths_en: "Charm, beauty, diplomacy, artistic talent, and the ability to create harmony. Venus gives grace, elegance, and a natural appreciation for beauty and pleasure.",
    strengths_zh: "魅力、美丽、外交手腕、艺术天赋和创造和谐的能力。金星给予优雅、高雅以及对美和快乐的天然鉴赏力。",
    weaknesses_en: "Indulgence, vanity, possessiveness, and conflict avoidance. An afflicted Venus can lead to overindulgence, materialism, and difficulty with commitment.",
    weaknesses_zh: "放纵、虚荣、占有欲和回避冲突。受克的金星可能导致过度放纵、物质主义和承诺困难。",
    career_en: "Venus governs art, beauty, fashion, entertainment, diplomacy, and luxury industries. It favors careers where you can express creativity and create beauty.",
    career_zh: "金星掌管艺术、美容、时尚、娱乐、外交和奢侈品行业。它有利于你能表达创造力和创造美的职业。",
    relationships_en: "In relationships, Venus represents romantic love, attraction, and the desire for harmony. It governs how you attract partners, express love, and create beautiful connections.",
    relationships_zh: "在感情关系中，金星代表浪漫爱情、吸引力和对和谐的渴望。它掌管你如何吸引伴侣、表达爱意以及创造美好的联系。",

    rules_sign: "Taurus, Libra",
    exaltation: "Pisces",
    detriment: "Scorpio, Aries",
    fall: "Virgo",

    faq_en: [
      { question: "What does Venus represent in astrology?", answer: "Venus represents love, beauty, values, and pleasure. It governs how you attract love, appreciate beauty, and find pleasure in life. It's the planet of harmony and attraction." },
      { question: "How does Venus affect relationships?", answer: "Venus defines your approach to love, romantic expression, and what you find attractive. It governs how you attract partners and create beautiful, harmonious connections." },
      { question: "What does a strong Venus indicate?", answer: "A strong Venus indicates charm, beauty, artistic talent, and the ability to create harmony. It suggests a person with natural grace and appreciation for beauty." },
      { question: "How does Venus affect career?", answer: "Venus favors art, beauty, fashion, entertainment, and diplomacy careers. It's strongest in roles where you can express creativity and create beauty." }
    ],
    faq_zh: [
      { question: "金星在占星学中代表什么？", answer: "金星代表爱情、美丽、价值观和快乐。它掌管你如何吸引爱情、欣赏美以及在生活中找到快乐。它是和谐与吸引的行星。" },
      { question: "金星如何影响感情关系？", answer: "金星定义你对待爱情的方式、浪漫表达以及你认为有吸引力的。它掌管你如何吸引伴侣和创造美好、和谐的联系。" },
      { question: "金星强表示什么？", answer: "金星强表示魅力、美丽、艺术天赋和创造和谐的能力。它暗示一个有天生优雅和对美有鉴赏力的人。" },
      { question: "金星如何影响事业？", answer: "金星有利于艺术、美容、时尚、娱乐和外交职业。它在你能表达创造力和创造美的角色中最强。" }
    ],

    related_planets: ["mars", "sun", "neptune"],

    canonical_path: "/astrology/planets/venus"
  },
  {
    id: "mars",
    name_en: "Mars",
    name_zh: "火星",
    emoji: "♂️",

    title_en: "Mars in Astrology Meaning | Planet Guide",
    title_zh: "火星在占星学中的含义 | 行星完整指南",
    meta_description_en: "Discover Mars in astrology. Learn what Mars reveals about action, desire, courage, and drive in Western astrology.",
    meta_description_zh: "探索占星学中的火星。了解火星揭示的行动、欲望、勇气和动力特征。",
    keywords_en: ["mars astrology meaning", "mars planet action", "mars sign desire", "astrology mars courage", "mars drive ambition"],
    keywords_zh: ["火星占星含义", "火星行星行动", "火星星座欲望", "占星学火星勇气", "火星动力抱负"],

    overview_en: "Mars represents action, desire, courage, and drive. It governs how you assert yourself, pursue goals, and express anger. Mars is the planet of energy, passion, and conflict.",
    overview_zh: "火星代表行动、欲望、勇气和动力。它掌管你如何展现自己、追求目标和表达愤怒。火星是能量、激情和冲突的行星。",
    personality_en: "Mars represents your drive, ambition, and how you take action. It shows your physical energy, sexual desire, and the way you assert yourself in the world.",
    personality_zh: "火星代表你的动力、抱负和你如何采取行动。它显示你的身体能量、性欲以及你在世界中展现自己的方式。",
    strengths_en: "Courage, energy, determination, passion, and the ability to take decisive action. Mars gives strength, competitiveness, and the drive to overcome obstacles.",
    strengths_zh: "勇气、能量、决心、激情和采取果断行动的能力。火星给予力量、竞争性和克服障碍的动力。",
    weaknesses_en: "Aggression, impulsiveness, anger, and conflict. An afflicted Mars can lead to recklessness, violence, and difficulty controlling temper.",
    weaknesses_zh: "攻击性、冲动、愤怒和冲突。受克的火星可能导致鲁莽、暴力和难以控制脾气。",
    career_en: "Mars governs military, sports, surgery, engineering, and competitive fields. It favors careers requiring physical energy, courage, and the ability to take decisive action.",
    career_zh: "火星掌管军事、体育、外科手术、工程和竞争激烈的领域。它有利于需要身体能量、勇气和果断行动能力的职业。",
    relationships_en: "In relationships, Mars represents sexual desire, passion, and the drive to pursue romantic interests. It governs how you assert yourself romantically and the intensity you bring to partnerships.",
    relationships_zh: "在感情关系中，火星代表性欲、激情和追求浪漫兴趣的动力。它掌管你在浪漫中如何展现自己以及你为伴侣关系带来的强度。",

    rules_sign: "Aries, Scorpio",
    exaltation: "Capricorn",
    detriment: "Libra, Taurus",
    fall: "Cancer",

    faq_en: [
      { question: "What does Mars represent in astrology?", answer: "Mars represents action, desire, courage, and drive. It governs how you assert yourself, pursue goals, and express anger. It's the planet of energy, passion, and conflict." },
      { question: "How does Mars affect personality?", answer: "Mars defines your drive, ambition, physical energy, and how you take action. It shows your sexual desire and the way you assert yourself in the world." },
      { question: "What does a strong Mars indicate?", answer: "A strong Mars indicates courage, energy, determination, and the ability to take decisive action. It suggests a person with strong physical and competitive energy." },
      { question: "How does Mars affect career?", answer: "Mars favors military, sports, surgery, engineering, and competitive careers. It's strongest in roles requiring physical energy, courage, and decisive action." }
    ],
    faq_zh: [
      { question: "火星在占星学中代表什么？", answer: "火星代表行动、欲望、勇气和动力。它掌管你如何展现自己、追求目标和表达愤怒。它是能量、激情和冲突的行星。" },
      { question: "火星如何影响性格？", answer: "火星定义你的动力、抱负、身体能量和你如何采取行动。它显示你的性欲以及你在世界中展现自己的方式。" },
      { question: "火星强表示什么？", answer: "火星强表示勇气、能量、决心和采取果断行动的能力。它暗示一个有强大身体和竞争能量的人。" },
      { question: "火星如何影响事业？", answer: "火星有利于军事、体育、外科手术、工程和竞争性职业。它在需要身体能量、勇气和果断行动的角色中最强。" }
    ],

    related_planets: ["venus", "saturn", "pluto"],

    canonical_path: "/astrology/planets/mars"
  }
]

export const AstrologyPlanetMap: Record<string, AstrologyPlanet> = Object.fromEntries(
  AstrologyPlanets.map(planet => [planet.id, planet])
)
