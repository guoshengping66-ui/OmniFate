export interface BaziTenGod {
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

  // FAQ
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>

  // Internal Linking
  related_gods: string[]

  // Canonical
  canonical_path: string
}

export const BaziTenGods: BaziTenGod[] = [
  {
    id: "zheng-guan",
    name_en: "Direct Officer (Zheng Guan)",
    name_zh: "正官",
    emoji: "👔",

    title_en: "Direct Officer (Zheng Guan) in Bazi | Ten Gods Guide",
    title_zh: "正官在八字中的含义 | 十神完整指南",
    meta_description_en: "Discover the Direct Officer (Zheng Guan) in Bazi astrology. Learn what the Direct Officer reveals about discipline, career success, and social status in Chinese Four Pillars.",
    meta_description_zh: "探索八字命理中的正官。了解正官揭示的纪律、事业成功和社会地位特征。",
    keywords_en: ["direct officer bazi", "zheng guan meaning", "bazi ten gods direct officer", "direct officer personality", "bazi career success"],
    keywords_zh: ["正官八字", "正官含义", "八字十神正官", "正官性格", "八字事业成功"],

    overview_en: "The Direct Officer (Zheng Guan) represents authority, discipline, and conventional success. It is the element that controls the Day Master in a balanced, orderly way, symbolizing structure, responsibility, and social achievement.",
    overview_zh: "正官代表权威、纪律和传统成功。它是以平衡、有序的方式克制日主的元素，象征结构、责任和社会成就。",
    personality_en: "People with strong Direct Officer influence are typically responsible, disciplined, and respect authority. They follow rules, value tradition, and are naturally drawn to structured environments and conventional success paths.",
    personality_zh: "正官影响强的人通常有责任感、有纪律、尊重权威。他们遵守规则、重视传统，自然被结构化环境和传统成功路径所吸引。",
    strengths_en: "Sense of responsibility, respect for authority, organizational skills, reliability, and ability to work within systems. They are trustworthy and excel in hierarchical structures.",
    strengths_zh: "责任感、尊重权威、组织能力、可靠性和在系统中工作的能力。他们值得信赖，在等级结构中表现出色。",
    weaknesses_en: "Rigidity, excessive rule-following, fear of authority, and difficulty thinking outside the box. They may become too constrained by conventions and miss creative opportunities.",
    weaknesses_zh: "僵化、过度遵守规则、害怕权威、难以跳出框架思考。他们可能过于受传统约束，错过创造性机会。",
    career_en: "Direct Officer individuals excel in government, corporate management, law, banking, and institutional roles. Their respect for structure and ability to follow rules make them effective in traditional career paths.",
    career_zh: "正官人在政府、企业管理、法律、银行和机构职位方面表现出色。他们对结构的尊重和遵守规则的能力使他们在传统职业道路上非常有效。",
    relationships_en: "In relationships, Direct Officer individuals are loyal, responsible, and committed. They value stability and traditional partnership structures, but may need to learn flexibility and emotional expression.",
    relationships_zh: "在感情关系中，正官人忠诚、负责、有承诺。他们重视稳定和传统的伴侣结构，但可能需要学习灵活性和情感表达。",

    faq_en: [
      { question: "What is the Direct Officer in Bazi?", answer: "The Direct Officer (Zheng Guan) is one of the Ten Gods in Bazi. It represents the element that controls the Day Master in a balanced, orderly way, symbolizing authority, discipline, and conventional success." },
      { question: "What does a strong Direct Officer indicate?", answer: "A strong Direct Officer indicates a responsible, disciplined personality with respect for authority and tradition. These individuals excel in structured environments and conventional career paths." },
      { question: "What careers suit Direct Officer people?", answer: "Direct Officer individuals excel in government, corporate management, law, banking, and institutional roles. Their respect for structure makes them effective in traditional hierarchical settings." },
      { question: "How does Direct Officer affect relationships?", answer: "Direct Officer individuals are loyal, responsible partners who value stability. They prefer traditional relationship structures but may need to develop flexibility and emotional expressiveness." }
    ],
    faq_zh: [
      { question: "什么是八字中的正官？", answer: "正官是八字十神之一。它代表以平衡、有序的方式克制日主的元素，象征权威、纪律和传统成功。" },
      { question: "正官强表示什么？", answer: "正官强表示有责任感、有纪律的性格，尊重权威和传统。这些人在结构化环境和传统职业道路上表现出色。" },
      { question: "正官人适合什么职业？", answer: "正官人在政府、企业管理、法律、银行和机构职位方面表现出色。他们对结构的尊重使他们在传统等级环境中非常有效。" },
      { question: "正官如何影响感情关系？", answer: "正官人是忠诚、负责的伴侣，重视稳定。他们偏好传统的关系结构，但可能需要发展灵活性和情感表达能力。" }
    ],

    related_gods: ["qi-sha", "zheng-cai", "shi-shen"],

    canonical_path: "/bazi/ten-gods/direct-officer"
  },
  {
    id: "qi-sha",
    name_en: "Seven Killings (Qi Sha)",
    name_zh: "七杀",
    emoji: "⚔️",

    title_en: "Seven Killings (Qi Sha) in Bazi | Ten Gods Guide",
    title_zh: "七杀在八字中的含义 | 十神完整指南",
    meta_description_en: "Discover the Seven Killings (Qi Sha) in Bazi astrology. Learn what the Seven Killings reveals about ambition, power, and competitive nature in Chinese Four Pillars.",
    meta_description_zh: "探索八字命理中的七杀。了解七杀揭示的抱负、权力和竞争性格特征。",
    keywords_en: ["seven killings bazi", "qi sha meaning", "bazi ten gods seven killings", "seven killings personality", "bazi power ambition"],
    keywords_zh: ["七杀八字", "七杀含义", "八字十神七杀", "七杀性格", "八字权力抱负"],

    overview_en: "The Seven Killings (Qi Sha) represents aggressive control, power, and ambition. Unlike the Direct Officer's balanced control, Seven Killings is the element that forcefully subdues the Day Master, symbolizing competition, challenge, and the drive to overcome obstacles.",
    overview_zh: "七杀代表攻击性控制、权力和抱负。与正官的平衡控制不同，七杀是以强力制服日主的元素，象征竞争、挑战和克服障碍的动力。",
    personality_en: "People with strong Seven Killings influence are typically ambitious, competitive, and determined. They have a natural drive to succeed, thrive under pressure, and are not afraid of challenges or confrontation.",
    personality_zh: "七杀影响强的人通常有抱负、有竞争力、坚定。他们有天生的成功动力，在压力下茁壮成长，不害怕挑战或对抗。",
    strengths_en: "Ambition, determination, competitiveness, courage, leadership under pressure, and ability to overcome obstacles. They are natural warriors who excel in high-stakes environments.",
    strengths_zh: "抱负、决心、竞争力、勇气、压力下的领导力和克服障碍的能力。他们是天生的战士，在高风险环境中表现出色。",
    weaknesses_en: "Aggression, ruthlessness, impatience, difficulty with authority, and tendency toward conflict. They may become too focused on power and control at the expense of relationships.",
    weaknesses_zh: "攻击性、无情、缺乏耐心、与权威有困难、倾向于冲突。他们可能过于关注权力和控制，牺牲人际关系。",
    career_en: "Seven Killings individuals excel in competitive fields such as business, military, sports, law enforcement, and entrepreneurship. Their drive and determination make them effective in high-pressure, results-oriented environments.",
    career_zh: "七杀人在竞争激烈的领域表现出色，如商业、军事、体育、执法和创业。他们的动力和决心使他们在高压、注重结果的环境中非常有效。",
    relationships_en: "In relationships, Seven Killings individuals are passionate, protective, and intense. They value loyalty and may be possessive. They need partners who can match their intensity and independence.",
    relationships_zh: "在感情关系中，七杀人热情、保护性强、强烈。他们重视忠诚，可能有占有欲。他们需要能匹配他们强度和独立性的伴侣。",

    faq_en: [
      { question: "What are Seven Killings in Bazi?", answer: "Seven Killings (Qi Sha) is one of the Ten Gods in Bazi. It represents the element that forcefully controls the Day Master, symbolizing competition, ambition, power, and the drive to overcome challenges." },
      { question: "What does a strong Seven Killings indicate?", answer: "A strong Seven Killings indicates an ambitious, competitive, and determined personality. These individuals thrive under pressure and excel in high-stakes environments, but may struggle with aggression and authority." },
      { question: "What careers suit Seven Killings people?", answer: "Seven Killings individuals excel in competitive fields like business, military, sports, law enforcement, and entrepreneurship. Their drive makes them effective in high-pressure, results-oriented roles." },
      { question: "How does Seven Killings differ from Direct Officer?", answer: "While Direct Officer represents balanced, orderly control (respect for authority), Seven Killings represents forceful, aggressive control (drive to dominate). Direct Officer works within systems; Seven Killings challenges them." }
    ],
    faq_zh: [
      { question: "什么是八字中的七杀？", answer: "七杀是八字十神之一。它代表强力克制日主的元素，象征竞争、抱负、权力和克服挑战的动力。" },
      { question: "七杀强表示什么？", answer: "七杀强表示有抱负、有竞争力、坚定的性格。这些人在压力下茁壮成长，在高风险环境中表现出色，但可能在攻击性和与权威的关系方面有困难。" },
      { question: "七杀人适合什么职业？", answer: "七杀人在竞争激烈的领域表现出色，如商业、军事、体育、执法和创业。他们的动力使他们在高压、注重结果的角色中非常有效。" },
      { question: "七杀与正官有什么区别？", answer: "正官代表平衡、有序的控制（尊重权威），而七杀代表强力、攻击性的控制（支配的动力）。正官在系统中工作；七杀挑战系统。" }
    ],

    related_gods: ["zheng-guan", "shi-shen", "pi-ren"],

    canonical_path: "/bazi/ten-gods/seven-killings"
  },
  {
    id: "zheng-cai",
    name_en: "Direct Wealth (Zheng Cai)",
    name_zh: "正财",
    emoji: "💰",

    title_en: "Direct Wealth (Zheng Cai) in Bazi | Ten Gods Guide",
    title_zh: "正财在八字中的含义 | 十神完整指南",
    meta_description_en: "Discover the Direct Wealth (Zheng Cai) in Bazi astrology. Learn what Direct Wealth reveals about financial success, stability, and practical nature in Chinese Four Pillars.",
    meta_description_zh: "探索八字命理中的正财。了解正财揭示的财务成功、稳定和务实性格特征。",
    keywords_en: ["direct wealth bazi", "zheng cai meaning", "bazi ten gods direct wealth", "direct wealth personality", "bazi financial success"],
    keywords_zh: ["正财八字", "正财含义", "八字十神正财", "正财性格", "八字财务成功"],

    overview_en: "The Direct Wealth (Zheng Cai) represents earned income, financial stability, and practical value. It is the element that the Day Master controls in a balanced way, symbolizing earned rewards, steady income, and material security.",
    overview_zh: "正财代表收入、财务稳定和实际价值。它是日主以平衡方式控制的元素，象征应得的回报、稳定收入和物质安全。",
    personality_en: "People with strong Direct Wealth influence are typically practical, hardworking, and financially responsible. They value stability, make careful financial decisions, and prefer earning through steady effort rather than speculation.",
    personality_zh: "正财影响强的人通常务实、勤奋、有财务责任感。他们重视稳定，做出谨慎的财务决策，更喜欢通过稳定的努力获得收入而非投机。",
    strengths_en: "Financial responsibility, practicality, reliability, hard work, and the ability to accumulate wealth through steady effort. They are dependable and value security.",
    strengths_zh: "财务责任感、务实、可靠、勤奋和通过稳定努力积累财富的能力。他们值得信赖，重视安全。",
    weaknesses_en: "Overly cautious, materialistic, risk-averse, and difficulty with change. They may become too focused on financial security and miss opportunities for growth.",
    weaknesses_zh: "过于谨慎、物质主义、规避风险、难以适应变化。他们可能过于关注财务安全，错过成长机会。",
    career_en: "Direct Wealth individuals excel in finance, accounting, real estate, retail, and stable business ventures. Their practical nature and financial responsibility make them effective in roles requiring fiscal management.",
    career_zh: "正财人在金融、会计、房地产、零售和稳定商业投资方面表现出色。他们务实的性格和财务责任感使他们在需要财务管理的角色中非常有效。",
    relationships_en: "In relationships, Direct Wealth individuals are loyal, stable, and provide security. They value long-term commitment and practical expressions of love, but may need to learn emotional depth and spontaneity.",
    relationships_zh: "在感情关系中，正财人忠诚、稳定、提供安全感。他们重视长期承诺和实际的爱情表达，但可能需要学习情感深度和自发性。",

    faq_en: [
      { question: "What is Direct Wealth in Bazi?", answer: "Direct Wealth (Zheng Cai) is one of the Ten Gods in Bazi. It represents the element the Day Master controls in a balanced way, symbolizing earned income, financial stability, and practical value." },
      { question: "What does a strong Direct Wealth indicate?", answer: "A strong Direct Wealth indicates financial responsibility, practicality, and the ability to accumulate wealth through steady effort. These individuals are dependable and value security." },
      { question: "What careers suit Direct Wealth people?", answer: "Direct Wealth individuals excel in finance, accounting, real estate, retail, and stable business ventures. Their practical nature makes them effective in roles requiring fiscal management." },
      { question: "How does Direct Wealth affect relationships?", answer: "Direct Wealth individuals are loyal, stable partners who provide security. They value practical expressions of love but may need to develop emotional depth and spontaneity." }
    ],
    faq_zh: [
      { question: "什么是八字中的正财？", answer: "正财是八字十神之一。它代表日主以平衡方式控制的元素，象征收入、财务稳定和实际价值。" },
      { question: "正财强表示什么？", answer: "正财强表示财务责任感、务实和通过稳定努力积累财富的能力。这些人值得信赖，重视安全。" },
      { question: "正财人适合什么职业？", answer: "正财人在金融、会计、房地产、零售和稳定商业投资方面表现出色。他们务实的性格使他们在需要财务管理的角色中非常有效。" },
      { question: "正财如何影响感情关系？", answer: "正财人是忠诚、稳定的伴侣，提供安全感。他们重视实际的爱情表达，但可能需要发展情感深度和自发性。" }
    ],

    related_gods: ["pian-cai", "zheng-guan", "zheng-yin"],

    canonical_path: "/bazi/ten-gods/direct-wealth"
  },
  {
    id: "pian-cai",
    name_en: "Indirect Wealth (Pian Cai)",
    name_zh: "偏财",
    emoji: "🎲",

    title_en: "Indirect Wealth (Pian Cai) in Bazi | Ten Gods Guide",
    title_zh: "偏财在八字中的含义 | 十神完整指南",
    meta_description_en: "Discover the Indirect Wealth (Pian Cai) in Bazi astrology. Learn what Indirect Wealth reveals about windfall gains, investment sense, and social charm in Chinese Four Pillars.",
    meta_description_zh: "探索八字命理中的偏财。了解偏财揭示的意外之财、投资意识和社交魅力特征。",
    keywords_en: ["indirect wealth bazi", "pian cai meaning", "bazi ten gods indirect wealth", "indirect wealth personality", "bazi investment gains"],
    keywords_zh: ["偏财八字", "偏财含义", "八字十神偏财", "偏财性格", "八字投资收益"],

    overview_en: "The Indirect Wealth (Pian Cai) represents windfall gains, investment returns, and social charm. Unlike Direct Wealth's earned income, Indirect Wealth symbolizes unexpected financial opportunities, speculative gains, and the ability to attract wealth through social connections.",
    overview_zh: "偏财代表意外之财、投资回报和社交魅力。与正财的收入不同，偏财象征意外的财务机会、投机收益和通过社交关系吸引财富的能力。",
    personality_en: "People with strong Indirect Wealth influence are typically charming, generous, and socially adept. They have a natural ability to attract opportunities and are comfortable taking calculated risks for potential rewards.",
    personality_zh: "偏财影响强的人通常有魅力、慷慨、善于社交。他们有吸引机会的天赋，愿意为潜在回报承担计算过的风险。",
    strengths_en: "Social charm, generosity, risk-taking ability, investment sense, and the ability to attract opportunities. They are natural networkers who excel in social and financial environments.",
    strengths_zh: "社交魅力、慷慨、冒险能力、投资意识和吸引机会的能力。他们是天生的社交达人，在社交和金融环境中表现出色。",
    weaknesses_en: "Irregular income, difficulty with routine, scattergun approach to finances, and tendency toward speculation. They may experience financial instability due to inconsistent money management.",
    weaknesses_zh: "收入不稳定、难以适应常规、财务方法分散、倾向于投机。他们可能因不一致的资金管理而经历财务不稳定。",
    career_en: "Indirect Wealth individuals excel in sales, marketing, entertainment, hospitality, and investment. Their social charm and risk-taking ability make them effective in roles requiring networking and deal-making.",
    career_zh: "偏财人在销售、市场、娱乐、酒店和投资方面表现出色。他们社交魅力和冒险能力使他们在需要社交和交易的角色中非常有效。",
    relationships_en: "In relationships, Indirect Wealth individuals are generous, charming, and socially active. They may have many social connections but need to focus on depth and commitment in intimate relationships.",
    relationships_zh: "在感情关系中，偏财人慷慨、有魅力、社交活跃。他们可能有很多社交关系，但需要在亲密关系中关注深度和承诺。",

    faq_en: [
      { question: "What is Indirect Wealth in Bazi?", answer: "Indirect Wealth (Pian Cai) is one of the Ten Gods in Bazi. It represents windfall gains, investment returns, and social charm — the ability to attract wealth through connections and opportunities rather than steady effort." },
      { question: "What does a strong Indirect Wealth indicate?", answer: "A strong Indirect Wealth indicates social charm, generosity, and the ability to attract financial opportunities. These individuals are comfortable with risk and excel in networking and deal-making." },
      { question: "What careers suit Indirect Wealth people?", answer: "Indirect Wealth individuals excel in sales, marketing, entertainment, hospitality, and investment. Their social charm makes them effective in roles requiring networking and deal-making." },
      { question: "How does Indirect Wealth differ from Direct Wealth?", answer: "Direct Wealth represents earned, steady income through hard work, while Indirect Wealth represents windfall gains, investment returns, and wealth attracted through social connections and opportunities." }
    ],
    faq_zh: [
      { question: "什么是八字中的偏财？", answer: "偏财是八字十神之一。它代表意外之财、投资回报和社交魅力——通过关系和机会而非稳定努力吸引财富的能力。" },
      { question: "偏财强表示什么？", answer: "偏财强表示社交魅力、慷慨和吸引财务机会的能力。这些人愿意承担风险，在社交和交易方面表现出色。" },
      { question: "偏财人适合什么职业？", answer: "偏财人在销售、市场、娱乐、酒店和投资方面表现出色。他们社交魅力使他们在需要社交和交易的角色中非常有效。" },
      { question: "偏财与正财有什么区别？", answer: "正财代表通过努力获得的稳定收入，而偏财代表意外之财、投资回报和通过社交关系和机会吸引的财富。" }
    ],

    related_gods: ["zheng-cai", "shi-shen", "zheng-guan"],

    canonical_path: "/bazi/ten-gods/indirect-wealth"
  },
  {
    id: "shi-shen",
    name_en: "Eating God (Shi Shen)",
    name_zh: "食神",
    emoji: "🍽️",

    title_en: "Eating God (Shi Shen) in Bazi | Ten Gods Guide",
    title_zh: "食神在八字中的含义 | 十神完整指南",
    meta_description_en: "Discover the Eating God (Shi Shen) in Bazi astrology. Learn what the Eating God reveals about creativity, enjoyment, and artistic expression in Chinese Four Pillars.",
    meta_description_zh: "探索八字命理中的食神。了解食神揭示的创造力、享受和艺术表达特征。",
    keywords_en: ["eating god bazi", "shi shen meaning", "bazi ten gods eating god", "eating god personality", "bazi creativity art"],
    keywords_zh: ["食神八字", "食神含义", "八字十神食神", "食神性格", "八字创造力艺术"],

    overview_en: "The Eating God (Shi Shen) represents creativity, enjoyment, and artistic expression. It is the element that the Day Master produces in a balanced, joyful way, symbolizing creative output, pleasure, and the ability to appreciate life's beauty.",
    overview_zh: "食神代表创造力、享受和艺术表达。它是日主以平衡、快乐方式产生的元素，象征创造性产出、快乐和欣赏生活之美的能力。",
    personality_en: "People with strong Eating God influence are typically creative, enjoy life's pleasures, and have a natural artistic sensibility. They are expressive, optimistic, and find joy in creative pursuits and culinary experiences.",
    personality_zh: "食神影响强的人通常有创造力、享受生活乐趣、有天生的艺术感。他们善于表达、乐观，在创造性追求和美食体验中找到快乐。",
    strengths_en: "Creativity, artistic talent, enjoyment of life, optimism, and the ability to appreciate beauty. They are natural artists, chefs, and entertainers who bring joy to others.",
    strengths_zh: "创造力、艺术天赋、享受生活、乐观和欣赏美的能力。他们是天生的艺术家、厨师和表演者，给他人带来快乐。",
    weaknesses_en: "Overindulgence, laziness, lack of ambition, and difficulty with discipline. They may become too focused on pleasure and neglect responsibilities or long-term goals.",
    weaknesses_zh: "过度放纵、懒惰、缺乏抱负、难以自律。他们可能过于关注享乐，忽视责任或长期目标。",
    career_en: "Eating God individuals excel in creative fields, culinary arts, entertainment, teaching, and the arts. Their natural creativity and ability to enjoy life make them effective in roles requiring artistic expression.",
    career_zh: "食神人在创意领域、烹饪艺术、娱乐、教学和艺术方面表现出色。他们天生的创造力和享受生活的能力使他们在需要艺术表达的角色中非常有效。",
    relationships_en: "In relationships, Eating God individuals are warm, generous, and enjoy sharing experiences. They create joyful environments but may need to develop more focus and commitment to long-term goals.",
    relationships_zh: "在感情关系中，食神人温暖、慷慨、喜欢分享体验。他们创造快乐的环境，但可能需要对长期目标发展更多专注和承诺。",

    faq_en: [
      { question: "What is the Eating God in Bazi?", answer: "The Eating God (Shi Shen) is one of the Ten Gods in Bazi. It represents the element the Day Master produces in a joyful way, symbolizing creativity, enjoyment, artistic expression, and the appreciation of life's pleasures." },
      { question: "What does a strong Eating God indicate?", answer: "A strong Eating God indicates creativity, artistic talent, and a natural ability to enjoy life. These individuals are expressive, optimistic, and find joy in creative pursuits and culinary experiences." },
      { question: "What careers suit Eating God people?", answer: "Eating God individuals excel in creative fields, culinary arts, entertainment, teaching, and the arts. Their natural creativity makes them effective in roles requiring artistic expression." },
      { question: "How does Eating God affect health?", answer: "The Eating God is associated with appetite and enjoyment of food. People with strong Eating God should be mindful of overindulgence and maintain balance between pleasure and health." }
    ],
    faq_zh: [
      { question: "什么是八字中的食神？", answer: "食神是八字十神之一。它代表日主以快乐方式产生的元素，象征创造力、享受、艺术表达和对生活乐趣的欣赏。" },
      { question: "食神强表示什么？", answer: "食神强表示创造力、艺术天赋和享受生活的天赋。这些人善于表达、乐观，在创造性追求和美食体验中找到快乐。" },
      { question: "食神人适合什么职业？", answer: "食神人在创意领域、烹饪艺术、娱乐、教学和艺术方面表现出色。他们天生的创造力使他们在需要艺术表达的角色中非常有效。" },
      { question: "食神如何影响健康？", answer: "食神与食欲和对食物的享受相关。食神强的人应注意避免过度放纵，在享乐和健康之间保持平衡。" }
    ],

    related_gods: ["shang-guan", "pian-cai", "zheng-cai"],

    canonical_path: "/bazi/ten-gods/eating-god"
  }
]

export const BaziTenGodMap: Record<string, BaziTenGod> = Object.fromEntries(
  BaziTenGods.map(god => [god.id, god])
)
