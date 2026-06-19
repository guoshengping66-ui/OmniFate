export interface FiveElement {
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
  health_en: string
  health_zh: string

  // Associations
  season: string
  direction: string
  color: string
  taste: string
  organ: string

  // FAQ
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>

  // Internal Linking
  generates: string
  controls: string
  generated_by: string
  controlled_by: string

  // Canonical
  canonical_path: string
}

export const FiveElements: FiveElement[] = [
  {
    id: "wood",
    name_en: "Wood (Mu)",
    name_zh: "木",
    emoji: "🌳",

    title_en: "Wood Element in Chinese Five Elements | Wuxing Guide",
    title_zh: "五行之木 | 五行完整指南",
    meta_description_en: "Discover the Wood element in Chinese Wuxing philosophy. Learn what Wood reveals about growth, creativity, and benevolence in the Five Elements system.",
    meta_description_zh: "探索五行哲学中的木元素。了解木揭示的成长、创造力和仁慈特征。",
    keywords_en: ["wood element chinese", "wuxing wood", "five elements wood", "wood element personality", "chinese philosophy wood"],
    keywords_zh: ["木元素五行", "五行木", "五行之木", "木元素性格", "中国哲学木"],

    overview_en: "Wood represents growth, expansion, and new beginnings. It is associated with spring, the east, and the color green. In Chinese philosophy, Wood symbolizes creativity, flexibility, and the drive to push upward and outward, like a tree reaching for sunlight.",
    overview_zh: "木代表成长、扩张和新的开始。它与春季、东方和绿色相关。在中国哲学中，木象征创造力、灵活性和向上向外推的动力，就像一棵树伸向阳光。",
    personality_en: "People with strong Wood element influence are typically creative, ambitious, and growth-oriented. They are natural leaders who inspire others, embrace change, and have a strong sense of justice and benevolence.",
    personality_zh: "木元素影响强的人通常有创造力、有抱负、追求成长。他们是天生的领导者，激励他人，拥抱变化，有强烈的正义感和仁慈心。",
    strengths_en: "Creativity, ambition, flexibility, benevolence, leadership, and the ability to inspire growth in others. They are natural innovators who push boundaries.",
    strengths_zh: "创造力、抱负、灵活性、仁慈、领导力和激励他人成长的能力。他们是天生的创新者，推动边界。",
    weaknesses_en: "Stubbornness, impulsiveness, anger issues, and difficulty letting go. They may become too rigid in their growth patterns and resist necessary endings.",
    weaknesses_zh: "固执、冲动、愤怒问题、难以放手。他们可能在成长模式上过于僵化，抗拒必要的结束。",
    career_en: "Wood element individuals excel in creative fields, education, publishing, environmental work, and leadership roles. Their natural creativity and growth mindset make them effective in innovation-driven industries.",
    career_zh: "木元素人在创意领域、教育、出版、环保工作和领导岗位方面表现出色。他们天生的创造力和成长型思维使他们在创新驱动的行业中非常有效。",
    relationships_en: "In relationships, Wood element individuals are nurturing, supportive, and growth-oriented. They help their partners evolve but may need to learn patience and acceptance of others' pace.",
    relationships_zh: "在感情关系中，木元素人善于照顾、支持、注重成长。他们帮助伴侣成长，但可能需要学习耐心和接受他人的节奏。",
    health_en: "Wood element is associated with the liver and gallbladder in Traditional Chinese Medicine. People with strong Wood should watch for liver issues, eye problems, and tendons/ligaments health.",
    health_zh: "木元素在中医中与肝脏和胆囊相关。木强的人应注意肝脏问题、眼睛问题和肌腱/韧带健康。",

    season: "Spring",
    direction: "East",
    color: "Green",
    taste: "Sour",
    organ: "Liver, Gallbladder",

    faq_en: [
      { question: "What does the Wood element represent in Chinese philosophy?", answer: "Wood represents growth, expansion, new beginnings, and creativity. It is associated with spring, the east, the color green, and the organs liver and gallbladder. Wood energy pushes upward and outward, like a growing tree." },
      { question: "What are Wood element personality traits?", answer: "Wood element people are typically creative, ambitious, flexible, and benevolent. They are natural leaders who embrace change and have a strong sense of justice. They inspire growth in others." },
      { question: "What careers suit Wood element people?", answer: "Wood element individuals excel in creative fields, education, publishing, environmental work, and leadership roles. Their natural creativity and growth mindset make them effective in innovation-driven industries." },
      { question: "How does Wood element affect health?", answer: "Wood element is associated with the liver and gallbladder. People with strong Wood should watch for liver issues, eye problems, and tendon/ligament health. Regular exercise and stress management are important." }
    ],
    faq_zh: [
      { question: "木元素在中国哲学中代表什么？", answer: "木代表成长、扩张、新的开始和创造力。它与春季、东方、绿色和肝脏、胆囊相关。木的能量向上向外推进，就像一棵生长的树。" },
      { question: "木元素的性格特征是什么？", answer: "木元素人通常有创造力、有抱负、灵活、仁慈。他们是天生的领导者，拥抱变化，有强烈的正义感。他们激励他人成长。" },
      { question: "木元素人适合什么职业？", answer: "木元素人在创意领域、教育、出版、环保工作和领导岗位方面表现出色。他们天生的创造力和成长型思维使他们在创新驱动的行业中非常有效。" },
      { question: "木元素如何影响健康？", answer: "木元素与肝脏和胆囊相关。木强的人应注意肝脏问题、眼睛问题和肌腱/韧带健康。定期运动和压力管理很重要。" }
    ],

    generates: "fire",
    controls: "earth",
    generated_by: "water",
    controlled_by: "metal",

    canonical_path: "/five-elements/wood"
  },
  {
    id: "fire",
    name_en: "Fire (Huo)",
    name_zh: "火",
    emoji: "🔥",

    title_en: "Fire Element in Chinese Five Elements | Wuxing Guide",
    title_zh: "五行之火 | 五行完整指南",
    meta_description_en: "Discover the Fire element in Chinese Wuxing philosophy. Learn what Fire reveals about passion, charisma, and transformation in the Five Elements system.",
    meta_description_zh: "探索五行哲学中的火元素。了解火揭示的热情、魅力和转变特征。",
    keywords_en: ["fire element chinese", "wuxing fire", "five elements fire", "fire element personality", "chinese philosophy fire"],
    keywords_zh: ["火元素五行", "五行火", "五行之火", "火元素性格", "中国哲学火"],

    overview_en: "Fire represents passion, transformation, and radiance. It is associated with summer, the south, and the color red. In Chinese philosophy, Fire symbolizes warmth, enthusiasm, and the power to illuminate and transform everything it touches.",
    overview_zh: "火代表热情、转变和光芒。它与夏季、南方和红色相关。在中国哲学中，火象征温暖、热情和照亮及转变它所触及一切的力量。",
    personality_en: "People with strong Fire element influence are typically charismatic, passionate, and expressive. They naturally attract attention, inspire others with their enthusiasm, and have a gift for communication and leadership.",
    personality_zh: "火元素影响强的人通常有魅力、热情、善于表达。他们自然吸引注意力，用热情激励他人，有沟通和领导的天赋。",
    strengths_en: "Charisma, passion, enthusiasm, communication skills, natural leadership, and the ability to inspire and transform. They are magnetic personalities who light up any room.",
    strengths_zh: "魅力、热情、沟通技巧、天生的领导力、激励和转变的能力。他们是磁性人格，照亮任何房间。",
    weaknesses_en: "Impulsiveness, impatience, ego, burnout, and difficulty sustaining long-term focus. They may become scattered or lose interest once initial excitement fades.",
    weaknesses_zh: "冲动、缺乏耐心、自负、精疲力竭、难以维持长期专注。他们可能在最初的兴奋消退后变得分散或失去兴趣。",
    career_en: "Fire element individuals excel in entertainment, marketing, public relations, sales, and leadership roles. Their natural charisma and communication skills make them effective in public-facing positions.",
    career_zh: "火元素人在娱乐、市场、公共关系、销售和领导岗位方面表现出色。他们天生的魅力和沟通技巧使他们在公共职位中非常有效。",
    relationships_en: "In relationships, Fire element individuals are passionate, expressive, and exciting. They bring warmth and energy to partnerships but may need to learn patience and deeper emotional connection.",
    relationships_zh: "在感情关系中，火元素人热情、善于表达、令人兴奋。他们为伴侣带来温暖和能量，但可能需要学习耐心和更深层次的情感联系。",
    health_en: "Fire element is associated with the heart and small intestine in Traditional Chinese Medicine. People with strong Fire should watch for heart issues, blood circulation, and mental health balance.",
    health_zh: "火元素在中医中与心脏和小肠相关。火强的人应注意心脏问题、血液循环和心理健康平衡。",

    season: "Summer",
    direction: "South",
    color: "Red",
    taste: "Bitter",
    organ: "Heart, Small Intestine",

    faq_en: [
      { question: "What does the Fire element represent in Chinese philosophy?", answer: "Fire represents passion, transformation, radiance, and enthusiasm. It is associated with summer, the south, the color red, and the organs heart and small intestine. Fire energy illuminates and transforms." },
      { question: "What are Fire element personality traits?", answer: "Fire element people are typically charismatic, passionate, expressive, and inspiring. They have natural leadership abilities and communication skills, but may struggle with impulsiveness and ego." },
      { question: "What careers suit Fire element people?", answer: "Fire element individuals excel in entertainment, marketing, public relations, sales, and leadership roles. Their natural charisma makes them effective in public-facing positions." },
      { question: "How does Fire element affect health?", answer: "Fire element is associated with the heart and small intestine. People with strong Fire should watch for heart issues, blood circulation, and mental health balance. Regular cardiovascular exercise is important." }
    ],
    faq_zh: [
      { question: "火元素在中国哲学中代表什么？", answer: "火代表热情、转变、光芒和热情。它与夏季、南方、红色和心脏、小肠相关。火的能量照亮和转变。" },
      { question: "火元素的性格特征是什么？", answer: "火元素人通常有魅力、热情、善于表达、有激励力。他们有天生的领导能力和沟通技巧，但可能在冲动和自负方面有困难。" },
      { question: "火元素人适合什么职业？", answer: "火元素人在娱乐、市场、公共关系、销售和领导岗位方面表现出色。他们天生的魅力使他们在公共职位中非常有效。" },
      { question: "火元素如何影响健康？", answer: "火元素与心脏和小肠相关。火强的人应注意心脏问题、血液循环和心理健康平衡。定期心血管运动很重要。" }
    ],

    generates: "earth",
    controls: "metal",
    generated_by: "wood",
    controlled_by: "water",

    canonical_path: "/five-elements/fire"
  },
  {
    id: "earth",
    name_en: "Earth (Tu)",
    name_zh: "土",
    emoji: "⛰️",

    title_en: "Earth Element in Chinese Five Elements | Wuxing Guide",
    title_zh: "五行之土 | 五行完整指南",
    meta_description_en: "Discover the Earth element in Chinese Wuxing philosophy. Learn what Earth reveals about stability, nurturing, and groundedness in the Five Elements system.",
    meta_description_zh: "探索五行哲学中的土元素。了解土揭示的稳定、滋养和脚踏实地特征。",
    keywords_en: ["earth element chinese", "wuxing earth", "five elements earth", "earth element personality", "chinese philosophy earth"],
    keywords_zh: ["土元素五行", "五行土", "五行之土", "土元素性格", "中国哲学土"],

    overview_en: "Earth represents stability, nurturing, and centrality. It is associated with late summer, the center, and the color yellow/brown. In Chinese philosophy, Earth symbolizes reliability, patience, and the grounding force that supports all other elements.",
    overview_zh: "土代表稳定、滋养和中心。它与夏末、中央和黄色/棕色相关。在中国哲学中，土象征可靠、耐心和支持所有其他元素的根基力量。",
    personality_en: "People with strong Earth element influence are typically reliable, patient, and nurturing. They provide stability for others, value traditions, and have a strong sense of responsibility and duty.",
    personality_zh: "土元素影响强的人通常可靠、耐心、善于滋养。他们为他人提供稳定性，重视传统，有强烈的责任感和使命感。",
    strengths_en: "Stability, reliability, patience, nurturing nature, practicality, and the ability to provide support. They are dependable and create solid foundations for others.",
    strengths_zh: "稳定、可靠、耐心、滋养的天性、务实和提供支持的能力。他们值得信赖，为他人创造坚实的基础。",
    weaknesses_en: "Stubbornness, resistance to change, slowness, and over-attachment to material things. They may become too rigid and resist necessary transformations.",
    weaknesses_zh: "固执、抗拒变化、缓慢、过度依恋物质。他们可能过于僵化，抗拒必要的转变。",
    career_en: "Earth element individuals excel in agriculture, real estate, banking, management, and care-giving roles. Their reliability and patience make them effective in roles requiring consistency and nurturing.",
    career_zh: "土元素人在农业、房地产、银行、管理和照顾角色方面表现出色。他们可靠和耐心的性格使他们在需要一致性和滋养的角色中非常有效。",
    relationships_en: "In relationships, Earth element individuals are loyal, stable, and supportive. They create secure, nurturing environments but may need to learn flexibility and emotional expressiveness.",
    relationships_zh: "在感情关系中，土元素人忠诚、稳定、支持性强。他们创造安全、滋养的环境，但可能需要学习灵活性和情感表达。",
    health_en: "Earth element is associated with the stomach, spleen, and digestive system in Traditional Chinese Medicine. People with strong Earth should watch for digestive issues and maintain a balanced diet.",
    health_zh: "土元素在中医中与胃、脾和消化系统相关。土强的人应注意消化问题，保持均衡饮食。",

    season: "Late Summer",
    direction: "Center",
    color: "Yellow/Brown",
    taste: "Sweet",
    organ: "Stomach, Spleen",

    faq_en: [
      { question: "What does the Earth element represent in Chinese philosophy?", answer: "Earth represents stability, nurturing, centrality, and reliability. It is associated with late summer, the center, the colors yellow/brown, and the organs stomach and spleen. Earth is the grounding force that supports all elements." },
      { question: "What are Earth element personality traits?", answer: "Earth element people are typically reliable, patient, nurturing, and practical. They provide stability for others and have a strong sense of responsibility, but may struggle with stubbornness and resistance to change." },
      { question: "What careers suit Earth element people?", answer: "Earth element individuals excel in agriculture, real estate, banking, management, and care-giving roles. Their reliability makes them effective in roles requiring consistency and nurturing." },
      { question: "How does Earth element affect health?", answer: "Earth element is associated with the stomach, spleen, and digestive system. People with strong Earth should watch for digestive issues and maintain a balanced diet with regular meal times." }
    ],
    faq_zh: [
      { question: "土元素在中国哲学中代表什么？", answer: "土代表稳定、滋养、中心和可靠。它与夏末、中央、黄色/棕色和胃、脾相关。土是支持所有元素的根基力量。" },
      { question: "土元素的性格特征是什么？", answer: "土元素人通常可靠、耐心、善于滋养、务实。他们为他人提供稳定性，有强烈的责任感，但可能在固执和抗拒变化方面有困难。" },
      { question: "土元素人适合什么职业？", answer: "土元素人在农业、房地产、银行、管理和照顾角色方面表现出色。他们可靠的性格使他们在需要一致性和滋养的角色中非常有效。" },
      { question: "土元素如何影响健康？", answer: "土元素与胃、脾和消化系统相关。土强的人应注意消化问题，保持均衡饮食和规律的用餐时间。" }
    ],

    generates: "metal",
    controls: "water",
    generated_by: "fire",
    controlled_by: "wood",

    canonical_path: "/five-elements/earth"
  },
  {
    id: "metal",
    name_en: "Metal (Jin)",
    name_zh: "金",
    emoji: "⚔️",

    title_en: "Metal Element in Chinese Five Elements | Wuxing Guide",
    title_zh: "五行之金 | 五行完整指南",
    meta_description_en: "Discover the Metal element in Chinese Wuxing philosophy. Learn what Metal reveals about precision, discipline, and righteousness in the Five Elements system.",
    meta_description_zh: "探索五行哲学中的金元素。了解金揭示的精确、纪律和正义特征。",
    keywords_en: ["metal element chinese", "wuxing metal", "five elements metal", "metal element personality", "chinese philosophy metal"],
    keywords_zh: ["金元素五行", "五行金", "五行之金", "金元素性格", "中国哲学金"],

    overview_en: "Metal represents precision, discipline, and righteousness. It is associated with autumn, the west, and the color white/silver/gold. In Chinese philosophy, Metal symbolizes structure, focus, and the ability to cut through confusion with clarity.",
    overview_zh: "金代表精确、纪律和正义。它与秋季、西方和白色/银色/金色相关。在中国哲学中，金象征结构、专注和用清晰切割混乱的能力。",
    personality_en: "People with strong Metal element influence are typically disciplined, organized, and principled. They value justice, have high standards, and excel in roles requiring precision, logic, and attention to detail.",
    personality_zh: "金元素影响强的人通常有纪律、有条理、有原则。他们重视正义，有高标准，在需要精确、逻辑和注重细节的角色中表现出色。",
    strengths_en: "Discipline, precision, organization, justice, loyalty, and the ability to create structure. They are principled and excel in roles requiring focus and attention to detail.",
    strengths_zh: "纪律、精确、组织、正义、忠诚和创造结构的能力。他们有原则，在需要专注和注重细节的角色中表现出色。",
    weaknesses_en: "Rigidity, excessive criticism, coldness, and difficulty adapting to change. They may become too focused on rules and miss the bigger picture or emotional needs of others.",
    weaknesses_zh: "僵化、过度批评、冷漠、难以适应变化。他们可能过于关注规则，错过大局或他人的情感需求。",
    career_en: "Metal element individuals excel in finance, law, engineering, military, and precision-based fields. Their discipline and attention to detail make them effective in roles requiring accuracy and structure.",
    career_zh: "金元素人在金融、法律、工程、军事和精密领域方面表现出色。他们纪律严明和注重细节的性格使他们在需要准确性和结构的角色中非常有效。",
    relationships_en: "In relationships, Metal element individuals are loyal, protective, and dependable. They value commitment and structure but may need to learn warmth, flexibility, and emotional expression.",
    relationships_zh: "在感情关系中，金元素人忠诚、保护性强、可靠。他们重视承诺和结构，但可能需要学习温暖、灵活性和情感表达。",
    health_en: "Metal element is associated with the lungs, large intestine, and skin in Traditional Chinese Medicine. People with strong Metal should watch for respiratory issues, skin problems, and emotional suppression.",
    health_zh: "金元素在中医中与肺、大肠和皮肤相关。金强的人应注意呼吸系统问题、皮肤问题和情绪压抑。",

    season: "Autumn",
    direction: "West",
    color: "White/Silver/Gold",
    taste: "Spicy",
    organ: "Lungs, Large Intestine",

    faq_en: [
      { question: "What does the Metal element represent in Chinese philosophy?", answer: "Metal represents precision, discipline, righteousness, and structure. It is associated with autumn, the west, the colors white/silver/gold, and the organs lungs and large intestine. Metal energy brings clarity and focus." },
      { question: "What are Metal element personality traits?", answer: "Metal element people are typically disciplined, organized, principled, and precise. They value justice and have high standards, but may struggle with rigidity and excessive criticism." },
      { question: "What careers suit Metal element people?", answer: "Metal element individuals excel in finance, law, engineering, military, and precision-based fields. Their discipline and attention to detail make them effective in roles requiring accuracy." },
      { question: "How does Metal element affect health?", answer: "Metal element is associated with the lungs, large intestine, and skin. People with strong Metal should watch for respiratory issues, skin problems, and practice emotional expression to avoid suppression." }
    ],
    faq_zh: [
      { question: "金元素在中国哲学中代表什么？", answer: "金代表精确、纪律、正义和结构。它与秋季、西方、白色/银色/金色和肺、大肠相关。金的能量带来清晰和专注。" },
      { question: "金元素的性格特征是什么？", answer: "金元素人通常有纪律、有条理、有原则、精确。他们重视正义，有高标准，但可能在僵化和过度批评方面有困难。" },
      { question: "金元素人适合什么职业？", answer: "金元素人在金融、法律、工程、军事和精密领域方面表现出色。他们纪律严明的性格使他们在需要准确性的角色中非常有效。" },
      { question: "金元素如何影响健康？", answer: "金元素与肺、大肠和皮肤相关。金强的人应注意呼吸系统问题、皮肤问题，并练习情感表达以避免压抑。" }
    ],

    generates: "water",
    controls: "wood",
    generated_by: "earth",
    controlled_by: "fire",

    canonical_path: "/five-elements/metal"
  },
  {
    id: "water",
    name_en: "Water (Shui)",
    name_zh: "水",
    emoji: "💧",

    title_en: "Water Element in Chinese Five Elements | Wuxing Guide",
    title_zh: "五行之水 | 五行完整指南",
    meta_description_en: "Discover the Water element in Chinese Wuxing philosophy. Learn what Water reveals about wisdom, adaptability, and intuition in the Five Elements system.",
    meta_description_zh: "探索五行哲学中的水元素。了解水揭示的智慧、适应性和直觉特征。",
    keywords_en: ["water element chinese", "wuxing water", "five elements water", "water element personality", "chinese philosophy water"],
    keywords_zh: ["水元素五行", "五行水", "五行之水", "水元素性格", "中国哲学水"],

    overview_en: "Water represents wisdom, adaptability, and flow. It is associated with winter, the north, and the color black/dark blue. In Chinese philosophy, Water symbolizes depth, intuition, and the ability to navigate around obstacles with ease.",
    overview_zh: "水代表智慧、适应性和流动。它与冬季、北方和黑色/深蓝色相关。在中国哲学中，水象征深度、直觉和轻松绕过障碍的能力。",
    personality_en: "People with strong Water element influence are typically wise, intuitive, and adaptable. They are deep thinkers who flow around obstacles, have strong analytical abilities, and excel in understanding complex systems.",
    personality_zh: "水元素影响强的人通常有智慧、直觉敏锐、适应性强。他们是深思熟虑的思考者，能绕过障碍流动，有强大的分析能力，擅长理解复杂系统。",
    strengths_en: "Wisdom, intuition, adaptability, deep thinking, analytical abilities, and the ability to navigate complex situations. They are natural problem-solvers who find creative solutions.",
    strengths_zh: "智慧、直觉、适应性、深思、分析能力和驾驭复杂情况的能力。他们是天生的问题解决者，能找到创造性的解决方案。",
    weaknesses_en: "Indecisiveness, emotional instability, fear, and tendency toward depression. They may become overwhelmed by emotions or withdraw from challenges.",
    weaknesses_zh: "优柔寡断、情绪不稳定、恐惧、倾向于抑郁。他们可能被情绪压倒或从挑战中退缩。",
    career_en: "Water element individuals excel in research, science, technology, consulting, and strategic roles. Their analytical nature and adaptability make them effective in roles requiring deep thinking and problem-solving.",
    career_zh: "水元素人在研究、科学、技术、咨询和战略岗位方面表现出色。他们善于分析的性格和适应力使他们在需要深度思考和解决问题的角色中非常有效。",
    relationships_en: "In relationships, Water element individuals are deep, intuitive, and emotionally connected. They create meaningful bonds but may need to develop more stability and open communication.",
    relationships_zh: "在感情关系中，水元素人深沉、直觉敏锐、情感联系紧密。他们创造有意义的联系，但可能需要发展更多稳定性和开放沟通。",
    health_en: "Water element is associated with the kidneys, bladder, and bones in Traditional Chinese Medicine. People with strong Water should watch for kidney issues, bone health, and emotional balance.",
    health_zh: "水元素在中医中与肾脏、膀胱和骨骼相关。水强的人应注意肾脏问题、骨骼健康和情绪平衡。",

    season: "Winter",
    direction: "North",
    color: "Black/Dark Blue",
    taste: "Salty",
    organ: "Kidneys, Bladder",

    faq_en: [
      { question: "What does the Water element represent in Chinese philosophy?", answer: "Water represents wisdom, adaptability, flow, and intuition. It is associated with winter, the north, the colors black/dark blue, and the organs kidneys and bladder. Water energy flows around obstacles with ease." },
      { question: "What are Water element personality traits?", answer: "Water element people are typically wise, intuitive, adaptable, and deep thinkers. They excel at understanding complex systems but may struggle with indecisiveness and emotional instability." },
      { question: "What careers suit Water element people?", answer: "Water element individuals excel in research, science, technology, consulting, and strategic roles. Their analytical nature makes them effective in roles requiring deep thinking and problem-solving." },
      { question: "How does Water element affect health?", answer: "Water element is associated with the kidneys, bladder, and bones. People with strong Water should watch for kidney issues, bone health, and maintain emotional balance through meditation and reflection." }
    ],
    faq_zh: [
      { question: "水元素在中国哲学中代表什么？", answer: "水代表智慧、适应性、流动和直觉。它与冬季、北方、黑色/深蓝色和肾脏、膀胱相关。水的能量轻松绕过障碍流动。" },
      { question: "水元素的性格特征是什么？", answer: "水元素人通常有智慧、直觉敏锐、适应性强、深思熟虑。他们擅长理解复杂系统，但可能在优柔寡断和情绪不稳定方面有困难。" },
      { question: "水元素人适合什么职业？", answer: "水元素人在研究、科学、技术、咨询和战略岗位方面表现出色。他们善于分析的性格使他们在需要深度思考和解决问题的角色中非常有效。" },
      { question: "水元素如何影响健康？", answer: "水元素与肾脏、膀胱和骨骼相关。水强的人应注意肾脏问题、骨骼健康，并通过冥想和反思维持情绪平衡。" }
    ],

    generates: "wood",
    controls: "fire",
    generated_by: "metal",
    controlled_by: "earth",

    canonical_path: "/five-elements/water"
  }
]

export const FiveElementMap: Record<string, FiveElement> = Object.fromEntries(
  FiveElements.map(element => [element.id, element])
)
