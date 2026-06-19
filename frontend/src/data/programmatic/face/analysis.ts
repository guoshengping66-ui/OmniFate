export interface FaceAnalysis {
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

export const FaceAnalyses: FaceAnalysis[] = [
  {
    id: "personality",
    name_en: "Personality & Character Analysis",
    name_zh: "性格与品格分析",
    emoji: "🧠",
    title_en: "Face Reading for Personality: Decode Your Character",
    title_zh: "面相性格解读：解码你的性格",
    meta_description_en: "Discover your personality through face reading. Learn what your facial features reveal about your character, temperament, and inner nature.",
    meta_description_zh: "通过面相发现你的性格。了解你的面部特征如何揭示你的性格、性情和内在本质。",
    keywords_en: ["face reading personality", "face shape personality", "facial features character", "physiognomy personality"],
    keywords_zh: ["面相性格", "脸型性格", "面部特征性格", "面相学性格"],
    overview_en: "Face reading for personality examines the Five Officials and overall face shape to reveal your core character traits. Each facial feature corresponds to specific personality aspects, creating a comprehensive portrait of who you are at your core.",
    overview_zh: "面相性格解读通过检查五官和整体脸型来揭示你的核心性格特质。每个面部特征对应特定的性格方面，创造你核心自我的全面画像。",
    method_en: "The analysis examines: 1) Overall face shape classification, 2) Forehead (intellect and early life), 3) Eyebrows (emotions and relationships), 4) Eyes (spirit and intelligence), 5) Nose (wealth and self-esteem), 6) Mouth (communication and appetite).",
    method_zh: "分析检查：1）整体脸型分类，2）额头（智力和早年生活），3）眉毛（情感和人际关系），4）眼睛（精神和智慧），5）鼻子（财富和自尊），6）嘴巴（沟通和欲望）。",
    indicators_en: "Key indicators include face shape (determines basic temperament), forehead characteristics (intellectual capacity), eye shape and size (emotional nature), nose structure (financial tendency), mouth shape (communication style), and chin definition (willpower).",
    indicators_zh: "关键指标包括脸型（决定基本性情）、额头特征（智力能力）、眼睛形状和大小（情感本质）、鼻子结构（财务倾向）、嘴巴形状（沟通风格），以及下巴轮廓（意志力）。",
    interpretation_en: "Round faces indicate friendly, approachable personalities. Square faces suggest determination and practicality. Long faces indicate analytical, detail-oriented nature. High foreheads suggest intellectual capacity. Large eyes indicate emotional expressiveness. A strong nose suggests financial capability.",
    interpretation_zh: "圆脸表示友好、平易近人的个性。方脸表示决心和实用性。长脸表示分析、注重细节的天性。高额头表示智力能力。大眼睛表示情感表现力。强有力的鼻子表示财务能力。",
    faq_en: [
      { question: "Can face shape really determine personality?", answer: "Face reading suggests correlations between facial features and personality tendencies. While not scientifically proven, many people find accurate insights." },
      { question: "Do facial features change with age?", answer: "Yes, facial features evolve with age and life experiences, potentially reflecting personal growth and character development." },
      { question: "What's the most important feature for personality?", answer: "The eyes are often considered most important, as they reveal your inner spirit and emotional nature." }
    ],
    faq_zh: [
      { question: "脸型真的能决定性格吗？", answer: "面相学建议面部特征与性格倾向之间存在关联。虽然未经科学证明，但许多人发现准确的洞察。" },
      { question: "面部特征会随年龄改变吗？", answer: "是的，面部特征会随年龄和生活经历而演变，可能反映个人成长和性格发展。" },
      { question: "对性格来说最重要的特征是什么？", answer: "眼睛通常被认为最重要，因为它们揭示你内在的精神和情感本质。" }
    ],
    canonical_path: "/face-reading/analysis/personality",
  },
  {
    id: "career",
    name_en: "Career & Success Analysis",
    name_zh: "事业与成功分析",
    emoji: "💼",
    title_en: "Face Reading for Career: Your Professional Destiny",
    title_zh: "面相事业解读：你的职业命运",
    meta_description_en: "Discover career insights through face reading. Learn what your facial features reveal about your professional potential and success path.",
    meta_description_zh: "通过面相发现事业洞察。了解你的面部特征如何揭示你的职业潜力和成功道路。",
    keywords_en: ["face reading career", "face shape career", "professional face reading", "success face reading"],
    keywords_zh: ["面相事业", "脸型事业", "职业面相", "成功面相"],
    overview_en: "Career face reading examines the forehead (early career success), eyebrows (leadership ability), eyes (decision-making), nose (wealth accumulation), and overall face structure (career potential). These features reveal your natural professional talents and the path to career fulfillment.",
    overview_zh: "面相事业解读检查额头（早期事业成功）、眉毛（领导能力）、眼睛（决策能力）、鼻子（财富积累），以及整体面部结构（事业潜力）。这些特征揭示你的天生专业才能和通往事业满足的道路。",
    method_en: "The analysis examines: 1) Forehead characteristics (career foundation), 2) Eyebrow shape and density (leadership and ambition), 3) Eye characteristics (decision-making ability), 4) Nose structure (wealth potential), 5) Overall face balance (career harmony).",
    method_zh: "分析检查：1）额头特征（事业基础），2）眉毛形状和密度（领导力和野心），3）眼睛特征（决策能力），4）鼻子结构（财富潜力），5）整体面部平衡（事业和谐）。",
    indicators_en: "Key indicators include a high, broad forehead (intellectual career success), strong eyebrows (leadership ability), clear, bright eyes (good judgment), a well-proportioned nose (financial success), and a strong jawline (determination).",
    indicators_zh: "关键指标包括高而宽阔的额头（智力事业成功）、强壮的眉毛（领导能力）、明亮清澈的眼睛（良好的判断力）、比例匀称的鼻子（财务成功），以及强有力的下颌线（决心）。",
    interpretation_en: "A high forehead indicates intellectual career success. Strong, straight eyebrows suggest leadership ability. Bright, clear eyes indicate good judgment. A well-proportioned nose suggests financial success. A strong jaw indicates determination and perseverance.",
    interpretation_zh: "高额头表示智力事业成功。强壮、平直的眉毛表示领导能力。明亮清澈的眼睛表示良好的判断力。比例匀称的鼻子表示财务成功。强有力的下巴表示决心和毅力。",
    faq_en: [
      { question: "Can face reading predict career success?", answer: "Face reading reveals natural talents and potential, but success depends on your efforts and choices. Use it as guidance, not prediction." },
      { question: "What facial features indicate leadership?", answer: "Strong eyebrows, bright eyes, a high forehead, and a strong jawline are all associated with leadership qualities." },
      { question: "Does face reading change with career growth?", answer: "Facial features can evolve with life experiences, potentially reflecting career development and personal growth." }
    ],
    faq_zh: [
      { question: "面相能预测事业成功吗？", answer: "面相揭示天生才能和潜力，但成功取决于你的努力和选择。将其作为指引，而不是预测。" },
      { question: "哪些面部特征表示领导力？", answer: "强壮的眉毛、明亮的眼睛、高额头和强有力的下颌线都与领导品质相关。" },
      { question: "面相会随事业成长而改变吗？", answer: "面部特征会随生活经历而演变，可能反映事业发展和个人成长。" }
    ],
    canonical_path: "/face-reading/analysis/career",
  },
  {
    id: "wealth",
    name_en: "Wealth & Prosperity Analysis",
    name_zh: "财富与繁荣分析",
    emoji: "💰",
    title_en: "Face Reading for Wealth: Your Financial Face",
    title_zh: "面相财富解读：你的财富面相",
    meta_description_en: "Discover wealth insights through face reading. Learn what your nose, chin, and facial features reveal about financial potential.",
    meta_description_zh: "通过面相发现财富洞察。了解你的鼻子、下巴和面部特征如何揭示财务潜力。",
    keywords_en: ["face reading wealth", "nose face reading", "wealth face reading", "financial face reading"],
    keywords_zh: ["面相财富", "鼻子面相", "财富面相", "财务面相"],
    overview_en: "Wealth face reading focuses on the nose (wealth accumulation), mouth (financial communication), chin (long-term wealth), and overall face balance (financial harmony). These features reveal your natural ability to attract and manage wealth.",
    overview_zh: "面相财富解读专注于鼻子（财富积累）、嘴巴（财务沟通）、下巴（长期财富），以及整体面部平衡（财务和谐）。这些特征揭示你吸引和管理财富的天生能力。",
    method_en: "The analysis examines: 1) Nose structure and size (wealth potential), 2) Nostril shape (money management), 3) Mouth shape (financial communication), 4) Chin characteristics (long-term wealth), 5) Overall face balance (financial harmony).",
    method_zh: "分析检查：1）鼻子结构和大小（财富潜力），2）鼻孔形状（金钱管理），3）嘴巴形状（财务沟通），4）下巴特征（长期财富），5）整体面部平衡（财务和谐）。",
    indicators_en: "Key indicators include a high nose bridge (financial success), rounded nose tip (wealth accumulation), well-defined nostrils (money management), a balanced mouth (financial communication), and a strong chin (long-term wealth building).",
    indicators_zh: "关键指标包括高鼻梁（财务成功）、圆润的鼻尖（财富积累）、轮廓分明的鼻孔（金钱管理）、平衡的嘴巴（财务沟通），以及强有力的下巴（长期财富积累）。",
    interpretation_en: "A high, straight nose indicates financial success. A rounded nose tip suggests wealth accumulation ability. Well-defined nostrils indicate good money management. A balanced mouth suggests financial communication skills. A strong chin indicates long-term wealth building.",
    interpretation_zh: "高而直的鼻子表示财务成功。圆润的鼻尖表示财富积累能力。轮廓分明的鼻孔表示良好的金钱管理。平衡的嘴巴表示财务沟通技巧。强有力的下巴表示长期财富积累。",
    faq_en: [
      { question: "Can face reading predict wealth?", answer: "Face reading shows wealth potential and earning ability, not specific amounts. Use it to understand your financial tendencies." },
      { question: "What nose shape indicates wealth?", answer: "A high nose bridge, rounded tip, and well-defined nostrils are traditionally associated with financial success." },
      { question: "Can face features change wealth potential?", answer: "While basic features are fixed, subtle changes over time may reflect changing financial circumstances and attitudes." }
    ],
    faq_zh: [
      { question: "面相能预测财富吗？", answer: "面相显示财富潜力和赚钱能力，而不是具体金额。用它来理解你的财务倾向。" },
      { question: "什么鼻子形状表示财富？", answer: "高鼻梁、圆润的鼻尖和轮廓分明的鼻孔传统上与财务成功相关。" },
      { question: "面部特征能改变财富潜力吗？", answer: "虽然基本特征是固定的，但随时间的微妙变化可能反映不断变化的财务状况和态度。" }
    ],
    canonical_path: "/face-reading/analysis/wealth",
  },
  {
    id: "relationships",
    name_en: "Love & Relationship Analysis",
    name_zh: "爱情与感情分析",
    emoji: "💕",
    title_en: "Face Reading for Love: Your Romantic Face",
    title_zh: "面相爱情解读：你的恋爱面相",
    meta_description_en: "Discover love insights through face reading. Learn what your eyes, mouth, and facial features reveal about your romantic destiny.",
    meta_description_zh: "通过面相发现爱情洞察。了解你的眼睛、嘴巴和面部特征如何揭示你的恋爱命运。",
    keywords_en: ["face reading love", "eye face reading", "love face reading", "romance face reading"],
    keywords_zh: ["面相爱情", "眼睛面相", "爱情面相", "浪漫面相"],
    overview_en: "Love face reading examines the eyes (emotional expression), mouth (romantic communication), cheeks (social nature), and overall face balance (relationship harmony). These features reveal your romantic tendencies, ideal partner type, and relationship patterns.",
    overview_zh: "面相爱情解读检查眼睛（情感表达）、嘴巴（浪漫沟通）、脸颊（社交天性），以及整体面部平衡（关系和谐）。这些特征揭示你的恋爱倾向、理想伴侣类型和关系模式。",
    method_en: "The analysis examines: 1) Eye shape and size (emotional nature), 2) Eye spacing (relationship style), 3) Mouth shape (romantic communication), 4) Cheekbone structure (social nature), 5) Overall face balance (relationship harmony).",
    method_zh: "分析检查：1）眼睛形状和大小（情感本质），2）眼睛间距（关系风格），3）嘴巴形状（浪漫沟通），4）颧骨结构（社交天性），5）整体面部平衡（关系和谐）。",
    indicators_en: "Key indicators include large, expressive eyes (emotional depth), close-set eyes (intimate relationship style), a curved upper lip (romantic nature), prominent cheekbones (social success), and a balanced face (relationship harmony).",
    indicators_zh: "关键指标包括大而富有表现力的眼睛（情感深度）、间距近的眼睛（亲密关系风格）、弯曲的上唇（浪漫天性）、突出的颧骨（社交成功），以及平衡的面部（关系和谐）。",
    interpretation_en: "Large eyes indicate emotional depth and expressiveness. Close-set eyes suggest intimate, focused relationships. A curved upper lip indicates romantic nature. Prominent cheekbones suggest social success. A balanced face indicates relationship harmony.",
    interpretation_zh: "大眼睛表示情感深度和表现力。间距近的眼睛表示亲密、专注的关系。弯曲的上唇表示浪漫天性。突出的颧骨表示社交成功。平衡的面部表示关系和谐。",
    faq_en: [
      { question: "Can face reading predict romantic success?", answer: "Face reading reveals romantic tendencies and compatibility, but relationship success depends on your choices and efforts." },
      { question: "What eye shape indicates romantic nature?", answer: "Large, expressive eyes with a slight upward tilt at the outer corners are traditionally associated with romantic disposition." },
      { question: "Can face features change love life?", answer: "While basic features are fixed, subtle changes may reflect evolving relationship patterns and emotional growth." }
    ],
    faq_zh: [
      { question: "面相能预测恋爱成功吗？", answer: "面相揭示恋爱倾向和兼容性，但关系成功取决于你的选择和努力。" },
      { question: "什么眼睛形状表示浪漫天性？", answer: "大而富有表现力的眼睛，外眼角略微上翘，传统上与浪漫倾向相关。" },
      { question: "面部特征能改变爱情生活吗？", answer: "虽然基本特征是固定的，但微妙的变化可能反映不断演变的关系模式和情感成长。" }
    ],
    canonical_path: "/face-reading/analysis/relationships",
  },
  {
    id: "health",
    name_en: "Health & Wellness Analysis",
    name_zh: "健康与养生分析",
    emoji: "🏥",
    title_en: "Face Reading for Health: Your Wellness Map",
    title_zh: "面相健康解读：你的养生地图",
    meta_description_en: "Discover health insights through face reading. Learn what your facial features reveal about your physical constitution and wellness tendencies.",
    meta_description_zh: "通过面相发现健康洞察。了解你的面部特征如何揭示你的体质和养生倾向。",
    keywords_en: ["face reading health", "face health reading", "wellness face reading", "health face reading"],
    keywords_zh: ["面相健康", "健康面相", "养生面相", "健康面相解读"],
    overview_en: "Health face reading examines facial color (current health state), skin texture (vitality), specific facial zones (organ health), and overall face balance (constitutional strength). Chinese face reading maps facial areas to internal organs for health assessment.",
    overview_zh: "面相健康解读检查面部颜色（当前健康状态）、皮肤纹理（活力）、特定面部区域（器官健康），以及整体面部平衡（体质强度）。中国面相学将面部区域映射到内脏器官进行健康评估。",
    method_en: "The analysis examines: 1) Overall face color (vitality), 2) Forehead zone (heart and circulation), 3) Nose zone (digestive system), 4) Cheek zones (respiratory health), 5) Chin zone (reproductive health), 6) Skin texture and condition.",
    method_zh: "分析检查：1）整体面色（活力），2）额头区域（心脏和循环），3）鼻子区域（消化系统），4）脸颊区域（呼吸系统健康），5）下巴区域（生殖系统健康），6）皮肤纹理和状况。",
    indicators_en: "Key indicators include a healthy, rosy complexion (good circulation), clear skin (good organ function), specific color changes in facial zones (organ health indicators), balanced facial features (constitutional strength), and specific markings (health tendencies).",
    indicators_zh: "关键指标包括健康、红润的肤色（良好的循环）、清澈的皮肤（良好的器官功能）、面部区域的特定颜色变化（器官健康指标）、平衡的面部特征（体质强度），以及特定标记（健康倾向）。",
    interpretation_en: "A rosy complexion indicates good circulation and vitality. Pale skin may suggest anemia or low energy. Redness in specific zones may indicate organ stress. Clear skin suggests good overall health. Facial balance indicates constitutional strength.",
    interpretation_zh: "红润的肤色表示良好的循环和活力。苍白的皮肤可能表示贫血或低能量。特定区域的红肿可能表示器官压力。清澈的皮肤表示良好的整体健康。面部平衡表示体质强度。",
    faq_en: [
      { question: "Can face reading predict illness?", answer: "Face reading can indicate health tendencies and potential areas of concern, but it cannot predict specific illnesses. Always consult healthcare professionals." },
      { question: "How accurate is face reading for health?", answer: "Face reading provides general health insights, not medical diagnoses. Use it as a complementary wellness tool." },
      { question: "Can facial features change with health?", answer: "Yes, facial color, skin condition, and certain features can change with health status and lifestyle." }
    ],
    faq_zh: [
      { question: "面相能预测疾病吗？", answer: "面相可以表示健康倾向和潜在的关注领域，但它不能预测特定疾病。请始终咨询医疗专业人员。" },
      { question: "面相健康解读有多准确？", answer: "面相提供一般的健康洞察，而不是医学诊断。将其作为补充的健康工具。" },
      { question: "面部特征会随健康改变吗？", answer: "是的，面部颜色、皮肤状况和某些特征会随健康状况和生活方式而改变。" }
    ],
    canonical_path: "/face-reading/analysis/health",
  },
  {
    id: "fortune",
    name_en: "Fortune & Luck Analysis",
    name_zh: "运势与运气分析",
    emoji: "🍀",
    title_en: "Face Reading for Fortune: Your Luck Potential",
    title_zh: "面相运势解读：你的运气潜力",
    meta_description_en: "Discover fortune insights through face reading. Learn what your facial features reveal about your luck, destiny, and life fortune.",
    meta_description_zh: "通过面相发现运势洞察。了解你的面部特征如何揭示你的运气、命运和人生运势。",
    keywords_en: ["face reading fortune", "luck face reading", "destiny face reading", "fortune face reading"],
    keywords_zh: ["面相运势", "运气面相", "命运面相", "运势面相"],
    overview_en: "Fortune face reading examines overall face balance (life fortune), specific auspicious markings (luck indicators), the Three Divisions for life timing, and Five Officials harmony for overall destiny assessment. This provides a comprehensive view of your life fortune pattern.",
    overview_zh: "面相运势解读检查整体面部平衡（人生运势）、特定的吉祥标记（运气指标）、三停（用于人生时机），以及五官和合（用于整体命运评估）。这提供了你人生运势模式的全面视图。",
    method_en: "The analysis examines: 1) Overall face balance (life fortune), 2) Three Divisions for life timing, 3) Five Officials harmony, 4) Auspicious markings (lucky signs), 5) Face proportion and symmetry.",
    method_zh: "分析检查：1）整体面部平衡（人生运势），2）三停（用于人生时机），3）五官和合，4）吉祥标记（幸运标志），5）面部比例和对称性。",
    indicators_en: "Key indicators include a balanced, symmetrical face (good fortune), specific lucky markings (stars, triangles, crosses), harmonious Five Officials (life harmony), well-proportioned Three Divisions (balanced life timing), and healthy, radiant complexion (positive energy).",
    indicators_zh: "关键指标包括平衡、对称的面部（好运）、特定的幸运标记（星形、三角形、十字）、和谐的五官（生活和谐）、比例匀称的三停（平衡的人生时机），以及健康、容光焕发的肤色（正能量）。",
    interpretation_en: "A balanced, symmetrical face indicates good overall fortune. Specific lucky markings enhance fortune potential. Harmonious Five Officials suggest life balance. Well-proportioned Three Divisions indicate balanced life phases. A radiant complexion suggests positive energy flow.",
    interpretation_zh: "平衡、对称的面部表示良好的整体运势。特定的幸运标记增强运势潜力。和谐的五官表示生活平衡。比例匀称的三停表示平衡的人生阶段。容光焕发的肤色表示正能量流动。",
    faq_en: [
      { question: "Can face reading predict future fortune?", answer: "Face reading reveals fortune tendencies and potential, not specific future events. Use it to understand your life patterns." },
      { question: "What facial features indicate good luck?", answer: "A balanced face, harmonious features, specific lucky markings, and a radiant complexion are all associated with good fortune." },
      { question: "Can fortune change based on face changes?", answer: "While basic features are fixed, subtle changes over time may reflect evolving fortune patterns and life circumstances." }
    ],
    faq_zh: [
      { question: "面相能预测未来运势吗？", answer: "面相揭示运势趋势和潜力，而不是具体的未来事件。用它来理解你的人生模式。" },
      { question: "哪些面部特征表示好运？", answer: "平衡的面部、和谐的特征、特定的幸运标记和容光焕发的肤色都与好运相关。" },
      { question: "运势会随面部变化而改变吗？", answer: "虽然基本特征是固定的，但随时间的微妙变化可能反映不断演变的运势模式和生活环境。" }
    ],
    canonical_path: "/face-reading/analysis/fortune",
  },
]

export const FaceAnalysisMap = Object.fromEntries(FaceAnalyses.map(a => [a.id, a]))
