export interface FaceShape {
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
  description_en: string
  description_zh: string
  personality_en: string
  personality_zh: string
  career_en: string
  career_zh: string
  relationships_en: string
  relationships_zh: string
  element: "wood" | "fire" | "earth" | "metal" | "water"

  // FAQ
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>

  // Internal Linking
  related_shapes: string[]

  // Canonical
  canonical_path: string
}

export const FaceShapes: FaceShape[] = [
  {
    id: "oval",
    name_en: "Oval Face",
    name_zh: "鹅蛋脸",
    emoji: "🥚",

    title_en: "Oval Face Shape Meaning in Face Reading | Physiognomy Guide",
    title_zh: "鹅蛋脸面相含义 | 面相学完整指南",
    meta_description_en: "Discover the oval face shape meaning in Chinese face reading. Learn what an oval face reveals about balance, harmony, and destiny in physiognomy.",
    meta_description_zh: "探索鹅蛋脸在中华面相学中的含义。了解鹅蛋脸揭示的平衡、和谐和命运特征。",
    keywords_en: ["oval face shape meaning", "face reading oval face", "physiognomy oval face", "oval face personality", "chinese face reading oval"],
    keywords_zh: ["鹅蛋脸面相", "面相鹅蛋脸", "鹅蛋脸性格", "中华面相鹅蛋脸", "椭圆形脸面相"],

    overview_en: "The oval face shape is considered the most balanced and harmonious in Chinese face reading. It is associated with grace, intelligence, and natural beauty. People with oval faces are often seen as having an ideal balance of features.",
    overview_zh: "鹅蛋脸在中华面相学中被认为是最平衡、最和谐的脸型。它与优雅、智慧和自然美相关。拥有鹅蛋脸的人通常被视为五官比例理想。",
    description_en: "An oval face is characterized by a forehead that is slightly wider than the chin, with gently rounded edges and a length that is about 1.5 times the width. The jawline is soft and tapered, creating a balanced, symmetrical appearance.",
    description_zh: "鹅蛋脸的特征是额头略宽于下巴，边缘柔和圆润，长度约为宽度的1.5倍。下颌线柔和且逐渐变细，创造出平衡、对称的外观。",
    personality_en: "People with oval faces are often natural mediators with strong emotional intelligence. They tend to be adaptable, diplomatic, and have a calm demeanor. They are often seen as approachable and easy to get along with.",
    personality_zh: "拥有鹅蛋脸的人通常是天生的调解者，具有强大的情商。他们往往适应力强、有外交手腕、举止沉稳。他们通常被视为平易近人、容易相处。",
    career_en: "Oval-faced individuals often excel in roles that require balance and diplomacy, such as counseling, teaching, public relations, and management. Their natural grace and adaptability make them effective leaders and team players.",
    career_zh: "鹅蛋脸的人通常在需要平衡和外交的角色中表现出色，如咨询、教学、公共关系和管理。他们天生的优雅和适应力使他们成为有效的领导者和团队成员。",
    relationships_en: "In relationships, oval-faced individuals are often caring, supportive partners. They value harmony and are skilled at resolving conflicts. They tend to attract partners who appreciate their balanced nature.",
    relationships_zh: "在感情关系中，鹅蛋脸的人通常是关心、支持的伴侣。他们重视和谐，善于解决冲突。他们往往吸引欣赏他们平衡性格的伴侣。",
    element: "earth",

    faq_en: [
      { question: "What does an oval face shape mean in face reading?", answer: "In Chinese face reading, an oval face shape represents balance, harmony, and natural beauty. It's considered the most auspicious face shape, indicating intelligence, grace, and good fortune throughout life." },
      { question: "What careers are best for oval-faced people?", answer: "Oval-faced individuals often excel in roles requiring balance and diplomacy, such as counseling, teaching, public relations, and management. Their natural adaptability makes them effective in many fields." },
      { question: "What element is associated with oval face?", answer: "The oval face is associated with the Earth element in Chinese face reading, representing stability, nurturing, and groundedness. This connection suggests practical wisdom and emotional balance." },
      { question: "Are oval-faced people considered lucky?", answer: "Yes, in Chinese face reading, the oval face is considered one of the most auspicious shapes. It suggests a balanced life with good fortune in relationships, career, and health." }
    ],
    faq_zh: [
      { question: "鹅蛋脸在面相中代表什么？", answer: "在中华面相学中，鹅蛋脸代表平衡、和谐和自然美。它被认为是最吉利的脸型，表示一生的智慧、优雅和好运。" },
      { question: "鹅蛋脸的人适合什么职业？", answer: "鹅蛋脸的人通常在需要平衡和外交的角色中表现出色，如咨询、教学、公共关系和管理。他们天生的适应力使他们在许多领域都很有效。" },
      { question: "鹅蛋脸与什么五行相关？", answer: "在中华面相学中，鹅蛋脸与土元素相关，代表稳定、滋养和脚踏实地。这种联系暗示着实际的智慧和情感平衡。" },
      { question: "鹅蛋脸的人被认为幸运吗？", answer: "是的，在中华面相学中，鹅蛋脸被认为是最吉利的脸型之一。它暗示着在感情、事业和健康方面都有好运的平衡生活。" }
    ],

    related_shapes: ["round", "heart", "oblong"],

    canonical_path: "/face-reading/shapes/oval"
  },
  {
    id: "round",
    name_en: "Round Face",
    name_zh: "圆脸",
    emoji: "🌕",

    title_en: "Round Face Shape Meaning in Face Reading | Physiognomy Guide",
    title_zh: "圆脸面相含义 | 面相学完整指南",
    meta_description_en: "Discover the round face shape meaning in Chinese face reading. Learn what a round face reveals about warmth, generosity, and social nature in physiognomy.",
    meta_description_zh: "探索圆脸在中华面相学中的含义。了解圆脸揭示的热情、慷慨和社交性格特征。",
    keywords_en: ["round face shape meaning", "face reading round face", "physiognomy round face", "round face personality", "chinese face reading round"],
    keywords_zh: ["圆脸面相", "面相圆脸", "圆脸性格", "中华面相圆脸", "圆形脸面相"],

    overview_en: "The round face shape in Chinese face reading represents warmth, generosity, and a strong social nature. People with round faces are often seen as friendly, approachable, and naturally charismatic.",
    overview_zh: "圆脸在中华面相学中代表热情、慷慨和强烈的社交性格。拥有圆脸的人通常被视为友好、平易近人、天生有魅力。",
    description_en: "A round face is characterized by equal width and length, with full cheeks and a rounded jawline. The face appears soft and circular, with no sharp angles or prominent features.",
    description_zh: "圆脸的特征是宽度和长度相等，脸颊丰满，下颌线圆润。面部看起来柔软、圆润，没有尖锐的角度或突出的特征。",
    personality_en: "People with round faces are often cheerful, optimistic, and emotionally expressive. They tend to be generous, nurturing, and have a natural ability to make others feel comfortable. They are often the social glue in their communities.",
    personality_zh: "拥有圆脸的人通常开朗、乐观、情感丰富。他们往往慷慨、善于照顾他人，有让他人感到舒适的天赋。他们通常是社区中的社交纽带。",
    career_en: "Round-faced individuals often excel in social and creative fields such as entertainment, hospitality, social work, and customer service. Their warm personality and natural charisma make them excellent communicators.",
    career_zh: "圆脸的人通常在社交和创意领域表现出色，如娱乐、酒店业、社会工作和客户服务。他们温暖的性格和天生的魅力使他们成为出色的沟通者。",
    relationships_en: "In relationships, round-faced individuals are often affectionate, loyal partners. They value connection and emotional intimacy, and are skilled at creating warm, nurturing environments.",
    relationships_zh: "在感情关系中，圆脸的人通常是深情、忠诚的伴侣。他们重视联系和情感亲密，善于创造温暖、滋养的环境。",
    element: "water",

    faq_en: [
      { question: "What does a round face shape mean in face reading?", answer: "In Chinese face reading, a round face shape represents warmth, generosity, and strong social connections. It indicates a friendly, approachable personality with natural charisma and emotional expressiveness." },
      { question: "What careers suit round-faced people?", answer: "Round-faced individuals often excel in social and creative fields like entertainment, hospitality, social work, and customer service. Their warm personality makes them natural communicators and team players." },
      { question: "What element is associated with round face?", answer: "The round face is associated with the Water element in Chinese face reading, representing fluidity, adaptability, and emotional depth. This suggests strong interpersonal skills and emotional intelligence." },
      { question: "Are round-faced people considered lucky in love?", answer: "Yes, round-faced individuals are often considered fortunate in love. Their warm, nurturing nature attracts caring partners, and they tend to create harmonious, lasting relationships." }
    ],
    faq_zh: [
      { question: "圆脸在面相中代表什么？", answer: "在中华面相学中，圆脸代表热情、慷慨和强大的社交联系。它表示友好、平易近人的性格，有天生的魅力和情感表现力。" },
      { question: "圆脸的人适合什么职业？", answer: "圆脸的人通常在社交和创意领域表现出色，如娱乐、酒店业、社会工作和客户服务。他们温暖的性格使他们成为天生的沟通者和团队成员。" },
      { question: "圆脸与什么五行相关？", answer: "圆脸在中华面相学中与水元素相关，代表流动性、适应性和情感深度。这暗示着强大的人际交往能力和情商。" },
      { question: "圆脸的人在爱情中被认为幸运吗？", answer: "是的，圆脸的人通常在爱情中被认为是幸运的。他们温暖、滋养的天性吸引关心他们的伴侣，他们倾向于创造和谐、持久的关系。" }
    ],

    related_shapes: ["oval", "square", "heart"],

    canonical_path: "/face-reading/shapes/round"
  },
  {
    id: "square",
    name_en: "Square Face",
    name_zh: "方脸",
    emoji: "📐",

    title_en: "Square Face Shape Meaning in Face Reading | Physiognomy Guide",
    title_zh: "方脸面相含义 | 面相学完整指南",
    meta_description_en: "Discover the square face shape meaning in Chinese face reading. Learn what a square face reveals about strength, determination, and practicality in physiognomy.",
    meta_description_zh: "探索方脸在中华面相学中的含义。了解方脸揭示的力量、决心和务实特征。",
    keywords_en: ["square face shape meaning", "face reading square face", "physiognomy square face", "square face personality", "chinese face reading square"],
    keywords_zh: ["方脸面相", "面相方脸", "方脸性格", "中华面相方脸", "方形脸面相"],

    overview_en: "The square face shape in Chinese face reading represents strength, determination, and a practical nature. People with square faces are often seen as reliable, hardworking, and grounded individuals.",
    overview_zh: "方脸在中华面相学中代表力量、决心和务实的性格。拥有方脸的人通常被视为可靠、勤奋、脚踏实地的人。",
    description_en: "A square face is characterized by equal width at the forehead, cheeks, and jawline, with a strong, angular jaw. The face appears balanced and symmetrical, with prominent bone structure.",
    description_zh: "方脸的特征是额头、脸颊和下颌线宽度相等，下颌强壮、有棱角。面部看起来平衡、对称，骨骼结构突出。",
    personality_en: "People with square faces are often disciplined, organized, and strong-willed. They tend to be practical, reliable, and have a strong sense of justice. They are often seen as pillars of their communities.",
    personality_zh: "拥有方脸的人通常自律、有条理、意志坚强。他们往往务实、可靠，有强烈的正义感。他们通常被视为社区的支柱。",
    career_en: "Square-faced individuals often excel in leadership roles, engineering, military, law enforcement, and construction. Their strong will and practical nature make them effective in roles requiring discipline and structure.",
    career_zh: "方脸的人通常在领导岗位、工程、军事、执法和建筑方面表现出色。他们坚强的意志和务实的性格使他们在需要纪律和结构的角色中非常有效。",
    relationships_en: "In relationships, square-faced individuals are often loyal, protective partners. They value stability and commitment, and are skilled at providing security and support to their loved ones.",
    relationships_zh: "在感情关系中，方脸的人通常是忠诚、保护性的伴侣。他们重视稳定和承诺，善于为所爱的人提供安全感和支持。",
    element: "metal",

    faq_en: [
      { question: "What does a square face shape mean in face reading?", answer: "In Chinese face reading, a square face shape represents strength, determination, and practicality. It indicates a disciplined, reliable personality with strong willpower and a sense of justice." },
      { question: "What careers suit square-faced people?", answer: "Square-faced individuals often excel in leadership roles, engineering, military, law enforcement, and construction. Their strong will and practical nature make them effective in structured environments." },
      { question: "What element is associated with square face?", answer: "The square face is associated with the Metal element in Chinese face reading, representing strength, discipline, and structure. This suggests determination, loyalty, and strong moral principles." },
      { question: "Are square-faced people good leaders?", answer: "Yes, square-faced individuals are often natural leaders. Their strong will, sense of justice, and practical approach make them effective in leadership positions that require discipline and decisiveness." }
    ],
    faq_zh: [
      { question: "方脸在面相中代表什么？", answer: "在中华面相学中，方脸代表力量、决心和务实。它表示自律、可靠的性格，有强大的意志力和正义感。" },
      { question: "方脸的人适合什么职业？", answer: "方脸的人通常在领导岗位、工程、军事、执法和建筑方面表现出色。他们坚强的意志和务实的性格使他们在结构化环境中非常有效。" },
      { question: "方脸与什么五行相关？", answer: "方脸在中华面相学中与金元素相关，代表力量、纪律和结构。这暗示着决心、忠诚和强烈的道德原则。" },
      { question: "方脸的人是好领导吗？", answer: "是的，方脸的人通常是天生的领导者。他们坚强的意志、正义感和务实的方法使他们在需要纪律和果断的领导职位中非常有效。" }
    ],

    related_shapes: ["oval", "oblong", "diamond"],

    canonical_path: "/face-reading/shapes/square"
  },
  {
    id: "heart",
    name_en: "Heart Face (Inverted Triangle)",
    name_zh: "心形脸",
    emoji: "💎",

    title_en: "Heart Face Shape Meaning in Face Reading | Physiognomy Guide",
    title_zh: "心形脸面相含义 | 面相学完整指南",
    meta_description_en: "Discover the heart face shape meaning in Chinese face reading. Learn what a heart-shaped face reveals about creativity, charm, and romantic nature in physiognomy.",
    meta_description_zh: "探索心形脸在中华面相学中的含义。了解心形脸揭示的创造力、魅力和浪漫性格特征。",
    keywords_en: ["heart face shape meaning", "face reading heart face", "physiognomy heart face", "heart face personality", "chinese face reading heart"],
    keywords_zh: ["心形脸面相", "面相心形脸", "心形脸性格", "中华面相心形脸", "倒三角脸面相"],

    overview_en: "The heart face shape (inverted triangle) in Chinese face reading represents creativity, charm, and romantic nature. People with heart-shaped faces are often seen as artistic, charismatic, and emotionally expressive.",
    overview_zh: "心形脸（倒三角脸）在中华面相学中代表创造力、魅力和浪漫的性格。拥有心形脸的人通常被视为有艺术气质、有魅力、情感丰富。",
    description_en: "A heart-shaped face is characterized by a wide forehead that tapers to a narrow, pointed chin. The cheekbones are often prominent, and the overall shape resembles an inverted triangle or heart.",
    description_zh: "心形脸的特征是宽阔的额头逐渐变细到狭窄、尖锐的下巴。颧骨通常突出，整体形状类似于倒三角形或心形。",
    personality_en: "People with heart-shaped faces are often creative, romantic, and emotionally expressive. They tend to be charming, persuasive, and have a natural ability to inspire and captivate others.",
    personality_zh: "拥有心形脸的人通常有创造力、浪漫、情感丰富。他们往往有魅力、善于说服，有启发和吸引他人的天赋。",
    career_en: "Heart-faced individuals often excel in creative fields such as art, music, fashion, entertainment, and public relations. Their natural charm and creativity make them effective in roles requiring innovation and persuasion.",
    career_zh: "心形脸的人通常在创意领域表现出色，如艺术、音乐、时尚、娱乐和公共关系。他们天生的魅力和创造力使他们在需要创新和说服力的角色中非常有效。",
    relationships_en: "In relationships, heart-faced individuals are often passionate, romantic partners. They value emotional connection and are skilled at expressing their feelings. They tend to attract partners who appreciate their artistic nature.",
    relationships_zh: "在感情关系中，心形脸的人通常是热情、浪漫的伴侣。他们重视情感联系，善于表达自己的感受。他们往往吸引欣赏他们艺术气质的伴侣。",
    element: "fire",

    faq_en: [
      { question: "What does a heart face shape mean in face reading?", answer: "In Chinese face reading, a heart-shaped face represents creativity, charm, and romantic nature. It indicates an artistic, emotionally expressive personality with natural persuasive abilities." },
      { question: "What careers suit heart-faced people?", answer: "Heart-faced individuals often excel in creative fields like art, music, fashion, entertainment, and public relations. Their natural charm and creativity make them effective in roles requiring innovation." },
      { question: "What element is associated with heart face?", answer: "The heart face is associated with the Fire element in Chinese face reading, representing passion, creativity, and emotional expression. This suggests strong artistic abilities and romantic nature." },
      { question: "Are heart-faced people romantic?", answer: "Yes, heart-shaped face individuals are often considered highly romantic. They value emotional connection, are skilled at expressing feelings, and tend to create passionate, meaningful relationships." }
    ],
    faq_zh: [
      { question: "心形脸在面相中代表什么？", answer: "在中华面相学中，心形脸代表创造力、魅力和浪漫的性格。它表示有艺术气质、情感丰富的性格，有天生的说服力。" },
      { question: "心形脸的人适合什么职业？", answer: "心形脸的人通常在创意领域表现出色，如艺术、音乐、时尚、娱乐和公共关系。他们天生的魅力和创造力使他们在需要创新的角色中非常有效。" },
      { question: "心形脸与什么五行相关？", answer: "心形脸在中华面相学中与火元素相关，代表热情、创造力和情感表达。这暗示着强大的艺术能力和浪漫性格。" },
      { question: "心形脸的人浪漫吗？", answer: "是的，心形脸的人通常被认为非常浪漫。他们重视情感联系，善于表达感受，倾向于创造热情、有意义的关系。" }
    ],

    related_shapes: ["oval", "round", "diamond"],

    canonical_path: "/face-reading/shapes/heart"
  },
  {
    id: "oblong",
    name_en: "Oblong Face (Rectangle)",
    name_zh: "长脸",
    emoji: "📏",

    title_en: "Oblong Face Shape Meaning in Face Reading | Physiognomy Guide",
    title_zh: "长脸面相含义 | 面相学完整指南",
    meta_description_en: "Discover the oblong face shape meaning in Chinese face reading. Learn what a rectangular face reveals about ambition, intellect, and analytical nature in physiognomy.",
    meta_description_zh: "探索长脸在中华面相学中的含义。了解长脸揭示的抱负、智慧和分析性格特征。",
    keywords_en: ["oblong face shape meaning", "face reading oblong face", "physiognomy oblong face", "oblong face personality", "chinese face reading rectangular"],
    keywords_zh: ["长脸面相", "面长长脸", "长脸性格", "中华面相长脸", "矩形脸面相"],

    overview_en: "The oblong (rectangular) face shape in Chinese face reading represents ambition, intellect, and analytical nature. People with oblong faces are often seen as thoughtful, philosophical, and intellectually driven.",
    overview_zh: "长脸（矩形脸）在中华面相学中代表抱负、智慧和分析性格。拥有长脸的人通常被视为深思熟虑、有哲学思想、追求智慧。",
    description_en: "An oblong face is characterized by a length that is significantly greater than the width, with a forehead, cheeks, and jawline of similar width. The face appears elongated and rectangular.",
    description_zh: "长脸的特征是长度明显大于宽度，额头、脸颊和下颌线宽度相似。面部看起来细长、呈矩形。",
    personality_en: "People with oblong faces are often intellectual, analytical, and deeply thoughtful. They tend to be ambitious, strategic thinkers with a strong desire for knowledge and understanding.",
    personality_zh: "拥有长脸的人通常聪明、善于分析、深思熟虑。他们往往有抱负、是战略思考者，有强烈的知识和理解欲望。",
    career_en: "Oblong-faced individuals often excel in intellectual and strategic fields such as academia, research, law, medicine, and technology. Their analytical nature and ambition make them effective in roles requiring deep thinking and planning.",
    career_zh: "长脸的人通常在智力和战略领域表现出色，如学术、研究、法律、医学和技术。他们善于分析的性格和抱负使他们在需要深度思考和规划的角色中非常有效。",
    relationships_en: "In relationships, oblong-faced individuals are often thoughtful, devoted partners. They value intellectual connection and deep conversations. They tend to attract partners who appreciate their philosophical nature.",
    relationships_zh: "在感情关系中，长脸的人通常是体贴、专注的伴侣。他们重视智力联系和深入的对话。他们往往吸引欣赏他们哲学性格的伴侣。",
    element: "wood",

    faq_en: [
      { question: "What does an oblong face shape mean in face reading?", answer: "In Chinese face reading, an oblong face shape represents ambition, intellect, and analytical nature. It indicates a thoughtful, philosophical personality with strong intellectual drive." },
      { question: "What careers suit oblong-faced people?", answer: "Oblong-faced individuals often excel in academic, research, legal, medical, and technological fields. Their analytical nature and ambition make them effective in roles requiring deep thinking." },
      { question: "What element is associated with oblong face?", answer: "The oblong face is associated with the Wood element in Chinese face reading, representing growth, ambition, and intellectual pursuit. This suggests strong desire for knowledge and strategic thinking." },
      { question: "Are oblong-faced people good at planning?", answer: "Yes, oblong-faced individuals are often excellent planners and strategists. Their analytical nature and ambition make them skilled at long-term planning and strategic decision-making." }
    ],
    faq_zh: [
      { question: "长脸在面相中代表什么？", answer: "在中华面相学中，长脸代表抱负、智慧和分析性格。它表示深思熟虑、有哲学思想的性格，有强烈的智慧追求。" },
      { question: "长脸的人适合什么职业？", answer: "长脸的人通常在学术、研究、法律、医学和技术领域表现出色。他们善于分析的性格和抱负使他们在需要深度思考的角色中非常有效。" },
      { question: "长脸与什么五行相关？", answer: "长脸在中华面相学中与木元素相关，代表成长、抱负和智慧追求。这暗示着对知识的强烈渴望和战略思维。" },
      { question: "长脸的人擅长规划吗？", answer: "是的，长脸的人通常是出色的规划者和战略家。他们善于分析的性格和抱负使他们擅长长期规划和战略决策。" }
    ],

    related_shapes: ["square", "oval", "diamond"],

    canonical_path: "/face-reading/shapes/oblong"
  },
  {
    id: "diamond",
    name_en: "Diamond Face",
    name_zh: "菱形脸",
    emoji: "🔷",

    title_en: "Diamond Face Shape Meaning in Face Reading | Physiognomy Guide",
    title_zh: "菱形脸面相含义 | 面相学完整指南",
    meta_description_en: "Discover the diamond face shape meaning in Chinese face reading. Learn what a diamond-shaped face reveals about uniqueness, creativity, and independent nature in physiognomy.",
    meta_description_zh: "探索菱形脸在中华面相学中的含义。了解菱形脸揭示的独特性、创造力和独立性格特征。",
    keywords_en: ["diamond face shape meaning", "face reading diamond face", "physiognomy diamond face", "diamond face personality", "chinese face reading diamond"],
    keywords_zh: ["菱形脸面相", "面相菱形脸", "菱形脸性格", "中华面相菱形脸", "钻石形脸面相"],

    overview_en: "The diamond face shape in Chinese face reading represents uniqueness, creativity, and an independent nature. People with diamond-shaped faces are often seen as original thinkers with strong individualistic tendencies.",
    overview_zh: "菱形脸在中华面相学中代表独特性、创造力和独立的性格。拥有菱形脸的人通常被视为有原创思维、有强烈个人主义倾向的人。",
    description_en: "A diamond face is characterized by prominent cheekbones, a narrow forehead and chin, and a face that is widest at the cheeks. The overall shape resembles a diamond or rhombus.",
    description_zh: "菱形脸的特征是颧骨突出，额头和下巴狭窄，面部最宽处位于脸颊。整体形状类似于菱形或菱形。",
    personality_en: "People with diamond faces are often original, creative thinkers with a strong sense of individuality. They tend to be independent, unconventional, and have unique perspectives on life.",
    personality_zh: "拥有菱形脸的人通常是有原创性、有创造力的思考者，有强烈的个性。他们往往独立、不拘一格，对生活有独特的见解。",
    career_en: "Diamond-faced individuals often excel in creative and unconventional fields such as art, design, innovation, entrepreneurship, and the sciences. Their original thinking and independence make them effective in roles requiring creativity.",
    career_zh: "菱形脸的人通常在创意和非传统领域表现出色，如艺术、设计、创新、创业和科学。他们原创的思维和独立性使他们在需要创造力的角色中非常有效。",
    relationships_en: "In relationships, diamond-faced individuals are often passionate, independent partners. They value authenticity and individuality, and tend to attract partners who appreciate their unique nature.",
    relationships_zh: "在感情关系中，菱形脸的人通常是热情、独立的伴侣。他们重视真实性和个性，往往吸引欣赏他们独特性格的伴侣。",
    element: "fire",

    faq_en: [
      { question: "What does a diamond face shape mean in face reading?", answer: "In Chinese face reading, a diamond face shape represents uniqueness, creativity, and independent nature. It indicates an original thinker with strong individualistic tendencies and unique perspectives." },
      { question: "What careers suit diamond-faced people?", answer: "Diamond-faced individuals often excel in creative and unconventional fields like art, design, innovation, and entrepreneurship. Their original thinking makes them effective in roles requiring creativity." },
      { question: "What element is associated with diamond face?", answer: "The diamond face is associated with the Fire element in Chinese face reading, representing passion, creativity, and transformation. This suggests strong individualistic tendencies and original thinking." },
      { question: "Are diamond-faced people unique?", answer: "Yes, diamond-faced individuals are often considered highly unique. They have strong individualistic tendencies, original thinking, and unique perspectives that set them apart from others." }
    ],
    faq_zh: [
      { question: "菱形脸在面相中代表什么？", answer: "在中华面相学中，菱形脸代表独特性、创造力和独立的性格。它表示有原创思维、有强烈个人主义倾向和独特见解的人。" },
      { question: "菱形脸的人适合什么职业？", answer: "菱形脸的人通常在创意和非传统领域表现出色，如艺术、设计、创新和创业。他们原创的思维使他们在需要创造力的角色中非常有效。" },
      { question: "菱形脸与什么五行相关？", answer: "菱形脸在中华面相学中与火元素相关，代表热情、创造力和转变。这暗示着强烈的个人主义倾向和原创思维。" },
      { question: "菱形脸的人独特吗？", answer: "是的，菱形脸的人通常被认为非常独特。他们有强烈的个人主义倾向、原创思维和独特的见解，使他们与众不同。" }
    ],

    related_shapes: ["heart", "square", "oblong"],

    canonical_path: "/face-reading/shapes/diamond"
  }
]

export const FaceShapeMap: Record<string, FaceShape> = Object.fromEntries(
  FaceShapes.map(shape => [shape.id, shape])
)
