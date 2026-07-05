import type { MetadataRoute } from "next"
import { locales } from "@/i18n/config"
import { ARTICLES } from "@/data/articles"

// Programmatic SEO data
import { ZodiacSigns } from "@/data/programmatic/zodiac/signs"
import { ZodiacCompatibility } from "@/data/programmatic/zodiac/compatibility"
import { TarotCards } from "@/data/programmatic/tarot/cards"
import { PalmLines } from "@/data/programmatic/palm/lines"
import { PalmMounts } from "@/data/programmatic/palm/mounts"
import { FaceFeatures } from "@/data/programmatic/face/features"
import { FaceShapes } from "@/data/programmatic/face/shapes"
import { BaziDayMasters } from "@/data/programmatic/bazi/dayMasters"
import { BaziTenGods } from "@/data/programmatic/bazi/tenGods"
import { FiveElements } from "@/data/programmatic/five-elements/elements"
import { ZiweiStars } from "@/data/programmatic/ziwei/stars"
import { ZiweiPalaces } from "@/data/programmatic/ziwei/palaces"
import { AstrologyPlanets } from "@/data/programmatic/astrology/planets"
import { AstrologyHouses } from "@/data/programmatic/astrology/houses"
import { KnowledgeCategories } from "@/data/knowledge"
import { BaziAnalyses } from "@/data/programmatic/bazi/analysis"
import { FiveElementCompatibilities } from "@/data/programmatic/five-elements/compatibility"

const BASE_URL = "https://www.khanfate.com"

function progEntry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] = "monthly",
): MetadataRoute.Sitemap[0] {
  return {
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}${path.replace(/^\/(en|zh)/, "")}`]),
      ),
    },
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // ── Static pages ──────────────────────────────────────────────────────
  const staticPaths = [
    "/",
    "/about",
    "/pricing",
    "/pricing/founder",
    "/shop",
    "/blog",
    "/reading/new",
    "/bazi",
    "/astrology",
    "/astrology/zodiac-compatibility",
    "/tarot",
    "/face-reading",
    "/five-elements",
    "/ziwei",
    "/palm-reading",
    "/tools",
    "/knowledge",
    "/events",
    "/events/radar",
    "/divination",
    "/trading",
    "/referral",
    "/almanac",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    "/refund",
    "/disclaimer",
  ]

  const staticEntries = staticPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency: (path === "/" || path === "/shop" || path === "/blog"
        ? "weekly"
        : ["/bazi","/astrology","/tarot","/face-reading","/five-elements","/ziwei","/palm-reading","/tools"].includes(path) || path === "/pricing"
          ? "monthly"
          : "yearly") as MetadataRoute.Sitemap[0]["changeFrequency"],
      priority: path === "/" ? 1.0 : ["/bazi","/astrology","/tarot","/face-reading","/five-elements","/ziwei","/palm-reading","/tools"].includes(path) ? 0.9 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}${path === "/" ? "" : path}`]),
        ),
      },
    })),
  )

  // ── Blog articles ─────────────────────────────────────────────────────
  const blogEntries = ARTICLES.flatMap((article) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/blog/${article.id}`,
      lastModified: new Date(article.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}/blog/${article.id}`]),
        ),
      },
    })),
  )

  // ── Programmatic SEO pages ────────────────────────────────────────────

  // Zodiac signs (12 pages)
  const zodiacEntries = ZodiacSigns.flatMap((sign) =>
    locales.map((locale) => progEntry(`/${locale}/zodiac/${sign.id}`, 0.8))
  )

  // Zodiac compatibility (132 pages)
  const zodiacCompatEntries = ZodiacCompatibility.flatMap((pair) =>
    locales.map((locale) => progEntry(`/${locale}/zodiac/${pair.sign_a}/compatibility/${pair.sign_b}`, 0.7))
  )

  // Tarot cards (78 pages)
  const tarotEntries = TarotCards.flatMap((card) =>
    locales.map((locale) => progEntry(`/${locale}/tarot/cards/${card.id}`, 0.8))
  )

  // Palm lines (10 pages)
  const palmLineEntries = PalmLines.flatMap((line) =>
    locales.map((locale) => progEntry(`/${locale}/palm-reading/lines/${line.id}`, 0.7))
  )

  // Palm mounts (7 pages)
  const palmMountEntries = PalmMounts.flatMap((mount) =>
    locales.map((locale) => progEntry(`/${locale}/palm-reading/mounts/${mount.id}`, 0.7))
  )

  // Face features (6 pages)
  const faceFeatureEntries = FaceFeatures.flatMap((feature) =>
    locales.map((locale) => progEntry(`/${locale}/face-reading/features/${feature.id}`, 0.7))
  )

  // Face shapes (6 pages)
  const faceShapeEntries = FaceShapes.flatMap((shape) =>
    locales.map((locale) => progEntry(`/${locale}/face-reading/shapes/${shape.id}`, 0.7))
  )

  // Bazi day masters (10 pages)
  const baziDayMasterEntries = BaziDayMasters.map((master) =>
    locales.map((locale) => progEntry(`/${locale}/bazi/day-master/${master.id}`, 0.8))
  ).flat()

  // Bazi ten gods (10 pages)
  const baziTenGodEntries = BaziTenGods.map((god) =>
    locales.map((locale) => progEntry(`/${locale}/bazi/ten-gods/${god.id}`, 0.8))
  ).flat()

  // Five elements (5 pages)
  const fiveElementEntries = FiveElements.map((element) =>
    locales.map((locale) => progEntry(`/${locale}/five-elements/${element.id}`, 0.8))
  ).flat()

  // Ziwei stars (14 pages)
  const ziweiStarEntries = ZiweiStars.map((star) =>
    locales.map((locale) => progEntry(`/${locale}/ziwei/stars/${star.id}`, 0.8))
  ).flat()

  // Ziwei palaces (12 pages)
  const ziweiPalaceEntries = ZiweiPalaces.map((palace) =>
    locales.map((locale) => progEntry(`/${locale}/ziwei/palaces/${palace.id}`, 0.8))
  ).flat()

  // Astrology planets (10 pages)
  const astrologyPlanetEntries = AstrologyPlanets.map((planet) =>
    locales.map((locale) => progEntry(`/${locale}/astrology/planets/${planet.id}`, 0.8))
  ).flat()

  // Astrology houses (12 pages)
  const astrologyHouseEntries = AstrologyHouses.map((house) =>
    locales.map((locale) => progEntry(`/${locale}/astrology/houses/${house.id}`, 0.8))
  ).flat()

  // Zodiac Topic pages (12 signs x 5 topics = 60 entries)
  const zodiacTopics = ["love", "career", "health", "wealth", "study"]
  const zodiacTopicEntries = ZodiacSigns.flatMap((sign) =>
    zodiacTopics.flatMap((topic) =>
      locales.map((locale) => progEntry(`/${locale}/zodiac/${sign.id}/${topic}`, 0.7))
    )
  )

  // Bazi Analysis types
  const baziAnalysisEntries = BaziAnalyses.flatMap((analysis) =>
    locales.map((locale) => progEntry(`/${locale}/bazi/analysis/${analysis.id}`, 0.8))
  )

  // Five Elements compatibility
  const fiveElementCompatEntries = FiveElementCompatibilities.flatMap((pair) =>
    locales.map((locale) => progEntry(`/${locale}/five-elements/${pair.element_a}/with/${pair.element_b}`, 0.7))
  )

  // Knowledge base pages
  const knowledgeEntries = KnowledgeCategories.flatMap((cat) => {
    const catEntry = locales.map((locale) => progEntry(`/${locale}${cat.canonical_path}`, 0.8))
    const subEntries = cat.subcategories.flatMap((sub) =>
      locales.map((locale) => progEntry(`/${locale}${sub.canonical_path}`, 0.7))
    )
    return [...catEntry, ...subEntries]
  })

  return [
    ...staticEntries,
    ...blogEntries,
    ...zodiacEntries,
    ...zodiacCompatEntries,
    ...tarotEntries,
    ...palmLineEntries,
    ...palmMountEntries,
    ...faceFeatureEntries,
    ...faceShapeEntries,
    ...baziDayMasterEntries,
    ...baziTenGodEntries,
    ...fiveElementEntries,
    ...ziweiStarEntries,
    ...ziweiPalaceEntries,
    ...astrologyPlanetEntries,
    ...astrologyHouseEntries,
    ...zodiacTopicEntries,
    ...baziAnalysisEntries,
    ...fiveElementCompatEntries,
    ...knowledgeEntries,
  ]
}
