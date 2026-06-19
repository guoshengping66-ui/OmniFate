export interface PalmAnalysis {
  id: string
  name_en: string
  name_zh: string
  emoji: string
  title_en: string
  title_zh: string
  meta_description_en: string
  meta_description_zh: string
  keywords_en: string[]
  keywords_zh: string[]
  overview_en: string
  overview_zh: string
  method_en: string
  method_zh: string
  indicators_en: string
  indicators_zh: string
  interpretation_en: string
  interpretation_zh: string
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>
  canonical_path: string
}

export const PalmAnalyses: PalmAnalysis[] = [
  {
    id: "love",
    name_en: "Love & Relationship Analysis",
    name_zh: "爱情与感情分析",
    emoji: "💕",
    title_en: "Palm Reading for Love: Discover Your Romantic Destiny",
    title_zh: "手相爱情解读：发现你的恋爱命运",
    meta_description_en: "Learn how palm reading reveals your love life. Discover what your heart line, marriage line, and Venus mount say about your romantic future.",
    meta_description_zh: "了解手相如何揭示你的爱情生活。发现你的感情线、婚姻线和金星丘对你恋爱未来的预示。",
    keywords_en: ["palm reading love", "heart line love", "marriage line palm", "romance palm reading"],
    keywords_zh: ["手相爱情", "感情线爱情", "婚姻线手相", "浪漫手相解读"],
    overview_en: "Palm reading for love focuses on three key areas: the Heart Line (emotional expression), the Marriage Line (relationship commitment), and the Venus Mount (capacity for love). By examining these features, palmists can reveal your romantic tendencies, ideal partner type, and relationship timeline.",
    overview_zh: "手相爱情解读专注于三个关键领域：感情线（情感表达）、婚姻线（关系承诺）和金星丘（爱的能力）。通过检查这些特征，手相师可以揭示你的恋爱倾向、理想伴侣类型和关系时间线。",
    method_en: "The analysis examines: 1) Heart Line length, depth, and curvature, 2) Marriage Line quantity and clarity, 3) Venus Mount size and markings, 4) Relationship Line patterns, 5) Integration of multiple love indicators.",
    method_zh: "分析检查：1）感情线的长度、深度和弯曲度，2）婚姻线的数量和清晰度，3）金星丘的大小和标记，4）关系线模式，5）多个爱情指标的整合。",
    indicators_en: "Key indicators include a deep, clear Heart Line (strong emotional capacity), upward-curving Heart Line (optimistic love nature), clear Marriage Line (stable relationships), prominent Venus Mount (passionate and loving nature), and specific markings that indicate timing of romantic events.",
    indicators_zh: "关键指标包括深而清晰的感情线（强烈的情感能力）、向上弯曲的感情线（乐观的爱情天性）、清晰的婚姻线（稳定的关系）、突出的金星丘（热情和充满爱的天性），以及表示恋爱事件时间的特定标记。",
    interpretation_en: "A long Heart Line reaching the index finger indicates idealistic love. A Heart Line ending between index and middle finger suggests balanced romantic approach. Multiple Marriage Lines may indicate several significant relationships. A high Venus Mount suggests a passionate, loving personality.",
    interpretation_zh: "感情线长且延伸到食指表示理想主义的爱情。感情线终止于食指和中指之间表示平衡的恋爱方式。多条婚姻线可能表示多段重要关系。金星丘高表示热情、充满爱的个性。",
    faq_en: [
      { question: "Can palm reading predict when I'll find love?", answer: "Palm reading can indicate timing through specific markings, but it shows tendencies rather than certainties. Free will always plays a role." },
      { question: "What does a broken Heart Line mean?", answer: "A broken Heart Line may indicate emotional upheaval or a significant change in how you express feelings. It's not necessarily negative — it can represent growth." },
      { question: "Do left and right hands mean different things?", answer: "Yes! The dominant hand shows your current state, while the non-dominant hand shows your potential and innate qualities." }
    ],
    faq_zh: [
      { question: "手相能预测我什么时候找到爱情吗？", answer: "手相可以通过特定标记表示时间，但它显示趋势而不是确定性。自由意志总是发挥作用。" },
      { question: "断开的感情线意味着什么？", answer: "断开的感情线可能表示情感动荡或你表达感情方式的重大变化。这不一定是消极的——它可能代表成长。" },
      { question: "左右手意味着不同的事情吗？", answer: "是的！惯用手显示你当前的状态，而非惯用手显示你的潜力和先天品质。" }
    ],
    canonical_path: "/palm-reading/analysis/love",
  },
  {
    id: "career",
    name_en: "Career & Success Analysis",
    name_zh: "事业与成功分析",
    emoji: "💼",
    title_en: "Palm Reading for Career: Map Your Professional Path",
    title_zh: "手相事业解读：描绘你的职业道路",
    meta_description_en: "Discover career insights through palm reading. Learn what your Sun Line, Mercury Line, and hand shape reveal about your professional destiny.",
    meta_description_zh: "通过手相发现事业洞察。了解你的太阳线、水星线和手型如何揭示你的职业命运。",
    keywords_en: ["palm reading career", "sun line career", "success palm reading", "work palm reading"],
    keywords_zh: ["手相事业", "太阳线事业", "成功手相", "工作手相解读"],
    overview_en: "Career palm reading focuses on the Sun Line (success and recognition), Mercury Line (business acumen), hand shape (work style), and specific mounts related to ambition and determination. These features reveal your natural professional talents and the path to career fulfillment.",
    overview_zh: "事业手相解读专注于太阳线（成功和认可）、水星线（商业头脑）、手型（工作风格），以及与野心和决心相关的特定丘位。这些特征揭示你的天生专业才能和通往事业满足的道路。",
    method_en: "The analysis examines: 1) Sun Line length and clarity, 2) Mercury Line prominence, 3) Hand shape classification, 4) Jupiter Mount (ambition), 5) Saturn Mount (discipline), 6) Apollo Mount (creativity).",
    method_zh: "分析检查：1）太阳线的长度和清晰度，2）水星线的突出程度，3）手型分类，4）木星丘（野心），5）土星丘（纪律），6）太阳丘（创造力）。",
    indicators_en: "Key indicators include a strong Sun Line (career success and recognition), prominent Mercury Line (business success), well-developed Jupiter Mount (leadership ability), strong Saturn Mount (discipline and persistence), and specific hand shapes associated with different career types.",
    indicators_zh: "关键指标包括强有力的太阳线（事业成功和认可）、突出的水星线（商业成功）、发达的木星丘（领导能力）、强有力的土星丘（纪律和坚持），以及与不同类型职业相关的特定手型。",
    interpretation_en: "A long, clear Sun Line indicates recognition and success in your chosen field. A strong Mercury Line suggests business or communication-related careers. Square-shaped hands indicate practical, detail-oriented work. Long fingers suggest intellectual or creative professions.",
    interpretation_zh: "长而清晰的太阳线表示在你选择的领域获得认可和成功。强有力的水星线表示商业或沟通相关的职业。方形手表示实际、注重细节的工作。长手指表示智力或创造性的职业。",
    faq_en: [
      { question: "Can palm reading predict career success?", answer: "Palm reading reveals your natural talents and potential, but success depends on your efforts and choices. Use it as guidance, not prediction." },
      { question: "What if I don't have a Sun Line?", answer: "Not everyone has a visible Sun Line. This doesn't mean you won't be successful — it may mean your success comes through different channels." },
      { question: "Which hand should I read for career?", answer: "Read your dominant hand for current career state and non-dominant hand for career potential and natural talents." }
    ],
    faq_zh: [
      { question: "手相能预测事业成功吗？", answer: "手相揭示你的天生才能和潜力，但成功取决于你的努力和选择。将其作为指引，而不是预测。" },
      { question: "如果我没有太阳线怎么办？", answer: "不是每个人都有一条可见的太阳线。这并不意味着你不会成功——它可能意味着你的成功来自不同的渠道。" },
      { question: "我应该读哪只手来了解事业？", answer: "读取你的惯用手了解当前事业状态，读取非惯用手了解事业潜力和天生才能。" }
    ],
    canonical_path: "/palm-reading/analysis/career",
  },
  {
    id: "health",
    name_en: "Health & Wellness Analysis",
    name_zh: "健康与养生分析",
    emoji: "🏥",
    title_en: "Palm Reading for Health: Your Body's Hidden Messages",
    title_zh: "手相健康解读：你身体的隐藏信息",
    meta_description_en: "Discover health insights through palm reading. Learn what your Life Line, health markers, and hand features reveal about your physical well-being.",
    meta_description_zh: "通过手相发现健康洞察。了解你的生命线、健康标记和手部特征如何揭示你的身体健康状况。",
    keywords_en: ["palm reading health", "life line health", "health palm reading", "wellness palm reading"],
    keywords_zh: ["手相健康", "生命线健康", "健康手相", "养生手相解读"],
    overview_en: "Health palm reading examines the Life Line (vitality and physical constitution), hand color (current health state), nail condition (nutritional status), and specific markings that may indicate health tendencies. This ancient practice offers insights into your body's strengths and potential vulnerabilities.",
    overview_zh: "手相健康解读检查生命线（活力和体质）、手色（当前健康状态）、指甲状况（营养状况），以及可能表示健康倾向的特定标记。这种古老的做法为你身体的优势和潜在弱点提供洞察。",
    method_en: "The analysis examines: 1) Life Line depth, length, and breaks, 2) Hand color and temperature, 3) Nail condition and shape, 4) Mars Mount (immune strength), 5) Specific health-related markings.",
    method_zh: "分析检查：1）生命线的深度、长度和中断，2）手的颜色和温度，3）指甲的状况和形状，4）火星丘（免疫强度），5）特定的健康相关标记。",
    indicators_en: "Key indicators include a deep, unbroken Life Line (strong vitality), pink hand color (good circulation), strong nails (good nutrition), prominent Mars Mount (strong immune system), and specific line patterns that may indicate health tendencies.",
    indicators_zh: "关键指标包括深而不断的生命线（强健的活力）、粉红色的手（良好的循环）、强壮的指甲（良好的营养）、突出的火星丘（强大的免疫系统），以及可能表示健康倾向的特定线型模式。",
    interpretation_en: "A deep, clear Life Line indicates strong physical constitution. A Life Line with breaks may suggest periods of health transition. Pale hands may indicate poor circulation. Red palms can signal liver issues. Clubbed fingers may indicate respiratory concerns.",
    interpretation_zh: "深而清晰的生命线表示强健的体质。有中断的生命线可能表示健康转变时期。苍白的手可能表示循环不良。红色手掌可能预示肝脏问题。杵状指可能表示呼吸系统问题。",
    faq_en: [
      { question: "Does a short Life Line mean a short life?", answer: "No! This is a common misconception. A short Life Line indicates a different type of vitality, not lifespan." },
      { question: "Can palm reading replace medical diagnosis?", answer: "No, palm reading is for wellness insights only. Always consult healthcare professionals for medical concerns." },
      { question: "Do palm lines change with health?", answer: "Yes, palm lines can change over time, reflecting changes in your health and life circumstances." }
    ],
    faq_zh: [
      { question: "短的生命线意味着短寿吗？", answer: "不！这是一个常见的误解。短的生命线表示不同类型的活力，而不是寿命。" },
      { question: "手相能替代医疗诊断吗？", answer: "不能，手相仅供健康洞察。对于医疗问题，请始终咨询医疗专业人员。" },
      { question: "手纹会随健康变化吗？", answer: "是的，手纹会随时间变化，反映你健康和生活状况的变化。" }
    ],
    canonical_path: "/palm-reading/analysis/health",
  },
  {
    id: "wealth",
    name_en: "Wealth & Finance Analysis",
    name_zh: "财富与理财分析",
    emoji: "💰",
    title_en: "Palm Reading for Wealth: Your Financial Potential",
    title_zh: "手相财富解读：你的财务潜力",
    meta_description_en: "Discover your financial potential through palm reading. Learn what your Money Line, Mercury Line, and specific markings reveal about wealth accumulation.",
    meta_description_zh: "通过手相发现你的财务潜力。了解你的财运线、水星线和特定标记如何揭示财富积累。",
    keywords_en: ["palm reading wealth", "money line palm", "financial palm reading", "wealth palm reading"],
    keywords_zh: ["手相财富", "财运线手相", "财务手相", "财富手相解读"],
    overview_en: "Wealth palm reading examines the Mercury Line (business success), Sun Line (financial recognition), specific wealth markings, and hand shape characteristics associated with financial acumen. These features reveal your natural ability to attract and manage wealth.",
    overview_zh: "财富手相解读检查水星线（商业成功）、太阳线（财务认可）、特定财富标记，以及与财务能力相关的手型特征。这些特征揭示你吸引和管理财富的天生能力。",
    method_en: "The analysis examines: 1) Mercury Line prominence and clarity, 2) Sun Line characteristics, 3) Specific wealth-related markings, 4) Jupiter Mount (ambition for wealth), 5) Hand shape and finger length ratios.",
    method_zh: "分析检查：1）水星线的突出程度和清晰度，2）太阳线特征，3）特定的财富相关标记，4）木星丘（对财富的野心），5）手型和手指长度比例。",
    indicators_en: "Key indicators include a strong Mercury Line (business success), prominent Sun Line (financial recognition), specific triangle formations (wealth indicators), well-developed Jupiter Mount (wealth ambition), and long ring finger (financial intuition).",
    indicators_zh: "关键指标包括强有力的水星线（商业成功）、突出的太阳线（财务认可）、特定的三角形（财富指标）、发达的木星丘（财富野心）和长的无名指（财务直觉）。",
    interpretation_en: "A strong Mercury Line indicates business success. Multiple Sun Lines may suggest multiple income sources. A prominent triangle on the palm is considered a wealth indicator. A high Jupiter Mount suggests ambition for material success.",
    interpretation_zh: "强有力的水星线表示商业成功。多条太阳线可能表示多种收入来源。手掌上突出的三角形被认为是财富指标。高耸的木星丘表示对物质成功的野心。",
    faq_en: [
      { question: "Can palm reading predict lottery wins?", answer: "No, palm reading shows wealth potential and earning ability, not random windfalls. It reveals how you're most likely to build wealth." },
      { question: "What if I don't have a Money Line?", answer: "Not everyone has a visible Money Line. This doesn't mean you can't be wealthy — it suggests your wealth may come through different channels." },
      { question: "Which hand shows financial potential?", answer: "The dominant hand shows current financial state, while the non-dominant hand shows innate financial potential and talent." }
    ],
    faq_zh: [
      { question: "手相能预测彩票中奖吗？", answer: "不能，手相显示财富潜力和赚钱能力，而不是随机的意外之财。它揭示你最可能如何积累财富。" },
      { question: "如果我没有财运线怎么办？", answer: "不是每个人都有一条可见的财运线。这并不意味着你不能致富——它表明你的财富可能来自不同的渠道。" },
      { question: "哪只手显示财务潜力？", answer: "惯用手显示当前财务状态，而非惯用手显示先天的财务潜力和才能。" }
    ],
    canonical_path: "/palm-reading/analysis/wealth",
  },
  {
    id: "personality",
    name_en: "Personality Analysis",
    name_zh: "性格分析",
    emoji: "🧠",
    title_en: "Palm Reading for Personality: Discover Your True Self",
    title_zh: "手相性格解读：发现真实的你",
    meta_description_en: "Discover your personality through palm reading. Learn what your hand shape, finger length, and major lines reveal about your character.",
    meta_description_zh: "通过手相发现你的性格。了解你的手型、手指长度和主要线条如何揭示你的性格。",
    keywords_en: ["palm reading personality", "hand shape personality", "character palm reading", "personality palm reading"],
    keywords_zh: ["手相性格", "手型性格", "性格手相", "性格手相解读"],
    overview_en: "Personality palm reading uses hand shape classification, finger length ratios, thumb characteristics, and major line patterns to create a comprehensive personality profile. Your hands reveal not just who you are, but who you're becoming.",
    overview_zh: "手相性格解读使用手型分类、手指长度比例、拇指特征和主要线条模式来创建全面的性格档案。你的手不仅揭示你是谁，还揭示你正在成为谁。",
    method_en: "The analysis examines: 1) Hand shape classification (Earth, Air, Water, Fire hands), 2) Finger length ratios, 3) Thumb characteristics, 4) Head Line pattern, 5) Overall hand proportions.",
    method_zh: "分析检查：1）手型分类（土型、风型、水型、火型手），2）手指长度比例，3）拇指特征，4）智慧线模式，5）整体手部比例。",
    indicators_en: "Key indicators include hand shape (revealing basic temperament), finger ratios (revealing intellectual vs emotional balance), thumb length (revealing willpower), Head Line direction (revealing thinking style), and overall hand texture (revealing sensitivity).",
    indicators_zh: "关键指标包括手型（揭示基本性情）、手指比例（揭示理智与情感的平衡）、拇指长度（揭示意志力）、智慧线方向（揭示思维方式），以及整体手部纹理（揭示敏感度）。",
    interpretation_en: "Square hands indicate practical, organized personalities. Long hands suggest creative, intuitive types. Long index finger indicates natural leadership. Long ring finger suggests creativity and risk-taking. A curved thumb indicates adaptability, while a straight thumb indicates determination.",
    interpretation_zh: "方形手表示实际、有组织的个性。长手表示创造、直觉型。长食指表示天生的领导力。长无名指表示创造力和冒险精神。弯曲的拇指表示适应力，而直的拇指表示决心。",
    faq_en: [
      { question: "Can hand shape really reveal personality?", answer: "Hand shape correlates with certain personality tendencies based on centuries of observation. While not scientifically proven, many people find accurate insights." },
      { question: "Do hands change with personality growth?", answer: "Yes, palm lines and hand features can change subtly over time, reflecting personal growth and life experiences." },
      { question: "What's the most important feature for personality?", answer: "The Head Line is often considered most important for personality, as it reveals your thinking style and intellectual approach." }
    ],
    faq_zh: [
      { question: "手型真的能揭示性格吗？", answer: "基于几个世纪的观察，手型与某些性格倾向相关。虽然未经科学证明，但许多人发现准确的洞察。" },
      { question: "手会随性格成长而改变吗？", answer: "是的，手纹和手部特征会随时间微妙地变化，反映个人成长和人生经历。" },
      { question: "对性格来说最重要的特征是什么？", answer: "智慧线通常被认为对性格最重要，因为它揭示你的思维方式和智力方法。" }
    ],
    canonical_path: "/palm-reading/analysis/personality",
  },
  {
    id: "family",
    name_en: "Family & Heritage Analysis",
    name_zh: "家庭与传承分析",
    emoji: "👨‍👩‍👧‍👦",
    title_en: "Palm Reading for Family: Your Ancestral Connections",
    title_zh: "手相家庭解读：你的祖先联系",
    meta_description_en: "Discover family insights through palm reading. Learn what your hand features reveal about family relationships and ancestral influences.",
    meta_description_zh: "通过手相发现家庭洞察。了解你的手部特征如何揭示家庭关系和祖先影响。",
    keywords_en: ["palm reading family", "family palm reading", "ancestry palm reading", "relationship palm reading"],
    keywords_zh: ["手相家庭", "家庭手相", "祖先手相", "关系手相解读"],
    overview_en: "Family palm reading examines hand features that reveal your relationship with family members, inherited traits, and ancestral influences. Your hands carry the imprint of your family history and show how you connect with your roots.",
    overview_zh: "手相家庭解读检查揭示你与家庭成员关系、遗传特征和祖先影响的手部特征。你的手承载着你家族历史的印记，显示你如何与根源连接。",
    method_en: "The analysis examines: 1) Jupiter Mount (family influence), 2) Saturn Mount (duty to family), 3) Heart Line patterns (emotional inheritance), 4) Specific family-related markings, 5) Hand shape similarities with family members.",
    method_zh: "分析检查：1）木星丘（家庭影响），2）土星丘（家庭责任），3）感情线模式（情感遗传），4）特定的家庭相关标记，5）与家庭成员的手型相似性。",
    indicators_en: "Key indicators include a well-developed Jupiter Mount (strong family values), specific Saturn Mount markings (family responsibility), Heart Line patterns similar to family members (emotional inheritance), and specific markings indicating family relationships.",
    indicators_zh: "关键指标包括发达的木星丘（强烈的家庭价值观）、特定的土星丘标记（家庭责任）、与家庭成员相似的感情线模式（情感遗传），以及表示家庭关系的特定标记。",
    interpretation_en: "A strong Jupiter Mount indicates strong family ties and values. Deep family lines may suggest significant family influence. Similar hand features with parents indicate inherited traits. Specific markings may reveal family relationship dynamics.",
    interpretation_zh: "强有力的木星丘表示强烈的家庭纽带和价值观。深刻的家庭线可能表示重要的家庭影响。与父母相似的手部特征表示遗传特征。特定的标记可能揭示家庭关系动态。",
    faq_en: [
      { question: "Can palm reading show family relationships?", answer: "Yes, certain hand features and markings are associated with family dynamics and inherited traits." },
      { question: "Do hands reveal ancestral influence?", answer: "Hand features can indicate inherited traits and family patterns that span generations." },
      { question: "Can palm reading predict family events?", answer: "Palm reading shows tendencies and patterns, not specific events. It reveals family dynamics rather than predicting future events." }
    ],
    faq_zh: [
      { question: "手相能显示家庭关系吗？", answer: "是的，某些手部特征和标记与家庭动态和遗传特征相关。" },
      { question: "手能揭示祖先影响吗？", answer: "手部特征可以表示跨越几代人的遗传特征和家庭模式。" },
      { question: "手相能预测家庭事件吗？", answer: "手相显示趋势和模式，而不是具体事件。它揭示家庭动态，而不是预测未来事件。" }
    ],
    canonical_path: "/palm-reading/analysis/family",
  },
  {
    id: "travel",
    name_en: "Travel & Adventure Analysis",
    name_zh: "旅行与冒险分析",
    emoji: "✈️",
    title_en: "Palm Reading for Travel: Your Wanderlust Blueprint",
    title_zh: "手相旅行解读：你的旅行渴望蓝图",
    meta_description_en: "Discover travel insights through palm reading. Learn what your hand features reveal about your love for travel and adventure.",
    meta_description_zh: "通过手相发现旅行洞察。了解你的手部特征如何揭示你对旅行和冒险的热爱。",
    keywords_en: ["palm reading travel", "travel palm reading", "adventure palm reading", "wanderlust palm reading"],
    keywords_zh: ["手相旅行", "旅行手相", "冒险手相", "旅行渴望手相"],
    overview_en: "Travel palm reading examines features that indicate your wanderlust, adventure tendencies, and potential for meaningful travel experiences. Your hands reveal whether you're meant to explore the world and what types of journeys will bring you fulfillment.",
    overview_zh: "手相旅行解读检查表示你的旅行渴望、冒险倾向和有意义旅行体验潜力的特征。你的手揭示你是否注定要探索世界，以及什么样的旅程会给你带来满足感。",
    method_en: "The analysis examines: 1) Travel Lines on the side of the palm, 2) Mars Mount (courage for adventure), 3) Jupiter Mount (ambition for exploration), 4) Sun Line (success in travel), 5) Overall hand flexibility.",
    method_zh: "分析检查：1）手掌侧面的旅行线，2）火星丘（冒险的勇气），3）木星丘（探索的野心），4）太阳线（旅行的成功），5）整体手部灵活性。",
    indicators_en: "Key indicators include visible Travel Lines (indicates significant journeys), prominent Mars Mount (courage for adventure), well-developed Jupiter Mount (ambition for exploration), specific markings indicating travel timing, and flexible hands (adaptability during travel).",
    indicators_zh: "关键指标包括可见的旅行线（表示重要旅程）、突出的火星丘（冒险的勇气）、发达的木星丘（探索的野心）、表示旅行时间的特定标记，以及灵活的手（旅行中的适应力）。",
    interpretation_en: "Multiple Travel Lines indicate several significant journeys. A strong Mars Mount suggests adventurous travel style. A prominent Jupiter Mount indicates ambitious travel goals. The depth of Travel Lines may indicate the significance of each journey.",
    interpretation_zh: "多条旅行线表示多次重要旅程。强有力的火星丘表示冒险的旅行风格。突出的木星丘表示雄心勃勃的旅行目标。旅行线的深度可能表示每次旅程的重要性。",
    faq_en: [
      { question: "Can palm reading predict travel opportunities?", answer: "Palm reading shows your travel tendencies and potential, but opportunities depend on your choices and circumstances." },
      { question: "What if I don't have Travel Lines?", answer: "Not everyone has visible Travel Lines. This doesn't mean you won't travel — it may mean your travel experiences are more spontaneous." },
      { question: "When will my next big trip be?", answer: "Palm reading can indicate general timing through line changes, but specific dates depend on your life circumstances." }
    ],
    faq_zh: [
      { question: "手相能预测旅行机会吗？", answer: "手相显示你的旅行倾向和潜力，但机会取决于你的选择和环境。" },
      { question: "如果我没有旅行线怎么办？", answer: "不是每个人都有一条可见的旅行线。这并不意味着你不会旅行——它可能意味着你的旅行经历更加自发。" },
      { question: "我下一次大旅行什么时候？", answer: "手相可以通过线条变化表示大致时间，但具体日期取决于你的生活环境。" }
    ],
    canonical_path: "/palm-reading/analysis/travel",
  },
  {
    id: "intuition",
    name_en: "Intuition & Psychic Analysis",
    name_zh: "直觉与灵性分析",
    emoji: "🔮",
    title_en: "Palm Reading for Intuition: Your Psychic Potential",
    title_zh: "手相直觉解读：你的灵性潜力",
    meta_description_en: "Discover your intuitive gifts through palm reading. Learn what your hand features reveal about psychic ability and spiritual potential.",
    meta_description_zh: "通过手相发现你的直觉天赋。了解你的手部特征如何揭示灵性能力和精神潜力。",
    keywords_en: ["palm reading intuition", "psychic palm reading", "spiritual palm reading", "intuition palm reading"],
    keywords_zh: ["手相直觉", "灵性手相", "精神手相", "直觉手相解读"],
    overview_en: "Intuition palm reading examines features associated with psychic sensitivity, spiritual awareness, and intuitive gifts. Your hands can reveal your connection to higher consciousness and your potential for spiritual development.",
    overview_zh: "手相直觉解读检查与灵性敏感、精神意识和直觉天赋相关的特征。你的手可以揭示你与更高意识的联系和你的精神发展潜力。",
    method_en: "The analysis examines: 1) Mercury Line (intuitive communication), 2) Neptune Mount (psychic sensitivity), 3) Luna Mount (imagination and intuition), 4) Head Line-Heart Line gap (openness to intuition), 5) Specific intuitive markings.",
    method_zh: "分析检查：1）水星线（直觉沟通），2）海王星丘（灵性敏感），3）月丘（想象力和直觉），4）智慧线-感情线间距（对直觉的开放性），5）特定的直觉标记。",
    indicators_en: "Key indicators include a prominent Mercury Line (intuitive communication), well-developed Neptune Mount (psychic sensitivity), strong Luna Mount (imagination and intuition), a gap between Head and Heart Lines (openness to spiritual matters), and specific star or triangle markings.",
    indicators_zh: "关键指标包括突出的水星线（直觉沟通）、发达的海王星丘（灵性敏感）、强有力的月丘（想象力和直觉）、智慧线和感情线之间的间距（对精神事务的开放性），以及特定的星形或三角形标记。",
    interpretation_en: "A strong Mercury Line indicates intuitive communication abilities. A prominent Neptune Mount suggests psychic sensitivity. A wide gap between Head and Heart Lines indicates openness to spiritual experiences. Luna Mount markings may indicate vivid imagination and strong intuition.",
    interpretation_zh: "强有力的水星线表示直觉沟通能力。突出的海王星丘表示灵性敏感。智慧线和感情线之间的宽间距表示对精神体验的开放性。月丘标记可能表示生动的想象力和强烈的直觉。",
    faq_en: [
      { question: "Can palm reading predict psychic development?", answer: "Palm reading shows potential for intuitive development, but developing these abilities requires practice and dedication." },
      { question: "What if I don't have psychic markers?", answer: "Psychic abilities can develop over time regardless of hand markers. Everyone has intuitive potential — it's about developing it." },
      { question: "How can I develop my intuition based on my palm?", answer: "Focus on strengthening the mounts and lines associated with intuition through meditation, mindfulness, and spiritual practice." }
    ],
    faq_zh: [
      { question: "手相能预测灵性发展吗？", answer: "手相显示直觉发展的潜力，但发展这些能力需要练习和专注。" },
      { question: "如果我没有灵性标记怎么办？", answer: "灵性能力可以随时间发展，无论手部标记如何。每个人都有直觉潜力——关键在于发展它。" },
      { question: "我如何根据我的手相发展直觉？", answer: "通过冥想、正念和灵性练习，专注于加强与直觉相关的丘位和线条。" }
    ],
    canonical_path: "/palm-reading/analysis/intuition",
  },
]

export const PalmAnalysisMap = Object.fromEntries(PalmAnalyses.map(a => [a.id, a]))
