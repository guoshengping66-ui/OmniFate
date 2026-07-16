import { createEditorialArticle, type EditorialArticle } from "./types.ts"

export const BAZI_AND_ELEMENT_ARTICLES: EditorialArticle[] = [
  createEditorialArticle({
    id: "what-is-bazi",
    title_en: "What Is Bazi? A Beginner’s Guide to the Four Pillars of Destiny",
    summary_en: "Learn what Bazi is, how the Four Pillars are organized, and how to approach this Chinese metaphysical tradition as a tool for reflection.",
    category: "four-pillar",
    tags_en: ["Bazi", "Four Pillars", "Chinese metaphysics", "birth chart"],
    tags_zh: ["Bazi", "Four Pillars"],
    read_time: 9,
    cover_emoji: "☷",
    created_at: "2026-07-17",
    relatedIds: ["read-bazi-chart", "five-elements-chinese-astrology", "bazi-vs-western-astrology"],
    faq: [
      { question: "What does Bazi mean?", answer: "Bazi means Eight Characters and refers to the eight Chinese characters used to represent the year, month, day, and hour of birth." },
      { question: "Is Bazi a fixed prediction of the future?", answer: "No. Many people use Bazi as an interpretive tradition for noticing themes and choices, not as a guarantee of events or outcomes." },
    ],
    directAnswer: `Bazi, often called the Four Pillars of Destiny, is a traditional Chinese chart system built from a birth year, month, day, and hour. Each time marker is written as a pair of characters: a Heavenly Stem and an Earthly Branch. Together, the four pairs make eight characters—Ba Zi. People commonly use the chart to explore elemental balance, seasonal context, recurring patterns, and the language a tradition uses to describe temperament and timing.

It helps to start with a modest definition. A Bazi chart is not a personality test with one permanent label, and it is not a promise that a particular event will happen. It is a symbolic map with several moving relationships. A useful reading asks, “What pattern is this framework inviting me to notice?” rather than, “What must happen to me?”`,
    framework: `The four pillars are usually read as a system rather than four separate answers. The year pillar can be discussed in relation to a wider social or family context. The month pillar is important because it places the chart in a season. The day pillar contains the Day Master, the stem used as the reference point for many later relationships. The hour pillar is often read as another layer of expression, projects, or later-life concerns depending on the school.

Every stem and branch is associated with one of the Five Elements: Wood, Fire, Earth, Metal, and Water. Readers consider whether those elements appear, how they relate, and how the season changes their meaning. A chart with repeated Water symbols, for example, is not automatically “a Water person.” The broader arrangement, the Day Master, and the seasonal setting matter. This is why a quick online count can be interesting without being a complete interpretation.

The most practical beginner habit is to learn the vocabulary before attaching a verdict to it. Notice the Day Master, identify the visible elements, and ask how the chart’s language compares with your lived experience. If a description makes you more curious, specific, and grounded, it is being used well. If it makes you feel trapped or certain about another person, pause and return to the facts of your situation.`,
    misconception: `A common misconception is that Bazi can be reduced to a zodiac animal or a single “lucky” element. Those shortcuts can be fun entry points, but they leave out the chart’s seasonal structure and relationships. Another mistake is treating a missing symbol as a personal deficiency. A chart is a pattern of symbols, not a diagnosis or a list of flaws to repair.`,
    practice: `Write down your birth date, time, and location as accurately as you can. If you create a chart, begin by recording three neutral observations: your Day Master, the season of your birth, and the elements that visibly repeat. Then write one real-life question you are currently considering—such as how you work under pressure or what support helps you focus. Use the chart as a set of prompts, and compare its language with your direct experience before making any decision.`,
    boundary: `Bazi belongs to a living cultural and interpretive tradition with different lineages and methods. It should not replace professional support, evidence-based health care, legal advice, financial planning, or honest communication in relationships. A responsible reading makes room for uncertainty, context, and your own agency.`,
  }),
  createEditorialArticle({
    id: "read-bazi-chart",
    title_en: "How to Read Your Bazi Chart: Day Master, Elements, and Balance",
    summary_en: "A practical, non-predictive introduction to reading a Bazi chart through the Day Master, seasonal context, Five Elements, and reflective questions.",
    category: "four-pillar",
    tags_en: ["read Bazi chart", "Day Master", "Five Elements", "Four Pillars"],
    tags_zh: ["Bazi chart", "Day Master"],
    read_time: 10,
    cover_emoji: "☯",
    created_at: "2026-07-17",
    relatedIds: ["what-is-bazi", "missing-element-bazi", "five-elements-chinese-astrology"],
    faq: [
      { question: "What is the Day Master in Bazi?", answer: "The Day Master is the Heavenly Stem of the day pillar and provides a reference point for describing other chart relationships." },
      { question: "Can I read a Bazi chart by counting elements alone?", answer: "Element counts are only a starting point. Seasonal context and the relationships within the whole chart are also important." },
    ],
    directAnswer: `To read a Bazi chart as a beginner, start with orientation rather than prediction. Find the Day Master, notice the season represented by the month branch, and list the elements that are visible in the stems and branches. These steps give you a vocabulary for asking better questions about energy, environment, and habits. They do not produce a final answer by themselves.

The Day Master is the stem in the day pillar. In many Bazi approaches, it represents the reference point from which the rest of the chart is described. A Wood Day Master, for instance, is not simply “creative,” just as a Metal Day Master is not simply “logical.” The value comes from examining how that reference point is supported, challenged, expressed, or balanced within the wider chart.`,
    framework: `A useful reading sequence has four parts. First, identify the Day Master and learn its elemental association. Second, look at the month branch because season affects how an element is traditionally understood. Wood in spring and Wood in autumn are discussed differently because the seasonal environment differs. Third, observe which elements repeat and which relationships are emphasized. Fourth, return to ordinary life: where do you feel overextended, supported, constrained, or energized?

Balance in Bazi is not the same as having the same number of every element. A chart can contain an uneven distribution and still be read as coherent. Traditional readers consider whether an element supports the Day Master, drains it through expression, controls it, or is controlled by it. Those are relational ideas, not scorecards. A strong or weak label only has meaning inside that relationship and seasonal context.

When you see a chart app produce terms such as Resource, Output, Wealth, or Authority, treat them as metaphors for relationships in the system. They are not a salary forecast, a diagnosis, or a command about your career. For example, “Output” may prompt a question about how you communicate or make things, while “Resource” may prompt a question about what helps you study, recover, or gain perspective.`,
    misconception: `The most common error is to make a decision from one isolated label: “My Day Master is weak, so I cannot lead,” or “I have Wealth symbols, so I will become wealthy.” The chart’s terms are not literal guarantees. Another error is to ignore birth-time accuracy. If you do not know your time, acknowledge that uncertainty instead of pretending the hour pillar is exact.`,
    practice: `Choose one area of life that is concrete and current, such as finishing a project, protecting your attention, or speaking up in a relationship. After looking at your chart, write two observations that are factual and two questions that are interpretive. For example: “I work best with a clear schedule” is an observation; “Does this chart’s seasonal language help me describe that need?” is a question. Keep the chart in the question column, not the evidence column.`,
    boundary: `A Bazi chart can support reflection, but it cannot determine your capability, compatibility, health, or financial future. Use it alongside real information, lived feedback, and qualified professional guidance where that is needed.`,
  }),
  createEditorialArticle({
    id: "five-elements-chinese-astrology",
    title_en: "The Five Elements in Chinese Astrology: What They Mean in Your Birth Chart",
    summary_en: "Understand Wood, Fire, Earth, Metal, and Water as a relational language in Chinese astrology rather than a fixed personality label or shopping rule.",
    category: "wuxing",
    tags_en: ["Five Elements", "Chinese astrology", "Wood Fire Earth Metal Water", "Bazi"],
    tags_zh: ["Five Elements", "Chinese astrology"],
    read_time: 9,
    cover_emoji: "✦",
    created_at: "2026-07-17",
    relatedIds: ["missing-element-bazi", "what-is-bazi", "read-bazi-chart"],
    faq: [
      { question: "What are the Five Elements?", answer: "Wood, Fire, Earth, Metal, and Water are categories used in several Chinese philosophical and metaphysical traditions to describe changing relationships." },
      { question: "Do I need to buy items linked to a missing element?", answer: "No. A symbolic association is not a requirement to buy, wear, or avoid any object. Start with reflection and practical needs." },
    ],
    shopCta: { href: "/en/shop", label: "Explore the shop by your own preference", reason: "Objects can support a personal ritual or aesthetic choice, but they are optional and do not change a chart." },
    directAnswer: `The Five Elements—Wood, Fire, Earth, Metal, and Water—are a language for relationships and change in Chinese philosophical traditions. In a birth-chart context, they help readers describe how symbols interact, how seasonal conditions matter, and where a person may notice recurring tensions or sources of support. They are not five boxes that permanently define five kinds of people.

The most useful way to approach the elements is as verbs as much as nouns. Wood can suggest growth or direction; Fire can suggest visibility or activation; Earth can suggest containment or steadiness; Metal can suggest refinement or boundaries; Water can suggest movement or adaptation. These are prompts for observation, not medical, psychological, or financial claims.`,
    framework: `The Five Elements are commonly taught through two relationship cycles. In the generating cycle, Wood supports Fire, Fire supports Earth, Earth supports Metal, Metal supports Water, and Water supports Wood. In the controlling cycle, Wood moderates Earth, Earth moderates Water, Water moderates Fire, Fire moderates Metal, and Metal moderates Wood. These images are not moral rankings. A controlling relationship can be useful when it describes limits, structure, or regulation; a generating relationship can become unhelpful when it describes excess.

In Bazi, elements are interpreted through the whole chart. The season is especially important. A symbol associated with Fire may be discussed differently in summer than in winter because the surrounding conditions change. Readers also consider the Day Master and how an element relates to it. That is why a simple quiz that announces “you need more Water” is incomplete. It may name a visible pattern, but it cannot replace contextual reading.

For everyday reflection, the elements can be translated into ordinary questions. Where do you need more room to grow? Where are you overcommitted or overheated? What boundary would make a project clearer? What kind of rest helps you become more flexible? These questions are useful even if you never adopt an elemental label.`,
    misconception: `A frequent myth is that the element with the smallest count is automatically the one you must “add.” Traditional chart interpretation is more nuanced, and no element count tells you which color, crystal, career, or partner you must choose. Another myth is that one element is inherently better than another. Each element is discussed through context and relationship.`,
    practice: `Choose one week and notice a single practical pattern: energy, attention, workload, communication, or recovery. Use the Five Elements as five alternative lenses rather than five verdicts. For example, ask whether a work problem needs clearer structure, more flexibility, better pacing, a stronger boundary, or more room to develop. Record what changes when you act on the practical answer rather than on a label.`,
    boundary: `Elemental symbolism can be meaningful as a personal or cultural practice, but it does not diagnose imbalance or prescribe treatment. Any object you choose for a ritual, gift, or workspace should be chosen because you value it—not because a chart claims it will guarantee an outcome.`,
  }),
  createEditorialArticle({
    id: "missing-element-bazi",
    title_en: "What Is a Missing Element in Bazi? Common Myths and a Better Way to Read It",
    summary_en: "A missing element in a Bazi chart is not a defect to fix. Learn why chart context, season, and real-life reflection matter more than a simple count.",
    category: "wuxing",
    tags_en: ["missing element Bazi", "Five Elements balance", "Bazi myths", "Chinese astrology"],
    tags_zh: ["missing element", "Bazi myths"],
    read_time: 8,
    cover_emoji: "◌",
    created_at: "2026-07-17",
    relatedIds: ["five-elements-chinese-astrology", "read-bazi-chart", "what-is-bazi"],
    faq: [
      { question: "Does a missing element mean something is wrong with me?", answer: "No. It only describes that a particular element is not visibly represented in one layer of a symbolic chart." },
      { question: "How should I respond to a missing element reading?", answer: "Treat it as a prompt to learn more about the full chart and to reflect on your real circumstances, not as an instruction to make purchases or major decisions." },
    ],
    shopCta: { href: "/en/shop", label: "Browse objects you genuinely enjoy", reason: "A personal object can be meaningful as a ritual reminder, but it is optional and not a remedy for a chart." },
    directAnswer: `A “missing element” usually means that a chart display does not show one of the Five Elements in its most visible stems or branches. It does not mean a person is missing a human quality, has a problem to solve, or must compensate by buying an item, changing a name, or making a major life decision. In Bazi, what is visible is only one part of a broader relationship-based reading.

The phrase is easy to overinterpret because it sounds concrete. But chart symbols are not a checklist of ingredients. An element may be hidden in a branch, appear in a changing cycle, or be less relevant than the relationship between the elements that are present. Most importantly, a chart is not a substitute for observing how you actually live, work, rest, and relate to other people.`,
    framework: `A better approach begins with three questions. First, what does the chart actually show, including season and the Day Master? Second, how does the supposedly absent element relate to the rest of the pattern in the tradition being used? Third, what real-life issue are you trying to understand? Without those questions, “missing element” becomes a sales hook instead of a useful concept.

For example, Water is often associated with movement, adaptability, and storage in elemental language. If an app says Water is absent, that does not prove someone lacks flexibility. It might simply invite a reflective question: where do I need more recovery time or a less rigid plan? The practical answer could be a calendar boundary, a walk, a conversation, or no change at all. The symbol does not decide.

The same principle applies to every element. Wood is not a prescription for plants, Fire is not a command to be visible, Earth is not a reason to stay put, Metal is not a demand for perfection, and Water is not a reason to avoid commitment. The point is to notice relationships without turning a metaphor into an obligation.`,
    misconception: `The central myth is “if it is missing, add it.” That slogan skips context and creates anxiety. A second myth is that accessories can correct a chart. A color, stone, or ritual object can carry personal meaning, but it cannot verify or repair a symbolic pattern. Be cautious whenever a reading turns uncertainty into urgency.`,
    practice: `If a missing-element description catches your attention, write the exact claim in one column and your lived evidence in another. Ask what the claim makes you curious about, then choose one small, observable experiment for a week. If the topic is structure, try a clearer plan. If the topic is rest, protect one quiet hour. Evaluate the experiment by its real effect, not by whether it seems to satisfy a chart.`,
    boundary: `No chart feature can diagnose a health condition, prove compatibility, or predict money. If a symbolic reading creates fear, pressure, or a sense that you must purchase a solution, step back. Use grounded information and appropriate professional support for decisions with real consequences.`,
  }),
]
