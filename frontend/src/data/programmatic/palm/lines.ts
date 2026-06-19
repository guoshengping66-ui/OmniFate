export interface PalmLine {
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
  location_en: string
  location_zh: string
  interpretations: {
    long_en: string
    long_zh: string
    short_en: string
    short_zh: string
    curved_en: string
    curved_zh: string
    straight_en: string
    straight_zh: string
    forked_en: string
    forked_zh: string
    chained_en: string
    chained_zh: string
  }
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>
  related_lines: string[]
  canonical_path: string
}

export const PalmLines: PalmLine[] = [
  {
    id: "heart-line",
    name_en: "Heart Line",
    name_zh: "感情线",
    emoji: "❤️",
    title_en: "Heart Line Palm Reading: Meaning, Length & Analysis",
    title_zh: "感情线手相详解：长度、形状与含义分析",
    meta_description_en: "Discover what your heart line reveals about emotions, relationships, and love life. Learn about heart line length, breaks, and forks in palm reading.",
    meta_description_zh: "探索感情线如何揭示你的情感、关系和爱情生活。了解感情线的长度、断裂和分叉在手相中的含义。",
    keywords_en: ["heart line palm reading", "heart line meaning", "heart line on palm", "love line palm", "emotion line palm"],
    keywords_zh: ["感情线手相", "感情线含义", "手相感情线", "爱情线", "情感线"],
    overview_en: "The Heart Line, also known as the Love Line or Emotion Line, is one of the three major lines on the palm. It runs horizontally across the top of the palm, below the fingers. This line reveals your emotional nature, romantic relationships, and how you express love and affection.",
    overview_zh: "感情线，也被称为爱情线或情感线，是手掌上的三条主要线之一。它横向穿过手掌顶部，在手指下方。这条线揭示了你的情感天性、浪漫关系以及你如何表达爱和感情。",
    location_en: "The Heart Line runs horizontally across the upper palm, starting from below the little finger and extending toward the index finger or middle finger.",
    location_zh: "感情线横向穿过手掌上部，从小指下方开始，延伸至食指或中指方向。",
    interpretations: {
      long_en: "A long heart line extending to the edge of the palm indicates someone who is emotionally expressive, passionate in relationships, and wears their heart on their sleeve. They are romantic and deeply invested in their partnerships.",
      long_zh: "一条延伸到手掌边缘的长感情线表示这个人情感丰富，在关系中充满激情，将心挂在袖子上。他们浪漫且深深投入到伴侣关系中。",
      short_en: "A short heart line suggests someone who is more reserved emotionally, prefers practical expressions of love, and may struggle with verbalizing feelings. They show love through actions rather than words.",
      short_zh: "一条短的感情线表示这个人情感上更为含蓄，喜欢实际的爱情表达方式，可能在表达感情方面有困难。他们通过行动而非言语来表达爱。",
      curved_en: "A curved heart line that arcs upward toward the fingers indicates an optimistic, warm-hearted person who is open to new relationships and enjoys social connections.",
      curved_zh: "一条向上弯曲朝向手指的感情线表示一个乐观、热心的人，对新的关系持开放态度，喜欢社交联系。",
      straight_en: "A straight heart line running parallel to the fingers suggests a more logical, practical approach to emotions. These individuals may appear cold but are deeply loyal once committed.",
      straight_zh: "一条与手指平行的笔直感情线表示对情感更为理性、实际的态度。这些人可能显得冷漠，但一旦承诺就会深深忠诚。",
      forked_en: "A forked heart line (branched at the end) indicates someone who is caring and understanding, with the ability to see both sides of a relationship. They are natural mediators in love.",
      forked_zh: "一条分叉的感情线（末端分叉）表示一个有爱心和理解力的人，能够看到关系的两面。他们在爱情中是天生的调解者。",
      chained_en: "A chained or wavy heart line suggests emotional instability, mood swings, or a tendency to overthink relationships. These individuals may need reassurance and security in love.",
      chained_zh: "一条链状或波浪状的感情线表示情绪不稳定、情绪波动，或倾向于过度思考关系。这些人在爱情中可能需要安慰和安全感。"
    },
    faq_en: [
      { question: "Where is the heart line on the palm?", answer: "The heart line runs horizontally across the upper part of the palm, below the fingers, starting from below the little finger." },
      { question: "What does a long heart line mean?", answer: "A long heart line indicates someone who is emotionally expressive, passionate in relationships, and deeply romantic." },
      { question: "What does a broken heart line mean?", answer: "A broken heart line may indicate emotional trauma, a significant relationship change, or a period of emotional healing." },
      { question: "Which hand shows the heart line?", answer: "Both hands show the heart line. The dominant hand typically shows current patterns, while the non-dominant hand shows innate tendencies." }
    ],
    faq_zh: [
      { question: "感情线在手掌的什么位置？", answer: "感情线横向穿过手掌上部，在手指下方，从小指下方开始。" },
      { question: "长的感情线是什么意思？", answer: "长的感情线表示情感丰富、在关系中充满激情且非常浪漫的人。" },
      { question: "断裂的感情线是什么意思？", answer: "断裂的感情线可能表示情感创伤、重大关系变化或情感疗愈期。" },
      { question: "哪只手显示感情线？", answer: "两只手都显示感情线。惯用手通常显示当前模式，而非惯用手显示天生倾向。" }
    ],
    related_lines: ["head-line", "life-line", "fate-line"],
    canonical_path: "/palm-reading/lines/heart-line",
  },
  {
    id: "head-line",
    name_en: "Head Line",
    name_zh: "智慧线",
    emoji: "🧠",
    title_en: "Head Line Palm Reading: Meaning, Length & Intelligence",
    title_zh: "智慧线手相详解：长度、形状与智慧分析",
    meta_description_en: "Discover what your head line reveals about intelligence, thinking style, and decision-making. Learn about head line analysis in palm reading.",
    meta_description_zh: "探索智慧线如何揭示你的智力、思维方式和决策能力。了解手相中智慧线的分析方法。",
    keywords_en: ["head line palm reading", "head line meaning", "wisdom line palm", "thinking line palm", "intelligence line"],
    keywords_zh: ["智慧线手相", "智慧线含义", "手相智慧线", "思考线", "智力线"],
    overview_en: "The Head Line, also known as the Wisdom Line or Mind Line, is one of the three major lines on the palm. It runs horizontally across the middle of the palm, usually starting near the thumb and extending toward the opposite edge. This line reveals your intellectual abilities, thinking style, and how you process information.",
    overview_zh: "智慧线，也被称为头脑线或思维线，是手掌上的三条主要线之一。它横向穿过手掌中部，通常从拇指附近开始，延伸至对侧边缘。这条线揭示了你的智力能力、思维方式以及你如何处理信息。",
    location_en: "The Head Line runs across the middle of the palm, typically starting from between the thumb and index finger, extending toward the outer edge of the palm.",
    location_zh: "智慧线横穿手掌中部，通常从拇指和食指之间开始，延伸至手掌外缘。",
    interpretations: {
      long_en: "A long head line indicates someone who is analytical, thoughtful, and considers all angles before making decisions. They excel in academic pursuits and detailed work.",
      long_zh: "一条长的智慧线表示一个善于分析、深思熟虑，在做决定前考虑所有角度的人。他们在学术追求和详细工作中表现出色。",
      short_en: "A short head line suggests a practical, action-oriented person who makes quick decisions based on gut instinct rather than lengthy analysis.",
      short_zh: "一条短的智慧线表示一个务实、行动导向的人，基于直觉而非冗长分析做出快速决定。",
      curved_en: "A curved or sloping head line indicates creativity, imagination, and a right-brain dominant thinking style. These individuals excel in artistic and creative fields.",
      curved_zh: "一条弯曲或倾斜的智慧线表示创造力、想象力和右脑主导的思维方式。这些人在艺术和创意领域表现出色。",
      straight_en: "A straight head line running parallel to the heart line suggests a logical, analytical, and left-brain dominant thinker who excels in mathematics, science, and technical fields.",
      straight_zh: "一条与感情线平行的笔直智慧线表示逻辑、分析型、左脑主导的思考者，在数学、科学和技术领域表现出色。",
      forked_en: "A forked head line (split at the end) indicates versatility and the ability to think from multiple perspectives. These individuals can be both creative and analytical.",
      forked_zh: "一条分叉的智慧线（末端分裂）表示多才多艺和从多个角度思考的能力。这些人既具有创造力又具有分析能力。",
      chained_en: "A chained or wavy head line suggests scattered thinking, difficulty concentrating, or a tendency to worry. These individuals may benefit from mindfulness practices.",
      chained_zh: "一条链状或波浪状的智慧线表示思维分散、注意力难以集中或倾向于担忧。这些人可能受益于正念练习。"
    },
    faq_en: [
      { question: "What does the head line represent?", answer: "The head line represents intellectual abilities, thinking style, decision-making approach, and how you process information." },
      { question: "Where is the head line on the palm?", answer: "The head line runs across the middle of the palm, typically starting between the thumb and index finger." },
      { question: "What does a long head line mean?", answer: "A long head line indicates analytical thinking, attention to detail, and intellectual depth." },
      { question: "Can the head line change over time?", answer: "While the basic structure remains, the head line can show subtle changes reflecting personal growth and changing thinking patterns." }
    ],
    faq_zh: [
      { question: "智慧线代表什么？", answer: "智慧线代表智力能力、思维方式、决策方法以及你如何处理信息。" },
      { question: "智慧线在手掌的什么位置？", answer: "智慧线横穿手掌中部，通常从拇指和食指之间开始。" },
      { question: "长的智慧线是什么意思？", answer: "长的智慧线表示分析思维、注重细节和智力深度。" },
      { question: "智慧线会随时间变化吗？", answer: "虽然基本结构保持不变，但智慧线可以显示反映个人成长和思维模式变化的微妙变化。" }
    ],
    related_lines: ["heart-line", "life-line", "fate-line"],
    canonical_path: "/palm-reading/lines/head-line",
  },
  {
    id: "life-line",
    name_en: "Life Line",
    name_zh: "生命线",
    emoji: "的生命",
    title_en: "Life Line Palm Reading: Meaning, Length & Health",
    title_zh: "生命线手相详解：长度、形状与健康分析",
    meta_description_en: "Discover what your life line reveals about health, vitality, and life changes. Learn about life line length, breaks, and curves in palm reading.",
    meta_description_zh: "探索生命线如何揭示你的健康、活力和生活变化。了解手相中生命线的长度、断裂和弯曲的含义。",
    keywords_en: ["life line palm reading", "life line meaning", "life line on palm", "vitality line palm", "health line palm"],
    keywords_zh: ["生命线手相", "生命线含义", "手相生命线", "活力线", "健康线"],
    overview_en: "The Life Line is one of the most recognized lines in palmistry. It curves around the base of the thumb, starting between the thumb and index finger and extending toward the wrist. Contrary to popular belief, the life line does NOT indicate length of life, but rather reveals your vitality, physical health, and major life changes.",
    overview_zh: "生命线是手相学中最被认可的线条之一。它围绕拇指底部弯曲，从拇指和食指之间开始，延伸至手腕。与普遍看法相反，生命线并不指示寿命长短，而是揭示你的活力、身体健康和重大生活变化。",
    location_en: "The Life Line curves around the base of the thumb, starting from between the thumb and index finger and arching down toward the wrist.",
    location_zh: "生命线围绕拇指底部弯曲，从拇指和食指之间开始，向下拱起延伸至手腕。",
    interpretations: {
      long_en: "A long, deep life line indicates strong physical vitality, good health, and a robust constitution. These individuals tend to have high energy levels and recover quickly from illness.",
      long_zh: "一条长而深的生命线表示强烈的身体活力、良好的健康和强健的体魄。这些人往往精力充沛，从疾病中快速恢复。",
      short_en: "A short life line does NOT mean a short life. It may indicate a more delicate constitution, need for careful health management, or a tendency to tire easily.",
      short_zh: "短的生命线并不意味着短命。它可能表示体质较弱，需要仔细管理健康，或容易疲劳的倾向。",
      curved_en: "A wide, sweeping life line indicates an adventurous spirit, love of travel, and openness to new experiences. These individuals are independent and enjoy freedom.",
      curved_zh: "一条宽阔、弧度大的生命线表示冒险精神、热爱旅行和对新体验持开放态度。这些人独立且享受自由。",
      straight_en: "A life line that runs close to the thumb suggests a more cautious, home-oriented person who prefers familiar surroundings and routine.",
      straight_zh: "一条紧贴拇指的生命线表示一个更为谨慎、以家庭为导向的人，偏好熟悉的环境和例行公事。",
      forked_en: "A forked life line may indicate a major life change, career shift, or a period of transformation. It can also suggest dual interests or a change in life direction.",
      forked_zh: "一条分叉的生命线可能表示重大生活变化、职业转变或转型期。它也可能暗示双重兴趣或生活方向的改变。",
      chained_en: "A chained or wavy life line may indicate periods of low energy, health challenges, or emotional instability. These individuals may need to focus on self-care.",
      chained_zh: "一条链状或波浪状的生命线可能表示精力不足期、健康挑战或情绪不稳定。这些人可能需要专注于自我照顾。"
    },
    faq_en: [
      { question: "Does the life line predict how long you will live?", answer: "No, the life line does NOT indicate length of life. It reveals vitality, physical health quality, and major life changes." },
      { question: "Where is the life line on the palm?", answer: "The life line curves around the base of the thumb, starting between the thumb and index finger." },
      { question: "What does a broken life line mean?", answer: "A broken life line may indicate a significant life change, health issue, or major transition period." },
      { question: "What if I don't have a visible life line?", answer: "Everyone has a life line, though it may be very faint. A faint life line may indicate sensitive health or a need for careful self-care." }
    ],
    faq_zh: [
      { question: "生命线能预测寿命吗？", answer: "不能，生命线并不指示寿命长短。它揭示活力、身体健康质量和重大生活变化。" },
      { question: "生命线在手掌的什么位置？", answer: "生命线围绕拇指底部弯曲，从拇指和食指之间开始。" },
      { question: "断裂的生命线是什么意思？", answer: "断裂的生命线可能表示重大生活变化、健康问题或重大过渡期。" },
      { question: "如果没有明显的生命线怎么办？", answer: "每个人都有生命线，尽管可能很模糊。模糊的生命线可能表示健康敏感或需要仔细的自我照顾。" }
    ],
    related_lines: ["head-line", "heart-line", "fate-line"],
    canonical_path: "/palm-reading/lines/life-line",
  },
  {
    id: "fate-line",
    name_en: "Fate Line",
    name_zh: "事业线",
    emoji: "⭐",
    title_en: "Fate Line Palm Reading: Meaning, Career & Destiny",
    title_zh: "事业线手相详解：含义、事业与命运分析",
    meta_description_en: "Discover what your fate line reveals about career, life path, and external influences. Learn about fate line analysis in palm reading.",
    meta_description_zh: "探索事业线如何揭示你的事业、人生道路和外部影响。了解手相中事业线的分析方法。",
    keywords_en: ["fate line palm reading", "fate line meaning", "career line palm", "destiny line palm", "sun line palm"],
    keywords_zh: ["事业线手相", "事业线含义", "手相事业线", "命运线", "太阳线"],
    overview_en: "The Fate Line, also known as the Career Line or Destiny Line, is a vertical line that runs from the base of the palm toward the middle finger. Not everyone has a visible fate line, and its absence doesn't indicate a lack of destiny. This line reveals your career path, life direction, and the influence of external forces on your life.",
    overview_zh: "事业线，也被称为职业线或命运线，是一条从手掌底部向中指方向延伸的垂直线。不是每个人都有明显的事业线，它的缺失并不意味着缺乏命运。这条线揭示了你的职业道路、人生方向以及外部力量对你生活的影响。",
    location_en: "The Fate Line runs vertically from the base of the palm (near the wrist) upward toward the middle finger.",
    location_zh: "事业线从手掌底部（靠近手腕）垂直向上延伸至中指方向。",
    interpretations: {
      long_en: "A long, deep fate line indicates a strong sense of purpose, clear career direction, and determination to achieve goals. These individuals often have a clear path in life.",
      long_zh: "一条长而深的事业线表示强烈的目标感、清晰的职业方向和实现目标的决心。这些人往往有清晰的人生道路。",
      short_en: "A short fate line may indicate a career change later in life, or someone who finds their true calling later. It doesn't mean less success.",
      short_zh: "一条短的事业线可能表示晚年职业变化，或晚些时候找到真正使命的人。它并不意味着成功较少。",
      curved_en: "A curved fate line may indicate a career that involves creativity, travel, or working with the public. These individuals may have unconventional career paths.",
      curved_zh: "一条弯曲的事业线可能表示涉及创造力、旅行或与公众工作的职业。这些人可能有非传统的职业道路。",
      straight_en: "A straight, deep fate line indicates a focused, determined individual with a clear sense of purpose and direction in their career.",
      straight_zh: "一条笔直、深刻的事业线表示一个专注、坚定的人，对自己的职业有清晰的目标感和方向感。",
      forked_en: "A forked fate line may indicate dual careers, multiple interests, or a major life direction change. It can also suggest success in two different fields.",
      forked_zh: "一条分叉的事业线可能表示双重职业、多重兴趣或重大人生方向变化。它也可能暗示在两个不同领域的成功。",
      chained_en: "A chained fate line may indicate career instability, frequent job changes, or uncertainty about life direction during certain periods.",
      chained_zh: "一条链状的事业线可能表示职业不稳定、频繁换工作或某些时期对人生方向的不确定性。"
    },
    faq_en: [
      { question: "What does the fate line represent?", answer: "The fate line represents career path, life direction, sense of purpose, and the influence of external forces on your life." },
      { question: "What if I don't have a fate line?", answer: "Not having a visible fate line is normal. It may indicate a self-directed person who creates their own path rather than following external expectations." },
      { question: "Where does the fate line start?", answer: "The fate line typically starts from the base of the palm near the wrist and runs upward toward the middle finger." },
      { question: "Can the fate line change over time?", answer: "Yes, the fate line can change as your career and life direction evolve. New lines may appear or existing ones may shift." }
    ],
    faq_zh: [
      { question: "事业线代表什么？", answer: "事业线代表职业道路、人生方向、目标感以及外部力量对你生活的影响。" },
      { question: "如果没有事业线怎么办？", answer: "没有明显的事业线是正常的。它可能表示一个自主的人，他们创造自己的道路而不是遵循外部期望。" },
      { question: "事业线从哪里开始？", answer: "事业线通常从手掌底部靠近手腕处开始，向上延伸至中指方向。" },
      { question: "事业线会随时间变化吗？", answer: "是的，随着你的职业和人生方向的发展，事业线可以变化。新的线可能出现或现有的线可能移动。" }
    ],
    related_lines: ["heart-line", "head-line", "life-line"],
    canonical_path: "/palm-reading/lines/fate-line",
  },
  {
    id: "sun-line",
    name_en: "Sun Line",
    name_zh: "太阳线",
    emoji: "☀️",
    title_en: "Sun Line Palm Reading: Meaning, Fame & Success",
    title_zh: "太阳线手相详解：含义、名望与成功分析",
    meta_description_en: "Discover what your sun line reveals about creativity, fame, and success. Learn about sun line meaning in palm reading.",
    meta_description_zh: "探索太阳线如何揭示你的创造力、名望和成功。了解手相中太阳线的含义。",
    keywords_en: ["sun line palm reading", "sun line meaning", "apollo line palm", "fame line palm", "success line palm"],
    keywords_zh: ["太阳线手相", "太阳线含义", "手相太阳线", "名望线", "成功线"],
    overview_en: "The Sun Line, also known as the Apollo Line or Fame Line, is a vertical line that runs parallel to the Fate Line, usually starting from the base of the palm and extending toward the ring finger. This line reveals your creative abilities, potential for fame, and success in artistic endeavors.",
    overview_zh: "太阳线，也被称为阿波罗线或名望线，是一条与事业线平行的垂直线，通常从手掌底部开始，延伸至无名指方向。这条线揭示了你的创造能力、成名潜力以及在艺术追求方面的成功。",
    location_en: "The Sun Line runs vertically from the base of the palm toward the ring finger, parallel to the Fate Line.",
    location_zh: "太阳线从手掌底部垂直延伸至无名指方向，与事业线平行。",
    interpretations: {
      long_en: "A long, clear sun line indicates great creative talent, potential for fame or recognition, and success in artistic or public-facing careers.",
      long_zh: "一条长而清晰的太阳线表示伟大的创造才能、成名或获得认可的潜力，以及在艺术或公众职业方面的成功。",
      short_en: "A short sun line may indicate latent creative abilities that need development, or success that comes later in life.",
      short_zh: "一条短的太阳线可能表示需要发展的潜在创造能力，或晚年才到来的成功。",
      curved_en: "A curved sun line suggests a creative, artistic personality with a natural flair for beauty and aesthetics.",
      curved_zh: "一条弯曲的太阳线表示具有创造力、艺术性的个性，对美和美学有天生的品味。",
      straight_en: "A straight sun line indicates focused creative energy and determination to achieve recognition through hard work.",
      straight_zh: "一条笔直的太阳线表示集中的创造能量和通过努力工作获得认可的决心。",
      forked_en: "A forked sun line may indicate success in multiple creative fields or diverse talents that can be channeled in different directions.",
      forked_zh: "一条分叉的太阳线可能表示在多个创意领域的成功或可以在不同方向发展的多样才能。",
      chained_en: "A chained sun line may indicate periods of creative block, self-doubt, or inconsistency in pursuing artistic goals.",
      chained_zh: "一条链状的太阳线可能表示创造力阻碍、自我怀疑或追求艺术目标不一致的时期。"
    },
    faq_en: [
      { question: "What does the sun line represent?", answer: "The sun line represents creativity, artistic talent, potential for fame, and success in public-facing careers." },
      { question: "Where is the sun line on the palm?", answer: "The sun line runs vertically toward the ring finger, parallel to the fate line." },
      { question: "What does a strong sun line mean?", answer: "A strong sun line indicates great creative potential, recognition, and success in artistic or creative endeavors." },
      { question: "Is the sun line the same as the fate line?", answer: "No, the sun line is separate from the fate line. The fate line represents career direction, while the sun line represents creative success and fame." }
    ],
    faq_zh: [
      { question: "太阳线代表什么？", answer: "太阳线代表创造力、艺术才能、成名潜力以及在公众职业方面的成功。" },
      { question: "太阳线在手掌的什么位置？", answer: "太阳线垂直延伸至无名指方向，与事业线平行。" },
      { question: "强烈的太阳线是什么意思？", answer: "强烈的太阳线表示巨大的创造潜力、认可以及在艺术或创意追求方面的成功。" },
      { question: "太阳线和事业线是一样的吗？", answer: "不，太阳线与事业线是分开的。事业线代表职业方向，而太阳线代表创意成功和名望。" }
    ],
    related_lines: ["fate-line", "heart-line", "head-line"],
    canonical_path: "/palm-reading/lines/sun-line",
  },
  {
    id: "marriage-line",
    name_en: "Marriage Line",
    name_zh: "婚姻线",
    emoji: "💍",
    title_en: "Marriage Line Palm Reading: Meaning & Relationships",
    title_zh: "婚姻线手相详解：含义与关系分析",
    meta_description_en: "Discover what your marriage line reveals about relationships, marriage, and partnerships. Learn about marriage line analysis in palm reading.",
    meta_description_zh: "探索婚姻线如何揭示你的关系、婚姻和伴侣关系。了解手相中婚姻线的分析方法。",
    keywords_en: ["marriage line palm reading", "marriage line meaning", "relationship line palm", "union line palm", "commitment line"],
    keywords_zh: ["婚姻线手相", "婚姻线含义", "手相婚姻线", "结合线", "承诺线"],
    overview_en: "The Marriage Line, also known as the Relationship Line or Union Line, is a short horizontal line located on the edge of the palm below the little finger. Despite its name, this line doesn't necessarily predict marriage, but rather reveals significant relationships and partnerships in your life.",
    overview_zh: "婚姻线，也被称为关系线或结合线，是位于小指下方手掌边缘的一条短水平线。尽管它的名字如此，这条线并不一定预测婚姻，而是揭示你生活中的重要关系和伴侣关系。",
    location_en: "The Marriage Line is located on the outer edge of the palm, between the heart line and the base of the little finger.",
    location_zh: "婚姻线位于手掌外缘，在感情线和小指底部之间。",
    interpretations: {
      long_en: "A long marriage line indicates a deep, committed relationship that brings stability and fulfillment. These individuals value long-term partnerships.",
      long_zh: "一条长的婚姻线表示深厚、承诺的关系，带来稳定和满足。这些人重视长期伴侣关系。",
      short_en: "A short marriage line may indicate brief but intense relationships, or someone who values independence over long-term commitment.",
      short_zh: "一条短的婚姻线可能表示短暂但强烈的关系，或重视独立而非长期承诺的人。",
      curved_en: "A curved marriage line suggests a romantic, passionate relationship with deep emotional connection.",
      curved_zh: "一条弯曲的婚姻线表示浪漫、充满激情的关系，具有深厚的情感联系。",
      straight_en: "A straight marriage line indicates a practical, stable relationship based on mutual respect and shared goals.",
      straight_zh: "一条笔直的婚姻线表示基于相互尊重和共同目标的实际、稳定的关系。",
      forked_en: "A forked marriage line may indicate a significant relationship change, divorce, or transformation in a partnership.",
      forked_zh: "一条分叉的婚姻线可能表示重大关系变化、离婚或伴侣关系的转变。",
      chained_en: "A chained marriage line may indicate relationship instability, frequent conflicts, or uncertainty about commitment.",
      chained_zh: "一条链状的婚姻线可能表示关系不稳定、频繁冲突或对承诺的不确定性。"
    },
    faq_en: [
      { question: "Does the marriage line predict divorce?", answer: "No, the marriage line doesn't predict divorce. It indicates significant relationships and partnerships, which may include marriages, long-term partnerships, or important connections." },
      { question: "Where is the marriage line on the palm?", answer: "The marriage line is located on the outer edge of the palm, between the heart line and the base of the little finger." },
      { question: "What if I have multiple marriage lines?", answer: "Multiple marriage lines may indicate several significant relationships or deep connections throughout your life." },
      { question: "Can the marriage line change over time?", answer: "Yes, the marriage line can change as your relationships evolve. New lines may appear or existing ones may shift." }
    ],
    faq_zh: [
      { question: "婚姻线能预测离婚吗？", answer: "不能，婚姻线不能预测离婚。它表示重要的关系和伴侣关系，可能包括婚姻、长期伴侣关系或重要联系。" },
      { question: "婚姻线在手掌的什么位置？", answer: "婚姻线位于手掌外缘，在感情线和小指底部之间。" },
      { question: "如果有多条婚姻线怎么办？", answer: "多条婚姻线可能表示一生中几段重要的关系或深厚联系。" },
      { question: "婚姻线会随时间变化吗？", answer: "是的，随着你的关系发展，婚姻线可以变化。新的线可能出现或现有的线可能移动。" }
    ],
    related_lines: ["heart-line", "fate-line", "head-line"],
    canonical_path: "/palm-reading/lines/marriage-line",
  },
]

export const PalmLineMap = Object.fromEntries(PalmLines.map(l => [l.id, l]))
