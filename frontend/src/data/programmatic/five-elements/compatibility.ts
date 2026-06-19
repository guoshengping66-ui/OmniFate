export interface FiveElementCompatibility {
  id: string
  element_a: string
  element_b: string
  score: number
  title_en: string
  title_zh: string
  meta_description_en: string
  meta_description_zh: string
  keywords_en: string[]
  keywords_zh: string[]
  overview_en: string
  overview_zh: string
  love_en: string
  love_zh: string
  career_en: string
  career_zh: string
  tips_en: string
  tips_zh: string
  faq_en: Array<{ question: string; answer: string }>
  faq_zh: Array<{ question: string; answer: string }>
  canonical_path: string
}

const RELATIONSHIP: Record<string, Record<string, { score: number; type: string }>> = {
  wood:  { wood: { score: 60, type: "比和" }, fire: { score: 90, type: "相生" }, earth: { score: 30, type: "相克" }, metal: { score: 20, type: "相克" }, water: { score: 80, type: "相生" } },
  fire:  { wood: { score: 80, type: "相生" }, fire: { score: 60, type: "比和" }, earth: { score: 90, type: "相生" }, metal: { score: 30, type: "相克" }, water: { score: 20, type: "相克" } },
  earth: { wood: { score: 30, type: "相克" }, fire: { score: 80, type: "相生" }, earth: { score: 60, type: "比和" }, metal: { score: 90, type: "相生" }, water: { score: 30, type: "相克" } },
  metal: { wood: { score: 20, type: "相克" }, fire: { score: 30, type: "相克" }, earth: { score: 80, type: "相生" }, metal: { score: 60, type: "比和" }, water: { score: 90, type: "相生" } },
  water: { wood: { score: 90, type: "相生" }, fire: { score: 20, type: "相克" }, earth: { score: 30, type: "相克" }, metal: { score: 80, type: "相生" }, water: { score: 60, type: "比和" } },
}

const ELEMENT_NAMES: Record<string, { en: string; zh: string; emoji: string }> = {
  wood: { en: "Wood", zh: "木", emoji: "🌳" },
  fire: { en: "Fire", zh: "火", emoji: "🔥" },
  earth: { en: "Earth", zh: "土", emoji: "🏔️" },
  metal: { en: "Metal", zh: "金", emoji: "⚔️" },
  water: { en: "Water", zh: "水", emoji: "💧" },
}

function generateOverview(a: string, b: string, rel: { score: number; type: string }): { en: string; zh: string } {
  const nA = ELEMENT_NAMES[a], nB = ELEMENT_NAMES[b]
  if (rel.type === "相生") {
    return {
      en: `${nA.en} generates ${nB.en} in the Five Elements cycle. This is a supportive relationship where ${nA.en} naturally nurtures and strengthens ${nB.en}. In compatibility, this creates a harmonious dynamic where both parties complement each other.`,
      zh: `在五行相生循环中，${nA.zh}生${nB.zh}。这是一种支持性关系，${nA.zh}自然滋养和增强${nB.zh}。在这种关系中，这创造了和谐的互动，双方互补。`,
    }
  }
  if (rel.type === "相克") {
    return {
      en: `${nA.en} controls ${nB.en} in the Five Elements cycle. This is a challenging relationship where ${nA.en} restrains ${nB.en}. With effort and understanding, this dynamic can create growth through overcoming obstacles.`,
      zh: `在五行相克循环中，${nA.zh}克${nB.zh}。这是一种挑战性关系，${nA.zh}制约${nB.zh}。通过努力和理解，这种动态可以通过克服障碍促进成长。`,
    }
  }
  return {
    en: `${nA.en} and ${nB.en} are the same element. This creates a relationship of mutual understanding and shared values, though it may lack the complementary energy of different elements.`,
    zh: `${nA.zh}与${nB.zh}属同一五行。这创造了相互理解和共同价值观的关系，但可能缺乏不同五行之间的互补能量。`,
  }
}

function generateLove(a: string, b: string, rel: { score: number; type: string }): { en: string; zh: string } {
  const nA = ELEMENT_NAMES[a], nB = ELEMENT_NAMES[b]
  if (rel.type === "相生") {
    return {
      en: `In love, ${nA.en} and ${nB.en} have natural chemistry. The generating relationship creates mutual support and growth. ${nA.en} people tend to nurture ${nB.en} partners, while ${nB.en} individuals appreciate the stability ${nA.en} provides.`,
      zh: `在爱情中，${nA.zh}与${nB.zh}有天然的化学反应。相生关系创造了相互支持和成长。${nA.zh}人倾向于滋养${nB.zh}伴侣，而${nB.zh}人欣赏${nA.zh}提供的稳定性。`,
    }
  }
  if (rel.type === "相克") {
    return {
      en: `In love, ${nA.en} and ${nB.en} may face challenges but also passionate attraction. The controlling dynamic can create tension, but with mutual respect, it transforms into complementary strength.`,
      zh: `在爱情中，${nA.zh}与${nB.zh}可能面临挑战，但也有激情的吸引力。相克动态可能制造紧张，但通过相互尊重，它会转化为互补的力量。`,
    }
  }
  return {
    en: `In love, two ${nA.en} people understand each other deeply. The relationship is comfortable and stable, though it may lack spark. Shared values create a strong foundation.`,
    zh: `在爱情中，两个${nA.zh}人彼此深刻理解。关系舒适稳定，但可能缺乏激情。共同的价值观创造了坚实的基础。`,
  }
}

function generateCareer(a: string, b: string, rel: { score: number; type: string }): { en: string; zh: string } {
  const nA = ELEMENT_NAMES[a], nB = ELEMENT_NAMES[b]
  if (rel.type === "相生") {
    return {
      en: `In career, ${nA.en} and ${nB.en} make an excellent team. ${nA.en} provides the foundation and resources that ${nB.en} needs to flourish. This partnership thrives in creative and growth-oriented projects.`,
      zh: `在事业中，${nA.zh}与${nB.zh}是出色的团队。${nA.zh}提供${nB.zh}蓬勃发展所需的基础和资源。这种伙伴关系在创意和成长型项目中蓬勃发展。`,
    }
  }
  if (rel.type === "相克") {
    return {
      en: `In career, ${nA.en} and ${nB.en} may have different approaches that create friction. However, this dynamic can also drive innovation as each challenges the other to improve.`,
      zh: `在事业中，${nA.zh}与${nB.zh}可能有不同的方法造成摩擦。然而，这种动态也可以推动创新，因为彼此挑战对方改进。`,
    }
  }
  return {
    en: `In career, two ${nA.en} people share similar work styles and values. They understand each other's approach but may need to bring in complementary perspectives for balanced decisions.`,
    zh: `在事业中，两个${nA.zh}人分享相似的工作风格和价值观。他们理解彼此的方法，但可能需要引入互补的视角来做平衡的决策。`,
  }
}

export const FiveElementCompatibilities: FiveElementCompatibility[] = (() => {
  const elements = ["wood", "fire", "earth", "metal", "water"]
  const pairs: FiveElementCompatibility[] = []

  for (const a of elements) {
    for (const b of elements) {
      if (a === b) continue
      const pairKey = [a, b].sort().join("-")
      if (pairs.some(p => p.id === pairKey)) continue

      const relA = RELATIONSHIP[a][b]
      const relB = RELATIONSHIP[b][a]
      const score = Math.round((relA.score + relB.score) / 2)
      const nA = ELEMENT_NAMES[a], nB = ELEMENT_NAMES[b]
      const overview = generateOverview(a, b, relA)
      const love = generateLove(a, b, relA)
      const career = generateCareer(a, b, relA)

      pairs.push({
        id: pairKey,
        element_a: a,
        element_b: b,
        score,
        title_en: `${nA.en} and ${nB.en} Compatibility | Five Elements Guide`,
        title_zh: `${nA.zh}与${nB.zh}五行配对详解`,
        meta_description_en: `Discover ${nA.en} and ${nB.en} Five Elements compatibility. Learn how these elements interact in love, career, and relationships.`,
        meta_description_zh: `探索${nA.zh}与${nB.zh}五行配对。了解这些五行在爱情、事业和人际关系中的互动。`,
        keywords_en: [`${nA.en.toLowerCase()} ${nB.en.toLowerCase()} compatibility`, `${nA.en.toLowerCase()} element`, `five elements ${nA.en.toLowerCase()}`],
        keywords_zh: [`${nA.zh}${nB.zh}配对`, `${nA.zh}五行`, `五行配对`],
        overview_en: overview.en,
        overview_zh: overview.zh,
        love_en: love.en,
        love_zh: love.zh,
        career_en: career.en,
        career_zh: career.zh,
        tips_en: `To harmonize ${nA.en}-${nB.en} energy: focus on communication, respect each other's natural tendencies, and find activities that bridge both elements.`,
        tips_zh: `调和${nA.zh}-${nB.zh}能量的建议：专注于沟通，尊重彼此的自然倾向，找到连接两种五行的活动。`,
        faq_en: [
          { question: `Are ${nA.en} and ${nB.en} compatible?`, answer: `${nA.en} and ${nB.en} have ${score >= 70 ? "good" : score >= 50 ? "moderate" : "challenging"} compatibility with a score of ${score}/100.` },
          { question: `What is the ${nA.en}-${nB.en} relationship in Five Elements?`, answer: `In the Five Elements cycle, ${nA.en} ${relA.type === "相生" ? "generates" : relA.type === "相克" ? "controls" : "matches"} ${nB.en}.` },
        ],
        faq_zh: [
          { question: `${nA.zh}与${nB.zh}配对吗？`, answer: `${nA.zh}与${nB.zh}的配对评分为${score}/100，属于${score >= 70 ? "良好" : score >= 50 ? "中等" : "挑战性"}关系。` },
          { question: `五行中${nA.zh}与${nB.zh}是什么关系？`, answer: `在五行循环中，${nA.zh}${relA.type === "相生" ? "生" : relA.type === "相克" ? "克" : "比和"}${nB.zh}。` },
        ],
        canonical_path: `/five-elements/${a}/with/${b}`,
      })
    }
  }

  return pairs
})()
