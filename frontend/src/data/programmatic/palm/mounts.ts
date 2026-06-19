export interface PalmMount {
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
  developed_meaning_en: string
  developed_meaning_zh: string
  flat_meaning_en: string
  flat_meaning_zh: string
  prominent_meaning_en: string
  prominent_meaning_zh: string

  // FAQ
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>

  // Internal Linking
  related_mounts: string[]
  related_lines: string[]

  // Canonical
  canonical_path: string
}

export const PalmMounts: PalmMount[] = [
  {
    id: "jupiter",
    name_en: "Mount of Jupiter",
    name_zh: "木星丘",
    emoji: "👑",

    title_en: "Mount of Jupiter Meaning in Palmistry | Palm Reading Guide",
    title_zh: "木星丘手相含义 | 手相学完整指南",
    meta_description_en: "Discover the Mount of Jupiter in palmistry. Learn what a developed or flat Jupiter mount reveals about leadership, ambition, and self-confidence in your palm reading.",
    meta_description_zh: "探索手相学中的木星丘。了解发达或平坦的木星丘在手相中代表的领导力、抱负和自信。",
    keywords_en: ["mount of jupiter palmistry", "jupiter mount meaning", "palm reading jupiter mount", "jupiter mount hand", "jupiter mount personality"],
    keywords_zh: ["木星丘手相", "木星丘含义", "手相木星丘", "木星丘性格", "木星丘掌丘"],

    overview_en: "The Mount of Jupiter is located at the base of the index finger. In palmistry, it represents ambition, leadership, self-confidence, and social status. A well-developed Jupiter mount indicates a natural leader with strong self-esteem and a desire for achievement.",
    overview_zh: "木星丘位于食指根部。在手相学中，它代表抱负、领导力、自信和社会地位。发达的木星丘表示天生的领导者，拥有强烈的自尊心和成就欲望。",
    location_en: "Located at the base of the index finger, between the Head Line and the Heart Line on the upper palm.",
    location_zh: "位于食指根部，在手掌上部的感情线和智慧线之间。",
    developed_meaning_en: "A well-developed Mount of Jupiter indicates strong leadership qualities, natural charisma, ambition, and a desire to help others. These individuals are often confident, optimistic, and have a strong sense of justice.",
    developed_meaning_zh: "发达的木星丘表示强烈的领导品质、天生的魅力、抱负以及帮助他人的愿望。这些人通常自信、乐观，并有强烈的正义感。",
    flat_meaning_en: "A flat Mount of Jupiter may indicate lack of ambition, low self-confidence, or disinterest in leadership roles. These individuals may be content with a quieter, more subordinate position in life.",
    flat_meaning_zh: "平坦的木星丘可能表示缺乏抱负、自信不足或对领导角色不感兴趣。这些人可能满足于生活中更安静、更从属的位置。",
    prominent_meaning_en: "An overly prominent Jupiter mount can indicate arrogance, excessive pride, or a domineering personality. These individuals may struggle with vanity and a need for constant admiration.",
    prominent_meaning_zh: "过于突出的木星丘可能表示傲慢、过度自负或专横的性格。这些人可能在虚荣心和需要持续崇拜方面有困难。",

    faq_en: [
      { question: "What does the Mount of Jupiter mean in palmistry?", answer: "The Mount of Jupiter, located at the base of the index finger, represents ambition, leadership, self-confidence, and social status. A well-developed mount indicates natural leadership qualities and strong self-esteem." },
      { question: "What if my Mount of Jupiter is flat?", answer: "A flat Jupiter mount suggests modest ambitions and a preference for working behind the scenes rather than seeking leadership roles. It doesn't indicate failure, but rather a different approach to achieving goals." },
      { question: "Can the Mount of Jupiter change over time?", answer: "According to traditional palmistry, mounts can change shape over time as your personality and life circumstances evolve. Regular self-reflection and personal growth can influence these changes." },
      { question: "How does the Jupiter mount relate to career success?", answer: "A well-developed Jupiter mount often correlates with success in leadership positions, politics, law, and entrepreneurship. It indicates the drive and confidence needed to pursue ambitious career goals." }
    ],
    faq_zh: [
      { question: "木星丘在手相学中代表什么？", answer: "木星丘位于食指根部，代表抱负、领导力、自信和社会地位。发达的木星丘表示天生的领导品质和强烈的自尊心。" },
      { question: "如果我的木星丘很平坦怎么办？", answer: "平坦的木星丘表示抱负适中，更喜欢在幕后工作而非寻求领导角色。这并不表示失败，而是实现目标的不同方式。" },
      { question: "木星丘会随时间变化吗？", answer: "根据传统手相学，丘的形状会随着性格和生活环境的变化而改变。定期的自我反思和个人成长会影响这些变化。" },
      { question: "木星丘与事业成功有什么关系？", answer: "发达的木星丘通常与领导职位、政治、法律和创业方面的成功相关。它表示追求雄心勃勃的职业目标所需的驱动力和自信。" }
    ],

    related_mounts: ["saturn", "apollo", "mercury"],
    related_lines: ["heart-line", "head-line"],

    canonical_path: "/palm-reading/mounts/jupiter"
  },
  {
    id: "saturn",
    name_en: "Mount of Saturn",
    name_zh: "土星丘",
    emoji: "⏳",

    title_en: "Mount of Saturn Meaning in Palmistry | Palm Reading Guide",
    title_zh: "土星丘手相含义 | 手相学完整指南",
    meta_description_en: "Learn about the Mount of Saturn in palmistry. Discover what a developed or flat Saturn mount reveals about wisdom, discipline, and introspection in your palm reading.",
    meta_description_zh: "了解手相学中的土星丘。探索发达或平坦的土星丘在手相中代表的智慧、纪律和内省。",
    keywords_en: ["mount of saturn palmistry", "saturn mount meaning", "palm reading saturn mount", "saturn mount hand", "saturn mount personality"],
    keywords_zh: ["土星丘手相", "土星丘含义", "手相土星丘", "土星丘性格", "土星丘掌丘"],

    overview_en: "The Mount of Saturn is located at the base of the middle finger. In palmistry, it represents wisdom, discipline, introspection, and a sense of responsibility. A well-developed Saturn mount indicates a thoughtful, serious-minded individual with deep philosophical interests.",
    overview_zh: "土星丘位于中指根部。在手相学中，它代表智慧、纪律、内省和责任感。发达的土星丘表示一个深思熟虑、认真严肃、对哲学有浓厚兴趣的人。",
    location_en: "Located at the base of the middle finger, between the Mount of Jupiter and the Mount of Apollo.",
    location_zh: "位于中指根部，在木星丘和太阳丘之间。",
    developed_meaning_en: "A well-developed Mount of Saturn indicates wisdom, patience, a strong sense of duty, and deep introspection. These individuals are often drawn to philosophy, spirituality, and solitary pursuits.",
    developed_meaning_zh: "发达的土星丘表示智慧、耐心、强烈的责任感和深刻的内省。这些人通常被哲学、灵性和独处所吸引。",
    flat_meaning_en: "A flat Saturn mount may indicate impatience, carelessness, or a lack of depth in thinking. These individuals may avoid responsibilities and prefer lighter, more immediate pleasures.",
    flat_meaning_zh: "平坦的土星丘可能表示缺乏耐心、粗心或思维深度不足。这些人可能逃避责任，更喜欢轻松、即时的享乐。",
    prominent_meaning_en: "An overly prominent Saturn mount can indicate excessive pessimism, loneliness, or a tendency toward melancholy. These individuals may become too focused on the darker aspects of life.",
    prominent_meaning_zh: "过于突出的土星丘可能表示过度悲观、孤独或倾向于忧郁。这些人可能过于关注生活的阴暗面。",

    faq_en: [
      { question: "What does the Mount of Saturn mean in palmistry?", answer: "The Mount of Saturn, located at the base of the middle finger, represents wisdom, discipline, introspection, and responsibility. A well-developed mount indicates a thoughtful, philosophical nature." },
      { question: "What if my Mount of Saturn is flat?", answer: "A flat Saturn mount suggests impatience and a preference for immediate gratification over long-term planning. It may indicate a lighter, more carefree approach to life." },
      { question: "Can a prominent Saturn mount cause problems?", answer: "An overly prominent Saturn mount can lead to excessive pessimism, loneliness, or melancholy. Balance is key — some Saturn influence provides wisdom, but too much can be limiting." },
      { question: "How does Saturn mount relate to spirituality?", answer: "A well-developed Saturn mount often correlates with deep spiritual interests, meditation practice, and philosophical thinking. It indicates a natural inclination toward seeking life's deeper meaning." }
    ],
    faq_zh: [
      { question: "土星丘在手相学中代表什么？", answer: "土星丘位于中指根部，代表智慧、纪律、内省和责任感。发达的土星丘表示深思熟虑、哲学性的天性。" },
      { question: "如果我的土星丘很平坦怎么办？", answer: "平坦的土星丘表示缺乏耐心，倾向于即时满足而非长期规划。可能表示一种更轻松、更无忧无虑的生活态度。" },
      { question: "突出的土星丘会有问题吗？", answer: "过于突出的土星丘可能导致过度悲观、孤独或忧郁。平衡是关键——适度的土星丘影响提供智慧，但过多则可能成为限制。" },
      { question: "土星丘与灵性有什么关系？", answer: "发达的土星丘通常与深厚的灵性兴趣、冥想练习和哲学思考相关。它表示一种自然倾向于探寻生命深层意义的倾向。" }
    ],

    related_mounts: ["jupiter", "apollo", "mars"],
    related_lines: ["head-line", "fate-line"],

    canonical_path: "/palm-reading/mounts/saturn"
  },
  {
    id: "apollo",
    name_en: "Mount of Apollo (Sun)",
    name_zh: "太阳丘",
    emoji: "☀️",

    title_en: "Mount of Apollo Meaning in Palmistry | Palm Reading Guide",
    title_zh: "太阳丘手相含义 | 手相学完整指南",
    meta_description_en: "Discover the Mount of Apollo in palmistry. Learn what a developed or flat Apollo mount reveals about creativity, success, and artistic talent in your palm reading.",
    meta_description_zh: "探索手相学中的太阳丘。了解发达或平坦的太阳丘在手相中代表的创造力、成功和艺术天赋。",
    keywords_en: ["mount of apollo palmistry", "sun mount meaning", "palm reading apollo mount", "apollo mount hand", "creativity palm reading"],
    keywords_zh: ["太阳丘手相", "太阳丘含义", "手相太阳丘", "太阳丘性格", "创造力手相"],

    overview_en: "The Mount of Apollo (also called the Sun Mount) is located at the base of the ring finger. In palmistry, it represents creativity, artistic talent, success, and a love of beauty. A well-developed Apollo mount indicates a creative, optimistic individual with a natural appreciation for art and aesthetics.",
    overview_zh: "太阳丘（又称日丘）位于无名指根部。在手相学中，它代表创造力、艺术天赋、成功和对美的热爱。发达的太阳丘表示一个有创造力、乐观、对艺术和美学有天然鉴赏力的人。",
    location_en: "Located at the base of the ring finger, between the Mount of Saturn and the Mount of Mercury.",
    location_zh: "位于无名指根部，在土星丘和水星丘之间。",
    developed_meaning_en: "A well-developed Mount of Apollo indicates strong creative abilities, artistic talent, charisma, and a natural appreciation for beauty. These individuals often excel in arts, entertainment, and public-facing roles.",
    developed_meaning_zh: "发达的太阳丘表示强烈的创造力、艺术天赋、魅力以及对美的天然鉴赏力。这些人通常在艺术、娱乐和公共角色方面表现出色。",
    flat_meaning_en: "A flat Apollo mount may indicate lack of creative drive, difficulty expressing emotions, or disinterest in artistic pursuits. These individuals may be more practical and less focused on aesthetics.",
    flat_meaning_zh: "平坦的太阳丘可能表示缺乏创造力、难以表达情感或对艺术追求不感兴趣。这些人可能更务实，不太关注美学。",
    prominent_meaning_en: "An overly prominent Apollo mount can indicate vanity, a need for constant attention, or unrealistic expectations. These individuals may struggle with balancing their creative ambitions with practical realities.",
    prominent_meaning_zh: "过于突出的太阳丘可能表示虚荣、需要持续关注或不切实际的期望。这些人可能在平衡创造性抱负与现实方面有困难。",

    faq_en: [
      { question: "What does the Mount of Apollo mean in palmistry?", answer: "The Mount of Apollo (Sun Mount), located at the base of the ring finger, represents creativity, artistic talent, success, and charisma. A well-developed mount indicates natural creative abilities." },
      { question: "What if my Mount of Apollo is flat?", answer: "A flat Apollo mount suggests practical thinking over creative expression. It doesn't mean you can't be creative, but rather that your strengths lie in other areas like logic or organization." },
      { question: "Can the Apollo mount predict artistic success?", answer: "A well-developed Apollo mount often correlates with success in creative fields like art, music, writing, and entertainment. However, success also requires dedication and practice." },
      { question: "How does Apollo mount relate to fame?", answer: "The Apollo mount is associated with public recognition and fame. A prominent mount suggests natural charisma and the ability to attract attention, which can lead to public success." }
    ],
    faq_zh: [
      { question: "太阳丘在手相学中代表什么？", answer: "太阳丘（日丘）位于无名指根部，代表创造力、艺术天赋、成功和魅力。发达的太阳丘表示天生的创造能力。" },
      { question: "如果我的太阳丘很平坦怎么办？", answer: "平坦的太阳丘表示务实思维优先于创造性表达。这并不意味着你不能有创造力，而是你的优势在其他领域如逻辑或组织能力。" },
      { question: "太阳丘能预测艺术成功吗？", answer: "发达的太阳丘通常与艺术、音乐、写作和娱乐等创意领域的成功相关。然而，成功还需要奉献和实践。" },
      { question: "太阳丘与名声有什么关系？", answer: "太阳丘与公众认可和名声相关。突出的太阳丘表示天生的魅力和吸引注意力的能力，这可以带来公众成功。" }
    ],

    related_mounts: ["saturn", "mercury", "venus"],
    related_lines: ["sun-line", "heart-line"],

    canonical_path: "/palm-reading/mounts/apollo"
  },
  {
    id: "mercury",
    name_en: "Mount of Mercury",
    name_zh: "水星丘",
    emoji: "💬",

    title_en: "Mount of Mercury Meaning in Palmistry | Palm Reading Guide",
    title_zh: "水星丘手相含义 | 手相学完整指南",
    meta_description_en: "Learn about the Mount of Mercury in palmistry. Discover what a developed or flat Mercury mount reveals about communication, business skills, and healing abilities.",
    meta_description_zh: "了解手相学中的水星丘。探索发达或平坦的水星丘在手相中代表的沟通能力、商业技巧和疗愈能力。",
    keywords_en: ["mount of mercury palmistry", "mercury mount meaning", "palm reading mercury mount", "mercury mount hand", "communication palm reading"],
    keywords_zh: ["水星丘手相", "水星丘含义", "手相水星丘", "水星丘性格", "沟通手相"],

    overview_en: "The Mount of Mercury is located at the base of the little finger. In palmistry, it represents communication skills, business acumen, healing abilities, and wit. A well-developed Mercury mount indicates excellent communication skills and a quick, analytical mind.",
    overview_zh: "水星丘位于小指根部。在手相学中，它代表沟通技巧、商业头脑、疗愈能力和机智。发达的水星丘表示出色的沟通技巧和敏捷的分析思维。",
    location_en: "Located at the base of the little finger, above the Heart Line on the upper palm.",
    location_zh: "位于小指根部，在手掌上部的感情线上方。",
    developed_meaning_en: "A well-developed Mount of Mercury indicates strong communication skills, business sense, healing abilities, and scientific aptitude. These individuals often excel in sales, medicine, writing, and teaching.",
    developed_meaning_zh: "发达的水星丘表示强大的沟通能力、商业头脑、疗愈能力和科学才能。这些人通常在销售、医学、写作和教学方面表现出色。",
    flat_meaning_en: "A flat Mercury mount may indicate difficulty in communication, lack of business sense, or dishonesty. These individuals may struggle with social interactions and expressing their thoughts clearly.",
    flat_meaning_zh: "平坦的水星丘可能表示沟通困难、缺乏商业头脑或不诚实。这些人可能在社交互动和清晰表达思想方面有困难。",
    prominent_meaning_en: "An overly prominent Mercury mount can indicate cunning, manipulative tendencies, or excessive talkativeness. These individuals may use their communication skills for personal gain at others' expense.",
    prominent_meaning_zh: "过于突出的水星丘可能表示狡猾、操纵倾向或过度健谈。这些人可能利用沟通技巧为个人利益而损害他人。",

    faq_en: [
      { question: "What does the Mount of Mercury mean in palmistry?", answer: "The Mount of Mercury, located at the base of the little finger, represents communication skills, business acumen, healing abilities, and wit. A well-developed mount indicates excellent social and professional skills." },
      { question: "What if my Mount of Mercury is flat?", answer: "A flat Mercury mount suggests challenges in communication and social interactions. It may indicate a preference for working independently rather than in team settings." },
      { question: "Can the Mercury mount indicate medical abilities?", answer: "Yes, a well-developed Mercury mount often correlates with natural healing abilities and success in medical or healthcare professions. It suggests sensitivity to others' needs." },
      { question: "How does Mercury mount relate to business success?", answer: "A prominent Mercury mount indicates strong business instincts, negotiation skills, and the ability to communicate persuasively — all essential traits for entrepreneurial success." }
    ],
    faq_zh: [
      { question: "水星丘在手相学中代表什么？", answer: "水星丘位于小指根部，代表沟通技巧、商业头脑、疗愈能力和机智。发达的水星丘表示出色的社交和专业技能。" },
      { question: "如果我的水星丘很平坦怎么办？", answer: "平坦的水星丘表示在沟通和社交互动方面有挑战。可能表示更喜欢独立工作而非团队合作。" },
      { question: "水星丘能显示医学能力吗？", answer: "是的，发达的水星丘通常与天生的疗愈能力和在医学或医疗保健领域的成功相关。它表示对他人需求的敏感性。" },
      { question: "水星丘与商业成功有什么关系？", answer: "突出的水星丘表示强烈的商业直觉、谈判技巧和说服力沟通能力——这些都是创业成功的基本特质。" }
    ],

    related_mounts: ["apollo", "jupiter", "mars"],
    related_lines: ["head-line", "heart-line"],

    canonical_path: "/palm-reading/mounts/mercury"
  },
  {
    id: "venus",
    name_en: "Mount of Venus",
    name_zh: "金星丘",
    emoji: "❤️",

    title_en: "Mount of Venus Meaning in Palmistry | Palm Reading Guide",
    title_zh: "金星丘手相含义 | 手相学完整指南",
    meta_description_en: "Discover the Mount of Venus in palmistry. Learn what a developed or flat Venus mount reveals about love, passion, vitality, and artistic appreciation in your palm reading.",
    meta_description_zh: "探索手相学中的金星丘。了解发达或平坦的金星丘在手相中代表的爱情、激情、活力和艺术鉴赏力。",
    keywords_en: ["mount of venus palmistry", "venus mount meaning", "palm reading venus mount", "venus mount hand", "love palm reading"],
    keywords_zh: ["金星丘手相", "金星丘含义", "手相金星丘", "金星丘性格", "爱情手相"],

    overview_en: "The Mount of Venus is located at the base of the thumb. In palmistry, it represents love, passion, vitality, beauty, and artistic appreciation. A well-developed Venus mount indicates a warm, affectionate individual with a strong appreciation for beauty and romance.",
    overview_zh: "金星丘位于拇指根部。在手相学中，它代表爱情、激情、活力、美丽和艺术鉴赏力。发达的金星丘表示一个热情、深情、对美和浪漫有强烈鉴赏力的人。",
    location_en: "Located at the base of the thumb, bounded by the Life Line on the inner side of the palm.",
    location_zh: "位于拇指根部，在手掌内侧被生命线所包围。",
    developed_meaning_en: "A well-developed Mount of Venus indicates strong capacity for love, passion, creativity, and enjoyment of life's pleasures. These individuals are often warm, generous, and have a strong appreciation for art and beauty.",
    developed_meaning_zh: "发达的金星丘表示强烈的爱情、激情、创造力和享受生活乐趣的能力。这些人通常热情、慷慨，对艺术和美有强烈的鉴赏力。",
    flat_meaning_en: "A flat Venus mount may indicate emotional coldness, lack of passion, or difficulty forming close relationships. These individuals may be more reserved and practical in their approach to love.",
    flat_meaning_zh: "平坦的金星丘可能表示情感冷漠、缺乏激情或难以建立亲密关系。这些人可能在爱情方面更保守、更务实。",
    prominent_meaning_en: "An overly prominent Venus mount can indicate excessive sensuality, vanity, or self-indulgence. These individuals may become too focused on physical pleasures and material comforts.",
    prominent_meaning_zh: "过于突出的金星丘可能表示过度感性、虚荣或自我放纵。这些人可能过于关注身体享乐和物质舒适。",

    faq_en: [
      { question: "What does the Mount of Venus mean in palmistry?", answer: "The Mount of Venus, located at the base of the thumb, represents love, passion, vitality, beauty, and artistic appreciation. A well-developed mount indicates strong emotional and creative capacities." },
      { question: "What if my Mount of Venus is flat?", answer: "A flat Venus mount may indicate emotional reserve or difficulty expressing affection. It doesn't mean you can't love, but rather that you express it differently — perhaps through actions rather than words." },
      { question: "Can the Venus mount predict romantic success?", answer: "A well-developed Venus mount suggests natural charm and the ability to attract romantic partners. However, lasting relationships also require communication, trust, and commitment." },
      { question: "How does Venus mount relate to creativity?", answer: "The Venus mount is closely linked to artistic and creative abilities. A prominent mount often indicates talent in music, dance, visual arts, or other creative endeavors." }
    ],
    faq_zh: [
      { question: "金星丘在手相学中代表什么？", answer: "金星丘位于拇指根部，代表爱情、激情、活力、美丽和艺术鉴赏力。发达的金星丘表示强烈的情感和创造能力。" },
      { question: "如果我的金星丘很平坦怎么办？", answer: "平坦的金星丘可能表示情感保守或难以表达爱意。这并不意味着你不能爱，而是你表达方式不同——可能通过行动而非言语。" },
      { question: "金星丘能预测恋爱成功吗？", answer: "发达的金星丘表示天生的魅力和吸引恋人的能力。然而，持久的关系还需要沟通、信任和承诺。" },
      { question: "金星丘与创造力有什么关系？", answer: "金星丘与艺术和创造能力密切相关。突出的金星丘通常表示在音乐、舞蹈、视觉艺术或其他创意领域的天赋。" }
    ],

    related_mounts: ["mars", "luna", "apollo"],
    related_lines: ["heart-line", "life-line"],

    canonical_path: "/palm-reading/mounts/venus"
  },
  {
    id: "mars",
    name_en: "Mount of Mars",
    name_zh: "火星丘",
    emoji: "⚔️",

    title_en: "Mount of Mars Meaning in Palmistry | Palm Reading Guide",
    title_zh: "火星丘手相含义 | 手相学完整指南",
    meta_description_en: "Learn about the Mount of Mars in palmistry. Discover what the Inner and Outer Mars mounts reveal about courage, resilience, and defensive energy in your palm reading.",
    meta_description_zh: "了解手相学中的火星丘。探索内火星丘和外火星丘在手相中代表的勇气、韧性和防御能量。",
    keywords_en: ["mount of mars palmistry", "mars mount meaning", "palm reading mars mount", "mars mount hand", "courage palm reading"],
    keywords_zh: ["火星丘手相", "火星丘含义", "手相火星丘", "火星丘性格", "勇气手相"],

    overview_en: "The Mount of Mars actually consists of two mounts: Inner Mars (defensive courage) and Outer Mars (offensive courage). Located on opposite sides of the palm, they represent courage, resilience, determination, and the ability to overcome obstacles.",
    overview_zh: "火星丘实际上由两个丘组成：内火星丘（防御性勇气）和外火星丘（进攻性勇气）。位于手掌的两侧，它们代表勇气、韧性、决心和克服障碍的能力。",
    location_en: "Inner Mars is located between the Life Line and Head Line. Outer Mars is located on the opposite side, between the Heart Line and the base of the palm.",
    location_zh: "内火星丘位于生命线和智慧线之间。外火星丘位于对侧，在感情线和手掌底部之间。",
    developed_meaning_en: "Well-developed Mars mounts indicate strong courage, resilience, and the ability to face challenges head-on. Inner Mars represents defensive courage and patience, while Outer Mars represents aggressive energy and fighting spirit.",
    developed_meaning_zh: "发达的火星丘表示强烈的勇气、韧性和直面挑战的能力。内火星丘代表防御性勇气和耐心，而外火星丘代表攻击性能量和战斗精神。",
    flat_meaning_en: "Flat Mars mounts may indicate timidity, lack of confidence, or avoidance of confrontation. These individuals may struggle to stand up for themselves or others when needed.",
    flat_meaning_zh: "平坦的火星丘可能表示胆怯、缺乏自信或回避冲突。这些人可能在需要为自己或他人挺身而出时感到困难。",
    prominent_meaning_en: "Overly prominent Mars mounts can indicate aggression, recklessness, or a combative nature. These individuals may struggle with anger management and tend to confront every challenge aggressively.",
    prominent_meaning_zh: "过于突出的火星丘可能表示攻击性、鲁莽或好斗的性格。这些人可能在愤怒管理方面有困难，倾向于以攻击性方式面对每个挑战。",

    faq_en: [
      { question: "What does the Mount of Mars mean in palmistry?", answer: "The Mount of Mars consists of two areas: Inner Mars (defensive courage) and Outer Mars (offensive courage). They represent bravery, resilience, determination, and the ability to overcome obstacles." },
      { question: "What's the difference between Inner and Outer Mars?", answer: "Inner Mars, located near the Life Line, represents defensive courage and patience. Outer Mars, on the opposite side, represents aggressive energy and the fighting spirit needed to pursue goals." },
      { question: "What if my Mars mounts are flat?", answer: "Flat Mars mounts suggest a tendency to avoid confrontation and difficulty standing up for yourself. This can be balanced by developing confidence through small acts of assertiveness." },
      { question: "Can Mars mount indicate health issues?", answer: "While not directly related to health, an overly prominent Mars mount may correlate with high stress levels and a tendency toward aggressive behavior, which can indirectly affect health." }
    ],
    faq_zh: [
      { question: "火星丘在手相学中代表什么？", answer: "火星丘由两个区域组成：内火星丘（防御性勇气）和外火星丘（进攻性勇气）。它们代表勇敢、韧性、决心和克服障碍的能力。" },
      { question: "内火星丘和外火星丘有什么区别？", answer: "内火星丘位于生命线附近，代表防御性勇气和耐心。外火星丘在对侧，代表追求目标所需的攻击性能量和战斗精神。" },
      { question: "如果我的火星丘很平坦怎么办？", answer: "平坦的火星丘表示倾向于回避冲突，难以为自己挺身而出。这可以通过小的自信行为来平衡。" },
      { question: "火星丘能显示健康问题吗？", answer: "虽然与健康没有直接关系，但过于突出的火星丘可能与高压力水平和攻击性行为倾向相关，这会间接影响健康。" }
    ],

    related_mounts: ["venus", "luna", "jupiter"],
    related_lines: ["head-line", "life-line"],

    canonical_path: "/palm-reading/mounts/mars"
  },
  {
    id: "luna",
    name_en: "Mount of Luna (Moon)",
    name_zh: "月丘",
    emoji: "🌙",

    title_en: "Mount of Luna Meaning in Palmistry | Palm Reading Guide",
    title_zh: "月丘手相含义 | 手相学完整指南",
    meta_description_en: "Discover the Mount of Luna in palmistry. Learn what a developed or flat Luna mount reveals about imagination, intuition, and emotional depth in your palm reading.",
    meta_description_zh: "探索手相学中的月丘。了解发达或平坦的月丘在手相中代表的想象力、直觉和情感深度。",
    keywords_en: ["mount of luna palmistry", "moon mount meaning", "palm reading luna mount", "luna mount hand", "intuition palm reading"],
    keywords_zh: ["月丘手相", "月丘含义", "手相月丘", "月丘性格", "直觉手相"],

    overview_en: "The Mount of Luna (Moon) is located at the base of the palm on the opposite side from the thumb. In palmistry, it represents imagination, intuition, creativity, and emotional depth. A well-developed Luna mount indicates a highly imaginative and intuitive individual.",
    overview_zh: "月丘位于手掌底部，与拇指相对的一侧。在手相学中，它代表想象力、直觉、创造力和情感深度。发达的月丘表示一个极具想象力和直觉的人。",
    location_en: "Located at the base of the palm on the side opposite the thumb, below the Mount of Mars on the outer edge of the hand.",
    location_zh: "位于手掌底部与拇指相对的一侧，在外侧火星丘下方。",
    developed_meaning_en: "A well-developed Mount of Luna indicates strong imagination, intuition, creativity, and emotional sensitivity. These individuals are often drawn to art, music, writing, and spiritual practices.",
    developed_meaning_zh: "发达的月丘表示强大的想象力、直觉、创造力和情感敏感性。这些人通常被艺术、音乐、写作和灵性实践所吸引。",
    flat_meaning_en: "A flat Luna mount may indicate practical thinking, lack of imagination, or emotional detachment. These individuals may be more grounded and focused on concrete realities.",
    flat_meaning_zh: "平坦的月丘可能表示务实思维、缺乏想象力或情感疏离。这些人可能更脚踏实地，专注于具体的现实。",
    prominent_meaning_en: "An overly prominent Luna mount can indicate excessive daydreaming, emotional instability, or difficulty distinguishing fantasy from reality. These individuals may struggle with practical responsibilities.",
    prominent_meaning_zh: "过于突出的月丘可能表示过度幻想、情绪不稳定或难以区分幻想与现实。这些人可能在实际责任方面有困难。",

    faq_en: [
      { question: "What does the Mount of Luna mean in palmistry?", answer: "The Mount of Luna (Moon), located at the base of the palm opposite the thumb, represents imagination, intuition, creativity, and emotional depth. A well-developed mount indicates strong psychic and artistic abilities." },
      { question: "What if my Mount of Luna is flat?", answer: "A flat Luna mount suggests practical, logical thinking over imaginative or intuitive approaches. It indicates a preference for facts and concrete evidence over feelings and hunches." },
      { question: "Can the Luna mount predict psychic abilities?", answer: "A well-developed Luna mount often correlates with strong intuitive and psychic abilities. It suggests sensitivity to subtle energies and a natural connection to the subconscious mind." },
      { question: "How does Luna mount relate to travel?", answer: "A prominent Luna mount is often associated with a love of travel, particularly by sea. It indicates wanderlust and a desire to explore new places and cultures." }
    ],
    faq_zh: [
      { question: "月丘在手相学中代表什么？", answer: "月丘位于手掌底部与拇指相对的一侧，代表想象力、直觉、创造力和情感深度。发达的月丘表示强大的灵性和艺术能力。" },
      { question: "如果我的月丘很平坦怎么办？", answer: "平坦的月丘表示务实、逻辑思维优先于想象或直觉方法。表示偏好事实和具体证据而非感觉和预感。" },
      { question: "月丘能预测灵性能力吗？", answer: "发达的月丘通常与强大的直觉和灵性能力相关。它表示对微妙能量的敏感性和与潜意识的天然联系。" },
      { question: "月丘与旅行有什么关系？", answer: "突出的月丘通常与热爱旅行相关，尤其是海上旅行。它表示对探索新地方和文化的渴望。" }
    ],

    related_mounts: ["venus", "mars", "neptune"],
    related_lines: ["head-line", "heart-line"],

    canonical_path: "/palm-reading/mounts/luna"
  }
]

export const PalmMountMap: Record<string, PalmMount> = Object.fromEntries(
  PalmMounts.map(mount => [mount.id, mount])
)
