import { Suspense } from "react"
import ShopClient from "./ShopClient"
import { safeJsonLd } from "@/utils/safeJsonLd"

const BASE_URL = "https://www.khanfate.com"

type ShopPageProps = {
  params: Promise<{ locale: string }>
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { locale } = await params
  const isZh = locale === "zh"
  const url = `${BASE_URL}/${locale}/shop`
  const copy = isZh
    ? {
        eyebrow: "KhanFate 生活方式精选",
        title: "与当前状态相匹配的生活方式物件",
        description: "浏览水晶、饰品、香品和护身符等生活方式物件；完成 KhanFate 档案后可获得更贴近个人状态的排序。",
        action: "浏览全部物件",
        profileAction: "建立我的档案",
        categories: ["水晶", "饰品", "香品", "护身符"],
        followUp: "按当前状态探索",
      }
    : {
        eyebrow: "KhanFate lifestyle collection",
        title: "Lifestyle objects matched to your current state",
        description: "Browse crystals, jewelry, incense, and talismans as cultural and lifestyle references. Create an KhanFate dossier to receive a more personal ordering.",
        action: "Browse all objects",
        profileAction: "Create my dossier",
        categories: ["Crystals", "Jewelry", "Incense", "Talismans"],
        followUp: "Explore by current state",
      }

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: copy.title,
    description: copy.description,
    inLanguage: isZh ? "zh-CN" : "en",
    mainEntity: {
      "@type": "ItemList",
      "@id": `${url}#categories`,
      name: isZh ? "生活方式物件分类" : "Lifestyle object categories",
      numberOfItems: copy.categories.length,
      itemListElement: copy.categories.map((name, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionSchema) }}
      />
      <header className="border-b border-white/[0.06] bg-[#020817] px-4 pb-8 pt-28 md:pb-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.3em] text-gold/60">
            {copy.eyebrow}
          </p>
          <h1 className="mx-auto max-w-3xl font-serif text-[clamp(2.2rem,6vw,4.6rem)] font-bold leading-[1.04] text-gold">
            {copy.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
            {copy.description}
          </p>
          <ul className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-2" aria-label={isZh ? "物件分类" : "Object categories"}>
            {copy.categories.map((category) => (
              <li key={category} className="rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1.5 text-xs text-gold/85">
                {category}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#shop-catalog" className="btn-gold inline-flex items-center justify-center px-5 py-3 text-sm">
              {copy.action}
            </a>
            <a href={`/${locale}/reading/new`} className="btn-gold-outline inline-flex items-center justify-center px-5 py-3 text-sm">
              {copy.profileAction}
            </a>
          </div>
        </div>
      </header>
      <Suspense
        fallback={
          <div className="flex min-h-[28rem] items-center justify-center bg-[#020817]" role="status" aria-live="polite">
            <span className="text-sm text-white/45">{isZh ? "正在加载商城" : "Loading the shop"}</span>
          </div>
        }
      >
        <ShopClient seoHero={<h2 className="m-0">{copy.followUp}</h2>} />
      </Suspense>
    </>
  )
}
