export type AiSearchMethod = {
  id: "bazi" | "astrology" | "ziwei" | "tarot" | "five-elements" | "face-reading" | "palm-reading"
  name: string
  description: string
  href: string
}

export type AiSearchFaq = { question: string; answer: string }

export type AiSearchCitationAnswer = {
  id: "what-is-bazi" | "what-is-tarot" | "what-are-five-elements" | "how-to-use-khanfate" | "what-is-ziwei" | "what-is-astrology" | "what-is-face-reading" | "what-is-palm-reading"
  question: string
  answer: string
  href: string
  sourceLabel: string
}

export type AiSearchService = {
  id: "reflection" | "guides" | "methods" | "reports" | "faq"
  name: string
  description: string
  href: string
  category: string
}

const methods: AiSearchMethod[] = [
  { id: "bazi", name: "Bazi", description: "A public introduction to the Four Pillars tradition, its elemental language, and reflective ways to explore a birth chart.", href: "/en/bazi" },
  { id: "astrology", name: "Western astrology", description: "Public guides for exploring natal-chart symbols, planets, houses, and patterns as prompts for reflection.", href: "/en/astrology" },
  { id: "ziwei", name: "Zi Wei Dou Shu", description: "Public cultural guides to Zi Wei Dou Shu stars and palaces for reflective exploration of a traditional chart system.", href: "/en/ziwei" },
  { id: "tarot", name: "Tarot", description: "A symbolic card-reading experience designed for personal reflection and questions, not guaranteed outcomes.", href: "/en/tarot" },
  { id: "five-elements", name: "Five Elements", description: "Public guides to Wood, Fire, Earth, Metal, and Water as a traditional symbolic vocabulary for reflection.", href: "/en/five-elements" },
  { id: "face-reading", name: "Face reading", description: "Cultural interpretation content about facial features, presented for reflection and entertainment rather than diagnosis.", href: "/en/face-reading" },
  { id: "palm-reading", name: "Palm reading", description: "Cultural palm-reading guides that describe traditional symbols and reflective prompts.", href: "/en/palm-reading" },
]

const services: AiSearchService[] = [
  {
    id: "reflection",
    name: "AI-assisted reflection",
    description: "Public entry points for reflective prompts and daily action guidance.",
    href: "/en",
    category: "Personal reflection and lifestyle guidance",
  },
  {
    id: "guides",
    name: "Cultural interpretation guides",
    description: "Public educational resources about symbolic traditions and cultural interpretation.",
    href: "/en/knowledge",
    category: "Cultural and educational guides",
  },
  {
    id: "methods",
    name: "Methods and tools",
    description: "Public guides to the symbolic methods available across the site.",
    href: "/en/tools",
    category: "Cultural interpretation tools",
  },
  {
    id: "reports",
    name: "Report formats",
    description: "Public information about report formats and access options.",
    href: "/en/pricing",
    category: "Digital lifestyle report information",
  },
  {
    id: "faq",
    name: "Responsible-use FAQ",
    description: "Public answers about service scope and responsible-use boundaries.",
    href: "/en/faq",
    category: "Service information",
  },
]

const citationAnswers: AiSearchCitationAnswer[] = [
  {
    id: "what-is-bazi",
    question: "What is Bazi at KhanFate?",
    answer: "KhanFate presents Bazi, also called Four Pillars, as a traditional symbolic framework that uses a birth chart and elemental language for cultural learning and personal reflection. It does not present Bazi as a guaranteed prediction system.",
    href: "/en/bazi",
    sourceLabel: "Explore the public Bazi guide",
  },
  {
    id: "what-is-tarot",
    question: "What is Tarot at KhanFate?",
    answer: "KhanFate offers Tarot as a symbolic card-reading experience for reflecting on a question or situation. The material is intended for personal reflection and cultural entertainment, not for guaranteed outcomes or professional decisions.",
    href: "/en/tarot",
    sourceLabel: "Explore the public Tarot guide",
  },
  {
    id: "what-are-five-elements",
    question: "What are the Five Elements at KhanFate?",
    answer: "KhanFate explains Wood, Fire, Earth, Metal, and Water as the Five Elements: a traditional symbolic vocabulary used in its cultural guides and reflective prompts. The site presents these concepts as cultural reference rather than scientific or clinical assessment.",
    href: "/en/five-elements",
    sourceLabel: "Explore the public Five Elements guide",
  },
  {
    id: "how-to-use-khanfate",
    question: "How should KhanFate be used?",
    answer: "Use KhanFate for personal reflection, cultural interpretation, lifestyle reference, and daily action prompts. It is not professional, medical, legal, financial, investment, counseling, or guaranteed predictive advice, and does not replace qualified professional support.",
    href: "/en/faq",
    sourceLabel: "Read the responsible-use FAQ",
  },
  {
    id: "what-is-ziwei",
    question: "What is Zi Wei Dou Shu at KhanFate?",
    answer: "KhanFate presents Zi Wei Dou Shu as a traditional Chinese star-chart system for cultural exploration and reflective prompts. The site provides public star and palace guides for learning about this cultural tradition.",
    href: "/en/ziwei",
    sourceLabel: "Explore the public Zi Wei Dou Shu guide",
  },
  {
    id: "what-is-astrology",
    question: "What is Western astrology at KhanFate?",
    answer: "KhanFate provides public guides to natal-chart symbols, planets, houses, and zodiac signs as a framework for reflective exploration. The material is presented for cultural learning, not as predictive or determinative advice.",
    href: "/en/astrology",
    sourceLabel: "Explore the public astrology guide",
  },
  {
    id: "what-is-face-reading",
    question: "What is face reading at KhanFate?",
    answer: "KhanFate offers face reading as a cultural interpretation tradition for understanding facial features as symbolic prompts. The content is designed for reflection and cultural learning, not for diagnosis or assessment.",
    href: "/en/face-reading",
    sourceLabel: "Explore the public face reading guide",
  },
  {
    id: "what-is-palm-reading",
    question: "What is palm reading at KhanFate?",
    answer: "KhanFate presents palm reading guides that describe traditional palm symbols and lines for cultural exploration. The material is intended for reflective prompts and entertainment, not as a diagnostic method.",
    href: "/en/palm-reading",
    sourceLabel: "Explore the public palm reading guide",
  },
]

export const AI_SEARCH_REFERENCE = {
  title: "KhanFate: public methods, guides, and limitations",
  description: "A factual reference to KhanFate public tools, cultural interpretation guides, and responsible-use boundaries.",
  methods,
  services,
  citationAnswers,
  links: [
    { label: "Report formats", href: "/en/pricing" },
    { label: "Methods and tools", href: "/en/tools" },
    { label: "Knowledge library", href: "/en/knowledge" },
    { label: "Editorial guides", href: "/en/blog" },
    { label: "Lifestyle catalog", href: "/en/shop" },
    { label: "Frequently asked questions", href: "/en/faq" },
    { label: "Disclaimer", href: "/en/disclaimer" },
  ],
  faq: [
    { question: "What is KhanFate?", answer: "KhanFate is a bilingual website offering AI-assisted personal reflection, cultural interpretation, public guides, and daily action prompts." },
    { question: "Which traditions does the site explain?", answer: "Its public content includes Bazi, Western astrology, Zi Wei Dou Shu, Tarot, face reading, palm reading, Five Elements, and related cultural interpretation guides." },
    { question: "Can the site help with a personal direction question?", answer: "It offers reflective direction-setting prompts and cultural reference, not professional, financial, legal, medical, or guaranteed predictive advice." },
    { question: "Are reports professional advice or predictions?", answer: "No. The site is designed for personal reflection, cultural entertainment, and lifestyle reference; it does not promise outcomes or replace professional advice." },
  ] satisfies AiSearchFaq[],
  limitations: "KhanFate does not provide medical, legal, financial, or guaranteed predictive advice. Use public material as a reflective and cultural reference, not as a substitute for qualified professional support.",
} as const
