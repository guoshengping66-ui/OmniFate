export interface TarotCard {
  id: string
  name_en: string
  name_zh: string
  number: number
  arcana: "major" | "minor"
  suit?: "wands" | "cups" | "swords" | "pentacles"
  emoji: string
  title_en: string
  title_zh: string
  meta_description_en: string
  meta_description_zh: string
  keywords_en: string[]
  keywords_zh: string[]
  upright_meaning_en: string
  upright_meaning_zh: string
  reversed_meaning_en: string
  reversed_meaning_zh: string
  love_meaning_en: string
  love_meaning_zh: string
  career_meaning_en: string
  career_meaning_zh: string
  advice_en: string
  advice_zh: string
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>
  related_cards: string[]
  canonical_path: string
}

export const TarotCards: TarotCard[] = [
  // Major Arcana
  {
    id: "the-fool",
    name_en: "The Fool",
    name_zh: "愚者",
    number: 0,
    arcana: "major",
    emoji: "🃏",
    title_en: "The Fool Tarot Card: Meaning, Upright & Reversed",
    title_zh: "愚者塔罗牌：正位与逆位含义详解",
    meta_description_en: "Discover The Fool tarot card meaning in love, career, and life. Learn about the upright and reversed positions and what this card signals in your reading.",
    meta_description_zh: "探索愚者塔罗牌在爱情、事业和生活中的含义。了解正位和逆位以及这张牌在你的解读中预示着什么。",
    keywords_en: ["the fool tarot", "fool tarot meaning", "fool card meaning", "tarot fool upright", "tarot fool reversed"],
    keywords_zh: ["愚者塔罗牌", "愚者牌含义", "塔罗牌愚者正位", "塔罗牌愚者逆位"],
    upright_meaning_en: "The Fool represents new beginnings, innocence, spontaneity, and a free spirit. This card encourages you to take a leap of faith and embrace new opportunities with an open mind. It suggests that now is the time to start fresh and trust the journey ahead.",
    upright_meaning_zh: "愚者代表新的开始、纯真、自发性和自由精神。这张牌鼓励你采取信仰之跃，以开放的心态拥抱新机会。它表明现在是重新开始并信任前方旅程的时候了。",
    reversed_meaning_en: "Reversed, The Fool can indicate recklessness, risk-taking without thinking, or fear of taking the first step. You may be holding back from a new opportunity due to fear or overthinking.",
    reversed_meaning_zh: "逆位时，愚者可能表示鲁莽、不加思考地冒险，或害怕迈出第一步。你可能因为恐惧或过度思考而回避新的机会。",
    love_meaning_en: "In love, The Fool suggests new romantic beginnings, a fresh start in a relationship, or taking a chance on love. It encourages you to be open and vulnerable.",
    love_meaning_zh: "在爱情中，愚者暗示新的浪漫开始、关系的新起点，或在爱情上冒险。它鼓励你开放和脆弱。",
    career_meaning_en: "In career, The Fool suggests new opportunities, starting a new job or project, and taking calculated risks. It's a sign to embrace change and innovation.",
    career_meaning_zh: "在事业中，愚者暗示新的机会，开始新工作或项目，以及承担经过计算的风险。它是拥抱变化和创新的信号。",
    advice_en: "Take the leap. Trust yourself and the universe. New beginnings require courage, and this is your moment to start fresh with optimism and wonder.",
    advice_zh: "勇敢跃出。相信自己和宇宙。新的开始需要勇气，这是你以乐观和好奇重新开始的时刻。",
    faq_en: [
      { question: "What does The Fool tarot card mean?", answer: "The Fool represents new beginnings, innocence, and taking a leap of faith. It encourages embracing new opportunities with an open mind." },
      { question: "Is The Fool a positive card?", answer: "Yes, The Fool is generally positive, representing fresh starts and exciting possibilities. However, it can also warn against recklessness when reversed." },
      { question: "What does The Fool mean in love?", answer: "In love, The Fool suggests new romantic beginnings, taking a chance on love, or starting fresh in a relationship." }
    ],
    faq_zh: [
      { question: "愚者塔罗牌是什么意思？", answer: "愚者代表新的开始、纯真和信仰之跃。它鼓励以开放的心态拥抱新机会。" },
      { question: "愚者是积极的牌吗？", answer: "是的，愚者通常是积极的，代表新的开始和令人兴奋的可能性。然而，逆位时也可能警告鲁莽。" },
      { question: "愚者在爱情中是什么意思？", answer: "在爱情中，愚者暗示新的浪漫开始，在爱情上冒险，或在关系中重新开始。" }
    ],
    related_cards: ["the-magician", "the-empress", "the-world"],
    canonical_path: "/tarot/cards/the-fool",
  },
  {
    id: "the-magician",
    name_en: "The Magician",
    name_zh: "魔术师",
    number: 1,
    arcana: "major",
    emoji: "🪄",
    title_en: "The Magician Tarot Card: Meaning, Upright & Reversed",
    title_zh: "魔术师塔罗牌：正位与逆位含义详解",
    meta_description_en: "Discover The Magician tarot card meaning in love, career, and life. Learn about manifestation, power, and new opportunities.",
    meta_description_zh: "探索魔术师塔罗牌在爱情、事业和生活中的含义。了解显化、力量和新机会。",
    keywords_en: ["the magician tarot", "magician tarot meaning", "magician card meaning", "tarot magician upright"],
    keywords_zh: ["魔术师塔罗牌", "魔术师牌含义", "塔罗牌魔术师正位"],
    upright_meaning_en: "The Magician represents manifestation, resourcefulness, power, and inspired action. You have all the tools and skills you need to create the reality you desire. This card is a powerful sign of new beginnings and infinite potential.",
    upright_meaning_zh: "魔术师代表显化、足智多谋、力量和有灵感的行动。你拥有创造理想现实所需的所有工具和技能。这是新开始和无限潜力的强大信号。",
    reversed_meaning_en: "Reversed, The Magician can indicate manipulation, untapped potential, or lack of direction. You may not be using your skills to their fullest or may be using them in negative ways.",
    reversed_meaning_zh: "逆位时，魔术师可能表示操纵、未开发的潜力或缺乏方向。你可能没有充分发挥你的技能，或者可能以消极的方式使用它们。",
    love_meaning_en: "In love, The Magician suggests attraction, charm, and the ability to manifest the relationship you desire. It indicates a period of passion and connection.",
    love_meaning_zh: "在爱情中，魔术师暗示吸引力、魅力和显化理想关系的能力。它表明这是充满激情和联系的时期。",
    career_meaning_en: "In career, The Magician indicates skill, creativity, and the power to manifest your professional goals. It's a sign of new opportunities and successful initiatives.",
    career_meaning_zh: "在事业中，魔术师表明技能、创造力和显化职业目标的力量。这是新机会和成功倡议的信号。",
    advice_en: "You have everything you need to succeed. Focus your intentions, take inspired action, and manifest your desires with confidence.",
    advice_zh: "你拥有成功所需的一切。集中你的意图，采取有灵感的行动，自信地显化你的愿望。",
    faq_en: [
      { question: "What does The Magician tarot card mean?", answer: "The Magician represents manifestation, skill, power, and new beginnings. It indicates you have all the tools to create your desired reality." },
      { question: "Is The Magician a good card?", answer: "Yes, The Magician is a powerful positive card representing infinite potential and the ability to manifest your desires." },
      { question: "What does The Magician mean in love?", answer: "In love, The Magician suggests attraction, passion, and the ability to manifest the relationship you desire." }
    ],
    faq_zh: [
      { question: "魔术师塔罗牌是什么意思？", answer: "魔术师代表显化、技能、力量和新的开始。它表明你拥有创造理想现实的所有工具。" },
      { question: "魔术师是好牌吗？", answer: "是的，魔术师是一张强大的积极牌，代表无限的潜力和显化愿望的能力。" },
      { question: "魔术师在爱情中是什么意思？", answer: "在爱情中，魔术师暗示吸引力、激情和显化理想关系的能力。" }
    ],
    related_cards: ["the-fool", "the-empress", "the-lovers"],
    canonical_path: "/tarot/cards/the-magician",
  },
  {
    id: "the-high-priestess",
    name_en: "The High Priestess",
    name_zh: "女祭司",
    number: 2,
    arcana: "major",
    emoji: "🌙",
    title_en: "The High Priestess Tarot Card: Meaning, Upright & Reversed",
    title_zh: "女祭司塔罗牌：正位与逆位含义详解",
    meta_description_en: "Discover The High Priestess tarot card meaning in love, career, and life. Learn about intuition, mystery, and inner wisdom.",
    meta_description_zh: "探索女祭司塔罗牌在爱情、事业和生活中的含义。了解直觉、神秘和内在智慧。",
    keywords_en: ["the high priestess tarot", "high priestess meaning", "high priestess card", "tarot high priestess"],
    keywords_zh: ["女祭司塔罗牌", "女祭司含义", "塔罗牌女祭司"],
    upright_meaning_en: "The High Priestess represents intuition, mystery, inner wisdom, and the subconscious mind. This card encourages you to trust your instincts and look beyond the surface. Answers lie within, and silence can reveal more than words.",
    upright_meaning_zh: "女祭司代表直觉、神秘、内在智慧和潜意识。这张牌鼓励你相信直觉，看透表面。答案在内心，沉默比言语更能揭示真相。",
    reversed_meaning_en: "Reversed, The High Priestess can indicate secrets being revealed, ignoring intuition, or surface-level understanding. You may be disconnected from your inner wisdom.",
    reversed_meaning_zh: "逆位时，女祭司可能表示秘密被揭露、忽视直觉或表面理解。你可能与内在智慧脱节。",
    love_meaning_en: "In love, The High Priestess suggests a mysterious or hidden connection, trusting your intuition about a partner, or keeping certain aspects of the relationship private.",
    love_meaning_zh: "在爱情中，女祭司暗示神秘或隐藏的联系，相信你对伴侣的直觉，或保持关系的某些方面私密。",
    career_meaning_en: "In career, The High Priestess indicates the need to trust your instincts, research thoroughly before making decisions, and pay attention to subtle cues.",
    career_meaning_zh: "在事业中，女祭司表明需要相信直觉，在做决定前彻底研究，并注意微妙的线索。",
    advice_en: "Listen to your inner voice. The answers you seek are within you. Take time for quiet reflection and trust your intuition.",
    advice_zh: "倾听你的内心声音。你寻求的答案在你内心。花时间安静反思，相信你的直觉。",
    faq_en: [
      { question: "What does The High Priestess mean?", answer: "The High Priestess represents intuition, mystery, and inner wisdom. It encourages trusting your instincts and looking beyond the surface." },
      { question: "Is The High Priestess a positive card?", answer: "Yes, The High Priestess is positive, representing wisdom and intuition. It's a call to trust your inner knowing." },
      { question: "What does The High Priestess mean in love?", answer: "In love, it suggests trusting your intuition about a partner, mysterious connections, or keeping things private." }
    ],
    faq_zh: [
      { question: "女祭司是什么意思？", answer: "女祭司代表直觉、神秘和内在智慧。它鼓励相信直觉，看透表面。" },
      { question: "女祭司是积极的牌吗？", answer: "是的，女祭司是积极的，代表智慧和直觉。它是相信内在认知的呼唤。" },
      { question: "女祭司在爱情中是什么意思？", answer: "在爱情中，它暗示相信你对伴侣的直觉，神秘的联系，或保持事情私密。" }
    ],
    related_cards: ["the-magician", "the-empress", "the-hermit"],
    canonical_path: "/tarot/cards/the-high-priestess",
  },
  {
    id: "the-empress",
    name_en: "The Empress",
    name_zh: "女皇",
    number: 3,
    arcana: "major",
    emoji: "👑",
    title_en: "The Empress Tarot Card: Meaning, Upright & Reversed",
    title_zh: "女皇塔罗牌：正位与逆位含义详解",
    meta_description_en: "Discover The Empress tarot card meaning in love, career, and life. Learn about abundance, nurturing, and feminine energy.",
    meta_description_zh: "探索女皇塔罗牌在爱情、事业和生活中的含义。了解丰盛、滋养和女性能量。",
    keywords_en: ["the empress tarot", "empress tarot meaning", "empress card meaning", "tarot empress upright"],
    keywords_zh: ["女皇塔罗牌", "女皇牌含义", "塔罗牌女皇正位"],
    upright_meaning_en: "The Empress represents abundance, nurturing, beauty, and feminine energy. This card signifies fertility, creativity, and the manifestation of abundance in your life. It encourages you to connect with nature and your senses.",
    upright_meaning_zh: "女皇代表丰盛、滋养、美丽和女性能量。这张牌象征生育力、创造力和生活中丰盛的显化。它鼓励你与大自然和感官建立联系。",
    reversed_meaning_en: "Reversed, The Empress can indicate creative blocks, neglecting self-care, or dependence on others. You may be ignoring your needs or struggling with fertility issues.",
    reversed_meaning_zh: "逆位时，女皇可能表示创意阻碍、忽视自我照顾或依赖他人。你可能忽视自己的需求或在生育问题上挣扎。",
    love_meaning_en: "In love, The Empress suggests deep connection, nurturing relationships, and sensuality. It may indicate pregnancy or a period of romantic fulfillment.",
    love_meaning_zh: "在爱情中，女皇暗示深层联系、滋养关系和感官享受。它可能表示怀孕或浪漫满足的时期。",
    career_meaning_en: "In career, The Empress indicates abundance, creative success, and a nurturing work environment. It's a sign of growth and prosperity in professional endeavors.",
    career_meaning_zh: "在事业中，女皇表明丰盛、创意成功和滋养的工作环境。这是职业努力中成长和繁荣的信号。",
    advice_en: "Embrace your creativity and nurturing side. Connect with nature, pamper yourself, and allow abundance to flow into your life.",
    advice_zh: "拥抱你的创造力和滋养的一面。与大自然联系，宠爱自己，让丰盛流入你的生活。",
    faq_en: [
      { question: "What does The Empress tarot card mean?", answer: "The Empress represents abundance, nurturing, beauty, and feminine energy. It signifies fertility, creativity, and abundance manifesting." },
      { question: "Is The Empress a positive card?", answer: "Yes, The Empress is very positive, representing abundance, beauty, and nurturing energy." },
      { question: "What does The Empress mean in love?", answer: "In love, The Empress suggests deep connection, nurturing relationships, sensuality, and possibly pregnancy." }
    ],
    faq_zh: [
      { question: "女皇塔罗牌是什么意思？", answer: "女皇代表丰盛、滋养、美丽和女性能量。它象征生育力、创造力和丰盛的显化。" },
      { question: "女皇是积极的牌吗？", answer: "是的，女皇非常积极，代表丰盛、美丽和滋养能量。" },
      { question: "女皇在爱情中是什么意思？", answer: "在爱情中，女皇暗示深层联系、滋养关系、感官享受，可能还有怀孕。" }
    ],
    related_cards: ["the-emperor", "the-lovers", "the-star"],
    canonical_path: "/tarot/cards/the-empress",
  },
  {
    id: "the-emperor",
    name_en: "The Emperor",
    name_zh: "皇帝",
    number: 4,
    arcana: "major",
    emoji: "🏛️",
    title_en: "The Emperor Tarot Card: Meaning, Upright & Reversed",
    title_zh: "皇帝塔罗牌：正位与逆位含义详解",
    meta_description_en: "Discover The Emperor tarot card meaning in love, career, and life. Learn about authority, structure, and leadership.",
    meta_description_zh: "探索皇帝塔罗牌在爱情、事业和生活中的含义。了解权威、结构和领导力。",
    keywords_en: ["the emperor tarot", "emperor tarot meaning", "emperor card meaning", "tarot emperor upright"],
    keywords_zh: ["皇帝塔罗牌", "皇帝牌含义", "塔罗牌皇帝正位"],
    upright_meaning_en: "The Emperor represents authority, structure, stability, and leadership. This card signifies a position of power, control, and the establishment of order. It encourages taking charge and creating structure in your life.",
    upright_meaning_zh: "皇帝代表权威、结构、稳定和领导力。这张牌象征权力地位、控制和秩序的建立。它鼓励掌控局面并在生活中创造结构。",
    reversed_meaning_en: "Reversed, The Emperor can indicate abuse of power, rigidity, or lack of discipline. You may be struggling with authority figures or need to establish better boundaries.",
    reversed_meaning_zh: "逆位时，皇帝可能表示权力滥用、僵化或缺乏纪律。你可能在与权威人物斗争，或需要建立更好的界限。",
    love_meaning_en: "In love, The Emperor suggests a stable, committed relationship, protection, and provider energy. It may indicate a partner who is authoritative or traditional.",
    love_meaning_zh: "在爱情中，皇帝暗示稳定、承诺的关系、保护和供养能量。它可能表示一个权威或传统的伴侣。",
    career_meaning_en: "In career, The Emperor indicates leadership positions, authority, and structured success. It's a sign of recognition and power in professional settings.",
    career_meaning_zh: "在事业中，皇帝表明领导职位、权威和结构化的成功。这是职业环境中认可和权力的信号。",
    advice_en: "Take control of your life with discipline and structure. Establish order, set boundaries, and lead with confidence.",
    advice_zh: "用纪律和结构掌控你的生活。建立秩序，设定界限，自信地领导。",
    faq_en: [
      { question: "What does The Emperor tarot card mean?", answer: "The Emperor represents authority, structure, stability, and leadership. It signifies taking charge and establishing order." },
      { question: "Is The Emperor a positive card?", answer: "Yes, The Emperor is positive, representing stability and leadership, though reversed it can indicate power issues." },
      { question: "What does The Emperor mean in love?", answer: "In love, The Emperor suggests stable, committed relationships, protection, and traditional values." }
    ],
    faq_zh: [
      { question: "皇帝塔罗牌是什么意思？", answer: "皇帝代表权威、结构、稳定和领导力。它象征掌控局面和建立秩序。" },
      { question: "皇帝是积极的牌吗？", answer: "是的，皇帝是积极的，代表稳定和领导力，尽管逆位时可能表示权力问题。" },
      { question: "皇帝在爱情中是什么意思？", answer: "在爱情中，皇帝暗示稳定、承诺的关系、保护和传统价值观。" }
    ],
    related_cards: ["the-empress", "the-hierophant", "the-justice"],
    canonical_path: "/tarot/cards/the-emperor",
  },
  {
    id: "the-hierophant",
    name_en: "The Hierophant",
    name_zh: "教皇",
    number: 5,
    arcana: "major",
    emoji: "📿",
    title_en: "The Hierophant Tarot Card: Meaning, Upright & Reversed",
    title_zh: "教皇塔罗牌：正位与逆位含义详解",
    meta_description_en: "Discover The Hierophant tarot card meaning in love, career, and life. Learn about tradition, spirituality, and conventional wisdom.",
    meta_description_zh: "探索教皇塔罗牌在爱情、事业和生活中的含义。了解传统、灵性和传统智慧。",
    keywords_en: ["the hierophant tarot", "hierophant tarot meaning", "hierophant card meaning", "tarot hierophant"],
    keywords_zh: ["教皇塔罗牌", "教皇牌含义", "塔罗牌教皇"],
    upright_meaning_en: "The Hierophant represents tradition, spiritual wisdom, conformity, and education. This card signifies following established institutions, seeking guidance from mentors, and adhering to conventional values.",
    upright_meaning_zh: "教皇代表传统、精神智慧、遵从和教育。这张牌象征遵循既定制度，寻求导师指导，坚持传统价值观。",
    reversed_meaning_en: "Reversed, The Hierophant can indicate challenging conventions, unorthodox approaches, or breaking free from tradition. You may need to forge your own path.",
    reversed_meaning_zh: "逆位时，教皇可能表示挑战传统、非正统方法或打破传统。你可能需要开辟自己的道路。",
    love_meaning_en: "In love, The Hierophant suggests traditional relationships, commitment, and shared values. It may indicate a conventional courtship or marriage.",
    love_meaning_zh: "在爱情中，教皇暗示传统关系、承诺和共同价值观。它可能表示传统的追求或婚姻。",
    career_meaning_en: "In career, The Hierophant indicates following established paths, seeking mentorship, and working within institutions. It's a sign of conventional success.",
    career_meaning_zh: "在事业中，教皇表明遵循既定道路，寻求指导，在机构内工作。这是传统成功的信号。",
    advice_en: "Seek wisdom from established traditions and mentors. There is value in conventional approaches and shared knowledge.",
    advice_zh: "从既定传统和导师那里寻求智慧。传统方法和共享知识中有价值。",
    faq_en: [
      { question: "What does The Hierophant tarot card mean?", answer: "The Hierophant represents tradition, spiritual wisdom, and conventional approaches. It encourages seeking guidance from established sources." },
      { question: "Is The Hierophant positive?", answer: "Yes, The Hierophant is generally positive, representing wisdom and tradition, though reversed it can indicate need for unconventional thinking." },
      { question: "What does The Hierophant mean in love?", answer: "In love, it suggests traditional relationships, commitment, shared values, and conventional courtship." }
    ],
    faq_zh: [
      { question: "教皇塔罗牌是什么意思？", answer: "教皇代表传统、精神智慧和传统方法。它鼓励从既定来源寻求指导。" },
      { question: "教皇是积极的吗？", answer: "是的，教皇通常是积极的，代表智慧和传统，尽管逆位时可能表示需要非传统思维。" },
      { question: "教皇在爱情中是什么意思？", answer: "在爱情中，它暗示传统关系、承诺、共同价值观和传统的追求。" }
    ],
    related_cards: ["the-emperor", "the-lovers", "the-justice"],
    canonical_path: "/tarot/cards/the-hierophant",
  },
  {
    id: "the-lovers",
    name_en: "The Lovers",
    name_zh: "恋人",
    number: 6,
    arcana: "major",
    emoji: "💕",
    title_en: "The Lovers Tarot Card: Meaning, Upright & Reversed",
    title_zh: "恋人塔罗牌：正位与逆位含义详解",
    meta_description_en: "Discover The Lovers tarot card meaning in love, career, and life. Learn about relationships, choices, and alignment.",
    meta_description_zh: "探索恋人塔罗牌在爱情、事业和生活中的含义。了解关系、选择和一致性。",
    keywords_en: ["the lovers tarot", "lovers tarot meaning", "lovers card meaning", "tarot lovers upright"],
    keywords_zh: ["恋人塔罗牌", "恋人牌含义", "塔罗牌恋人正位"],
    upright_meaning_en: "The Lovers represents love, harmony, relationships, and choices. This card signifies deep connection, alignment of values, and important decisions about relationships. It encourages following your heart.",
    upright_meaning_zh: "恋人代表爱、和谐、关系和选择。这张牌象征深层联系、价值观一致和关于关系的重要决定。它鼓励跟随你的心。",
    reversed_meaning_en: "Reversed, The Lovers can indicate disharmony, misalignment, or difficult choices in relationships. You may be facing a dilemma or struggling with commitment.",
    reversed_meaning_zh: "逆位时，恋人可能表示不和谐、不一致或关系中的困难选择。你可能面临困境或在承诺方面挣扎。",
    love_meaning_en: "In love, The Lovers is a powerful sign of deep romantic connection, partnership, and soulmate energy. It may indicate a significant relationship or important choice.",
    love_meaning_zh: "在爱情中，恋人是深层浪漫联系、伴侣关系和灵魂伴侣能量的强大信号。它可能表示重要的关系或重要的选择。",
    career_meaning_en: "In career, The Lovers indicates alignment of values, partnerships, and choices that reflect your true self. It's a sign of meaningful professional connections.",
    career_meaning_zh: "在事业中，恋人表明价值观一致、伙伴关系和反映真实自我的选择。这是有意义的职业联系的信号。",
    advice_en: "Follow your heart and align your choices with your deepest values. Love and harmony come from authenticity.",
    advice_zh: "跟随你的心，将你的选择与你最深层的价值观保持一致。爱和和谐来自真实性。",
    faq_en: [
      { question: "What does The Lovers tarot card mean?", answer: "The Lovers represents love, harmony, relationships, and important choices. It signifies deep connection and alignment of values." },
      { question: "Is The Lovers a positive card?", answer: "Yes, The Lovers is very positive in love readings, representing deep romantic connection and soulmate energy." },
      { question: "What does The Lovers mean in love?", answer: "In love, The Lovers is a powerful sign of deep romantic connection, partnership, and significant relationship choices." }
    ],
    faq_zh: [
      { question: "恋人塔罗牌是什么意思？", answer: "恋人代表爱、和谐、关系和重要的选择。它象征深层联系和价值观的一致。" },
      { question: "恋人是积极的牌吗？", answer: "是的，恋人塔罗牌在爱情解读中非常积极，代表深层浪漫联系和灵魂伴侣能量。" },
      { question: "恋人在爱情中是什么意思？", answer: "在爱情中，恋人是深层浪漫联系、伴侣关系和重要关系选择的强大信号。" }
    ],
    related_cards: ["the-emperor", "the-hierophant", "the-star"],
    canonical_path: "/tarot/cards/the-lovers",
  },
  {
    id: "the-chariot",
    name_en: "The Chariot",
    name_zh: "战车",
    number: 7,
    arcana: "major",
    emoji: "🏇",
    title_en: "The Chariot Tarot Card: Meaning, Upright & Reversed",
    title_zh: "战车塔罗牌：正位与逆位含义详解",
    meta_description_en: "Discover The Chariot tarot card meaning in love, career, and life. Learn about determination, victory, and overcoming obstacles.",
    meta_description_zh: "探索战车塔罗牌在爱情、事业和生活中的含义。了解决心、胜利和克服障碍。",
    keywords_en: ["the chariot tarot", "chariot tarot meaning", "chariot card meaning", "tarot chariot upright"],
    keywords_zh: ["战车塔罗牌", "战车牌含义", "塔罗牌战车正位"],
    upright_meaning_en: "The Chariot represents determination, willpower, victory, and overcoming obstacles. This card signifies a triumph through hard work, focus, and sheer determination. You are on the right path and will succeed.",
    upright_meaning_zh: "战车代表决心、意志力、胜利和克服障碍。这张牌象征通过努力工作、专注和纯粹的决心取得的胜利。你在正确的道路上，将会成功。",
    reversed_meaning_en: "Reversed, The Chariot can indicate lack of direction, aggression, or feeling stuck. You may be struggling to move forward or lacking motivation.",
    reversed_meaning_zh: "逆位时，战车可能表示缺乏方向、侵略性或感到被困。你可能在努力前进或缺乏动力。",
    love_meaning_en: "In love, The Chariot suggests winning someone's heart, determination in romance, and overcoming relationship obstacles. It's a sign of passionate pursuit.",
    love_meaning_zh: "在爱情中，战车暗示赢得某人的心、爱情中的决心和克服关系障碍。这是热情追求的信号。",
    career_meaning_en: "In career, The Chariot indicates victory, ambition, and success through determination. It's a sign of career advancement and achievement.",
    career_meaning_zh: "在事业中，战车表明胜利、野心和通过决心取得的成功。这是职业进步和成就的信号。",
    advice_en: "Stay focused on your goals and push through obstacles with determination. Victory is within reach if you maintain your willpower.",
    advice_zh: "专注于你的目标，用决心克服障碍。如果你保持意志力，胜利就在眼前。",
    faq_en: [
      { question: "What does The Chariot tarot card mean?", answer: "The Chariot represents determination, willpower, victory, and overcoming obstacles. It signifies triumph through focus and hard work." },
      { question: "Is The Chariot a positive card?", answer: "Yes, The Chariot is very positive, representing victory, determination, and success through willpower." },
      { question: "What does The Chariot mean in love?", answer: "In love, The Chariot suggests passionate pursuit, determination, and winning someone's heart through effort." }
    ],
    faq_zh: [
      { question: "战车塔罗牌是什么意思？", answer: "战车代表决心、意志力、胜利和克服障碍。它象征通过专注和努力工作取得的胜利。" },
      { question: "战车是积极的牌吗？", answer: "是的，战车非常积极，代表胜利、决心和通过意志力取得的成功。" },
      { question: "战车在爱情中是什么意思？", answer: "在爱情中，战车暗示热情追求、决心和通过努力赢得某人的心。" }
    ],
    related_cards: ["the-fool", "the-emperor", "strength"],
    canonical_path: "/tarot/cards/the-chariot",
  },
  {
    id: "strength",
    name_en: "Strength",
    name_zh: "力量",
    number: 8,
    arcana: "major",
    emoji: "🦁",
    title_en: "Strength Tarot Card: Meaning, Upright & Reversed",
    title_zh: "力量塔罗牌：正位与逆位含义详解",
    meta_description_en: "Discover Strength tarot card meaning in love, career, and life. Learn about inner strength, courage, and patience.",
    meta_description_zh: "探索力量塔罗牌在爱情、事业和生活中的含义。了解内在力量、勇气和耐心。",
    keywords_en: ["strength tarot", "strength tarot meaning", "strength card meaning", "tarot strength upright"],
    keywords_zh: ["力量塔罗牌", "力量牌含义", "塔罗牌力量正位"],
    upright_meaning_en: "Strength represents inner strength, courage, patience, and compassion. This card signifies overcoming challenges through gentle persuasion and inner power rather than force. It's about mastering your fears and instincts.",
    upright_meaning_zh: "力量代表内在力量、勇气、耐心和同情。这张牌象征通过温和的说服和内在力量而非武力克服挑战。它是关于掌控你的恐惧和本能。",
    reversed_meaning_en: "Reversed, Strength can indicate self-doubt, weakness, or being overly aggressive. You may be struggling with confidence or lacking inner strength.",
    reversed_meaning_zh: "逆位时，力量可能表示自我怀疑、软弱或过于咄咄逼人。你可能在自信方面挣扎或缺乏内在力量。",
    love_meaning_en: "In love, Strength suggests patient, compassionate relationships and the courage to be vulnerable. It indicates deep emotional connection and understanding.",
    love_meaning_zh: "在爱情中，力量暗示耐心、富有同情心的关系和脆弱的勇气。它表明深层的情感联系和理解。",
    career_meaning_en: "In career, Strength indicates inner power, perseverance, and gentle influence. It's a sign of overcoming professional challenges with grace.",
    career_meaning_zh: "在事业中，力量表明内在力量、坚持和温和的影响力。这是以优雅克服职业挑战的信号。",
    advice_en: "Draw upon your inner strength and patience. True power comes from within, and gentle persuasion is often more effective than force.",
    advice_zh: "汲取你的内在力量和耐心。真正的力量来自内心，温和的说服通常比武力更有效。",
    faq_en: [
      { question: "What does Strength tarot card mean?", answer: "Strength represents inner courage, patience, and compassion. It signifies overcoming challenges through gentle power rather than force." },
      { question: "Is Strength a positive card?", answer: "Yes, Strength is positive, representing inner power, courage, and the ability to overcome challenges gracefully." },
      { question: "What does Strength mean in love?", answer: "In love, Strength suggests patient, compassionate relationships and the courage to be vulnerable with your partner." }
    ],
    faq_zh: [
      { question: "力量塔罗牌是什么意思？", answer: "力量代表内在勇气、耐心和同情。它象征通过温和的力量而非武力克服挑战。" },
      { question: "力量是积极的牌吗？", answer: "是的，力量是积极的，代表内在力量、勇气和优雅克服挑战的能力。" },
      { question: "力量在爱情中是什么意思？", answer: "在爱情中，力量暗示耐心、富有同情心的关系和与伴侣脆弱的勇气。" }
    ],
    related_cards: ["the-chariot", "the-hermit", "the-star"],
    canonical_path: "/tarot/cards/strength",
  },
  {
    id: "the-hermit",
    name_en: "The Hermit",
    name_zh: "隐士",
    number: 9,
    arcana: "major",
    emoji: "🏔️",
    title_en: "The Hermit Tarot Card: Meaning, Upright & Reversed",
    title_zh: "隐士塔罗牌：正位与逆位含义详解",
    meta_description_en: "Discover The Hermit tarot card meaning in love, career, and life. Learn about solitude, introspection, and inner guidance.",
    meta_description_zh: "探索隐士塔罗牌在爱情、事业和生活中的含义。了解孤独、内省和内在指导。",
    keywords_en: ["the hermit tarot", "hermit tarot meaning", "hermit card meaning", "tarot hermit upright"],
    keywords_zh: ["隐士塔罗牌", "隐士牌含义", "塔罗牌隐士正位"],
    upright_meaning_en: "The Hermit represents solitude, introspection, soul-searching, and inner guidance. This card encourages stepping back from the world to find answers within. It's a time for reflection, meditation, and personal growth.",
    upright_meaning_zh: "隐士代表孤独、内省、灵魂探索和内在指导。这张牌鼓励从世界中退后一步，在内心寻找答案。这是反思、冥想和个人成长的时期。",
    reversed_meaning_en: "Reversed, The Hermit can indicate isolation, loneliness, or refusing to seek help. You may be withdrawn or avoiding necessary self-reflection.",
    reversed_meaning_zh: "逆位时，隐士可能表示孤立、孤独或拒绝寻求帮助。你可能孤僻或避免必要的自我反思。",
    love_meaning_en: "In love, The Hermit suggests needing space, introspection about relationships, or a period of being single to find yourself.",
    love_meaning_zh: "在爱情中，隐士暗示需要空间、对关系的内省，或一段单身时期来寻找自我。",
    career_meaning_en: "In career, The Hermit indicates needing time alone to think, careful planning, and seeking mentorship. It's a sign of thoughtful decision-making.",
    career_meaning_zh: "在事业中，隐士表明需要独处时间思考、仔细规划和寻求指导。这是深思熟虑决策的信号。",
    advice_en: "Take time for solitude and reflection. The answers you seek are within you. Step back from the noise and listen to your inner voice.",
    advice_zh: "花时间独处和反思。你寻求的答案在你内心。从喧嚣中退后一步，倾听你的内心声音。",
    faq_en: [
      { question: "What does The Hermit tarot card mean?", answer: "The Hermit represents solitude, introspection, and inner guidance. It encourages stepping back to find answers within yourself." },
      { question: "Is The Hermit positive or negative?", answer: "The Hermit is generally positive, representing wisdom through reflection, though reversed it can indicate isolation." },
      { question: "What does The Hermit mean in love?", answer: "In love, The Hermit suggests needing space, introspection, or a period of being single for self-discovery." }
    ],
    faq_zh: [
      { question: "隐士塔罗牌是什么意思？", answer: "隐士代表孤独、内省和内在指导。它鼓励退后一步，在内心寻找答案。" },
      { question: "隐士是积极还是消极的？", answer: "隐士通常是积极的，代表通过反思获得智慧，尽管逆位时可能表示孤立。" },
      { question: "隐士在爱情中是什么意思？", answer: "在爱情中，隐士暗示需要空间、内省，或一段单身时期来发现自我。" }
    ],
    related_cards: ["the-high-priestess", "strength", "the-moon"],
    canonical_path: "/tarot/cards/the-hermit",
  },
]

export const TarotCardMap = Object.fromEntries(TarotCards.map(c => [c.id, c]))
