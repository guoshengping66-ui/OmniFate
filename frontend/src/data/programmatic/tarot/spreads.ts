export interface TarotSpread {
  id: string
  name_en: string
  name_zh: string
  card_count: number
  emoji: string

  title_en: string
  title_zh: string
  meta_description_en: string
  meta_description_zh: string
  keywords_en: string[]
  keywords_zh: string[]

  overview_en: string
  overview_zh: string
  positions_en: string
  positions_zh: string
  how_to_read_en: string
  how_to_read_zh: string
  best_for_en: string
  best_for_zh: string

  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>

  canonical_path: string
}

export const TarotSpreads: TarotSpread[] = [
  {
    id: "celtic-cross",
    name_en: "Celtic Cross",
    name_zh: "凯尔特十字牌阵",
    card_count: 10,
    emoji: "✝️",
    title_en: "Celtic Cross Tarot Spread: The Most Comprehensive Layout",
    title_zh: "凯尔特十字塔罗牌阵：最全面的牌阵布局",
    meta_description_en: "Learn how to read the Celtic Cross tarot spread. This 10-card layout provides deep insights into any situation with comprehensive life analysis.",
    meta_description_zh: "学习如何解读凯尔特十字塔罗牌阵。这个10张牌的布局提供对任何情况的深入洞察和全面的人生分析。",
    keywords_en: ["celtic cross tarot", "celtic cross spread", "10 card tarot spread", "tarot reading layout"],
    keywords_zh: ["凯尔特十字塔罗牌", "凯尔特十字牌阵", "10张牌塔罗牌阵"],
    overview_en: "The Celtic Cross is the most iconic and widely used tarot spread. Created by Arthur Edward Waite, this 10-card layout provides a comprehensive view of your situation, including past influences, present circumstances, future possibilities, and underlying energies. It's the go-to spread for detailed life readings.",
    overview_zh: "凯尔特十字是最具标志性和最广泛使用的塔罗牌阵。由韦特创造，这个10张牌的布局提供了对您情况的全面视图，包括过去的影响、当前环境、未来的可能性和潜在能量。它是详细人生解读的首选牌阵。",
    positions_en: "Position 1: Present situation\nPosition 2: Challenge or crossing card\nPosition 3: Root cause or foundation\nPosition 4: Recent past\nPosition 5: Best outcome\nPosition 6: Near future\nPosition 7: Your attitude\nPosition 8: External influences\nPosition 9: Hopes and fears\nPosition 10: Final outcome",
    positions_zh: "位置1：现状\n位置2：挑战或交叉牌\n位置3：根本原因或基础\n位置4：近期过去\n位置5：最佳结果\n位置6：近期未来\n位置7：你的态度\n位置8：外部影响\n位置9：希望与恐惧\n位置10：最终结果",
    how_to_read_en: "Start with the central two cards (positions 1 and 2) to understand the core issue. Then examine the vertical line (positions 3, 10, 1) for the main story. The cross (positions 4, 5, 6, 7) shows the dynamics at play. Finally, the staff (positions 8, 9, 10) reveals external factors and the likely outcome.",
    how_to_read_zh: "从中心的两张牌（位置1和2）开始理解核心问题。然后检查垂直线（位置3、10、1）来了解主要故事。十字部分（位置4、5、6、7）显示正在发生的变化。最后，杖部分（位置8、9、10）揭示外部因素和可能的结果。",
    best_for_en: "Comprehensive life readings, detailed situation analysis, understanding complex problems with multiple factors, and getting a complete picture of any situation.",
    best_for_zh: "全面的人生解读、详细的情况分析、理解涉及多个因素的复杂问题，以及获取任何情况的完整图景。",
    faq_en: [
      { question: "How many cards are in a Celtic Cross spread?", answer: "The traditional Celtic Cross uses 10 cards, though some variations use 9 or 11 cards." },
      { question: "Is Celtic Cross good for beginners?", answer: "While powerful, the Celtic Cross can be overwhelming for beginners. Start with simpler spreads like the Three-Card spread before advancing to the Celtic Cross." },
      { question: "How often should I do a Celtic Cross reading?", answer: "Due to its depth and comprehensiveness, Celtic Cross readings are best done monthly or when facing significant life decisions." }
    ],
    faq_zh: [
      { question: "凯尔特十字牌阵使用多少张牌？", answer: "传统的凯尔特十字使用10张牌，尽管一些变体使用9张或11张牌。" },
      { question: "凯尔特十字适合初学者吗？", answer: "虽然强大，但凯尔特十字可能让初学者感到不知所措。在进阶到凯尔特十字之前，先从更简单的牌阵开始，如三张牌牌阵。" },
      { question: "我应该多久做一次凯尔特十字解读？", answer: "由于其深度和全面性，凯尔特十字解读最好每月进行一次，或在面对重大人生决策时进行。" }
    ],
    canonical_path: "/tarot/spreads/celtic-cross",
  },
  {
    id: "three-card",
    name_en: "Three-Card Spread",
    name_zh: "三张牌牌阵",
    card_count: 3,
    emoji: "3️⃣",
    title_en: "Three-Card Tarot Spread: Past, Present, Future",
    title_zh: "三张牌塔罗牌阵：过去、现在、未来",
    meta_description_en: "Master the Three-Card tarot spread for quick insights. This versatile layout reveals past, present, and future influences in any situation.",
    meta_description_zh: "掌握三张牌塔罗牌阵获取快速洞察。这个多功能布局揭示任何情况中的过去、现在和未来影响。",
    keywords_en: ["three card tarot spread", "3 card tarot", "past present future tarot", "quick tarot reading"],
    keywords_zh: ["三张牌塔罗牌阵", "3张牌塔罗牌", "过去现在未来塔罗牌"],
    overview_en: "The Three-Card spread is one of the most versatile and accessible tarot layouts. Despite its simplicity, it provides powerful insights into any question or situation. Common interpretations include Past-Present-Future, Mind-Body-Spirit, or Situation-Action-Outcome. It's perfect for daily readings and quick guidance.",
    overview_zh: "三张牌牌阵是最通用和最容易上手的塔罗牌布局之一。尽管简单，但它为任何问题或情况提供了强大的洞察。常见的解释包括过去-现在-未来、身-心-灵，或情况-行动-结果。它非常适合日常解读和快速指引。",
    positions_en: "Position 1: Past influence (or Situation)\nPosition 2: Present situation (or Action)\nPosition 3: Future outcome (or Result)",
    positions_zh: "位置1：过去的影响（或情况）\n位置2：当前情况（或行动）\n位置3：未来结果（或结果）",
    how_to_read_en: "Read the cards in sequence to tell a story. The first card sets the context, the second shows where you are now, and the third indicates where things are heading. Look for patterns, contrasts, and connections between the cards.",
    how_to_read_zh: "按顺序读取卡片来讲述一个故事。第一张牌设定背景，第二张牌显示你现在的位置，第三张牌指示事情的发展方向。寻找卡片之间的模式、对比和联系。",
    best_for_en: "Daily guidance, quick questions, checking the energy of a situation, and when you need a concise but meaningful reading.",
    best_for_zh: "日常指引、快速问题、检查情况的能量，以及当你需要简洁但有意义的解读时。",
    faq_en: [
      { question: "What can I ask a Three-Card spread?", answer: "You can ask about any aspect of life: relationships, career, finances, health, or personal growth. The spread works best with open-ended questions." },
      { question: "How accurate is a Three-Card reading?", answer: "Despite using fewer cards, Three-Card readings can be very accurate when focused on specific questions. The simplicity allows for clearer interpretation." },
      { question: "Can I use the same spread for multiple questions?", answer: "Yes, but it's best to shuffle and draw new cards for each question to get fresh energy and insights." }
    ],
    faq_zh: [
      { question: "三张牌牌阵可以问什么？", answer: "你可以问关于生活任何方面的问题：关系、事业、财务、健康或个人成长。这个牌阵最适合开放式问题。" },
      { question: "三张牌解读有多准确？", answer: "尽管使用较少的牌，三张牌解读在专注于特定问题时可以非常准确。简洁性允许更清晰的解释。" },
      { question: "我可以为多个问题使用相同的牌阵吗？", answer: "是的，但最好为每个问题洗牌并抽取新牌，以获得新的能量和洞察。" }
    ],
    canonical_path: "/tarot/spreads/three-card",
  },
  {
    id: "love-spread",
    name_en: "Love Spread",
    name_zh: "爱情牌阵",
    card_count: 5,
    emoji: "💕",
    title_en: "Love Tarot Spread: Understand Your Relationship",
    title_zh: "爱情塔罗牌阵：了解你的感情关系",
    meta_description_en: "Use the Love tarot spread to gain insights into your romantic relationship. This 5-card layout reveals the dynamics, challenges, and potential of your love life.",
    meta_description_zh: "使用爱情塔罗牌阵深入了解你的恋爱关系。这个5张牌的布局揭示你爱情生活的动态、挑战和潜力。",
    keywords_en: ["love tarot spread", "relationship tarot reading", "romance tarot cards", "love life tarot"],
    keywords_zh: ["爱情塔罗牌阵", "感情塔罗牌解读", "浪漫塔罗牌"],
    overview_en: "The Love Spread is specifically designed to address romantic questions and relationship dynamics. This 5-card layout examines the current state of your love life, the energies between you and your partner, challenges to overcome, hidden influences, and the potential outcome. It provides comprehensive insights into matters of the heart.",
    overview_zh: "爱情牌阵专门用于解答恋爱问题和关系动态。这个5张牌的布局检查你爱情生活的现状、你和伴侣之间的能量、需要克服的挑战、隐藏的影响和潜在的结果。它为感情问题提供了全面的洞察。",
    positions_en: "Position 1: Your feelings\nPosition 2: Partner's feelings\nPosition 3: The relationship's strength\nPosition 4: The main challenge\nPosition 5: Advice and potential outcome",
    positions_zh: "位置1：你的感受\n位置2：伴侣的感受\n位置3：关系的优势\n位置4：主要挑战\n位置5：建议和潜在结果",
    how_to_read_en: "Start with positions 1 and 2 to understand both sides of the relationship. Position 3 reveals what's working well. Position 4 highlights areas that need attention. Position 5 provides guidance for moving forward.",
    how_to_read_zh: "从位置1和2开始了解关系的双方。位置3揭示什么运作良好。位置4突出需要关注的领域。位置5为前进提供指导。",
    best_for_en: "Understanding relationship dynamics, gaining clarity on romantic situations, seeking advice about love decisions, and exploring the potential of a new romance.",
    best_for_zh: "理解关系动态、获得对恋爱情况的清晰认识、寻求关于爱情决策的建议，以及探索新恋情的潜力。",
    faq_en: [
      { question: "Can I use the Love Spread for ex-partners?", answer: "Yes, the Love Spread can provide insights into past relationships to help you understand what happened and find closure." },
      { question: "How often should I do a Love reading?", answer: "For ongoing relationship guidance, monthly readings work well. For specific situations, you can do readings as needed." },
      { question: "What if I'm single?", answer: "The Love Spread can also be used to understand what's blocking love in your life, what qualities to develop, and when romance might appear." }
    ],
    faq_zh: [
      { question: "我可以为前任使用爱情牌阵吗？", answer: "是的，爱情牌阵可以提供对过去关系的洞察，帮助你理解发生了什么并找到释然。" },
      { question: "我应该多久做一次爱情解读？", answer: "对于持续的关系指引，每月一次解读效果良好。对于特定情况，你可以根据需要进行解读。" },
      { question: "如果我是单身呢？", answer: "爱情牌阵也可以用来理解什么阻碍了你生活中的爱情、应该培养什么品质，以及爱情何时可能出现。" }
    ],
    canonical_path: "/tarot/spreads/love-spread",
  },
  {
    id: "career-spread",
    name_en: "Career Spread",
    name_zh: "事业牌阵",
    card_count: 5,
    emoji: "💼",
    title_en: "Career Tarot Spread: Navigate Your Professional Path",
    title_zh: "事业塔罗牌阵：指引你的职业道路",
    meta_description_en: "Use the Career tarot spread to gain insights into your professional life. This layout reveals opportunities, challenges, and guidance for career decisions.",
    meta_description_zh: "使用事业塔罗牌阵深入了解你的职业生活。这个布局揭示机会、挑战和职业决策的指引。",
    keywords_en: ["career tarot spread", "job tarot reading", "professional tarot cards", "work tarot"],
    keywords_zh: ["事业塔罗牌阵", "工作塔罗牌解读", "职业塔罗牌"],
    overview_en: "The Career Spread is designed to address professional questions and workplace dynamics. This 5-card layout examines your current career situation, hidden opportunities or obstacles, your professional strengths, challenges to overcome, and the likely outcome of your career decisions.",
    overview_zh: "事业牌阵专门用于解答职业问题和工作场所动态。这个5张牌的布局检查你当前的职业情况、隐藏的机会或障碍、你的专业优势、需要克服的挑战，以及你职业决策的可能结果。",
    positions_en: "Position 1: Current career situation\nPosition 2: Hidden influences or opportunities\nPosition 3: Your professional strengths\nPosition 4: Main challenge to overcome\nPosition 5: Likely outcome and advice",
    positions_zh: "位置1：当前职业情况\n位置2：隐藏的影响或机会\n位置3：你的专业优势\n位置4：需要克服的主要挑战\n位置5：可能的结果和建议",
    how_to_read_en: "Position 1 sets the context of your career question. Positions 2 and 3 reveal supporting energies. Position 4 highlights what's blocking your progress. Position 5 provides direction and advice for your career path.",
    how_to_read_zh: "位置1设定你职业问题的背景。位置2和3揭示支持性能量。位置4突出阻碍你进步的因素。位置5为你的职业道路提供方向和建议。",
    best_for_en: "Career decisions, job searching, workplace relationships, business ventures, and understanding your professional purpose.",
    best_for_zh: "职业决策、求职、工作场所关系、商业机会，以及理解你的职业目标。",
    faq_en: [
      { question: "Should I ask about a specific job offer?", answer: "Yes, the Career Spread works well for specific decisions like job offers, promotions, or business opportunities." },
      { question: "Can it predict job loss?", answer: "Tarot reveals energies and tendencies, not certainties. The Career Spread can highlight potential challenges but shouldn't be used to predict definitive outcomes." },
      { question: "How often should I do a Career reading?", answer: "Monthly career readings can provide ongoing guidance. Do additional readings when facing major career decisions." }
    ],
    faq_zh: [
      { question: "我应该问关于特定工作机会的问题吗？", answer: "是的，事业牌阵非常适合特定的决策，如工作机会、晋升或商业机会。" },
      { question: "它能预测失业吗？", answer: "塔罗牌揭示能量和趋势，而不是确定性。事业牌阵可以突出潜在的挑战，但不应被用来预测确定的结果。" },
      { question: "我应该多久做一次事业解读？", answer: "每月一次事业解读可以提供持续的指引。在面临重大职业决策时进行额外的解读。" }
    ],
    canonical_path: "/tarot/spreads/career-spread",
  },
  {
    id: "yes-no",
    name_en: "Yes/No Spread",
    name_zh: "是非牌阵",
    card_count: 1,
    emoji: "⚖️",
    title_en: "Yes/No Tarot Spread: Quick Answers to Your Questions",
    title_zh: "是非塔罗牌阵：快速回答你的问题",
    meta_description_en: "Get quick yes or no answers with the One-Card tarot spread. Simple yet effective for straightforward questions.",
    meta_description_zh: "用一张牌塔罗牌阵获得快速的是或否答案。简单而有效，适合直接的问题。",
    keywords_en: ["yes no tarot", "one card tarot", "quick tarot answer", "simple tarot reading"],
    keywords_zh: ["是非塔罗牌", "一张牌塔罗牌", "快速塔罗牌答案", "简单塔罗牌解读"],
    overview_en: "The Yes/No spread is the simplest tarot layout, using just one card to answer a straightforward question. While tarot is nuanced and complex, this spread provides quick guidance when you need a simple answer. The card's upright or reversed position determines whether the answer is yes, no, or 'not yet'.",
    overview_zh: "是非牌阵是最简单的塔罗牌布局，只使用一张牌来回答直接的问题。虽然塔罗牌复杂而微妙，但当你需要简单答案时，这个牌阵提供快速指引。卡片的正位或逆位决定答案是是、否，还是'还没有'。",
    positions_en: "Single card: The answer to your question",
    positions_zh: "单张牌：你问题的答案",
    how_to_read_en: "Upright cards generally indicate 'yes', while reversed cards suggest 'no' or 'not yet'. However, some cards are inherently positive (The Sun, The Star) and others are more challenging (The Tower, The Devil). Consider both the card's position and its inherent meaning.",
    how_to_read_zh: "正位牌通常表示'是'，而逆位牌表示'否'或'还没有'。然而，有些牌本质上是积极的（太阳牌、星星牌），而其他牌则更具挑战性（塔牌、恶魔牌）。同时考虑牌的位置和其固有含义。",
    best_for_en: "Quick decisions, simple yes/no questions, checking if you're on the right track, and when you need fast guidance.",
    best_for_zh: "快速决策、简单的是否问题、检查你是否在正确的轨道上，以及当你需要快速指引时。",
    faq_en: [
      { question: "How accurate is the Yes/No spread?", answer: "While simple, the Yes/No spread can provide useful guidance. For complex situations, use a more detailed spread." },
      { question: "Can I ask multiple questions?", answer: "It's best to focus on one question per reading. Shuffle and draw a new card for each question." },
      { question: "What if I get The Tower reversed?", answer: "The Tower reversed in a Yes/No reading often suggests 'not yet' or that obstacles need to be overcome first before a positive outcome." }
    ],
    faq_zh: [
      { question: "是非牌阵有多准确？", answer: "虽然简单，是非牌阵可以提供有用的指引。对于复杂情况，使用更详细的牌阵。" },
      { question: "我可以问多个问题吗？", answer: "最好每次解读专注于一个问题。为每个问题洗牌并抽取新牌。" },
      { question: "如果我抽到逆位的塔牌呢？", answer: "在是非解读中，逆位的塔牌通常表示'还没有'或需要先克服障碍才能有积极的结果。" }
    ],
    canonical_path: "/tarot/spreads/yes-no",
  },
  {
    id: "hexagram",
    name_en: "Hexagram Spread",
    name_zh: "六芒星牌阵",
    card_count: 6,
    emoji: "✡️",
    title_en: "Hexagram Tarot Spread: Balance and Harmony",
    title_zh: "六芒星塔罗牌阵：平衡与和谐",
    meta_description_en: "Explore the Hexagram tarot spread for balanced insights. This 6-card layout examines opposing forces and finds harmony in your situation.",
    meta_description_zh: "探索六芒星塔罗牌阵获取平衡的洞察。这个6张牌的布局检查对立力量，在你的情况中找到和谐。",
    keywords_en: ["hexagram tarot spread", "6 card tarot", "balance tarot reading", "harmony tarot"],
    keywords_zh: ["六芒星塔罗牌阵", "6张牌塔罗牌", "平衡塔罗牌解读"],
    overview_en: "The Hexagram spread is inspired by the Star of David and examines six aspects of a situation in balanced pairs. It reveals how different forces interact in your life and where you can find harmony. This spread is excellent for understanding complex situations with multiple influencing factors.",
    overview_zh: "六芒星牌阵灵感来自大卫之星，以平衡的配对方式检查情况的六个方面。它揭示不同力量在你生活中如何互动，以及你在哪里可以找到和谐。这个牌阵非常适合理解具有多个影响因素的复杂情况。",
    positions_en: "Position 1: What you see\nPosition 2: What you don't see\nPosition 3: Conscious desire\nPosition 4: Unconscious desire\nPosition 5: Recent past\nPosition 6: Near future",
    positions_zh: "位置1：你看到的\n位置2：你没看到的\n位置3：有意识的渴望\n位置4：无意识的渴望\n位置5：近期过去\n位置6：近期未来",
    how_to_read_en: "Read the cards in pairs: 1-4 (conscious vs unconscious), 2-5 (hidden vs manifest), 3-6 (desire vs outcome). Look for how the pairs complement or challenge each other.",
    how_to_read_zh: "成对读取卡片：1-4（有意识vs无意识）、2-5（隐藏vs显现）、3-6（渴望vs结果）。寻找这些配对如何互补或挑战彼此。",
    best_for_en: "Understanding complex dynamics, finding balance in challenging situations, exploring hidden influences, and gaining holistic perspectives.",
    best_for_zh: "理解复杂动态、在挑战性情况中找到平衡、探索隐藏影响，以及获得整体视角。",
    faq_en: [
      { question: "How is the Hexagram different from the Celtic Cross?", answer: "The Hexagram focuses on balanced pairs and opposing forces, while the Celtic Cross provides a more linear narrative of a situation." },
      { question: "When should I use the Hexagram spread?", answer: "Use it when you need to understand the interplay of different forces in your situation, or when you feel pulled in multiple directions." },
      { question: "Is it good for relationship readings?", answer: "Yes, the Hexagram is excellent for relationship readings as it naturally examines the dynamic between two people or opposing desires." }
    ],
    faq_zh: [
      { question: "六芒星与凯尔特十字有什么不同？", answer: "六芒星专注于平衡的配对和对立力量，而凯尔特十字提供更线性的情况叙述。" },
      { question: "我应该什么时候使用六芒星牌阵？", answer: "当你需要理解情况中不同力量的相互作用时，或者当你感到被拉向多个方向时使用它。" },
      { question: "它适合关系解读吗？", answer: "是的，六芒星非常适合关系解读，因为它自然地检查两个人或对立渴望之间的动态。" }
    ],
    canonical_path: "/tarot/spreads/hexagram",
  },
  {
    id: "horseshoe",
    name_en: "Horseshoe Spread",
    name_zh: "马蹄牌阵",
    card_count: 7,
    emoji: "🍀",
    title_en: "Horseshoe Tarot Spread: Your Journey Ahead",
    title_zh: "马蹄塔罗牌阵：你前方的旅程",
    meta_description_en: "Discover the Horseshoe tarot spread for comprehensive guidance. This 7-card layout maps your past, present, future, and the forces at play.",
    meta_description_zh: "探索马蹄塔罗牌阵获取全面指引。这个7张牌的布局描绘你的过去、现在、未来和正在发挥作用的力量。",
    keywords_en: ["horseshoe tarot spread", "7 card tarot", "tarot spread guide", "journey tarot reading"],
    keywords_zh: ["马蹄塔罗牌阵", "7张牌塔罗牌", "塔罗牌阵指南"],
    overview_en: "The Horseshoe spread provides a comprehensive view of your situation, mapping out the journey from past to future. Named for its horseshoe shape, this 7-card layout examines where you've been, where you are, where you're going, and the obstacles and helpers along the way. It's perfect for life journey readings.",
    overview_zh: "马蹄牌阵提供对情况的全面视图，描绘从过去到未来的旅程。以其马蹄形状命名，这个7张牌的布局检查你从哪里来、你在哪里、你要去哪里，以及沿途的障碍和帮助者。它非常适合人生旅程解读。",
    positions_en: "Position 1: The past\nPosition 2: The present\nPosition 3: Hidden influences\nPosition 4: Obstacles\nPosition 5: Near future\nPosition 6: Your attitude\nPosition 7: Final outcome",
    positions_zh: "位置1：过去\n位置2：现在\n位置3：隐藏的影响\n位置4：障碍\n位置5：近期未来\n位置6：你的态度\n位置7：最终结果",
    how_to_read_en: "Read positions 1-3 to understand the journey so far. Position 4 reveals what's blocking your path. Positions 5-7 show where things are heading and what you can do about it.",
    how_to_read_zh: "读取位置1-3来理解到目前为止的旅程。位置4揭示什么阻碍了你的道路。位置5-7显示事情的发展方向以及你可以做些什么。",
    best_for_en: "Life journey questions, understanding how past events led to present circumstances, identifying obstacles, and planning your path forward.",
    best_for_zh: "人生旅程问题、理解过去事件如何导致当前情况、识别障碍，以及规划你的前进道路。",
    faq_en: [
      { question: "How is the Horseshoe different from the Celtic Cross?", answer: "The Horseshoe provides a more linear narrative focused on your journey, while the Celtic Cross offers deeper analysis of multiple aspects." },
      { question: "Can I use it for specific situations?", answer: "Yes, the Horseshoe works well for understanding the full context of any situation, not just life in general." },
      { question: "What does position 4 (obstacles) mean?", answer: "This card reveals what's currently blocking your progress or what challenges you'll face. It's not necessarily negative — it shows where growth opportunities exist." }
    ],
    faq_zh: [
      { question: "马蹄与凯尔特十字有什么不同？", answer: "马蹄提供更线性的叙述，专注于你的旅程，而凯尔特十字提供对多个方面的更深入分析。" },
      { question: "我可以将它用于特定情况吗？", answer: "是的，马蹄非常适合理解任何情况的完整背景，而不仅仅是一般的生活。" },
      { question: "位置4（障碍）是什么意思？", answer: "这张牌揭示当前阻碍你进步的因素或你将面临的挑战。它不一定是消极的——它显示了成长机会存在的地方。" }
    ],
    canonical_path: "/tarot/spreads/horseshoe",
  },
  {
    id: "mirror",
    name_en: "Mirror Spread",
    name_zh: "镜子牌阵",
    card_count: 4,
    emoji: "🪞",
    title_en: "Mirror Tarot Spread: Self-Reflection and Insight",
    title_zh: "镜子塔罗牌阵：自我反思与洞察",
    meta_description_en: "Use the Mirror tarot spread for self-reflection and clarity. This 4-card layout shows your inner and outer worlds.",
    meta_description_zh: "使用镜子塔罗牌阵进行自我反思和获得清晰认识。这个4张牌的布局展示你的内在和外在世界。",
    keywords_en: ["mirror tarot spread", "self reflection tarot", "inner outer tarot", "4 card tarot"],
    keywords_zh: ["镜子塔罗牌阵", "自我反思塔罗牌", "内在外在塔罗牌", "4张牌塔罗牌"],
    overview_en: "The Mirror spread is designed for deep self-reflection, examining the contrast between your inner world and outer reality. This 4-card layout reveals what you show to the world, what you keep hidden, what you aspire to, and what holds you back. It's powerful for personal growth and self-awareness.",
    overview_zh: "镜子牌阵专为深度自我反思设计，检查你的内在世界和外在现实之间的对比。这个4张牌的布局揭示你向世界展示的、你隐藏的、你渴望的，以及阻碍你的因素。它对个人成长和自我意识很有帮助。",
    positions_en: "Position 1: What you show the world\nPosition 2: What you keep hidden\nPosition 3: What you aspire to\nPosition 4: What holds you back",
    positions_zh: "位置1：你向世界展示的\n位置2：你隐藏的\n位置3：你渴望的\n位置4：阻碍你的因素",
    how_to_read_en: "Compare positions 1 and 2 to see the gap between your public and private selves. Positions 3 and 4 reveal the tension between your aspirations and your limitations. Look for how these four aspects interact.",
    how_to_read_zh: "比较位置1和2来看你的公开自我和私人自我之间的差距。位置3和4揭示你的渴望和局限性之间的紧张关系。寻找这四个方面如何互动。",
    best_for_en: "Self-discovery, understanding personal barriers, gaining clarity on desires vs. reality, and personal development work.",
    best_for_zh: "自我发现、理解个人障碍、获得对渴望与现实的清晰认识，以及个人发展工作。",
    faq_en: [
      { question: "When should I use the Mirror spread?", answer: "Use it when you feel confused about your true feelings, when there's a gap between how you feel and how you act, or for self-discovery." },
      { question: "Can it help with relationship issues?", answer: "Yes, it can reveal how you present yourself in relationships vs. what you truly need, helping you understand relationship dynamics." },
      { question: "How often should I do a Mirror reading?", answer: "Whenever you feel the need for self-reflection or when facing decisions that require understanding your true desires." }
    ],
    faq_zh: [
      { question: "我应该什么时候使用镜子牌阵？", answer: "当你对真实感受感到困惑时，当你的感受和行为之间存在差距时，或用于自我发现时使用它。" },
      { question: "它能帮助解决关系问题吗？", answer: "是的，它可以揭示你在关系中如何表现自己与你真正需要的之间的差异，帮助你理解关系动态。" },
      { question: "我应该多久做一次镜子解读？", answer: "每当你感到需要自我反思时，或在面临需要理解真实渴望的决策时。" }
    ],
    canonical_path: "/tarot/spreads/mirror",
  },
  {
    id: "planetary",
    name_en: "Planetary Spread",
    name_zh: "行星牌阵",
    card_count: 7,
    emoji: "🪐",
    title_en: "Planetary Tarot Spread: Cosmic Influences on Your Life",
    title_zh: "行星塔罗牌阵：宇宙对你生活的影响",
    meta_description_en: "Explore the Planetary tarot spread to understand cosmic influences. This 7-card layout examines seven key areas of your life through planetary energies.",
    meta_description_zh: "探索行星塔罗牌阵以了解宇宙的影响。这个7张牌的布局通过行星能量检查你生活的七个关键领域。",
    keywords_en: ["planetary tarot spread", "7 planet tarot", "cosmic tarot reading", "astrology tarot"],
    keywords_zh: ["行星塔罗牌阵", "7行星塔罗牌", "宇宙塔罗牌解读", "占星塔罗牌"],
    overview_en: "The Planetary spread draws inspiration from astrology, with each card representing a planetary influence on a different area of your life. This 7-card layout examines your identity, communication, home, creativity, health, partnerships, and transformation. It provides a holistic view of your life's cosmic blueprint.",
    overview_zh: "行星牌阵从占星术中汲取灵感，每张牌代表对生活不同领域的行星影响。这个7张牌的布局检查你的身份、沟通、家庭、创造力、健康、伙伴关系和转变。它提供了你人生宇宙蓝图的整体视图。",
    positions_en: "Position 1: Sun - Core identity\nPosition 2: Mercury - Communication\nPosition 3: Moon - Emotions and home\nPosition 4: Venus - Love and creativity\nPosition 5: Mars - Energy and health\nPosition 6: Jupiter - Growth and partnerships\nPosition 7: Saturn - Transformation and discipline",
    positions_zh: "位置1：太阳 - 核心身份\n位置2：水星 - 沟通\n位置3：月亮 - 情感与家庭\n位置4：金星 - 爱情与创造力\n位置5：火星 - 能量与健康\n位置6：木星 - 成长与伙伴关系\n位置7：土星 - 转变与纪律",
    how_to_read_en: "Read each card in relation to its planetary influence. Look for patterns across the spread — which areas are thriving and which need attention. Pay special attention to any challenging cards in positions 5-7 as they indicate areas of growth.",
    how_to_read_zh: "根据每张牌的行星影响来读取。寻找整个牌阵中的模式——哪些领域蓬勃发展，哪些需要关注。特别注意位置5-7中的任何挑战牌，因为它们表示需要成长的领域。",
    best_for_en: "Holistic life assessments, understanding different life areas, identifying strengths and weaknesses, and exploring cosmic influences on your path.",
    best_for_zh: "整体人生评估、理解不同生活领域、识别优势和劣势，以及探索对你道路的宇宙影响。",
    faq_en: [
      { question: "Do I need to know astrology to use this spread?", answer: "No, each position has a clear meaning. However, astrological knowledge can add depth to your interpretation." },
      { question: "Can I use this for specific questions?", answer: "The Planetary spread is better for overall life assessments rather than specific questions. For specific questions, use a simpler spread." },
      { question: "How often should I do a Planetary reading?", answer: "Monthly or quarterly readings work well to track changes in different life areas over time." }
    ],
    faq_zh: [
      { question: "我需要懂占星术才能使用这个牌阵吗？", answer: "不需要，每个位置都有清晰的含义。然而，占星知识可以为你的解读增添深度。" },
      { question: "我可以将它用于特定问题吗？", answer: "行星牌阵更适合整体人生评估，而不是特定问题。对于特定问题，使用更简单的牌阵。" },
      { question: "我应该多久做一次行星解读？", answer: "每月或每季度一次解读效果良好，可以跟踪不同生活领域随时间的变化。" }
    ],
    canonical_path: "/tarot/spreads/planetary",
  },
  {
    id: "year-ahead",
    name_en: "Year Ahead Spread",
    name_zh: "年度牌阵",
    card_count: 12,
    emoji: "📅",
    title_en: "Year Ahead Tarot Spread: Your 12-Month Forecast",
    title_zh: "年度塔罗牌阵：你的12个月预测",
    meta_description_en: "Plan your year with the Year Ahead tarot spread. This 12-card layout provides monthly insights for the coming year.",
    meta_description_zh: "用年度塔罗牌阵规划你的一年。这个12张牌的布局为未来一年提供每月洞察。",
    keywords_en: ["year ahead tarot", "12 month tarot spread", "yearly tarot reading", "monthly tarot cards"],
    keywords_zh: ["年度塔罗牌", "12个月塔罗牌阵", "年度塔罗牌解读"],
    overview_en: "The Year Ahead spread is a powerful tool for planning and preparation. This 12-card layout provides one card for each month of the coming year, revealing the key themes, challenges, and opportunities you'll encounter. It's perfect for New Year's readings and setting intentions for the year ahead.",
    overview_zh: "年度牌阵是规划和准备的强大工具。这个12张牌的布局为未来一年的每个月提供一张牌，揭示你将遇到的关键主题、挑战和机会。它非常适合新年解读和为来年设定意图。",
    positions_en: "Position 1: January\nPosition 2: February\nPosition 3: March\nPosition 4: April\nPosition 5: May\nPosition 6: June\nPosition 7: July\nPosition 8: August\nPosition 9: September\nPosition 10: October\nPosition 11: November\nPosition 12: December",
    positions_zh: "位置1：一月\n位置2：二月\n位置3：三月\n位置4：四月\n位置5：五月\n位置6：六月\n位置7：七月\n位置8：八月\n位置9：九月\n位置10：十月\n位置11：十一月\n位置12：十二月",
    how_to_read_en: "Read each card as the theme for that month. Look for patterns throughout the year — periods of growth, challenge, rest, or transformation. Pay attention to major arcana cards as they indicate significant life themes.",
    how_to_read_zh: "将每张牌作为该月的主题来读取。寻找全年中的模式——成长、挑战、休息或转变的时期。特别注意大阿卡纳牌，因为它们表示重要的人生主题。",
    best_for_en: "Annual planning, setting intentions for the year, understanding upcoming themes, and preparing for challenges and opportunities.",
    best_for_zh: "年度规划、设定来年意图、理解即将到来的主题，以及为挑战和机会做准备。",
    faq_en: [
      { question: "When should I do a Year Ahead reading?", answer: "The best time is during the transition between years — late December or early January. However, you can do it at any time to forecast the next 12 months." },
      { question: "How accurate are monthly forecasts?", answer: "The cards reveal themes and energies rather than specific events. Use them as guidance for navigating each month's opportunities and challenges." },
      { question: "Can I combine this with astrology?", answer: "Yes! You can align the months with your birth chart transits for deeper insights into how cosmic events affect your personal journey." }
    ],
    faq_zh: [
      { question: "我应该什么时候做年度解读？", answer: "最佳时间是在年末过渡期间——十二月下旬或一月初。然而，你也可以在任何时候进行，以预测接下来的12个月。" },
      { question: "月度预测有多准确？", answer: "牌揭示主题和能量，而不是具体事件。将它们作为导航每个月机会和挑战的指引。" },
      { question: "我可以将它与占星术结合吗？", answer: "是的！你可以将月份与你的出生星盘行运对齐，以更深入地了解宇宙事件如何影响你的个人旅程。" }
    ],
    canonical_path: "/tarot/spreads/year-ahead",
  },
]

export const TarotSpreadMap = Object.fromEntries(TarotSpreads.map(s => [s.id, s]))
