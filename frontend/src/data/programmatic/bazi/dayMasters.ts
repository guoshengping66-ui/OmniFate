export interface BaziDayMaster {
  id: string
  name_en: string
  name_zh: string
  element: "wood" | "fire" | "earth" | "metal" | "water"
  yin_yang: "yin" | "yang"
  emoji: string

  // SEO Fields
  title_en: string
  title_zh: string
  meta_description_en: string
  meta_description_zh: string
  keywords_en: string[]
  keywords_zh: string[]

  // Content Sections
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

  // FAQ
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>

  // Internal Linking
  related_masters: string[]
  related_elements: string[]

  // Canonical
  canonical_path: string
}

export const BaziDayMasters: BaziDayMaster[] = [
  {
    id: "jia-wood",
    name_en: "Jia Wood (Yang Wood)",
    name_zh: "甲木",
    element: "wood",
    yin_yang: "yang",
    emoji: "🌳",

    title_en: "Jia Wood Day Master Meaning in Bazi | Four Pillars of Destiny",
    title_zh: "甲木日主含义 | 四柱八字完整指南",
    meta_description_en: "Discover the Jia Wood day master in Bazi astrology. Learn what Jia Wood reveals about personality, career strengths, and relationships in Chinese Four Pillars of Destiny.",
    meta_description_zh: "探索八字命理中的甲木日主。了解甲木揭示的性格、事业优势和人际关系特征。",
    keywords_en: ["jia wood bazi", "jia wood day master", "yang wood personality", "bazi jia wood meaning", "four pillars jia wood"],
    keywords_zh: ["甲木八字", "甲木日主", "甲木性格", "八字甲木含义", "四柱甲木"],

    personality_en: "Jia Wood represents a tall, sturdy tree — upright, principled, and growth-oriented. People with Jia Wood as their day master are typically ambitious, straightforward, and have a strong sense of justice. They are natural leaders who grow steadily toward their goals.",
    personality_zh: "甲木代表高大挺拔的树木——正直、有原则、追求成长。甲木日主的人通常有抱负、直率，有强烈的正义感。他们是天生的领导者，稳步朝着目标成长。",
    strengths_en: "Natural leadership, strong principles, ambition, resilience, reliability, and a growth mindset. Jia Wood individuals are dependable and have a strong moral compass.",
    strengths_zh: "天生的领导力、强烈的原则性、抱负、韧性、可靠性和成长型思维。甲木人值得信赖，有强烈的道德指南针。",
    weaknesses_en: "Rigidity, stubbornness, inflexibility, and difficulty adapting to change. They may become too focused on their own principles and miss alternative perspectives.",
    weaknesses_zh: "僵化、固执、不灵活、难以适应变化。他们可能过于关注自己的原则，错过其他视角。",
    career_en: "Jia Wood individuals excel in leadership roles, education, law, management, and entrepreneurship. Their principled nature and growth mindset make them effective in roles that require integrity and long-term vision.",
    career_zh: "甲木人在领导岗位、教育、法律、管理和创业方面表现出色。他们有原则的性格和成长型思维使他们在需要诚信和长远眼光的角色中非常有效。",
    relationships_en: "In relationships, Jia Wood individuals are loyal, protective, and dependable. They value stability and commitment, but may need to learn flexibility and emotional expression to maintain harmony.",
    relationships_zh: "在感情关系中，甲木人忠诚、保护性强、可靠。他们重视稳定和承诺，但可能需要学习灵活性和情感表达以维持和谐。",
    health_en: "Jia Wood individuals should pay attention to liver health, as the wood element is associated with the liver in Traditional Chinese Medicine. Regular exercise and stress management are important for maintaining balance.",
    health_zh: "甲木人应注意肝脏健康，因为木元素在中医中与肝脏相关。定期运动和压力管理对维持平衡很重要。",

    faq_en: [
      { question: "What is a Jia Wood day master in Bazi?", answer: "Jia Wood (甲木) is the first of the 10 Heavenly Stems in Bazi, representing Yang Wood. It symbolizes a tall, sturdy tree — principled, ambitious, and growth-oriented. People born with Jia Wood as their day master are natural leaders." },
      { question: "What are Jia Wood personality traits?", answer: "Jia Wood individuals are typically ambitious, straightforward, principled, and resilient. They have strong leadership qualities and a natural growth mindset, but may struggle with rigidity and inflexibility." },
      { question: "What careers suit Jia Wood people?", answer: "Jia Wood individuals excel in leadership roles, education, law, management, and entrepreneurship. Their principled nature and growth mindset make them effective in roles requiring integrity and long-term vision." },
      { question: "How does Jia Wood relate to other elements?", answer: "Jia Wood is nourished by Water (generates Wood) and controlled by Metal (chops Wood). It generates Fire (Wood feeds Fire) and controls Earth (Wood roots penetrate Earth). These relationships influence compatibility and life patterns." }
    ],
    faq_zh: [
      { question: "什么是甲木日主？", answer: "甲木是八字十天干中的第一个，代表阳木。它象征高大挺拔的树木——有原则、有抱负、追求成长。甲木日主的人是天生的领导者。" },
      { question: "甲木的性格特征是什么？", answer: "甲木人通常有抱负、直率、有原则、有韧性。他们有强烈的领导品质和天生的成长型思维，但可能在僵化和不灵活方面有困难。" },
      { question: "甲木人适合什么职业？", answer: "甲木人在领导岗位、教育、法律、管理和创业方面表现出色。他们有原则的性格和成长型思维使他们在需要诚信和长远眼光的角色中非常有效。" },
      { question: "甲木与其他元素有什么关系？", answer: "甲木由水滋养（水生木），受金克制（金克木）。甲木生火（木生火），克土（木克土）。这些关系影响兼容性和生活模式。" }
    ],

    related_masters: ["yi-wood", "bing-fire", "ren-water"],
    related_elements: ["wood", "water"],

    canonical_path: "/bazi/day-master/jia-wood"
  },
  {
    id: "yi-wood",
    name_en: "Yi Wood (Yin Wood)",
    name_zh: "乙木",
    element: "wood",
    yin_yang: "yin",
    emoji: "🌿",

    title_en: "Yi Wood Day Master Meaning in Bazi | Four Pillars of Destiny",
    title_zh: "乙木日主含义 | 四柱八字完整指南",
    meta_description_en: "Discover the Yi Wood day master in Bazi astrology. Learn what Yi Wood reveals about flexibility, creativity, and diplomatic personality in Chinese Four Pillars of Destiny.",
    meta_description_zh: "探索八字命理中的乙木日主。了解乙木揭示的灵活性、创造力和外交性格特征。",
    keywords_en: ["yi wood bazi", "yi wood day master", "yin wood personality", "bazi yi wood meaning", "four pillars yi wood"],
    keywords_zh: ["乙木八字", "乙木日主", "乙木性格", "八字乙木含义", "四柱乙木"],

    personality_en: "Yi Wood represents a vine or flower — flexible, adaptable, and beautifully resilient. People with Yi Wood as their day master are typically creative, diplomatic, and socially graceful. They bend without breaking, thriving in diverse environments.",
    personality_zh: "乙木代表藤蔓或花朵——灵活、适应性强、美丽而有韧性。乙木日主的人通常有创造力、有外交手腕、社交优雅。他们柔韧而不折断，在各种环境中茁壮成长。",
    strengths_en: "Creativity, flexibility, diplomacy, social grace, adaptability, and artistic talent. Yi Wood individuals are natural mediators with strong interpersonal skills.",
    strengths_zh: "创造力、灵活性、外交手腕、社交优雅、适应力和艺术天赋。乙木人是天生的调解者，有强大的人际交往能力。",
    weaknesses_en: "Indecisiveness, people-pleasing, dependence on others, and vulnerability to manipulation. They may struggle with setting boundaries and standing firm in their convictions.",
    weaknesses_zh: "优柔寡断、讨好他人、依赖他人、容易被操纵。他们可能在设定界限和坚持信念方面有困难。",
    career_en: "Yi Wood individuals excel in creative fields, counseling, diplomacy, public relations, and the arts. Their natural grace and adaptability make them effective in roles requiring interpersonal skills and creativity.",
    career_zh: "乙木人在创意领域、咨询、外交、公共关系和艺术方面表现出色。他们天生的优雅和适应力使他们在需要人际交往能力和创造力的角色中非常有效。",
    relationships_en: "In relationships, Yi Wood individuals are nurturing, supportive, and emotionally attuned. They create harmonious environments but may need to develop stronger boundaries to maintain their own identity.",
    relationships_zh: "在感情关系中，乙木人善于照顾、支持、情感敏锐。他们创造和谐的环境，但可能需要建立更强的界限来保持自己的身份。",
    health_en: "Yi Wood individuals should pay attention to the gallbladder and nervous system, as these are associated with the wood element. Regular relaxation and creative outlets are important for maintaining balance.",
    health_zh: "乙木人应注意胆囊和神经系统，因为这些与木元素相关。定期放松和创造性发泄对维持平衡很重要。",

    faq_en: [
      { question: "What is a Yi Wood day master in Bazi?", answer: "Yi Wood (乙木) is the second of the 10 Heavenly Stems in Bazi, representing Yin Wood. It symbolizes a vine or flower — flexible, adaptable, and beautifully resilient. People born with Yi Wood are creative, diplomatic, and socially graceful." },
      { question: "What are Yi Wood personality traits?", answer: "Yi Wood individuals are typically creative, flexible, diplomatic, and socially graceful. They are natural mediators with strong interpersonal skills, but may struggle with indecisiveness and people-pleasing." },
      { question: "What careers suit Yi Wood people?", answer: "Yi Wood individuals excel in creative fields, counseling, diplomacy, public relations, and the arts. Their natural grace and adaptability make them effective in roles requiring interpersonal skills." },
      { question: "How does Yi Wood differ from Jia Wood?", answer: "While Jia Wood represents a tall, sturdy tree (yang, rigid, principled), Yi Wood represents a flexible vine (yin, adaptable, diplomatic). Jia leads through strength, while Yi influences through grace and flexibility." }
    ],
    faq_zh: [
      { question: "什么是乙木日主？", answer: "乙木是八字十天干中的第二个，代表阴木。它象征藤蔓或花朵——灵活、适应性强、美丽而有韧性。乙木日主的人有创造力、有外交手腕、社交优雅。" },
      { question: "乙木的性格特征是什么？", answer: "乙木人通常有创造力、灵活、有外交手腕、社交优雅。他们是天生的调解者，有强大的人际交往能力，但可能在优柔寡断和讨好他人方面有困难。" },
      { question: "乙木人适合什么职业？", answer: "乙木人在创意领域、咨询、外交、公共关系和艺术方面表现出色。他们天生的优雅和适应力使他们在需要人际交往能力的角色中非常有效。" },
      { question: "乙木与甲木有什么区别？", answer: "甲木代表高大挺拔的树木（阳、僵化、有原则），而乙木代表灵活的藤蔓（阴、适应性强、有外交手腕）。甲木通过力量领导，而乙木通过优雅和灵活性影响。" }
    ],

    related_masters: ["jia-wood", "ding-fire", "gui-water"],
    related_elements: ["wood", "water"],

    canonical_path: "/bazi/day-master/yi-wood"
  },
  {
    id: "bing-fire",
    name_en: "Bing Fire (Yang Fire)",
    name_zh: "丙火",
    element: "fire",
    yin_yang: "yang",
    emoji: "☀️",

    title_en: "Bing Fire Day Master Meaning in Bazi | Four Pillars of Destiny",
    title_zh: "丙火日主含义 | 四柱八字完整指南",
    meta_description_en: "Discover the Bing Fire day master in Bazi astrology. Learn what Bing Fire reveals about warmth, charisma, and generous personality in Chinese Four Pillars of Destiny.",
    meta_description_zh: "探索八字命理中的丙火日主。了解丙火揭示的热情、魅力和慷慨性格特征。",
    keywords_en: ["bing fire bazi", "bing fire day master", "yang fire personality", "bazi bing fire meaning", "four pillars bing fire"],
    keywords_zh: ["丙火八字", "丙火日主", "丙火性格", "八字丙火含义", "四柱丙火"],

    personality_en: "Bing Fire represents the sun — radiant, warm, and life-giving. People with Bing Fire as their day master are typically charismatic, generous, and optimistic. They naturally attract attention and inspire others with their warmth and energy.",
    personality_zh: "丙火代表太阳——光芒四射、温暖、给予生命。丙火日主的人通常有魅力、慷慨、乐观。他们自然吸引注意力，用温暖和能量激励他人。",
    strengths_en: "Charisma, generosity, optimism, natural leadership, enthusiasm, and the ability to inspire others. Bing Fire individuals are warm, approachable, and have a magnetic personality.",
    strengths_zh: "魅力、慷慨、乐观、天生的领导力、热情和激励他人的能力。丙火人温暖、平易近人，有磁性的人格魅力。",
    weaknesses_en: "Impatience, impulsiveness, ego, and difficulty sustaining long-term projects. They may become scattered or lose interest once the initial excitement fades.",
    weaknesses_zh: "缺乏耐心、冲动、自负、难以维持长期项目。他们可能在最初的兴奋消退后变得分散或失去兴趣。",
    career_en: "Bing Fire individuals excel in public-facing roles, entertainment, sales, marketing, and leadership positions. Their natural charisma and enthusiasm make them effective in roles requiring inspiration and public engagement.",
    career_zh: "丙火人在公共角色、娱乐、销售、市场和领导岗位方面表现出色。他们天生的魅力和热情使他们在需要激励和公共参与的角色中非常有效。",
    relationships_en: "In relationships, Bing Fire individuals are warm, passionate, and generous. They bring light and energy to their partnerships, but may need to learn patience and deeper emotional connection.",
    relationships_zh: "在感情关系中，丙火人温暖、热情、慷慨。他们为伴侣带来光明和能量，但可能需要学习耐心和更深层次的情感联系。",
    health_en: "Bing Fire individuals should pay attention to heart health and circulation, as the fire element is associated with the heart in Traditional Chinese Medicine. Regular cardiovascular exercise and stress management are important.",
    health_zh: "丙火人应注意心脏健康和血液循环，因为火元素在中医中与心脏相关。定期心血管运动和压力管理很重要。",

    faq_en: [
      { question: "What is a Bing Fire day master in Bazi?", answer: "Bing Fire (丙火) is the third of the 10 Heavenly Stems in Bazi, representing Yang Fire. It symbolizes the sun — radiant, warm, and life-giving. People born with Bing Fire are charismatic, generous, and naturally inspiring." },
      { question: "What are Bing Fire personality traits?", answer: "Bing Fire individuals are typically charismatic, generous, optimistic, and enthusiastic. They have natural leadership abilities and magnetic personality, but may struggle with impatience and ego." },
      { question: "What careers suit Bing Fire people?", answer: "Bing Fire individuals excel in public-facing roles, entertainment, sales, marketing, and leadership. Their natural charisma makes them effective in roles requiring inspiration and public engagement." },
      { question: "How does Bing Fire relate to other elements?", answer: "Bing Fire is nourished by Wood (Wood feeds Fire) and controlled by Water (Water extinguishes Fire). It generates Earth (Fire creates ash/Earth) and controls Metal (Fire melts Metal). These relationships influence life patterns." }
    ],
    faq_zh: [
      { question: "什么是丙火日主？", answer: "丙火是八字十天干中的第三个，代表阳火。它象征太阳——光芒四射、温暖、给予生命。丙火日主的人有魅力、慷慨、天生有激励力。" },
      { question: "丙火的性格特征是什么？", answer: "丙火人通常有魅力、慷慨、乐观、热情。他们有天生的领导能力和磁性人格，但可能在缺乏耐心和自负方面有困难。" },
      { question: "丙火人适合什么职业？", answer: "丙火人在公共角色、娱乐、销售、市场和领导岗位方面表现出色。他们天生的魅力使他们在需要激励和公共参与的角色中非常有效。" },
      { question: "丙火与其他元素有什么关系？", answer: "丙火由木滋养（木生火），受水克制（水克火）。丙火生土（火生土），克金（火克金）。这些关系影响生活模式。" }
    ],

    related_masters: ["ding-fire", "jia-wood", "wu-earth"],
    related_elements: ["fire", "wood"],

    canonical_path: "/bazi/day-master/bing-fire"
  },
  {
    id: "ding-fire",
    name_en: "Ding Fire (Yin Fire)",
    name_zh: "丁火",
    element: "fire",
    yin_yang: "yin",
    emoji: "🕯️",

    title_en: "Ding Fire Day Master Meaning in Bazi | Four Pillars of Destiny",
    title_zh: "丁火日主含义 | 四柱八字完整指南",
    meta_description_en: "Discover the Ding Fire day master in Bazi astrology. Learn what Ding Fire reveals about passion, intuition, and gentle warmth in Chinese Four Pillars of Destiny.",
    meta_description_zh: "探索八字命理中的丁火日主。了解丁火揭示的热情、直觉和温和温暖的性格特征。",
    keywords_en: ["ding fire bazi", "ding fire day master", "yin fire personality", "bazi ding fire meaning", "four pillars ding fire"],
    keywords_zh: ["丁火八字", "丁火日主", "丁火性格", "八字丁火含义", "四柱丁火"],

    personality_en: "Ding Fire represents a candle flame or lantern — gentle, warm, and illuminating. People with Ding Fire as their day master are typically intuitive, passionate, and emotionally expressive. They bring warmth and insight to those around them.",
    personality_zh: "丁火代表烛光或灯笼——温和、温暖、照亮他人。丁火日主的人通常直觉敏锐、热情、情感丰富。他们为周围的人带来温暖和洞察力。",
    strengths_en: "Intuition, passion, emotional intelligence, gentleness, creativity, and the ability to illuminate others. Ding Fire individuals are warm, insightful, and have a natural ability to understand others' feelings.",
    strengths_zh: "直觉、热情、情商、温柔、创造力和照亮他人的能力。丁火人温暖、有洞察力，有理解他人感受的天赋。",
    weaknesses_en: "Emotional instability, overthinking, moodiness, and vulnerability to burnout. They may become too absorbed in others' emotions and neglect their own needs.",
    weaknesses_zh: "情绪不稳定、过度思考、情绪化、容易精疲力竭。他们可能过于沉浸在他人的感情中，忽视自己的需求。",
    career_en: "Ding Fire individuals excel in counseling, psychology, writing, teaching, and spiritual practices. Their intuitive nature and emotional intelligence make them effective in roles requiring empathy and insight.",
    career_zh: "丁火人在咨询、心理学、写作、教学和灵性实践方面表现出色。他们直觉敏锐的性格和情商使他们在需要同理心和洞察力的角色中非常有效。",
    relationships_en: "In relationships, Ding Fire individuals are deeply emotional, intuitive, and nurturing. They create warm, intimate environments but may need to develop stronger emotional boundaries.",
    relationships_zh: "在感情关系中，丁火人情感深沉、直觉敏锐、善于照顾。他们创造温暖、亲密的环境，但可能需要建立更强的情感界限。",
    health_en: "Ding Fire individuals should pay attention to the heart, small intestine, and blood circulation. Regular relaxation, meditation, and creative outlets are important for maintaining emotional balance.",
    health_zh: "丁火人应注意心脏、小肠和血液循环。定期放松、冥想和创造性发泄对维持情绪平衡很重要。",

    faq_en: [
      { question: "What is a Ding Fire day master in Bazi?", answer: "Ding Fire (丁火) is the fourth of the 10 Heavenly Stems in Bazi, representing Yin Fire. It symbolizes a candle flame or lantern — gentle, warm, and illuminating. People born with Ding Fire are intuitive, passionate, and emotionally expressive." },
      { question: "What are Ding Fire personality traits?", answer: "Ding Fire individuals are typically intuitive, passionate, gentle, and emotionally intelligent. They have a natural ability to understand others' feelings, but may struggle with emotional instability and overthinking." },
      { question: "What careers suit Ding Fire people?", answer: "Ding Fire individuals excel in counseling, psychology, writing, teaching, and spiritual practices. Their intuitive nature makes them effective in roles requiring empathy and insight." },
      { question: "How does Ding Fire differ from Bing Fire?", answer: "While Bing Fire represents the sun (yang, radiant, public), Ding Fire represents a candle flame (yin, intimate, personal). Bing inspires through grand gestures, while Ding illuminates through gentle warmth and insight." }
    ],
    faq_zh: [
      { question: "什么是丁火日主？", answer: "丁火是八字十天干中的第四个，代表阴火。它象征烛光或灯笼——温和、温暖、照亮他人。丁火日主的人直觉敏锐、热情、情感丰富。" },
      { question: "丁火的性格特征是什么？", answer: "丁火人通常直觉敏锐、热情、温柔、有情商。他们有理解他人感受的天赋，但可能在情绪不稳定和过度思考方面有困难。" },
      { question: "丁火人适合什么职业？", answer: "丁火人在咨询、心理学、写作、教学和灵性实践方面表现出色。他们直觉敏锐的性格使他们在需要同理心和洞察力的角色中非常有效。" },
      { question: "丁火与丙火有什么区别？", answer: "丙火代表太阳（阳、光芒四射、公开），而丁火代表烛光（阴、亲密、个人）。丙火通过宏大的姿态激励，而丁火通过温和的温暖和洞察力照亮。" }
    ],

    related_masters: ["bing-fire", "yi-wood", "ji-earth"],
    related_elements: ["fire", "wood"],

    canonical_path: "/bazi/day-master/ding-fire"
  },
  {
    id: "wu-earth",
    name_en: "Wu Earth (Yang Earth)",
    name_zh: "戊土",
    element: "earth",
    yin_yang: "yang",
    emoji: "⛰️",

    title_en: "Wu Earth Day Master Meaning in Bazi | Four Pillars of Destiny",
    title_zh: "戊土日主含义 | 四柱八字完整指南",
    meta_description_en: "Discover the Wu Earth day master in Bazi astrology. Learn what Wu Earth reveals about stability, reliability, and grounded personality in Chinese Four Pillars of Destiny.",
    meta_description_zh: "探索八字命理中的戊土日主。了解戊土揭示的稳定、可靠和脚踏实地的性格特征。",
    keywords_en: ["wu earth bazi", "wu earth day master", "yang earth personality", "bazi wu earth meaning", "four pillars wu earth"],
    keywords_zh: ["戊土八字", "戊土日主", "戊土性格", "八字戊土含义", "四柱戊土"],

    personality_en: "Wu Earth represents a mountain — stable, reliable, and immovable. People with Wu Earth as their day master are typically trustworthy, patient, and grounded. They provide a solid foundation for others and rarely waver in their commitments.",
    personality_zh: "戊土代表大山——稳定、可靠、不可动摇。戊土日主的人通常值得信赖、耐心、脚踏实地。他们为他人提供坚实的基础，在承诺上很少动摇。",
    strengths_en: "Stability, reliability, patience, trustworthiness, and a strong sense of responsibility. Wu Earth individuals are dependable and provide a solid foundation for those around them.",
    strengths_zh: "稳定、可靠、耐心、值得信赖和强烈的责任感。戊土人值得信赖，为周围的人提供坚实的基础。",
    weaknesses_en: "Stubbornness, resistance to change, slowness to adapt, and difficulty expressing emotions. They may become too rigid in their ways and resist necessary transformations.",
    weaknesses_zh: "固执、抗拒变化、适应缓慢、难以表达情感。他们可能在自己的方式上过于僵化，抗拒必要的转变。",
    career_en: "Wu Earth individuals excel in stable, long-term careers such as real estate, banking, agriculture, management, and government service. Their reliability and patience make them effective in roles requiring consistency and trust.",
    career_zh: "戊土人在稳定、长期的职业中表现出色，如房地产、银行、农业、管理和政府服务。他们可靠和耐心的性格使他们在需要一致性和信任的角色中非常有效。",
    relationships_en: "In relationships, Wu Earth individuals are loyal, stable, and dependable partners. They value long-term commitment and provide security, but may need to learn emotional expressiveness and flexibility.",
    relationships_zh: "在感情关系中，戊土人忠诚、稳定、可靠。他们重视长期承诺并提供安全感，但可能需要学习情感表达和灵活性。",
    health_en: "Wu Earth individuals should pay attention to the stomach, spleen, and digestive system, as the earth element is associated with these organs in Traditional Chinese Medicine. A balanced diet and regular exercise are important.",
    health_zh: "戊土人应注意胃、脾和消化系统，因为土元素在中医中与这些器官相关。均衡的饮食和定期运动很重要。",

    faq_en: [
      { question: "What is a Wu Earth day master in Bazi?", answer: "Wu Earth (戊土) is the fifth of the 10 Heavenly Stems in Bazi, representing Yang Earth. It symbolizes a mountain — stable, reliable, and immovable. People born with Wu Earth are trustworthy, patient, and grounded." },
      { question: "What are Wu Earth personality traits?", answer: "Wu Earth individuals are typically stable, reliable, patient, and responsible. They provide a solid foundation for others but may struggle with stubbornness and resistance to change." },
      { question: "What careers suit Wu Earth people?", answer: "Wu Earth individuals excel in stable careers like real estate, banking, agriculture, management, and government service. Their reliability makes them effective in roles requiring consistency." },
      { question: "How does Wu Earth relate to other elements?", answer: "Wu Earth is nourished by Fire (Fire creates Earth) and controlled by Wood (Wood roots penetrate Earth). It generates Metal (Earth contains minerals) and controls Water (Earth dams Water). These relationships influence life patterns." }
    ],
    faq_zh: [
      { question: "什么是戊土日主？", answer: "戊土是八字十天干中的第五个，代表阳土。它象征大山——稳定、可靠、不可动摇。戊土日主的人值得信赖、耐心、脚踏实地。" },
      { question: "戊土的性格特征是什么？", answer: "戊土人通常稳定、可靠、耐心、有责任感。他们为他人提供坚实的基础，但可能在固执和抗拒变化方面有困难。" },
      { question: "戊土人适合什么职业？", answer: "戊土人在稳定的职业中表现出色，如房地产、银行、农业、管理和政府服务。他们可靠的性格使他们在需要一致性的角色中非常有效。" },
      { question: "戊土与其他元素有什么关系？", answer: "戊土由火滋养（火生土），受木克制（木克土）。戊土生金（土生金），克水（土克水）。这些关系影响生活模式。" }
    ],

    related_masters: ["ji-earth", "bing-fire", "geng-metal"],
    related_elements: ["earth", "fire"],

    canonical_path: "/bazi/day-master/wu-earth"
  }
]

export const BaziDayMasterMap: Record<string, BaziDayMaster> = Object.fromEntries(
  BaziDayMasters.map(master => [master.id, master])
)
