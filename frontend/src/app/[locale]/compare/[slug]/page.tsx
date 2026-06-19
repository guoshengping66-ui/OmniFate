import { notFound } from "next/navigation"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

function safeJsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
}

const COMPARISONS: Record<string, {
  title_en: string; title_zh: string;
  meta_description_en: string; meta_description_zh: string;
  content_en: string; content_zh: string;
  icon_a: string; icon_b: string;
}> = {
  "bazi-vs-astrology": {
    title_en: "Bazi vs Astrology: Key Differences Explained",
    title_zh: "八字 vs 星盘：核心区别详解",
    meta_description_en: "Compare Bazi (Four Pillars) and Western Astrology. Learn the differences in calculation methods, philosophy, and what each system reveals.",
    meta_description_zh: "对比八字和西方占星术。了解两者在计算方法、哲学理念方面的差异。",
    content_en: "Bazi (Four Pillars of Destiny) and Western Astrology are both systems that use your birth data to analyze personality and life patterns, but they differ fundamentally in approach.\n\nCalculation Method: Bazi uses the Chinese solar calendar based on your birth year, month, day, and hour. Western Astrology uses the tropical zodiac, mapping planetary positions at your exact birth time.\n\nPhilosophical Foundation: Bazi is rooted in Taoist philosophy, emphasizing the balance of Five Elements and Yin-Yang dynamics. Western Astrology draws from Greek mythology and psychological archetypes.\n\nWhat Each Reveals: Bazi focuses on your destiny pattern, career path, relationships, and wealth potential. Western Astrology emphasizes personality traits, emotional needs, and life themes.\n\nBest Practice: Many practitioners recommend using both systems for a more complete picture.",
    content_zh: "八字（四柱命理）和西方占星术都是利用出生数据来分析性格和人生模式的系统，但它们在方法论上有根本差异。\n\n计算方法：八字使用中国阳历，基于出生的年、月、日、时。西方占星术使用回归黄道，映射出生时刻的行星位置。\n\n哲学基础：八字根植于道家哲学，强调五行和阴阳动态的平衡。西方占星术源自希腊神话和心理学原型。\n\n各自揭示的内容：八字通过五行互动，专注于命运模式、事业道路、人际关系和财富潜力。西方占星术通过行星影响，强调性格特质、情感需求和人生主题。\n\n最佳实践：许多从业者建议同时使用两种系统以获得更全面的了解。",
    icon_a: "☯", icon_b: "⭐",
  },
  "tarot-vs-oracle": {
    title_en: "Tarot vs Oracle Cards: What's the Difference?",
    title_zh: "塔罗牌 vs 神谕卡：有什么区别？",
    meta_description_en: "Understand the key differences between Tarot and Oracle cards. Learn which divination tool suits your needs.",
    meta_description_zh: "了解塔罗牌和神谕卡之间的主要区别。了解哪种占卜工具适合你的需求。",
    content_en: "Tarot and Oracle cards are both powerful divination tools, but they differ in structure, tradition, and usage.\n\nStructure: Tarot has a fixed 78-card structure divided into Major Arcana (22 cards) and Minor Arcana (56 cards in 4 suits). Oracle cards have no fixed structure — each deck is unique.\n\nTradition: Tarot has centuries of established symbolism. Oracle cards are modern creations, often themed around specific topics.\n\nReading Style: Tarot readings follow specific spreads with defined positions. Oracle readings are more flexible and intuitive.\n\nBest For: Tarot excels at detailed life situation analysis. Oracle cards are great for daily guidance and quick insights.",
    content_zh: "塔罗牌和神谕卡都是强大的占卜工具，但它们在结构、传统和用法上有所不同。\n\n结构：塔罗牌有固定的78张牌结构，分为大阿卡纳（22张）和小阿卡纳（56张，分4组）。神谕卡没有固定结构——每副牌都是独特的。\n\n传统：塔罗牌有数百年 established 的象征主义。神谕卡是现代创作，通常围绕特定主题设计。\n\n解读方式：塔罗牌解读遵循特定的牌阵，有定义好的位置。神谕卡解读更灵活、更直觉。\n\n最适合：塔罗牌擅长详细的人生状况分析。神谕卡适合日常指引和快速洞察。",
    icon_a: "🃏", icon_b: "🔮",
  },
  "chinese-vs-western": {
    title_en: "Chinese vs Western Divination: A Complete Comparison",
    title_zh: "中式 vs 西式占卜：全面对比",
    meta_description_en: "Compare Chinese divination systems with Western systems. Understand the strengths of each approach.",
    meta_description_zh: "对比中式占卜系统与西式系统。了解每种方法的优势。",
    content_en: "Chinese and Western divination traditions offer complementary insights into human destiny.\n\nChinese Systems: Bazi, Ziwei Doushu, I Ching, and Face Reading. These systems emphasize elemental balance, cosmic timing, and Taoist philosophy.\n\nWestern Systems: Natal Astrology, Tarot, Numerology, and Palmistry. These systems draw from Greek mythology, Kabbalistic tradition, and psychological archetypes.\n\nKey Differences: Chinese systems tend to be more deterministic, focusing on fixed destiny patterns. Western systems emphasize free will and psychological growth.\n\nComplementary Use: Many modern practitioners combine both traditions for a richer understanding.",
    content_zh: "中式和西式占卜传统为人类命运提供了互补的洞察。\n\n中式系统：八字、紫微斗数、易经和面相。这些系统强调五行平衡、宇宙时序和道家哲学。\n\n西式系统：本命占星、塔罗牌、 numerology 和手相。这些系统源自希腊神话、卡巴拉传统和心理学原型。\n\n主要区别：中式系统倾向于更宿命论，专注于固定的命运模式。西式系统强调自由意志和心理成长。\n\n互补使用：许多现代从业者结合两种传统，以更丰富地理解一个人的人生道路。",
    icon_a: "🏯", icon_b: "🏛️",
  },
  "zodiac-vs-bazi": {
    title_en: "Zodiac vs Bazi: Which System Is More Accurate?",
    title_zh: "星座 vs 八字：哪个系统更准确？",
    meta_description_en: "Compare Western Zodiac signs with Chinese Bazi analysis. Discover which provides deeper insights.",
    meta_description_zh: "对比西方星座和中国八字分析。了解哪个系统提供更深入的洞察。",
    content_en: "The Western Zodiac and Chinese Bazi are both powerful personality and destiny analysis systems, but they differ in scope and depth.\n\nWestern Zodiac: Based on 12 sun signs, focusing on personality traits, emotional patterns, and social behavior. Quick and accessible — determined by birth date alone.\n\nChinese Bazi: Uses Four Pillars with Ten Heavenly Stems and Twelve Earthly Branches. Provides detailed analysis of personality, career, relationships, wealth, and health.\n\nAccuracy: The Zodiac gives a general personality snapshot. Bazi provides a comprehensive life blueprint with specific timing predictions.\n\nBest Approach: Use your Zodiac sign for quick social understanding, and Bazi for deep life planning.",
    content_zh: "西方星座和中国八字都是强大的性格和命运分析系统，但它们在范围和深度上有所不同。\n\n西方星座：基于12个太阳星座，专注于性格特质、情感模式和社交行为。快速易用——仅由出生日期决定。\n\n中国八字：使用四柱配合天干地支。提供性格、事业、人际关系、财富和健康的详细分析。\n\n准确性：星座给出一般性的性格概况。八字提供全面的人生蓝图和具体的时间预测。\n\n最佳方法：使用星座进行快速的社交理解，使用八字进行深入的人生规划。",
    icon_a: "♈", icon_b: "☯",
  },
  "palm-vs-face": {
    title_en: "Palm Reading vs Face Reading: Which Is More Reliable?",
    title_zh: "手相 vs 面相：哪个更可靠？",
    meta_description_en: "Compare the ancient arts of Palmistry and Physiognomy. Learn what each system reveals.",
    meta_description_zh: "对比古老的手相学和面相学。了解每个系统揭示的内容。",
    content_en: "Palm Reading and Face Reading are both branches of Chinese metaphysics that reveal character and destiny through physical features.\n\nPalm Reading: Analyzes the lines, mounts, and hand shape. Reveals personality tendencies, life challenges, and potential. The palm changes slowly over time.\n\nFace Reading: Examines the Five Officials and facial proportions. Reveals innate character, fortune potential, and life trajectory. The face is considered more fixed.\n\nKey Difference: Palm Reading shows how you handle life (process). Face Reading shows what life brings you (potential).\n\nBest Practice: Combine both for a complete picture — face for destiny potential, palm for life journey.",
    content_zh: "手相和面相都是中国玄学的分支，通过身体特征揭示性格和命运。\n\n手相：分析线条、丘和手型。揭示性格倾向、人生挑战和潜力。手相会随时间缓慢变化。\n\n面相：检查五官和面部比例。揭示先天性格、福报潜力和人生轨迹。面相被认为更固定。\n\n主要区别：手相展示你如何应对人生（过程）。面相展示人生带给你什么（潜力）。\n\n最佳实践：结合两者以获得完整的图景——面相看命运潜力，手相看人生旅程。",
    icon_a: "✋", icon_b: "👁️",
  },
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  return Object.keys(COMPARISONS).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params
  const data = COMPARISONS[slug]
  if (!data) return {}

  const isZh = locale === "zh"

  return {
    title: isZh ? data.title_zh : data.title_en,
    description: isZh ? data.meta_description_zh : data.meta_description_en,
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/compare/${slug}`,
      languages: {
        en: `https://www.khanfate.com/en/compare/${slug}`,
        zh: `https://www.khanfate.com/zh/compare/${slug}`,
        "x-default": `https://www.khanfate.com/en/compare/${slug}`,
      },
    },
  }
}

export default async function ComparePage({ params }: PageProps) {
  const { locale, slug } = await params
  const data = COMPARISONS[slug]
  if (!data) notFound()

  const isZh = locale === "zh"

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[{ label: isZh ? "对比" : "Compare" }]}
          currentPath={`/${locale}/compare/${slug}`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": isZh ? data.title_zh : data.title_en,
            "description": isZh ? data.meta_description_zh : data.meta_description_en,
            "url": `https://www.khanfate.com/${locale}/compare/${slug}`,
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-5xl">{data.icon_a}</span>
              <span className="text-white/30 text-2xl font-serif">VS</span>
              <span className="text-5xl">{data.icon_b}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              {isZh ? data.title_zh : data.title_en}
            </h1>
            <p className="text-white/40 text-sm max-w-2xl mx-auto">
              {isZh ? data.meta_description_zh : data.meta_description_en}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card-glass p-8 md:p-10 mb-8">
            <div className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
              {isZh ? data.content_zh : data.content_en}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
