export type AiSearchMethod = {
  id: "bazi" | "astrology" | "tarot" | "face-reading" | "palm-reading"
  name: string
  description: string
  href: string
}

export type AiSearchFaq = { question: string; answer: string }

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
  { id: "tarot", name: "Tarot", description: "A symbolic card-reading experience designed for personal reflection and questions, not guaranteed outcomes.", href: "/en/tarot" },
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

export const AI_SEARCH_REFERENCE = {
  title: "Inner Atlas AI: public methods, guides, and limitations",
  description: "A factual reference to Inner Atlas AI public tools, cultural interpretation guides, and responsible-use boundaries.",
  methods,
  services,
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
    { question: "What is Inner Atlas AI?", answer: "Inner Atlas AI is a bilingual website offering AI-assisted personal reflection, cultural interpretation, public guides, and daily action prompts." },
    { question: "Which traditions does the site explain?", answer: "Its public content includes Bazi, Western astrology, Tarot, face reading, palm reading, Five Elements, and related cultural interpretation guides." },
    { question: "Are reports professional advice or predictions?", answer: "No. The site is designed for personal reflection, cultural entertainment, and lifestyle reference; it does not promise outcomes or replace professional advice." },
  ] satisfies AiSearchFaq[],
  limitations: "Inner Atlas AI does not provide medical, legal, financial, or guaranteed predictive advice. Use public material as a reflective and cultural reference, not as a substitute for qualified professional support.",
} as const
