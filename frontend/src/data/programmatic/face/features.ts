export interface FaceFeature {
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
  location_en: string
  location_zh: string
  interpretations: {
    large_en: string
    large_zh: string
    small_en: string
    small_zh: string
    wide_set_en: string
    wide_set_zh: string
    close_set_en: string
    close_set_zh: string
    upturned_en: string
    upturned_zh: string
    downturned_en: string
    downturned_zh: string
  }

  // FAQ
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>

  // Internal Linking
  related_features: string[]

  // Canonical
  canonical_path: string
}

export const FaceFeatures: FaceFeature[] = [
  {
    id: "eyes",
    name_en: "Eyes",
    name_zh: "眼睛",
    emoji: "👁️",

    title_en: "Eye Shape Meaning in Face Reading | Physiognomy Guide",
    title_zh: "眼型面相含义 | 面相学完整指南",
    meta_description_en: "Discover what your eye shape reveals about your personality in face reading. Learn the meanings of large, small, wide-set, and close-set eyes in Chinese physiognomy.",
    meta_description_zh: "探索眼型在面相中揭示的性格特征。了解大眼、小眼、宽眼距和窄眼距在中华面相学中的含义。",
    keywords_en: ["eye shape meaning face reading", "physiognomy eyes", "face reading eyes", "eye shape personality", "chinese face reading eyes"],
    keywords_zh: ["眼型面相", "面相眼睛", "眼睛面相", "眼型性格", "中华面相眼睛"],

    overview_en: "The eyes are considered the windows to the soul in face reading. They reveal a person's emotional nature, intelligence, and inner character. The shape, size, spacing, and expression of the eyes provide deep insights into personality and destiny.",
    overview_zh: "在面相学中，眼睛被认为是心灵的窗户。它们揭示一个人的情感本质、智力和内在性格。眼睛的形状、大小、间距和表情提供了对性格和命运的深刻洞察。",
    location_en: "The eyes are located in the upper third of the face, between the forehead and the nose.",
    location_zh: "眼睛位于面部上三分之一处，在额头和鼻子之间。",
    interpretations: {
      large_en: "Large eyes indicate an open, expressive personality with strong emotional awareness. These individuals are often creative, empathetic, and socially outgoing.",
      large_zh: "大眼睛表示开放、富有表现力的性格，具有强烈的情感意识。这些人通常有创造力、有同理心、社交活跃。",
      small_en: "Small eyes indicate a focused, detail-oriented personality with strong analytical abilities. These individuals are often observant, cautious, and methodical in their approach.",
      small_zh: "小眼睛表示专注、注重细节的性格，具有强大的分析能力。这些人通常善于观察、谨慎、做事有条理。",
      wide_set_en: "Wide-set eyes indicate an independent, creative personality with a broad perspective. These individuals are often open-minded, adventurous, and comfortable with change.",
      wide_set_zh: "宽眼距表示独立、有创造力的性格，具有广阔的视野。这些人通常思想开放、喜欢冒险、适应变化能力强。",
      close_set_en: "Close-set eyes indicate an intense, focused personality with strong attention to detail. These individuals are often determined, ambitious, and deeply passionate about their interests.",
      close_set_zh: "窄眼距表示专注、强烈的性格，对细节有高度关注。这些人通常坚定、有抱负、对自己的兴趣充满热情。",
      upturned_en: "Upturned eyes indicate a cheerful, optimistic personality with a positive outlook on life. These individuals are often naturally happy, energetic, and resilient in the face of challenges.",
      upturned_zh: "上扬的眼睛表示开朗、乐观的性格，对生活持积极态度。这些人通常天生快乐、精力充沛、面对挑战时有韧性。",
      downturned_en: "Downturned eyes indicate a gentle, empathetic personality with deep emotional sensitivity. These individuals are often compassionate, nurturing, and highly attuned to others' feelings.",
      downturned_zh: "下垂的眼睛表示温柔、有同理心的性格，情感敏感度高。这些人通常富有同情心、善于照顾他人、对他人感受高度敏感。"
    },

    faq_en: [
      { question: "What do large eyes mean in face reading?", answer: "Large eyes indicate an open, expressive personality with strong emotional awareness. They suggest creativity, empathy, and social confidence. In Chinese face reading, large eyes are associated with good fortune and strong interpersonal skills." },
      { question: "What do small eyes indicate about personality?", answer: "Small eyes suggest a focused, detail-oriented personality with strong analytical abilities. These individuals are often observant, cautious, and methodical. They tend to be more introverted but highly perceptive." },
      { question: "How does eye spacing affect personality?", answer: "Wide-set eyes indicate independence and creativity, while close-set eyes suggest intensity and focus. Eye spacing in face reading reflects how a person processes information and interacts with the world." },
      { question: "Can eye shape change over time?", answer: "While the basic shape of eyes doesn't change significantly, the expression and surrounding features can change with age and life experiences, potentially affecting the overall face reading interpretation." }
    ],
    faq_zh: [
      { question: "大眼睛在面相中代表什么？", answer: "大眼睛表示开放、富有表现力的性格，具有强烈的情感意识。它们暗示创造力、同理心和社交自信。在中华面相学中，大眼睛与好运和强大的人际交往能力相关。" },
      { question: "小眼睛对性格有什么暗示？", answer: "小眼睛表示专注、注重细节的性格，具有强大的分析能力。这些人通常善于观察、谨慎、做事有条理。他们往往更内向但高度敏锐。" },
      { question: "眼间距如何影响性格？", answer: "宽眼距表示独立和创造力，而窄眼距表示专注和强烈。面相学中的眼间距反映了一个人处理信息和与世界互动的方式。" },
      { question: "眼型会随时间变化吗？", answer: "虽然眼睛的基本形状不会显著变化，但表情和周围特征会随着年龄和生活经历而改变，可能会影响整体面相解读。" }
    ],

    related_features: ["eyebrows", "nose", "mouth"],

    canonical_path: "/face-reading/features/eyes"
  },
  {
    id: "eyebrows",
    name_en: "Eyebrows",
    name_zh: "眉毛",
    emoji: "🤨",

    title_en: "Eyebrow Shape Meaning in Face Reading | Physiognomy Guide",
    title_zh: "眉型面相含义 | 面相学完整指南",
    meta_description_en: "Discover what your eyebrow shape reveals about your personality in face reading. Learn the meanings of thick, thin, arched, and straight eyebrows in Chinese physiognomy.",
    meta_description_zh: "探索眉型在面相中揭示的性格特征。了解浓眉、细眉、弯眉和直眉在中华面相学中的含义。",
    keywords_en: ["eyebrow shape meaning face reading", "physiognomy eyebrows", "face reading eyebrows", "eyebrow personality", "chinese face reading eyebrows"],
    keywords_zh: ["眉型面相", "面相眉毛", "眉毛面相", "眉型性格", "中华面相眉毛"],

    overview_en: "Eyebrows in face reading represent a person's health, emotional temperament, and social relationships. The shape, thickness, length, and direction of the eyebrows provide insights into personality traits and potential life patterns.",
    overview_zh: "面相学中的眉毛代表一个人的健康、情感气质和社会关系。眉毛的形状、粗细、长度和方向提供了对性格特征和潜在生活模式的洞察。",
    location_en: "The eyebrows are located above the eyes, on the brow ridge of the forehead.",
    location_zh: "眉毛位于眼睛上方，在额头的眉骨上。",
    interpretations: {
      large_en: "Thick, well-shaped eyebrows indicate strong vitality, good health, and a generous nature. These individuals are often confident, determined, and have strong family ties.",
      large_zh: "浓密、形状良好的眉毛表示旺盛的生命力、健康的身体和慷慨的性格。这些人通常自信、坚定，有强烈的家庭观念。",
      small_en: "Thin eyebrows indicate a refined, sensitive personality with attention to aesthetics. These individuals are often detail-oriented, artistic, and may be more emotionally reserved.",
      small_zh: "细眉表示精致、敏感的性格，注重美学。这些人通常注重细节、有艺术气质，可能在情感上更保守。",
      wide_set_en: "Well-spaced eyebrows (with a wide gap between them) indicate an open-minded, tolerant personality. These individuals are often patient, easy-going, and good at resolving conflicts.",
      wide_set_zh: "间距较宽的眉毛（两眉之间有较大间隙）表示思想开放、宽容的性格。这些人通常耐心、随和、善于解决冲突。",
      close_set_en: "Close-set eyebrows indicate an intense, passionate personality with strong focus. These individuals are often determined, hardworking, and may have a tendency toward worry or overthinking.",
      close_set_zh: "间距较近的眉毛表示专注、热情的性格。这些人通常坚定、勤奋，可能有担忧或过度思考的倾向。",
      upturned_en: "Upturned eyebrows indicate an optimistic, cheerful personality with a positive outlook. These individuals are often energetic, enthusiastic, and naturally attract good fortune.",
      upturned_zh: "上扬的眉毛表示乐观、开朗的性格，持积极态度。这些人通常精力充沛、热情，自然吸引好运。",
      downturned_en: "Downturned eyebrows indicate a serious, thoughtful personality with a calm demeanor. These individuals are often reliable, dependable, and have a strong sense of responsibility.",
      downturned_zh: "下垂的眉毛表示严肃、深思熟虑的性格，举止沉稳。这些人通常可靠、值得信赖，有强烈的责任感。"
    },

    faq_en: [
      { question: "What do thick eyebrows mean in face reading?", answer: "Thick eyebrows indicate strong vitality, good health, and a generous nature. They suggest confidence, determination, and strong family ties. In Chinese face reading, thick eyebrows are considered a sign of good fortune." },
      { question: "What do thin eyebrows indicate?", answer: "Thin eyebrows suggest a refined, sensitive personality with attention to aesthetics. These individuals are often detail-oriented and artistic, but may be more emotionally reserved than those with thicker brows." },
      { question: "How does eyebrow spacing affect personality?", answer: "Wide spacing indicates tolerance and patience, while close spacing suggests intensity and focus. The gap between eyebrows in face reading reflects emotional temperament and social behavior." },
      { question: "Can eyebrow shape change with age?", answer: "Yes, eyebrow shape can change with age, weight fluctuations, and grooming habits. These changes may affect face reading interpretations, though the underlying personality traits remain relatively stable." }
    ],
    faq_zh: [
      { question: "浓眉在面相中代表什么？", answer: "浓眉表示旺盛的生命力、健康的身体和慷慨的性格。它们暗示自信、坚定和强烈的家庭观念。在中华面相学中，浓眉被认为是好运的标志。" },
      { question: "细眉对性格有什么暗示？", answer: "细眉表示精致、敏感的性格，注重美学。这些人通常注重细节、有艺术气质，但可能比浓眉的人在情感上更保守。" },
      { question: "眉间距如何影响性格？", answer: "宽间距表示宽容和耐心，而窄间距表示专注和强烈。面相学中的眉间距反映了情感气质和社会行为。" },
      { question: "眉型会随年龄变化吗？", answer: "是的，眉型会随着年龄、体重变化和修眉习惯而改变。这些变化可能会影响面相解读，但潜在的性格特征保持相对稳定。" }
    ],

    related_features: ["eyes", "forehead", "nose"],

    canonical_path: "/face-reading/features/eyebrows"
  },
  {
    id: "nose",
    name_en: "Nose",
    name_zh: "鼻子",
    emoji: "👃",

    title_en: "Nose Shape Meaning in Face Reading | Physiognomy Guide",
    title_zh: "鼻型面相含义 | 面相学完整指南",
    meta_description_en: "Discover what your nose shape reveals about wealth and personality in face reading. Learn the meanings of different nose types in Chinese physiognomy.",
    meta_description_zh: "探索鼻型在面相中揭示的财富和性格特征。了解不同类型鼻子在中华面相学中的含义。",
    keywords_en: ["nose shape meaning face reading", "physiognomy nose", "face reading nose", "nose personality", "wealth face reading nose"],
    keywords_zh: ["鼻型面相", "面相鼻子", "鼻子面相", "鼻型性格", "财富面相鼻子"],

    overview_en: "The nose in face reading represents wealth, career success, and self-esteem. Known as the 'Wealth Palace' in Chinese physiognomy, the nose shape, size, and features reveal information about financial potential and personal drive.",
    overview_zh: "面相学中的鼻子代表财富、事业成功和自尊。在中华面相学中被称为'财帛宫'，鼻子的形状、大小和特征揭示了财务潜力和个人驱动力的信息。",
    location_en: "The nose is located in the center of the face, between the eyes and the mouth.",
    location_zh: "鼻子位于面部中央，在眼睛和嘴巴之间。",
    interpretations: {
      large_en: "A large, well-proportioned nose indicates strong financial potential, leadership ability, and good fortune. These individuals are often ambitious, determined, and have a natural talent for managing money.",
      large_zh: "大而比例匀称的鼻子表示强大的财务潜力、领导能力和好运。这些人通常有抱负、坚定，有管理金钱的天赋。",
      small_en: "A small nose indicates a creative, detail-oriented personality. These individuals may be more focused on personal relationships than material wealth, and often have strong artistic abilities.",
      small_zh: "小鼻子表示有创造力、注重细节的性格。这些人可能更关注人际关系而非物质财富，通常有很强的艺术能力。",
      wide_set_en: "A wide nose bridge indicates confidence, stability, and strong willpower. These individuals are often reliable, practical, and have a grounded approach to life.",
      wide_set_zh: "宽鼻梁表示自信、稳定和强大的意志力。这些人通常可靠、务实，对生活有脚踏实地的态度。",
      close_set_en: "A narrow nose bridge indicates a sensitive, perceptive personality. These individuals are often intuitive, analytical, and may have a tendency toward perfectionism.",
      close_set_zh: "窄鼻梁表示敏感、有洞察力的性格。这些人通常直觉敏锐、善于分析，可能有完美主义倾向。",
      upturned_en: "An upturned nose indicates a cheerful, optimistic personality with a youthful spirit. These individuals are often energetic, curious, and enjoy exploring new experiences.",
      upturned_zh: "朝天鼻表示开朗、乐观的性格，有年轻的心态。这些人通常精力充沛、好奇，喜欢探索新体验。",
      downturned_en: "A downturned nose indicates a serious, thoughtful personality with strong analytical abilities. These individuals are often methodical, reliable, and have a deep sense of responsibility.",
      downturned_zh: "鹰钩鼻表示严肃、深思熟虑的性格，有强大的分析能力。这些人通常有条理、可靠，有强烈的责任感。"
    },

    faq_en: [
      { question: "What does nose shape mean in face reading?", answer: "In face reading, the nose represents wealth, career success, and self-esteem. A well-proportioned nose indicates good financial potential and leadership ability, while other features provide additional personality insights." },
      { question: "Which nose shape is considered lucky?", answer: "In Chinese face reading, a straight, well-proportioned nose with a rounded tip is considered most auspicious for wealth. It's called the 'Lion Nose' and indicates strong financial potential." },
      { question: "How does nose size relate to wealth?", answer: "A larger nose often correlates with stronger financial potential and material success. However, this is just one factor — other facial features and personal effort also play important roles." },
      { question: "Can nose shape change with age?", answer: "The nose continues to grow throughout life, and its shape can change with age. These changes may affect face reading interpretations, though the underlying personality traits remain relatively stable." }
    ],
    faq_zh: [
      { question: "鼻型在面相中代表什么？", answer: "在面相学中，鼻子代表财富、事业成功和自尊。比例匀称的鼻子表示良好的财务潜力和领导能力，而其他特征提供额外的性格洞察。" },
      { question: "哪种鼻型被认为最幸运？", answer: "在中华面相学中，笔直、比例匀称、鼻尖圆润的鼻子被认为最有财运。它被称为'狮子鼻'，表示强大的财务潜力。" },
      { question: "鼻子大小与财富有什么关系？", answer: "较大的鼻子通常与更强的财务潜力和物质成功相关。然而，这只是其中一个因素——其他面部特征和个人努力也起着重要作用。" },
      { question: "鼻型会随年龄变化吗？", answer: "鼻子在整个生命过程中不断生长，其形状会随年龄变化。这些变化可能会影响面相解读，但潜在的性格特征保持相对稳定。" }
    ],

    related_features: ["eyes", "mouth", "chin"],

    canonical_path: "/face-reading/features/nose"
  },
  {
    id: "mouth",
    name_en: "Mouth",
    name_zh: "嘴巴",
    emoji: "👄",

    title_en: "Mouth Shape Meaning in Face Reading | Physiognomy Guide",
    title_zh: "嘴型面相含义 | 面相学完整指南",
    meta_description_en: "Discover what your mouth shape reveals about communication and personality in face reading. Learn the meanings of different mouth types in Chinese physiognomy.",
    meta_description_zh: "探索嘴型在面相中揭示的沟通能力和性格特征。了解不同类型嘴巴在中华面相学中的含义。",
    keywords_en: ["mouth shape meaning face reading", "physiognomy mouth", "face reading mouth", "mouth personality", "communication face reading"],
    keywords_zh: ["嘴型面相", "面相嘴巴", "嘴巴面相", "嘴型性格", "沟通面相"],

    overview_en: "The mouth in face reading represents communication, expression, and appetite for life. Known as the 'Communication Palace,' the mouth shape and features reveal information about social skills, eloquence, and how a person expresses themselves.",
    overview_zh: "面相学中的嘴巴代表沟通、表达和对生活的热情。被称为'出纳宫'，嘴巴的形状和特征揭示了社交能力、口才以及一个人如何表达自己的信息。",
    location_en: "The mouth is located in the lower third of the face, between the nose and the chin.",
    location_zh: "嘴巴位于面部下三分之一处，在鼻子和下巴之间。",
    interpretations: {
      large_en: "A large mouth indicates strong communication skills, generosity, and a love of life. These individuals are often outgoing, charismatic, and have a natural talent for public speaking.",
      large_zh: "大嘴巴表示强大的沟通能力、慷慨和对生活的热爱。这些人通常外向、有魅力，有公开演讲的天赋。",
      small_en: "A small mouth indicates a refined, diplomatic personality. These individuals are often careful with their words, tactful, and may prefer listening to speaking.",
      small_zh: "小嘴巴表示精致、有外交手腕的性格。这些人通常说话谨慎、机智，可能更喜欢倾听而非说话。",
      wide_set_en: "Wide-set lips indicate expressiveness, sensuality, and emotional warmth. These individuals are often passionate, romantic, and have a natural ability to connect with others.",
      wide_set_zh: "宽嘴唇表示表现力、感性和情感温暖。这些人通常热情、浪漫，有与他人建立联系的天赋。",
      close_set_en: "Thin lips indicate discipline, self-control, and analytical thinking. These individuals are often practical, efficient, and may have a more reserved communication style.",
      close_set_zh: "薄嘴唇表示自律、自制和分析性思维。这些人通常务实、高效，可能有更保守的沟通风格。",
      upturned_en: "An upturned mouth (natural smile) indicates an optimistic, cheerful personality. These individuals are often naturally happy, approachable, and tend to attract positive experiences.",
      upturned_zh: "上扬的嘴巴（自然微笑）表示乐观、开朗的性格。这些人通常天生快乐、平易近人，倾向于吸引积极的经历。",
      downturned_en: "A downturned mouth indicates a serious, thoughtful personality with a critical mind. These individuals are often analytical, discerning, and may have high standards for themselves and others.",
      downturned_zh: "下垂的嘴巴表示严肃、深思熟虑的性格，有批判性思维。这些人通常善于分析、有眼光，可能对自己和他人有高标准。"
    },

    faq_en: [
      { question: "What does mouth shape mean in face reading?", answer: "In face reading, the mouth represents communication, expression, and appetite for life. A large mouth indicates strong social skills and charisma, while other features provide additional personality insights." },
      { question: "What do thin lips indicate?", answer: "Thin lips suggest discipline, self-control, and analytical thinking. These individuals are often practical and efficient, with a more reserved communication style compared to those with fuller lips." },
      { question: "How does mouth position affect personality?", answer: "An upturned mouth indicates optimism and cheerfulness, while a downturned mouth suggests a more serious, analytical nature. Mouth position reflects emotional temperament and social behavior." },
      { question: "Can mouth shape change with age?", answer: "Yes, the mouth and lips can change shape with age, weight changes, and other factors. These changes may affect face reading interpretations over time." }
    ],
    faq_zh: [
      { question: "嘴型在面相中代表什么？", answer: "在面相学中，嘴巴代表沟通、表达和对生活的热情。大嘴巴表示强大的社交能力和魅力，而其他特征提供额外的性格洞察。" },
      { question: "薄嘴唇对性格有什么暗示？", answer: "薄嘴唇表示自律、自制和分析性思维。这些人通常务实、高效，与丰满嘴唇的人相比，沟通风格更保守。" },
      { question: "嘴巴位置如何影响性格？", answer: "上扬的嘴巴表示乐观和开朗，而下垂的嘴巴表示更严肃、更分析的性格。嘴巴位置反映了情感气质和社会行为。" },
      { question: "嘴型会随年龄变化吗？", answer: "是的，嘴巴和嘴唇会随着年龄、体重变化和其他因素而改变形状。这些变化可能会随时间影响面相解读。" }
    ],

    related_features: ["nose", "chin", "eyes"],

    canonical_path: "/face-reading/features/mouth"
  },
  {
    id: "forehead",
    name_en: "Forehead",
    name_zh: "额头",
    emoji: "🧠",

    title_en: "Forehead Shape Meaning in Face Reading | Physiognomy Guide",
    title_zh: "额型面相含义 | 面相学完整指南",
    meta_description_en: "Discover what your forehead shape reveals about intelligence and fortune in face reading. Learn the meanings of different forehead types in Chinese physiognomy.",
    meta_description_zh: "探索额型在面相中揭示的智力和运势特征。了解不同类型额头在中华面相学中的含义。",
    keywords_en: ["forehead shape meaning face reading", "physiognomy forehead", "face reading forehead", "forehead personality", "intelligence face reading"],
    keywords_zh: ["额型面相", "面相额头", "额头面相", "额型性格", "智力面相"],

    overview_en: "The forehead in face reading represents intelligence, fortune, and early life experiences. Known as the 'Heavenly Court,' the forehead shape and features reveal information about mental capabilities, family background, and potential for success.",
    overview_zh: "面相学中的额头代表智力、运势和早期生活经历。被称为'天庭'，额头的形状和特征揭示了心智能力、家庭背景和成功潜力的信息。",
    location_en: "The forehead is located in the upper third of the face, from the hairline to the eyebrows.",
    location_zh: "额头位于面部上三分之一处，从发际线到眉毛。",
    interpretations: {
      large_en: "A large, broad forehead indicates strong intelligence, good fortune, and leadership potential. These individuals are often intellectual, ambitious, and have a natural aptitude for learning.",
      large_zh: "宽大的额头表示强大的智力、好运和领导潜力。这些人通常聪明、有抱负，有学习的天赋。",
      small_en: "A small forehead indicates a practical, grounded personality. These individuals may be more action-oriented than intellectual, with strong hands-on skills and a focus on immediate results.",
      small_zh: "小额头表示务实、脚踏实地的性格。这些人可能更注重行动而非理论，有很强的动手能力，专注于即时结果。",
      wide_set_en: "A high forehead indicates strong mental capacity, good memory, and analytical abilities. These individuals are often good at planning, strategizing, and long-term thinking.",
      wide_set_zh: "高额头表示强大的心智能力、良好的记忆力和分析能力。这些人通常擅长规划、战略和长期思考。",
      close_set_en: "A low forehead indicates a more practical, hands-on approach to life. These individuals are often good at physical activities, crafts, and prefer direct experience over theoretical knowledge.",
      close_set_zh: "低额头表示更务实、更注重实践的生活态度。这些人通常擅长体育活动、手工，更喜欢直接经验而非理论知识。",
      upturned_en: "A rounded forehead indicates creativity, imagination, and artistic sensibility. These individuals are often naturally creative, expressive, and have a strong appreciation for beauty.",
      upturned_zh: "圆润的额头表示创造力、想象力和艺术敏感性。这些人通常天生有创造力、善于表达，对美有强烈的鉴赏力。",
      downturned_en: "A flat or angular forehead indicates a logical, analytical personality. These individuals are often systematic thinkers, detail-oriented, and excel in technical or scientific fields.",
      downturned_zh: "平直或有棱角的额头表示逻辑性强、善于分析的性格。这些人通常是有条理的思考者、注重细节，在技术或科学领域表现出色。"
    },

    faq_en: [
      { question: "What does forehead shape mean in face reading?", answer: "In face reading, the forehead represents intelligence, fortune, and early life. A large, broad forehead indicates strong mental capabilities and good potential for success in early life." },
      { question: "What does a high forehead indicate?", answer: "A high forehead suggests strong mental capacity, good memory, and analytical abilities. These individuals are often good at planning and long-term thinking, excelling in intellectual pursuits." },
      { question: "How does forehead shape relate to career success?", answer: "A well-proportioned forehead often correlates with success in intellectual or leadership roles. However, other facial features and personal effort also play important roles in career achievement." },
      { question: "Can forehead shape change over time?", answer: "The basic shape of the forehead remains relatively stable throughout life, though hairline changes and aging can affect its appearance and face reading interpretation." }
    ],
    faq_zh: [
      { question: "额型在面相中代表什么？", answer: "在面相学中，额头代表智力、运势和早期生活。宽大的额头表示强大的心智能力和早期成功的良好潜力。" },
      { question: "高额头表示什么？", answer: "高额头表示强大的心智能力、良好的记忆力和分析能力。这些人通常擅长规划和长期思考，在智力追求方面表现出色。" },
      { question: "额型与事业成功有什么关系？", answer: "比例匀称的额头通常与智力或领导角色的成功相关。然而，其他面部特征和个人努力在职业成就中也起着重要作用。" },
      { question: "额型会随时间变化吗？", answer: "额头的基本形状在整个生命过程中保持相对稳定，但发际线变化和衰老会影响其外观和面相解读。" }
    ],

    related_features: ["eyes", "eyebrows", "chin"],

    canonical_path: "/face-reading/features/forehead"
  },
  {
    id: "chin",
    name_en: "Chin",
    name_zh: "下巴",
    emoji: "💪",

    title_en: "Chin Shape Meaning in Face Reading | Physiognomy Guide",
    title_zh: "下巴面相含义 | 面相学完整指南",
    meta_description_en: "Discover what your chin shape reveals about willpower and determination in face reading. Learn the meanings of different chin types in Chinese physiognomy.",
    meta_description_zh: "探索下巴在面相中揭示的意志力和决心特征。了解不同类型下巴在中华面相学中的含义。",
    keywords_en: ["chin shape meaning face reading", "physiognomy chin", "face reading chin", "chin personality", "willpower face reading"],
    keywords_zh: ["下巴面相", "面相下巴", "下巴面相", "下巴性格", "意志力面相"],

    overview_en: "The chin in face reading represents willpower, determination, and late-life fortune. Known as the 'Earthly Court,' the chin shape and features reveal information about perseverance, physical vitality, and enjoyment of material comforts.",
    overview_zh: "面相学中的下巴代表意志力、决心和晚年运势。被称为'地阁'，下巴的形状和特征揭示了毅力、身体活力和物质享受的信息。",
    location_en: "The chin is located at the bottom of the face, below the mouth.",
    location_zh: "下巴位于面部底部，在嘴巴下方。",
    interpretations: {
      large_en: "A large, well-defined chin indicates strong willpower, determination, and physical vitality. These individuals are often persistent, reliable, and have a strong sense of justice.",
      large_zh: "大而轮廓分明的下巴表示强大的意志力、决心和身体活力。这些人通常坚持不懈、可靠，有强烈的正义感。",
      small_en: "A small chin indicates a more flexible, adaptable personality. These individuals may be more open to change and less attached to material possessions, often valuing experiences over things.",
      small_zh: "小下巴表示更灵活、适应性强的性格。这些人可能更开放于变化，不太执着于物质财富，通常更重视体验而非物品。",
      wide_set_en: "A broad, square chin indicates a practical, grounded personality with strong physical constitution. These individuals are often hardworking, dependable, and have excellent stamina.",
      wide_set_zh: "宽阔、方正的下巴表示务实、脚踏实地的性格，有强健的体魄。这些人通常勤奋、可靠，有出色的耐力。",
      close_set_en: "A narrow, pointed chin indicates a sensitive, perceptive personality with strong intuitive abilities. These individuals are often creative, artistic, and have a refined sense of aesthetics.",
      close_set_zh: "狭窄、尖锐的下巴表示敏感、有洞察力的性格，有强大的直觉能力。这些人通常有创造力、有艺术气质，有精致的美学感。",
      upturned_en: "A rounded chin indicates a warm, generous personality with a love of comfort. These individuals are often nurturing, hospitable, and enjoy creating cozy environments for themselves and others.",
      upturned_zh: "圆润的下巴表示热情、慷慨的性格，热爱舒适。这些人通常善于照顾他人、热情好客，喜欢为自己和他人创造温馨的环境。",
      downturned_en: "A prominent, jutting chin indicates a strong, assertive personality with natural leadership qualities. These individuals are often decisive, competitive, and not afraid to take charge.",
      downturned_zh: "突出的下巴表示强势、自信的性格，有天生的领导品质。这些人通常果断、有竞争力，不害怕承担责任。"
    },

    faq_en: [
      { question: "What does chin shape mean in face reading?", answer: "In face reading, the chin represents willpower, determination, and late-life fortune. A strong, well-defined chin indicates perseverance and physical vitality." },
      { question: "What does a pointed chin indicate?", answer: "A pointed chin suggests sensitivity, creativity, and strong intuitive abilities. These individuals are often artistic, perceptive, and have a refined sense of aesthetics." },
      { question: "How does chin shape relate to late life?", answer: "A strong, well-proportioned chin is traditionally associated with good fortune in later years, including financial stability and comfortable retirement." },
      { question: "Can chin shape change over time?", answer: "Yes, the chin can change shape with age, weight changes, and other factors. These changes may affect face reading interpretations, though the underlying personality traits remain relatively stable." }
    ],
    faq_zh: [
      { question: "下巴在面相中代表什么？", answer: "在面相学中，下巴代表意志力、决心和晚年运势。强壮、轮廓分明的下巴表示毅力和身体活力。" },
      { question: "尖下巴表示什么？", answer: "尖下巴表示敏感、有创造力和强大的直觉能力。这些人通常有艺术气质、有洞察力，有精致的美学感。" },
      { question: "下巴形状与晚年有什么关系？", answer: "强壮、比例匀称的下巴传统上与晚年好运相关，包括财务稳定和舒适的退休生活。" },
      { question: "下巴形状会随时间变化吗？", answer: "是的，下巴会随着年龄、体重变化和其他因素而改变形状。这些变化可能会影响面相解读，但潜在的性格特征保持相对稳定。" }
    ],

    related_features: ["mouth", "jaw", "forehead"],

    canonical_path: "/face-reading/features/chin"
  }
]

export const FaceFeatureMap: Record<string, FaceFeature> = Object.fromEntries(
  FaceFeatures.map(feature => [feature.id, feature])
)
