export interface BaziAnalysis {
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
  factors_en: string
  factors_zh: string
  interpretation_en: string
  interpretation_zh: string
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>
  canonical_path: string
}

export const BaziAnalyses: BaziAnalysis[] = [
  {
    id: "career",
    name_en: "Career Analysis",
    name_zh: "事业分析",
    emoji: "💼",
    title_en: "Bazi Career Analysis: Find Your Ideal Professional Path",
    title_zh: "八字事业分析：找到你的理想职业道路",
    meta_description_en: "Discover your career destiny through Bazi analysis. Learn how your Four Pillars reveal your ideal profession, work style, and timing for career success.",
    meta_description_zh: "通过八字分析发现你的事业命运。了解你的四柱如何揭示你的理想职业、工作风格和事业成功的时机。",
    keywords_en: ["bazi career analysis", "four pillars career", "chinese astrology career", "bazi job reading"],
    keywords_zh: ["八字事业分析", "四柱事业", "中国占星事业", "八字工作解读"],
    overview_en: "Bazi career analysis examines your Day Master, favorable elements, and luck cycles to reveal your natural professional strengths and ideal career paths. By understanding the elemental composition of your chart, you can align your career choices with your innate talents for greater success and fulfillment.",
    overview_zh: "八字事业分析检查你的日主、有利五行和大运周期，揭示你的天生专业优势和理想职业道路。通过理解你命盘的五行构成，你可以将职业选择与你的天赋对齐，以获得更大的成功和满足感。",
    method_en: "The analysis examines: 1) Day Master element and its strength, 2) Favorable elements for career, 3) Officer and Wealth stars in your chart, 4) Current Luck Pillar influence on career, 5) Seasonal elements and their impact on your professional growth.",
    method_zh: "分析检查：1）日主五行及其强弱，2）事业有利五行，3）命盘中的官星和财星，4）当前大运对事业的影响，5）季节五行及其对职业成长的影响。",
    factors_en: "Key factors include your Day Master's element (which determines your natural work style), the presence of Officer stars (indicating authority and leadership), Wealth stars (indicating financial opportunities), and the balance of elements in your chart.",
    factors_zh: "关键因素包括你日主的五行（决定你的自然工作风格）、官星的存在（表示权威和领导力）、财星（表示财务机会），以及命盘中五行的平衡。",
    interpretation_en: "A strong Day Master with favorable Officer stars suggests leadership roles and career advancement. A strong Day Master with Wealth stars indicates entrepreneurial success and financial abundance. A weak Day Master benefits from supportive elements and team-based work environments.",
    interpretation_zh: "身强且有有利官星的人适合领导角色和事业发展。身强且有财星的人表示创业成功和财务丰盛。身弱的人受益于生扶五行和团队合作的工作环境。",
    faq_en: [
      { question: "How accurate is Bazi career analysis?", answer: "Bazi provides insights into your natural tendencies and optimal timing, but your choices and efforts ultimately shape your career. Think of it as a compass, not a GPS." },
      { question: "Can Bazi predict job loss?", answer: "Bazi can indicate periods of career transition or challenge, but it doesn't predict specific events. It shows when to be cautious and when to take action." },
      { question: "What if my chart shows multiple career paths?", answer: "This is common and suggests versatility. Focus on paths that align with your most favorable elements for the best results." }
    ],
    faq_zh: [
      { question: "八字事业分析有多准确？", answer: "八字提供对你天生倾向和最佳时机的洞察，但你的选择和努力最终塑造你的事业。把它当作指南针，而不是GPS。" },
      { question: "八字能预测失业吗？", answer: "八字可以表示职业转变或挑战的时期，但它不预测具体事件。它显示何时谨慎，何时采取行动。" },
      { question: "如果我的命盘显示多条职业道路怎么办？", answer: "这很常见，表示多才多艺。专注于与你最有利五行对齐的道路，以获得最佳结果。" }
    ],
    canonical_path: "/bazi/analysis/career",
  },
  {
    id: "wealth",
    name_en: "Wealth Analysis",
    name_zh: "财运分析",
    emoji: "💰",
    title_en: "Bazi Wealth Analysis: Unlock Your Financial Potential",
    title_zh: "八字财运分析：释放你的财务潜力",
    meta_description_en: "Discover your wealth potential through Bazi analysis. Learn how your Four Pillars reveal your financial strengths, earning style, and optimal timing for wealth accumulation.",
    meta_description_zh: "通过八字分析发现你的财务潜力。了解你的四柱如何揭示你的财务优势、赚钱风格和财富积累的最佳时机。",
    keywords_en: ["bazi wealth analysis", "four pillars finance", "chinese astrology money", "bazi financial reading"],
    keywords_zh: ["八字财运分析", "四柱财务", "中国占星财运", "八字财务解读"],
    overview_en: "Bazi wealth analysis examines the Wealth stars in your chart, your Day Master's relationship with wealth elements, and your luck cycles to reveal your financial destiny. Understanding your Bazi wealth pattern helps you make better investment decisions, choose the right career for financial growth, and time major financial moves.",
    overview_zh: "八字财运分析检查命盘中的财星、日主与财星五行的关系，以及你的大运周期，揭示你的财务命运。了解你的八字财运模式有助于你做出更好的投资决策、选择正确的职业以实现财务增长，以及把握重大财务行动的时机。",
    method_en: "The analysis examines: 1) Direct Wealth and Indirect Wealth stars, 2) Your Day Master's strength and ability to control wealth, 3) Favorable elements for wealth generation, 4) Current Luck Pillar's influence on finances, 5) Seasonal wealth opportunities.",
    method_zh: "分析检查：1）正财和偏财星，2）日主的强弱和掌控财富的能力，3）生财的有利五行，4）当前大运对财务的影响，5）季节性财运机会。",
    factors_en: "Key factors include the presence and strength of Wealth stars, your Day Master's element (wood people earn through growth, fire through passion, earth through stability, metal through precision, water through flow), and the balance between earning potential and saving capacity.",
    factors_zh: "关键因素包括财星的存在和强度、你日主的五行（木型人通过成长赚钱，火型通过激情，土型通过稳定，金型通过精准，水型通过流动），以及赚钱能力和储蓄能力之间的平衡。",
    interpretation_en: "Charts with strong Wealth stars and supportive elements indicate natural wealth accumulation. Charts with weak Day Masters but strong Wealth stars may struggle to retain money. Charts with strong Day Masters and no Wealth stars need to work harder for financial success but can build through patience and skill.",
    interpretation_zh: "财星强且有生扶五行的命盘表示自然的财富积累。日主弱但财星强的命盘可能难以留住钱财。日主强但无财星的命盘需要更努力才能获得财务成功，但可以通过耐心和技能积累财富。",
    faq_en: [
      { question: "Can Bazi predict lottery wins?", answer: "Bazi cannot predict random events like lottery wins. It shows your general wealth potential and the best times for financial opportunities." },
      { question: "What if my chart shows no Wealth stars?", answer: "This doesn't mean you can't be wealthy. It suggests you'll build wealth through skill development, patience, and steady effort rather than windfall gains." },
      { question: "When is the best time to make investments according to Bazi?", answer: "Invest during years and months that favor your favorable wealth elements. Avoid major financial decisions during challenging luck periods." }
    ],
    faq_zh: [
      { question: "八字能预测彩票中奖吗？", answer: "八字无法预测像彩票中奖这样的随机事件。它显示你的一般财务潜力和财务机会的最佳时机。" },
      { question: "如果我的命盘没有财星怎么办？", answer: "这并不意味着你不能致富。它表明你将通过技能发展、耐心和稳定努力来积累财富，而不是意外之财。" },
      { question: "根据八字，什么时候是投资的最佳时机？", answer: "在有利于你的有利财星的年份和月份投资。避免在有挑战的大运期间做出重大财务决策。" }
    ],
    canonical_path: "/bazi/analysis/wealth",
  },
  {
    id: "health",
    name_en: "Health Analysis",
    name_zh: "健康分析",
    emoji: "🏥",
    title_en: "Bazi Health Analysis: Understand Your Body's Blueprint",
    title_zh: "八字健康分析：了解你身体的蓝图",
    meta_description_en: "Discover health insights through Bazi analysis. Learn how your Four Pillars reveal your body's strengths, vulnerabilities, and optimal wellness strategies.",
    meta_description_zh: "通过八字分析发现健康洞察。了解你的四柱如何揭示你身体的优势、弱点和最佳健康策略。",
    keywords_en: ["bazi health analysis", "four pillars health", "chinese astrology wellness", "bazi body reading"],
    keywords_zh: ["八字健康分析", "四柱健康", "中国占星养生", "八字身体解读"],
    overview_en: "Bazi health analysis maps your Five Element composition to your physical body systems. Each element corresponds to specific organs and health tendencies. By understanding your elemental balance, you can identify potential health vulnerabilities, optimize your diet and lifestyle, and prevent imbalances before they become problems.",
    overview_zh: "八字健康分析将你的五行构成映射到你的身体系统。每个元素对应特定的器官和健康倾向。通过理解你的五行平衡，你可以识别潜在的健康弱点，优化你的饮食和生活方式，并在失衡成为问题之前预防它们。",
    method_en: "The analysis examines: 1) Your Five Element balance and imbalances, 2) Day Master element and its corresponding organ systems, 3) Excessive or deficient elements affecting health, 4) Seasonal health vulnerabilities, 5) Current Luck Pillar's health influences.",
    method_zh: "分析检查：1）你的五行平衡和失衡，2）日主五行及其对应的器官系统，3）影响健康的过多或不足的五行，4）季节性健康弱点，5）当前大运对健康的影响。",
    factors_en: "Key factors include the strength of each element (wood=liver, fire=heart, earth=spleen, metal=lung, water=kidney), elemental clashes that may indicate health risks, and the overall balance of your chart.",
    factors_zh: "关键因素包括每个五行的强弱（木=肝、火=心、土=脾、金=肺、水=肾）、可能表示健康风险的五行相克，以及命盘的整体平衡。",
    interpretation_en: "Charts with balanced five elements suggest good overall health. Charts with one element excessively strong or weak may indicate vulnerability in the corresponding organ system. Seasonal health changes often align with elemental shifts in your luck cycles.",
    interpretation_zh: "五行平衡的命盘表示整体健康良好。某一五行过强或过弱的命盘可能表示相应器官系统的脆弱性。季节性健康变化通常与你大运周期中的五行变化一致。",
    faq_en: [
      { question: "Can Bazi replace medical advice?", answer: "No, Bazi health analysis is for wellness guidance only. Always consult healthcare professionals for medical concerns." },
      { question: "How can I use Bazi for preventive health?", answer: "By understanding your elemental weaknesses, you can strengthen vulnerable areas through diet, exercise, and lifestyle adjustments during vulnerable periods." },
      { question: "Does Bazi predict illness?", answer: "Bazi indicates tendencies and vulnerable periods, not specific illnesses. Use it as a guide for proactive health management." }
    ],
    faq_zh: [
      { question: "八字能替代医疗建议吗？", answer: "不能，八字健康分析仅供养生指引。对于医疗问题，请始终咨询医疗专业人员。" },
      { question: "我如何用八字进行预防性健康？", answer: "通过了解你的五行弱点，你可以在脆弱时期通过饮食、运动和生活方式调整来加强脆弱区域。" },
      { question: "八字能预测疾病吗？", answer: "八字表示倾向和脆弱时期，而不是特定疾病。将它作为主动健康管理的指南。" }
    ],
    canonical_path: "/bazi/analysis/health",
  },
  {
    id: "relationships",
    name_en: "Relationship Analysis",
    name_zh: "感情分析",
    emoji: "💕",
    title_en: "Bazi Relationship Analysis: Understand Your Love Compatibility",
    title_zh: "八字感情分析：了解你的爱情兼容性",
    meta_description_en: "Discover relationship insights through Bazi analysis. Learn how your Four Pillars reveal your love style, compatibility, and relationship patterns.",
    meta_description_zh: "通过八字分析发现感情洞察。了解你的四柱如何揭示你的爱情风格、兼容性和关系模式。",
    keywords_en: ["bazi relationship analysis", "four pillars love", "chinese astrology compatibility", "bazi marriage reading"],
    keywords_zh: ["八字感情分析", "四柱爱情", "中国占星配对", "八字婚姻解读"],
    overview_en: "Bazi relationship analysis examines the Spouse Star in your chart, your Day Master's interaction with other elements, and your relationship patterns. Understanding your Bazi love style helps you identify compatible partners, understand relationship dynamics, and navigate love challenges more effectively.",
    overview_zh: "八字感情分析检查你命盘中的配偶星、日主与其他五行的互动，以及你的关系模式。了解你的八字爱情风格有助于你识别兼容的伴侣、理解关系动态，并更有效地应对爱情挑战。",
    method_en: "The analysis examines: 1) Spouse Star (Direct Wealth for men, Direct Officer for women), 2) Your Day Master's strength and relationship style, 3) Earthly Branch relationships, 4) Spouse Palace condition, 5) Luck Pillar timing for romance.",
    method_zh: "分析检查：1）配偶星（男命正财，女命正官），2）日主的强弱和关系风格，3）地支关系（合、冲、刑），4）配偶宫状态，5）大运中的感情时机。",
    factors_en: "Key factors include the presence and condition of your Spouse Star, the Earthly Branch of your Day Pillar (Spouse Palace), clashes or combinations that affect relationships, and the overall balance of your chart in terms of Yin-Yang harmony.",
    factors_zh: "关键因素包括配偶星的存在和状态、日柱的地支（配偶宫）、影响关系的冲合，以及命盘在阴阳和谐方面的整体平衡。",
    interpretation_en: "Charts with a strong, well-placed Spouse Star indicate relationship success and a supportive partner. Charts with clashing Spouse Palaces may face relationship turbulence. The timing of marriage and romance often aligns with favorable Luck Pillars.",
    interpretation_zh: "配偶星强且位置良好的命盘表示关系成功和支持性的伴侣。配偶宫相冲的命盘可能面临关系波动。婚姻和恋爱的时机通常与有利的大运周期一致。",
    faq_en: [
      { question: "Can Bazi predict who I'll marry?", answer: "Bazi describes the type of partner you're compatible with, not a specific person. It shows relationship patterns and timing." },
      { question: "What if my chart shows relationship challenges?", answer: "Challenging charts indicate areas for growth. With self-awareness and effort, any relationship challenge can be overcome." },
      { question: "How do I find my Spouse Star?", answer: "For men, it's the Wealth element (Direct Wealth). For women, it's the Officer element (Direct Officer). A Bazi practitioner can help identify it in your chart." }
    ],
    faq_zh: [
      { question: "八字能预测我会嫁给谁吗？", answer: "八字描述你与之兼容的伴侣类型，而不是特定的人。它显示关系模式和时机。" },
      { question: "如果我的命盘显示关系挑战怎么办？", answer: "有挑战的命盘表示需要成长的领域。通过自我意识和努力，任何关系挑战都可以克服。" },
      { question: "我如何找到我的配偶星？", answer: "对于男性，是财星（正财）。对于女性，是官星（正官）。八字从业者可以帮助你在命盘中识别它。" }
    ],
    canonical_path: "/bazi/analysis/relationships",
  },
  {
    id: "personality",
    name_en: "Personality Analysis",
    name_zh: "性格分析",
    emoji: "🧠",
    title_en: "Bazi Personality Analysis: Discover Your True Nature",
    title_zh: "八字性格分析：发现你的真实本性",
    meta_description_en: "Understand your personality through Bazi analysis. Learn how your Day Master and Five Elements reveal your core traits, strengths, and growth areas.",
    meta_description_zh: "通过八字分析了解你的性格。了解你的日主和五行如何揭示你的核心特质、优势和成长领域。",
    keywords_en: ["bazi personality", "day master personality", "five elements character", "chinese astrology traits"],
    keywords_zh: ["八字性格", "日主性格", "五行性格", "中国占星特质"],
    overview_en: "Bazi personality analysis is centered on your Day Master — the Heavenly Stem of your Day Pillar. This element defines your core personality, natural tendencies, and how you interact with the world. Combined with the Five Elements in your chart, it creates a detailed portrait of who you truly are.",
    overview_zh: "八字性格分析以你的日主为中心——日柱的天干。这个五行定义了你的核心性格、自然倾向和你与世界的互动方式。结合命盘中的五行，它创造了你真实自我的详细画像。",
    method_en: "The analysis examines: 1) Day Master element and its qualities, 2) Yin or Yang expression of your element, 3) Supporting and controlling elements in your chart, 4) Season of birth and its influence, 5) Hidden Stems in your Earthly Branches.",
    method_zh: "分析检查：1）日主五行及其特质，2）你五行的阴或阳表达，3）命盘中的生扶和克制五行，4）出生季节及其影响，5）地支中的藏干。",
    factors_en: "Key factors include whether your Day Master is strong or weak (affecting confidence and assertiveness), the balance of elements (affecting temperament), and specific combinations that create unique personality traits.",
    factors_zh: "关键因素包括你的日主是强还是弱（影响自信和果断性）、五行的平衡（影响性情），以及创造独特性格特质的特定组合。",
    interpretation_en: "Each Day Master has distinct traits: Jia Wood is principled and growth-oriented, Yi Wood is flexible and artistic, Bing Fire is charismatic and inspiring, Ding Fire is warm and detail-oriented, Wu Earth is reliable and nurturing, Ji Earth is adaptable and resourceful, Geng Metal is decisive and justice-driven, Xin Metal is refined and elegant, Ren Water is intelligent and adventurous, Gui Water is intuitive and nurturing.",
    interpretation_zh: "每个日主都有独特的特质：甲木有原则且注重成长，乙木灵活且有艺术性，丙火有魅力且鼓舞人心，丁火温暖且注重细节，戊土可靠且有养育心，己土适应力强且足智多谋，庚金属果断且追求正义，辛金精致且优雅，壬水聪明且爱冒险，癸水直觉强且有养育心。",
    faq_en: [
      { question: "Does my Day Master change over time?", answer: "No, your Day Master is fixed at birth. However, how its energy manifests can change based on your current Luck Pillar and environment." },
      { question: "Can two people with the same Day Master be different?", answer: "Yes! The other elements in the chart, season of birth, and hidden stems create unique variations even with the same Day Master." },
      { question: "How can I use Bazi personality insights?", answer: "Understanding your natural tendencies helps in career choices, relationship building, personal development, and self-acceptance." }
    ],
    faq_zh: [
      { question: "我的日主会随时间改变吗？", answer: "不会，你的日主在出生时就固定了。然而，它的能量表现方式可以根据你当前的大运周期和环境而改变。" },
      { question: "两个日主相同的人会不同吗？", answer: "会！命盘中的其他五行、出生季节和藏干即使日主相同也会创造独特的变化。" },
      { question: "我如何利用八字性格洞察？", answer: "理解你的自然倾向有助于职业选择、人际关系建设、个人发展和自我接纳。" }
    ],
    canonical_path: "/bazi/analysis/personality",
  },
  {
    id: "education",
    name_en: "Education Analysis",
    name_zh: "学业分析",
    emoji: "📚",
    title_en: "Bazi Education Analysis: Optimize Your Learning Path",
    title_zh: "八字学业分析：优化你的学习道路",
    meta_description_en: "Discover your learning style through Bazi analysis. Learn how your chart reveals your academic strengths, study methods, and optimal timing for education.",
    meta_description_zh: "通过八字分析发现你的学习风格。了解你的命盘如何揭示你的学术优势、学习方法和教育的最佳时机。",
    keywords_en: ["bazi education", "bazi study", "four pillars learning", "chinese astrology academic"],
    keywords_zh: ["八字学业", "八字学习", "四柱学业", "中国占星学术"],
    overview_en: "Bazi education analysis examines the Intelligence Star in your chart and your Day Master's learning style. Understanding your Bazi education pattern helps you choose the right study methods, timing for exams, and academic paths that align with your natural talents.",
    overview_zh: "八字学业分析检查命盘中的食神/伤官（智力星）和你日主的学习风格。了解你的八字学业模式有助于你选择正确的学习方法、考试时机，以及与你天赋对齐的学术道路。",
    method_en: "The analysis examines: 1) Intelligence Stars presence and strength, 2) Your Day Master's learning style, 3) Resource Star for academic support, 4) Favorable elements for study, 5) Timing for exams and academic achievements.",
    method_zh: "分析检查：1）智力星（食神/伤官）的存在和强度，2）你日主的学习风格，3）印星（资源星）对学业的支持，4）学习的有利五行，5）考试和学术成就的时机。",
    factors_en: "Key factors include the strength of Intelligence Stars (indicating natural learning ability), the Resource Star (indicating academic support and study habits), and the balance between creative expression and structured learning.",
    factors_zh: "关键因素包括智力星的强度（表示自然学习能力）、印星（表示学业支持和学习习惯），以及创造性表达和结构化学习之间的平衡。",
    interpretation_en: "Charts with strong Intelligence Stars indicate natural academic talent and creative thinking. Charts with strong Resource Stars suggest good study habits and academic support. The best timing for exams often falls during years that favor your favorable study elements.",
    interpretation_zh: "智力星强的命盘表示天生的学术才能和创造性思维。印星强的命盘表示良好的学习习惯和学业支持。考试的最佳时机通常落在有利于你有利学习五行的年份。",
    faq_en: [
      { question: "Can Bazi predict academic success?", answer: "Bazi shows your learning style and optimal timing, not specific grades. Use it to study smarter, not harder." },
      { question: "What if my child has weak Intelligence Stars?", answer: "This doesn't mean they can't succeed. They may need different teaching methods and more structured learning approaches." },
      { question: "When is the best time for exams?", answer: "Schedule important exams during years and months that favor your favorable study elements for best results." }
    ],
    faq_zh: [
      { question: "八字能预测学术成功吗？", answer: "八字显示你的学习风格和最佳时机，而不是具体成绩。用它来更聪明地学习，而不是更努力。" },
      { question: "如果我的孩子智力星弱怎么办？", answer: "这并不意味着他们不能成功。他们可能需要不同的教学方法和更结构化的学习方式。" },
      { question: "什么时候是考试的最佳时机？", answer: "在有利于你有利学习五行的年份和月份安排重要考试，以获得最佳结果。" }
    ],
    canonical_path: "/bazi/analysis/education",
  },
  {
    id: "travel",
    name_en: "Travel Analysis",
    name_zh: "出行分析",
    emoji: "✈️",
    title_en: "Bazi Travel Analysis: Find Your Auspicious Destinations",
    title_zh: "八字出行分析：找到你的吉祥方位",
    meta_description_en: "Discover your ideal travel destinations through Bazi analysis. Learn how your chart reveals favorable directions and timing for travel.",
    meta_description_zh: "通过八字分析发现你的理想旅行目的地。了解你的命盘如何揭示有利的出行方向和时机。",
    keywords_en: ["bazi travel", "bazi directions", "four pillars travel", "chinese astrology feng shui"],
    keywords_zh: ["八字出行", "八字方位", "四柱出行", "中国占星风水"],
    overview_en: "Bazi travel analysis uses your chart to determine favorable directions, timing, and destinations for travel. By aligning your journeys with your favorable elements, you can enhance your travel experiences and avoid potential obstacles during your trips.",
    overview_zh: "八字出行分析使用你的命盘来确定有利的方向、时机和旅行目的地。通过将你的旅程与你的有利五行对齐，你可以增强你的旅行体验，并避免旅途中的潜在障碍。",
    method_en: "The analysis examines: 1) Your favorable elements and their corresponding directions, 2) Unfavorable elements to avoid, 3) Seasonal travel timing, 4) Current Luck Pillar travel influences, 5) Specific travel dates aligned with your chart.",
    method_zh: "分析检查：1）你的有利五行及其对应的方向，2）需要避免的不利五行，3）季节性出行时机，4）当前大运对出行的影响，5）与你命盘对齐的特定出行日期。",
    factors_en: "Key factors include your favorable elements (which determine directions: wood=east, fire=south, earth=center, metal=west, water=north), current luck cycles, and seasonal influences on your travel success.",
    factors_zh: "关键因素包括你的有利五行（决定方向：木=东、火=南、土=中、金=西、水=北）、当前大运周期，以及季节对你出行成功的影响。",
    interpretation_en: "Travel to directions associated with your favorable elements is most beneficial. Avoid travel during months that clash with your Day Master. The best travel timing often falls during Luck Pillars that support your travel-related elements.",
    interpretation_zh: "前往与你有利五行相关的方向最为有益。避免在与你日柱相冲的月份出行。最佳出行时机通常落在支持你出行相关五行的大运周期中。",
    faq_en: [
      { question: "Can Bazi really influence travel safety?", answer: "Bazi suggests optimal timing and directions, but always prioritize practical safety measures regardless of chart readings." },
      { question: "What direction should I travel?", answer: "Travel toward directions associated with your favorable elements. A Bazi practitioner can identify your specific favorable directions." },
      { question: "When is the best time to travel?", answer: "Travel during seasons and months that favor your chart's favorable elements for the best experiences." }
    ],
    faq_zh: [
      { question: "八字真的能影响出行安全吗？", answer: "八字建议最佳时机和方向，但无论命盘解读如何，始终优先考虑实际安全措施。" },
      { question: "我应该往哪个方向旅行？", answer: "前往与你有利五行相关的方向旅行。八字从业者可以识别你具体有利的方向。" },
      { question: "什么时候是旅行的最佳时机？", answer: "在有利于你命盘有利五行的季节和月份旅行，以获得最佳体验。" }
    ],
    canonical_path: "/bazi/analysis/travel",
  },
  {
    id: "wealth-timing",
    name_en: "Wealth Timing",
    name_zh: "财运时机",
    emoji: "⏰",
    title_en: "Bazi Wealth Timing: When Will Money Come?",
    title_zh: "八字财运时机：什么时候会有钱？",
    meta_description_en: "Learn when wealth opportunities will arrive through Bazi timing analysis. Discover the best periods for financial growth and investment.",
    meta_description_zh: "通过八字时机分析了解财富机会何时到来。发现财务增长和投资的最佳时期。",
    keywords_en: ["bazi wealth timing", "bazi money luck", "four pillars financial timing", "chinese astrology wealth period"],
    keywords_zh: ["八字财运时机", "八字财运", "四柱财务时机", "中国占星财运时期"],
    overview_en: "Bazi wealth timing analysis examines your Luck Pillars and Annual Pillars to identify the most favorable periods for wealth accumulation. By understanding your financial cycles, you can time major investments, career moves, and business decisions for maximum financial benefit.",
    overview_zh: "八字财运时机分析检查你的大运和流年，以识别财富积累最有利的时期。通过了解你的财务周期，你可以把握重大投资、职业变动和商业决策的时机，以获得最大的财务收益。",
    method_en: "The analysis examines: 1) Your ten-year Luck Pillars and their wealth potential, 2) Annual Pillar influences on finances, 3) Monthly wealth cycles, 4) Favorable elements for wealth generation, 5) Optimal timing for financial decisions.",
    method_zh: "分析检查：1）你的十年大运及其财富潜力，2）流年对财务的影响，3）月度财运周期，4）生财的有利五行，5）财务决策的最佳时机。",
    factors_en: "Key factors include the wealth-carrying potential of each Luck Pillar, annual and monthly wealth stars, the relationship between your Day Master and wealth elements, and specific combinations that activate financial opportunities.",
    factors_zh: "关键因素包括每个大运的财富承载潜力、流年和流月的财星、你日主与财星的关系，以及激活财务机会的特定组合。",
    interpretation_en: "Periods when favorable wealth elements are strong indicate peak earning potential. Periods with clashing elements may bring financial challenges. The best time for major financial moves is during Luck Pillars that support your wealth elements.",
    interpretation_zh: "有利财星强的时期表示收入潜力的巅峰。有相克五行的时期可能带来财务挑战。重大财务行动的最佳时机是在支持你财星的大运周期中。",
    faq_en: [
      { question: "Can Bazi predict exactly when I'll get rich?", answer: "Bazi shows favorable periods and tendencies, not specific amounts or exact dates. Use it as a guide for timing financial decisions." },
      { question: "What if I'm in a challenging wealth period?", answer: "Focus on saving, skill-building, and preparing for better periods. Avoid major risks during challenging times." },
      { question: "How often should I check my wealth timing?", answer: "Review your Luck Pillar at the start of each decade and check annual influences each year for ongoing financial planning." }
    ],
    faq_zh: [
      { question: "八字能准确预测我什么时候会变富吗？", answer: "八字显示有利时期和趋势，而不是具体金额或确切日期。将它作为财务决策时机的指南。" },
      { question: "如果我在有挑战的财运时期怎么办？", answer: "专注于储蓄、技能提升，并为更好的时期做准备。避免在有挑战的时期承担重大风险。" },
      { question: "我应该多久检查一次财运时机？", answer: "在每个十年开始时回顾你的大运，并每年检查流年影响，以便进行持续的财务规划。" }
    ],
    canonical_path: "/bazi/analysis/wealth-timing",
  },
]

export const BaziAnalysisMap = Object.fromEntries(BaziAnalyses.map(a => [a.id, a]))
